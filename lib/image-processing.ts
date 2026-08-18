import { processImageBitmap, type ImageCanvasSurface } from "@/lib/image-processing-core";
import type {
  ImageProcessingRequest,
  ImageProcessingResult,
  SupportedImageMime,
} from "@/lib/image-tools";

function createHtmlCanvas(width: number, height: number): ImageCanvasSurface {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not create an image canvas.");

  return {
    canvas,
    context,
    encode: (mimeType: SupportedImageMime, quality: number) =>
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("This browser could not encode the image."));
          },
          mimeType,
          quality,
        );
      }),
  };
}

export async function processImageOnMainThread(
  file: File,
  request: ImageProcessingRequest,
): Promise<ImageProcessingResult> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const result = await processImageBitmap(bitmap, request, createHtmlCanvas);
    return {
      fileId: request.fileId,
      blob: result.blob,
      mimeType: result.mimeType,
      width: result.width,
      height: result.height,
      bytes: result.blob.size,
      fileName: result.fileName,
      metadataRemoved: true,
      warning: result.warning,
    };
  } finally {
    bitmap.close();
  }
}

export async function browserSupportsImageEncoding(mimeType: SupportedImageMime) {
  try {
    const surface = createHtmlCanvas(1, 1);
    const blob = await surface.encode(mimeType, 0.8);
    return blob.type === mimeType;
  } catch {
    return mimeType === "image/png";
  }
}
