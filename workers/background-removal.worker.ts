import {
  env,
  pipeline,
  type ProgressInfo,
} from "@huggingface/transformers";

type RemoveMessage = {
  type: "remove";
  buffer: ArrayBuffer;
  mimeType: string;
};

type WorkerMessage =
  | { type: "status"; status: "loading-model" | "processing" }
  | { type: "progress"; progress: number }
  | {
      type: "complete";
      buffer: ArrayBuffer;
      width: number;
      height: number;
    }
  | { type: "error"; message: string };

const MODEL_ID = "onnx-community/ormbg-ONNX";

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<RemoveMessage>) => void) | null;
  postMessage: (message: WorkerMessage, transfer?: Transferable[]) => void;
};

function postMessage(message: WorkerMessage, transfer?: Transferable[]) {
  workerScope.postMessage(message, transfer);
}

function reportProgress(info: ProgressInfo) {
  if (info.status === "progress_total") {
    postMessage({
      type: "progress",
      progress: Math.max(0, Math.min(100, info.progress)),
    });
  }
}

async function createRemover() {
  return pipeline("background-removal", MODEL_ID, {
    device: "wasm",
    dtype: "q8",
    progress_callback: reportProgress,
  });
}

let removerPromise: ReturnType<typeof createRemover> | null = null;

workerScope.onmessage = async (event) => {
  if (event.data.type !== "remove") return;

  try {
    postMessage({ type: "status", status: "loading-model" });
    removerPromise ??= createRemover();
    const remover = await removerPromise;

    postMessage({ type: "status", status: "processing" });
    const image = new Blob([event.data.buffer], {
      type: event.data.mimeType,
    });
    const output = await remover(image);
    const pixels = new Uint8ClampedArray(output.data.length);
    pixels.set(output.data);

    postMessage(
      {
        type: "complete",
        buffer: pixels.buffer,
        width: output.width,
        height: output.height,
      },
      [pixels.buffer],
    );
  } catch (error) {
    removerPromise = null;
    postMessage({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "The browser could not remove this image background.",
    });
  }
};
