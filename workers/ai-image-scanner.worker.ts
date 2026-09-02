import {
  env,
  pipeline,
  type ImageClassificationOutput,
  type ProgressInfo,
} from "@huggingface/transformers";
import {
  AI_IMAGE_SCANNER_MODEL,
  normalizeAiImageScores,
  type AiImageLikelihoods,
} from "@/lib/ai-image-scanner";

type ScanMessage = {
  type: "scan";
  buffer: ArrayBuffer;
  mimeType: string;
};

type WorkerMessage =
  | { type: "status"; status: "loading-model" | "scanning" }
  | { type: "progress"; progress: number }
  | { type: "complete"; likelihoods: AiImageLikelihoods }
  | { type: "error"; message: string };

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<ScanMessage>) => void) | null;
  postMessage: (message: WorkerMessage) => void;
};

function postMessage(message: WorkerMessage) {
  workerScope.postMessage(message);
}

function reportProgress(info: ProgressInfo) {
  if (info.status === "progress_total") {
    postMessage({
      type: "progress",
      progress: Math.max(0, Math.min(100, info.progress)),
    });
  }
}

async function createScanner() {
  return pipeline("image-classification", AI_IMAGE_SCANNER_MODEL, {
    device: "wasm",
    dtype: "q4",
    progress_callback: reportProgress,
  });
}

let scannerPromise: ReturnType<typeof createScanner> | null = null;

workerScope.onmessage = async (event) => {
  if (event.data.type !== "scan") return;

  try {
    postMessage({ type: "status", status: "loading-model" });
    scannerPromise ??= createScanner();
    const scanner = await scannerPromise;

    postMessage({ type: "status", status: "scanning" });
    const image = new Blob([event.data.buffer], { type: event.data.mimeType });
    const output = (await scanner(image, {
      top_k: 2,
    })) as ImageClassificationOutput;
    const likelihoods = normalizeAiImageScores(output);

    if (!likelihoods) {
      throw new Error("The detection model returned an unexpected result.");
    }

    postMessage({ type: "complete", likelihoods });
  } catch (error) {
    scannerPromise = null;
    postMessage({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "The browser could not scan this image.",
    });
  }
};
