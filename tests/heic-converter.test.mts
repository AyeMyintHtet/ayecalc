import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_HEIC_BATCH_BYTES,
  MAX_HEIC_FILE_BYTES,
  MAX_HEIC_FILES,
  calculateHeicOutputDimensions,
  createHeicOutputName,
  hasHeifSignature,
  probeHeifDimensions,
} from "../lib/heic-converter.ts";

function writeAscii(bytes: Uint8Array, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    bytes[offset + index] = value.charCodeAt(index);
  }
}

function createFtyp(majorBrand: string, compatibleBrand = "mif1") {
  const bytes = new Uint8Array(24);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, bytes.length, false);
  writeAscii(bytes, 4, "ftyp");
  writeAscii(bytes, 8, majorBrand);
  writeAscii(bytes, 16, compatibleBrand);
  return bytes;
}

test("uses bounded HEIC batch limits", () => {
  assert.equal(MAX_HEIC_FILES, 10);
  assert.equal(MAX_HEIC_FILE_BYTES, 100 * 1024 * 1024);
  assert.equal(MAX_HEIC_BATCH_BYTES, 200 * 1024 * 1024);
});

test("recognizes HEIC and HEIF file type brands", () => {
  assert.equal(hasHeifSignature(createFtyp("heic")), true);
  assert.equal(hasHeifSignature(createFtyp("mif1", "heix")), true);
  assert.equal(hasHeifSignature(createFtyp("avif", "avis")), false);
  assert.equal(hasHeifSignature(new Uint8Array([1, 2, 3, 4])), false);
});

test("reads image dimensions from an ispe property", () => {
  const bytes = new Uint8Array(20);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 20, false);
  writeAscii(bytes, 4, "ispe");
  view.setUint32(12, 4032, false);
  view.setUint32(16, 3024, false);

  assert.deepEqual(probeHeifDimensions(bytes), { width: 4032, height: 3024 });
  assert.equal(probeHeifDimensions(new Uint8Array(20)), null);
});

test("calculates aspect-safe resize modes", () => {
  assert.deepEqual(
    calculateHeicOutputDimensions(4032, 3024, "original", 100, true, 50_000_000),
    { width: 4032, height: 3024, safetyLimited: false },
  );
  assert.deepEqual(
    calculateHeicOutputDimensions(4032, 3024, "percentage", 50, true, 50_000_000),
    { width: 2016, height: 1512, safetyLimited: false },
  );
  assert.deepEqual(
    calculateHeicOutputDimensions(4032, 3024, "max-long-edge", 1920, true, 50_000_000),
    { width: 1920, height: 1440, safetyLimited: false },
  );
  assert.deepEqual(
    calculateHeicOutputDimensions(800, 600, "max-width", 1600, true, 50_000_000),
    { width: 800, height: 600, safetyLimited: false },
  );
});

test("limits oversized output and creates safe filenames", () => {
  const dimensions = calculateHeicOutputDimensions(
    6000,
    4000,
    "percentage",
    200,
    false,
    12_000_000,
  );
  assert.equal(dimensions.safetyLimited, true);
  assert.ok(dimensions.width * dimensions.height <= 12_000_000);
  assert.equal(
    createHeicOutputName("My Summer Photo.HEIC", "image/jpeg", "web copy"),
    "My-Summer-Photo-web-copy.jpg",
  );
  assert.equal(createHeicOutputName("photo.heif", "image/png", ""), "photo.png");
});
