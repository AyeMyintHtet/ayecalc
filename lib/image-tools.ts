import type { ImageWatermarkOptions } from "@/lib/image-watermark";

export const MAX_IMAGE_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 50_000_000;
export const MAX_BACKGROUND_IMAGE_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_BACKGROUND_IMAGE_PIXELS = 25_000_000;
export const MAX_BATCH_FILES = 10;
export const MAX_BATCH_BYTES = 200 * 1024 * 1024;

const LOW_MEMORY_IMAGE_PIXELS = 25_000_000;
const VERY_LOW_MEMORY_IMAGE_PIXELS = 12_000_000;

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type SupportedImageMime = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];
export type ImageOutputFormat = "original" | SupportedImageMime;

export type ImageOperation =
  | "resize"
  | "compress"
  | "crop"
  | "convert"
  | "watermark";
export type ImageFileStatus =
  | "ready"
  | "queued"
  | "processing"
  | "complete"
  | "error";

export type ImageOutputOptions = {
  format: ImageOutputFormat;
  quality: number;
  backgroundColor: string;
  targetBytes?: number;
};

export type CropTransform = {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  rotation: 0 | 90 | 180 | 270;
  flipX: boolean;
  flipY: boolean;
};

export type ImageProcessingRequest = {
  jobId: string;
  fileId: string;
  operation: ImageOperation;
  fileName: string;
  inputMimeType: SupportedImageMime;
  inputBytes: number;
  sourceWidth: number;
  sourceHeight: number;
  maxPixels: number;
  output: ImageOutputOptions;
  resize?: { width: number; height: number };
  crop?: CropTransform;
  watermark?: ImageWatermarkOptions;
};

export type ImageProcessingResult = {
  fileId: string;
  blob: Blob;
  mimeType: SupportedImageMime;
  width: number;
  height: number;
  bytes: number;
  fileName: string;
  metadataRemoved: true;
  warning?: string;
};

export type ImageFileRecord = {
  id: string;
  file: File;
  mimeType: SupportedImageMime;
  width: number;
  height: number;
  previewUrl: string;
  status: ImageFileStatus;
  result?: ImageProcessingResult & { previewUrl: string };
  error?: string;
};

export type ImageWorkerRequest =
  | {
      type: "process";
      request: ImageProcessingRequest;
      buffer: ArrayBuffer;
    }
  | { type: "cancel"; jobId: string };

export type ImageWorkerResultPayload = Omit<ImageProcessingResult, "blob"> & {
  buffer: ArrayBuffer;
};

export type ImageWorkerResponse =
  | { type: "started"; jobId: string; fileId: string }
  | {
      type: "progress";
      jobId: string;
      fileId: string;
      progress: number;
      stage: "decoding" | "drawing" | "encoding";
    }
  | {
      type: "success";
      jobId: string;
      result: ImageWorkerResultPayload;
    }
  | {
      type: "cancelled";
      jobId: string;
      fileId: string;
    }
  | {
      type: "failure";
      jobId: string;
      fileId: string;
      code: "unsupported" | "decode" | "encode" | "processing";
      message: string;
    };

export function isSupportedImageMime(value: string): value is SupportedImageMime {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(value as SupportedImageMime);
}

export function resolveOutputMime(
  input: SupportedImageMime,
  output: ImageOutputFormat,
): SupportedImageMime {
  return output === "original" ? input : output;
}

export function formatImageBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  const megabytes = bytes / 1024 / 1024;
  return `${Number.isInteger(megabytes) ? megabytes.toFixed(0) : megabytes.toFixed(1)} MB`;
}

export function formatImageMegapixels(pixels: number) {
  const megapixels = pixels / 1_000_000;
  return `${Number.isInteger(megapixels) ? megapixels : megapixels.toFixed(1)} megapixels`;
}

export function getImagePixelLimitForDevice(
  maximumPixels: number,
  deviceMemory?: number,
  useConservativeFallback = false,
) {
  if (!Number.isFinite(deviceMemory) || !deviceMemory) {
    return useConservativeFallback
      ? Math.min(maximumPixels, LOW_MEMORY_IMAGE_PIXELS)
      : maximumPixels;
  }
  if (deviceMemory > 4) {
    return maximumPixels;
  }
  if (deviceMemory <= 2) {
    return Math.min(maximumPixels, VERY_LOW_MEMORY_IMAGE_PIXELS);
  }
  return Math.min(maximumPixels, LOW_MEMORY_IMAGE_PIXELS);
}

export function getRuntimeImagePixelLimit(maximumPixels = MAX_IMAGE_PIXELS) {
  if (typeof navigator === "undefined") return maximumPixels;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const compactTouchDevice =
    navigator.maxTouchPoints > 0 &&
    typeof matchMedia === "function" &&
    matchMedia("(max-width: 1180px)").matches;
  const limitedCpu =
    Number.isFinite(navigator.hardwareConcurrency) &&
    navigator.hardwareConcurrency > 0 &&
    navigator.hardwareConcurrency <= 4;
  return getImagePixelLimitForDevice(
    maximumPixels,
    deviceMemory,
    compactTouchDevice || limitedCpu,
  );
}

export function safeImageBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "").trim() || "image";
  return (
    withoutExtension
      .normalize("NFKD")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "image"
  );
}

export function extensionForMime(mimeType: SupportedImageMime) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return "png";
}

export function createImageOutputName(
  fileName: string,
  operation: ImageOperation,
  mimeType: SupportedImageMime,
) {
  const suffix: Record<ImageOperation, string> = {
    resize: "resized",
    compress: "compressed",
    crop: "cropped",
    convert: "converted",
    watermark: "watermarked",
  };
  return `${safeImageBaseName(fileName)}-${suffix[operation]}.${extensionForMime(mimeType)}`;
}

export function clampInteger(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

function includesAscii(bytes: Uint8Array, value: string) {
  const needle = Array.from(value, (character) => character.charCodeAt(0));
  for (let index = 0; index <= bytes.length - needle.length; index += 1) {
    if (needle.every((byte, offset) => bytes[index + offset] === byte)) return true;
  }
  return false;
}

export async function isAnimatedImage(file: File) {
  if (file.type === "image/jpeg") return false;
  const sample = new Uint8Array(await file.slice(0, Math.min(file.size, 256 * 1024)).arrayBuffer());
  if (file.type === "image/webp") {
    return includesAscii(sample, "ANIM") || includesAscii(sample, "ANMF");
  }
  return includesAscii(sample, "acTL");
}

export function validateImageFileBasics(
  file: Pick<File, "size" | "type">,
  maximumBytes = MAX_IMAGE_FILE_BYTES,
) {
  if (!isSupportedImageMime(file.type)) {
    return "Use a JPEG, PNG, or WebP image.";
  }
  if (file.size === 0) return "The image is empty.";
  if (file.size > maximumBytes) {
    return `The image is larger than ${formatImageBytes(maximumBytes)}.`;
  }
  return "";
}

export function getRotatedDimensions(
  width: number,
  height: number,
  rotation: CropTransform["rotation"],
) {
  return rotation === 90 || rotation === 270
    ? { width: height, height: width }
    : { width, height };
}

export function createCenteredCrop(
  width: number,
  height: number,
  ratio: number | null,
): Pick<CropTransform, "x" | "y" | "width" | "height"> {
  if (!ratio) return { x: 0, y: 0, width, height };

  let cropWidth = width;
  let cropHeight = cropWidth / ratio;
  if (cropHeight > height) {
    cropHeight = height;
    cropWidth = cropHeight * ratio;
  }

  return {
    x: Math.round((width - cropWidth) / 2),
    y: Math.round((height - cropHeight) / 2),
    width: Math.max(1, Math.round(cropWidth)),
    height: Math.max(1, Math.round(cropHeight)),
  };
}
