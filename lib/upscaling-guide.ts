import type { GuideDefinition } from "./guides";

export const upscalingGuide: GuideDefinition = {
  slug: "ai-upscaling-vs-resizing",
  title: "AI Upscaling vs. Resizing: Which Does Your Photo Need?",
  description:
    "Understand when to use AI photo enhancement, standard resizing, or compression, with a 2× resolution example and a practical image-quality checklist.",
  introduction:
    "Making an image larger, making it look clearer, and making its file smaller are different tasks. Choose the operation that solves the problem you can actually see.",
  category: "Image quality guide",
  reviewed: "September 18, 2026",
  lastModified: "2026-09-18T00:00:00.000Z",
  sections: [
    {
      id: "choose",
      title: "Start with the output you need",
      paragraphs: [
        "Use standard resizing when a website or application needs specific dimensions. Use compression when the dimensions are right but the file is too large. Consider AI upscaling when you have a small photo and want a larger version with model-estimated detail.",
      ],
      bullets: [
        "Exact width or height: image resizer.",
        "Smaller download: image compressor.",
        "Larger small photo: AI image upscaler.",
        "Different format or transparent output: image format converter.",
      ],
    },
    {
      id: "pixels",
      title: "What 2× resolution actually means",
      paragraphs: [
        "An 800 × 600 image contains 480,000 pixels. Doubling the width and height gives 1600 × 1200 pixels, or 1,920,000 pixels overall. The file does not necessarily become exactly four times larger because its format, content, and encoding also matter.",
        "Ordinary interpolation fills the larger grid using surrounding pixels. A super-resolution model uses learned patterns to estimate edges and textures. Both produce more pixels; neither can guarantee that new details match the original scene.",
      ],
    },
    {
      id: "check",
      title: "Inspect the result before using it",
      paragraphs: [
        "Compare the original and enhanced image at similar display sizes, then inspect the exported file at full size. Look closely at faces, small letters, repeating patterns, and high-contrast edges. A smoother result can still contain inaccurate details.",
      ],
      bullets: [
        "Check for halos, artificial textures, and visible tile boundaries.",
        "Do not treat newly legible-looking text as recovered evidence.",
        "Keep the source file and compare alternative sizes.",
        "Use the original when the enhanced version changes meaningful details.",
      ],
    },
    {
      id: "workflow",
      title: "A practical workflow for a website image",
      paragraphs: [
        "Start with the highest-quality source you have. Convert an unsupported HEIC photo to JPG first. If the input exceeds the upscaler’s limit, decide whether it already has enough resolution; resizing a large photo down only to upscale it again often adds unnecessary work.",
        "For a genuinely small photo, run the 2× enhancer, inspect the result, and resize to the actual display dimensions if necessary. Compress or convert the final export to avoid sending an unnecessarily large PNG to visitors. Save the image with useful alternative text in your website.",
      ],
    },
    {
      id: "privacy",
      title: "Know what stays in the exported file",
      paragraphs: [
        "AyeCalc’s upscaler runs on your device after downloading model and runtime assets. Its PNG export keeps a resized alpha channel but does not copy EXIF, embedded location information, or Content Credentials. Local processing does not mean that exported metadata is preserved.",
        "The current tool accepts still JPEG, PNG, and WebP inputs up to 15 MB, with a 1-megapixel desktop limit and a 0.5-megapixel limit on smaller or lower-memory devices. Processing speed depends on your browser and hardware. Keep the original whenever provenance or camera information matters.",
      ],
    },
  ],
  sources: [
    {
      label: "Swin2SR: super-resolution and restoration research",
      href: "https://arxiv.org/abs/2209.11345",
    },
    {
      label: "Swin2SR lightweight 2× model",
      href: "https://huggingface.co/caidas/swin2SR-lightweight-x2-64",
    },
  ],
  relatedToolSlugs: [
    "ai-image-upscaler",
    "image-resizer",
    "image-compressor",
    "content-credentials-inspector",
  ],
};
