import type { MutableRefObject } from "react";
import type {
  ImageProcessingRequest,
  ImageProcessingResult,
  ImageWorkerResponse,
} from "@/lib/image-tools";

export class WorkerProcessingError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const activeWorkerJobs = new WeakMap<Worker, { cancel: () => void }>();

export function cancelImageWorker(workerRef: MutableRefObject<Worker | null>) {
  const worker = workerRef.current;
  if (!worker) return;
  activeWorkerJobs.get(worker)?.cancel();
}

export function processImageWithWorker(
  file: File,
  request: ImageProcessingRequest,
  workerRef: MutableRefObject<Worker | null>,
  onProgress: (progress: number) => void,
) {
  return new Promise<ImageProcessingResult>((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(
        new URL("../workers/image-processing.worker.ts", import.meta.url),
        { type: "module" },
      );
    } catch {
      reject(new WorkerProcessingError("unsupported", "Image workers are unavailable."));
      return;
    }

    workerRef.current = worker;
    let settled = false;

    const closeWorker = () => {
      worker.terminate();
      activeWorkerJobs.delete(worker);
      if (workerRef.current === worker) workerRef.current = null;
    };

    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      closeWorker();
      reject(error);
    };

    activeWorkerJobs.set(worker, {
      cancel: () => {
        if (settled) return;
        try {
          worker.postMessage({ type: "cancel", jobId: request.jobId });
        } catch {
          // Termination below remains the cancellation fallback.
        } finally {
          fail(new WorkerProcessingError("cancelled", "Image processing was cancelled."));
        }
      },
    });

    worker.onmessage = (event: MessageEvent<ImageWorkerResponse>) => {
      if (settled) return;
      const message = event.data;
      if (message.type === "progress") {
        onProgress(message.progress);
        return;
      }
      if (message.type === "started") return;

      settled = true;
      closeWorker();

      if (message.type === "success") {
        const blob = new Blob([message.result.buffer], {
          type: message.result.mimeType,
        });
        resolve({ ...message.result, blob, bytes: blob.size });
        return;
      }
      if (message.type === "cancelled") {
        reject(new WorkerProcessingError("cancelled", "Image processing was cancelled."));
        return;
      }
      reject(new WorkerProcessingError(message.code, message.message));
    };

    worker.onerror = () => {
      fail(new WorkerProcessingError("worker", "The image worker stopped unexpectedly."));
    };

    void file
      .arrayBuffer()
      .then((buffer) => {
        if (!settled) worker.postMessage({ type: "process", request, buffer }, [buffer]);
      })
      .catch(fail);
  });
}
