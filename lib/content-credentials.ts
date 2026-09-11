export const MAX_CREDENTIAL_IMAGE_BYTES = 100 * 1024 * 1024;

export const CREDENTIAL_IMAGE_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.avif,.heic,.heif,.tif,.tiff,.gif";

const MIME_BY_EXTENSION: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  tif: "image/tiff",
  tiff: "image/tiff",
  webp: "image/webp",
};

const SUPPORTED_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION));

const GROUP_LABELS: Record<string, string> = {
  dc: "XMP · Dublin Core",
  exif: "EXIF capture data",
  gps: "GPS location",
  icc: "ICC color profile",
  ifd0: "TIFF image data",
  ifd1: "Embedded thumbnail",
  ihdr: "PNG image header",
  interop: "EXIF interoperability",
  iptc: "IPTC legacy metadata",
  Iptc4xmpCore: "XMP · IPTC Core",
  Iptc4xmpExt: "XMP · IPTC Extension",
  jfif: "JFIF image data",
  photoshop: "XMP · Photoshop",
  plus: "XMP · PLUS rights",
  xmp: "XMP basic metadata",
  xmpRights: "XMP rights",
};

const DIGITAL_SOURCE_NAMES: Record<string, string> = {
  algorithmicallyEnhanced: "Algorithmically altered",
  algorithmicMedia: "Pure algorithmic media",
  composite: "Composite media",
  compositeCapture: "Composite of captured elements",
  compositeSynthetic: "Composite including generative AI elements",
  compositeWithTrainedAlgorithmicMedia: "Edited using generative AI",
  dataDrivenMedia: "Data-driven media",
  digitalCapture: "Captured with a digital camera or recorder",
  digitalCreation: "Created digitally by a human",
  humanEdits: "Human-edited media",
  negativeFilm: "Digitized from negative film",
  positiveFilm: "Digitized from positive film",
  print: "Digitized from a print",
  screenCapture: "Screen capture",
  softwareImage: "Created by software (retired term)",
  trainedAlgorithmicMedia: "Created using generative AI",
  virtualRecording: "Virtual event recording",
};

const AI_SOURCE_TYPES = new Set([
  "compositeSynthetic",
  "compositeWithTrainedAlgorithmicMedia",
  "trainedAlgorithmicMedia",
  "virtualRecording",
]);

export type MetadataEntry = {
  key: string;
  label: string;
  value: string;
  searchText: string;
};

export type MetadataGroup = {
  key: string;
  label: string;
  entries: MetadataEntry[];
};

export type MetadataInsight = {
  label: string;
  value: string;
};

export type MetadataReport = {
  groups: MetadataGroup[];
  fieldCount: number;
  hasGps: boolean;
  aiDisclosed: boolean;
  sourceTypes: string[];
  insights: MetadataInsight[];
};

export type ValidationCode = {
  code: string;
  explanation?: string;
};

export type CredentialAction = {
  action: string;
  software?: string;
  when?: string;
  sourceType?: string;
};

export type CredentialState =
  | "not-found"
  | "found"
  | "valid"
  | "trusted"
  | "invalid";

export type CredentialSummary = {
  state: CredentialState;
  activeLabel?: string;
  title?: string;
  format?: string;
  generator?: string;
  signer?: string;
  issuer?: string;
  signedAt?: string;
  algorithm?: string;
  manifestCount: number;
  ingredientCount: number;
  actions: CredentialAction[];
  sourceTypes: string[];
  aiDisclosed: boolean;
  successCodes: ValidationCode[];
  informationalCodes: ValidationCode[];
  failureCodes: ValidationCode[];
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function extensionOf(fileName: string) {
  return fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
}

export function resolveCredentialImageMime(file: {
  name: string;
  type: string;
}) {
  if (SUPPORTED_MIME_TYPES.has(file.type)) return file.type;
  return MIME_BY_EXTENSION[extensionOf(file.name)] ?? "";
}

export function validateCredentialImageFile(file: {
  name: string;
  size: number;
  type: string;
}) {
  const mimeType = resolveCredentialImageMime(file);
  if (!mimeType || (file.type && !SUPPORTED_MIME_TYPES.has(file.type))) {
    return "Use a JPEG, PNG, WebP, AVIF, HEIC, HEIF, TIFF, or GIF image.";
  }
  if (file.size === 0) return "The image is empty.";
  if (file.size > MAX_CREDENTIAL_IMAGE_BYTES) {
    return "Choose an image no larger than 100 MB.";
  }
  return "";
}

function humanizeKey(value: string) {
  return value
    .replace(/^.*\./, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\bGps\b/g, "GPS")
    .replace(/\bAi\b/g, "AI")
    .replace(/\bUrl\b/g, "URL")
    .replace(/\bId\b/g, "ID")
    .replace(/^\w/, (character) => character.toUpperCase());
}

function primitiveValue(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function compactValue(value: unknown): string | null {
  const primitive = primitiveValue(value);
  if (primitive !== null) return primitive;

  if (ArrayBuffer.isView(value)) {
    return `[binary data · ${value.byteLength.toLocaleString()} bytes]`;
  }

  if (Array.isArray(value)) {
    const values = value.map(primitiveValue).filter((item): item is string => item !== null);
    if (values.length === value.length) return values.join(", ") || null;
    return null;
  }

  if (isRecord(value) && "value" in value) {
    const translated = primitiveValue(value.value);
    const language = primitiveValue(value.lang);
    if (translated) return language ? `${translated} (${language})` : translated;
  }

  return null;
}

function flattenMetadataValue(
  value: unknown,
  path: string,
  entries: MetadataEntry[],
  depth = 0,
) {
  if (entries.length >= 1_000) return;

  const compact = compactValue(value);
  if (compact !== null) {
    const displayValue = compact.length > 1_200 ? `${compact.slice(0, 1_197)}…` : compact;
    const label = humanizeKey(path);
    entries.push({
      key: path,
      label,
      value: displayValue,
      searchText: `${path} ${label} ${displayValue}`.toLowerCase(),
    });
    return;
  }

  if (depth >= 6) return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      flattenMetadataValue(item, `${path} [${index + 1}]`, entries, depth + 1);
    });
    return;
  }

  if (!isRecord(value)) return;
  Object.entries(value).forEach(([key, child]) => {
    if (key === "parseType" || key === "xmlns") return;
    flattenMetadataValue(child, path ? `${path}.${key}` : key, entries, depth + 1);
  });
}

function collectNamedValues(
  value: unknown,
  acceptedKeys: Set<string>,
  values: string[],
) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectNamedValues(item, acceptedKeys, values));
    return;
  }
  if (!isRecord(value)) return;

  Object.entries(value).forEach(([key, child]) => {
    if (acceptedKeys.has(key.toLowerCase())) {
      const compact = compactValue(child);
      if (compact) values.push(compact);
    }
    collectNamedValues(child, acceptedKeys, values);
  });
}

function firstNamedValue(value: unknown, keys: string[]) {
  for (const key of keys) {
    const values: string[] = [];
    collectNamedValues(value, new Set([key.toLowerCase()]), values);
    if (values[0]) return values[0];
  }
  return undefined;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function sourceTypeToken(value: string) {
  const token = value.split(/[\/#]/).filter(Boolean).at(-1) ?? value;
  return token.replace(/^digsrctype:/, "");
}

export function formatDigitalSourceType(value: string) {
  const token = sourceTypeToken(value);
  return DIGITAL_SOURCE_NAMES[token] ?? humanizeKey(token);
}

function collectDigitalSourceTypes(value: unknown) {
  const values: string[] = [];
  collectNamedValues(value, new Set(["digitalsourcetype", "digital_source_type"]), values);

  function findUris(candidate: unknown) {
    if (typeof candidate === "string") {
      if (candidate.includes("/digitalsourcetype/")) values.push(candidate);
      return;
    }
    if (Array.isArray(candidate)) {
      candidate.forEach(findUris);
      return;
    }
    if (isRecord(candidate)) Object.values(candidate).forEach(findUris);
  }

  findUris(value);
  return unique(values).map((item) => sourceTypeToken(item));
}

function hasAiSourceType(sourceTypes: string[]) {
  return sourceTypes.some((value) => AI_SOURCE_TYPES.has(sourceTypeToken(value)));
}

export function summarizeMetadata(rawMetadata: unknown): MetadataReport {
  const groups: MetadataGroup[] = [];
  if (isRecord(rawMetadata)) {
    Object.entries(rawMetadata).forEach(([key, value]) => {
      const entries: MetadataEntry[] = [];
      flattenMetadataValue(value, "", entries);
      if (entries.length) {
        groups.push({
          key,
          label: GROUP_LABELS[key] ?? `XMP · ${humanizeKey(key)}`,
          entries,
        });
      }
    });
  }

  const latitude = firstNamedValue(rawMetadata, ["latitude", "gpslatitude"]);
  const longitude = firstNamedValue(rawMetadata, ["longitude", "gpslongitude"]);
  const sourceTypes = collectDigitalSourceTypes(rawMetadata);
  const aiSystem = firstNamedValue(rawMetadata, ["AISystemUsed"]);
  const aiPrompt = firstNamedValue(rawMetadata, ["AIPromptInformation"]);
  const insights: MetadataInsight[] = [];

  const candidates: Array<[string, string | undefined]> = [
    ["Creator", firstNamedValue(rawMetadata, ["Byline", "Artist", "creator", "ImageCreatorName"])],
    ["Copyright", firstNamedValue(rawMetadata, ["CopyrightNotice", "Copyright", "rights"])],
    ["Credit", firstNamedValue(rawMetadata, ["Credit"])],
    ["License / rights URL", firstNamedValue(rawMetadata, ["WebStatement", "LicensorURL"])],
    ["Camera", firstNamedValue(rawMetadata, ["Model"])],
    ["Lens", firstNamedValue(rawMetadata, ["LensModel"])],
    ["Captured", firstNamedValue(rawMetadata, ["DateTimeOriginal", "DateCreated"])],
    ["Editing software", firstNamedValue(rawMetadata, ["Software", "CreatorTool"])],
    ["AI system", aiSystem],
    ["AI prompt information", aiPrompt],
  ];

  candidates.forEach(([label, value]) => {
    if (value && !insights.some((item) => item.value === value)) {
      insights.push({ label, value });
    }
  });

  if (latitude || longitude) {
    insights.push({
      label: "GPS coordinates",
      value: [latitude, longitude].filter(Boolean).join(", "),
    });
  }

  return {
    groups,
    fieldCount: groups.reduce((total, group) => total + group.entries.length, 0),
    hasGps: Boolean(latitude || longitude),
    aiDisclosed: Boolean(aiSystem || aiPrompt || hasAiSourceType(sourceTypes)),
    sourceTypes: sourceTypes.map(formatDigitalSourceType),
    insights,
  };
}

function validationCode(value: unknown): ValidationCode | null {
  if (typeof value === "string") return { code: value };
  if (!isRecord(value) || typeof value.code !== "string") return null;
  return {
    code: value.code,
    explanation:
      typeof value.explanation === "string" ? value.explanation : undefined,
  };
}

function validationCodeList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(validationCode).filter((item): item is ValidationCode => Boolean(item));
}

function readValidationCodes(store: UnknownRecord) {
  const successCodes: ValidationCode[] = [];
  const informationalCodes: ValidationCode[] = [];
  const failureCodes: ValidationCode[] = [];
  const validationResults = isRecord(store.validation_results)
    ? store.validation_results
    : isRecord(store.validationResults)
      ? store.validationResults
      : undefined;
  const activeResults = validationResults && isRecord(validationResults.activeManifest)
    ? validationResults.activeManifest
    : validationResults && isRecord(validationResults.active_manifest)
      ? validationResults.active_manifest
      : undefined;

  if (activeResults) {
    successCodes.push(...validationCodeList(activeResults.success));
    informationalCodes.push(...validationCodeList(activeResults.informational));
    failureCodes.push(...validationCodeList(activeResults.failure));
  }

  if (Array.isArray(store.validation_status)) {
    store.validation_status.forEach((item) => {
      const code = validationCode(item);
      if (!code) return;
      if (isRecord(item) && item.success === false) failureCodes.push(code);
      else if (isRecord(item) && item.success === true) successCodes.push(code);
      else informationalCodes.push(code);
    });
  }

  return {
    successCodes: uniqueCodes(successCodes),
    informationalCodes: uniqueCodes(informationalCodes),
    failureCodes: uniqueCodes(failureCodes),
  };
}

function uniqueCodes(values: ValidationCode[]) {
  const seen = new Set<string>();
  return values.filter((item) => {
    const key = `${item.code}|${item.explanation ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function actionLabel(value: string) {
  return humanizeKey(value.replace(/^c2pa\./, ""));
}

function summarizeActions(activeManifest: UnknownRecord): CredentialAction[] {
  const assertions = Array.isArray(activeManifest.assertions)
    ? activeManifest.assertions
    : [];
  const actions: CredentialAction[] = [];

  assertions.forEach((assertion) => {
    if (!isRecord(assertion) || !String(assertion.label ?? "").includes("actions")) return;
    const data = assertion.data;
    const list = isRecord(data) && Array.isArray(data.actions)
      ? data.actions
      : Array.isArray(data)
        ? data
        : [];

    list.forEach((item) => {
      if (!isRecord(item) || typeof item.action !== "string") return;
      const softwareAgent = isRecord(item.softwareAgent)
        ? item.softwareAgent
        : isRecord(item.software_agent)
          ? item.software_agent
          : undefined;
      const sourceType = firstNamedValue(item, [
        "digitalSourceType",
        "digital_source_type",
      ]);
      actions.push({
        action: actionLabel(item.action),
        software: softwareAgent
          ? [primitiveValue(softwareAgent.name), primitiveValue(softwareAgent.version)]
              .filter(Boolean)
              .join(" ") || undefined
          : typeof item.softwareAgent === "string"
            ? item.softwareAgent
            : undefined,
        when: primitiveValue(item.when) ?? undefined,
        sourceType: sourceType ? formatDigitalSourceType(sourceType) : undefined,
      });
    });
  });

  return actions;
}

export function emptyCredentialSummary(): CredentialSummary {
  return {
    state: "not-found",
    manifestCount: 0,
    ingredientCount: 0,
    actions: [],
    sourceTypes: [],
    aiDisclosed: false,
    successCodes: [],
    informationalCodes: [],
    failureCodes: [],
  };
}

export function summarizeCredentialStore(rawStore: unknown): CredentialSummary {
  if (!isRecord(rawStore)) return emptyCredentialSummary();
  const manifests = isRecord(rawStore.manifests) ? rawStore.manifests : {};
  const manifestEntries = Object.entries(manifests).filter(([, value]) => isRecord(value));
  if (!manifestEntries.length) return emptyCredentialSummary();

  const activeLabel =
    primitiveValue(rawStore.active_manifest) ??
    primitiveValue(rawStore.activeManifest) ??
    manifestEntries[0][0];
  const activeManifest = (activeLabel && isRecord(manifests[activeLabel])
    ? manifests[activeLabel]
    : manifestEntries[0][1]) as UnknownRecord;
  const validation = readValidationCodes(rawStore);
  const stateValue = String(rawStore.validation_state ?? rawStore.validationState ?? "").toLowerCase();
  const hasCryptographicValidation = validation.successCodes.some(
    (item) => item.code === "claimSignature.validated",
  );
  const hasIntegrityFailure = validation.failureCodes.some(
    (item) => item.code !== "signingCredential.untrusted",
  );
  let state: CredentialState = "found";
  if (stateValue === "trusted") state = "trusted";
  else if (stateValue === "valid") state = "valid";
  else if (stateValue === "invalid" || hasIntegrityFailure) state = "invalid";
  else if (validation.successCodes.some((item) => item.code === "signingCredential.trusted")) {
    state = "trusted";
  } else if (hasCryptographicValidation) {
    state = "valid";
  }

  const generatorInfo = Array.isArray(activeManifest.claim_generator_info)
    ? activeManifest.claim_generator_info
        .filter(isRecord)
        .map((item) =>
          [primitiveValue(item.name), primitiveValue(item.version)]
            .filter(Boolean)
            .join(" "),
        )
        .filter(Boolean)
    : [];
  const signature = isRecord(activeManifest.signature_info)
    ? activeManifest.signature_info
    : undefined;
  const sourceTypeTokens = collectDigitalSourceTypes(activeManifest);

  return {
    state,
    activeLabel,
    title: primitiveValue(activeManifest.title) ?? undefined,
    format: primitiveValue(activeManifest.format) ?? undefined,
    generator:
      generatorInfo.join(", ") ||
      primitiveValue(activeManifest.claim_generator) ||
      undefined,
    signer: signature
      ? primitiveValue(signature.common_name) ?? primitiveValue(signature.commonName) ?? undefined
      : undefined,
    issuer: signature ? primitiveValue(signature.issuer) ?? undefined : undefined,
    signedAt: signature ? primitiveValue(signature.time) ?? undefined : undefined,
    algorithm: signature ? primitiveValue(signature.alg) ?? undefined : undefined,
    manifestCount: manifestEntries.length,
    ingredientCount: Array.isArray(activeManifest.ingredients)
      ? activeManifest.ingredients.length
      : 0,
    actions: summarizeActions(activeManifest),
    sourceTypes: sourceTypeTokens.map(formatDigitalSourceType),
    aiDisclosed: hasAiSourceType(sourceTypeTokens),
    ...validation,
  };
}

export function makeJsonSafe(value: unknown, depth = 0): unknown {
  if (depth > 12) return "[nested data omitted]";
  if (value === undefined) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (ArrayBuffer.isView(value)) return `[binary data · ${value.byteLength} bytes]`;
  if (Array.isArray(value)) return value.map((item) => makeJsonSafe(item, depth + 1));
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, makeJsonSafe(child, depth + 1)]),
    );
  }
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  return String(value);
}
