"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import styles from "@/components/background-remover.module.css";

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_PIXELS = 25_000_000;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type Dimensions = { width: number; height: number };
type ToolStatus =
  | "idle"
  | "ready"
  | "loading-model"
  | "processing"
  | "encoding"
  | "complete"
  | "error";

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

function bytesToMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function createDownloadName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "").trim() || "image";
  const safeName = baseName.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
  return `${safeName || "image"}-no-background.png`;
}

function rgbaToPng(
  buffer: ArrayBuffer,
  width: number,
  height: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      reject(new Error("This browser could not create the PNG output."));
      return;
    }

    const pixels = new Uint8ClampedArray(buffer);
    context.putImageData(new ImageData(pixels, width, height), 0, 0);
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("This browser could not encode the PNG output."));
    }, "image/png");
  });
}

export default function BackgroundRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(
    "Choose a JPEG, PNG, or WebP image to begin.",
  );
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const originalUrlRef = useRef("");
  const resultUrlRef = useRef("");
  const operationRef = useRef(0);

  const isBusy = ["loading-model", "processing", "encoding"].includes(status);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  function replaceOriginalUrl(nextUrl: string) {
    if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    originalUrlRef.current = nextUrl;
    setOriginalUrl(nextUrl);
  }

  function replaceResultUrl(nextUrl: string) {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = nextUrl;
    setResultUrl(nextUrl);
  }

  function stopWorker() {
    workerRef.current?.terminate();
    workerRef.current = null;
  }

  function resetTool() {
    operationRef.current += 1;
    stopWorker();
    setSelectedFile(null);
    setDimensions(null);
    replaceOriginalUrl("");
    replaceResultUrl("");
    setStatus("idle");
    setProgress(0);
    setMessage("Choose a JPEG, PNG, or WebP image to begin.");
    setIsDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function setError(errorMessage: string) {
    setStatus("error");
    setProgress(0);
    setMessage(errorMessage);
  }

  async function selectFile(file: File) {
    const operation = ++operationRef.current;

    if (!SUPPORTED_TYPES.has(file.type)) {
      setError("Use a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      setError("Choose an image larger than 0 bytes and no more than 15 MB.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const nextDimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();

      if (operation !== operationRef.current) return;

      if (
        nextDimensions.width === 0 ||
        nextDimensions.height === 0 ||
        nextDimensions.width * nextDimensions.height > MAX_PIXELS
      ) {
        setError("Choose an image no larger than 25 megapixels.");
        return;
      }

      stopWorker();
      setSelectedFile(file);
      setDimensions(nextDimensions);
      replaceOriginalUrl(URL.createObjectURL(file));
      replaceResultUrl("");
      setStatus("ready");
      setProgress(0);
      setMessage("Image ready. Start removal when you are ready.");
    } catch {
      setError("The browser could not decode this image. Try another supported file.");
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void selectFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (isBusy) return;

    const file = event.dataTransfer.files?.[0];
    if (file) void selectFile(file);
  }

  function createWorker() {
    const worker = new Worker(
      new URL("../workers/background-removal.worker.ts", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = async (event: MessageEvent<WorkerMessage>) => {
      const workerMessage = event.data;

      if (workerMessage.type === "status") {
        setStatus(workerMessage.status);
        setMessage(
          workerMessage.status === "loading-model"
            ? "Loading the background-removal model…"
            : "Separating the foreground from the background…",
        );
        return;
      }

      if (workerMessage.type === "progress") {
        setProgress(workerMessage.progress);
        return;
      }

      if (workerMessage.type === "error") {
        setError(
          "Background removal failed. Check the connection for the first-use model download, then try again.",
        );
        return;
      }

      setStatus("encoding");
      setMessage("Creating the transparent PNG…");

      try {
        const png = await rgbaToPng(
          workerMessage.buffer,
          workerMessage.width,
          workerMessage.height,
        );
        replaceResultUrl(URL.createObjectURL(png));
        setStatus("complete");
        setProgress(100);
        setMessage("Background removed. Inspect the edges before downloading.");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "The browser could not create the PNG output.",
        );
      }
    };

    worker.onerror = () => {
      stopWorker();
      setError("The background-removal worker stopped unexpectedly. Try again.");
    };

    workerRef.current = worker;
    return worker;
  }

  async function removeBackground() {
    if (!selectedFile || isBusy) return;

    const operation = ++operationRef.current;

    replaceResultUrl("");
    setStatus("loading-model");
    setProgress(0);
    setMessage("Preparing the browser model…");

    try {
      const buffer = await selectedFile.arrayBuffer();
      if (operation !== operationRef.current) return;
      const worker = workerRef.current ?? createWorker();
      worker.postMessage(
        {
          type: "remove",
          buffer,
          mimeType: selectedFile.type,
        },
        [buffer],
      );
    } catch {
      setError("The browser could not read this image. Try choosing it again.");
    }
  }

  const previewStyle = dimensions
    ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` }
    : undefined;

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>Browser-based image segmentation</span>
          <h2>Remove an image background</h2>
        </div>
        <span className={styles.privacyBadge}>Image stays local</span>
      </div>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!isBusy) setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className={styles.fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          disabled={isBusy}
        />
        <span className={styles.uploadIcon} aria-hidden="true">↑</span>
        <strong>{selectedFile ? "Choose a different image" : "Drop an image here"}</strong>
        <p>JPEG, PNG, or WebP · up to 15 MB and 25 megapixels</p>
        <button
          type="button"
          className={styles.chooseButton}
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
        >
          Choose image
        </button>
      </div>

      <div className={styles.statusArea} aria-live="polite" aria-atomic="true">
        <p
          className={status === "error" ? styles.error : ""}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
        {status === "loading-model" && (
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="Model download progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {selectedFile && dimensions && originalUrl && (
        <>
          <div className={styles.fileMeta}>
            <span>{selectedFile.name}</span>
            <span>
              {dimensions.width} × {dimensions.height}px · {bytesToMegabytes(selectedFile.size)}
            </span>
          </div>

          <div className={styles.previewGrid}>
            <figure>
              <figcaption>Original</figcaption>
              <div className={styles.imageFrame} style={previewStyle}>
                <img
                  src={originalUrl}
                  width={dimensions.width}
                  height={dimensions.height}
                  alt={`Original ${selectedFile.name}`}
                />
              </div>
            </figure>
            <figure>
              <figcaption>Transparent result</figcaption>
              <div
                className={`${styles.imageFrame} ${styles.checkerboard}`}
                style={previewStyle}
              >
                {resultUrl ? (
                  <img
                    src={resultUrl}
                    width={dimensions.width}
                    height={dimensions.height}
                    alt={`${selectedFile.name} with its background removed`}
                  />
                ) : (
                  <span>{isBusy ? "Processing…" : "Result preview"}</span>
                )}
              </div>
            </figure>
          </div>

          <div className={styles.actions}>
            {resultUrl && status === "complete" ? (
              <a
                className={styles.primaryButton}
                href={resultUrl}
                download={createDownloadName(selectedFile.name)}
              >
                Download transparent PNG
              </a>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={removeBackground}
                disabled={isBusy}
              >
                {isBusy ? "Removing background…" : "Remove background"}
              </button>
            )}
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={resetTool}
            >
              {isBusy ? "Cancel" : "Start over"}
            </button>
          </div>
        </>
      )}

      <p className={styles.modelNote}>
        First use downloads an approximately 44 MB quantized model plus browser
        runtime files. The browser may cache them for later use.
      </p>
    </div>
  );
}
