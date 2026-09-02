"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import CopyOutputButton from "@/components/copy-output-button";
import styles from "@/components/css-corner-shape-generator.module.css";

type ShapeName =
  | "round"
  | "squircle"
  | "bevel"
  | "notch"
  | "scoop"
  | "custom";

type CornerKey = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";

type CornerSettings = {
  shape: ShapeName;
  radius: number;
  exponent: number;
};

type CornerShapeStyle = CSSProperties & {
  cornerShape?: string;
};

const cornerOrder: Array<{ key: CornerKey; label: string; shortLabel: string }> = [
  { key: "topLeft", label: "Top left", shortLabel: "TL" },
  { key: "topRight", label: "Top right", shortLabel: "TR" },
  { key: "bottomRight", label: "Bottom right", shortLabel: "BR" },
  { key: "bottomLeft", label: "Bottom left", shortLabel: "BL" },
];

const shapeOptions: Array<{
  value: ShapeName;
  label: string;
  description: string;
}> = [
  { value: "round", label: "Round", description: "Classic rounded corner" },
  { value: "squircle", label: "Squircle", description: "Soft continuous curve" },
  { value: "bevel", label: "Bevel", description: "Straight diagonal cut" },
  { value: "notch", label: "Notch", description: "Sharp inward cut" },
  { value: "scoop", label: "Scoop", description: "Smooth inward curve" },
];

function createCorners(shape: ShapeName = "squircle", radius = 64) {
  return Object.fromEntries(
    cornerOrder.map(({ key }) => [key, { shape, radius, exponent: 2 }]),
  ) as Record<CornerKey, CornerSettings>;
}

function formatNumber(value: number) {
  return Number(value.toFixed(2)).toString();
}

function getShapeValue(settings: CornerSettings) {
  return settings.shape === "custom"
    ? `superellipse(${formatNumber(settings.exponent)})`
    : settings.shape;
}

function compressFourValues(values: [string, string, string, string]) {
  const [topLeft, topRight, bottomRight, bottomLeft] = values;
  if (values.every((value) => value === topLeft)) return topLeft;
  if (topLeft === bottomRight && topRight === bottomLeft) {
    return `${topLeft} ${topRight}`;
  }
  if (topRight === bottomLeft) {
    return `${topLeft} ${topRight} ${bottomRight}`;
  }
  return values.join(" ");
}

function clamp(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}

export default function CssCornerShapeGenerator() {
  const [corners, setCorners] = useState(() => createCorners());
  const [editMode, setEditMode] = useState<"together" | "separate">("together");
  const [width, setWidth] = useState(420);
  const [height, setHeight] = useState(260);
  const [borderWidth, setBorderWidth] = useState(3);
  const [fillColor, setFillColor] = useState("#c9f2df");
  const [borderColor, setBorderColor] = useState("#176f50");
  const [textColor, setTextColor] = useState("#10221d");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupported(CSS.supports("corner-shape", "squircle"));
  }, []);

  const radiusValues = cornerOrder.map(
    ({ key }) => `${Math.round(corners[key].radius)}px`,
  ) as [string, string, string, string];
  const shapeValues = cornerOrder.map(({ key }) =>
    getShapeValue(corners[key]),
  ) as [string, string, string, string];
  const radiusCss = compressFourValues(radiusValues);
  const shapeCss = compressFourValues(shapeValues);

  const generatedCss = useMemo(
    () => `.corner-shape-demo {
  width: min(100%, ${width}px);
  min-height: ${height}px;
  border: ${borderWidth ? `${borderWidth}px solid ${borderColor}` : "0"};
  border-radius: ${radiusCss};
  corner-shape: ${shapeCss};
  overflow: hidden;
  color: ${textColor};
  background: ${fillColor};
}`,
    [
      borderColor,
      borderWidth,
      fillColor,
      height,
      radiusCss,
      shapeCss,
      textColor,
      width,
    ],
  );

  const previewStyle: CornerShapeStyle = {
    width: `min(100%, ${width}px)`,
    minHeight: `${height}px`,
    border: borderWidth ? `${borderWidth}px solid ${borderColor}` : "0",
    borderRadius: radiusCss,
    cornerShape: shapeCss,
    color: textColor,
    background: fillColor,
  };

  function updateAllCorners(change: Partial<CornerSettings>) {
    setCorners((current) =>
      Object.fromEntries(
        cornerOrder.map(({ key }) => [
          key,
          { ...current[key], ...change },
        ]),
      ) as Record<CornerKey, CornerSettings>,
    );
  }

  function updateCorner(key: CornerKey, change: Partial<CornerSettings>) {
    setCorners((current) => ({
      ...current,
      [key]: { ...current[key], ...change },
    }));
  }

  function applyPreset(shape: Exclude<ShapeName, "custom">) {
    updateAllCorners({ shape });
  }

  function resetGenerator() {
    setCorners(createCorners());
    setEditMode("together");
    setWidth(420);
    setHeight(260);
    setBorderWidth(3);
    setFillColor("#c9f2df");
    setBorderColor("#176f50");
    setTextColor("#10221d");
  }

  const commonCorner = corners.topLeft;

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>Interactive CSS generator</span>
          <h2>Shape every corner</h2>
        </div>
        <button type="button" className={styles.resetButton} onClick={resetGenerator}>
          Reset
        </button>
      </div>

      <section className={styles.presetSection} aria-labelledby="corner-presets-title">
        <div className={styles.sectionHeading}>
          <div>
            <span>Quick start</span>
            <strong id="corner-presets-title">Click a shape to apply it to all corners</strong>
          </div>
          <small>Adjust any corner below</small>
        </div>
        <div className={styles.presetGrid}>
          {shapeOptions.map((option) => {
            const demoStyle: CornerShapeStyle = {
              cornerShape: option.value,
            };
            const isActive = cornerOrder.every(
              ({ key }) => corners[key].shape === option.value,
            );
            return (
              <button
                type="button"
                className={styles.presetButton}
                aria-pressed={isActive}
                onClick={() => applyPreset(option.value as Exclude<ShapeName, "custom">)}
                key={option.value}
              >
                <span className={styles.presetShape} style={demoStyle} aria-hidden="true" />
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className={styles.workspace}>
        <section className={styles.previewPanel} aria-labelledby="corner-preview-title">
          <div className={styles.panelHeading}>
            <div>
              <span>Live demo</span>
              <h3 id="corner-preview-title">Preview result</h3>
            </div>
            <span
              className={`${styles.supportBadge} ${
                isSupported === false ? styles.unsupportedBadge : ""
              }`}
            >
              {isSupported === null
                ? "Checking support"
                : isSupported
                  ? "Supported here"
                  : "Not supported here"}
            </span>
          </div>

          <div className={styles.previewStage}>
            <article className={styles.previewCard} style={previewStyle}>
              <span>CSS corner-shape</span>
              <h4>Build beyond rounded rectangles.</h4>
              <p>
                Mix soft, sharp, and concave corners, then copy the exact CSS below.
              </p>
              <div className={styles.previewActions} aria-hidden="true">
                <span>Primary action</span>
                <span>Learn more</span>
              </div>
            </article>
          </div>

          <div className={styles.previewMeta} aria-live="polite">
            <span>{width} × {height}px demo</span>
            <span>{editMode === "together" ? "Linked corners" : "Independent corners"}</span>
          </div>
          {isSupported === false && (
            <p className={styles.supportNote} role="status">
              This browser falls back to rounded corners. The generated CSS can still be copied and tested in a supporting browser.
            </p>
          )}
        </section>

        <section className={styles.controlsPanel} aria-label="Corner shape controls">
          <div className={styles.controlSection}>
            <div className={styles.controlSectionHeading}>
              <span>1</span>
              <div>
                <strong>Demo area</strong>
                <small>Resize the example</small>
              </div>
            </div>
            <div className={styles.twoColumnGrid}>
              <RangeNumberField
                label="Width"
                value={width}
                minimum={220}
                maximum={640}
                unit="px"
                onChange={setWidth}
              />
              <RangeNumberField
                label="Height"
                value={height}
                minimum={160}
                maximum={440}
                unit="px"
                onChange={setHeight}
              />
            </div>
          </div>

          <div className={styles.controlSection}>
            <div className={styles.controlSectionHeading}>
              <span>2</span>
              <div>
                <strong>Corner controls</strong>
                <small>Link them or adjust all four areas</small>
              </div>
            </div>
            <div className={styles.modeControl}>
              <button
                type="button"
                aria-pressed={editMode === "together"}
                onClick={() => {
                  updateAllCorners(corners.topLeft);
                  setEditMode("together");
                }}
              >
                All together
              </button>
              <button
                type="button"
                aria-pressed={editMode === "separate"}
                onClick={() => setEditMode("separate")}
              >
                Each corner
              </button>
            </div>

            {editMode === "together" ? (
              <div className={styles.linkedControls}>
                <ShapeSelect
                  label="Shape"
                  value={commonCorner.shape}
                  onChange={(shape) => updateAllCorners({ shape })}
                />
                <RangeNumberField
                  label="Radius"
                  value={commonCorner.radius}
                  minimum={0}
                  maximum={200}
                  unit="px"
                  onChange={(radius) => updateAllCorners({ radius })}
                />
                {commonCorner.shape === "custom" && (
                  <RangeNumberField
                    label="Superellipse K"
                    value={commonCorner.exponent}
                    minimum={-5}
                    maximum={5}
                    step={0.1}
                    unit="K"
                    onChange={(exponent) => updateAllCorners({ exponent })}
                  />
                )}
              </div>
            ) : (
              <div className={styles.cornerGrid}>
                {cornerOrder.map(({ key, label, shortLabel }) => (
                  <div className={styles.cornerCard} key={key}>
                    <div className={styles.cornerCardHeading}>
                      <span>{shortLabel}</span>
                      <strong>{label}</strong>
                    </div>
                    <ShapeSelect
                      label={`${label} shape`}
                      value={corners[key].shape}
                      hideLabel
                      onChange={(shape) => updateCorner(key, { shape })}
                    />
                    <RangeNumberField
                      label="Radius"
                      value={corners[key].radius}
                      minimum={0}
                      maximum={200}
                      unit="px"
                      compact
                      onChange={(radius) => updateCorner(key, { radius })}
                    />
                    {corners[key].shape === "custom" && (
                      <RangeNumberField
                        label="Superellipse K"
                        value={corners[key].exponent}
                        minimum={-5}
                        maximum={5}
                        step={0.1}
                        unit="K"
                        compact
                        onChange={(exponent) => updateCorner(key, { exponent })}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className={styles.hint}>A radius above 0 is required for the corner shape to be visible.</p>
          </div>

          <div className={styles.controlSection}>
            <div className={styles.controlSectionHeading}>
              <span>3</span>
              <div>
                <strong>Appearance</strong>
                <small>Finish the demo style</small>
              </div>
            </div>
            <RangeNumberField
              label="Border width"
              value={borderWidth}
              minimum={0}
              maximum={16}
              unit="px"
              onChange={setBorderWidth}
            />
            <div className={styles.colorGrid}>
              <ColorField label="Fill" value={fillColor} onChange={setFillColor} />
              <ColorField label="Border" value={borderColor} onChange={setBorderColor} />
              <ColorField label="Text" value={textColor} onChange={setTextColor} />
            </div>
          </div>
        </section>
      </div>

      <section className={styles.resultBox} aria-labelledby="corner-css-title">
        <div className={styles.resultHeader}>
          <div>
            <span>Generated result</span>
            <strong id="corner-css-title">Copy-ready CSS</strong>
          </div>
          <CopyOutputButton value={generatedCss} label="Copy CSS" />
        </div>
        <pre><code>{generatedCss}</code></pre>
      </section>
    </div>
  );
}

function ShapeSelect({
  label,
  value,
  hideLabel = false,
  onChange,
}: {
  label: string;
  value: ShapeName;
  hideLabel?: boolean;
  onChange: (value: ShapeName) => void;
}) {
  return (
    <label className={styles.selectField}>
      <span className={hideLabel ? styles.visuallyHidden : undefined}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as ShapeName)}>
        {shapeOptions.map((option) => (
          <option value={option.value} key={option.value}>{option.label}</option>
        ))}
        <option value="custom">Custom superellipse</option>
      </select>
    </label>
  );
}

function RangeNumberField({
  label,
  value,
  minimum,
  maximum,
  step = 1,
  unit,
  compact = false,
  onChange,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step?: number;
  unit: string;
  compact?: boolean;
  onChange: (value: number) => void;
}) {
  const updateValue = (value: string) => {
    onChange(clamp(Number(value), minimum, maximum));
  };

  return (
    <label className={`${styles.rangeField} ${compact ? styles.compactRange : ""}`}>
      <span>{label}</span>
      <span className={styles.rangeControl}>
        <input
          type="range"
          min={minimum}
          max={maximum}
          step={step}
          value={value}
          onChange={(event) => updateValue(event.target.value)}
        />
        <span className={styles.numberControl}>
          <input
            type="number"
            inputMode="decimal"
            min={minimum}
            max={maximum}
            step={step}
            value={value}
            aria-label={`${label} value`}
            onChange={(event) => updateValue(event.target.value)}
          />
          <b>{unit}</b>
        </span>
      </span>
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.colorField}>
      <span>{label}</span>
      <span>
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        <code>{value}</code>
      </span>
    </label>
  );
}
