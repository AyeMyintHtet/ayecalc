import { formatConversionNumber } from "./conversion-math";

export type ClampResult = {
  slope: number;
  intercept: number;
  pixelValue: string;
  remValue: string;
};

function trimNumber(value: number, digits = 4) {
  return Number(value.toFixed(digits));
}

export function calculateClamp(
  minimumViewport: number,
  maximumViewport: number,
  minimumSize: number,
  maximumSize: number,
  rootFontSize: number,
): ClampResult {
  const rate =
    (maximumSize - minimumSize) / (maximumViewport - minimumViewport);
  const slope = rate * 100;
  const intercept = minimumSize - rate * minimumViewport;
  const minimumRem = minimumSize / rootFontSize;
  const maximumRem = maximumSize / rootFontSize;
  const interceptRem = intercept / rootFontSize;

  const slopeText = formatConversionNumber(Math.abs(trimNumber(slope)), 4);
  const interceptText = formatConversionNumber(Math.abs(trimNumber(intercept)), 4);
  const minimumText = formatConversionNumber(trimNumber(minimumSize), 4);
  const maximumText = formatConversionNumber(trimNumber(maximumSize), 4);
  const minimumRemText = formatConversionNumber(trimNumber(minimumRem), 4);
  const maximumRemText = formatConversionNumber(trimNumber(maximumRem), 4);
  const interceptRemText = formatConversionNumber(Math.abs(trimNumber(interceptRem)), 4);
  const pixelPreferred =
    intercept >= 0
      ? `${interceptText}px + ${slopeText}vw`
      : `-${interceptText}px + ${slopeText}vw`;
  const remPreferred =
    interceptRem >= 0
      ? `${interceptRemText}rem + ${slopeText}vw`
      : `-${interceptRemText}rem + ${slopeText}vw`;

  return {
    slope,
    intercept,
    pixelValue: `clamp(${minimumText}px, ${pixelPreferred}, ${maximumText}px)`,
    remValue: `clamp(${minimumRemText}rem, ${remPreferred}, ${maximumRemText}rem)`,
  };
}

export type CssUnit = "px" | "rem" | "em";

export function convertCssUnitMatrix(
  value: number,
  sourceUnit: CssUnit,
  rootFontSize: number,
  elementFontSize: number,
) {
  const pixels =
    sourceUnit === "px"
      ? value
      : sourceUnit === "rem"
        ? value * rootFontSize
        : value * elementFontSize;

  return {
    px: pixels,
    rem: pixels / rootFontSize,
    em: pixels / elementFontSize,
  };
}

export function calculateTailwindSpacing(
  multiplier: number,
  spacingRem: number,
  rootFontSize: number,
) {
  const rem = multiplier * spacingRem;

  return {
    rem,
    px: rem * rootFontSize,
  };
}

function greatestCommonDivisor(first: number, second: number): number {
  let a = Math.abs(first);
  let b = Math.abs(second);

  while (b > 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
}

export function simplifyAspectRatio(width: number, height: number) {
  const scale = 1000;
  const integerWidth = Math.round(width * scale);
  const integerHeight = Math.round(height * scale);
  const divisor = greatestCommonDivisor(integerWidth, integerHeight) || 1;

  return {
    width: integerWidth / divisor,
    height: integerHeight / divisor,
    decimal: width / height,
  };
}

export function calculateProportionalHeight(
  width: number,
  height: number,
  targetWidth: number,
) {
  return (targetWidth * height) / width;
}

export function convertPixelsToViewportUnits(
  pixels: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  const smallerDimension = Math.min(viewportWidth, viewportHeight);
  const largerDimension = Math.max(viewportWidth, viewportHeight);

  return {
    vw: (pixels / viewportWidth) * 100,
    vh: (pixels / viewportHeight) * 100,
    vmin: (pixels / smallerDimension) * 100,
    vmax: (pixels / largerDimension) * 100,
  };
}
