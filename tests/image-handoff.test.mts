import assert from "node:assert/strict";
import test from "node:test";
import { stageImage, takeStagedImage } from "../lib/image-handoff.ts";

test("image transfers go only to the chosen tool and can be consumed once", () => {
  const file = new File([new Uint8Array([1, 2, 3])], "result.png", {
    type: "image/png",
  });
  stageImage(file, "/image-compressor");
  assert.equal(takeStagedImage("/ai-image-upscaler"), null);
  assert.equal(takeStagedImage("/image-compressor"), file);
  assert.equal(takeStagedImage("/image-compressor"), null);
});

test("unused transfers expire and a new transfer replaces the old image", (context) => {
  context.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 0 });
  const first = new File(["first"], "first.png");
  const second = new File(["second"], "second.png");
  stageImage(first, "/image-resizer");
  context.mock.timers.tick(60_000);
  stageImage(second, "/image-compressor");
  assert.equal(takeStagedImage("/image-resizer"), null);
  context.mock.timers.tick(4 * 60_000);
  assert.equal(takeStagedImage("/image-compressor"), second);
  stageImage(first, "/ai-image-upscaler");
  context.mock.timers.tick(5 * 60_000);
  assert.equal(takeStagedImage("/ai-image-upscaler"), null);
});
