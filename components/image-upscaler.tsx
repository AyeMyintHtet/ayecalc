"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import ImageNextStep from "@/components/image-next-step";
import { takeStagedImage } from "@/lib/image-handoff";
import {
  formatImageBytes,
  isAnimatedImage,
  validateImageFileBasics,
} from "@/lib/image-tools";
import {
  MAX_UPSCALE_BYTES,
  MAX_UPSCALE_PIXELS,
  getUpscaleDimensions,
  upscaleFileName,
  type UpscaleResponse,
} from "@/lib/image-upscaler";
import styles from "@/components/image-upscaler.module.css";

type Status =
  | "idle"
  | "reading"
  | "ready"
  | "loading-model"
  | "processing"
  | "encoding"
  | "complete"
  | "error";
type Selected = { file: File; url: string; width: number; height: number };
type Result = { blob: Blob; url: string; width: number; height: number };

function devicePixelLimit() {
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  return (memory !== undefined && memory <= 4) ||
    navigator.hardwareConcurrency <= 4 ||
    matchMedia("(max-width: 760px)").matches
    ? 500_000
    : MAX_UPSCALE_PIXELS;
}

export default function ImageUpscaler() {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(
    "Choose a photo to enlarge its width and height by 2×.",
  );
  const [progress, setProgress] = useState(0);
  const [comparison, setComparison] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [maxPixels, setMaxPixels] = useState(MAX_UPSCALE_PIXELS);
  const input = useRef<HTMLInputElement>(null);
  const worker = useRef<Worker | null>(null);
  const operation = useRef(0);
  const urls = useRef({ original: "", result: "" });
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectRef = useRef<(file: File) => void>(() => undefined);
  const busy = ["reading", "loading-model", "processing", "encoding"].includes(
    status,
  );

  function stopWorker() {
    worker.current?.terminate();
    worker.current = null;
    if (watchdog.current) clearTimeout(watchdog.current);
    watchdog.current = null;
  }
  function clearResult() {
    if (urls.current.result) URL.revokeObjectURL(urls.current.result);
    urls.current.result = "";
    setResult(null);
  }
  function fail(text: string) {
    stopWorker();
    setStatus("error");
    setMessage(text);
    setProgress(0);
  }
  function armWatchdog() {
    if (watchdog.current) clearTimeout(watchdog.current);
    watchdog.current = setTimeout(() => {
      operation.current++;
      fail(
        "Processing stopped after two minutes without progress. Try a smaller image or a different browser.",
      );
    }, 120_000);
  }

  useEffect(() => {
    setSupported(
      typeof Worker !== "undefined" &&
        typeof OffscreenCanvas !== "undefined" &&
        typeof createImageBitmap === "function" &&
        typeof WebAssembly !== "undefined",
    );
    setMaxPixels(devicePixelLimit());
    const frame = requestAnimationFrame(() => {
      const file = takeStagedImage("/ai-image-upscaler");
      if (file) selectRef.current(file);
    });
    const activeOperation = operation;
    const activeUrls = urls.current;
    return () => {
      cancelAnimationFrame(frame);
      activeOperation.current++;
      worker.current?.terminate();
      if (watchdog.current) clearTimeout(watchdog.current);
      URL.revokeObjectURL(activeUrls.original);
      URL.revokeObjectURL(activeUrls.result);
    };
  }, []);

  async function selectFile(file: File) {
    if (busy) return;
    const id = ++operation.current;
    stopWorker();
    clearResult();
    if (urls.current.original) URL.revokeObjectURL(urls.current.original);
    urls.current.original = "";
    setSelected(null);
    setStatus("reading");
    setMessage("Checking image dimensions…");
    try {
      const error = validateImageFileBasics(file, MAX_UPSCALE_BYTES);
      if (error) throw new Error(error);
      if (await isAnimatedImage(file))
        throw new Error(
          "Choose a still photo. Animated PNG and WebP files are not supported.",
        );
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      try {
        const limit = devicePixelLimit();
        getUpscaleDimensions(bitmap.width, bitmap.height, limit);
        if (id !== operation.current) return;
        const url = URL.createObjectURL(file);
        urls.current.original = url;
        setMaxPixels(limit);
        setSelected({ file, url, width: bitmap.width, height: bitmap.height });
        setStatus("ready");
        setMessage("Ready. Select Enhance image to start the local AI model.");
      } finally {
        bitmap.close();
      }
    } catch (error) {
      if (id === operation.current)
        fail(
          error instanceof Error
            ? error.message
            : "This browser could not open the image.",
        );
    } finally {
      if (input.current) input.current.value = "";
    }
  }
  selectRef.current = (file) => {
    void selectFile(file);
  };

  async function enhance() {
    if (!selected || busy || !supported) return;
    const id = ++operation.current;
    stopWorker();
    clearResult();
    setProgress(0);
    setStatus("loading-model");
    setMessage(
      "Loading the AI model. The first run downloads about 8 MB of model weights plus the processing runtime.",
    );
    try {
      const activeWorker = new Worker(
        new URL("../workers/image-upscaler.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.current = activeWorker;
      armWatchdog();
      activeWorker.onmessage = ({ data }: MessageEvent<UpscaleResponse>) => {
        if (id !== operation.current) return;
        armWatchdog();
        if (data.type === "progress") {
          setProgress(Math.round(data.progress));
          return;
        }
        if (data.type === "status") {
          setStatus(data.stage);
          setProgress(0);
          setMessage(
            data.stage === "loading-model"
              ? "Loading the AI model and runtime…"
              : data.stage === "processing"
                ? "Enhancing your photo on this device. Larger images may take several minutes."
                : "Preparing your enhanced PNG…",
          );
          return;
        }
        if (data.type === "error") {
          fail(
            "Could not enhance this image. Check your connection for the first model download, or try a smaller image.",
          );
          return;
        }
        const blob = new Blob([data.buffer], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        urls.current.result = url;
        setResult({ blob, url, width: data.width, height: data.height });
        setComparison(50);
        setStatus("complete");
        setProgress(100);
        setMessage(
          "Your 2× image is ready. Compare the details before downloading.",
        );
        stopWorker();
      };
      activeWorker.onerror = () => {
        if (id === operation.current)
          fail(
            "The image worker stopped. Try a smaller image or another browser.",
          );
      };
      activeWorker.onmessageerror = () => {
        if (id === operation.current)
          fail(
            "The browser could not read the image result. Please try again.",
          );
      };
      const buffer = await selected.file.arrayBuffer();
      if (id !== operation.current) return;
      activeWorker.postMessage(
        { type: "upscale", buffer, mimeType: selected.file.type, maxPixels },
        [buffer],
      );
    } catch {
      if (id === operation.current)
        fail(
          "This browser could not start the AI model. Try a recent desktop browser.",
        );
    }
  }
  function cancel() {
    operation.current++;
    stopWorker();
    setStatus(selected ? "ready" : "idle");
    setProgress(0);
    setMessage("Enhancement cancelled. Your original image is unchanged.");
  }
  function reset() {
    operation.current++;
    stopWorker();
    clearResult();
    URL.revokeObjectURL(urls.current.original);
    urls.current.original = "";
    setSelected(null);
    setStatus("idle");
    setProgress(0);
    setMessage("Choose a photo to enlarge its width and height by 2×.");
    if (input.current) input.current.value = "";
  }
  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !busy && supported) void selectFile(file);
  }

  return (
    <section className={styles.card} aria-labelledby="upscale-tool-title">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>A clearer view</span>
          <h2 id="upscale-tool-title">Make your photo twice the size.</h2>
        </div>
        <span className={styles.badge}>Private · Free · No watermark</span>
      </div>
      <p className={styles.intro}>
        AI enhancement for small photos. Your image stays on this device.
      </p>
      {supported === false && (
        <p className={styles.error} role="alert">
          This browser does not support the required image workers. Try a recent
          Chrome, Edge, Firefox, or Safari browser, or use the{" "}
          <Link href="/image-resizer">standard image resizer</Link>.
        </p>
      )}
      <div
        className={`${styles.drop} ${dragging ? styles.dragging : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy && supported) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
      >
        <span className={styles.uploadIcon} aria-hidden="true">
          ↗
        </span>
        <strong>Drop a photo here</strong>
        <p>
          JPEG, PNG, or WebP · Up to 15 MB and{" "}
          {(maxPixels / 1_000_000).toFixed(1)} megapixels
        </p>
        <input
          className={styles.fileInput}
          ref={input}
          type="file"
          tabIndex={-1}
          accept="image/jpeg,image/png,image/webp"
          aria-label="Choose a photo to upscale"
          disabled={busy || !supported}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void selectFile(file);
          }}
        />
        <button
          type="button"
          className={styles.primary}
          disabled={busy || !supported}
          onClick={() => input.current?.click()}
        >
          Choose photo
        </button>
        <small>
          Image too large? <Link href="/image-resizer">Resize it first</Link>.
        </small>
      </div>
      {selected && (
        <>
          <div className={styles.fileDetails}>
            <strong>{selected.file.name}</strong>
            <span>
              {selected.width} × {selected.height} → {selected.width * 2} ×{" "}
              {selected.height * 2} px
            </span>
          </div>
          <div
            className={styles.preview}
            style={{ aspectRatio: `${selected.width} / ${selected.height}` }}
          >
            <img
              src={selected.url}
              alt="Original photo before enhancement"
              width={selected.width}
              height={selected.height}
              style={
                result
                  ? { clipPath: `inset(0 ${100 - comparison}% 0 0)` }
                  : undefined
              }
            />
            {result && (
              <>
                <div
                  className={styles.after}
                  style={{ clipPath: `inset(0 0 0 ${comparison}%)` }}
                >
                  <img
                    src={result.url}
                    alt="Photo enhanced at twice the original resolution"
                    width={result.width}
                    height={result.height}
                  />
                </div>
                <div
                  className={styles.divider}
                  style={{ left: `${comparison}%` }}
                  aria-hidden="true"
                />
              </>
            )}
            <span className={styles.originalLabel}>Original</span>
            {result && <span className={styles.enhancedLabel}>AI · 2×</span>}
          </div>
          {result && (
            <label className={styles.comparison}>
              <span>Compare original and enhanced photo</span>
              <input
                type="range"
                min="0"
                max="100"
                value={comparison}
                onChange={(event) => setComparison(Number(event.target.value))}
                aria-valuetext={`${comparison}% original, ${100 - comparison}% enhanced`}
              />
            </label>
          )}
        </>
      )}
      <div className={styles.status}>
        <p
          role={status === "error" ? "alert" : "status"}
          className={status === "error" ? styles.error : undefined}
        >
          {message}
        </p>
        {busy && (
          <div
            className={styles.progress}
            role="progressbar"
            aria-label={
              status === "loading-model"
                ? "Model download"
                : "Photo enhancement"
            }
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              status === "reading" || status === "encoding"
                ? undefined
                : progress
            }
          >
            <span
              style={{
                width: `${status === "encoding" ? 100 : Math.max(2, progress)}%`,
              }}
            />
          </div>
        )}
      </div>
      <div className={styles.actions}>
        {busy ? (
          <button type="button" className={styles.secondary} onClick={cancel}>
            Cancel
          </button>
        ) : (
          <>
            {selected && !result && (
              <button
                type="button"
                className={styles.primary}
                disabled={!supported}
                onClick={() => void enhance()}
              >
                Enhance image · 2×
              </button>
            )}
            {result && selected && (
              <a
                className={styles.primary}
                href={result.url}
                download={upscaleFileName(selected.file.name)}
              >
                Download PNG · {formatImageBytes(result.blob.size)}
              </a>
            )}
            {selected && (
              <button
                type="button"
                className={styles.secondary}
                onClick={reset}
              >
                Clear image
              </button>
            )}
          </>
        )}
      </div>
      {result && selected && (
        <ImageNextStep
          blob={result.blob}
          fileName={upscaleFileName(selected.file.name)}
          current="/ai-image-upscaler"
        />
      )}
      <div className={styles.notes}>
        <p>
          <strong>First use:</strong> model and runtime files download from
          Hugging Face and jsDelivr. Subsequent runs may use your browser’s
          cache.
        </p>
        <p>
          <strong>Keep your original:</strong> AI estimates detail and can
          introduce artifacts. PNG exports preserve transparency but remove
          embedded metadata and Content Credentials.
        </p>
      </div>
    </section>
  );
}
