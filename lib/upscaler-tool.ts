import type { DeveloperToolDefinition } from "./developer-tools";

export const upscalerTool: DeveloperToolDefinition = {
  slug: "ai-image-upscaler",
  title: "AI Image Upscaler & Photo Enhancer",
  shortTitle: "AI Image Upscaler",
  seoTitle: "Free AI Image Upscaler & Photo Enhancer — 2×",
  socialImage: "/ai-image-upscaler/opengraph-image",
  searchTerms: [
    "AI image upscaler",
    "photo enhancer",
    "2x image upscaler",
    "increase image resolution",
    "enhance photo quality",
  ],
  category: "Image tools",
  reviewed: "September 18, 2026",
  lastModified: "2026-09-18T00:00:00.000Z",
  description:
    "Upscale images 2× with a free AI photo enhancer. Compare before and after, then download a PNG. No sign-up, no added watermark, and local processing.",
  introduction:
    "Enlarge a small photo to twice its width and height with AI super-resolution. Compare the original with the enhanced result and download a PNG without an added watermark. Your image is processed on your device.",
  formula: "Output width = input width × 2; output height = input height × 2",
  formulaNote:
    "Doubling both dimensions produces four times as many pixels. More pixels do not guarantee more accurate detail; the model estimates visual patterns.",
  method:
    "AyeCalc uses the Swin2SR lightweight 2× super-resolution model. The browser downloads its model weights and runtime when you start enhancement. A worker processes overlapping image tiles, crops the context around each tile, and stitches the enhanced pixels into one image. The original alpha channel is resized separately so transparent PNG and WebP inputs can retain transparency. The output is encoded as PNG.",
  exampleTitle: "Enlarge an 800 × 600 photo to 1600 × 1200",
  exampleText:
    "An 800 × 600 source contains 480,000 pixels. At 2×, the export measures 1600 × 1200 and contains 1,920,000 pixels. At a chosen print density of 300 pixels per inch, those dimensions correspond to about 5.33 × 4 inches. Inspect faces, lettering, and edges before using the result; the model cannot verify or recover information that the original did not capture.",
  guidance:
    "Start with the best original you have. This tool is intended for small photos and supports still JPEG, PNG, and WebP files up to 15 MB. The input limit is 1 megapixel on typical desktops and 0.5 megapixels on smaller or lower-memory devices, with each dimension between 8 and 4,096 pixels. Use the image resizer first for larger files. Compare the result at full size, then compress or convert it if the PNG is too large for your website.",
  limitation:
    "AI enhancement may invent textures, alter faces or text, introduce artifacts, or leave blur unchanged. It is not a way to recover reliable evidence or read illegible documents. Large photos can take several minutes. This version provides 2× upscaling only, requires WebAssembly, Web Workers, OffscreenCanvas, and a first-use network download, and does not support animation or HEIC input. Export removes EXIF, other embedded metadata, and Content Credentials; keep the original file.",
  benefits: ["2× resolution", "Runs on your device", "No added watermark"],
  codeSnippets: [
    {
      label: "Example export dimensions",
      code: "Original: 800 × 600 px\nEnhanced: 1600 × 1200 px\nDownload: PNG with transparency\nMetadata: removed from the new file",
    },
  ],
  faqs: [
    {
      question: "How do I upscale an image for free?",
      answer:
        "Choose a JPEG, PNG, or WebP photo, select Enhance image, and wait for local processing. Move the comparison slider to inspect the result, then download the 2× PNG. No account or payment is required.",
    },
    {
      question: "Is AI upscaling different from resizing?",
      answer:
        "A standard resizer interpolates pixels to change dimensions. This AI upscaler uses a learned model to estimate textures and edges while doubling the dimensions. It may make a photo look clearer, but it can also introduce inaccurate details.",
    },
    {
      question: "Are my photos uploaded to a server?",
      answer:
        "No. AyeCalc processes the selected photo in a worker on your device. On first use, your browser requests model and runtime files from Hugging Face and jsDelivr; those providers receive normal asset-request information, but the photo is not included. Software assets may be cached by your browser.",
    },
    {
      question: "Can I upscale to 4× or 4K?",
      answer:
        "This tool currently supports 2× enlargement only. The exact output depends on your input dimensions. It does not promise 4K output or support a separate 4× mode.",
    },
    {
      question: "Can a photo enhancer fix a blurry image?",
      answer:
        "It may improve the appearance of some edges and textures. Results depend on the original photo, and severe blur, unreadable lettering, and missing detail cannot be reliably recovered. Always compare the result with the original.",
    },
    {
      question: "Does the download contain a watermark?",
      answer:
        "AyeCalc does not add a watermark. The tool does not remove watermarks that already appear in your source image.",
    },
    {
      question: "Why is enhancement slow on my phone?",
      answer:
        "The model runs on your device instead of a remote GPU. Processing speed depends on your hardware, browser, image dimensions, and the initial download. The smaller mobile image limit helps reduce memory use. You can cancel processing or try a smaller photo.",
    },
    {
      question: "What happens to transparency and metadata?",
      answer:
        "The PNG export keeps a resized version of the original transparency. EXIF, camera information, location metadata, and Content Credentials are not copied. Keep the source image if that information matters.",
    },
  ],
  source: {
    label: "Swin2SR model and Transformers.js usage",
    href: "https://huggingface.co/Xenova/swin2SR-lightweight-x2-64",
  },
  additionalSources: [
    {
      label: "Swin2SR research paper",
      href: "https://arxiv.org/abs/2209.11345",
    },
    {
      label: "Original model and Apache 2.0 license",
      href: "https://huggingface.co/caidas/swin2SR-lightweight-x2-64",
    },
  ],
};
