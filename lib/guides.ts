import { createPageMetadata } from "@/lib/metadata";

export type GuideSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  code?: string;
  callout?: { title: string; text: string };
};

export type GuideDefinition = {
  slug: string;
  title: string;
  searchTerms?: string[];
  description: string;
  introduction: string;
  category: string;
  reviewed: string;
  sections: GuideSection[];
  sources: Array<{ label: string; href: string }>;
  relatedToolSlugs: string[];
};

export const guides: GuideDefinition[] = [
  {
    slug: "rem-vs-em",
    title: "REM vs EM: How CSS Relative Units Actually Differ",
    searchTerms: [
      "REM vs EM",
      "CSS REM vs EM",
      "difference between REM and EM",
      "REM or EM",
      "when to use REM or EM",
      "EM versus REM explained",
      "CSS relative units guide",
      "REM EM comparison",
    ],
    description:
      "Understand the difference between REM and EM, how each resolves in CSS, when values compound, and which unit fits a design-system decision.",
    introduction:
      "REM and EM are both font-relative CSS length units, but they preserve different relationships. REM follows the document root; EM follows the relevant element context. That difference matters more than memorizing a default pixel conversion.",
    category: "CSS units guide",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "definitions",
        title: "The relationship each unit preserves",
        paragraphs: [
          "One rem resolves from the computed font size of the root element. If the root computes to 16px, 1.5rem computes to 24px anywhere in the document unless another mechanism changes the root size.",
          "One em resolves from a local font-size context. For most properties it relates to the font size of the element where the value is used. When em is used to set font-size itself, the parent font size supplies the context. This makes em valuable for components but easier to misunderstand in nested typography.",
        ],
        code: "html { font-size: 16px; }\n.card { font-size: 20px; }\n.card h2 { margin-bottom: 1em; } /* 20px */\n.card p { font-size: 1rem; }     /* 16px */",
      },
      {
        id: "selection",
        title: "Choose the unit from the intended behavior",
        paragraphs: [
          "Use rem when a value should remain connected to a document-level type or spacing scale. This is common for shared design tokens, page headings, and spacing that should respond consistently to a root-size change.",
          "Use em when a value belongs to the component that contains it. Icon size, control padding, and gaps can scale naturally with a component's font size when expressed in em.",
        ],
        bullets: [
          "Choose rem for global rhythm and cross-component consistency.",
          "Choose em for local proportional relationships.",
          "Use unitless line-height when descendants should inherit a multiplier rather than a computed length.",
          "Inspect computed styles instead of assuming every context is 16px.",
        ],
      },
      {
        id: "compounding",
        title: "Why EM values can compound",
        paragraphs: [
          "If a parent has font-size: 1.25em and a child also has font-size: 1.25em, the child scales from the parent's computed size. With a 16px starting context, the parent becomes 20px and the child becomes 25px.",
          "Compounding is not a browser error. It follows the local relationship expressed by em. Avoid accidental multiplication by using rem for levels that should share the root scale or by limiting where component font-size is redefined.",
        ],
        callout: {
          title: "Practical check",
          text: "Change the root and component font sizes independently in the REM/EM/PX matrix to confirm which relationship your component needs.",
        },
      },
      {
        id: "workflow",
        title: "A reliable conversion workflow",
        paragraphs: [
          "Start with the intended computed pixel size, identify the correct font-size context, and divide. For rem, divide by the root size. For em, divide by the relevant element or parent size. Keep the context documented beside design tokens so later changes remain understandable.",
          "Conversion alone does not make an interface accessible. Verify browser zoom, text-only zoom where available, long content, component nesting, and user font preferences in the rendered application.",
        ],
      },
    ],
    sources: [
      {
        label: "W3C CSS Values and Units: font-relative lengths",
        href: "https://www.w3.org/TR/css-values-3/#font-relative-lengths",
      },
    ],
    relatedToolSlugs: ["rem-em-px-converter", "css-clamp-generator"],
  },
  {
    slug: "root-font-size-rem",
    title: "Root Font Size and REM: A Practical CSS Guide",
    searchTerms: [
      "CSS root font size",
      "REM base font size",
      "HTML root font size",
      "how many pixels is 1REM",
      "change REM size CSS",
      "REM font size guide",
      "CSS REM calculation",
      "root element font size",
    ],
    description:
      "Learn how the root font size controls REM values, why 16px is a common assumption rather than a universal constant, and how to test responsibly.",
    introduction:
      "REM conversion is simple only after the computed root font size is known. This guide explains where that value comes from, how project CSS can change it, and why accessibility testing matters.",
    category: "CSS typography guide",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "root",
        title: "What REM reads from the document",
        paragraphs: [
          "The rem unit is equal to the computed em value on the root element. In HTML documents, that is normally the html element. A declaration such as font-size: 18px on html therefore makes 1rem resolve to 18px.",
          "Browsers commonly begin around 16px, but the CSS specification defines the relationship, not a universal 16px result. Browser defaults, user preferences, and author styles can all affect the computed value.",
        ],
        code: "html { font-size: 16px; }\n\n.title {\n  font-size: 2rem; /* 32px in this context */\n}",
      },
      {
        id: "percent",
        title: "Pixels, percentages, and the 62.5% shortcut",
        paragraphs: [
          "Some stylesheets set the root to 62.5% so that a typical 16px default becomes 10px and decimal rem arithmetic looks easier. The shortcut is context-dependent because a percentage still resolves from the user's default font size.",
          "A simpler approach is usually to keep the root at its natural default and let tooling handle division. This avoids treating 10px as a guaranteed baseline and keeps token values aligned with common browser expectations.",
        ],
        callout: {
          title: "Do not override user needs for arithmetic convenience",
          text: "A calculator can remove the mental-math burden without forcing a reduced root size on every visitor.",
        },
      },
      {
        id: "tokens",
        title: "Document assumptions in design tokens",
        paragraphs: [
          "Store semantic intent alongside values. A token named --space-content communicates more than --space-24, and a short comment can record the reference context used during design handoff.",
          "If a product intentionally changes the root at breakpoints, audit every rem-based length that should or should not scale. A root change affects typography, spacing, widths, and any other rem-based property at once.",
        ],
        bullets: [
          "Keep the root assumption visible in conversion tools.",
          "Use semantic tokens instead of duplicating raw values.",
          "Test narrow screens, zoom, and long localized text.",
          "Round displayed values without discarding precision from source calculations.",
        ],
      },
      {
        id: "testing",
        title: "Test computed values, not only source code",
        paragraphs: [
          "Use browser developer tools to inspect the computed font size on html and the final size on the target element. This reveals cascade rules, media queries, inheritance, and user-agent behavior that a static design file cannot show.",
          "Then test browser zoom and increased text size. The goal is not a particular conversion number; it is a layout that remains readable and operable when the effective text size changes.",
        ],
      },
    ],
    sources: [
      {
        label: "W3C CSS Values and Units: REM definition",
        href: "https://www.w3.org/TR/css-values-3/#rem",
      },
    ],
    relatedToolSlugs: ["px-to-rem", "rem-em-px-converter"],
  },
  {
    slug: "figma-px-to-rem",
    title: "How to Convert Figma PX Values to REM",
    searchTerms: [
      "Figma PX to REM",
      "Figma pixel to REM converter",
      "convert Figma pixels to REM",
      "Figma REM handoff",
      "design tokens PX to REM",
      "Figma CSS unit conversion",
      "developer handoff REM",
      "Figma typography REM",
    ],
    description:
      "Move pixel-based Figma measurements into a REM-based CSS system without losing scale, context, accessibility, or design-token intent.",
    introduction:
      "Figma commonly presents dimensions as pixel values, while production CSS may use rem. A good handoff converts relationships and tokens—not every visible number mechanically.",
    category: "Design handoff guide",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "baseline",
        title: "Confirm the production root before converting",
        paragraphs: [
          "Ask what the application actually uses for the computed root font size. If it is 16px, divide a Figma value by 16 to get rem. A 24px heading becomes 1.5rem and a 32px spacing value becomes 2rem.",
          "Do not assume the Figma canvas pixel is a physical screen pixel. Treat the design measurement as a CSS reference value and validate the resulting interface at real breakpoints and zoom levels.",
        ],
        code: "/* 24px design value at a 16px root */\n.heading { font-size: 1.5rem; }\n\n/* 32px design value */\n.section { padding-block: 2rem; }",
      },
      {
        id: "tokens",
        title: "Convert the token system before isolated layers",
        paragraphs: [
          "Group repeated Figma values into typography, spacing, radius, and component tokens. Convert the shared token once, then reference it throughout the codebase. This reduces rounding drift and prevents almost-identical values from multiplying.",
          "Preserve exceptions intentionally. One-pixel borders, raster image dimensions, canvas coordinates, and some shadow offsets may reasonably stay in px because they do not represent scalable type or spacing relationships.",
        ],
        bullets: [
          "Identify repeated values and name their intent.",
          "Convert against the documented root size.",
          "Keep high precision in tokens and round only presentation where necessary.",
          "Review optical adjustments rather than forcing them into the nearest scale step.",
        ],
      },
      {
        id: "responsive",
        title: "Translate responsive intent, not separate screenshots",
        paragraphs: [
          "If Figma shows mobile and desktop sizes, determine whether the production value should jump at a breakpoint or scale fluidly between bounds. A CSS clamp value can encode the latter without adding many intermediate media queries.",
          "Use container behavior and content requirements to choose breakpoints. Device labels in a design file are examples, not universal boundaries for every browser window or embedded context.",
        ],
        callout: {
          title: "Useful pairing",
          text: "Convert fixed values with the PX-to-REM tool, then use the clamp generator only for properties that should genuinely scale between two bounds.",
        },
      },
      {
        id: "qa",
        title: "Complete the handoff with rendered QA",
        paragraphs: [
          "Compare the application and design at their shared reference viewport, then deliberately leave that viewport. Check wrapping, localization, zoom, minimum text size, focus indicators, and dense component states.",
          "Record any production changes back in the design system. A handoff remains trustworthy when Figma tokens and code tokens evolve together instead of becoming two unrelated sets of numbers.",
        ],
      },
    ],
    sources: [
      {
        label: "W3C CSS Values and Units: font-relative lengths",
        href: "https://www.w3.org/TR/css-values-3/#font-relative-lengths",
      },
    ],
    relatedToolSlugs: ["px-to-rem", "css-clamp-generator", "rem-em-px-converter"],
  },
  {
    slug: "tailwind-spacing-rem",
    title: "Tailwind Spacing to REM and PX: Understanding the Scale",
    searchTerms: [
      "Tailwind spacing chart",
      "Tailwind spacing pixels",
      "Tailwind spacing REM values",
      "Tailwind spacing scale explained",
      "Tailwind p-4 pixels",
      "Tailwind gap values",
      "Tailwind padding size chart",
      "Tailwind CSS spacing guide",
    ],
    description:
      "Understand how Tailwind CSS v4 numeric spacing utilities derive from --spacing and how to translate them to REM and pixels safely.",
    introduction:
      "Tailwind CSS v4 derives many numeric spacing utilities from one theme variable. The arithmetic is simple, but custom themes and different utility families make context important.",
    category: "Tailwind CSS guide",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "model",
        title: "The Tailwind v4 spacing model",
        paragraphs: [
          "Numeric utilities such as p-6, mt-8, and gap-4 are generated from the --spacing theme variable. With the framework's 0.25rem value, multiply the numeric suffix by 0.25rem.",
          "This means spacing 4 is 1rem, spacing 6 is 1.5rem, and spacing 8 is 2rem. At a 16px root those values correspond to 16px, 24px, and 32px, but the rem result remains tied to the actual root context.",
        ],
        code: "@import \"tailwindcss\";\n\n@theme {\n  --spacing: 0.25rem;\n}\n\n/* p-6 => padding: calc(var(--spacing) * 6) */",
      },
      {
        id: "custom",
        title: "Custom themes change the entire lookup",
        paragraphs: [
          "A project can redefine --spacing. If it becomes 0.2rem, spacing 6 is 1.2rem rather than 1.5rem. Always inspect the theme source before copying a table from another project or an older Tailwind version.",
          "Arbitrary values such as p-[18px], keyword values such as m-auto, fractions, and other theme namespaces do not necessarily use the numeric spacing formula.",
        ],
        bullets: [
          "Confirm the installed Tailwind major version.",
          "Read the project's @theme declaration.",
          "Distinguish numeric spacing from arbitrary and keyword values.",
          "Use the browser's computed styles for final verification.",
        ],
      },
      {
        id: "handoff",
        title: "Map design tokens to intent",
        paragraphs: [
          "Do not choose a Tailwind class only because its pixel equivalent looks close. Decide whether the space belongs to a shared scale, a component exception, or a responsive relationship.",
          "Document the chosen utility beside the corresponding design token. Consistent use of gap, padding, and margin utilities creates more value than reproducing every one-off measurement exactly.",
        ],
        callout: {
          title: "Version-aware conversion",
          text: "The AyeCalc converter exposes --spacing and root font size as inputs so the result can match the project instead of a hard-coded table.",
        },
      },
      {
        id: "negative",
        title: "Negative values and generated CSS",
        paragraphs: [
          "Negative margin utilities use the same magnitude and apply its negative. Padding and gap cannot meaningfully use negative lengths in the same way, so utility availability depends on the property.",
          "When auditing a layout, work from the computed CSS declaration. This shows whether a utility was generated, overridden by a variant, or changed by the project's theme configuration.",
        ],
      },
    ],
    sources: [
      {
        label: "Tailwind CSS spacing documentation",
        href: "https://tailwindcss.com/docs/margin#customizing-your-theme",
      },
      {
        label: "Tailwind CSS theme variables",
        href: "https://tailwindcss.com/docs/theme",
      },
    ],
    relatedToolSlugs: ["tailwind-spacing-converter", "rem-em-px-converter"],
  },
  {
    slug: "accessible-fluid-typography",
    title: "Accessible Fluid Typography with CSS Clamp",
    searchTerms: [
      "accessible fluid typography",
      "CSS clamp typography accessibility",
      "responsive font size accessibility",
      "fluid type scale guide",
      "accessible responsive typography",
      "WCAG fluid typography",
      "CSS clamp font size guide",
      "fluid typography best practices",
    ],
    description:
      "Build fluid typography with CSS clamp() while protecting zoom, readable minimums, content reflow, and WCAG-oriented testing.",
    introduction:
      "Fluid type can reduce abrupt breakpoint changes, but a smooth formula is not automatically readable or accessible. The minimum, preferred expression, maximum, and surrounding layout must work together.",
    category: "Accessibility guide",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "formula",
        title: "Combine relative and viewport behavior",
        paragraphs: [
          "A fluid clamp normally places a linear expression between explicit minimum and maximum sizes. Expressing the fixed part in rem keeps a connection to the root size, while the vw term provides viewport-responsive growth.",
          "Avoid a preferred value made only from vw for essential text. A viewport-only size can respond weakly to text scaling and can become too small or too large outside the design's reference widths.",
        ],
        code: ".heading {\n  font-size: clamp(1.25rem, 0.9167rem + 1.6667vw, 2.25rem);\n  line-height: 1.15;\n}",
      },
      {
        id: "bounds",
        title: "Choose bounds from content and readability",
        paragraphs: [
          "The minimum should remain readable in the densest supported layout, and the maximum should preserve comfortable line length and hierarchy on wide screens. Do not select bounds only because they match two screenshots.",
          "Keep body text conservative and test headings with long words, translated strings, browser zoom, and text-spacing overrides. A clamp cannot repair a fixed-height container that clips enlarged content.",
        ],
        bullets: [
          "Test at and beyond both viewport bounds.",
          "Test 200% browser zoom and increased text size.",
          "Avoid fixed heights around text.",
          "Use unitless line-height where inherited proportional behavior is desired.",
        ],
      },
      {
        id: "contrast",
        title: "Typography includes more than font size",
        paragraphs: [
          "As size and weight change, confirm that color contrast remains sufficient in every state. Thin text over images, gradients, or translucent surfaces can be difficult to read even when a sampled color pair appears to pass.",
          "Spacing, measure, line height, focus visibility, and motion also affect the experience. Evaluate the rendered page rather than treating one successful calculation as accessibility certification.",
        ],
        callout: {
          title: "Use two checks",
          text: "Generate the scale with the clamp tool, then check the actual foreground and background colors with the contrast checker.",
        },
      },
      {
        id: "verification",
        title: "A practical verification sequence",
        paragraphs: [
          "First confirm that the calculated size reaches the intended minimum and maximum at the selected viewport bounds. Next resize continuously and inspect intermediate wrapping. Finally test zoom, keyboard navigation, focus, reflow, and real content variants.",
          "Record the assumptions with the design token: viewport bounds, root size used for calculation, minimum and maximum values, and the date or release where the scale was reviewed.",
        ],
      },
    ],
    sources: [
      {
        label: "W3C CSS Values and Units Level 4: clamp()",
        href: "https://www.w3.org/TR/css-values-4/#comp-func",
      },
      {
        label: "WCAG 2.2",
        href: "https://www.w3.org/TR/WCAG22/",
      },
    ],
    relatedToolSlugs: ["css-clamp-generator", "contrast-checker"],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function createGuideMetadata(guide: GuideDefinition) {
  return createPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    keywords: Array.from(new Set([
      guide.title.toLowerCase(),
      guide.category.toLowerCase(),
      ...(guide.searchTerms ?? []),
    ])),
    imageAlt: `${guide.title} on AyeCalc`,
  });
}
