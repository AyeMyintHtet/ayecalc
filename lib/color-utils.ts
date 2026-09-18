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

const cssNumber = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

function numericChannel(value: string, percentScale: number) {
  const percentage = value.endsWith("%");
  const raw = percentage ? value.slice(0, -1) : value;
  if (!cssNumber.test(raw)) return null;
  const number = Number(raw) * (percentage ? percentScale / 100 : 1);
  return Number.isFinite(number) ? number : null;
}

export function hslToRgb({
  hue,
  saturation,
  lightness,
  alpha,
}: HslColor): ParsedColor {
  const h = ((hue % 360) + 360) % 360;
  const s = saturation / 100;
  const l = lightness / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
  };
  return { red: channel(0), green: channel(8), blue: channel(4), alpha };
}

/** Common sRGB CSS syntax; deliberately rejects variables, calc(), and wide-gamut colors. */
export function parseCssColor(input: string): ParsedColor | null {
  const hex = parseHexColor(input);
  if (hex) return hex;
  const match = input.trim().match(/^(rgba?|hsla?)\(([^()]*)\)$/i);
  if (!match) return null;
  const name = match[1].toLowerCase();
  const body = match[2].trim();
  const commaSyntax = body.includes(",");
  if (commaSyntax && body.includes("/")) return null;
  const parts = commaSyntax
    ? body.split(",").map((part) => part.trim())
    : body.split(/\s*\/\s*/);
  if (!commaSyntax && parts.length > 2) return null;
  const values = commaSyntax ? parts.slice(0, 3) : parts[0].trim().split(/\s+/);
  if (values.length !== 3 || (commaSyntax && ![3, 4].includes(parts.length)))
    return null;
  const alphaText = commaSyntax ? parts[3] : parts[1];
  const alpha = alphaText === undefined ? 1 : numericChannel(alphaText, 1);
  if (alpha === null || alpha < 0 || alpha > 1) return null;
  if (name.startsWith("rgb")) {
    const channels = values.map((part) => numericChannel(part, 255));
    if (channels.some((part) => part === null || part < 0 || part > 255))
      return null;
    return {
      red: Math.round(channels[0]!),
      green: Math.round(channels[1]!),
      blue: Math.round(channels[2]!),
      alpha,
    };
  }
  const angle = values[0].match(
    /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(deg|grad|rad|turn)?$/i,
  );
  if (!angle || !values[1].endsWith("%") || !values[2].endsWith("%"))
    return null;
  const units: Record<string, number> = {
    deg: 1,
    grad: 0.9,
    rad: 180 / Math.PI,
    turn: 360,
  };
  const hue = Number(angle[1]) * units[angle[2]?.toLowerCase() ?? "deg"];
  const saturation = numericChannel(values[1], 100);
  const lightness = numericChannel(values[2], 100);
  if (
    !Number.isFinite(hue) ||
    saturation === null ||
    lightness === null ||
    saturation < 0 ||
    saturation > 100 ||
    lightness < 0 ||
    lightness > 100
  )
    return null;
  return hslToRgb({ hue, saturation, lightness, alpha });
}

export function parseHexColor(input: string): ParsedColor | null {
  const normalized = input.trim().replace(/^#/, "");

  if (
    !/^[\da-f]+$/i.test(normalized) ||
    ![3, 4, 6, 8].includes(normalized.length)
  ) {
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
