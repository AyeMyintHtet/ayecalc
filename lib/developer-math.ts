import { formatCodeNumber } from "./conversion-math.ts";

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
  if (
    ![
      minimumViewport,
      maximumViewport,
      minimumSize,
      maximumSize,
      rootFontSize,
    ].every(Number.isFinite) ||
    minimumViewport < 0 ||
    maximumViewport <= minimumViewport ||
    minimumSize < 0 ||
    maximumSize < minimumSize ||
    rootFontSize <= 0
  )
    throw new RangeError(
      "Use increasing viewport widths, non-negative sizes, and a positive root font size.",
    );
  const rate =
    (maximumSize - minimumSize) / (maximumViewport - minimumViewport);
  const slope = rate * 100;
  const intercept = minimumSize - rate * minimumViewport;
  const minimumRem = minimumSize / rootFontSize;
  const maximumRem = maximumSize / rootFontSize;
  const interceptRem = intercept / rootFontSize;

  if (
    ![slope, intercept, minimumRem, maximumRem, interceptRem].every(
      Number.isFinite,
    )
  ) {
    throw new RangeError("These values are too large to generate CSS.");
  }
  const slopeText = formatCodeNumber(Math.abs(trimNumber(slope)), 4);
  const interceptText = formatCodeNumber(Math.abs(trimNumber(intercept)), 4);
  const minimumText = formatCodeNumber(trimNumber(minimumSize), 4);
  const maximumText = formatCodeNumber(trimNumber(maximumSize), 4);
  const minimumRemText = formatCodeNumber(trimNumber(minimumRem), 4);
  const maximumRemText = formatCodeNumber(trimNumber(maximumRem), 4);
  const interceptRemText = formatCodeNumber(
    Math.abs(trimNumber(interceptRem)),
    4,
  );
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
  if (
    ![value, rootFontSize, elementFontSize].every(Number.isFinite) ||
    rootFontSize <= 0 ||
    elementFontSize <= 0
  ) {
    throw new RangeError("Enter a finite value and positive font sizes.");
  }
  const pixels =
    sourceUnit === "px"
      ? value
      : sourceUnit === "rem"
        ? value * rootFontSize
        : value * elementFontSize;

  const result = {
    px: pixels,
    rem: pixels / rootFontSize,
    em: pixels / elementFontSize,
  };
  if (!Object.values(result).every(Number.isFinite))
    throw new RangeError("These values are too large to convert.");
  return result;
}

export function calculateTailwindSpacing(
  multiplier: number,
  spacingRem: number,
  rootFontSize: number,
) {
  if (
    ![multiplier, spacingRem, rootFontSize].every(Number.isFinite) ||
    multiplier < 0 ||
    spacingRem <= 0 ||
    rootFontSize <= 0
  ) {
    throw new RangeError(
      "Enter a non-negative spacing number and positive base values.",
    );
  }
  const rem = multiplier * spacingRem;
  if (![rem, rem * rootFontSize].every(Number.isFinite))
    throw new RangeError("These values are too large to convert.");

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
  if (
    ![width, height].every((value) => value >= 0.001 && value <= 9e12) ||
    ![integerWidth, integerHeight].every(
      (value) => Number.isSafeInteger(value) && value > 0,
    )
  ) {
    throw new RangeError(
      "Use dimensions from 0.001 to 9 trillion; ratios are rounded to three decimal places.",
    );
  }
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
  const result = (targetWidth / width) * height;
  if (
    ![width, height, targetWidth, result].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    throw new RangeError(
      "These dimensions are outside the supported numeric range.",
    );
  }
  return result;
}

export function convertPixelsToViewportUnits(
  pixels: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  if (
    ![pixels, viewportWidth, viewportHeight].every(Number.isFinite) ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    throw new RangeError(
      "Enter a finite pixel value and positive viewport dimensions.",
    );
  }
  const smallerDimension = Math.min(viewportWidth, viewportHeight);
  const largerDimension = Math.max(viewportWidth, viewportHeight);

  const result = {
    vw: (pixels / viewportWidth) * 100,
    vh: (pixels / viewportHeight) * 100,
    vmin: (pixels / smallerDimension) * 100,
    vmax: (pixels / largerDimension) * 100,
  };
  if (!Object.values(result).every(Number.isFinite))
    throw new RangeError("These values are too large to convert.");
  return result;
}
