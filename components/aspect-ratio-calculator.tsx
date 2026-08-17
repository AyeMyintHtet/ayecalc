"use client";

import { useMemo, useState } from "react";
import CopyOutputButton from "@/components/copy-output-button";
import styles from "@/components/developer-tools.module.css";
import { formatConversionNumber } from "@/lib/conversion-math";
import {
  calculateProportionalHeight,
  simplifyAspectRatio,
} from "@/lib/developer-math";

export default function AspectRatioCalculator() {
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [targetWidth, setTargetWidth] = useState("1280");

  const calculation = useMemo(() => {
    const numericWidth = Number(width);
    const numericHeight = Number(height);
    const numericTarget = Number(targetWidth);

    if (
      !width.trim() ||
      !height.trim() ||
      !targetWidth.trim() ||
      ![numericWidth, numericHeight, numericTarget].every(Number.isFinite) ||
      numericWidth <= 0 ||
      numericHeight <= 0 ||
      numericTarget <= 0
    ) {
      return { error: "Enter positive width, height, and target width values.", result: null };
    }

    return {
      error: "",
      result: {
        ratio: simplifyAspectRatio(numericWidth, numericHeight),
        targetHeight: calculateProportionalHeight(
          numericWidth,
          numericHeight,
          numericTarget,
        ),
      },
    };
  }, [height, targetWidth, width]);

  const ratioText = calculation.result
    ? `${formatConversionNumber(calculation.result.ratio.width)}:${formatConversionNumber(calculation.result.ratio.height)}`
    : "—";
  const cssValue = calculation.result
    ? `aspect-ratio: ${formatConversionNumber(calculation.result.ratio.width)} / ${formatConversionNumber(calculation.result.ratio.height)};`
    : "";

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>Proportional sizing</span>
          <h2>Simplify and resize a ratio</h2>
        </div>
        <span className={styles.privacyBadge}>Instant result</span>
      </div>

      <div className={styles.ratioLayout}>
        <div>
          <div className={styles.fieldGrid}>
            <RatioField label="Original width" value={width} onChange={setWidth} />
            <RatioField label="Original height" value={height} onChange={setHeight} />
            <RatioField
              label="Target width"
              value={targetWidth}
              onChange={setTargetWidth}
            />
          </div>
          <p className={styles.error} role={calculation.error ? "alert" : undefined}>
            {calculation.error}
          </p>
          <div className={styles.resultGrid} aria-live="polite" aria-atomic="true">
            <div className={styles.resultItem}>
              <span>Simplified</span>
              <strong>{ratioText}</strong>
              <small>width : height</small>
            </div>
            <div className={styles.resultItem}>
              <span>Target height</span>
              <strong>
                {calculation.result
                  ? formatConversionNumber(calculation.result.targetHeight)
                  : "—"}
              </strong>
              <small>px</small>
            </div>
            <div className={styles.resultItem}>
              <span>Decimal</span>
              <strong>
                {calculation.result
                  ? formatConversionNumber(calculation.result.ratio.decimal)
                  : "—"}
              </strong>
              <small>width ÷ height</small>
            </div>
          </div>
        </div>

        <div className={styles.ratioPreview} aria-hidden="true">
          <div
            className={styles.ratioShape}
            style={{
              aspectRatio: calculation.result
                ? `${calculation.result.ratio.width} / ${calculation.result.ratio.height}`
                : "16 / 9",
            }}
          >
            <span>{ratioText}</span>
          </div>
        </div>
      </div>

      <div className={styles.resultBox}>
        <div className={styles.resultHeader}>
          <span>CSS declaration</span>
          <CopyOutputButton value={cssValue} disabled={!calculation.result} />
        </div>
        <code className={styles.codeValue}>{cssValue || "Enter valid values"}</code>
      </div>
    </div>
  );
}

function RatioField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <span className={styles.control}>
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <b>px</b>
      </span>
    </label>
  );
}
