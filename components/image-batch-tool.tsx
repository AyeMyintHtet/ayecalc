"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  MAX_BATCH_BYTES,
  MAX_BATCH_FILES,
  MAX_IMAGE_PIXELS,
  formatImageBytes,
  isAnimatedImage,
  isSupportedImageMime,
  resolveOutputMime,
  validateImageFileBasics,
  type ImageFileRecord,
  type ImageOperation,
  type ImageOutputFormat,
  type ImageProcessingRequest,
  type ImageProcessingResult,
  type SupportedImageMime,
} from "@/lib/image-tools";
import {
  cancelImageWorker,
  processImageWithWorker,
  WorkerProcessingError,
} from "@/lib/image-worker-client";
import styles from "@/components/image-tools.module.css";

type BatchMode = Extract<ImageOperation, "resize" | "compress" | "convert">;
type ResizeMode = "width" | "height" | "percentage" | "exact";

const modeCopy: Record<BatchMode, { eyebrow: string; title: string; action: string }> = {
  resize: {
    eyebrow: "Private batch image resizer",
    title: "Resize images in your browser",
    action: "Resize images",
  },
  compress: {
    eyebrow: "Private image compressor",
    title: "Reduce image file sizes",
    action: "Compress images",
  },
  convert: {
    eyebrow: "Private format converter",
    title: "Convert image formats",
    action: "Convert images",
  },
};

const outputFormats: Array<{ value: ImageOutputFormat; label: string }> = [
  { value: "original", label: "Keep original" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
];

function createRecordId() {
  return `image-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createJobId() {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ImageBatchTool({ mode }: { mode: BatchMode }) {
  const [items, setItems] = useState<ImageFileRecord[]>([]);
  const [rejections, setRejections] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Choose JPEG, PNG, or WebP images to begin.");
  const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>(
    mode === "convert" ? "image/webp" : "original",
  );
  const [quality, setQuality] = useState(80);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [targetEnabled, setTargetEnabled] = useState(false);
  const [targetKilobytes, setTargetKilobytes] = useState(200);
  const [resizeMode, setResizeMode] = useState<ResizeMode>("width");
  const [resizeWidth, setResizeWidth] = useState(1280);
  const [resizeHeight, setResizeHeight] = useState(720);
  const [resizePercentage, setResizePercentage] = useState(50);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [preventUpscale, setPreventUpscale] = useState(true);
  const [supportedOutputs, setSupportedOutputs] = useState<SupportedImageMime[]>([
    "image/png",
  ]);
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const isAddingRef = useRef(false);
  const runRef = useRef(0);
  const itemsRef = useRef(items);

  itemsRef.current = items;

  useEffect(() => {
    return () => {
      runRef.current += 1;
      cancelImageWorker(workerRef);
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        if (item.result) URL.revokeObjectURL(item.result.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    let active = true;
    void import("@/lib/image-processing").then(async ({ browserSupportsImageEncoding }) => {
      const checks = await Promise.all(
        (["image/png", "image/jpeg", "image/webp"] as SupportedImageMime[]).map(
          async (mimeType) => ({
            mimeType,
            supported: await browserSupportsImageEncoding(mimeType),
          }),
        ),
      );
      if (active) {
        setSupportedOutputs(
          checks.filter((check) => check.supported).map((check) => check.mimeType),
        );
      }
    });
    return () => {
      active = false;
    };
  }, [items.length > 0]);

  function clearResults() {
    setItems((current) =>
      current.map((item) => {
        if (item.result) URL.revokeObjectURL(item.result.previewUrl);
        return { ...item, result: undefined, error: undefined, status: "ready" };
      }),
    );
    setProgress(0);
    setMessage(items.length ? "Settings changed. Process the images again." : message);
  }

  async function addFiles(fileList: FileList | File[]) {
    if (isAddingRef.current || isBusy) return;
    isAddingRef.current = true;
    const candidates = Array.from(fileList);
    const accepted: ImageFileRecord[] = [];
    const errors: string[] = [];
    const currentItems = itemsRef.current;
    let totalBytes = currentItems.reduce((total, item) => total + item.file.size, 0);
    let remainingSlots = Math.max(0, MAX_BATCH_FILES - currentItems.length);

    for (const file of candidates) {
      if (remainingSlots === 0) {
        errors.push(`${file.name}: only ${MAX_BATCH_FILES} images can be processed at once.`);
        continue;
      }
      const basicError = validateImageFileBasics(file);
      if (basicError) {
        errors.push(`${file.name}: ${basicError}`);
        continue;
      }
      if (totalBytes + file.size > MAX_BATCH_BYTES) {
        errors.push(`${file.name}: the batch would exceed 75 MB.`);
        continue;
      }

      try {
        if (await isAnimatedImage(file)) {
          errors.push(`${file.name}: animated images are not supported.`);
          continue;
        }
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        const dimensions = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        if (
          dimensions.width === 0 ||
          dimensions.height === 0 ||
          dimensions.width * dimensions.height > MAX_IMAGE_PIXELS
        ) {
          errors.push(`${file.name}: use an image no larger than 25 megapixels.`);
          continue;
        }
        if (!isSupportedImageMime(file.type)) continue;

        accepted.push({
          id: createRecordId(),
          file,
          mimeType: file.type,
          width: dimensions.width,
          height: dimensions.height,
          previewUrl: URL.createObjectURL(file),
          status: "ready",
        });
        totalBytes += file.size;
        remainingSlots -= 1;
      } catch {
        errors.push(`${file.name}: the browser could not decode this image.`);
      }
    }

    if (accepted.length) {
      setItems((current) => [...current, ...accepted]);
      const first = currentItems[0] ?? accepted[0];
      if (mode === "resize" && currentItems.length === 0) {
        const suggestedWidth = Math.min(1280, first.width);
        setResizeWidth(suggestedWidth);
        setResizeHeight(Math.max(1, Math.round((first.height / first.width) * suggestedWidth)));
      }
      setMessage(`${accepted.length} image${accepted.length === 1 ? "" : "s"} ready to process.`);
    }
    setRejections(errors);
    if (inputRef.current) inputRef.current.value = "";
    isAddingRef.current = false;
  }

  function removeItem(id: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.result) URL.revokeObjectURL(target.result.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function resetTool() {
    runRef.current += 1;
    cancelImageWorker(workerRef);
    items.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      if (item.result) URL.revokeObjectURL(item.result.previewUrl);
    });
    setItems([]);
    setRejections([]);
    setIsBusy(false);
    setProgress(0);
    setMessage("Choose JPEG, PNG, or WebP images to begin.");
  }

  function cancelProcessing() {
    runRef.current += 1;
    cancelImageWorker(workerRef);
    setIsBusy(false);
    setItems((current) =>
      current.map((item) =>
        item.status === "processing" || item.status === "queued"
          ? { ...item, status: "ready" }
          : item,
      ),
    );
    setMessage("Processing cancelled. Completed results were kept.");
  }

  function getResizeDimensions(item: ImageFileRecord) {
    let width = item.width;
    let height = item.height;
    if (resizeMode === "percentage") {
      width = Math.round(item.width * (resizePercentage / 100));
      height = Math.round(item.height * (resizePercentage / 100));
    } else if (resizeMode === "width") {
      width = resizeWidth;
      height = Math.round((item.height / item.width) * width);
    } else if (resizeMode === "height") {
      height = resizeHeight;
      width = Math.round((item.width / item.height) * height);
    } else if (aspectLocked) {
      width = resizeWidth;
      height = Math.round((item.height / item.width) * width);
    } else {
      width = resizeWidth;
      height = resizeHeight;
    }

    if (preventUpscale) {
      const scale = Math.min(1, item.width / width, item.height / height);
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }
    return { width: Math.max(1, width), height: Math.max(1, height) };
  }

  function createRequest(item: ImageFileRecord, jobId: string): ImageProcessingRequest {
    const resolvedMime = resolveOutputMime(item.mimeType, outputFormat);
    const useTarget =
      mode === "compress" &&
      targetEnabled &&
      (resolvedMime === "image/jpeg" || resolvedMime === "image/webp");
    return {
      jobId,
      fileId: item.id,
      operation: mode,
      fileName: item.file.name,
      inputMimeType: item.mimeType,
      inputBytes: item.file.size,
      sourceWidth: item.width,
      sourceHeight: item.height,
      output: {
        format: outputFormat,
        quality: quality / 100,
        backgroundColor,
        targetBytes: useTarget ? Math.max(1, targetKilobytes) * 1024 : undefined,
      },
      resize: mode === "resize" ? getResizeDimensions(item) : undefined,
    };
  }

  async function processImages() {
    if (!items.length || isBusy) return;
    if (
      mode === "compress" &&
      targetEnabled &&
      items.some((item) => resolveOutputMime(item.mimeType, outputFormat) === "image/png")
    ) {
      setMessage("Target-size compression requires JPEG or WebP output.");
      return;
    }

    const run = ++runRef.current;
    const queue = [...items];
    setIsBusy(true);
    setRejections([]);
    setProgress(0);
    setMessage(`Preparing ${queue.length} image${queue.length === 1 ? "" : "s"}…`);
    setItems((current) =>
      current.map((item) => {
        if (item.result) URL.revokeObjectURL(item.result.previewUrl);
        return { ...item, result: undefined, error: undefined, status: "queued" };
      }),
    );

    let completed = 0;
    for (const item of queue) {
      if (run !== runRef.current) return;
      const jobId = createJobId();
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? { ...candidate, status: "processing" } : candidate,
        ),
      );
      setMessage(`Processing ${item.file.name}…`);
      const request = createRequest(item, jobId);

      try {
        let result: ImageProcessingResult;
        try {
          result = await processImageWithWorker(item.file, request, workerRef, (fileProgress) => {
            setProgress(((completed + fileProgress / 100) / queue.length) * 100);
          });
        } catch (error) {
          if (run !== runRef.current) return;
          if (
            error instanceof WorkerProcessingError &&
            !["unsupported", "encode", "worker"].includes(error.code)
          ) {
            throw error;
          }
          const { processImageOnMainThread } = await import("@/lib/image-processing");
          result = await processImageOnMainThread(item.file, request);
        }

        if (run !== runRef.current) return;
        const previewUrl = URL.createObjectURL(result.blob);
        setItems((current) =>
          current.map((candidate) =>
            candidate.id === item.id
              ? { ...candidate, status: "complete", result: { ...result, previewUrl } }
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
                  error: error instanceof Error ? error.message : "The image could not be processed.",
                }
              : candidate,
          ),
        );
      }

      completed += 1;
      setProgress((completed / queue.length) * 100);
    }

    if (run === runRef.current) {
      setIsBusy(false);
      setMessage("Processing complete. Inspect each result before downloading.");
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
        const key = files[result.fileName]
          ? `${index + 1}-${result.fileName}`
          : result.fileName;
        files[key] = new Uint8Array(await result.blob.arrayBuffer());
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
      anchor.download = `ayecalc-${mode}-images.zip`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setMessage("The ZIP could not be created. Download the results individually.");
    } finally {
      setIsCreatingZip(false);
    }
  }

  const completedCount = items.filter((item) => item.result).length;
  const showQuality =
    outputFormat === "image/jpeg" ||
    outputFormat === "image/webp" ||
    (outputFormat === "original" && items.some((item) => item.mimeType !== "image/png"));
  const showBackground = outputFormat === "image/jpeg";
  const hasUnsupportedOutput = items.some((item) =>
    !supportedOutputs.includes(resolveOutputMime(item.mimeType, outputFormat)),
  );
  const hasIncompatibleTarget =
    mode === "compress" &&
    targetEnabled &&
    items.some(
      (item) => resolveOutputMime(item.mimeType, outputFormat) === "image/png",
    );

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!isBusy) void addFiles(event.dataTransfer.files);
  }

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>{modeCopy[mode].eyebrow}</span>
          <h2>{modeCopy[mode].title}</h2>
        </div>
        <span className={styles.privacyBadge}>Images stay local</span>
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
          multiple
          disabled={isBusy || items.length >= MAX_BATCH_FILES}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.files) void addFiles(event.target.files);
          }}
        />
        <span className={styles.uploadIcon} aria-hidden="true">↑</span>
        <strong>{items.length ? "Add more images" : "Drop images here"}</strong>
        <p>JPEG, PNG, or WebP · up to 10 files, 15 MB each, and 25 megapixels</p>
        <button
          type="button"
          className={styles.chooseButton}
          disabled={isBusy || items.length >= MAX_BATCH_FILES}
          onClick={() => inputRef.current?.click()}
        >
          Choose images
        </button>
      </div>

      {rejections.length > 0 && (
        <div className={styles.errorList} role="alert">
          <strong>Some files were not added</strong>
          <ul>{rejections.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}

      {items.length > 0 && (
        <>
          <fieldset
            className={styles.settingsPanel}
            disabled={isBusy}
            aria-label={`${modeCopy[mode].title} settings`}
          >
            {mode === "resize" && (
              <div className={styles.settingGroup}>
                <span className={styles.settingLabel}>Resize method</span>
                <div className={styles.segmentedControl}>
                  {(["width", "height", "percentage", "exact"] as ResizeMode[]).map((value) => (
                    <button
                      type="button"
                      aria-pressed={resizeMode === value}
                      onClick={() => {
                        clearResults();
                        setResizeMode(value);
                      }}
                      key={value}
                    >
                      {value === "percentage" ? "Percent" : value[0].toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
                <div className={styles.dimensionGrid}>
                  {(resizeMode === "width" || resizeMode === "exact") && (
                    <NumberField label="Width" value={resizeWidth} unit="px" onChange={(value) => {
                      clearResults();
                      setResizeWidth(Math.max(1, value));
                      if (aspectLocked && items[0]) {
                        setResizeHeight(Math.max(1, Math.round((items[0].height / items[0].width) * value)));
                      }
                    }} />
                  )}
                  {(resizeMode === "height" || resizeMode === "exact") && (
                    <NumberField label="Height" value={resizeHeight} unit="px" onChange={(value) => {
                      clearResults();
                      setResizeHeight(Math.max(1, value));
                      if (aspectLocked && resizeMode === "exact" && items[0]) {
                        setResizeWidth(Math.max(1, Math.round((items[0].width / items[0].height) * value)));
                      }
                    }} />
                  )}
                  {resizeMode === "percentage" && (
                    <NumberField label="Scale" value={resizePercentage} unit="%" onChange={(value) => {
                      clearResults();
                      setResizePercentage(Math.max(1, Math.min(500, value)));
                    }} />
                  )}
                </div>
                <div className={styles.presetRow} aria-label="Resize presets">
                  {[320, 640, 1280, 1920].map((width) => (
                    <button type="button" onClick={() => {
                      clearResults();
                      setResizeMode("width");
                      setResizeWidth(width);
                    }} key={width}>{width}px</button>
                  ))}
                </div>
                <div className={styles.checkboxRow}>
                  {resizeMode === "exact" && (
                    <label><input type="checkbox" checked={aspectLocked} onChange={(event) => {
                      clearResults();
                      setAspectLocked(event.target.checked);
                    }} /> Lock aspect ratio</label>
                  )}
                  <label><input type="checkbox" checked={preventUpscale} onChange={(event) => {
                    clearResults();
                    setPreventUpscale(event.target.checked);
                  }} /> Prevent upscaling</label>
                </div>
              </div>
            )}

            <div className={styles.outputSettings}>
              <label className={styles.field}>
                <span>Output format</span>
                <select value={outputFormat} onChange={(event) => {
                  clearResults();
                  setOutputFormat(event.target.value as ImageOutputFormat);
                }}>
                  {outputFormats
                    .filter((format) => mode !== "convert" || format.value !== "original")
                    .map((format) => (
                      <option
                        value={format.value}
                        disabled={format.value !== "original" && !supportedOutputs.includes(format.value)}
                        key={format.value}
                      >
                        {format.label}
                      </option>
                    ))}
                </select>
                {hasUnsupportedOutput && (
                  <small className={styles.formatWarning}>
                    Choose an output format this browser can encode.
                  </small>
                )}
              </label>
              {showQuality && (
                <label className={`${styles.field} ${styles.rangeField}`}>
                  <span>Quality <b>{quality}%</b></span>
                  <input type="range" min="10" max="95" value={quality} onChange={(event) => {
                    clearResults();
                    setQuality(Number(event.target.value));
                  }} />
                </label>
              )}
              {showBackground && (
                <label className={styles.field}>
                  <span>JPEG background</span>
                  <span className={styles.colorControl}>
                    <input type="color" value={backgroundColor} onChange={(event) => {
                      clearResults();
                      setBackgroundColor(event.target.value);
                    }} />
                    <code>{backgroundColor}</code>
                  </span>
                </label>
              )}
              {mode === "compress" && (
                <div className={styles.targetControl}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={targetEnabled} onChange={(event) => {
                      clearResults();
                      setTargetEnabled(event.target.checked);
                    }} />
                    Target file size
                  </label>
                  {targetEnabled && (
                    <>
                      <NumberField label="Target" value={targetKilobytes} unit="KB" onChange={(value) => {
                        clearResults();
                        setTargetKilobytes(Math.max(1, value));
                      }} />
                      {hasIncompatibleTarget && (
                        <small className={styles.formatWarning}>
                          Target size is available only for JPEG and WebP output.
                        </small>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </fieldset>

          <div className={styles.batchHeader}>
            <div>
              <strong>{items.length} image{items.length === 1 ? "" : "s"}</strong>
              <span>{formatImageBytes(items.reduce((total, item) => total + item.file.size, 0))} total</span>
            </div>
            <button type="button" onClick={resetTool} disabled={isBusy}>Clear all</button>
          </div>

          <div className={styles.resultList}>
            {items.map((item) => (
              <article className={styles.resultItem} key={item.id}>
                <img src={item.result?.previewUrl ?? item.previewUrl} alt={`Preview of ${item.file.name}`} />
                <div className={styles.resultMeta}>
                  <strong>{item.file.name}</strong>
                  <span>{item.width} × {item.height}px · {formatImageBytes(item.file.size)}</span>
                  {item.result && (
                    <span className={styles.resultSuccess}>
                      {item.result.width} × {item.result.height}px · {formatImageBytes(item.result.bytes)}
                    </span>
                  )}
                  {item.status === "processing" && <span>Processing…</span>}
                  {item.error && <span className={styles.resultError}>{item.error}</span>}
                  {item.result?.warning && <span className={styles.resultWarning}>{item.result.warning}</span>}
                </div>
                <div className={styles.itemActions}>
                  {item.result ? (
                    <a href={item.result.previewUrl} download={item.result.fileName}>Download</a>
                  ) : (
                    <span className={styles.statusPill}>{item.status}</span>
                  )}
                  <button type="button" aria-label={`Remove ${item.file.name}`} disabled={isBusy} onClick={() => removeItem(item.id)}>×</button>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.statusArea} aria-live="polite" aria-atomic="true">
            <p>{message}</p>
            {isBusy && (
              <div className={styles.progressTrack} role="progressbar" aria-label="Batch progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                <span style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {isBusy ? (
              <button type="button" className={styles.secondaryButton} onClick={cancelProcessing}>Cancel processing</button>
            ) : (
              <button type="button" className={styles.primaryButton} disabled={hasUnsupportedOutput || hasIncompatibleTarget} onClick={processImages}>{modeCopy[mode].action}</button>
            )}
            {completedCount > 0 && !isBusy && (
              <button type="button" className={styles.secondaryButton} disabled={isCreatingZip} onClick={downloadZip}>
                {isCreatingZip ? "Creating ZIP…" : `Download ${completedCount} as ZIP`}
              </button>
            )}
          </div>

          <p className={styles.privacyNote}>
            Processing happens in this browser. Generated files remove EXIF and other embedded metadata; JPEG and WebP size can vary by browser.
          </p>
        </>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <span className={styles.numberControl}>
        <input type="number" min="1" value={value} onChange={(event) => onChange(Number(event.target.value))} />
        <b>{unit}</b>
      </span>
    </label>
  );
}

export function ImageResizer() {
  return <ImageBatchTool mode="resize" />;
}

export function ImageCompressor() {
  return <ImageBatchTool mode="compress" />;
}

export function ImageFormatConverter() {
  return <ImageBatchTool mode="convert" />;
}
