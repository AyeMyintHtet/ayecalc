import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateTiledWatermarkPoints,
  calculateWatermarkAnchor,
  fitWatermarkLogoDimensions,
  getRotatedWatermarkBounds,
  normalizeWatermarkText,
} from "../lib/image-watermark.ts";
import { createImageOutputName } from "../lib/image-tools.ts";

test("calculates rotated watermark bounds and anchored positions", () => {
  const bounds = getRotatedWatermarkBounds(100, 20, 90);
  assert.ok(Math.abs(bounds.width - 20) < 0.000001);
  assert.ok(Math.abs(bounds.height - 100) < 0.000001);

  assert.deepEqual(
    calculateWatermarkAnchor(1000, 800, 200, 100, 0, "top-left", 5),
    { x: 140, y: 90 },
  );
  assert.deepEqual(
    calculateWatermarkAnchor(1000, 800, 200, 100, 0, "bottom-right", 5),
    { x: 860, y: 710 },
  );
});

test("fits logo watermarks without changing their aspect ratio", () => {
  assert.deepEqual(
    fitWatermarkLogoDimensions(1000, 500, 2000, 1000, 20),
    { width: 200, height: 100 },
  );
  assert.deepEqual(
    fitWatermarkLogoDimensions(1000, 500, 100, 400, 90),
    { width: 113, height: 450 },
  );
});

test("caps tiled watermarks and staggers alternating rows", () => {
  const points = calculateTiledWatermarkPoints(1000, 800, 100, 40, -30, 5, 25);
  assert.ok(points.length <= 25);
  const rowStarts = points.filter(
    (point, index) => index === 0 || point.y !== points[index - 1]?.y,
  );
  assert.ok(rowStarts.length > 1);
  assert.notEqual(rowStarts[0]?.x, rowStarts[1]?.x);
  assert.ok(Math.max(...points.map((point) => point.y)) > 400);
});

test("normalizes text and creates descriptive output names", () => {
  assert.equal(normalizeWatermarkText("  ©   Example\nBrand  "), "© Example Brand");
  assert.equal(
    createImageOutputName("Product photo.JPG", "watermark", "image/webp"),
    "Product-photo-watermarked.webp",
  );
});
