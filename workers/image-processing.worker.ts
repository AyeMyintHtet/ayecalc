import { processImageBitmap, type ImageCanvasSurface } from "@/lib/image-processing-core";
import type {
  ImageWorkerRequest,
  ImageWorkerResponse,
  SupportedImageMime,
} from "@/lib/image-tools";

const cancelledJobs = new Set<string>();

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<ImageWorkerRequest>) => void) | null;
  postMessage: (message: ImageWorkerResponse, transfer?: Transferable[]) => void;
};

function respond(message: ImageWorkerResponse, transfer?: Transferable[]) {
  workerScope.postMessage(message, transfer);
}

function createOffscreenSurface(width: number, height: number): ImageCanvasSurface {
  if (typeof OffscreenCanvas === "undefined") {
    throw new Error("Offscreen canvas is unavailable.");
  }
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The worker could not create an image canvas.");
  return {
    canvas,
    context,
    encode: (mimeType: SupportedImageMime, quality: number) =>
      canvas.convertToBlob({ type: mimeType, quality }),
  };
}

workerScope.onmessage = async (event) => {
  const message = event.data;
  if (message.type === "cancel") {
    cancelledJobs.add(message.jobId);
    return;
  }

  const { request, buffer } = message;
  if (typeof OffscreenCanvas === "undefined") {
    respond({
      type: "failure",
      jobId: request.jobId,
      fileId: request.fileId,
      code: "unsupported",
      message: "This browser cannot process images in a worker.",
    });
    return;
  }

  respond({ type: "started", jobId: request.jobId, fileId: request.fileId });
  let bitmap: ImageBitmap | null = null;

  try {
    respond({
      type: "progress",
      jobId: request.jobId,
      fileId: request.fileId,
      progress: 15,
      stage: "decoding",
    });
    bitmap = await createImageBitmap(
      new Blob([buffer], { type: request.inputMimeType }),
      { imageOrientation: "from-image" },
    );

    if (cancelledJobs.has(request.jobId)) {
      respond({ type: "cancelled", jobId: request.jobId, fileId: request.fileId });
      return;
    }

    respond({
      type: "progress",
      jobId: request.jobId,
      fileId: request.fileId,
      progress: 45,
      stage: "drawing",
    });
    const result = await processImageBitmap(bitmap, request, createOffscreenSurface);

    if (cancelledJobs.has(request.jobId)) {
      respond({ type: "cancelled", jobId: request.jobId, fileId: request.fileId });
      return;
    }

    respond({
      type: "progress",
      jobId: request.jobId,
      fileId: request.fileId,
      progress: 90,
      stage: "encoding",
    });
    const outputBuffer = await result.blob.arrayBuffer();
    respond(
      {
        type: "success",
        jobId: request.jobId,
        result: {
          fileId: request.fileId,
          buffer: outputBuffer,
          mimeType: result.mimeType,
          width: result.width,
          height: result.height,
          bytes: result.blob.size,
          fileName: result.fileName,
          metadataRemoved: true,
          warning: result.warning,
        },
      },
      [outputBuffer],
    );
  } catch (error) {
    respond({
      type: "failure",
      jobId: request.jobId,
      fileId: request.fileId,
      code: error instanceof Error && error.message.includes("encode") ? "encode" : "processing",
      message: error instanceof Error ? error.message : "The image could not be processed.",
    });
  } finally {
    bitmap?.close();
    cancelledJobs.delete(request.jobId);
  }
};
