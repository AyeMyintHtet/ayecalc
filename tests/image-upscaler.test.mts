import assert from "node:assert/strict";
import test from "node:test";
import {
  getUpscaleDimensions,
  getUpscaleTiles,
  extractTileRgb,
  mergeUpscaleTile,
  upscaleFileName,
} from "../lib/image-upscaler.ts";
import {
  getBatchResizeDimensions,
  isBatchSettings,
  type BatchSettings,
} from "../lib/image-batch.ts";

test("upscaler bounds output size before allocating model memory", () => {
  assert.deepEqual(getUpscaleDimensions(800, 600), {
    width: 1600,
    height: 1200,
  });
  for (const dimensions of [
    [0, 5],
    [7, 7],
    [1500, 1000],
    [Infinity, 20],
    [10000, 10],
  ])
    assert.throws(
      () => getUpscaleDimensions(...(dimensions as [number, number])),
      RangeError,
    );
  assert.throws(() => getUpscaleDimensions(800, 800, 500000), RangeError);
  assert.throws(() => getUpscaleDimensions(800, 600, NaN), RangeError);
  assert.equal(upscaleFileName("my photo.JPG"), "my-photo-2x-enhanced.png");
});
test("tiles cover every pixel exactly once including odd-sized image edges", () => {
  const width = 197,
    height = 113;
  const coverage = new Uint8Array(width * height);
  for (const tile of getUpscaleTiles(width, height)) {
    assert.ok(tile.inputWidth <= 128 && tile.inputHeight <= 128);
    assert.ok(
      tile.inputX >= 0 &&
        tile.inputY >= 0 &&
        tile.inputX + tile.inputWidth <= width &&
        tile.inputY + tile.inputHeight <= height,
    );
    for (let y = tile.y; y < tile.y + tile.height; y++)
      for (let x = tile.x; x < tile.x + tile.width; x++)
        coverage[y * width + x]++;
  }
  assert.ok(coverage.every((count) => count === 1));
});
test("stitching discards padded model borders and preserves original alpha", () => {
  const width = 197,
    height = 113;
  const source = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      source.set([x % 256, y % 256, 80, 17], i);
    }
  const output = new Uint8ClampedArray(width * height * 16).fill(17);
  for (const tile of getUpscaleTiles(width, height)) {
    const rgb = extractTileRgb(source, width, tile);
    assert.equal(rgb.length, tile.inputWidth * tile.inputHeight * 3);
    for (let y = 0; y < tile.inputHeight; y++)
      for (let x = 0; x < tile.inputWidth; x++) {
        const i = (y * tile.inputWidth + x) * 3;
        assert.deepEqual(Array.from(rgb.subarray(i, i + 3)), [
          (tile.inputX + x) % 256,
          (tile.inputY + y) % 256,
          80,
        ]);
      }
    const resultWidth = Math.ceil(tile.inputWidth / 8) * 16,
      resultHeight = Math.ceil(tile.inputHeight / 8) * 16;
    const enhanced = new Uint8Array(resultWidth * resultHeight * 3).fill(255);
    for (let y = 0; y < tile.inputHeight * 2; y++)
      for (let x = 0; x < tile.inputWidth * 2; x++) {
        enhanced.set(
          [(tile.inputX * 2 + x) % 256, (tile.inputY * 2 + y) % 256, 93],
          (y * resultWidth + x) * 3,
        );
      }
    mergeUpscaleTile(output, width * 2, tile, {
      data: enhanced,
      width: resultWidth,
      height: resultHeight,
      channels: 3,
    });
  }
  for (let y = 0; y < height * 2; y++)
    for (let x = 0; x < width * 2; x++) {
      const i = (y * width * 2 + x) * 4;
      assert.deepEqual(Array.from(output.subarray(i, i + 4)), [
        x % 256,
        y % 256,
        93,
        17,
      ]);
    }
});
test("saved batch settings are validated and resize keeps each file's proportions", () => {
  const settings: BatchSettings = {
    outputFormat: "image/png",
    quality: 80,
    backgroundColor: "#ffffff",
    targetEnabled: false,
    targetKilobytes: 200,
    resizeMode: "width",
    resizeWidth: 600,
    resizeHeight: 400,
    resizePercentage: 50,
    aspectLocked: true,
    preventUpscale: true,
  };
  assert.ok(isBatchSettings(settings));
  assert.equal(isBatchSettings({ ...settings, quality: NaN }), false);
  assert.equal(
    isBatchSettings({ ...settings, outputFormat: "image/svg+xml" }),
    false,
  );
  assert.deepEqual(
    getBatchResizeDimensions({ width: 1200, height: 800 }, settings),
    { width: 600, height: 400 },
  );
  assert.deepEqual(
    getBatchResizeDimensions({ width: 300, height: 200 }, settings),
    { width: 300, height: 200 },
  );
  assert.throws(
    () =>
      getBatchResizeDimensions(
        { width: 1200, height: 800 },
        { ...settings, resizeWidth: Infinity },
      ),
    RangeError,
  );
});
