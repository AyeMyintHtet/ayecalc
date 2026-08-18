import { createPageMetadata } from "@/lib/metadata";

export type DeveloperToolDefinition = {
  slug: string;
  title: string;
  shortTitle: string;
  seoTitle?: string;
  searchTerms?: string[];
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
    searchTerms: [
      "CSS clamp calculator",
      "CSS clamp maker",
      "clamp function calculator",
      "fluid typography generator",
      "fluid typography calculator",
      "fluid font size calculator",
      "responsive font size calculator",
      "responsive typography generator",
      "CSS fluid type scale",
      "fluid spacing calculator",
    ],
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
    searchTerms: [
      "PX REM EM converter",
      "CSS unit converter",
      "CSS unit calculator",
      "font size unit converter",
      "pixel REM converter",
      "pixel EM converter",
      "REM calculator",
      "EM calculator",
      "PX REM matrix",
      "relative unit converter",
    ],
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
    searchTerms: [
      "Tailwind spacing calculator",
      "Tailwind spacing scale",
      "Tailwind spacing chart",
      "Tailwind REM converter",
      "Tailwind PX converter",
      "Tailwind class spacing calculator",
      "Tailwind padding converter",
      "Tailwind margin converter",
      "Tailwind gap converter",
      "Tailwind spacing values",
    ],
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
    slug: "tailwind-grid-guide",
    title: "Tailwind Grid Guide & Visual Builder",
    shortTitle: "Tailwind Grid Builder",
    seoTitle: "Tailwind Grid Builder & Generator",
    searchTerms: [
      "tailwind grid builder",
      "tailwind grid generator",
      "tailwind grid maker",
      "tailwind grid editor",
      "tailwind grid playground",
      "tailwind layout builder",
      "tailwind layout generator",
      "responsive grid builder",
      "responsive grid generator",
      "responsive layout maker",
      "visual grid builder",
      "visual grid editor",
      "custom grid builder",
      "custom grid maker",
      "custom grid generator",
      "grid layout maker",
      "grid layout editor",
      "grid changer",
      "grid UI changer",
      "grid UI builder",
      "drag and drop grid builder",
      "CSS grid builder",
      "CSS grid generator",
      "bento grid builder",
      "Tailwind bento grid builder",
    ],
    category: "Tailwind CSS",
    description:
      "Build responsive Tailwind CSS grids visually with a custom grid maker. Drag, edit, resize, reorder, and delete blocks across every default breakpoint.",
    introduction:
      "Use this Tailwind grid builder as a visual grid maker, responsive layout editor, or grid UI builder. Arrange editable content blocks on a live canvas, set columns and gaps for each screen size, adjust every block's column and row span, and copy the generated Tailwind markup.",
    formula: "responsive utility = breakpoint prefix + grid utility",
    formulaNote:
      "Base utilities apply at every size; sm:, md:, lg:, xl:, and 2xl: override them from their minimum widths upward.",
    method:
      "Start with the unprefixed mobile layout, which acts as the base or XS view. Configure grid-template columns and gap, then move through Tailwind's mobile-first breakpoints. Each block combines col-span and row-span utilities at every breakpoint, while document order determines automatic grid placement.",
    exampleTitle: "Build a sidebar and main-content layout across six screen sizes",
    exampleText:
      "Use one column at the base size, two at sm, four at md, and progressively wider grids through 2xl. A sidebar can span the full base grid, one column at sm, and three of twelve columns at 2xl, while the main area uses the remaining tracks.",
    guidance:
      "Design the smallest layout first, keep source order meaningful, and add breakpoint overrides only where the content needs them. Check that column spans never exceed their active grid, avoid unnecessary row spans, and test the copied markup with real content at widths around every breakpoint.",
    limitation:
      "The preview models Tailwind's default breakpoints and common grid utilities. A project with custom breakpoints, custom spacing, dense auto-placement, explicit start lines, subgrid, or arbitrary templates may need manual changes after copying the markup.",
    benefits: ["Drag-and-drop blocks", "Six responsive layouts", "Live Tailwind markup"],
    codeSnippets: [
      {
        label: "Responsive Tailwind grid",
        code: '<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">\n  <aside class="col-span-1 md:col-span-1 lg:col-span-2">Sidebar</aside>\n  <main class="col-span-1 md:col-span-3 lg:col-span-4">Content</main>\n</div>',
      },
      {
        label: "Optional custom XS breakpoint",
        code: '@import "tailwindcss";\n\n@theme {\n  --breakpoint-xs: 30rem;\n}\n\n/* xs:grid-cols-2 now starts at 30rem */',
      },
      {
        label: "Mobile-first classes",
        code: '<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6">\n  <!-- Base classes apply first; prefixed classes override upward. -->\n</section>',
      },
    ],
    faqs: [
      {
        question: "Does Tailwind CSS include an XS breakpoint by default?",
        answer:
          "No. Tailwind's unprefixed utilities are the mobile or base layout below sm. The builder labels that view Base / XS. You can add a custom xs breakpoint with a --breakpoint-xs theme variable if the project needs one.",
      },
      {
        question: "How do I reorder Tailwind grid items?",
        answer:
          "Drag blocks on the canvas or use their arrow controls. The builder changes source order, allowing normal CSS Grid auto-placement to position the items without extra order utilities.",
      },
      {
        question: "Can every breakpoint use a different number of columns?",
        answer:
          "Yes. Base, sm, md, lg, xl, and 2xl each have independent column and gap controls. Every block also stores a separate column span and row span for each view.",
      },
      {
        question: "Will the generated classes work with Tailwind CSS v4?",
        answer:
          "Yes. The output uses complete grid-cols, gap, col-span, row-span, and responsive variant class names that Tailwind CSS v4 can detect in source files.",
      },
      {
        question: "Does the grid content leave my browser?",
        answer:
          "No. The builder keeps the layout and content in temporary browser state. Copying the generated markup uses the browser clipboard only when you choose the copy action.",
      },
      {
        question: "What can I create with this custom grid maker?",
        answer:
          "Use the visual grid editor for dashboard layouts, card collections, Tailwind bento grids, landing-page sections, sidebars, content feeds, galleries, and other responsive grid interfaces.",
      },
    ],
    source: {
      label: "Tailwind CSS grid-template-columns documentation",
      href: "https://tailwindcss.com/docs/grid-template-columns",
    },
  },
  {
    slug: "aspect-ratio-calculator",
    title: "Aspect Ratio Calculator",
    shortTitle: "Aspect Ratio Calculator",
    searchTerms: [
      "ratio calculator",
      "image aspect ratio calculator",
      "screen ratio calculator",
      "width height ratio calculator",
      "dimension ratio calculator",
      "resize aspect ratio calculator",
      "proportional resize calculator",
      "16:9 calculator",
      "image dimension calculator",
      "aspect ratio finder",
    ],
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
    searchTerms: [
      "HEX color converter",
      "color code converter",
      "HEX to RGB converter",
      "HEX to HSL converter",
      "HEX to RGBA converter",
      "CSS color converter",
      "color value converter",
      "HEX alpha converter",
      "RGB color calculator",
      "HSL color calculator",
    ],
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
    searchTerms: [
      "PX to VW calculator",
      "PX to VH calculator",
      "pixels to viewport units",
      "VW calculator",
      "VH calculator",
      "Vmin converter",
      "Vmax converter",
      "CSS viewport calculator",
      "responsive unit converter",
      "viewport percentage converter",
    ],
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
    searchTerms: [
      "color contrast checker",
      "WCAG contrast calculator",
      "accessibility contrast checker",
      "AA contrast checker",
      "AAA contrast checker",
      "text contrast checker",
      "contrast ratio calculator",
      "foreground background contrast",
      "website color accessibility checker",
      "HEX contrast checker",
    ],
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
  {
    slug: "image-resizer",
    title: "Free Image Resizer Online",
    shortTitle: "Image Resizer",
    searchTerms: [
      "resize image online",
      "photo resizer",
      "picture resizer",
      "image dimension changer",
      "resize image pixels",
      "batch image resizer",
      "image size changer",
      "resize JPEG PNG WebP",
      "private image resizer",
      "image resize tool",
      "change image dimensions",
      "resize photo online",
      "pixel image resizer",
      "image width height changer",
    ],
    category: "Image tools",
    description:
      "Resize JPEG, PNG, and WebP images by width, height, percentage, or exact dimensions with private batch processing in your browser.",
    introduction:
      "Resize up to ten images without uploading them. Preserve each image's aspect ratio, prevent accidental upscaling, apply common width presets, choose an output format, and download individual files or one ZIP archive.",
    formula: "output height = source height × output width ÷ source width",
    formulaNote:
      "Aspect-locked resizing applies one scale factor to both dimensions; exact mode can change width and height independently.",
    method:
      "The browser decodes each selected image, calculates the requested output dimensions, draws the pixels onto a new canvas with high-quality smoothing, and encodes a metadata-free JPEG, PNG, or WebP file.",
    exampleTitle: "Resize a 2400 × 1600 image to 1200 pixels wide",
    exampleText:
      "With the aspect ratio preserved, the scale factor is 0.5 and the output becomes 1200 × 800 pixels. Prevent-upscale mode leaves images smaller than the requested width at their original dimensions.",
    guidance:
      "Resize to the largest dimensions the final layout actually needs. Keep the aspect ratio locked for photographs and interface assets unless intentional distortion is required, and inspect text or fine detail after a large reduction.",
    limitation:
      "Upscaling cannot restore missing detail. Browser encoders can produce slightly different file sizes, color output, and compression artifacts, and generated files do not retain EXIF, camera, location, or resolution metadata.",
    benefits: ["Batch resize up to 10", "Aspect-safe dimensions", "Local processing"],
    codeSnippets: [
      {
        label: "Canvas resize",
        code: "canvas.width = outputWidth;\ncanvas.height = outputHeight;\ncontext.drawImage(bitmap, 0, 0, outputWidth, outputHeight);",
      },
      {
        label: "Aspect calculation",
        code: "const outputHeight = Math.round(\n  sourceHeight * outputWidth / sourceWidth\n);",
      },
    ],
    faqs: [
      {
        question: "Does AyeCalc upload images while resizing them?",
        answer:
          "No. Image decoding, resizing, and encoding happen inside the browser. The generated files remain local unless you choose to download or share them.",
      },
      {
        question: "Can I resize several images at once?",
        answer:
          "Yes. Add up to ten JPEG, PNG, or WebP images and apply the same resize rules to the batch. Each successful result remains available even if another file fails.",
      },
      {
        question: "What does prevent upscaling do?",
        answer:
          "It stops an image from being enlarged beyond its decoded dimensions, which avoids creating a larger file with no new source detail.",
      },
      {
        question: "Will transparency be preserved?",
        answer:
          "PNG and WebP output can preserve transparent pixels. JPEG has no alpha channel, so transparent areas use the selected background color.",
      },
    ],
    source: {
      label: "MDN CanvasRenderingContext2D drawImage()",
      href: "https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage",
    },
  },
  {
    slug: "image-compressor",
    title: "Free Image Compressor Online",
    shortTitle: "Image Compressor",
    searchTerms: [
      "compress image online",
      "photo compressor",
      "reduce image file size",
      "image size reducer",
      "compress JPEG PNG WebP",
      "batch image compressor",
      "image quality compressor",
      "compress image to KB",
      "private image compressor",
      "compress photo online",
      "photo size reducer",
      "image optimizer",
      "shrink image size",
      "reduce photo size in KB",
    ],
    category: "Image tools",
    description:
      "Compress JPEG, PNG, and WebP images locally with adjustable quality, optional target-KB output, batch results, and ZIP download.",
    introduction:
      "Reduce image file sizes without sending them to a server. Choose a quality level or a best-effort target size for JPEG and WebP, compare source and result sizes, and keep successful files from a partial batch.",
    formula: "output bytes = browser encoder(image, format, quality)",
    formulaNote:
      "Target-size mode tests at most seven quality levels and accepts a result within five percent when possible.",
    method:
      "The browser decodes each image, redraws it at its original dimensions, and encodes a new file at the selected quality. Target-size mode searches progressively lower quality values for the closest usable JPEG or WebP result.",
    exampleTitle: "Compress a 1.8 MB JPEG toward a 300 KB target",
    exampleText:
      "The tool first encodes at the selected maximum quality. If that result is too large, it tests lower quality levels, keeps the closest result below the target when available, and warns when the requested size cannot be reached.",
    guidance:
      "Compare detail around text, hair, gradients, and high-contrast edges rather than relying only on byte size. WebP is often useful for web delivery, while JPEG remains broadly compatible for opaque photographs.",
    limitation:
      "A requested byte size is not guaranteed because image complexity and browser encoders differ. PNG quality is lossless and does not use the quality slider, and re-encoding can occasionally create a file larger than its source.",
    benefits: ["Quality and target size", "Before/after comparison", "Private batch compression"],
    codeSnippets: [
      {
        label: "JPEG quality",
        code: 'canvas.toBlob(handleBlob, "image/jpeg", 0.8);',
      },
      {
        label: "WebP quality",
        code: 'canvas.toBlob(handleBlob, "image/webp", 0.8);',
      },
    ],
    faqs: [
      {
        question: "Can I compress an image to an exact KB size?",
        answer:
          "The target is best-effort. The tool tries up to seven JPEG or WebP quality levels and reports when the image cannot reach the requested size without going below the minimum quality.",
      },
      {
        question: "Why does PNG not have the same quality control?",
        answer:
          "Browser canvas PNG output is lossless, so its encoder does not use the lossy quality value available for JPEG and WebP.",
      },
      {
        question: "Are compressed images uploaded?",
        answer:
          "No. The images are decoded and re-encoded in browser memory. Batch ZIP creation also happens locally after you request it.",
      },
      {
        question: "Does compression remove image metadata?",
        answer:
          "Yes. Generated files omit EXIF and other embedded metadata, including camera or location information that may have been present in the source.",
      },
    ],
    source: {
      label: "MDN HTMLCanvasElement toBlob()",
      href: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob",
    },
  },
  {
    slug: "image-cropper",
    title: "Free Image Cropper Online",
    shortTitle: "Image Cropper",
    searchTerms: [
      "crop image online",
      "photo cropper",
      "picture cropper",
      "image crop tool",
      "crop image to ratio",
      "square image cropper",
      "16:9 image cropper",
      "rotate and crop image",
      "private image cropper",
      "crop photo online",
      "picture crop tool",
      "image cropping tool",
      "photo trimmer",
      "resize and crop image",
    ],
    category: "Image tools",
    description:
      "Crop, zoom, rotate, and flip JPEG, PNG, or WebP images with freeform and preset aspect ratios using private browser processing.",
    introduction:
      "Create a precise crop without uploading the image. Drag or resize the selection, enter pixel coordinates, use common square, landscape, and portrait ratios, zoom the editor, rotate or flip the source, and export to JPEG, PNG, or WebP.",
    formula: "output = transformed source pixels inside the crop rectangle",
    formulaNote:
      "The crop rectangle uses pixel coordinates in the rotated image, then the selected region is encoded in the chosen format.",
    method:
      "The browser applies quarter-turn rotation and optional flips, maps the crop rectangle to transformed image pixels, draws that source region onto a new canvas, and exports a metadata-free image.",
    exampleTitle: "Crop a landscape photo to a centered 1:1 square",
    exampleText:
      "Selecting 1:1 creates the largest centered square that fits the transformed image. Drag the selection to reposition it, resize from a corner, or enter exact X, Y, width, and height values before export.",
    guidance:
      "Choose an aspect ratio that matches the final placement and leave enough space around important subjects. Use numeric controls or arrow-key movement for precise placement, then verify the output dimensions before downloading.",
    limitation:
      "Cropping permanently removes pixels outside the selection. Editor zoom changes only the working view, extreme rotations or repeated lossy exports can affect quality, and embedded metadata is not preserved.",
    benefits: ["Free and preset crops", "Touch and keyboard controls", "Rotate and flip"],
    codeSnippets: [
      {
        label: "Canvas crop",
        code: "context.drawImage(\n  source, cropX, cropY, cropWidth, cropHeight,\n  0, 0, cropWidth, cropHeight\n);",
      },
      {
        label: "Centered square",
        code: "const size = Math.min(width, height);\nconst x = (width - size) / 2;\nconst y = (height - size) / 2;",
      },
    ],
    faqs: [
      {
        question: "Which crop ratios are available?",
        answer:
          "Use a freeform selection or choose 1:1, 4:3, 3:2, 16:9, or 9:16. Pixel coordinate fields remain available for precise adjustments.",
      },
      {
        question: "Can I crop with a keyboard or touch screen?",
        answer:
          "Yes. The selection supports pointer and touch dragging. Focus it and use arrow keys to move one pixel, or hold Shift to move ten pixels.",
      },
      {
        question: "Does editor zoom change the exported crop?",
        answer:
          "No. Zoom magnifies the editing surface for easier selection. The crop coordinates and exported pixels remain based on the decoded image dimensions.",
      },
      {
        question: "Is the image uploaded while I crop it?",
        answer:
          "No. Preview, transformation, cropping, and output encoding happen in the browser.",
      },
    ],
    source: {
      label: "MDN CanvasRenderingContext2D drawImage()",
      href: "https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage",
    },
  },
  {
    slug: "image-format-converter",
    title: "Free Image Format Converter Online",
    shortTitle: "Image Format Converter",
    searchTerms: [
      "image converter online",
      "convert image format",
      "JPEG to PNG converter",
      "PNG to JPEG converter",
      "image to WebP converter",
      "WebP to PNG converter",
      "batch image converter",
      "photo format converter",
      "private image converter",
      "image file converter",
      "picture converter",
      "photo converter",
      "JPG PNG WebP converter",
      "change image file type",
    ],
    category: "Image tools",
    description:
      "Convert up to ten JPEG, PNG, or WebP images to another supported format locally, with quality, transparency, and ZIP controls.",
    introduction:
      "Convert image formats without uploading files. Choose JPEG, PNG, or WebP output for an entire batch, adjust lossy quality, set the JPEG background used for transparent pixels, and download results separately or together.",
    formula: "output file = encode(decoded pixels, selected format, quality)",
    formulaNote:
      "PNG and WebP can preserve transparency; JPEG replaces transparent pixels with the selected background color.",
    method:
      "The browser decodes the source pixels, draws them onto a clean canvas, fills a background when JPEG output requires it, and encodes the canvas in the selected supported format.",
    exampleTitle: "Convert transparent PNG assets to WebP",
    exampleText:
      "Choose WebP output, set the desired quality, and process the batch. Transparent pixels remain transparent, while the new files use the .webp extension and omit embedded source metadata.",
    guidance:
      "Use PNG when lossless pixels or broad transparency support matters, JPEG for opaque photographs, and WebP when modern web compression and optional transparency fit the delivery requirements.",
    limitation:
      "The first release does not accept GIF, SVG, HEIC, or AVIF and does not preserve animation. Browser format support can differ, and conversion does not improve detail already lost in a compressed source.",
    benefits: ["JPEG, PNG, and WebP", "Batch ZIP download", "Transparency controls"],
    codeSnippets: [
      {
        label: "Convert to WebP",
        code: 'canvas.toBlob(handleBlob, "image/webp", 0.85);',
      },
      {
        label: "JPEG background",
        code: 'context.fillStyle = "#ffffff";\ncontext.fillRect(0, 0, width, height);\ncontext.drawImage(bitmap, 0, 0);',
      },
    ],
    faqs: [
      {
        question: "Which image conversions are supported?",
        answer:
          "Convert JPEG, PNG, or WebP inputs to JPEG, PNG, or WebP output when the selected browser supports that encoder.",
      },
      {
        question: "What happens to transparency when converting to JPEG?",
        answer:
          "JPEG cannot store transparent pixels. The converter fills those areas with the selected background color, which defaults to white.",
      },
      {
        question: "Can several images be converted together?",
        answer:
          "Yes. Apply one output format and quality setting to up to ten images, then download individual results or a locally created ZIP archive.",
      },
      {
        question: "Does conversion preserve EXIF metadata?",
        answer:
          "No. The new image contains the decoded pixels but omits EXIF, camera, location, and other embedded metadata from the source file.",
      },
    ],
    source: {
      label: "MDN HTMLCanvasElement toBlob()",
      href: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob",
    },
  },
  {
    slug: "background-remover",
    title: "Free Background Remover Online",
    shortTitle: "Background Remover",
    searchTerms: [
      "remove image background",
      "image background remover",
      "photo background remover",
      "AI background remover",
      "transparent background maker",
      "PNG background remover",
      "background eraser",
      "automatic background remover",
      "portrait background remover",
      "product background remover",
      "image cutout maker",
      "private background remover",
      "no upload background remover",
    ],
    category: "Image tools",
    description:
      "Remove image backgrounds online for free, preview the transparent result, and download a full-size PNG with private browser-based processing.",
    introduction:
      "Choose a JPEG, PNG, or WebP image and create a transparent PNG with browser-based foreground segmentation. The image is processed in a dedicated browser worker, while the model and runtime files are downloaded on first use and cached by the browser when available.",
    formula: "transparent pixel = source pixel × foreground alpha mask",
    formulaNote:
      "The segmentation model estimates a foreground mask from 0 (transparent) to 1 (opaque) for each pixel.",
    method:
      "The browser decodes the selected image, resizes a working copy for the segmentation model, and predicts which pixels belong to the main foreground subject. That mask is resized to the original dimensions and applied as an alpha channel, preserving the original RGB pixels in a transparent PNG.",
    exampleTitle: "Remove the background from a product or portrait image",
    exampleText:
      "Select a supported image, start removal, and wait for the first-use model download and local processing. The preview displays transparency as a checkerboard. Downloading saves the original dimensions as a PNG with an alpha channel.",
    guidance:
      "Use a clearly defined foreground subject, adequate lighting, and visible separation between subject and background. Inspect hair, fur, glass, shadows, and similarly colored edges at full size before using the result in production.",
    limitation:
      "Automatic segmentation can remove fine foreground detail or retain parts of a complex background. Processing speed depends on the device, browser, image dimensions, model cache, and available memory. The tool does not provide manual mask correction.",
    benefits: ["Local image processing", "Transparent PNG output", "No account"],
    codeSnippets: [
      {
        label: "HTML transparent image",
        code: '<img src="subject-no-background.png" width="1200" height="800" alt="Product shown without its original background">',
      },
      {
        label: "CSS preview surface",
        code: ".transparent-preview {\n  background-color: #fff;\n  background-image:\n    linear-gradient(45deg, #e5e7eb 25%, transparent 25%),\n    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%);\n}",
      },
    ],
    faqs: [
      {
        question: "Does AyeCalc upload my selected image?",
        answer:
          "No. The selected image is passed to a worker inside your browser and is not intentionally uploaded to AyeCalc, Hugging Face, or jsDelivr. The browser separately downloads the model from Hugging Face and runtime files from jsDelivr on first use.",
      },
      {
        question: "Why can the first background removal take longer?",
        answer:
          "The first run downloads the quantized segmentation model and browser runtime. Browsers can cache those files, so later runs may avoid downloading them again.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "The uploader accepts JPEG, PNG, and WebP files up to 15 MB and 25 megapixels. The result is downloaded as a transparent PNG.",
      },
      {
        question: "Will every edge be removed perfectly?",
        answer:
          "No automatic model is perfect. Fine hair, fur, transparent objects, motion blur, low contrast, and complex scenes can produce inaccurate edges or missing foreground details.",
      },
    ],
    source: {
      label: "Hugging Face ONNX Community: ORMBG background-removal model",
      href: "https://huggingface.co/onnx-community/ormbg-ONNX",
    },
  },
];

export function getDeveloperTool(slug: string) {
  return developerTools.find((tool) => tool.slug === slug);
}

export function createDeveloperToolMetadata(tool: DeveloperToolDefinition) {
  const pageTitle = tool.seoTitle ?? tool.title;
  const title = pageTitle.startsWith("Free ")
    ? pageTitle
    : `Free ${pageTitle} Online`;
  const keywords = [
    tool.shortTitle.toLowerCase(),
    tool.title.toLowerCase(),
    `${tool.shortTitle.toLowerCase()} online`,
    tool.category.toLowerCase(),
    ...(tool.searchTerms ?? []),
  ];

  return createPageMetadata({
    title,
    description: tool.description,
    path: `/${tool.slug}`,
    keywords: Array.from(new Set(keywords)),
    imageAlt: `${tool.shortTitle} on AyeCalc`,
  });
}
