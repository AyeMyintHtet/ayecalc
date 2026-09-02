"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  AI_IMAGE_SCANNER_MODEL_SIZE,
  MAX_AI_SCAN_FILE_BYTES,
  MAX_AI_SCAN_PIXELS,
  formatLikelihood,
  getAiImageVerdict,
  type AiImageLikelihoods,
  type AiImageVerdict,
} from "@/lib/ai-image-scanner";
import {
  formatImageBytes,
  formatImageMegapixels,
  getRuntimeImagePixelLimit,
  isAnimatedImage,
  validateImageFileBasics,
} from "@/lib/image-tools";
import styles from "@/components/ai-image-scanner.module.css";

type Dimensions = { width: number; height: number };
type ScannerStatus =
  | "idle"
  | "ready"
  | "loading-model"
  | "scanning"
  | "complete"
  | "error";

type WorkerMessage =
  | { type: "status"; status: "loading-model" | "scanning" }
  | { type: "progress"; progress: number }
  | { type: "complete"; likelihoods: AiImageLikelihoods }
  | { type: "error"; message: string };

const verdictCopy: Record<
  AiImageVerdict,
  { eyebrow: string; title: string; description: string }
> = {
  "likely-ai": {
    eyebrow: "AI pattern detected",
    title: "Likely AI-generated",
    description:
      "The model found stronger visual patterns associated with synthetic images.",
  },
  "likely-real": {
    eyebrow: "Camera-like pattern detected",
    title: "Likely not AI-generated",
    description:
      "The model found stronger visual patterns associated with real images.",
  },
  inconclusive: {
    eyebrow: "Uncertain model result",
    title: "Inconclusive",
    description:
      "The scores are too close for a responsible likely-AI or likely-real result.",
  },
};

export default function AiImageScanner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AiImageLikelihoods | null>(null);
  const [message, setMessage] = useState(
    "Choose a JPEG, PNG, or WebP image to begin.",
  );
  const [isDragging, setIsDragging] = useState(false);
  const [imagePixelLimit, setImagePixelLimit] = useState(MAX_AI_SCAN_PIXELS);
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const previewUrlRef = useRef("");
  const operationRef = useRef(0);

  const isBusy = status === "loading-model" || status === "scanning";
  const verdict = result ? getAiImageVerdict(result.ai) : null;

  useEffect(() => {
    setImagePixelLimit(getRuntimeImagePixelLimit(MAX_AI_SCAN_PIXELS));
  }, []);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function replacePreviewUrl(nextUrl: string) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }

  function stopWorker() {
    workerRef.current?.terminate();
    workerRef.current = null;
  }

  function setError(errorMessage: string) {
    setStatus("error");
    setProgress(0);
    setMessage(errorMessage);
  }

  function resetScanner() {
    operationRef.current += 1;
    stopWorker();
    setSelectedFile(null);
    setDimensions(null);
    replacePreviewUrl("");
    setStatus("idle");
    setProgress(0);
    setResult(null);
    setMessage("Choose a JPEG, PNG, or WebP image to begin.");
    setIsDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function selectFile(file: File) {
    if (isBusy) return;
    const operation = ++operationRef.current;
    const basicError = validateImageFileBasics(file, MAX_AI_SCAN_FILE_BYTES);
    if (basicError) {
      setError(basicError);
      return;
    }

    try {
      if (await isAnimatedImage(file)) {
        setError("Animated images are not supported. Choose a single-frame image.");
        return;
      }

      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      const nextDimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();

      if (operation !== operationRef.current) return;
      if (
        nextDimensions.width === 0 ||
        nextDimensions.height === 0 ||
        nextDimensions.width * nextDimensions.height > imagePixelLimit
      ) {
        setError(
          `Choose an image no larger than ${formatImageMegapixels(imagePixelLimit)}.`,
        );
        return;
      }

      setSelectedFile(file);
      setDimensions(nextDimensions);
      replacePreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setProgress(0);
      setStatus("ready");
      setMessage("Image ready. Start the scan when you are ready.");
    } catch {
      setError("The browser could not decode this image. Try another file.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void selectFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && !isBusy) void selectFile(file);
  }

  function createWorker() {
    const worker = new Worker(
      new URL("../workers/ai-image-scanner.worker.ts", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const workerMessage = event.data;

      if (workerMessage.type === "status") {
        setStatus(workerMessage.status);
        if (workerMessage.status === "scanning") {
          setProgress((current) => Math.max(current, 95));
        }
        setMessage(
          workerMessage.status === "loading-model"
            ? "Loading the AI image detection model…"
            : "Scanning visual patterns in the image…",
        );
        return;
      }

      if (workerMessage.type === "progress") {
        setProgress(workerMessage.progress);
        return;
      }

      if (workerMessage.type === "error") {
        setError(
          "The scan failed. Check the connection for the first-use model download, then try again.",
        );
        return;
      }

      setResult(workerMessage.likelihoods);
      setStatus("complete");
      setProgress(100);
      setMessage("Scan complete. Treat this result as an estimate, not proof.");
    };

    worker.onerror = () => {
      stopWorker();
      setError("The image-scanning worker stopped unexpectedly. Try again.");
    };

    workerRef.current = worker;
    return worker;
  }

  async function scanImage() {
    if (!selectedFile || isBusy) return;
    const operation = ++operationRef.current;
    setResult(null);
    setStatus("loading-model");
    setProgress(0);
    setMessage("Preparing the browser model…");

    try {
      const buffer = await selectedFile.arrayBuffer();
      if (operation !== operationRef.current) return;
      const worker = workerRef.current ?? createWorker();
      worker.postMessage(
        { type: "scan", buffer, mimeType: selectedFile.type },
        [buffer],
      );
    } catch {
      setError("The browser could not read this image. Try choosing it again.");
    }
  }

  function cancelScan() {
    operationRef.current += 1;
    stopWorker();
    setStatus(selectedFile ? "ready" : "idle");
    setProgress(0);
    setMessage("Scan cancelled. You can start again when ready.");
  }

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>Browser-based visual classifier</span>
          <h2>Scan an image for AI patterns</h2>
        </div>
        <span className={styles.privacyBadge}>Image stays local</span>
      </div>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ""} ${
          selectedFile ? styles.compactDropZone : ""
        }`}
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
          disabled={isBusy}
          onChange={handleFileChange}
        />
        <span className={styles.uploadIcon} aria-hidden="true">⌁</span>
        <div>
          <strong>{selectedFile ? "Choose a different image" : "Drop an image here"}</strong>
          <p>
            JPEG, PNG, or WebP · up to {formatImageBytes(MAX_AI_SCAN_FILE_BYTES)} and {formatImageMegapixels(imagePixelLimit)}
          </p>
        </div>
        <button
          type="button"
          className={styles.chooseButton}
          disabled={isBusy}
          onClick={() => inputRef.current?.click()}
        >
          Choose image
        </button>
      </div>

      {selectedFile && dimensions && previewUrl && (
        <div className={styles.scanWorkspace}>
          <figure className={styles.imagePanel}>
            <div className={styles.imageFrame}>
              <img src={previewUrl} alt={`Selected image: ${selectedFile.name}`} />
            </div>
            <figcaption>
              <strong title={selectedFile.name}>{selectedFile.name}</strong>
              <span>{dimensions.width} × {dimensions.height}px · {formatImageBytes(selectedFile.size)}</span>
            </figcaption>
          </figure>

          <section className={styles.analysisPanel} aria-live="polite" aria-atomic="true">
            {result && verdict ? (
              <ResultPanel likelihoods={result} verdict={verdict} />
            ) : (
              <div className={styles.readyState}>
                <span aria-hidden="true">◎</span>
                <div>
                  <strong>{isBusy ? "Scanning image" : "Ready to scan"}</strong>
                  <p>
                    The model checks pixel patterns and returns a cautious likelihood estimate.
                  </p>
                </div>
              </div>
            )}

            <div className={styles.statusArea}>
              <p className={status === "error" ? styles.error : undefined}>{message}</p>
              {isBusy && (
                <div
                  className={styles.progressTrack}
                  role="progressbar"
                  aria-label="Scanner progress"
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
                <button type="button" className={styles.secondaryButton} onClick={cancelScan}>
                  Cancel scan
                </button>
              ) : (
                <button type="button" className={styles.primaryButton} onClick={() => void scanImage()}>
                  {result ? "Scan again" : "Scan image"}
                </button>
              )}
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={isBusy}
                onClick={resetScanner}
              >
                Clear
              </button>
            </div>
          </section>
        </div>
      )}

      {!selectedFile && status === "error" && (
        <p className={styles.standaloneError} role="alert">{message}</p>
      )}

      <div className={styles.disclosureGrid}>
        <div>
          <span aria-hidden="true">◌</span>
          <p><strong>Private image processing</strong>The selected image is analyzed inside this browser and is not uploaded for inference.</p>
        </div>
        <div>
          <span aria-hidden="true">↓</span>
          <p><strong>First-use download</strong>The first scan downloads a quantized model of {AI_IMAGE_SCANNER_MODEL_SIZE}, plus browser runtime files.</p>
        </div>
        <div>
          <span aria-hidden="true">!</span>
          <p><strong>Not definitive proof</strong>Compression, editing, screenshots, and unfamiliar generators can produce incorrect results.</p>
        </div>
      </div>
    </div>
  );
}

function ResultPanel({
  likelihoods,
  verdict,
}: {
  likelihoods: AiImageLikelihoods;
  verdict: AiImageVerdict;
}) {
  const copy = verdictCopy[verdict];

  return (
    <div className={`${styles.resultPanel} ${styles[verdict]}`}>
      <span className={styles.resultEyebrow}>{copy.eyebrow}</span>
      <h3>{copy.title}</h3>
      <p>{copy.description}</p>

      <div className={styles.scoreList}>
        <div>
          <span><strong>AI-generated likelihood</strong><b>{formatLikelihood(likelihoods.ai)}</b></span>
          <div className={styles.scoreTrack}><i style={{ width: formatLikelihood(likelihoods.ai) }} /></div>
        </div>
        <div>
          <span><strong>Real-image likelihood</strong><b>{formatLikelihood(likelihoods.real)}</b></span>
          <div className={styles.scoreTrack}><i style={{ width: formatLikelihood(likelihoods.real) }} /></div>
        </div>
      </div>

      <small>
        These percentages are model scores, not verified probabilities of authorship.
      </small>
    </div>
  );
}
