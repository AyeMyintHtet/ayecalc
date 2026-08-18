"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  MAX_IMAGE_PIXELS,
  createCenteredCrop,
  formatImageBytes,
  getRotatedDimensions,
  isAnimatedImage,
  isSupportedImageMime,
  validateImageFileBasics,
  type CropTransform,
  type ImageFileRecord,
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

type RatioId = "free" | "1:1" | "4:3" | "3:2" | "16:9" | "9:16";
type DragMode = "move" | "nw" | "ne" | "sw" | "se";

const ratios: Array<{ id: RatioId; label: string; value: number | null }> = [
  { id: "free", label: "Free", value: null },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "4:3", label: "4:3", value: 4 / 3 },
  { id: "3:2", label: "3:2", value: 3 / 2 },
  { id: "16:9", label: "16:9", value: 16 / 9 },
  { id: "9:16", label: "9:16", value: 9 / 16 },
];

const initialTransform: CropTransform = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  zoom: 1,
  rotation: 0,
  flipX: false,
  flipY: false,
};

function createRecordId() {
  return `crop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ImageCropper() {
  const [item, setItem] = useState<ImageFileRecord | null>(null);
  const [transform, setTransform] = useState(initialTransform);
  const [ratioId, setRatioId] = useState<RatioId>("free");
  const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>("original");
  const [quality, setQuality] = useState(90);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Choose a JPEG, PNG, or WebP image to begin.");
  const [previewSize, setPreviewSize] = useState({ width: 1, height: 1 });
  const [supportedOutputs, setSupportedOutputs] = useState<SupportedImageMime[]>([
    "image/png",
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const runRef = useRef(0);
  const itemRef = useRef(item);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    crop: CropTransform;
  } | null>(null);

  itemRef.current = item;

  useEffect(() => {
    return () => {
      runRef.current += 1;
      bitmapRef.current?.close();
      cancelImageWorker(workerRef);
      if (itemRef.current) {
        URL.revokeObjectURL(itemRef.current.previewUrl);
        if (itemRef.current.result) URL.revokeObjectURL(itemRef.current.result.previewUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (!item) return;
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
  }, [Boolean(item)]);

  const rotatedDimensions = item
    ? getRotatedDimensions(item.width, item.height, transform.rotation)
    : { width: 1, height: 1 };
  const activeRatio = ratios.find((ratio) => ratio.id === ratioId)?.value ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const bitmap = bitmapRef.current;
    if (!canvas || !bitmap || !item) return;

    const dimensions = getRotatedDimensions(item.width, item.height, transform.rotation);
    const scale = Math.min(760 / dimensions.width, 470 / dimensions.height, 1);
    const width = Math.max(1, Math.round(dimensions.width * scale));
    const height = Math.max(1, Math.round(dimensions.height * scale));
    canvas.width = width;
    canvas.height = height;
    setPreviewSize({ width, height });
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.save();
    context.translate(width / 2, height / 2);
    context.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
    context.rotate((transform.rotation * Math.PI) / 180);
    context.drawImage(
      bitmap,
      (-item.width * scale) / 2,
      (-item.height * scale) / 2,
      item.width * scale,
      item.height * scale,
    );
    context.restore();
  }, [item, transform.rotation, transform.flipX, transform.flipY]);

  function replaceResult(nextResult?: ImageProcessingResult & { previewUrl: string }) {
    setItem((current) => {
      if (!current) return current;
      if (current.result) URL.revokeObjectURL(current.result.previewUrl);
      return { ...current, result: nextResult, status: nextResult ? "complete" : "ready" };
    });
  }

  function invalidateResult() {
    replaceResult(undefined);
    setProgress(0);
  }

  async function selectFile(file: File) {
    const run = ++runRef.current;
    const basicError = validateImageFileBasics(file);
    if (basicError) {
      setMessage(basicError);
      return;
    }

    try {
      const isAnimated = await isAnimatedImage(file);
      if (run !== runRef.current) return;
      if (isAnimated) {
        setMessage("Animated images are not supported.");
        return;
      }
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      if (run !== runRef.current) {
        bitmap.close();
        return;
      }
      if (
        bitmap.width === 0 ||
        bitmap.height === 0 ||
        bitmap.width * bitmap.height > MAX_IMAGE_PIXELS
      ) {
        bitmap.close();
        setMessage("Use an image no larger than 25 megapixels.");
        return;
      }
      if (!isSupportedImageMime(file.type)) {
        bitmap.close();
        return;
      }

      bitmapRef.current?.close();
      bitmapRef.current = bitmap;
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
        if (item.result) URL.revokeObjectURL(item.result.previewUrl);
      }
      const crop = createCenteredCrop(bitmap.width, bitmap.height, null);
      setTransform({ ...initialTransform, ...crop });
      setRatioId("free");
      setItem({
        id: createRecordId(),
        file,
        mimeType: file.type,
        width: bitmap.width,
        height: bitmap.height,
        previewUrl: URL.createObjectURL(file),
        status: "ready",
      });
      setMessage("Image ready. Adjust the crop area and export when finished.");
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      if (run === runRef.current) {
        setMessage("The browser could not decode this image.");
      }
    }
  }

  function resetTool() {
    runRef.current += 1;
    cancelImageWorker(workerRef);
    bitmapRef.current?.close();
    bitmapRef.current = null;
    if (item) {
      URL.revokeObjectURL(item.previewUrl);
      if (item.result) URL.revokeObjectURL(item.result.previewUrl);
    }
    setItem(null);
    setTransform(initialTransform);
    setRatioId("free");
    setIsProcessing(false);
    setProgress(0);
    setMessage("Choose a JPEG, PNG, or WebP image to begin.");
  }

  function updateCrop(next: Partial<CropTransform>) {
    if (isProcessing) return;
    invalidateResult();
    setTransform((current) => {
      const merged = { ...current, ...next };
      const width = Math.max(1, Math.min(merged.width, rotatedDimensions.width));
      const height = Math.max(1, Math.min(merged.height, rotatedDimensions.height));
      return {
        ...merged,
        width,
        height,
        x: Math.max(0, Math.min(merged.x, rotatedDimensions.width - width)),
        y: Math.max(0, Math.min(merged.y, rotatedDimensions.height - height)),
      };
    });
  }

  function chooseRatio(nextRatioId: RatioId) {
    if (!item || isProcessing) return;
    invalidateResult();
    const ratio = ratios.find((candidate) => candidate.id === nextRatioId)?.value ?? null;
    const dimensions = getRotatedDimensions(item.width, item.height, transform.rotation);
    setRatioId(nextRatioId);
    setTransform((current) => ({
      ...current,
      ...createCenteredCrop(dimensions.width, dimensions.height, ratio),
    }));
  }

  function rotateImage() {
    if (!item || isProcessing) return;
    invalidateResult();
    const rotation = ((transform.rotation + 90) % 360) as CropTransform["rotation"];
    const dimensions = getRotatedDimensions(item.width, item.height, rotation);
    setTransform((current) => ({
      ...current,
      rotation,
      ...createCenteredCrop(dimensions.width, dimensions.height, activeRatio),
    }));
  }

  function resetCrop() {
    if (!item || isProcessing) return;
    invalidateResult();
    setRatioId("free");
    setTransform({
      ...initialTransform,
      ...createCenteredCrop(item.width, item.height, null),
    });
  }

  function beginPointerDrag(event: PointerEvent<HTMLDivElement>) {
    if (isProcessing) return;
    const handle = (event.target as HTMLElement).dataset.handle as DragMode | undefined;
    dragRef.current = {
      mode: handle ?? "move",
      startX: event.clientX,
      startY: event.clientY,
      crop: { ...transform },
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || !surface) return;
    const bounds = surface.getBoundingClientRect();
    const deltaX = ((event.clientX - drag.startX) / bounds.width) * rotatedDimensions.width;
    const deltaY = ((event.clientY - drag.startY) / bounds.height) * rotatedDimensions.height;

    if (drag.mode === "move") {
      updateCrop({ x: drag.crop.x + deltaX, y: drag.crop.y + deltaY });
      return;
    }

    const isWest = drag.mode.includes("w");
    const isNorth = drag.mode.includes("n");
    let width = isWest ? drag.crop.width - deltaX : drag.crop.width + deltaX;
    let height = isNorth ? drag.crop.height - deltaY : drag.crop.height + deltaY;
    width = Math.max(20, width);
    height = Math.max(20, height);

    if (activeRatio) {
      if (Math.abs(deltaX) >= Math.abs(deltaY * activeRatio)) height = width / activeRatio;
      else width = height * activeRatio;
    }

    const maxWidth = isWest ? drag.crop.x + drag.crop.width : rotatedDimensions.width - drag.crop.x;
    const maxHeight = isNorth ? drag.crop.y + drag.crop.height : rotatedDimensions.height - drag.crop.y;
    const scale = Math.min(1, maxWidth / width, maxHeight / height);
    width *= scale;
    height *= scale;
    updateCrop({
      width,
      height,
      x: isWest ? drag.crop.x + drag.crop.width - width : drag.crop.x,
      y: isNorth ? drag.crop.y + drag.crop.height - height : drag.crop.y,
    });
  }

  function handleCropKey(event: KeyboardEvent<HTMLDivElement>) {
    if (isProcessing) return;
    const amount = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowLeft") updateCrop({ x: transform.x - amount });
    else if (event.key === "ArrowRight") updateCrop({ x: transform.x + amount });
    else if (event.key === "ArrowUp") updateCrop({ y: transform.y - amount });
    else if (event.key === "ArrowDown") updateCrop({ y: transform.y + amount });
    else return;
    event.preventDefault();
  }

  async function exportCrop() {
    if (!item || isProcessing) return;
    const run = ++runRef.current;
    invalidateResult();
    setIsProcessing(true);
    setProgress(0);
    setMessage("Creating the cropped image…");
    const request: ImageProcessingRequest = {
      jobId: `crop-job-${Date.now()}`,
      fileId: item.id,
      operation: "crop",
      fileName: item.file.name,
      inputMimeType: item.mimeType,
      inputBytes: item.file.size,
      sourceWidth: item.width,
      sourceHeight: item.height,
      output: {
        format: outputFormat,
        quality: quality / 100,
        backgroundColor,
      },
      crop: transform,
    };

    try {
      let result: ImageProcessingResult;
      try {
        result = await processImageWithWorker(item.file, request, workerRef, setProgress);
      } catch (error) {
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
      replaceResult({ ...result, previewUrl });
      setProgress(100);
      setMessage("Crop complete. Inspect the result before downloading.");
    } catch (error) {
      if (run !== runRef.current) return;
      setMessage(error instanceof Error ? error.message : "The cropped image could not be created.");
    } finally {
      if (run === runRef.current) {
        setIsProcessing(false);
        workerRef.current = null;
      }
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFile(false);
    const file = event.dataTransfer.files[0];
    if (file && !isProcessing) void selectFile(file);
  }

  const selectionStyle = {
    left: `${(transform.x / rotatedDimensions.width) * 100}%`,
    top: `${(transform.y / rotatedDimensions.height) * 100}%`,
    width: `${(transform.width / rotatedDimensions.width) * 100}%`,
    height: `${(transform.height / rotatedDimensions.height) * 100}%`,
  };
  const resolvedOutput =
    outputFormat === "original" ? item?.mimeType : outputFormat;
  const hasUnsupportedOutput = Boolean(
    resolvedOutput && !supportedOutputs.includes(resolvedOutput),
  );

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>Private visual image cropper</span>
          <h2>Crop and transform an image</h2>
        </div>
        <span className={styles.privacyBadge}>Image stays local</span>
      </div>

      {!item ? (
        <div
          className={`${styles.dropZone} ${isDraggingFile ? styles.dragging : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            className={styles.fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (file) void selectFile(file);
            }}
          />
          <span className={styles.uploadIcon} aria-hidden="true">↑</span>
          <strong>Drop an image here</strong>
          <p>JPEG, PNG, or WebP · up to 15 MB and 25 megapixels</p>
          <button type="button" className={styles.chooseButton} onClick={() => inputRef.current?.click()}>Choose image</button>
        </div>
      ) : (
        <>
          <div className={styles.cropWorkspace}>
            <div className={styles.cropPreviewPanel}>
              <div className={styles.cropViewport}>
                <div
                  ref={surfaceRef}
                  className={styles.cropSurface}
                  style={{
                    width: previewSize.width,
                    height: previewSize.height,
                    transform: `scale(${transform.zoom})`,
                  }}
                >
                  <canvas ref={canvasRef} aria-label="Crop preview" />
                  <div
                    className={styles.cropSelection}
                    style={selectionStyle}
                    role="application"
                    tabIndex={0}
                    aria-label="Crop selection. Use arrow keys to move; hold Shift for ten pixels."
                    onKeyDown={handleCropKey}
                    onPointerDown={beginPointerDrag}
                    onPointerMove={movePointer}
                    onPointerUp={() => {
                      dragRef.current = null;
                    }}
                    onPointerCancel={() => {
                      dragRef.current = null;
                    }}
                  >
                    {(["nw", "ne", "sw", "se"] as DragMode[]).map((handle) => (
                      <span className={styles.cropHandle} data-handle={handle} aria-hidden="true" key={handle} />
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.cropToolbar}>
                <button type="button" disabled={isProcessing} onClick={rotateImage}>Rotate 90°</button>
                <button type="button" disabled={isProcessing} onClick={() => {
                  invalidateResult();
                  setTransform((current) => ({ ...current, flipX: !current.flipX }));
                }}>Flip horizontal</button>
                <button type="button" disabled={isProcessing} onClick={() => {
                  invalidateResult();
                  setTransform((current) => ({ ...current, flipY: !current.flipY }));
                }}>Flip vertical</button>
                <button type="button" disabled={isProcessing} onClick={resetCrop}>Reset crop</button>
              </div>
            </div>

            <fieldset className={styles.cropControlsPanel} disabled={isProcessing}>
              <div className={styles.cropControlGroup}>
                <span className={styles.cropPanelLabel}>Aspect ratio</span>
                <div className={styles.aspectButtons}>
                  {ratios.map((ratio) => (
                    <button type="button" aria-pressed={ratioId === ratio.id} onClick={() => chooseRatio(ratio.id)} key={ratio.id}>{ratio.label}</button>
                  ))}
                </div>
              </div>

              <div className={styles.cropControlGroup}>
                <span className={styles.cropPanelLabel}>Crop rectangle</span>
                <div className={styles.cropNumberGrid}>
                  <CropNumberField label="X" value={Math.round(transform.x)} max={rotatedDimensions.width - 1} onChange={(value) => updateCrop({ x: value })} />
                  <CropNumberField label="Y" value={Math.round(transform.y)} max={rotatedDimensions.height - 1} onChange={(value) => updateCrop({ y: value })} />
                  <CropNumberField label="Width" value={Math.round(transform.width)} max={rotatedDimensions.width - transform.x} onChange={(value) => updateCrop({ width: value })} />
                  <CropNumberField label="Height" value={Math.round(transform.height)} max={rotatedDimensions.height - transform.y} onChange={(value) => updateCrop({ height: value })} />
                </div>
              </div>

              <label className={`${styles.field} ${styles.rangeField}`}>
                <span>Editor zoom <b>{transform.zoom.toFixed(1)}×</b></span>
                <input type="range" min="1" max="3" step="0.1" value={transform.zoom} onChange={(event) => setTransform((current) => ({ ...current, zoom: Number(event.target.value) }))} />
              </label>

              <label className={styles.field}>
                <span>Output format</span>
                <select value={outputFormat} onChange={(event) => {
                  invalidateResult();
                  setOutputFormat(event.target.value as ImageOutputFormat);
                }}>
                  <option value="original">Keep original</option>
                  <option value="image/jpeg" disabled={!supportedOutputs.includes("image/jpeg")}>JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp" disabled={!supportedOutputs.includes("image/webp")}>WebP</option>
                </select>
                {hasUnsupportedOutput && (
                  <small className={styles.formatWarning}>
                    Choose an output format this browser can encode.
                  </small>
                )}
              </label>

              {resolvedOutput !== "image/png" && (
                <label className={`${styles.field} ${styles.rangeField}`}>
                  <span>Quality <b>{quality}%</b></span>
                  <input type="range" min="10" max="95" value={quality} onChange={(event) => {
                    invalidateResult();
                    setQuality(Number(event.target.value));
                  }} />
                </label>
              )}

              {resolvedOutput === "image/jpeg" && (
                <label className={styles.field}>
                  <span>JPEG background</span>
                  <span className={styles.colorControl}>
                    <input type="color" value={backgroundColor} onChange={(event) => {
                      invalidateResult();
                      setBackgroundColor(event.target.value);
                    }} />
                    <code>{backgroundColor}</code>
                  </span>
                </label>
              )}
            </fieldset>
          </div>

          {item.result && (
            <div className={styles.cropOutputPreview}>
              <figure>
                <figcaption>Original · {item.width} × {item.height}px</figcaption>
                <img src={item.previewUrl} alt={`Original ${item.file.name}`} />
              </figure>
              <figure>
                <figcaption>Crop · {item.result.width} × {item.result.height}px</figcaption>
                <img src={item.result.previewUrl} alt={`Cropped ${item.file.name}`} />
              </figure>
            </div>
          )}

          <div className={styles.statusArea} aria-live="polite" aria-atomic="true">
            <p>{message}</p>
            {isProcessing && (
              <div className={styles.progressTrack} role="progressbar" aria-label="Crop export progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                <span style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {item.result ? (
              <a className={styles.primaryButton} href={item.result.previewUrl} download={item.result.fileName}>Download cropped image</a>
            ) : (
              <button type="button" className={styles.primaryButton} disabled={isProcessing || hasUnsupportedOutput} onClick={exportCrop}>{isProcessing ? "Creating crop…" : "Create cropped image"}</button>
            )}
            <button type="button" className={styles.secondaryButton} onClick={resetTool}>{isProcessing ? "Cancel" : "Start over"}</button>
          </div>
          <p className={styles.privacyNote}>The image is processed locally. Export removes EXIF and other embedded metadata.</p>
        </>
      )}

      {!item && <div className={styles.statusArea} aria-live="polite"><p>{message}</p></div>}
    </div>
  );
}

function CropNumberField({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <span className={styles.numberControl}>
        <input type="number" min="0" max={Math.max(1, Math.round(max))} value={value} onChange={(event) => onChange(Number(event.target.value))} />
        <b>px</b>
      </span>
    </label>
  );
}
