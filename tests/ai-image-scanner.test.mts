import assert from "node:assert/strict";
import test from "node:test";
import {
  formatLikelihood,
  getAiImageVerdict,
  normalizeAiImageScores,
} from "../lib/ai-image-scanner.ts";

test("normalizes real and AI model labels", () => {
  const result = normalizeAiImageScores([
    { label: "FAKE", score: 0.8 },
    { label: "REAL", score: 0.2 },
  ]);

  assert.ok(result);
  assert.ok(Math.abs(result.ai - 0.8) < 0.000001);
  assert.ok(Math.abs(result.real - 0.2) < 0.000001);
});

test("derives a missing complementary score", () => {
  assert.deepEqual(normalizeAiImageScores([{ label: "synthetic", score: 0.7 }]), {
    ai: 0.7,
    real: 0.30000000000000004,
  });
  assert.equal(normalizeAiImageScores([{ label: "unknown", score: 1 }]), null);
});

test("uses conservative verdict thresholds", () => {
  assert.equal(getAiImageVerdict(0.7), "likely-ai");
  assert.equal(getAiImageVerdict(0.69), "inconclusive");
  assert.equal(getAiImageVerdict(0.31), "inconclusive");
  assert.equal(getAiImageVerdict(0.3), "likely-real");
  assert.equal(formatLikelihood(0.746), "75%");
});
