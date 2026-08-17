import { createPageMetadata } from "@/lib/metadata";

export type DeveloperToolDefinition = {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  introduction: string;
  formula: string;
  formulaNote: string;
  method: string;
  exampleTitle: string;
  exampleText: string;
  guidance: string;
  limitation: string;
  benefits: string[];
  codeSnippets: Array<{ label: string; code: string }>;
  faqs: Array<{ question: string; answer: string }>;
  source: { label: string; href: string };
};

export const developerTools: DeveloperToolDefinition[] = [
  {
    slug: "css-clamp-generator",
    title: "CSS Clamp Generator & Fluid Typography Calculator",
    shortTitle: "CSS Clamp Generator",
    category: "CSS typography",
    description:
      "Generate a responsive CSS clamp() value from minimum and maximum font sizes and viewport widths, with pixel and REM output.",
    introduction:
      "Create a fluid CSS value that scales smoothly between two viewport widths without exceeding your chosen minimum or maximum. Use the result for responsive typography, spacing, widths, and other length properties.",
    formula: "preferred = intercept + slope × 1vw",
    formulaNote:
      "The generated value uses clamp(minimum, preferred fluid value, maximum).",
    method:
      "Calculate the size change per viewport pixel, convert that rate to a vw coefficient, and solve the linear equation for its intercept. The minimum and maximum arguments keep the preferred value inside the intended range.",
    exampleTitle: "Scale text from 16px to 32px between 320px and 1280px",
    exampleText:
      "The slope is 1.6667vw and the intercept is 10.6667px, producing clamp(16px, 10.6667px + 1.6667vw, 32px). At 320px the result is 16px; at 1280px it is 32px.",
    guidance:
      "Choose viewport bounds that reflect the layout rather than device names. Test the generated value at the minimum, midpoint, maximum, and with browser zoom. For text, keep line height and measure readable as font size changes.",
    limitation:
      "A mathematically fluid font size is not automatically accessible. Very small minimums, extreme scaling, fixed-height containers, and viewport-only sizing can still cause readability or overflow problems.",
    benefits: ["Pixel and REM output", "Copy-ready CSS", "No network calculation"],
    codeSnippets: [
      {
        label: "CSS",
        code: ".heading {\n  font-size: clamp(1rem, 0.6667rem + 1.6667vw, 2rem);\n}",
      },
      {
        label: "CSS custom properties",
        code: ":root {\n  --step-fluid: clamp(1rem, 0.6667rem + 1.6667vw, 2rem);\n}\n\nh1 { font-size: var(--step-fluid); }",
      },
      {
        label: "JavaScript",
        code: "const slope = (maxSize - minSize) / (maxWidth - minWidth);\nconst vw = slope * 100;\nconst intercept = minSize - slope * minWidth;",
      },
    ],
    faqs: [
      {
        question: "What does CSS clamp() do?",
        answer:
          "clamp() accepts a minimum, a preferred value, and a maximum. The browser uses the preferred value while keeping it between the two limits.",
      },
      {
        question: "Can I use the result for spacing as well as font size?",
        answer:
          "Yes. A compatible clamp() length can be used for padding, margin, gap, width, and other CSS properties that accept length values.",
      },
      {
        question: "Why provide a root font size?",
        answer:
          "The root font size is needed to express the fixed parts of the formula in rem. A common default is 16px, but projects and user settings can differ.",
      },
      {
        question: "Should fluid text use only viewport units?",
        answer:
          "No. Combining a relative fixed unit such as rem with a viewport term preserves scaling while avoiding a value controlled only by viewport width.",
      },
    ],
    source: {
      label: "W3C CSS Values and Units Level 4: comparison functions",
      href: "https://www.w3.org/TR/css-values-4/#comp-func",
    },
  },
  {
    slug: "rem-em-px-converter",
    title: "REM, EM & PX Converter",
    shortTitle: "REM/EM/PX Matrix",
    category: "CSS units",
    description:
      "Convert one CSS length across PX, REM, and EM with adjustable root and element font sizes and a live comparison matrix.",
    introduction:
      "Compare document-relative rem, component-relative em, and pixel values in one place. Select the source unit and match both font-size contexts to your rendered interface.",
    formula: "px = rem × root size; px = em × element size",
    formulaNote:
      "REM uses the root element; EM uses the relevant element or inherited font-size context.",
    method:
      "Normalize the source value to pixels, then divide that pixel value by the root font size for rem and by the relevant element font size for em.",
    exampleTitle: "Compare 24px with a 16px root and 20px component",
    exampleText:
      "A 24px value equals 1.5rem when the root is 16px, but it equals 1.2em inside a component whose effective font size is 20px.",
    guidance:
      "Use rem for values that should follow a document-level scale and em for component-local relationships. Inspect computed styles when inheritance or responsive rules make the context unclear.",
    limitation:
      "EM behavior depends on the CSS property and inheritance context. When em is used on font-size itself, it resolves from the parent font size rather than the final size of the element.",
    benefits: ["Three-way matrix", "Adjustable contexts", "CSS token output"],
    codeSnippets: [
      {
        label: "CSS",
        code: "html { font-size: 16px; }\n.component { font-size: 20px; }\n.title { font-size: 1.5rem; } /* 24px */",
      },
      {
        label: "JavaScript",
        code: "const pixels = rem * rootFontSize;\nconst em = pixels / elementFontSize;",
      },
    ],
    faqs: [
      {
        question: "Is 1rem always 16px?",
        answer:
          "No. It is 16px only when the computed root font size is 16px. The calculator lets you enter the actual root size.",
      },
      {
        question: "Is 1em always equal to 1rem?",
        answer:
          "Only when the relevant element font size equals the root font size. They refer to different contexts.",
      },
      {
        question: "Which unit is better for design systems?",
        answer:
          "REM is often convenient for shared tokens, while em is useful for component-local scaling. The better choice depends on the relationship you want to preserve.",
      },
      {
        question: "Why can nested EM values compound?",
        answer:
          "Each nested font-size expressed in em can establish a new computed context for descendants, so repeated scaling can multiply.",
      },
    ],
    source: {
      label: "W3C CSS Values and Units: font-relative lengths",
      href: "https://www.w3.org/TR/css-values-3/#font-relative-lengths",
    },
  },
  {
    slug: "tailwind-spacing-converter",
    title: "Tailwind Spacing Converter",
    shortTitle: "Tailwind Spacing Converter",
    category: "Tailwind CSS",
    description:
      "Convert Tailwind spacing numbers to REM and pixels using an adjustable spacing variable and root font size, with utility examples.",
    introduction:
      "Translate a Tailwind spacing multiplier such as 4, 6, or 8 into its CSS length. The default reflects Tailwind CSS v4's 0.25rem spacing variable and remains configurable for custom themes.",
    formula: "length = spacing number × --spacing",
    formulaNote:
      "With --spacing: 0.25rem and a 16px root, spacing 4 equals 1rem or 16px.",
    method:
      "Multiply the numeric utility value by the configured --spacing theme variable. Convert rem to pixels by multiplying by the root font size.",
    exampleTitle: "Convert Tailwind spacing 6 with the default theme variable",
    exampleText:
      "Spacing 6 multiplied by 0.25rem equals 1.5rem. At a 16px root font size, the computed equivalent is 24px, as in p-6 or gap-6.",
    guidance:
      "Check the --spacing value in the actual project before treating a lookup as fixed. Tailwind v4 derives many numeric spacing utilities dynamically, and a custom theme can change every result.",
    limitation:
      "This tool converts numeric spacing utilities. Keywords, fractions, arbitrary values, container sizes, and project-specific utility definitions may follow different rules.",
    benefits: ["Tailwind v4 model", "Custom theme support", "Utility examples"],
    codeSnippets: [
      {
        label: "Tailwind HTML",
        code: "<div class=\"p-6 gap-6\">\n  <!-- 1.5rem with the default spacing variable -->\n</div>",
      },
      {
        label: "Tailwind theme",
        code: "@import \"tailwindcss\";\n\n@theme {\n  --spacing: 0.25rem;\n}",
      },
      {
        label: "Generated CSS model",
        code: ".p-6 {\n  padding: calc(var(--spacing) * 6);\n}",
      },
    ],
    faqs: [
      {
        question: "What is Tailwind's default spacing variable?",
        answer:
          "Tailwind CSS v4 derives numeric spacing utilities from --spacing, shown as 0.25rem in the default framework output. Projects can customize it.",
      },
      {
        question: "How many pixels is p-4?",
        answer:
          "With --spacing set to 0.25rem, p-4 is 1rem. At a 16px root font size, that computes to 16px.",
      },
      {
        question: "Does this work for negative margin utilities?",
        answer:
          "The magnitude uses the same spacing calculation. A negative utility applies the negative of that result.",
      },
      {
        question: "Does it cover arbitrary values like p-[18px]?",
        answer:
          "No conversion is needed for arbitrary values because the value is written directly. This calculator targets numeric utilities derived from --spacing.",
      },
    ],
    source: {
      label: "Tailwind CSS spacing documentation",
      href: "https://tailwindcss.com/docs/margin#customizing-your-theme",
    },
  },
  {
    slug: "aspect-ratio-calculator",
    title: "Aspect Ratio Calculator",
    shortTitle: "Aspect Ratio Calculator",
    category: "Responsive layout",
    description:
      "Simplify width and height into an aspect ratio, calculate a proportional target height, and copy CSS aspect-ratio code.",
    introduction:
      "Reduce any width and height to a reusable ratio and resize the dimensions proportionally. Use the result for images, video, cards, embeds, and responsive containers.",
    formula: "ratio = width ÷ height",
    formulaNote:
      "For a target width: target height = target width × original height ÷ original width.",
    method:
      "Reduce whole-number dimensions by their greatest common divisor. For decimal dimensions, normalize them before reduction. Preserve the original width-to-height quotient when calculating a new size.",
    exampleTitle: "Simplify 1920 × 1080 and resize it to 1280px wide",
    exampleText:
      "Dividing both dimensions by their greatest common divisor, 120, produces 16:9. A proportional width of 1280px produces a height of 720px.",
    guidance:
      "Use intrinsic media dimensions when available. Pair CSS aspect-ratio with a defined width or height and an appropriate object-fit rule for cropped media.",
    limitation:
      "A matching container ratio does not guarantee uncropped content. object-fit, intrinsic media dimensions, borders, and layout constraints still affect rendering.",
    benefits: ["Simplified ratio", "Proportional resize", "Copy-ready CSS"],
    codeSnippets: [
      {
        label: "CSS",
        code: ".media {\n  width: 100%;\n  aspect-ratio: 16 / 9;\n  object-fit: cover;\n}",
      },
      {
        label: "HTML",
        code: "<img src=\"image.jpg\" width=\"1920\" height=\"1080\" alt=\"\">",
      },
    ],
    faqs: [
      {
        question: "How do I calculate an aspect ratio?",
        answer:
          "Divide width and height by their greatest common divisor. For 1920×1080, divide both by 120 to get 16:9.",
      },
      {
        question: "What is the difference between 16:9 and 1.7778?",
        answer:
          "They describe the same width-to-height relationship. 16:9 is the simplified pair, while 1.7778 is its approximate decimal quotient.",
      },
      {
        question: "Can CSS aspect-ratio prevent layout shift?",
        answer:
          "It can reserve a predictable box when one dimension is known, but media should still include accurate intrinsic dimensions when possible.",
      },
      {
        question: "Does object-fit change the aspect ratio?",
        answer:
          "It changes how replaced content fits inside its box. cover can crop content, while contain can leave unused space.",
      },
    ],
    source: {
      label: "W3C CSS Sizing Level 4: preferred aspect ratios",
      href: "https://www.w3.org/TR/css-sizing-4/#aspect-ratio",
    },
  },
  {
    slug: "color-converter",
    title: "HEX, RGB & HSL Color Converter",
    shortTitle: "Color Converter",
    category: "CSS color",
    description:
      "Convert HEX colors to RGB and HSL instantly, including alpha values, with a live preview and copyable CSS output.",
    introduction:
      "Enter a CSS hexadecimal color and get equivalent RGB and HSL notation. The converter supports short and full hexadecimal forms with optional alpha transparency.",
    formula: "RGB channels → hue, saturation, and lightness",
    formulaNote:
      "HEX stores RGB channel bytes; HSL describes the same sRGB color by hue, saturation, and lightness.",
    method:
      "Expand short hexadecimal notation, parse each channel from base 16, normalize the RGB channels, then calculate the maximum, minimum, chroma, hue sector, saturation, and lightness.",
    exampleTitle: "Convert #67e5b4 to RGB and HSL",
    exampleText:
      "The hexadecimal channels are 103 red, 229 green, and 180 blue. The equivalent CSS values are rgb(103 229 180) and approximately hsl(157 71% 65%).",
    guidance:
      "Use the notation that best supports the workflow. HEX is compact, RGB exposes channels and alpha clearly, and HSL can be convenient for systematic lightness or saturation adjustments.",
    limitation:
      "The converter works in the sRGB color space. Wide-gamut color spaces such as display-p3 and perceptual models such as OKLCH require different conversions.",
    benefits: ["Alpha support", "Live color preview", "Three CSS formats"],
    codeSnippets: [
      {
        label: "CSS HEX",
        code: ".button { background: #67e5b4; }",
      },
      {
        label: "CSS RGB",
        code: ".button { background: rgb(103 229 180); }",
      },
      {
        label: "CSS HSL",
        code: ".button { background: hsl(157 71% 65%); }",
      },
    ],
    faqs: [
      {
        question: "Does HEX support transparency?",
        answer:
          "Yes. Four-digit #RGBA and eight-digit #RRGGBBAA notation include an alpha channel.",
      },
      {
        question: "Does converting between HEX, RGB, and HSL change the color?",
        answer:
          "They can represent the same sRGB color. Rounding HSL values may produce a tiny difference if converted repeatedly.",
      },
      {
        question: "What range does an RGB channel use?",
        answer:
          "Traditional CSS RGB channels use 0 through 255, while modern CSS also supports percentage and other color syntaxes.",
      },
      {
        question: "What does HSL lightness mean?",
        answer:
          "Zero percent is black, 100 percent is white, and 50 percent is the midpoint for the selected hue and saturation.",
      },
    ],
    source: {
      label: "W3C CSS Color Module Level 4",
      href: "https://www.w3.org/TR/css-color-4/",
    },
  },
  {
    slug: "viewport-unit-converter",
    title: "PX to VW, VH, Vmin & Vmax Converter",
    shortTitle: "Viewport Unit Converter",
    category: "Responsive CSS",
    description:
      "Convert pixels to VW, VH, Vmin, and Vmax using an adjustable viewport width and height, with copyable CSS results.",
    introduction:
      "See how a pixel measurement relates to four viewport-percentage units at a specific viewport size. Compare width-, height-, smaller-axis-, and larger-axis-relative values together.",
    formula: "vw = px ÷ viewport width × 100",
    formulaNote:
      "VH uses viewport height; vmin uses the smaller dimension; vmax uses the larger dimension.",
    method:
      "Divide the pixel value by the relevant viewport dimension and multiply by 100. One vw equals one percent of viewport width, while one vh equals one percent of viewport height.",
    exampleTitle: "Convert 32px in a 1440 × 900 viewport",
    exampleText:
      "32px equals about 2.2222vw, 3.5556vh, 3.5556vmin, or 2.2222vmax at that viewport size.",
    guidance:
      "Treat the result as context-specific. For resilient typography and spacing, combine viewport units with rem and safe limits instead of assuming one viewport size.",
    limitation:
      "Viewport dimensions change across devices, window sizes, orientation, zoom, scrollbars, and mobile browser UI. New small, large, and dynamic viewport units can behave differently from the default units.",
    benefits: ["Four viewport units", "Custom viewport", "Copy-ready values"],
    codeSnippets: [
      {
        label: "CSS width-relative",
        code: ".element { width: 2.2222vw; } /* 32px at 1440px */",
      },
      {
        label: "CSS guarded value",
        code: ".element { padding: clamp(1rem, 2.2222vw, 2rem); }",
      },
    ],
    faqs: [
      {
        question: "What is 1vw in pixels?",
        answer:
          "It is one percent of the current viewport width. At 1440px wide, 1vw corresponds to 14.4px.",
      },
      {
        question: "What is the difference between vmin and vmax?",
        answer:
          "vmin uses one percent of the smaller viewport dimension; vmax uses one percent of the larger dimension.",
      },
      {
        question: "Are viewport units fixed pixel values?",
        answer:
          "No. Their pixel equivalent changes whenever the relevant viewport dimension changes.",
      },
      {
        question: "Should I use vw for font size?",
        answer:
          "Viewport units can support fluid scaling, but combine them with rem and minimum and maximum limits to protect readability and zoom behavior.",
      },
    ],
    source: {
      label: "W3C CSS Values and Units Level 4: viewport-percentage lengths",
      href: "https://www.w3.org/TR/css-values-4/#viewport-relative-lengths",
    },
  },
  {
    slug: "contrast-checker",
    title: "WCAG Color Contrast Checker",
    shortTitle: "Contrast Checker",
    category: "Accessibility",
    description:
      "Check two HEX colors against WCAG 2.2 AA and AAA text contrast thresholds with a live preview and exact contrast ratio.",
    introduction:
      "Compare foreground and background colors using WCAG relative luminance. Review normal-text and large-text thresholds without sending color values to a server.",
    formula: "contrast = (lighter luminance + 0.05) ÷ (darker luminance + 0.05)",
    formulaNote:
      "WCAG AA requires 4.5:1 for normal text and 3:1 for large text; AAA uses 7:1 and 4.5:1.",
    method:
      "Convert sRGB channels to linear-light values, combine them into relative luminance, identify the lighter and darker colors, and apply the WCAG contrast-ratio formula.",
    exampleTitle: "Check #10221d text on #fffefa",
    exampleText:
      "This dark green text on a warm near-white background produces a high contrast ratio that passes AA and AAA thresholds for normal and large text.",
    guidance:
      "Check every interactive state and actual text size and weight. Contrast is one accessibility requirement; readable typography, visible focus, non-color cues, and usable interaction remain necessary.",
    limitation:
      "A passing mathematical ratio does not guarantee readability over gradients, images, transparency, thin fonts, anti-aliasing, or altered display conditions. Test the rendered interface as well.",
    benefits: ["WCAG 2.2 thresholds", "Normal and large text", "Live preview"],
    codeSnippets: [
      {
        label: "CSS custom properties",
        code: ":root {\n  --text: #10221d;\n  --background: #fffefa;\n}\n\nbody { color: var(--text); background: var(--background); }",
      },
      {
        label: "Contrast formula",
        code: "const ratio = (lighter + 0.05) / (darker + 0.05);",
      },
    ],
    faqs: [
      {
        question: "What contrast ratio passes WCAG AA?",
        answer:
          "Normal text requires at least 4.5:1. Large text requires at least 3:1 under WCAG 2.2 Success Criterion 1.4.3.",
      },
      {
        question: "What counts as large text?",
        answer:
          "WCAG defines large-scale text using point-size and boldness conditions. Check the official definition rather than assuming any heading automatically qualifies.",
      },
      {
        question: "Does AAA require 7:1 for every text size?",
        answer:
          "AAA uses 7:1 for normal text and 4.5:1 for large text, subject to the exceptions described by WCAG.",
      },
      {
        question: "Is color contrast enough for accessibility?",
        answer:
          "No. It must be combined with semantic structure, keyboard access, focus visibility, usable text sizing, and information that does not rely on color alone.",
      },
    ],
    source: {
      label: "W3C Understanding WCAG 2.2: Contrast (Minimum)",
      href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum",
    },
  },
];

export function getDeveloperTool(slug: string) {
  return developerTools.find((tool) => tool.slug === slug);
}

export function createDeveloperToolMetadata(tool: DeveloperToolDefinition) {
  return createPageMetadata({
    title: tool.title,
    description: tool.description,
    path: `/${tool.slug}`,
    keywords: [
      tool.shortTitle.toLowerCase(),
      tool.title.toLowerCase(),
      `${tool.shortTitle.toLowerCase()} online`,
      tool.category.toLowerCase(),
    ],
    imageAlt: `${tool.shortTitle} on AyeCalc`,
  });
}
