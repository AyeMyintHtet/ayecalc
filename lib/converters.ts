import { convertValue, formatConversionNumber } from "@/lib/conversion-math";

export type ContextField = {
  key: "rootFontSize" | "elementFontSize";
  label: string;
  shortLabel: string;
  help: string;
  unit: "px";
  defaultValue: number;
  min: number;
  step: number;
};

export type CodeSnippet = {
  label: string;
  code: string;
};

export type ConverterDefinition = {
  from: string;
  to: string;
  slug: string;
  title: string;
  fromName: string;
  toName: string;
  fromSymbol: string;
  toSymbol: string;
  category: "Developer units" | "Weight" | "Length";
  description: string;
  introduction: string;
  method: string;
  formula: string;
  formulaNote: string;
  guidance: string;
  limitation: string;
  defaultValue: number;
  inputStep: number;
  allowNegative: boolean;
  contextFields: ContextField[];
  tableValues: number[];
  exampleInput: number;
  codeSnippets: CodeSnippet[];
};

const rootFontSize: ContextField = {
  key: "rootFontSize",
  label: "Root font size",
  shortLabel: "root font size",
  help: "The font size set on the HTML root element. Browsers commonly use 16px by default.",
  unit: "px",
  defaultValue: 16,
  min: 0.01,
  step: 0.1,
};

const elementFontSize: ContextField = {
  key: "elementFontSize",
  label: "Element font size",
  shortLabel: "element font size",
  help: "The computed font size of the element or its relevant parent context.",
  unit: "px",
  defaultValue: 16,
  min: 0.01,
  step: 0.1,
};

export const converterDefinitions: ConverterDefinition[] = [
  {
    from: "px",
    to: "rem",
    slug: "px-to-rem",
    title: "PX to REM Converter",
    fromName: "pixels",
    toName: "root ems",
    fromSymbol: "px",
    toSymbol: "rem",
    category: "Developer units",
    description:
      "Convert pixels to REM instantly with an adjustable root font size, formula, CSS examples, and a practical PX-to-REM reference table.",
    introduction:
      "Convert any pixel value to rem for scalable CSS sizing. The calculator uses a 16px root font size by default and lets you match the actual root size used by your project.",
    method:
      "Divide the pixel value by the root element's font size. With the common 16px browser default, 16px equals 1rem and 24px equals 1.5rem.",
    formula: "rem = px ÷ root font size",
    formulaNote: "At a 16px root: rem = px ÷ 16.",
    guidance:
      "REM units are useful when spacing and typography should scale from one document-level setting. Confirm the computed font size of the HTML element before converting a design system.",
    limitation:
      "The result changes when the root font size changes. Browser zoom does not rewrite the CSS conversion ratio, but user font preferences and project styles can affect the computed root size.",
    defaultValue: 16,
    inputStep: 1,
    allowNegative: true,
    contextFields: [rootFontSize],
    tableValues: [1, 2, 4, 8, 10, 12, 14, 16, 18, 20, 24, 32, 48, 64, 80, 96],
    exampleInput: 24,
    codeSnippets: [
      { label: "CSS", code: "html { font-size: 16px; }\n.heading { font-size: 1.5rem; } /* 24px */" },
      { label: "JavaScript", code: "const rem = pixels / rootFontSize;" },
      { label: "Sass", code: "@use \"sass:math\";\n@function rem($px, $base: 16) {\n  @return math.div($px, $base) * 1rem;\n}" },
    ],
  },
  {
    from: "rem",
    to: "px",
    slug: "rem-to-px",
    title: "REM to PX Converter",
    fromName: "root ems",
    toName: "pixels",
    fromSymbol: "rem",
    toSymbol: "px",
    category: "Developer units",
    description:
      "Convert REM to pixels instantly using an adjustable root font size, with the exact formula, CSS examples, and a REM-to-PX table.",
    introduction:
      "Translate rem values into pixel equivalents for design handoff, inspection, and debugging. Change the default 16px root size to match your stylesheet.",
    method:
      "Multiply the rem value by the root element's font size. If the root font size is 16px, 1rem equals 16px and 1.5rem equals 24px.",
    formula: "px = rem × root font size",
    formulaNote: "At a 16px root: px = rem × 16.",
    guidance:
      "Use the computed font size of the HTML element, not a component's local font size. This keeps the conversion aligned with how rem is resolved by CSS.",
    limitation:
      "A rem value has no single pixel equivalent until the root font size is known. Project resets, accessibility settings, and responsive CSS can change that context.",
    defaultValue: 1,
    inputStep: 0.125,
    allowNegative: true,
    contextFields: [rootFontSize],
    tableValues: [0.125, 0.25, 0.5, 0.75, 1, 1.125, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6],
    exampleInput: 1.5,
    codeSnippets: [
      { label: "CSS", code: "html { font-size: 16px; }\n.heading { font-size: 1.5rem; } /* 24px */" },
      { label: "JavaScript", code: "const pixels = rem * rootFontSize;" },
      { label: "Sass", code: "@function px($rem, $base: 16) {\n  @return $rem * $base * 1px;\n}" },
    ],
  },
  {
    from: "px",
    to: "em",
    slug: "px-to-em",
    title: "PX to EM Converter",
    fromName: "pixels",
    toName: "ems",
    fromSymbol: "px",
    toSymbol: "em",
    category: "Developer units",
    description:
      "Convert pixels to EM with an adjustable element font size, an exact CSS formula, developer examples, and a PX-to-EM lookup table.",
    introduction:
      "Convert fixed pixel measurements to context-relative em units. Set the element font size used by your component to get the correct local CSS value.",
    method:
      "Divide the pixel value by the relevant element or parent font size. With a 16px context, 16px equals 1em and 24px equals 1.5em.",
    formula: "em = px ÷ element font size",
    formulaNote: "At a 16px element size: em = px ÷ 16.",
    guidance:
      "EM is helpful when a component's spacing, icons, or child typography should scale with that component. Check which ancestor establishes the font-size context for the property you are converting.",
    limitation:
      "EM is context-dependent and can compound when nested font sizes are expressed in em. The same em value can therefore resolve to different pixel sizes in different components.",
    defaultValue: 16,
    inputStep: 1,
    allowNegative: true,
    contextFields: [elementFontSize],
    tableValues: [1, 2, 4, 8, 10, 12, 14, 16, 18, 20, 24, 32, 48, 64, 80, 96],
    exampleInput: 24,
    codeSnippets: [
      { label: "CSS", code: ".component {\n  font-size: 16px;\n  padding: 1.5em; /* 24px */\n}" },
      { label: "JavaScript", code: "const em = pixels / elementFontSize;" },
      { label: "Sass", code: "@use \"sass:math\";\n@function em($px, $context: 16) {\n  @return math.div($px, $context) * 1em;\n}" },
    ],
  },
  {
    from: "em",
    to: "px",
    slug: "em-to-px",
    title: "EM to PX Converter",
    fromName: "ems",
    toName: "pixels",
    fromSymbol: "em",
    toSymbol: "px",
    category: "Developer units",
    description:
      "Convert EM to pixels using an adjustable element font size, with the calculation formula, CSS examples, and a useful EM-to-PX table.",
    introduction:
      "Find the pixel equivalent of an em measurement in its actual CSS context. Enter the component's computed font size instead of assuming every em is based on 16px.",
    method:
      "Multiply the em value by the relevant element or parent font size. In a 16px context, 1em equals 16px and 1.5em equals 24px.",
    formula: "px = em × element font size",
    formulaNote: "At a 16px element size: px = em × 16.",
    guidance:
      "Use the browser's computed styles to identify the effective font-size context. This is especially important for nested components that inherit or override font size.",
    limitation:
      "The calculation is only as accurate as the supplied context. Nested em declarations and property-specific behavior can make the effective base different from the root font size.",
    defaultValue: 1,
    inputStep: 0.125,
    allowNegative: true,
    contextFields: [elementFontSize],
    tableValues: [0.125, 0.25, 0.5, 0.75, 1, 1.125, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6],
    exampleInput: 1.5,
    codeSnippets: [
      { label: "CSS", code: ".component {\n  font-size: 16px;\n  padding: 1.5em; /* 24px */\n}" },
      { label: "JavaScript", code: "const pixels = em * elementFontSize;" },
      { label: "Sass", code: "@function px-from-em($em, $context: 16) {\n  @return $em * $context * 1px;\n}" },
    ],
  },
  {
    from: "rem",
    to: "em",
    slug: "rem-to-em",
    title: "REM to EM Converter",
    fromName: "root ems",
    toName: "ems",
    fromSymbol: "rem",
    toSymbol: "em",
    category: "Developer units",
    description:
      "Convert REM to EM accurately with adjustable root and element font sizes, plus the formula, CSS examples, and a conversion table.",
    introduction:
      "Translate document-relative rem values into component-relative em values. Set both font-size contexts to avoid assuming that 1rem always equals 1em.",
    method:
      "First convert rem to pixels using the root font size, then divide by the relevant element font size. The units are equal only when both font sizes are equal.",
    formula: "em = (rem × root font size) ÷ element font size",
    formulaNote: "At equal 16px root and element sizes: 1rem = 1em.",
    guidance:
      "This conversion is useful when moving a document-level token into a component that scales locally. Enter the computed root and component font sizes from the same rendered state.",
    limitation:
      "REM and EM measure different contexts. Responsive rules, inherited font sizes, and nested em values may change the relationship at different breakpoints.",
    defaultValue: 1,
    inputStep: 0.125,
    allowNegative: true,
    contextFields: [rootFontSize, elementFontSize],
    tableValues: [0.125, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6],
    exampleInput: 1.5,
    codeSnippets: [
      { label: "CSS", code: "html { font-size: 16px; }\n.component { font-size: 20px; }\n/* 1rem equals 0.8em here */" },
      { label: "JavaScript", code: "const em = (rem * rootFontSize) / elementFontSize;" },
      { label: "Sass", code: "@use \"sass:math\";\n@function rem-to-em($rem, $root: 16, $context: 16) {\n  @return math.div($rem * $root, $context) * 1em;\n}" },
    ],
  },
  {
    from: "lb",
    to: "kg",
    slug: "lb-to-kg",
    title: "Pounds to Kilograms Converter",
    fromName: "pounds",
    toName: "kilograms",
    fromSymbol: "lb",
    toSymbol: "kg",
    category: "Weight",
    description:
      "Convert pounds to kilograms instantly with the exact conversion factor, worked example, rounding guidance, and LB-to-KG reference table.",
    introduction:
      "Convert a weight or mass from pounds to kilograms using the international avoirdupois pound. Results update instantly in your browser.",
    method:
      "Multiply pounds by 0.45359237. The international pound is defined as exactly 0.45359237 kilograms.",
    formula: "kg = lb × 0.45359237",
    formulaNote: "1 lb = exactly 0.45359237 kg.",
    guidance:
      "Use more decimal places for technical work and round only the final result. For everyday measurements, two or three decimal places are usually easier to read.",
    limitation:
      "This converter uses the international avoirdupois pound, which is the pound commonly used for body weight and goods. It does not convert troy pounds or force units.",
    defaultValue: 1,
    inputStep: 0.1,
    allowNegative: false,
    contextFields: [],
    tableValues: [1, 2, 5, 10, 20, 25, 50, 75, 100, 125, 150, 200, 250],
    exampleInput: 150,
    codeSnippets: [
      { label: "JavaScript", code: "const kilograms = pounds * 0.45359237;" },
      { label: "Python", code: "kilograms = pounds * 0.45359237" },
    ],
  },
  {
    from: "kg",
    to: "lb",
    slug: "kg-to-lb",
    title: "Kilograms to Pounds Converter",
    fromName: "kilograms",
    toName: "pounds",
    fromSymbol: "kg",
    toSymbol: "lb",
    category: "Weight",
    description:
      "Convert kilograms to pounds instantly using the exact international-pound definition, with examples and a KG-to-LB reference table.",
    introduction:
      "Convert a weight or mass from kilograms to pounds with a precise browser-based calculation and clear rounding.",
    method:
      "Divide kilograms by 0.45359237. This uses the exact definition of the international avoirdupois pound.",
    formula: "lb = kg ÷ 0.45359237",
    formulaNote: "1 kg ≈ 2.2046226218 lb.",
    guidance:
      "Keep the unrounded result through any later calculation, then round the displayed answer to the precision your task requires.",
    limitation:
      "The result is expressed in international avoirdupois pounds, not troy pounds or pounds-force. Measurement uncertainty in the source value still applies.",
    defaultValue: 1,
    inputStep: 0.1,
    allowNegative: false,
    contextFields: [],
    tableValues: [1, 2, 5, 10, 20, 25, 50, 75, 100, 125, 150, 200],
    exampleInput: 68,
    codeSnippets: [
      { label: "JavaScript", code: "const pounds = kilograms / 0.45359237;" },
      { label: "Python", code: "pounds = kilograms / 0.45359237" },
    ],
  },
  {
    from: "cm",
    to: "inches",
    slug: "cm-to-inches",
    title: "Centimeters to Inches Converter",
    fromName: "centimeters",
    toName: "inches",
    fromSymbol: "cm",
    toSymbol: "in",
    category: "Length",
    description:
      "Convert centimeters to inches instantly using the exact 2.54 cm-per-inch relationship, with examples and a CM-to-inches table.",
    introduction:
      "Convert metric lengths in centimeters to inches for measurements, specifications, printing, and everyday comparisons.",
    method:
      "Divide centimeters by 2.54. One international inch is defined as exactly 2.54 centimeters.",
    formula: "inches = cm ÷ 2.54",
    formulaNote: "2.54 cm = exactly 1 inch.",
    guidance:
      "Use the number of decimal places appropriate for the original measurement. Extra displayed precision cannot make an imprecise measurement more accurate.",
    limitation:
      "This is a linear unit conversion. The output does not account for measurement tolerance, rounding in the source value, or device calibration.",
    defaultValue: 2.54,
    inputStep: 0.1,
    allowNegative: false,
    contextFields: [],
    tableValues: [1, 2.54, 5, 10, 20, 25, 30, 50, 75, 100, 150, 200],
    exampleInput: 30,
    codeSnippets: [
      { label: "JavaScript", code: "const inches = centimeters / 2.54;" },
      { label: "Python", code: "inches = centimeters / 2.54" },
    ],
  },
  {
    from: "inches",
    to: "cm",
    slug: "inches-to-cm",
    title: "Inches to Centimeters Converter",
    fromName: "inches",
    toName: "centimeters",
    fromSymbol: "in",
    toSymbol: "cm",
    category: "Length",
    description:
      "Convert inches to centimeters instantly using the exact 2.54 conversion factor, with a worked example and inches-to-CM reference table.",
    introduction:
      "Convert lengths in inches to centimeters for product dimensions, craft measurements, print layouts, and metric specifications.",
    method:
      "Multiply inches by 2.54. The international inch is defined as exactly 2.54 centimeters.",
    formula: "cm = inches × 2.54",
    formulaNote: "1 inch = exactly 2.54 cm.",
    guidance:
      "Match the displayed precision to the source measurement. A dimension given to the nearest inch normally should not be reported to many decimal places in centimeters.",
    limitation:
      "The mathematical factor is exact, but real-world measurements may include tolerance and rounding that the converter cannot infer.",
    defaultValue: 1,
    inputStep: 0.1,
    allowNegative: false,
    contextFields: [],
    tableValues: [1, 2, 3, 4, 5, 6, 8, 10, 12, 18, 24, 36, 48],
    exampleInput: 12,
    codeSnippets: [
      { label: "JavaScript", code: "const centimeters = inches * 2.54;" },
      { label: "Python", code: "centimeters = inches * 2.54" },
    ],
  },
];

export function getConverterDefinition(from: string, to: string) {
  return converterDefinitions.find(
    (converter) => converter.from === from && converter.to === to,
  );
}

export function getConverterBySlug(slug: string) {
  return converterDefinitions.find((converter) => converter.slug === slug);
}

export function getDefaultContext(converter: ConverterDefinition) {
  return Object.fromEntries(
    converter.contextFields.map((field) => [field.key, field.defaultValue]),
  );
}

export function getExample(converter: ConverterDefinition) {
  const context = getDefaultContext(converter);
  const result = convertValue(
    converter.from,
    converter.to,
    converter.exampleInput,
    context,
  );

  return {
    result,
    input: formatConversionNumber(converter.exampleInput),
    output: formatConversionNumber(result),
  };
}

export function getConverterFaqs(converter: ConverterDefinition) {
  const example = getExample(converter);
  const contextAnswer = converter.contextFields.length
    ? `The calculator starts with ${converter.contextFields
        .map((field) => `${field.defaultValue}${field.unit} for the ${field.shortLabel}`)
        .join(" and ")}. You can change ${converter.contextFields.length === 1 ? "it" : "either value"} to match your CSS.`
    : `The converter uses the fixed relationship described in the formula: ${converter.formulaNote}`;

  return [
    {
      question: `How do I convert ${converter.fromName} to ${converter.toName}?`,
      answer: `${converter.method} For example, ${example.input} ${converter.fromSymbol} converts to ${example.output} ${converter.toSymbol} using the default settings.`,
    },
    {
      question: `What formula does this ${converter.fromSymbol}-to-${converter.toSymbol} converter use?`,
      answer: `${converter.formula}. ${converter.formulaNote}`,
    },
    {
      question: "What assumptions does the calculator make?",
      answer: contextAnswer,
    },
    {
      question: "How many decimal places should I use?",
      answer:
        "The calculator shows up to six decimal places and removes unnecessary trailing zeros. Keep more precision for further calculations, then round the final value to suit your measurement or design system.",
    },
  ];
}
