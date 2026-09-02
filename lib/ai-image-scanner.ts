export const AI_IMAGE_SCANNER_MODEL =
  "onnx-community/ai-image-detect-distilled-ONNX";
export const AI_IMAGE_SCANNER_MODEL_SIZE = "about 11 MB";
export const MAX_AI_SCAN_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_AI_SCAN_PIXELS = 25_000_000;

export type AiImageModelScore = {
  label: string;
  score: number;
};

export type AiImageLikelihoods = {
  ai: number;
  real: number;
};

export type AiImageVerdict = "likely-ai" | "likely-real" | "inconclusive";

function clampProbability(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function isAiLabel(label: string) {
  return /(^|[^a-z])(fake|ai|synthetic|generated|deepfake)([^a-z]|$)/i.test(
    label,
  );
}

function isRealLabel(label: string) {
  return /(^|[^a-z])(real|realism|authentic|human)([^a-z]|$)/i.test(label);
}

export function normalizeAiImageScores(
  scores: AiImageModelScore[],
): AiImageLikelihoods | null {
  const aiScore = scores.find((item) => isAiLabel(item.label))?.score;
  const realScore = scores.find((item) => isRealLabel(item.label))?.score;

  if (aiScore === undefined && realScore === undefined) return null;

  const ai = clampProbability(
    aiScore ?? (realScore === undefined ? 0 : 1 - realScore),
  );
  const real = clampProbability(
    realScore ?? (aiScore === undefined ? 0 : 1 - aiScore),
  );
  const total = ai + real;

  if (total === 0) return { ai: 0.5, real: 0.5 };
  return { ai: ai / total, real: real / total };
}

export function getAiImageVerdict(aiLikelihood: number): AiImageVerdict {
  const score = clampProbability(aiLikelihood);
  if (score >= 0.7) return "likely-ai";
  if (score <= 0.3) return "likely-real";
  return "inconclusive";
}

export function formatLikelihood(value: number) {
  return `${Math.round(clampProbability(value) * 100)}%`;
}
