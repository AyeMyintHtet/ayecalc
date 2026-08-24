export const MAX_HEIC_FILES = 10;
export const MAX_HEIC_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_HEIC_BATCH_BYTES = 200 * 1024 * 1024;

export type HeicOutputMime = "image/jpeg" | "image/png" | "image/webp";
export type HeicResizeMode =
  | "original"
  | "percentage"
  | "max-width"
  | "max-long-edge";

export interface HeicOutputDimensions {
  width: number;
  height: number;
  safetyLimited: boolean;
}

export interface HeicWorkerRequest {
  type: "convert";
  jobId: string;
  fileId: string;
  fileName: string;
  fileType: string;
  buffer: ArrayBuffer;
  outputType: HeicOutputMime;
  quality: number;
  resizeMode: HeicResizeMode;
  resizeValue: number;
  preventUpscale: boolean;
  jpegBackground: string;
  suffix: string;
  maxPixels: number;
}

export type HeicWorkerResponse =
  | {
      type: "progress";
      jobId: string;
      fileId: string;
      stage: "decoding" | "resizing" | "encoding";
    }
  | {
      type: "complete";
      jobId: string;
      fileId: string;
      outputName: string;
      outputType: HeicOutputMime;
      buffer: ArrayBuffer;
      sourceWidth: number;
      sourceHeight: number;
      outputWidth: number;
      outputHeight: number;
      safetyLimited: boolean;
    }
  | {
      type: "error";
      jobId: string;
      fileId: string;
      message: string;
    };

const HEIF_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "heif",
  "mif1",
  "msf1",
]);

function readFourCharacters(bytes: Uint8Array, offset: number): string {
  if (offset < 0 || offset + 4 > bytes.length) {
    return "";
  }

  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  ).toLowerCase();
}

export function hasHeifSignature(bytes: Uint8Array): boolean {
  if (bytes.length < 12 || readFourCharacters(bytes, 4) !== "ftyp") {
    return false;
  }

  if (HEIF_BRANDS.has(readFourCharacters(bytes, 8))) {
    return true;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const declaredSize = view.getUint32(0, false);
  const end = Math.min(
    bytes.length,
    declaredSize >= 12 ? declaredSize : bytes.length,
    512,
  );

  for (let offset = 16; offset + 4 <= end; offset += 4) {
    if (HEIF_BRANDS.has(readFourCharacters(bytes, offset))) {
      return true;
    }
  }

  return false;
}

export function probeHeifDimensions(
  bytes: Uint8Array,
): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let largest: { width: number; height: number } | null = null;

  for (let offset = 4; offset + 16 <= bytes.length; offset += 1) {
    if (readFourCharacters(bytes, offset) !== "ispe") {
      continue;
    }

    const boxStart = offset - 4;
    const boxSize = view.getUint32(boxStart, false);
    if (boxSize < 20 || offset + 16 > bytes.length) {
      continue;
    }

    const width = view.getUint32(offset + 8, false);
    const height = view.getUint32(offset + 12, false);
    const pixels = width * height;
    if (
      width === 0 ||
      height === 0 ||
      !Number.isSafeInteger(pixels) ||
      pixels > 1_000_000_000
    ) {
      continue;
    }

    if (!largest || pixels > largest.width * largest.height) {
      largest = { width, height };
    }
  }

  return largest;
}

function positiveFinite(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function calculateHeicOutputDimensions(
  sourceWidth: number,
  sourceHeight: number,
  resizeMode: HeicResizeMode,
  resizeValue: number,
  preventUpscale: boolean,
  maxPixels: number,
): HeicOutputDimensions {
  const width = Math.max(1, Math.floor(positiveFinite(sourceWidth, 1)));
  const height = Math.max(1, Math.floor(positiveFinite(sourceHeight, 1)));
  const value = positiveFinite(resizeValue, 100);
  let scale = 1;

  if (resizeMode === "percentage") {
    scale = Math.min(5, Math.max(0.01, value / 100));
  } else if (resizeMode === "max-width") {
    scale = value / width;
  } else if (resizeMode === "max-long-edge") {
    scale = value / Math.max(width, height);
  }

  if (preventUpscale) {
    scale = Math.min(1, scale);
  }

  let outputWidth = Math.max(1, Math.round(width * scale));
  let outputHeight = Math.max(1, Math.round(height * scale));
  const safeMaxPixels = Math.max(1, Math.floor(positiveFinite(maxPixels, 1)));
  let safetyLimited = false;

  if (outputWidth * outputHeight > safeMaxPixels) {
    const safeScale = Math.sqrt(safeMaxPixels / (outputWidth * outputHeight));
    outputWidth = Math.max(1, Math.floor(outputWidth * safeScale));
    outputHeight = Math.max(1, Math.floor(outputHeight * safeScale));
    safetyLimited = true;
  }

  return { width: outputWidth, height: outputHeight, safetyLimited };
}

function safeFileBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  return (
    withoutExtension
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "converted-image"
  );
}

export function sanitizeHeicSuffix(suffix: string): string {
  const cleaned = suffix
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return cleaned ? `-${cleaned}` : "";
}

export function createHeicOutputName(
  fileName: string,
  outputType: HeicOutputMime,
  suffix: string,
): string {
  const extension =
    outputType === "image/png"
      ? "png"
      : outputType === "image/webp"
        ? "webp"
        : "jpg";

  return `${safeFileBaseName(fileName)}${sanitizeHeicSuffix(suffix)}.${extension}`;
}
