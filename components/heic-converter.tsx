"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import styles from "@/components/image-tools.module.css";
import {
  MAX_HEIC_BATCH_BYTES,
  MAX_HEIC_FILE_BYTES,
  MAX_HEIC_FILES,
  hasHeifSignature,
  probeHeifDimensions,
  type HeicOutputMime,
  type HeicResizeMode,
  type HeicWorkerRequest,
  type HeicWorkerResponse,
} from "@/lib/heic-converter";
import {
  MAX_IMAGE_PIXELS,
  formatImageBytes,
  formatImageMegapixels,
  getRuntimeImagePixelLimit,
} from "@/lib/image-tools";

type HeicItemStatus = "ready" | "queued" | "processing" | "complete" | "error";

type HeicResult = {
  blob: Blob;
  previewUrl: string;
  fileName: string;
  mimeType: HeicOutputMime;
  sourceWidth: number;
  sourceHeight: number;
  width: number;
  height: number;
  safetyLimited: boolean;
};

type HeicItem = {
  id: string;
  file: File;
  width?: number;
  height?: number;
  status: HeicItemStatus;
  result?: HeicResult;
  error?: string;
};

const outputFormats: Array<{ value: HeicOutputMime; label: string }> = [
  { value: "image/jpeg", label: "JPG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
];

const resizeModes: Array<{ value: HeicResizeMode; label: string }> = [
  { value: "original", label: "Original" },
  { value: "percentage", label: "Percent" },
  { value: "max-width", label: "Max width" },
  { value: "max-long-edge", label: "Long edge" },
];

function createRecordId() {
  return `heic-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createJobId() {
  return `heic-job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isTextEntryTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function createHeicWorker() {
  return new Worker(new URL("../workers/heic-converter.worker.ts", import.meta.url), {
    type: "module",
  });
}

function processWithWorker(
  worker: Worker,
  request: HeicWorkerRequest,
  onProgress: (stage: Extract<HeicWorkerResponse, { type: "progress" }>["stage"]) => void,
) {
  return new Promise<Extract<HeicWorkerResponse, { type: "complete" }>>(
    (resolve, reject) => {
      const handleMessage = (event: MessageEvent<HeicWorkerResponse>) => {
        const response = event.data;
        if (response.jobId !== request.jobId || response.fileId !== request.fileId) {
          return;
        }

        if (response.type === "progress") {
          onProgress(response.stage);
          return;
        }

        cleanup();
        if (response.type === "complete") {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      };

      const handleError = () => {
        cleanup();
        reject(new Error("The HEIC conversion worker stopped unexpectedly."));
      };

      const cleanup = () => {
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);
      worker.postMessage(request, [request.buffer]);
    },
  );
}

export default function HeicConverter() {
  const [items, setItems] = useState<HeicItem[]>([]);
  const [rejections, setRejections] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isReadingClipboard, setIsReadingClipboard] = useState(false);
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(
    "Paste, drop, or choose HEIC and HEIF photos to begin.",
  );
  const [outputType, setOutputType] = useState<HeicOutputMime>("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [resizeMode, setResizeMode] = useState<HeicResizeMode>("original");
  const [resizeValue, setResizeValue] = useState(100);
  const [preventUpscale, setPreventUpscale] = useState(true);
  const [jpegBackground, setJpegBackground] = useState("#ffffff");
  const [suffix, setSuffix] = useState("converted");
  const [imagePixelLimit, setImagePixelLimit] = useState(MAX_IMAGE_PIXELS);
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const runRef = useRef(0);
  const itemsRef = useRef(items);
  const isBusyRef = useRef(isBusy);
  const addFilesRef = useRef<(files: File[]) => void>(() => undefined);
  const isAddingRef = useRef(false);

  itemsRef.current = items;
  isBusyRef.current = isBusy;

  useEffect(() => {
    setImagePixelLimit(getRuntimeImagePixelLimit());
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (isBusyRef.current || isTextEntryTarget(event.target)) return;
      const files = Array.from(event.clipboardData?.items ?? [])
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile())
        .filter((file): file is File => Boolean(file));

      if (files.length) {
        event.preventDefault();
        addFilesRef.current(files);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  useEffect(() => {
    return () => {
      runRef.current += 1;
      workerRef.current?.terminate();
      itemsRef.current.forEach((item) => {
        if (item.result) URL.revokeObjectURL(item.result.previewUrl);
      });
    };
  }, []);

  function clearResults(messageText = "Settings changed. Convert the photos again.") {
    setItems((current) =>
      current.map((item) => {
        if (item.result) URL.revokeObjectURL(item.result.previewUrl);
        return { ...item, status: "ready", result: undefined, error: undefined };
      }),
    );
    setProgress(0);
    setMessage(messageText);
  }

  async function addFiles(files: File[]) {
    if (isAddingRef.current || isBusyRef.current || files.length === 0) return;
    isAddingRef.current = true;
    const accepted: HeicItem[] = [];
    const errors: string[] = [];
    const currentItems = itemsRef.current;
    let totalBytes = currentItems.reduce((total, item) => total + item.file.size, 0);
    let remainingSlots = Math.max(0, MAX_HEIC_FILES - currentItems.length);

    try {
      for (const file of files) {
        const displayName = file.name || "Pasted image";
        if (remainingSlots === 0) {
          errors.push(`${displayName}: only ${MAX_HEIC_FILES} photos can be converted at once.`);
          continue;
        }
        if (file.size === 0) {
          errors.push(`${displayName}: the file is empty.`);
          continue;
        }
        if (file.size > MAX_HEIC_FILE_BYTES) {
          errors.push(
            `${displayName}: use a file no larger than ${formatImageBytes(MAX_HEIC_FILE_BYTES)}.`,
          );
          continue;
        }
        if (totalBytes + file.size > MAX_HEIC_BATCH_BYTES) {
          errors.push(
            `${displayName}: the batch would exceed ${formatImageBytes(MAX_HEIC_BATCH_BYTES)}.`,
          );
          continue;
        }

        try {
          const header = new Uint8Array(
            await file.slice(0, Math.min(file.size, 2 * 1024 * 1024)).arrayBuffer(),
          );
          if (!hasHeifSignature(header)) {
            errors.push(`${displayName}: this is not a supported HEIC or HEIF file.`);
            continue;
          }

          const dimensions = probeHeifDimensions(header);
          if (dimensions && dimensions.width * dimensions.height > imagePixelLimit) {
            errors.push(
              `${displayName}: use a photo no larger than ${formatImageMegapixels(imagePixelLimit)} on this device.`,
            );
            continue;
          }

          accepted.push({
            id: createRecordId(),
            file,
            width: dimensions?.width,
            height: dimensions?.height,
            status: "ready",
          });
          totalBytes += file.size;
          remainingSlots -= 1;
        } catch {
          errors.push(`${displayName}: the file could not be read.`);
        }
      }

      if (accepted.length) {
        setItems((current) => [...current, ...accepted]);
        setMessage(
          `${accepted.length} photo${accepted.length === 1 ? " is" : "s are"} ready to convert.`,
        );
      }
      setRejections(errors);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      isAddingRef.current = false;
    }
  }

  addFilesRef.current = (files) => {
    void addFiles(files);
  };

  async function pasteFromClipboard() {
    if (isBusy || isReadingClipboard) return;
    if (!navigator.clipboard?.read) {
      setRejections([
        "Clipboard access is not available in this browser. Focus this converter and use your normal paste shortcut instead.",
      ]);
      return;
    }

    setIsReadingClipboard(true);
    try {
      const clipboardItems = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of clipboardItems) {
        const imageType = item.types.find(
          (type) =>
            type.startsWith("image/") ||
            type === "application/octet-stream",
        );
        if (!imageType) continue;
        const blob = await item.getType(imageType);
        const extension = imageType.includes("heif") ? "heif" : "heic";
        files.push(
          new File([blob], `pasted-photo-${files.length + 1}.${extension}`, {
            type: blob.type,
          }),
        );
      }

      if (files.length) {
        await addFiles(files);
      } else {
        setRejections(["The clipboard does not contain an image file."]);
      }
    } catch {
      setRejections([
        "Clipboard permission was not granted. You can still drag the photo here or choose it from your device.",
      ]);
    } finally {
      setIsReadingClipboard(false);
    }
  }

  function removeItem(id: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.result) URL.revokeObjectURL(target.result.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  function resetTool() {
    runRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;
    items.forEach((item) => {
      if (item.result) URL.revokeObjectURL(item.result.previewUrl);
    });
    setItems([]);
    setRejections([]);
    setIsBusy(false);
    setProgress(0);
    setMessage("Paste, drop, or choose HEIC and HEIF photos to begin.");
  }

  function cancelConversion() {
    runRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;
    setIsBusy(false);
    setItems((current) =>
      current.map((item) =>
        item.status === "queued" || item.status === "processing"
          ? { ...item, status: "ready" }
          : item,
      ),
    );
    setMessage("Conversion cancelled. Completed results were kept.");
  }

  async function convertPhotos() {
    if (!items.length || isBusy) return;
    if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") {
      setRejections([
        "This browser does not support the image worker required for HEIC conversion. Try a current version of Chrome, Edge, Firefox, or Safari.",
      ]);
      return;
    }

    const run = ++runRef.current;
    const queue = [...items];
    const worker = createHeicWorker();
    workerRef.current = worker;
    setIsBusy(true);
    setRejections([]);
    setProgress(0);
    setMessage(`Preparing ${queue.length} photo${queue.length === 1 ? "" : "s"}…`);
    setItems((current) =>
      current.map((item) => {
        if (item.result) URL.revokeObjectURL(item.result.previewUrl);
        return { ...item, status: "queued", result: undefined, error: undefined };
      }),
    );

    let completed = 0;
    const stageProgress = { decoding: 0.18, resizing: 0.68, encoding: 0.84 } as const;

    for (const item of queue) {
      if (run !== runRef.current) return;
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? { ...candidate, status: "processing" } : candidate,
        ),
      );
      setMessage(`Converting ${item.file.name || "pasted photo"}…`);

      try {
        const buffer = await item.file.arrayBuffer();
        if (run !== runRef.current) return;
        const response = await processWithWorker(
          worker,
          {
            type: "convert",
            jobId: createJobId(),
            fileId: item.id,
            fileName: item.file.name || "pasted-photo.heic",
            fileType: item.file.type,
            buffer,
            outputType,
            quality: quality / 100,
            resizeMode,
            resizeValue,
            preventUpscale,
            jpegBackground,
            suffix,
            maxPixels: imagePixelLimit,
          },
          (stage) => {
            setProgress(((completed + stageProgress[stage]) / queue.length) * 100);
          },
        );

        if (run !== runRef.current) return;
        const blob = new Blob([response.buffer], { type: response.outputType });
        const previewUrl = URL.createObjectURL(blob);
        setItems((current) =>
          current.map((candidate) =>
            candidate.id === item.id
              ? {
                  ...candidate,
                  width: response.sourceWidth,
                  height: response.sourceHeight,
                  status: "complete",
                  result: {
                    blob,
                    previewUrl,
                    fileName: response.outputName,
                    mimeType: response.outputType,
                    sourceWidth: response.sourceWidth,
                    sourceHeight: response.sourceHeight,
                    width: response.outputWidth,
                    height: response.outputHeight,
                    safetyLimited: response.safetyLimited,
                  },
                }
              : candidate,
          ),
        );
      } catch (error) {
        if (run !== runRef.current) return;
        setItems((current) =>
          current.map((candidate) =>
            candidate.id === item.id
              ? {
                  ...candidate,
                  status: "error",
                  error:
                    error instanceof Error
                      ? error.message
                      : "This HEIC photo could not be converted.",
                }
              : candidate,
          ),
        );
      }

      completed += 1;
      setProgress((completed / queue.length) * 100);
    }

    if (run === runRef.current) {
      worker.terminate();
      workerRef.current = null;
      setIsBusy(false);
      setMessage("Conversion complete. Inspect each result before downloading.");
    }
  }

  async function downloadZip() {
    const results = items.flatMap((item) => (item.result ? [item.result] : []));
    if (!results.length || isCreatingZip) return;
    setIsCreatingZip(true);
    try {
      const { zip } = await import("fflate");
      const files: Record<string, Uint8Array> = {};
      for (const [index, result] of results.entries()) {
        const fileName = files[result.fileName]
          ? `${index + 1}-${result.fileName}`
          : result.fileName;
        files[fileName] = new Uint8Array(await result.blob.arrayBuffer());
      }
      const archive = await new Promise<Uint8Array>((resolve, reject) => {
        zip(files, { level: 0 }, (error, data) => {
          if (error) reject(error);
          else resolve(data);
        });
      });
      const blob = new Blob([archive.slice().buffer as ArrayBuffer], {
        type: "application/zip",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "ayecalc-heic-converted-images.zip";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setMessage("The ZIP could not be created. Download the results individually.");
    } finally {
      setIsCreatingZip(false);
    }
  }

  function changeResizeMode(value: HeicResizeMode) {
    clearResults();
    setResizeMode(value);
    if (value === "percentage") setResizeValue(100);
    if (value === "max-width" || value === "max-long-edge") setResizeValue(1920);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!isBusy) void addFiles(Array.from(event.dataTransfer.files));
  }

  const completedCount = items.filter((item) => item.result).length;
  const totalBytes = items.reduce((total, item) => total + item.file.size, 0);

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>Private HEIC photo converter</span>
          <h2>Convert HEIC photos in your browser</h2>
        </div>
        <span className={styles.privacyBadge}>Photos stay local</span>
      </div>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!isBusy) setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className={styles.fileInput}
          type="file"
          accept=".heic,.heif,image/heic,image/heif,image/heic-sequence,image/heif-sequence"
          multiple
          disabled={isBusy || items.length >= MAX_HEIC_FILES}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.files) void addFiles(Array.from(event.target.files));
          }}
        />
        <span className={styles.uploadIcon} aria-hidden="true">↥</span>
        <strong>{items.length ? "Add more HEIC photos" : "Drop HEIC photos here"}</strong>
        <p>
          Or paste from your clipboard · up to {MAX_HEIC_FILES} files, {formatImageBytes(MAX_HEIC_FILE_BYTES)} each,
          and {formatImageMegapixels(imagePixelLimit)}
          {imagePixelLimit < MAX_IMAGE_PIXELS ? " on this device" : ""}
        </p>
        <div className={styles.dropActions}>
          <button
            type="button"
            className={styles.chooseButton}
            disabled={isBusy || items.length >= MAX_HEIC_FILES}
            onClick={() => inputRef.current?.click()}
          >
            Choose photos
          </button>
          <button
            type="button"
            className={styles.chooseButton}
            disabled={isBusy || isReadingClipboard || items.length >= MAX_HEIC_FILES}
            onClick={() => void pasteFromClipboard()}
          >
            {isReadingClipboard ? "Reading…" : "Paste photo"}
          </button>
        </div>
      </div>

      {rejections.length > 0 && (
        <div className={styles.errorList} role="alert">
          <strong>Some photos were not added</strong>
          <ul>{rejections.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}

      {items.length > 0 && (
        <>
          <fieldset
            className={styles.settingsPanel}
            disabled={isBusy}
            aria-label="HEIC conversion settings"
          >
            <div className={styles.settingGroup}>
              <span className={styles.settingLabel}>Resize output</span>
              <div className={styles.segmentedControl}>
                {resizeModes.map((mode) => (
                  <button
                    type="button"
                    aria-pressed={resizeMode === mode.value}
                    onClick={() => changeResizeMode(mode.value)}
                    key={mode.value}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              {resizeMode !== "original" && (
                <label className={styles.field}>
                  <span>
                    {resizeMode === "percentage"
                      ? "Scale"
                      : resizeMode === "max-width"
                        ? "Maximum width"
                        : "Maximum long edge"}
                  </span>
                  <span className={styles.numberControl}>
                    <input
                      type="number"
                      min="1"
                      max={resizeMode === "percentage" ? 500 : 20000}
                      value={resizeValue}
                      onChange={(event) => {
                        clearResults();
                        setResizeValue(
                          Math.max(
                            1,
                            Math.min(
                              resizeMode === "percentage" ? 500 : 20000,
                              Number(event.target.value) || 1,
                            ),
                          ),
                        );
                      }}
                    />
                    <b>{resizeMode === "percentage" ? "%" : "px"}</b>
                  </span>
                </label>
              )}
              <div className={styles.checkboxRow}>
                <label>
                  <input
                    type="checkbox"
                    checked={preventUpscale}
                    onChange={(event) => {
                      clearResults();
                      setPreventUpscale(event.target.checked);
                    }}
                  />
                  Prevent upscaling
                </label>
              </div>
              <div className={styles.presetRow} aria-label="Resize presets">
                {[1280, 1920, 2560, 3840].map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => {
                      clearResults();
                      setResizeMode("max-long-edge");
                      setResizeValue(size);
                    }}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.outputSettings}>
              <label className={styles.field}>
                <span>Output format</span>
                <select
                  value={outputType}
                  onChange={(event) => {
                    clearResults();
                    setOutputType(event.target.value as HeicOutputMime);
                  }}
                >
                  {outputFormats.map((format) => (
                    <option value={format.value} key={format.value}>{format.label}</option>
                  ))}
                </select>
              </label>
              {outputType !== "image/png" && (
                <label className={`${styles.field} ${styles.rangeField}`}>
                  <span>Quality <b>{quality}%</b></span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(event) => {
                      clearResults();
                      setQuality(Number(event.target.value));
                    }}
                  />
                </label>
              )}
              {outputType === "image/jpeg" && (
                <label className={styles.field}>
                  <span>JPG background</span>
                  <span className={styles.colorControl}>
                    <input
                      type="color"
                      value={jpegBackground}
                      onChange={(event) => {
                        clearResults();
                        setJpegBackground(event.target.value);
                      }}
                    />
                    <code>{jpegBackground}</code>
                  </span>
                </label>
              )}
              <label className={styles.field}>
                <span>Filename suffix</span>
                <input
                  className={styles.textControl}
                  type="text"
                  value={suffix}
                  maxLength={40}
                  placeholder="converted"
                  onChange={(event) => {
                    clearResults();
                    setSuffix(event.target.value);
                  }}
                />
              </label>
            </div>
          </fieldset>

          <div className={styles.batchHeader}>
            <div>
              <strong>{items.length} photo{items.length === 1 ? "" : "s"}</strong>
              <span>{formatImageBytes(totalBytes)} total</span>
            </div>
            <button type="button" onClick={resetTool} disabled={isBusy}>Clear all</button>
          </div>

          <div className={styles.resultList}>
            {items.map((item) => (
              <div className={styles.resultItem} key={item.id}>
                {item.result ? (
                  <img
                    src={item.result.previewUrl}
                    alt={`Converted preview of ${item.file.name}`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className={styles.heicPlaceholder} aria-hidden="true">HEIC</div>
                )}
                <div className={styles.resultMeta}>
                  <strong>{item.file.name || "Pasted HEIC photo"}</strong>
                  <span>
                    {item.width && item.height
                      ? `${item.width.toLocaleString()} × ${item.height.toLocaleString()} · `
                      : ""}
                    {formatImageBytes(item.file.size)}
                  </span>
                  {item.result && (
                    <>
                      <span className={styles.resultSuccess}>
                        {item.result.width.toLocaleString()} × {item.result.height.toLocaleString()} · {formatImageBytes(item.result.blob.size)} · {item.result.mimeType.split("/")[1].toUpperCase()}
                      </span>
                      {item.result.safetyLimited && (
                        <span className={styles.resultWarning}>
                          Output was reduced to stay within this device&apos;s safe limit.
                        </span>
                      )}
                    </>
                  )}
                  {item.error && <span className={styles.resultError}>{item.error}</span>}
                </div>
                <div className={styles.itemActions}>
                  {item.result ? (
                    <a href={item.result.previewUrl} download={item.result.fileName}>Download</a>
                  ) : (
                    <span className={styles.statusPill}>{item.status}</span>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${item.file.name}`}
                    title="Remove"
                    disabled={isBusy}
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.statusArea} aria-live="polite">
            <p>{message}</p>
            {isBusy && (
              <div className={styles.progressTrack} aria-label="Conversion progress">
                <span style={{ width: `${Math.min(100, progress)}%` }} />
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {isBusy ? (
              <button type="button" className={styles.secondaryButton} onClick={cancelConversion}>
                Cancel
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void convertPhotos()}
              >
                Convert {items.length} photo{items.length === 1 ? "" : "s"}
              </button>
            )}
            {completedCount > 1 && !isBusy && (
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={isCreatingZip}
                onClick={() => void downloadZip()}
              >
                {isCreatingZip ? "Creating ZIP…" : `Download ZIP (${completedCount})`}
              </button>
            )}
          </div>
        </>
      )}

      <p className={styles.privacyNote}>
        Conversion runs locally in your browser. Photos are not uploaded. Image metadata is not copied to the new file.
      </p>
    </div>
  );
}
