import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyCredentialSummary,
  formatDigitalSourceType,
  makeJsonSafe,
  resolveCredentialImageMime,
  summarizeCredentialStore,
  summarizeMetadata,
  validateCredentialImageFile,
} from "../lib/content-credentials.ts";

test("accepts supported image MIME types and extension fallbacks", () => {
  assert.equal(
    resolveCredentialImageMime({ name: "photo.JPG", type: "" }),
    "image/jpeg",
  );
  assert.equal(
    resolveCredentialImageMime({ name: "capture.heic", type: "image/heic" }),
    "image/heic",
  );
  assert.equal(
    validateCredentialImageFile({ name: "vector.svg", type: "image/svg+xml", size: 20 }),
    "Use a JPEG, PNG, WebP, AVIF, HEIC, HEIF, TIFF, or GIF image.",
  );
});

test("summarizes trusted credentials, actions, and AI disclosure", () => {
  const summary = summarizeCredentialStore({
    active_manifest: "example:manifest",
    validation_state: "Trusted",
    validation_results: {
      activeManifest: {
        success: [
          { code: "claimSignature.validated" },
          { code: "signingCredential.trusted" },
        ],
        informational: [{ code: "signingCredential.ocsp.skipped" }],
        failure: [],
      },
    },
    manifests: {
      "example:manifest": {
        title: "generated-image.jpg",
        format: "image/jpeg",
        claim_generator_info: [{ name: "Example Editor", version: "2.0" }],
        signature_info: {
          common_name: "Example Signer",
          issuer: "Example CA",
          alg: "Es256",
          time: "2026-09-11T08:00:00Z",
        },
        ingredients: [{ title: "source.jpg" }],
        assertions: [
          {
            label: "c2pa.actions.v2",
            data: {
              actions: [
                {
                  action: "c2pa.created",
                  softwareAgent: { name: "Example Editor", version: "2.0" },
                  parameters: {
                    digitalSourceType:
                      "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  assert.equal(summary.state, "trusted");
  assert.equal(summary.generator, "Example Editor 2.0");
  assert.equal(summary.signer, "Example Signer");
  assert.equal(summary.ingredientCount, 1);
  assert.equal(summary.actions[0]?.action, "Created");
  assert.equal(summary.actions[0]?.sourceType, "Created using generative AI");
  assert.equal(summary.aiDisclosed, true);
  assert.equal(summary.successCodes.length, 2);
});

test("keeps missing credentials neutral and surfaces validation failures", () => {
  assert.deepEqual(emptyCredentialSummary().state, "not-found");

  const invalid = summarizeCredentialStore({
    active_manifest: "example:manifest",
    validation_results: {
      activeManifest: {
        success: [],
        informational: [],
        failure: [{ code: "assertion.dataHash.mismatch" }],
      },
    },
    manifests: { "example:manifest": { assertions: [] } },
  });

  assert.equal(invalid.state, "invalid");
  assert.equal(invalid.failureCodes[0]?.code, "assertion.dataHash.mismatch");
});

test("does not confuse an unrecognized signer with broken integrity", () => {
  const valid = summarizeCredentialStore({
    validation_results: {
      activeManifest: {
        success: [{ code: "claimSignature.validated" }],
        informational: [],
        failure: [{ code: "signingCredential.untrusted" }],
      },
    },
    manifests: { manifest: { assertions: [] } },
  });

  assert.equal(valid.state, "valid");
});

test("organizes IPTC and XMP metadata and flags GPS and AI fields", () => {
  const report = summarizeMetadata({
    iptc: {
      Byline: "A. Photographer",
      Credit: "Example Newsroom",
      CopyrightNotice: "© Example",
    },
    Iptc4xmpExt: {
      AISystemUsed: "Example Generator",
      DigitalSourceType:
        "http://cv.iptc.org/newscodes/digitalsourcetype/compositeSynthetic",
    },
    gps: { latitude: 13.7563, longitude: 100.5018 },
  });

  assert.equal(report.groups.length, 3);
  assert.equal(report.fieldCount, 7);
  assert.equal(report.hasGps, true);
  assert.equal(report.aiDisclosed, true);
  assert.deepEqual(report.sourceTypes, ["Composite including generative AI elements"]);
  assert.equal(report.insights.some((item) => item.label === "Creator"), true);
  assert.equal(report.insights.some((item) => item.label === "GPS coordinates"), true);
});

test("formats current IPTC source terms and summarizes binary report data", () => {
  assert.equal(
    formatDigitalSourceType(
      "http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia",
    ),
    "Edited using generative AI",
  );
  assert.deepEqual(makeJsonSafe({ profile: new Uint8Array([1, 2, 3]) }), {
    profile: "[binary data · 3 bytes]",
  });
});
