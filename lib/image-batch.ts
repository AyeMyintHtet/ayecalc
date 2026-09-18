import {
  resolveOutputMime,
  type ImageFileRecord,
  type ImageOutputFormat,
  type ImageProcessingRequest,
} from "./image-tools.ts";
import type { ImageWatermarkOptions } from "./image-watermark.ts";

export type BatchMode = "resize" | "compress" | "convert" | "watermark";
export type ResizeMode = "width" | "height" | "percentage" | "exact";
export type BatchSettings = {
  outputFormat: ImageOutputFormat;
  quality: number;
  backgroundColor: string;
  targetEnabled: boolean;
  targetKilobytes: number;
  resizeMode: ResizeMode;
  resizeWidth: number;
  resizeHeight: number;
  resizePercentage: number;
  aspectLocked: boolean;
  preventUpscale: boolean;
};

export const outputFormats: Array<{ value: ImageOutputFormat; label: string }> =
  [
    { value: "original", label: "Keep original format" },
    { value: "image/jpeg", label: "JPEG" },
    { value: "image/png", label: "PNG" },
    { value: "image/webp", label: "WebP" },
  ];

export function isBatchSettings(value: unknown): value is BatchSettings {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const bounded = (key: string, min: number, max: number) =>
    typeof v[key] === "number" &&
    Number.isFinite(v[key]) &&
    v[key] >= min &&
    v[key] <= max;
  return (
    outputFormats.some((format) => format.value === v.outputFormat) &&
    ["width", "height", "percentage", "exact"].includes(String(v.resizeMode)) &&
    bounded("quality", 10, 95) &&
    bounded("resizeWidth", 1, 32767) &&
    bounded("resizeHeight", 1, 32767) &&
    bounded("resizePercentage", 1, 500) &&
    bounded("targetKilobytes", 1, 102400) &&
    typeof v.backgroundColor === "string" &&
    /^#[\da-f]{6}$/i.test(v.backgroundColor) &&
    ["targetEnabled", "aspectLocked", "preventUpscale"].every(
      (key) => typeof v[key] === "boolean",
    )
  );
}

export function getBatchResizeDimensions(
  item: { width: number; height: number },
  settings: BatchSettings,
) {
  const {
    resizeMode,
    resizeWidth,
    resizeHeight,
    resizePercentage,
    aspectLocked,
    preventUpscale,
  } = settings;
  let width = item.width,
    height = item.height;
  if (resizeMode === "percentage") {
    width *= resizePercentage / 100;
    height *= resizePercentage / 100;
  } else if (resizeMode === "height") {
    height = resizeHeight;
    width = (item.width / item.height) * height;
  } else {
    width = resizeWidth;
    height =
      resizeMode === "exact" && !aspectLocked
        ? resizeHeight
        : (item.height / item.width) * width;
  }
  if (![width, height].every((value) => Number.isFinite(value) && value > 0))
    throw new RangeError("Enter positive, finite output dimensions.");
  const scale = preventUpscale
    ? Math.min(1, item.width / width, item.height / height)
    : 1;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function createBatchRequest(
  item: ImageFileRecord,
  jobId: string,
  mode: BatchMode,
  settings: BatchSettings,
  maxPixels: number,
  watermark?: ImageWatermarkOptions,
): ImageProcessingRequest {
  const mime = resolveOutputMime(item.mimeType, settings.outputFormat);
  return {
    jobId,
    fileId: item.id,
    operation: mode,
    fileName: item.file.name,
    inputMimeType: item.mimeType,
    inputBytes: item.file.size,
    sourceWidth: item.width,
    sourceHeight: item.height,
    maxPixels,
    output: {
      format: settings.outputFormat,
      quality: settings.quality / 100,
      backgroundColor: settings.backgroundColor,
      targetBytes:
        mode === "compress" && settings.targetEnabled && mime !== "image/png"
          ? Math.max(1, settings.targetKilobytes) * 1024
          : undefined,
    },
    resize:
      mode === "resize" ? getBatchResizeDimensions(item, settings) : undefined,
    watermark: mode === "watermark" ? watermark : undefined,
  };
}
