export type WatermarkMode = "text" | "logo";

export type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type WatermarkFontFamily =
  | "Arial"
  | "Georgia"
  | "Courier New"
  | "Trebuchet MS";

export type ImageWatermarkOptions = {
  mode: WatermarkMode;
  text: string;
  fontFamily: WatermarkFontFamily;
  fontWeight: 400 | 600 | 700;
  color: string;
  outlineColor: string;
  outlineWidthPercent: number;
  opacity: number;
  sizePercent: number;
  rotation: number;
  position: WatermarkPosition;
  marginPercent: number;
  tiled: boolean;
  gapPercent: number;
  logoBlob?: Blob;
};

export type WatermarkPoint = { x: number; y: number };

export function clampWatermarkNumber(
  value: number,
  minimum: number,
  maximum: number,
) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, Math.min(maximum, value));
}

export function getRotatedWatermarkBounds(
  width: number,
  height: number,
  rotation: number,
) {
  const radians = (rotation * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  return {
    width: width * cosine + height * sine,
    height: width * sine + height * cosine,
  };
}

export function calculateWatermarkAnchor(
  canvasWidth: number,
  canvasHeight: number,
  markWidth: number,
  markHeight: number,
  rotation: number,
  position: WatermarkPosition,
  marginPercent: number,
): WatermarkPoint {
  const safeCanvasWidth = Math.max(1, canvasWidth);
  const safeCanvasHeight = Math.max(1, canvasHeight);
  const bounds = getRotatedWatermarkBounds(markWidth, markHeight, rotation);
  const margin =
    Math.min(safeCanvasWidth, safeCanvasHeight) *
    (clampWatermarkNumber(marginPercent, 0, 25) / 100);

  const horizontal = position.endsWith("left")
    ? "left"
    : position.endsWith("right")
      ? "right"
      : "center";
  const vertical = position.startsWith("top")
    ? "top"
    : position.startsWith("bottom")
      ? "bottom"
      : "middle";

  const x =
    horizontal === "left"
      ? margin + bounds.width / 2
      : horizontal === "right"
        ? safeCanvasWidth - margin - bounds.width / 2
        : safeCanvasWidth / 2;
  const y =
    vertical === "top"
      ? margin + bounds.height / 2
      : vertical === "bottom"
        ? safeCanvasHeight - margin - bounds.height / 2
        : safeCanvasHeight / 2;

  return {
    x: clampWatermarkNumber(x, 0, safeCanvasWidth),
    y: clampWatermarkNumber(y, 0, safeCanvasHeight),
  };
}

export function fitWatermarkLogoDimensions(
  canvasWidth: number,
  canvasHeight: number,
  logoWidth: number,
  logoHeight: number,
  sizePercent: number,
) {
  const safeLogoWidth = Math.max(1, logoWidth);
  const safeLogoHeight = Math.max(1, logoHeight);
  const targetWidth =
    Math.max(1, canvasWidth) *
    (clampWatermarkNumber(sizePercent, 2, 90) / 100);
  let width = targetWidth;
  let height = targetWidth * (safeLogoHeight / safeLogoWidth);
  const maximumHeight = Math.max(1, canvasHeight) * 0.9;

  if (height > maximumHeight) {
    const scale = maximumHeight / height;
    width *= scale;
    height = maximumHeight;
  }

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

export function calculateTiledWatermarkPoints(
  canvasWidth: number,
  canvasHeight: number,
  markWidth: number,
  markHeight: number,
  rotation: number,
  gapPercent: number,
  maximumMarks = 400,
) {
  const bounds = getRotatedWatermarkBounds(markWidth, markHeight, rotation);
  const gap =
    Math.min(Math.max(1, canvasWidth), Math.max(1, canvasHeight)) *
    (clampWatermarkNumber(gapPercent, 2, 50) / 100);
  let stepX = Math.max(1, bounds.width + gap);
  let stepY = Math.max(1, bounds.height + gap);
  const safeMaximumMarks = Math.max(1, Math.floor(maximumMarks));
  const countRows = () =>
    Math.floor((Math.max(1, canvasHeight) + bounds.height) / stepY) + 1;
  const countColumns = () =>
    Math.floor(
      (Math.max(1, canvasWidth) + bounds.width + stepX / 2) / stepX,
    ) + 1;

  while (countRows() * countColumns() > safeMaximumMarks) {
    const scale =
      Math.sqrt((countRows() * countColumns()) / safeMaximumMarks) * 1.05;
    stepX *= scale;
    stepY *= scale;
  }
  const points: WatermarkPoint[] = [];
  let row = 0;

  for (
    let y = -bounds.height / 2;
    y <= canvasHeight + bounds.height / 2 && points.length < safeMaximumMarks;
    y += stepY
  ) {
    const rowOffset = row % 2 === 0 ? 0 : stepX / 2;
    for (
      let x = -bounds.width / 2 - rowOffset;
      x <= canvasWidth + bounds.width / 2 && points.length < safeMaximumMarks;
      x += stepX
    ) {
      points.push({ x, y });
    }
    row += 1;
  }

  return points;
}

export function normalizeWatermarkText(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 120);
}
