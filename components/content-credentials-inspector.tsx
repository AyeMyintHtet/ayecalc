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
  CREDENTIAL_IMAGE_ACCEPT,
  emptyCredentialSummary,
  makeJsonSafe,
  resolveCredentialImageMime,
  summarizeCredentialStore,
  summarizeMetadata,
  validateCredentialImageFile,
  type CredentialState,
  type CredentialSummary,
  type MetadataReport,
  type ValidationCode,
} from "@/lib/content-credentials";
import { formatImageBytes, safeImageBaseName } from "@/lib/image-tools";
import styles from "@/components/content-credentials-inspector.module.css";

type InspectorStatus = "idle" | "ready" | "inspecting" | "complete" | "error";
type ResultTab = "overview" | "credentials" | "metadata" | "report";

type InspectionResult = {
  credentials: CredentialSummary;
  metadata: MetadataReport;
  rawCredentials: unknown;
  rawMetadata: unknown;
  credentialError?: string;
  metadataError?: string;
};

const credentialStateCopy: Record<
  CredentialState,
  { label: string; description: string; icon: string }
> = {
  trusted: {
    label: "Trusted credentials",
    description:
      "The manifest is valid and its signer chains to a recognized trust anchor.",
    icon: "✓",
  },
  valid: {
    label: "Valid signature",
    description:
      "The content binding and signature validated, but signer trust was not established.",
    icon: "✓",
  },
  invalid: {
    label: "Validation failed",
    description:
      "One or more checks failed. Treat the credential history as unreliable.",
    icon: "!",
  },
  found: {
    label: "Credentials found",
    description:
      "A manifest was read, but the available result does not establish full validity.",
    icon: "i",
  },
  "not-found": {
    label: "No credentials found",
    description:
      "No embedded C2PA manifest was found. This does not make the image suspicious.",
    icon: "—",
  },
};

function friendlyError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    const message = error.message.replace(/^Error:\s*/i, "").trim();
    if (message.length <= 180) return message;
  }
  return fallback;
}

async function inspectC2pa(file: File) {
  const { createC2pa } = await import("@contentauth/c2pa-web/inline");
  const c2pa = await createC2pa({
    settings: {
      verify: {
        ocspFetch: false,
        remoteManifestFetch: false,
        verifyAfterReading: true,
        verifyTrust: true,
      },
    },
  });
  let reader: Awaited<ReturnType<typeof c2pa.reader.fromBlob>> = null;

  try {
    reader = await c2pa.reader.fromBlob(resolveCredentialImageMime(file), file);
    if (!reader) return null;
    return await reader.manifestStore();
  } finally {
    await reader?.free();
    c2pa.dispose();
  }
}

async function inspectMetadata(file: File) {
  const exifr = (await import("exifr")).default;
  return (
    (await exifr.parse(file, {
      exif: true,
      gps: true,
      icc: true,
      ifd1: true,
      ihdr: true,
      interop: true,
      iptc: true,
      jfif: true,
      makerNote: false,
      mergeOutput: false,
      multiSegment: true,
      sanitize: true,
      tiff: true,
      userComment: true,
      xmp: true,
    })) ?? {}
  );
}

function SummaryCard({
  eyebrow,
  title,
  description,
  tone = "neutral",
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tone?: "neutral" | "positive" | "warning" | "danger";
  icon: string;
}) {
  return (
    <article className={`${styles.summaryCard} ${styles[tone]}`}>
      <span className={styles.summaryIcon} aria-hidden="true">
        {icon}
      </span>
      <div>
        <small>{eyebrow}</small>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </article>
  );
}

function FactList({
  facts,
}: {
  facts: Array<[string, string | number | undefined]>;
}) {
  const visibleFacts = facts.filter(
    (fact): fact is [string, string | number] => {
      return fact[1] !== undefined && fact[1] !== "";
    },
  );
  if (!visibleFacts.length) return null;

  return (
    <dl className={styles.factList}>
      {visibleFacts.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CodeList({
  title,
  codes,
  tone,
}: {
  title: string;
  codes: ValidationCode[];
  tone: "success" | "information" | "failure";
}) {
  if (!codes.length) return null;
  return (
    <section className={`${styles.codeGroup} ${styles[tone]}`}>
      <h4>
        {title} <span>{codes.length}</span>
      </h4>
      <ul>
        {codes.map((item, index) => (
          <li key={`${item.code}-${index}`}>
            <code>{item.code}</code>
            {item.explanation ? <p>{item.explanation}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ContentCredentialsInspector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewUnavailable, setPreviewUnavailable] = useState(false);
  const [status, setStatus] = useState<InspectorStatus>("idle");
  const [message, setMessage] = useState("Choose an image to inspect.");
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("overview");
  const [metadataQuery, setMetadataQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy report");
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef("");
  const operationRef = useRef(0);

  const isInspecting = status === "inspecting";
  const credentialCopy =
    credentialStateCopy[result?.credentials.state ?? "not-found"];
  const aiDisclosed = Boolean(
    result?.credentials.aiDisclosed || result?.metadata.aiDisclosed,
  );

  useEffect(() => {
    return () => {
      operationRef.current += 1;
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function replacePreview(nextUrl: string) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }

  function resetInspector() {
    operationRef.current += 1;
    setSelectedFile(null);
    replacePreview("");
    setPreviewUnavailable(false);
    setStatus("idle");
    setMessage("Choose an image to inspect.");
    setResult(null);
    setActiveTab("overview");
    setMetadataQuery("");
    setCopyLabel("Copy report");
    setIsDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectFile(file: File) {
    if (isInspecting) return;
    const validationError = validateCredentialImageFile(file);
    if (validationError) {
      setStatus("error");
      setMessage(validationError);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    operationRef.current += 1;
    setSelectedFile(file);
    replacePreview(URL.createObjectURL(file));
    setPreviewUnavailable(false);
    setStatus("ready");
    setMessage("Image ready. Select Inspect image to read its embedded data.");
    setResult(null);
    setActiveTab("overview");
    setMetadataQuery("");
    setCopyLabel("Copy report");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) selectFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) selectFile(file);
  }

  async function runInspection() {
    if (!selectedFile || isInspecting) return;
    const operation = ++operationRef.current;
    setStatus("inspecting");
    setMessage("Reading metadata and validating embedded Content Credentials…");
    setResult(null);

    const [credentialResult, metadataResult] = await Promise.allSettled([
      inspectC2pa(selectedFile),
      inspectMetadata(selectedFile),
    ]);
    if (operation !== operationRef.current) return;

    const credentialFailed = credentialResult.status === "rejected";
    const metadataFailed = metadataResult.status === "rejected";
    if (credentialFailed && metadataFailed) {
      setStatus("error");
      setMessage(
        "This file could not be inspected. Try another supported image.",
      );
      return;
    }

    const rawCredentials = credentialFailed ? null : credentialResult.value;
    const rawMetadata = metadataFailed ? {} : metadataResult.value;
    setResult({
      credentials: rawCredentials
        ? summarizeCredentialStore(rawCredentials)
        : emptyCredentialSummary(),
      metadata: summarizeMetadata(rawMetadata),
      rawCredentials,
      rawMetadata,
      credentialError: credentialFailed
        ? friendlyError(
            credentialResult.reason,
            "The Content Credentials reader could not inspect this file.",
          )
        : undefined,
      metadataError: metadataFailed
        ? friendlyError(
            metadataResult.reason,
            "The EXIF, IPTC, and XMP reader could not inspect this file.",
          )
        : undefined,
    });
    setStatus("complete");
    setMessage(
      "Inspection complete. Review the evidence and limitations below.",
    );
  }

  const reportObject = useMemo(() => {
    if (!selectedFile || !result) return null;
    return makeJsonSafe({
      report: {
        generatedBy: "AyeCalc Content Credentials & Image Metadata Inspector",
        privacy: "Processed locally in the browser",
        note: "Content Credentials describe provenance claims; they do not prove that visible claims are true.",
      },
      file: {
        name: selectedFile.name,
        size: selectedFile.size,
        type: resolveCredentialImageMime(selectedFile),
        lastModified: new Date(selectedFile.lastModified).toISOString(),
      },
      summary: {
        credentials: result.credentials,
        metadata: {
          fieldCount: result.metadata.fieldCount,
          hasGps: result.metadata.hasGps,
          aiDisclosed: result.metadata.aiDisclosed,
          sourceTypes: result.metadata.sourceTypes,
          insights: result.metadata.insights,
        },
        credentialError: result.credentialError,
        metadataError: result.metadataError,
      },
      contentCredentials: result.rawCredentials,
      imageMetadata: result.rawMetadata,
    });
  }, [result, selectedFile]);

  const reportJson = useMemo(
    () => (reportObject ? JSON.stringify(reportObject, null, 2) : ""),
    [reportObject],
  );

  async function copyReport() {
    if (!reportJson) return;
    try {
      await navigator.clipboard.writeText(reportJson);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy report"), 1_500);
    } catch {
      setCopyLabel("Copy failed");
    }
  }

  function downloadReport() {
    if (!selectedFile || !reportJson) return;
    const url = URL.createObjectURL(
      new Blob([reportJson], { type: "application/json;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeImageBaseName(selectedFile.name)}-metadata-report.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const filteredMetadataGroups = useMemo(() => {
    if (!result) return [];
    const query = metadataQuery.trim().toLowerCase();
    if (!query) return result.metadata.groups;
    return result.metadata.groups
      .map((group) => ({
        ...group,
        entries: group.entries.filter(
          (entry) =>
            entry.searchText.includes(query) ||
            group.label.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.entries.length);
  }, [metadataQuery, result]);

  const credentialTone =
    result?.credentials.state === "invalid"
      ? "danger"
      : result?.credentials.state === "trusted" ||
          result?.credentials.state === "valid"
        ? "positive"
        : "neutral";

  return (
    <section
      className={styles.toolCard}
      aria-labelledby="credential-inspector-title"
    >
      <div className={styles.toolHeading}>
        <div>
          <span>Local provenance check</span>
          <h2 id="credential-inspector-title">Inspect an image</h2>
        </div>
        <span className={styles.privacyBadge}>Image stays on device</span>
      </div>

      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept={CREDENTIAL_IMAGE_ACCEPT}
        onChange={handleFileChange}
        disabled={isInspecting}
        aria-label="Choose an image to inspect"
      />

      {!selectedFile ? (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
        >
          <span className={styles.uploadIcon} aria-hidden="true">
            ⌁
          </span>
          <strong>Drop one image here</strong>
          <p>JPEG, PNG, WebP, AVIF, HEIC, HEIF, TIFF, or GIF · up to 100 MB</p>
          <button
            type="button"
            className={styles.chooseButton}
            onClick={() => inputRef.current?.click()}
          >
            Choose image
          </button>
        </div>
      ) : (
        <div className={styles.workspace}>
          <figure className={styles.previewPanel}>
            <div className={styles.previewFrame}>
              {!previewUnavailable ? (
                // A validated raster file is rendered through the browser's image decoder.
                <img
                  src={previewUrl}
                  alt={`Preview of ${selectedFile.name}`}
                  onLoad={() => setPreviewUnavailable(false)}
                  onError={() => setPreviewUnavailable(true)}
                />
              ) : (
                <div className={styles.previewFallback}>
                  <span aria-hidden="true">▧</span>
                  <strong>Preview unavailable</strong>
                  <p>The browser can still inspect supported embedded data.</p>
                </div>
              )}
            </div>
            <figcaption>
              <strong>{selectedFile.name}</strong>
              <span>
                {formatImageBytes(selectedFile.size)} ·{" "}
                {resolveCredentialImageMime(selectedFile)}
              </span>
            </figcaption>
          </figure>

          <div className={styles.inspectionPanel}>
            {status !== "complete" || !result ? (
              <div className={styles.readyPanel}>
                <span className={styles.readyIcon} aria-hidden="true">
                  {isInspecting ? "◌" : "⌕"}
                </span>
                <div>
                  <small>
                    {isInspecting
                      ? "Local inspection running"
                      : "Ready to inspect"}
                  </small>
                  <h3>
                    {isInspecting
                      ? "Checking credentials and metadata"
                      : "Read the evidence inside this file"}
                  </h3>
                  <p>{message}</p>
                  {isInspecting ? (
                    <div
                      className={styles.progressTrack}
                      aria-label="Inspection in progress"
                    >
                      <span />
                    </div>
                  ) : null}
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => void runInspection()}
                      disabled={isInspecting}
                    >
                      {isInspecting ? "Inspecting…" : "Inspect image"}
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={resetInspector}
                      disabled={isInspecting}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.resultShell}>
                <div className={styles.resultHeader} aria-live="polite">
                  <div>
                    <span>Inspection complete</span>
                    <h3>Embedded evidence report</h3>
                    <p>{message}</p>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={resetInspector}
                  >
                    New image
                  </button>
                </div>

                <div
                  className={styles.tabList}
                  role="tablist"
                  aria-label="Inspection results"
                >
                  {(
                    [
                      ["overview", "Overview"],
                      ["credentials", "Credentials"],
                      ["metadata", `Metadata (${result.metadata.fieldCount})`],
                      ["report", "JSON report"],
                    ] as Array<[ResultTab, string]>
                  ).map(([tab, label]) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab}
                      aria-controls={`inspector-panel-${tab}`}
                      id={`inspector-tab-${tab}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div
                  className={styles.tabPanel}
                  role="tabpanel"
                  id={`inspector-panel-${activeTab}`}
                  aria-labelledby={`inspector-tab-${activeTab}`}
                >
                  {activeTab === "overview" ? (
                    <div className={styles.overviewPanel}>
                      <div className={styles.summaryGrid}>
                        <SummaryCard
                          eyebrow="Content Credentials"
                          title={credentialCopy.label}
                          description={
                            result.credentialError ?? credentialCopy.description
                          }
                          tone={
                            result.credentialError ? "warning" : credentialTone
                          }
                          icon={
                            result.credentialError ? "!" : credentialCopy.icon
                          }
                        />
                        <SummaryCard
                          eyebrow="AI disclosure"
                          title={
                            aiDisclosed
                              ? "AI use disclosed"
                              : "No AI disclosure found"
                          }
                          description={
                            aiDisclosed
                              ? "An embedded source type or IPTC AI field explicitly mentions AI use."
                              : "Absence of an AI label is not proof that the image is human-made."
                          }
                          tone={aiDisclosed ? "warning" : "neutral"}
                          icon={aiDisclosed ? "AI" : "—"}
                        />
                        <SummaryCard
                          eyebrow="Image metadata"
                          title={`${result.metadata.fieldCount} field${result.metadata.fieldCount === 1 ? "" : "s"} found`}
                          description={
                            result.metadataError ??
                            (result.metadata.fieldCount
                              ? `Across ${result.metadata.groups.length} embedded metadata group${result.metadata.groups.length === 1 ? "" : "s"}.`
                              : "No readable EXIF, IPTC, XMP, or ICC fields were found.")
                          }
                          tone={result.metadataError ? "warning" : "neutral"}
                          icon="≡"
                        />
                        <SummaryCard
                          eyebrow="Privacy check"
                          title={
                            result.metadata.hasGps
                              ? "Location data found"
                              : "No GPS coordinates found"
                          }
                          description={
                            result.metadata.hasGps
                              ? "Review the metadata before sharing this file publicly."
                              : "No readable latitude or longitude field was detected."
                          }
                          tone={result.metadata.hasGps ? "danger" : "positive"}
                          icon={result.metadata.hasGps ? "!" : "✓"}
                        />
                      </div>

                      {result.credentials.sourceTypes.length ||
                      result.metadata.sourceTypes.length ? (
                        <section className={styles.sourceTypePanel}>
                          <span>Declared digital source type</span>
                          <div>
                            {Array.from(
                              new Set([
                                ...result.credentials.sourceTypes,
                                ...result.metadata.sourceTypes,
                              ]),
                            ).map((sourceType) => (
                              <strong key={sourceType}>{sourceType}</strong>
                            ))}
                          </div>
                        </section>
                      ) : null}

                      {result.metadata.insights.length ? (
                        <section className={styles.insightPanel}>
                          <div className={styles.sectionHeading}>
                            <span>Useful fields</span>
                            <h4>Attribution, rights, and capture details</h4>
                          </div>
                          <FactList
                            facts={result.metadata.insights.map((item) => [
                              item.label,
                              item.value,
                            ])}
                          />
                        </section>
                      ) : null}

                      <aside className={styles.evidenceNotice}>
                        <span aria-hidden="true">i</span>
                        <p>
                          <strong>
                            Read this as evidence, not a truth score.
                          </strong>{" "}
                          Content Credentials can show whether signed provenance
                          data stayed bound to this file. They do not prove that
                          every claim or visible scene is true, and missing
                          credentials do not prove manipulation.
                        </p>
                      </aside>
                    </div>
                  ) : null}

                  {activeTab === "credentials" ? (
                    <div className={styles.credentialsPanel}>
                      <div
                        className={`${styles.credentialBanner} ${styles[result.credentials.state]}`}
                      >
                        <span aria-hidden="true">{credentialCopy.icon}</span>
                        <div>
                          <small>Validation state</small>
                          <h4>{credentialCopy.label}</h4>
                          <p>
                            {result.credentialError ??
                              credentialCopy.description}
                          </p>
                        </div>
                      </div>

                      {result.credentials.state !== "not-found" ? (
                        <>
                          <FactList
                            facts={[
                              [
                                "Active manifest",
                                result.credentials.activeLabel,
                              ],
                              ["Asset title", result.credentials.title],
                              ["Manifest format", result.credentials.format],
                              ["Claim generator", result.credentials.generator],
                              ["Signer", result.credentials.signer],
                              ["Certificate issuer", result.credentials.issuer],
                              ["Signed", result.credentials.signedAt],
                              [
                                "Signature algorithm",
                                result.credentials.algorithm,
                              ],
                              ["Manifests", result.credentials.manifestCount],
                              [
                                "Ingredients",
                                result.credentials.ingredientCount,
                              ],
                            ]}
                          />

                          {result.credentials.actions.length ? (
                            <section className={styles.actionPanel}>
                              <div className={styles.sectionHeading}>
                                <span>Provenance history</span>
                                <h4>Recorded actions</h4>
                              </div>
                              <ol>
                                {result.credentials.actions.map(
                                  (action, index) => (
                                    <li key={`${action.action}-${index}`}>
                                      <span aria-hidden="true">
                                        {index + 1}
                                      </span>
                                      <div>
                                        <strong>{action.action}</strong>
                                        {action.software ? (
                                          <p>{action.software}</p>
                                        ) : null}
                                        {action.sourceType ? (
                                          <small>{action.sourceType}</small>
                                        ) : null}
                                        {action.when ? (
                                          <time>{action.when}</time>
                                        ) : null}
                                      </div>
                                    </li>
                                  ),
                                )}
                              </ol>
                            </section>
                          ) : null}

                          <div className={styles.validationGrid}>
                            <CodeList
                              title="Passed checks"
                              codes={result.credentials.successCodes}
                              tone="success"
                            />
                            <CodeList
                              title="Information"
                              codes={result.credentials.informationalCodes}
                              tone="information"
                            />
                            <CodeList
                              title="Failed checks"
                              codes={result.credentials.failureCodes}
                              tone="failure"
                            />
                          </div>
                        </>
                      ) : (
                        <aside className={styles.emptyPanel}>
                          <strong>Nothing to expand</strong>
                          <p>
                            The inspector does not fetch remote manifests or
                            perform online revocation checks. It reports
                            embedded credentials available in the selected file.
                          </p>
                        </aside>
                      )}
                    </div>
                  ) : null}

                  {activeTab === "metadata" ? (
                    <div className={styles.metadataPanel}>
                      <label className={styles.searchField}>
                        <span>Search metadata</span>
                        <input
                          type="search"
                          value={metadataQuery}
                          onChange={(event) =>
                            setMetadataQuery(event.target.value)
                          }
                          placeholder="Try camera, copyright, GPS, AI system…"
                        />
                      </label>

                      {result.metadataError ? (
                        <p className={styles.inlineWarning}>
                          {result.metadataError}
                        </p>
                      ) : null}

                      <div className={styles.metadataGroups}>
                        {filteredMetadataGroups.map((group, index) => (
                          <details
                            key={group.key}
                            open={Boolean(metadataQuery) || index === 0}
                          >
                            <summary>
                              <span>{group.label}</span>
                              <b>{group.entries.length}</b>
                            </summary>
                            <dl>
                              {group.entries.map((entry, entryIndex) => (
                                <div key={`${entry.key}-${entryIndex}`}>
                                  <dt title={entry.key}>{entry.label}</dt>
                                  <dd>{entry.value}</dd>
                                </div>
                              ))}
                            </dl>
                          </details>
                        ))}
                      </div>

                      {!filteredMetadataGroups.length ? (
                        <aside className={styles.emptyPanel}>
                          <strong>
                            {metadataQuery
                              ? "No matching fields"
                              : "No metadata found"}
                          </strong>
                          <p>
                            {metadataQuery
                              ? "Try a broader search term."
                              : "The file may have been exported without readable EXIF, IPTC, XMP, or ICC data."}
                          </p>
                        </aside>
                      ) : null}
                    </div>
                  ) : null}

                  {activeTab === "report" ? (
                    <div className={styles.reportPanel}>
                      <div className={styles.reportActions}>
                        <div>
                          <span>Portable result</span>
                          <h4>Technical JSON report</h4>
                          <p>
                            Binary payloads are summarized instead of copied
                            into the report.
                          </p>
                        </div>
                        <div>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => void copyReport()}
                          >
                            {copyLabel}
                          </button>
                          <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={downloadReport}
                          >
                            Download JSON
                          </button>
                        </div>
                      </div>
                      <pre tabIndex={0}>{reportJson}</pre>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {status === "error" ? (
        <p className={styles.standaloneError} role="alert">
          {message}
        </p>
      ) : null}

      <div className={styles.disclosureGrid}>
        <div>
          <span aria-hidden="true">⌂</span>
          <p>
            <strong>Browser-only</strong>The selected image is not uploaded.
          </p>
        </div>
        <div>
          <span aria-hidden="true">✓</span>
          <p>
            <strong>Cryptographic checks</strong>Uses the official C2PA browser
            SDK.
          </p>
        </div>
        <div>
          <span aria-hidden="true">i</span>
          <p>
            <strong>No automatic verdict</strong>Provenance evidence is not a
            truth guarantee.
          </p>
        </div>
      </div>
    </section>
  );
}
