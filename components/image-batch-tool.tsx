"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  MAX_BATCH_BYTES,
  MAX_BATCH_FILES,
  MAX_IMAGE_FILE_BYTES,
  MAX_IMAGE_PIXELS,
  formatImageBytes,
  formatImageMegapixels,
  getRuntimeImagePixelLimit,
  isAnimatedImage,
  isSupportedImageMime,
  resolveOutputMime,
  validateImageFileBasics,
  type ImageFileRecord,
  type ImageOutputFormat,
  type ImageProcessingResult,
  type SupportedImageMime,
} from "@/lib/image-tools";
import {
  cancelImageWorker,
  processImageWithWorker,
  WorkerProcessingError,
} from "@/lib/image-worker-client";
import {
  normalizeWatermarkText,
  type ImageWatermarkOptions,
  type WatermarkFontFamily,
  type WatermarkMode,
  type WatermarkPosition,
} from "@/lib/image-watermark";
import { drawImageWatermark } from "@/lib/image-processing-core";
import styles from "@/components/image-tools.module.css";

import {
  createBatchRequest,
  isBatchSettings,
  type BatchMode,
  type BatchSettings,
  type ResizeMode,
} from "@/lib/image-batch";
import BatchOutputSettings from "@/components/image-batch-output-settings";
import ImageBatchResults from "@/components/image-batch-results";
import SavedToolSettings from "@/components/saved-tool-settings";
import { takeStagedImage, type ImageDestination } from "@/lib/image-handoff";

type LogoFileRecord = {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
};

const MAX_WATERMARK_LOGO_BYTES = 10 * 1024 * 1024;
const MAX_WATERMARK_LOGO_PIXELS = 10_000_000;

const modeCopy: Record<
  BatchMode,
  { eyebrow: string; title: string; action: string }
> = {
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
  watermark: {
    eyebrow: "Private batch watermark tool",
    title: "Add watermarks to images",
    action: "Watermark images",
  },
};

const watermarkPositions: Array<{
  value: WatermarkPosition;
  label: string;
  symbol: string;
}> = [
  { value: "top-left", label: "Top left", symbol: "↖" },
  { value: "top-center", label: "Top center", symbol: "↑" },
  { value: "top-right", label: "Top right", symbol: "↗" },
  { value: "middle-left", label: "Middle left", symbol: "←" },
  { value: "center", label: "Center", symbol: "•" },
  { value: "middle-right", label: "Middle right", symbol: "→" },
  { value: "bottom-left", label: "Bottom left", symbol: "↙" },
  { value: "bottom-center", label: "Bottom center", symbol: "↓" },
  { value: "bottom-right", label: "Bottom right", symbol: "↘" },
];

function createRecordId() {
  return `image-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createJobId() {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isTextEntryTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

async function createBatchPreviewUrl(source: ImageBitmap, file: File) {
  const scale = Math.min(640 / source.width, 640 / source.height, 1);
  if (scale === 1) return URL.createObjectURL(file);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return URL.createObjectURL(file);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const previewBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.85),
  );
  return URL.createObjectURL(previewBlob ?? file);
}

export default function ImageBatchTool({ mode }: { mode: BatchMode }) {
  const [items, setItems] = useState<ImageFileRecord[]>([]);
  const [rejections, setRejections] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(
    mode === "watermark"
      ? "Paste, drop, or choose JPEG, PNG, or WebP images to begin."
      : "Choose JPEG, PNG, or WebP images to begin.",
  );
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
  const [supportedOutputs, setSupportedOutputs] = useState<
    SupportedImageMime[]
  >(["image/png"]);
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const [imagePixelLimit, setImagePixelLimit] = useState(MAX_IMAGE_PIXELS);
  const [watermarkMode, setWatermarkMode] = useState<WatermarkMode>("text");
  const [watermarkText, setWatermarkText] = useState("© AyeCalc");
  const [watermarkFont, setWatermarkFont] =
    useState<WatermarkFontFamily>("Arial");
  const [watermarkWeight, setWatermarkWeight] = useState<400 | 600 | 700>(700);
  const [watermarkColor, setWatermarkColor] = useState("#ffffff");
  const [watermarkOutlineColor, setWatermarkOutlineColor] = useState("#000000");
  const [watermarkOutlineWidth, setWatermarkOutlineWidth] = useState(8);
  const [watermarkOpacity, setWatermarkOpacity] = useState(65);
  const [watermarkSize, setWatermarkSize] = useState(7);
  const [watermarkRotation, setWatermarkRotation] = useState(0);
  const [watermarkPosition, setWatermarkPosition] =
    useState<WatermarkPosition>("bottom-right");
  const [watermarkMargin, setWatermarkMargin] = useState(3);
  const [watermarkTiled, setWatermarkTiled] = useState(false);
  const [watermarkGap, setWatermarkGap] = useState(12);
  const [logo, setLogo] = useState<LogoFileRecord | null>(null);
  const [isReadingClipboard, setIsReadingClipboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const watermarkPreviewCanvasRef = useRef<HTMLCanvasElement>(null);
  const watermarkPreviewImageRef = useRef<HTMLImageElement>(null);
  const watermarkPreviewLogoRef = useRef<HTMLImageElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const isAddingRef = useRef(false);
  const isBusyRef = useRef(isBusy);
  const addFilesRef = useRef<(files: File[]) => void>(() => undefined);
  const runRef = useRef(0);
  const itemsRef = useRef(items);
  const logoRef = useRef(logo);
  const [watermarkPreviewRevision, setWatermarkPreviewRevision] = useState(0);

  itemsRef.current = items;
  logoRef.current = logo;
  isBusyRef.current = isBusy;

  const watermarkOptions: ImageWatermarkOptions = useMemo(
    () => ({
      mode: watermarkMode,
      text: normalizeWatermarkText(watermarkText),
      fontFamily: watermarkFont,
      fontWeight: watermarkWeight,
      color: watermarkColor,
      outlineColor: watermarkOutlineColor,
      outlineWidthPercent: watermarkOutlineWidth,
      opacity: watermarkOpacity / 100,
      sizePercent: watermarkSize,
      rotation: watermarkRotation,
      position: watermarkPosition,
      marginPercent: watermarkMargin,
      tiled: watermarkTiled,
      gapPercent: watermarkGap,
      logoBlob: watermarkMode === "logo" ? logo?.file : undefined,
    }),
    [
      watermarkMode,
      watermarkText,
      watermarkFont,
      watermarkWeight,
      watermarkColor,
      watermarkOutlineColor,
      watermarkOutlineWidth,
      watermarkOpacity,
      watermarkSize,
      watermarkRotation,
      watermarkPosition,
      watermarkMargin,
      watermarkTiled,
      watermarkGap,
      logo?.file,
    ],
  );
  const watermarkPreviewItem = mode === "watermark" ? items[0] : undefined;
  const hasItems = items.length > 0;
  const destination: ImageDestination | undefined =
    mode === "resize"
      ? "/image-resizer"
      : mode === "compress"
        ? "/image-compressor"
        : mode === "convert"
          ? "/image-format-converter"
          : undefined;
  const batchSettings: BatchSettings = {
    outputFormat,
    quality,
    backgroundColor,
    targetEnabled,
    targetKilobytes,
    resizeMode,
    resizeWidth,
    resizeHeight,
    resizePercentage,
    aspectLocked,
    preventUpscale,
  };

  function updateBatchSettings(update: Partial<BatchSettings>) {
    clearResults();
    if (update.outputFormat !== undefined)
      setOutputFormat(
        mode === "convert" && update.outputFormat === "original"
          ? "image/webp"
          : update.outputFormat,
      );
    if (update.quality !== undefined) setQuality(update.quality);
    if (update.backgroundColor !== undefined)
      setBackgroundColor(update.backgroundColor);
    if (update.targetEnabled !== undefined)
      setTargetEnabled(update.targetEnabled);
    if (update.targetKilobytes !== undefined)
      setTargetKilobytes(update.targetKilobytes);
    if (update.resizeMode !== undefined) setResizeMode(update.resizeMode);
    if (update.resizeWidth !== undefined) setResizeWidth(update.resizeWidth);
    if (update.resizeHeight !== undefined) setResizeHeight(update.resizeHeight);
    if (update.resizePercentage !== undefined)
      setResizePercentage(update.resizePercentage);
    if (update.aspectLocked !== undefined) setAspectLocked(update.aspectLocked);
    if (update.preventUpscale !== undefined)
      setPreventUpscale(update.preventUpscale);
  }

  useEffect(() => {
    if (!destination) return;
    const frame = requestAnimationFrame(() => {
      const file = takeStagedImage(destination);
      if (file) addFilesRef.current([file]);
    });
    return () => cancelAnimationFrame(frame);
  }, [destination]);

  useEffect(() => {
    setImagePixelLimit(getRuntimeImagePixelLimit());
  }, []);

  useEffect(() => {
    if (mode !== "watermark") return;
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
  }, [mode]);

  useEffect(() => {
    return () => {
      runRef.current += 1;
      cancelImageWorker(workerRef);
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        if (item.result) URL.revokeObjectURL(item.result.previewUrl);
      });
      if (logoRef.current) URL.revokeObjectURL(logoRef.current.previewUrl);
    };
  }, []);

  useEffect(() => {
    if (!hasItems) return;
    let active = true;
    void import("@/lib/image-processing").then(
      async ({ browserSupportsImageEncoding }) => {
        const checks = await Promise.all(
          (
            ["image/png", "image/jpeg", "image/webp"] as SupportedImageMime[]
          ).map(async (mimeType) => ({
            mimeType,
            supported: await browserSupportsImageEncoding(mimeType),
          })),
        );
        if (active) {
          setSupportedOutputs(
            checks
              .filter((check) => check.supported)
              .map((check) => check.mimeType),
          );
        }
      },
    );
    return () => {
      active = false;
    };
  }, [hasItems]);

  useEffect(() => {
    if (mode !== "watermark" || !watermarkPreviewItem) return;

    const canvas = watermarkPreviewCanvasRef.current;
    const source = watermarkPreviewImageRef.current;
    if (!canvas || !source?.complete || !source.naturalWidth) return;

    canvas.width = source.naturalWidth;
    canvas.height = source.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    const previewLogo = watermarkPreviewLogoRef.current;
    const hasPreviewMark =
      watermarkMode === "text"
        ? Boolean(watermarkOptions.text)
        : Boolean(previewLogo?.complete && previewLogo.naturalWidth);

    if (hasPreviewMark) {
      drawImageWatermark(
        { canvas, context },
        watermarkOptions,
        watermarkMode === "logo" ? previewLogo : undefined,
      );
    }
  }, [
    mode,
    watermarkPreviewItem,
    watermarkPreviewRevision,
    watermarkMode,
    watermarkOptions,
    logo?.previewUrl,
  ]);

  function clearResults(
    nextMessage = "Settings changed. Process the images again.",
  ) {
    setItems((current) =>
      current.map((item) => {
        if (item.result) URL.revokeObjectURL(item.result.previewUrl);
        return {
          ...item,
          result: undefined,
          error: undefined,
          status: "ready",
        };
      }),
    );
    setProgress(0);
    setMessage(items.length ? nextMessage : message);
  }

  async function addFiles(fileList: FileList | File[]) {
    if (isAddingRef.current || isBusy) return;
    isAddingRef.current = true;
    const candidates = Array.from(fileList);
    const accepted: ImageFileRecord[] = [];
    const errors: string[] = [];
    const currentItems = itemsRef.current;
    let totalBytes = currentItems.reduce(
      (total, item) => total + item.file.size,
      0,
    );
    let remainingSlots = Math.max(0, MAX_BATCH_FILES - currentItems.length);

    for (const file of candidates) {
      if (remainingSlots === 0) {
        errors.push(
          `${file.name}: only ${MAX_BATCH_FILES} images can be processed at once.`,
        );
        continue;
      }
      const basicError = validateImageFileBasics(file);
      if (basicError) {
        errors.push(`${file.name}: ${basicError}`);
        continue;
      }
      if (totalBytes + file.size > MAX_BATCH_BYTES) {
        errors.push(
          `${file.name}: the batch would exceed ${formatImageBytes(MAX_BATCH_BYTES)}.`,
        );
        continue;
      }

      try {
        if (await isAnimatedImage(file)) {
          errors.push(`${file.name}: animated images are not supported.`);
          continue;
        }
        const bitmap = await createImageBitmap(file, {
          imageOrientation: "from-image",
        });
        try {
          const dimensions = { width: bitmap.width, height: bitmap.height };
          if (
            dimensions.width === 0 ||
            dimensions.height === 0 ||
            dimensions.width * dimensions.height > imagePixelLimit
          ) {
            errors.push(
              `${file.name}: use an image no larger than ${formatImageMegapixels(imagePixelLimit)}.`,
            );
            continue;
          }
          if (!isSupportedImageMime(file.type)) continue;

          accepted.push({
            id: createRecordId(),
            file,
            mimeType: file.type,
            width: dimensions.width,
            height: dimensions.height,
            previewUrl: await createBatchPreviewUrl(bitmap, file),
            status: "ready",
          });
          totalBytes += file.size;
          remainingSlots -= 1;
        } finally {
          bitmap.close();
        }
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
        setResizeHeight(
          Math.max(
            1,
            Math.round((first.height / first.width) * suggestedWidth),
          ),
        );
      }
      setMessage(
        `${accepted.length} image${accepted.length === 1 ? "" : "s"} ready to process.`,
      );
    }
    setRejections(errors);
    if (inputRef.current) inputRef.current.value = "";
    isAddingRef.current = false;
  }

  addFilesRef.current = (files) => {
    void addFiles(files);
  };

  async function pasteImages() {
    if (isBusy || isReadingClipboard) return;
    if (!navigator.clipboard?.read) {
      setRejections([
        "Clipboard access is unavailable in this browser. Drag images here or choose them from your device.",
      ]);
      return;
    }

    setIsReadingClipboard(true);
    try {
      const clipboardItems = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) =>
          ["image/jpeg", "image/png", "image/webp"].includes(type),
        );
        if (!imageType) continue;
        const blob = await item.getType(imageType);
        const extension =
          imageType === "image/png"
            ? "png"
            : imageType === "image/webp"
              ? "webp"
              : "jpg";
        files.push(
          new File([blob], `pasted-image-${files.length + 1}.${extension}`, {
            type: imageType,
          }),
        );
      }

      if (files.length) await addFiles(files);
      else
        setRejections([
          "The clipboard does not contain a JPEG, PNG, or WebP image.",
        ]);
    } catch {
      setRejections([
        "Clipboard permission was not granted. Drag images here or choose them from your device.",
      ]);
    } finally {
      setIsReadingClipboard(false);
    }
  }

  async function chooseLogo(file?: File) {
    if (!file || isBusy) return;
    const basicError = validateImageFileBasics(file, MAX_WATERMARK_LOGO_BYTES);
    if (basicError) {
      setRejections([`Watermark logo: ${basicError}`]);
      if (logoInputRef.current) logoInputRef.current.value = "";
      return;
    }

    try {
      if (await isAnimatedImage(file)) {
        setRejections(["Watermark logo: animated images are not supported."]);
        return;
      }
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      try {
        if (bitmap.width * bitmap.height > MAX_WATERMARK_LOGO_PIXELS) {
          setRejections([
            "Watermark logo: use an image no larger than 10 megapixels.",
          ]);
          return;
        }
        const previewUrl = URL.createObjectURL(file);
        setLogo((current) => {
          if (current) URL.revokeObjectURL(current.previewUrl);
          return {
            file,
            previewUrl,
            width: bitmap.width,
            height: bitmap.height,
          };
        });
        clearResults("Logo changed. Watermark the images again.");
        setRejections([]);
      } finally {
        bitmap.close();
      }
    } catch {
      setRejections([
        "Watermark logo: the browser could not decode this image.",
      ]);
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  function removeLogo() {
    setLogo((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    clearResults("Logo removed. Choose another logo before processing.");
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
    setMessage(
      mode === "watermark"
        ? "Paste, drop, or choose JPEG, PNG, or WebP images to begin."
        : "Choose JPEG, PNG, or WebP images to begin.",
    );
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

  async function processImages() {
    if (!items.length || isBusy) return;
    if (
      mode === "watermark" &&
      watermarkMode === "text" &&
      !normalizeWatermarkText(watermarkText)
    ) {
      setMessage("Enter watermark text before processing.");
      return;
    }
    if (mode === "watermark" && watermarkMode === "logo" && !logo) {
      setMessage("Choose a logo image before processing.");
      return;
    }
    if (
      mode === "compress" &&
      targetEnabled &&
      items.some(
        (item) =>
          resolveOutputMime(item.mimeType, outputFormat) === "image/png",
      )
    ) {
      setMessage("Target-size compression requires JPEG or WebP output.");
      return;
    }

    const run = ++runRef.current;
    const queue = [...items];
    setIsBusy(true);
    setRejections([]);
    setProgress(0);
    setMessage(
      `Preparing ${queue.length} image${queue.length === 1 ? "" : "s"}…`,
    );
    setItems((current) =>
      current.map((item) => {
        if (item.result) URL.revokeObjectURL(item.result.previewUrl);
        return {
          ...item,
          result: undefined,
          error: undefined,
          status: "queued",
        };
      }),
    );

    let completed = 0;
    for (const item of queue) {
      if (run !== runRef.current) return;
      const jobId = createJobId();
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id
            ? { ...candidate, status: "processing" }
            : candidate,
        ),
      );
      setMessage(`Processing ${item.file.name}…`);
      try {
        const request = createBatchRequest(
          item,
          jobId,
          mode,
          batchSettings,
          imagePixelLimit,
          watermarkOptions,
        );
        let result: ImageProcessingResult;
        try {
          result = await processImageWithWorker(
            item.file,
            request,
            workerRef,
            (fileProgress) => {
              setProgress(
                ((completed + fileProgress / 100) / queue.length) * 100,
              );
            },
          );
        } catch (error) {
          if (run !== runRef.current) return;
          if (
            error instanceof WorkerProcessingError &&
            !["unsupported", "encode", "worker"].includes(error.code)
          ) {
            throw error;
          }
          const { processImageOnMainThread } =
            await import("@/lib/image-processing");
          result = await processImageOnMainThread(item.file, request);
        }

        if (run !== runRef.current) return;
        const previewUrl = URL.createObjectURL(result.blob);
        setItems((current) =>
          current.map((candidate) =>
            candidate.id === item.id
              ? {
                  ...candidate,
                  status: "complete",
                  result: { ...result, previewUrl },
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
                      : "The image could not be processed.",
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
      setMessage(
        "Processing complete. Inspect each result before downloading.",
      );
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
      setMessage(
        "The ZIP could not be created. Download the results individually.",
      );
    } finally {
      setIsCreatingZip(false);
    }
  }

  const completedCount = items.filter((item) => item.result).length;
  const showQuality =
    outputFormat === "image/jpeg" ||
    outputFormat === "image/webp" ||
    (outputFormat === "original" &&
      items.some((item) => item.mimeType !== "image/png"));
  const showBackground = outputFormat === "image/jpeg";
  const hasUnsupportedOutput = items.some(
    (item) =>
      !supportedOutputs.includes(
        resolveOutputMime(item.mimeType, outputFormat),
      ),
  );
  const hasIncompatibleTarget =
    mode === "compress" &&
    targetEnabled &&
    items.some(
      (item) => resolveOutputMime(item.mimeType, outputFormat) === "image/png",
    );
  const hasInvalidWatermark =
    mode === "watermark" &&
    (watermarkMode === "text" ? !normalizeWatermarkText(watermarkText) : !logo);

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
        <span className={styles.uploadIcon} aria-hidden="true">
          ↑
        </span>
        <strong>{items.length ? "Add more images" : "Drop images here"}</strong>
        <p>
          {mode === "watermark"
            ? "Paste, drop, or upload JPEG, PNG, or WebP"
            : "JPEG, PNG, or WebP"}{" "}
          · up to {MAX_BATCH_FILES} files,{" "}
          {formatImageBytes(MAX_IMAGE_FILE_BYTES)} each, and{" "}
          {formatImageMegapixels(imagePixelLimit)}
          {imagePixelLimit < MAX_IMAGE_PIXELS ? " on this device" : ""}
        </p>
        <div className={styles.dropActions}>
          <button
            type="button"
            className={styles.chooseButton}
            disabled={isBusy || items.length >= MAX_BATCH_FILES}
            onClick={() => inputRef.current?.click()}
          >
            Choose images
          </button>
          {mode === "watermark" && (
            <button
              type="button"
              className={styles.chooseButton}
              disabled={
                isBusy || isReadingClipboard || items.length >= MAX_BATCH_FILES
              }
              onClick={() => void pasteImages()}
            >
              {isReadingClipboard ? "Reading clipboard…" : "Paste images"}
            </button>
          )}
        </div>
      </div>

      {rejections.length > 0 && (
        <div className={styles.errorList} role="alert">
          <strong>Some files were not added</strong>
          <ul>
            {rejections.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {items.length > 0 && (
        <>
          <fieldset
            className={styles.settingsPanel}
            disabled={isBusy}
            aria-label={`${modeCopy[mode].title} settings`}
          >
            {mode === "watermark" && watermarkPreviewItem && (
              <figure className={styles.watermarkLivePreview}>
                <div className={styles.watermarkPreviewHeader}>
                  <strong>Live preview</strong>
                  <span title={watermarkPreviewItem.file.name}>
                    First image · {watermarkPreviewItem.file.name}
                  </span>
                </div>
                <div className={styles.watermarkPreviewViewport}>
                  <canvas
                    ref={watermarkPreviewCanvasRef}
                    className={styles.watermarkPreviewCanvas}
                    role="img"
                    aria-label={`Watermark preview for ${watermarkPreviewItem.file.name}`}
                  />
                  <img
                    ref={watermarkPreviewImageRef}
                    className={styles.watermarkPreviewAsset}
                    src={watermarkPreviewItem.previewUrl}
                    alt=""
                    aria-hidden="true"
                    onLoad={() =>
                      setWatermarkPreviewRevision((current) => current + 1)
                    }
                  />
                  {logo && (
                    <img
                      ref={watermarkPreviewLogoRef}
                      className={styles.watermarkPreviewAsset}
                      src={logo.previewUrl}
                      alt=""
                      aria-hidden="true"
                      onLoad={() =>
                        setWatermarkPreviewRevision((current) => current + 1)
                      }
                    />
                  )}
                </div>
                <figcaption>
                  Preview only. The same settings are applied to every image
                  when you process the batch.
                </figcaption>
              </figure>
            )}

            {mode === "resize" && (
              <div className={styles.settingGroup}>
                <span className={styles.settingLabel}>Resize method</span>
                <div className={styles.segmentedControl}>
                  {(
                    ["width", "height", "percentage", "exact"] as ResizeMode[]
                  ).map((value) => (
                    <button
                      type="button"
                      aria-pressed={resizeMode === value}
                      onClick={() => {
                        clearResults();
                        setResizeMode(value);
                      }}
                      key={value}
                    >
                      {value === "percentage"
                        ? "Percent"
                        : value[0].toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
                <div className={styles.dimensionGrid}>
                  {(resizeMode === "width" || resizeMode === "exact") && (
                    <NumberField
                      label="Width"
                      value={resizeWidth}
                      unit="px"
                      onChange={(value) => {
                        clearResults();
                        setResizeWidth(Math.max(1, value));
                        if (aspectLocked && items[0]) {
                          setResizeHeight(
                            Math.max(
                              1,
                              Math.round(
                                (items[0].height / items[0].width) * value,
                              ),
                            ),
                          );
                        }
                      }}
                    />
                  )}
                  {(resizeMode === "height" || resizeMode === "exact") && (
                    <NumberField
                      label="Height"
                      value={resizeHeight}
                      unit="px"
                      onChange={(value) => {
                        clearResults();
                        setResizeHeight(Math.max(1, value));
                        if (
                          aspectLocked &&
                          resizeMode === "exact" &&
                          items[0]
                        ) {
                          setResizeWidth(
                            Math.max(
                              1,
                              Math.round(
                                (items[0].width / items[0].height) * value,
                              ),
                            ),
                          );
                        }
                      }}
                    />
                  )}
                  {resizeMode === "percentage" && (
                    <NumberField
                      label="Scale"
                      value={resizePercentage}
                      unit="%"
                      onChange={(value) => {
                        clearResults();
                        setResizePercentage(Math.max(1, Math.min(500, value)));
                      }}
                    />
                  )}
                </div>
                <div className={styles.presetRow} aria-label="Resize presets">
                  {[320, 640, 1280, 1920].map((width) => (
                    <button
                      type="button"
                      onClick={() => {
                        clearResults();
                        setResizeMode("width");
                        setResizeWidth(width);
                      }}
                      key={width}
                    >
                      {width}px
                    </button>
                  ))}
                </div>
                <div className={styles.checkboxRow}>
                  {resizeMode === "exact" && (
                    <label>
                      <input
                        type="checkbox"
                        checked={aspectLocked}
                        onChange={(event) => {
                          clearResults();
                          setAspectLocked(event.target.checked);
                        }}
                      />{" "}
                      Lock aspect ratio
                    </label>
                  )}
                  <label>
                    <input
                      type="checkbox"
                      checked={preventUpscale}
                      onChange={(event) => {
                        clearResults();
                        setPreventUpscale(event.target.checked);
                      }}
                    />{" "}
                    Prevent upscaling
                  </label>
                </div>
              </div>
            )}

            {mode === "watermark" && (
              <div className={styles.settingGroup}>
                <span className={styles.settingLabel}>Watermark</span>
                <div
                  className={`${styles.segmentedControl} ${styles.watermarkModeControl}`}
                >
                  {(["text", "logo"] as WatermarkMode[]).map((value) => (
                    <button
                      type="button"
                      aria-pressed={watermarkMode === value}
                      onClick={() => {
                        clearResults();
                        setWatermarkMode(value);
                        setWatermarkSize(value === "text" ? 7 : 22);
                      }}
                      key={value}
                    >
                      {value === "text" ? "Text watermark" : "Logo watermark"}
                    </button>
                  ))}
                </div>

                {watermarkMode === "text" ? (
                  <>
                    <label className={styles.field}>
                      <span>Watermark text</span>
                      <input
                        className={styles.textControl}
                        type="text"
                        maxLength={120}
                        value={watermarkText}
                        placeholder="© Your brand"
                        aria-invalid={!normalizeWatermarkText(watermarkText)}
                        aria-describedby={
                          normalizeWatermarkText(watermarkText)
                            ? undefined
                            : "watermark-text-error"
                        }
                        onChange={(event) => {
                          clearResults();
                          setWatermarkText(event.target.value);
                        }}
                      />
                      {!normalizeWatermarkText(watermarkText) && (
                        <small
                          id="watermark-text-error"
                          className={styles.formatWarning}
                        >
                          Enter text before watermarking the images.
                        </small>
                      )}
                    </label>
                    <div className={styles.dimensionGrid}>
                      <label className={styles.field}>
                        <span>Font</span>
                        <select
                          value={watermarkFont}
                          onChange={(event) => {
                            clearResults();
                            setWatermarkFont(
                              event.target.value as WatermarkFontFamily,
                            );
                          }}
                        >
                          <option value="Arial">Arial</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Trebuchet MS">Trebuchet MS</option>
                        </select>
                      </label>
                      <label className={styles.field}>
                        <span>Weight</span>
                        <select
                          value={watermarkWeight}
                          onChange={(event) => {
                            clearResults();
                            setWatermarkWeight(
                              Number(event.target.value) as 400 | 600 | 700,
                            );
                          }}
                        >
                          <option value="400">Regular</option>
                          <option value="600">Semi-bold</option>
                          <option value="700">Bold</option>
                        </select>
                      </label>
                      <label className={styles.field}>
                        <span>Text color</span>
                        <span className={styles.colorControl}>
                          <input
                            type="color"
                            value={watermarkColor}
                            onChange={(event) => {
                              clearResults();
                              setWatermarkColor(event.target.value);
                            }}
                          />
                          <code>{watermarkColor}</code>
                        </span>
                      </label>
                      <label className={styles.field}>
                        <span>Outline color</span>
                        <span className={styles.colorControl}>
                          <input
                            type="color"
                            value={watermarkOutlineColor}
                            onChange={(event) => {
                              clearResults();
                              setWatermarkOutlineColor(event.target.value);
                            }}
                          />
                          <code>{watermarkOutlineColor}</code>
                        </span>
                      </label>
                    </div>
                    <label className={`${styles.field} ${styles.rangeField}`}>
                      <span>
                        Outline width <b>{watermarkOutlineWidth}%</b>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={watermarkOutlineWidth}
                        onChange={(event) => {
                          clearResults();
                          setWatermarkOutlineWidth(Number(event.target.value));
                        }}
                      />
                    </label>
                  </>
                ) : (
                  <div className={styles.logoPicker}>
                    <input
                      ref={logoInputRef}
                      className={styles.fileInput}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        void chooseLogo(event.target.files?.[0])
                      }
                    />
                    {logo ? (
                      <div className={styles.logoPreview}>
                        <img
                          src={logo.previewUrl}
                          alt="Selected watermark logo"
                        />
                        <div className={styles.logoMeta}>
                          <strong>{logo.file.name}</strong>
                          <span>
                            {logo.width} × {logo.height}px ·{" "}
                            {formatImageBytes(logo.file.size)}
                          </span>
                          <div className={styles.logoActions}>
                            <button
                              type="button"
                              onClick={() => logoInputRef.current?.click()}
                            >
                              Replace
                            </button>
                            <button type="button" onClick={removeLogo}>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.logoChooseButton}
                        onClick={() => logoInputRef.current?.click()}
                      >
                        Choose a transparent PNG, JPEG, or WebP logo
                      </button>
                    )}
                    <small>
                      Up to 10 MB and 10 megapixels. Transparent PNG works best.
                    </small>
                  </div>
                )}

                <div className={styles.dimensionGrid}>
                  <label className={`${styles.field} ${styles.rangeField}`}>
                    <span>
                      Opacity <b>{watermarkOpacity}%</b>
                    </span>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={watermarkOpacity}
                      onChange={(event) => {
                        clearResults();
                        setWatermarkOpacity(Number(event.target.value));
                      }}
                    />
                  </label>
                  <label className={`${styles.field} ${styles.rangeField}`}>
                    <span>
                      Size <b>{watermarkSize}%</b>
                    </span>
                    <input
                      type="range"
                      min={watermarkMode === "text" ? 1 : 2}
                      max={watermarkMode === "text" ? 40 : 90}
                      value={watermarkSize}
                      onChange={(event) => {
                        clearResults();
                        setWatermarkSize(Number(event.target.value));
                      }}
                    />
                  </label>
                  <label className={`${styles.field} ${styles.rangeField}`}>
                    <span>
                      Rotation <b>{watermarkRotation}°</b>
                    </span>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={watermarkRotation}
                      onChange={(event) => {
                        clearResults();
                        setWatermarkRotation(Number(event.target.value));
                      }}
                    />
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={watermarkTiled}
                      onChange={(event) => {
                        clearResults();
                        setWatermarkTiled(event.target.checked);
                      }}
                    />
                    Tile across image
                  </label>
                </div>

                {watermarkTiled ? (
                  <label className={`${styles.field} ${styles.rangeField}`}>
                    <span>
                      Tile gap <b>{watermarkGap}%</b>
                    </span>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      value={watermarkGap}
                      onChange={(event) => {
                        clearResults();
                        setWatermarkGap(Number(event.target.value));
                      }}
                    />
                  </label>
                ) : (
                  <div className={styles.watermarkPlacement}>
                    <span className={styles.settingLabel}>Placement</span>
                    <div className={styles.watermarkPositionGrid}>
                      {watermarkPositions.map((position) => (
                        <button
                          type="button"
                          aria-label={position.label}
                          title={position.label}
                          aria-pressed={watermarkPosition === position.value}
                          onClick={() => {
                            clearResults();
                            setWatermarkPosition(position.value);
                          }}
                          key={position.value}
                        >
                          {position.symbol}
                        </button>
                      ))}
                    </div>
                    <label className={`${styles.field} ${styles.rangeField}`}>
                      <span>
                        Edge margin <b>{watermarkMargin}%</b>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={watermarkMargin}
                        onChange={(event) => {
                          clearResults();
                          setWatermarkMargin(Number(event.target.value));
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            <BatchOutputSettings
              mode={mode}
              settings={batchSettings}
              onChange={updateBatchSettings}
              supportedOutputs={supportedOutputs}
              showQuality={showQuality}
              showBackground={showBackground}
              hasUnsupportedOutput={hasUnsupportedOutput}
              hasIncompatibleTarget={hasIncompatibleTarget}
            />
            <SavedToolSettings
              tool={`image-${mode}`}
              value={batchSettings}
              validate={isBatchSettings}
              onRestore={updateBatchSettings}
            />
          </fieldset>

          <div className={styles.batchHeader}>
            <div>
              <strong>
                {items.length} image{items.length === 1 ? "" : "s"}
              </strong>
              <span>
                {formatImageBytes(
                  items.reduce((total, item) => total + item.file.size, 0),
                )}{" "}
                total
              </span>
            </div>
            <button type="button" onClick={resetTool} disabled={isBusy}>
              Clear all
            </button>
          </div>

          <ImageBatchResults
            items={items}
            isBusy={isBusy}
            onRemove={removeItem}
            current={destination}
          />

          <div
            className={styles.statusArea}
            aria-live="polite"
            aria-atomic="true"
          >
            <p>{message}</p>
            {isBusy && (
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label="Batch progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {isBusy ? (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={cancelProcessing}
              >
                Cancel processing
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                disabled={
                  hasUnsupportedOutput ||
                  hasIncompatibleTarget ||
                  hasInvalidWatermark
                }
                onClick={processImages}
              >
                {modeCopy[mode].action}
              </button>
            )}
            {completedCount > 0 && !isBusy && (
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={isCreatingZip}
                onClick={downloadZip}
              >
                {isCreatingZip
                  ? "Creating ZIP…"
                  : `Download ${completedCount} as ZIP`}
              </button>
            )}
          </div>

          <p className={styles.privacyNote}>
            Processing happens in this browser. Generated files remove EXIF and
            other embedded metadata; JPEG and WebP size can vary by browser.
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
        <input
          type="number"
          min="1"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
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

export function BatchWatermarkImages() {
  return <ImageBatchTool mode="watermark" />;
}
