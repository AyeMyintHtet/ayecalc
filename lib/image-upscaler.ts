export const UPSCALER_MODEL = "Xenova/swin2SR-lightweight-x2-64";
export const UPSCALER_REVISION = "92a21aca5713f20faf9a87590cdfbdce2e34112c";
export const UPSCALER_MODEL_BYTES = 8_078_888;
export const UPSCALE_FACTOR = 2;
export const MAX_UPSCALE_BYTES = 15 * 1024 * 1024;
export const MAX_UPSCALE_PIXELS = 1_000_000;
export const UPSCALE_CORE_SIZE = 96;
export const UPSCALE_OVERLAP = 16;

export function getUpscaleDimensions(
  width: number,
  height: number,
  maxPixels = MAX_UPSCALE_PIXELS,
) {
  if (
    !Number.isInteger(maxPixels) ||
    maxPixels < 1 ||
    maxPixels > MAX_UPSCALE_PIXELS
  )
    throw new RangeError("The image pixel limit is invalid.");
  if (
    ![width, height].every(
      (value) => Number.isInteger(value) && value >= 8 && value <= 4096,
    )
  ) {
    throw new RangeError(
      "Use an image between 8 and 4,096 pixels on each side.",
    );
  }
  if (width * height > maxPixels)
    throw new RangeError(
      `Use an image up to ${(maxPixels / 1_000_000).toFixed(1)} megapixels. Resize it first if needed.`,
    );
  return { width: width * UPSCALE_FACTOR, height: height * UPSCALE_FACTOR };
}

export type UpscaleTile = {
  x: number;
  y: number;
  width: number;
  height: number;
  inputX: number;
  inputY: number;
  inputWidth: number;
  inputHeight: number;
  cropX: number;
  cropY: number;
};

/** Overlapping context is discarded at the edges of each tile before stitching. */
export function getUpscaleTiles(width: number, height: number): UpscaleTile[] {
  getUpscaleDimensions(width, height);
  const tiles: UpscaleTile[] = [];
  for (let y = 0; y < height; y += UPSCALE_CORE_SIZE)
    for (let x = 0; x < width; x += UPSCALE_CORE_SIZE) {
      const w = Math.min(UPSCALE_CORE_SIZE, width - x),
        h = Math.min(UPSCALE_CORE_SIZE, height - y);
      const inputX = Math.max(0, x - UPSCALE_OVERLAP),
        inputY = Math.max(0, y - UPSCALE_OVERLAP);
      const inputWidth = Math.min(width, x + w + UPSCALE_OVERLAP) - inputX;
      const inputHeight = Math.min(height, y + h + UPSCALE_OVERLAP) - inputY;
      tiles.push({
        x,
        y,
        width: w,
        height: h,
        inputX,
        inputY,
        inputWidth,
        inputHeight,
        cropX: (x - inputX) * 2,
        cropY: (y - inputY) * 2,
      });
    }
  return tiles;
}

export function extractTileRgb(
  source: Uint8ClampedArray,
  width: number,
  tile: UpscaleTile,
) {
  const rgb = new Uint8Array(tile.inputWidth * tile.inputHeight * 3);
  for (let y = 0; y < tile.inputHeight; y++)
    for (let x = 0; x < tile.inputWidth; x++) {
      const from = ((y + tile.inputY) * width + x + tile.inputX) * 4;
      const to = (y * tile.inputWidth + x) * 3;
      rgb[to] = source[from];
      rgb[to + 1] = source[from + 1];
      rgb[to + 2] = source[from + 2];
    }
  return rgb;
}

export function mergeUpscaleTile(
  target: Uint8ClampedArray,
  targetWidth: number,
  tile: UpscaleTile,
  result: {
    data: Uint8Array | Uint8ClampedArray;
    width: number;
    height: number;
    channels: number;
  },
) {
  if (
    result.width < tile.inputWidth * 2 ||
    result.height < tile.inputHeight * 2 ||
    result.channels < 3
  )
    throw new Error("The model returned an unexpected image size.");
  for (let y = 0; y < tile.height * 2; y++)
    for (let x = 0; x < tile.width * 2; x++) {
      const from =
        ((y + tile.cropY) * result.width + x + tile.cropX) * result.channels;
      const to = ((tile.y * 2 + y) * targetWidth + tile.x * 2 + x) * 4;
      target[to] = result.data[from];
      target[to + 1] = result.data[from + 1];
      target[to + 2] = result.data[from + 2];
      // Alpha comes from the original image, resampled separately from the RGB model.
    }
}

export function upscaleFileName(name: string) {
  const base =
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "image";
  return `${base}-2x-enhanced.png`;
}

export type UpscaleRequest = {
  type: "upscale";
  buffer: ArrayBuffer;
  mimeType: string;
  maxPixels: number;
};
export type UpscaleResponse =
  | { type: "status"; stage: "loading-model" | "processing" | "encoding" }
  | { type: "progress"; progress: number }
  | { type: "complete"; buffer: ArrayBuffer; width: number; height: number }
  | { type: "error"; message: string };
