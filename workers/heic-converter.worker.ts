/// <reference lib="webworker" />

import { heicTo, isHeic } from "heic-to/next";

import {
  calculateHeicOutputDimensions,
  createHeicOutputName,
  type HeicWorkerRequest,
  type HeicWorkerResponse,
} from "@/lib/heic-converter";

const workerScope: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

function post(response: HeicWorkerResponse, transfer: Transferable[] = []) {
  workerScope.postMessage(response, transfer);
}

workerScope.addEventListener("message", async (event: MessageEvent<HeicWorkerRequest>) => {
  const request = event.data;
  if (!request || request.type !== "convert") {
    return;
  }

  try {
    const file = new File([request.buffer], request.fileName, {
      type: request.fileType || "image/heic",
    });

    if (!(await isHeic(file))) {
      throw new Error("This file is not a supported HEIC or HEIF image.");
    }

    post({
      type: "progress",
      jobId: request.jobId,
      fileId: request.fileId,
      stage: "decoding",
    });

    const bitmap = await heicTo({
      blob: file,
      type: "bitmap",
      options: { imageOrientation: "from-image" },
    });

    try {
      const sourceWidth = bitmap.width;
      const sourceHeight = bitmap.height;

      if (sourceWidth * sourceHeight > request.maxPixels) {
        throw new Error(
          `This image is ${sourceWidth.toLocaleString()} × ${sourceHeight.toLocaleString()} pixels, which is above this device's safe processing limit.`,
        );
      }

      const output = calculateHeicOutputDimensions(
        sourceWidth,
        sourceHeight,
        request.resizeMode,
        request.resizeValue,
        request.preventUpscale,
        request.maxPixels,
      );

      post({
        type: "progress",
        jobId: request.jobId,
        fileId: request.fileId,
        stage: "resizing",
      });

      const canvas = new OffscreenCanvas(output.width, output.height);
      const context = canvas.getContext("2d", { alpha: request.outputType !== "image/jpeg" });
      if (!context) {
        throw new Error("Your browser could not create the image canvas.");
      }

      if (request.outputType === "image/jpeg") {
        context.fillStyle = request.jpegBackground;
        context.fillRect(0, 0, output.width, output.height);
      } else {
        context.clearRect(0, 0, output.width, output.height);
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, output.width, output.height);

      post({
        type: "progress",
        jobId: request.jobId,
        fileId: request.fileId,
        stage: "encoding",
      });

      const blob = await canvas.convertToBlob({
        type: request.outputType,
        quality: request.outputType === "image/png" ? undefined : request.quality,
      });

      if (blob.type !== request.outputType) {
        throw new Error(`Your browser cannot export ${request.outputType.split("/")[1].toUpperCase()} images.`);
      }

      const outputBuffer = await blob.arrayBuffer();
      post(
        {
          type: "complete",
          jobId: request.jobId,
          fileId: request.fileId,
          outputName: createHeicOutputName(
            request.fileName,
            request.outputType,
            request.suffix,
          ),
          outputType: request.outputType,
          buffer: outputBuffer,
          sourceWidth,
          sourceHeight,
          outputWidth: output.width,
          outputHeight: output.height,
          safetyLimited: output.safetyLimited,
        },
        [outputBuffer],
      );
    } finally {
      bitmap.close();
    }
  } catch (error) {
    post({
      type: "error",
      jobId: request.jobId,
      fileId: request.fileId,
      message: error instanceof Error ? error.message : "The HEIC image could not be converted.",
    });
  }
});

export {};
