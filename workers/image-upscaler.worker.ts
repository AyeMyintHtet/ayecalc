import { env, pipeline, RawImage } from "@huggingface/transformers";
import {
  UPSCALER_MODEL,
  UPSCALER_REVISION,
  MAX_UPSCALE_BYTES,
  MAX_UPSCALE_PIXELS,
  getUpscaleDimensions,
  getUpscaleTiles,
  extractTileRgb,
  mergeUpscaleTile,
  type UpscaleRequest,
  type UpscaleResponse,
} from "@/lib/image-upscaler";

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;
// Single-threaded WASM works without cross-origin isolation and bounds memory use.
env.backends.onnx.wasm!.numThreads = 1;

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<UpscaleRequest>) => void) | null;
  postMessage: (message: UpscaleResponse, transfer?: Transferable[]) => void;
};
let busy = false;

scope.onmessage = async ({ data }) => {
  if (data.type !== "upscale" || busy) return;
  busy = true;
  let bitmap: ImageBitmap | undefined;
  let dispose: (() => Promise<unknown>) | undefined;
  try {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(data.mimeType) ||
      data.buffer.byteLength > MAX_UPSCALE_BYTES
    )
      throw new Error("Choose a JPEG, PNG, or WebP image up to 15 MB.");
    bitmap = await createImageBitmap(
      new Blob([data.buffer], { type: data.mimeType }),
      { imageOrientation: "from-image" },
    );
    const { width, height } = bitmap;
    const output = getUpscaleDimensions(
      width,
      height,
      Math.min(data.maxPixels, MAX_UPSCALE_PIXELS),
    );
    const sourceCanvas = new OffscreenCanvas(width, height);
    const sourceContext = sourceCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    const outputCanvas = new OffscreenCanvas(output.width, output.height);
    const outputContext = outputCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!sourceContext || !outputContext)
      throw new Error("This browser could not create an image canvas.");
    sourceContext.drawImage(bitmap, 0, 0);
    const source = sourceContext.getImageData(0, 0, width, height).data;
    outputContext.imageSmoothingEnabled = true;
    outputContext.imageSmoothingQuality = "high";
    outputContext.drawImage(bitmap, 0, 0, output.width, output.height);
    bitmap.close();
    bitmap = undefined;
    const pixels = outputContext.getImageData(
      0,
      0,
      output.width,
      output.height,
    );
    scope.postMessage({ type: "status", stage: "loading-model" });
    const upscaler = await pipeline("image-to-image", UPSCALER_MODEL, {
      revision: UPSCALER_REVISION,
      device: "wasm",
      dtype: "fp32",
      progress_callback: (info) => {
        if (info.status === "progress_total")
          scope.postMessage({
            type: "progress",
            progress: Math.max(0, Math.min(100, info.progress)),
          });
      },
    });
    dispose = () => upscaler.dispose();
    scope.postMessage({ type: "status", stage: "processing" });
    const tiles = getUpscaleTiles(width, height);
    for (let index = 0; index < tiles.length; index++) {
      const tile = tiles[index];
      const input = new RawImage(
        extractTileRgb(source, width, tile),
        tile.inputWidth,
        tile.inputHeight,
        3,
      );
      const result = await upscaler(input);
      mergeUpscaleTile(pixels.data, output.width, tile, result);
      scope.postMessage({
        type: "progress",
        progress: ((index + 1) / tiles.length) * 100,
      });
    }
    scope.postMessage({ type: "status", stage: "encoding" });
    outputContext.putImageData(pixels, 0, 0);
    const blob = await outputCanvas.convertToBlob({ type: "image/png" });
    const buffer = await blob.arrayBuffer();
    scope.postMessage({ type: "complete", buffer, ...output }, [buffer]);
  } catch (error) {
    scope.postMessage({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "This browser could not enhance the image. Try a smaller image.",
    });
  } finally {
    bitmap?.close();
    await dispose?.().catch(() => undefined);
    busy = false;
  }
};
