export type ParsedColor = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

export type HslColor = {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
};

export function parseHexColor(input: string): ParsedColor | null {
  const normalized = input.trim().replace(/^#/, "");

  if (!/^[\da-f]+$/i.test(normalized) || ![3, 4, 6, 8].includes(normalized.length)) {
    return null;
  }

  const expanded =
    normalized.length <= 4
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;
  const hasAlpha = expanded.length === 8;

  return {
    red: Number.parseInt(expanded.slice(0, 2), 16),
    green: Number.parseInt(expanded.slice(2, 4), 16),
    blue: Number.parseInt(expanded.slice(4, 6), 16),
    alpha: hasAlpha
      ? Number((Number.parseInt(expanded.slice(6, 8), 16) / 255).toFixed(3))
      : 1,
  };
}

export function rgbToHsl(color: ParsedColor): HslColor {
  const red = color.red / 255;
  const green = color.green / 255;
  const blue = color.blue / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const chroma = maximum - minimum;
  const lightness = (maximum + minimum) / 2;
  let hue = 0;

  if (chroma !== 0) {
    if (maximum === red) hue = ((green - blue) / chroma) % 6;
    if (maximum === green) hue = (blue - red) / chroma + 2;
    if (maximum === blue) hue = (red - green) / chroma + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  const saturation =
    chroma === 0 ? 0 : chroma / (1 - Math.abs(2 * lightness - 1));

  return {
    hue,
    saturation: saturation * 100,
    lightness: lightness * 100,
    alpha: color.alpha,
  };
}

export function formatHexColor(color: ParsedColor) {
  const channel = (value: number) => value.toString(16).padStart(2, "0");
  const alpha = Math.round(color.alpha * 255);

  return `#${channel(color.red)}${channel(color.green)}${channel(color.blue)}${
    alpha < 255 ? channel(alpha) : ""
  }`.toUpperCase();
}

export function formatRgbColor(color: ParsedColor) {
  return color.alpha < 1
    ? `rgb(${color.red} ${color.green} ${color.blue} / ${color.alpha})`
    : `rgb(${color.red} ${color.green} ${color.blue})`;
}

export function formatHslColor(color: HslColor) {
  const hue = Number(color.hue.toFixed(1));
  const saturation = Number(color.saturation.toFixed(1));
  const lightness = Number(color.lightness.toFixed(1));

  return color.alpha < 1
    ? `hsl(${hue} ${saturation}% ${lightness}% / ${color.alpha})`
    : `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function linearizeSrgb(channel: number) {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(color: ParsedColor) {
  return (
    0.2126 * linearizeSrgb(color.red) +
    0.7152 * linearizeSrgb(color.green) +
    0.0722 * linearizeSrgb(color.blue)
  );
}

export function contrastRatio(first: ParsedColor, second: ParsedColor) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}
