import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_BACKGROUND_IMAGE_FILE_BYTES,
  MAX_BACKGROUND_IMAGE_PIXELS,
  MAX_IMAGE_FILE_BYTES,
  MAX_IMAGE_PIXELS,
  createCenteredCrop,
  getImagePixelLimitForDevice,
  getRotatedDimensions,
  validateImageFileBasics,
} from "../lib/image-tools.ts";

test("uses the expanded per-tool file and pixel limits", () => {
  assert.equal(MAX_IMAGE_FILE_BYTES, 100 * 1024 * 1024);
  assert.equal(MAX_IMAGE_PIXELS, 50_000_000);
  assert.equal(MAX_BACKGROUND_IMAGE_FILE_BYTES, 50 * 1024 * 1024);
  assert.equal(MAX_BACKGROUND_IMAGE_PIXELS, 25_000_000);
});

test("reduces pixel limits on lower-memory devices", () => {
  assert.equal(getImagePixelLimitForDevice(MAX_IMAGE_PIXELS), MAX_IMAGE_PIXELS);
  assert.equal(
    getImagePixelLimitForDevice(MAX_IMAGE_PIXELS, undefined, true),
    25_000_000,
  );
  assert.equal(getImagePixelLimitForDevice(MAX_IMAGE_PIXELS, 8), MAX_IMAGE_PIXELS);
  assert.equal(getImagePixelLimitForDevice(MAX_IMAGE_PIXELS, 4), 25_000_000);
  assert.equal(getImagePixelLimitForDevice(MAX_IMAGE_PIXELS, 2), 12_000_000);
  assert.equal(
    getImagePixelLimitForDevice(MAX_BACKGROUND_IMAGE_PIXELS, 2),
    12_000_000,
  );
});

test("validates file type and the selected tool's byte limit", () => {
  assert.equal(
    validateImageFileBasics({ type: "image/jpeg", size: MAX_IMAGE_FILE_BYTES }),
    "",
  );
  assert.match(
    validateImageFileBasics(
      { type: "image/png", size: MAX_BACKGROUND_IMAGE_FILE_BYTES + 1 },
      MAX_BACKGROUND_IMAGE_FILE_BYTES,
    ),
    /50 MB/,
  );
  assert.match(
    validateImageFileBasics({ type: "image/gif", size: 1024 }),
    /JPEG, PNG, or WebP/,
  );
});

test("calculates centered crops and rotated dimensions", () => {
  assert.deepEqual(createCenteredCrop(6000, 4000, 1), {
    x: 1000,
    y: 0,
    width: 4000,
    height: 4000,
  });
  assert.deepEqual(getRotatedDimensions(6000, 4000, 90), {
    width: 4000,
    height: 6000,
  });
  assert.deepEqual(getRotatedDimensions(6000, 4000, 180), {
    width: 6000,
    height: 4000,
  });
});
