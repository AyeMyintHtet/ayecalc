import {
  clampInteger,
  createImageOutputName,
  getRotatedDimensions,
  MAX_IMAGE_PIXELS,
  resolveOutputMime,
  type ImageProcessingRequest,
  type SupportedImageMime,
} from "@/lib/image-tools";

type RenderingContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export type ImageCanvasSurface = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  context: RenderingContext;
  encode: (mimeType: SupportedImageMime, quality: number) => Promise<Blob>;
};

export type ImageCanvasFactory = (
  width: number,
  height: number,
) => ImageCanvasSurface;

export type ImageCoreResult = {
  blob: Blob;
  mimeType: SupportedImageMime;
  width: number;
  height: number;
  fileName: string;
  warning?: string;
};

function prepareContext(
  surface: ImageCanvasSurface,
  mimeType: SupportedImageMime,
  backgroundColor: string,
) {
  const { context, canvas } = surface;
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (mimeType === "image/jpeg") {
    context.fillStyle = backgroundColor || "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
}

function drawTransformedSource(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  request: ImageProcessingRequest,
  createSurface: ImageCanvasFactory,
) {
  const transform = request.crop!;
  const dimensions = getRotatedDimensions(
    sourceWidth,
    sourceHeight,
    transform.rotation,
  );
  const surface = createSurface(dimensions.width, dimensions.height);
  const { context } = surface;
  context.save();
  context.translate(dimensions.width / 2, dimensions.height / 2);
  context.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
  context.rotate((transform.rotation * Math.PI) / 180);
  context.drawImage(source, -sourceWidth / 2, -sourceHeight / 2);
  context.restore();
  return surface;
}

async function encodeSurface(
  surface: ImageCanvasSurface,
  mimeType: SupportedImageMime,
  requestedQuality: number,
  targetBytes?: number,
) {
  const quality = Math.max(0.1, Math.min(0.95, requestedQuality));
  let attempts = 1;
  let candidate = await surface.encode(mimeType, quality);

  if (candidate.type !== mimeType) {
    throw new Error(`This browser could not encode ${mimeType.replace("image/", "").toUpperCase()}.`);
  }

  if (!targetBytes || mimeType === "image/png" || candidate.size <= targetBytes) {
    return { blob: candidate, warning: undefined };
  }

  let low = 0.1;
  let high = quality;
  let bestQuality = low;
  let best = await surface.encode(mimeType, low);
  attempts += 1;

  while (attempts < 7) {
    const nextQuality = (low + high) / 2;
    const next = await surface.encode(mimeType, nextQuality);
    attempts += 1;

    if (next.size <= targetBytes) {
      best = next;
      bestQuality = nextQuality;
      low = nextQuality;
    } else {
      high = nextQuality;
    }

    if (Math.abs(next.size - targetBytes) / targetBytes <= 0.05) {
      best = next;
      break;
    }
  }

  candidate = best;
  const warning =
    candidate.size > targetBytes * 1.05
      ? "The requested file size could not be reached at the minimum quality."
      : bestQuality <= 0.12
        ? "The target required very low image quality. Inspect the result before using it."
        : undefined;

  return { blob: candidate, warning };
}

export async function processImageBitmap(
  bitmap: ImageBitmap,
  request: ImageProcessingRequest,
  createSurface: ImageCanvasFactory,
): Promise<ImageCoreResult> {
  const mimeType = resolveOutputMime(request.inputMimeType, request.output.format);
  let outputWidth = request.sourceWidth;
  let outputHeight = request.sourceHeight;
  let surface: ImageCanvasSurface;

  if (request.operation === "crop") {
    if (!request.crop) throw new Error("Crop settings are missing.");
    const rotated = getRotatedDimensions(
      request.sourceWidth,
      request.sourceHeight,
      request.crop.rotation,
    );
    const transformed = drawTransformedSource(
      bitmap,
      request.sourceWidth,
      request.sourceHeight,
      request,
      createSurface,
    );
    const cropX = clampInteger(request.crop.x, 0, Math.max(0, rotated.width - 1));
    const cropY = clampInteger(request.crop.y, 0, Math.max(0, rotated.height - 1));
    outputWidth = clampInteger(request.crop.width, 1, rotated.width - cropX);
    outputHeight = clampInteger(request.crop.height, 1, rotated.height - cropY);
    if (outputWidth * outputHeight > MAX_IMAGE_PIXELS) {
      throw new Error("The generated image would exceed the 25 megapixel limit.");
    }
    surface = createSurface(outputWidth, outputHeight);
    prepareContext(surface, mimeType, request.output.backgroundColor);
    surface.context.drawImage(
      transformed.canvas,
      cropX,
      cropY,
      outputWidth,
      outputHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    );
  } else {
    if (request.operation === "resize" && request.resize) {
      outputWidth = clampInteger(request.resize.width, 1, 32767);
      outputHeight = clampInteger(request.resize.height, 1, 32767);
    }
    if (outputWidth * outputHeight > MAX_IMAGE_PIXELS) {
      throw new Error("The generated image would exceed the 25 megapixel limit.");
    }
    surface = createSurface(outputWidth, outputHeight);
    prepareContext(surface, mimeType, request.output.backgroundColor);
    surface.context.drawImage(bitmap, 0, 0, outputWidth, outputHeight);
  }

  const encoded = await encodeSurface(
    surface,
    mimeType,
    request.output.quality,
    request.output.targetBytes,
  );
  const largerWarning =
    encoded.blob.size > request.inputBytes && !encoded.warning
      ? "The generated file is larger than the original. Try another format or quality."
      : undefined;

  return {
    blob: encoded.blob,
    mimeType,
    width: outputWidth,
    height: outputHeight,
    fileName: createImageOutputName(request.fileName, request.operation, mimeType),
    warning: encoded.warning ?? largerWarning,
  };
}
