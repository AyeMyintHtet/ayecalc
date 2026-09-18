# Image upscaler model

The AI Image Upscaler uses `Xenova/swin2SR-lightweight-x2-64` at revision `92a21aca5713f20faf9a87590cdfbdce2e34112c`, using the FP32 ONNX weights (8,078,888 bytes) with Transformers.js and ONNX Runtime Web.

- [ONNX model and usage](https://huggingface.co/Xenova/swin2SR-lightweight-x2-64)
- [Original model](https://huggingface.co/caidas/swin2SR-lightweight-x2-64)
- [Swin2SR research and implementation](https://github.com/mv-lab/swin2sr)
- [Swin2SR paper](https://arxiv.org/abs/2209.11345)
- [Apache 2.0 license](public/licenses/swin2sr.txt), copied from the upstream project's LICENSE without modification.

The model weights are downloaded to the visitor's browser on demand. AyeCalc does not alter the weights. AyeCalc's wrapper processes overlapping tiles and preserves a separately resized alpha channel. Model output estimates detail and can contain artifacts; it is not evidence that missing details were present in an original photo.

The page documents first-use network downloads, cache behavior, device limits, PNG output, and metadata removal. Keep the revision and license notices current when intentionally changing the model, and recheck inference and memory behavior before release.
