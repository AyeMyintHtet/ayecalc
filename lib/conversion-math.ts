export type ConversionContext = {
  rootFontSize?: number;
  elementFontSize?: number;
};

export function convertValue(
  from: string,
  to: string,
  value: number,
  context: ConversionContext = {},
) {
  const rootFontSize = context.rootFontSize ?? 16;
  const elementFontSize = context.elementFontSize ?? 16;

  switch (`${from}-to-${to}`) {
    case "px-to-rem":
      return value / rootFontSize;
    case "rem-to-px":
      return value * rootFontSize;
    case "px-to-em":
      return value / elementFontSize;
    case "em-to-px":
      return value * elementFontSize;
    case "rem-to-em":
      return (value * rootFontSize) / elementFontSize;
    case "lb-to-kg":
      return value * 0.45359237;
    case "kg-to-lb":
      return value / 0.45359237;
    case "cm-to-inches":
      return value / 2.54;
    case "inches-to-cm":
      return value * 2.54;
    default:
      return Number.NaN;
  }
}

export function formatConversionNumber(value: number, maximumFractionDigits = 6) {
  if (!Number.isFinite(value)) return "—";

  const normalizedValue = Object.is(value, -0) ? 0 : value;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    useGrouping: true,
  }).format(normalizedValue);
}
