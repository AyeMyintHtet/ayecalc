"use client";

import { useMemo, useState } from "react";
import CopyOutputButton from "@/components/copy-output-button";
import styles from "@/components/developer-tools.module.css";
import { formatConversionNumber } from "@/lib/conversion-math";
import { convertPixelsToViewportUnits } from "@/lib/developer-math";

export default function ViewportUnitConverter() {
  const [pixels, setPixels] = useState("32");
  const [viewportWidth, setViewportWidth] = useState("1440");
  const [viewportHeight, setViewportHeight] = useState("900");

  const calculation = useMemo(() => {
    const numericPixels = Number(pixels);
    const numericWidth = Number(viewportWidth);
    const numericHeight = Number(viewportHeight);

    if (
      !pixels.trim() ||
      !viewportWidth.trim() ||
      !viewportHeight.trim() ||
      ![numericPixels, numericWidth, numericHeight].every(Number.isFinite) ||
      numericWidth <= 0 ||
      numericHeight <= 0
    ) {
      return { error: "Enter a valid pixel value and positive viewport dimensions.", result: null };
    }

    return {
      error: "",
      result: convertPixelsToViewportUnits(
        numericPixels,
        numericWidth,
        numericHeight,
      ),
    };
  }, [pixels, viewportHeight, viewportWidth]);

  const cssValue = calculation.result
    ? `width: ${formatConversionNumber(calculation.result.vw)}vw;`
    : "";

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>Viewport-percentage units</span>
          <h2>Convert pixels to viewport units</h2>
        </div>
        <span className={styles.privacyBadge}>Four units</span>
      </div>

      <div className={`${styles.fieldGrid} ${styles.fieldGridThree}`}>
        <ViewportField label="Pixel value" value={pixels} onChange={setPixels} />
        <ViewportField
          label="Viewport width"
          value={viewportWidth}
          onChange={setViewportWidth}
        />
        <ViewportField
          label="Viewport height"
          value={viewportHeight}
          onChange={setViewportHeight}
        />
      </div>

      <p className={styles.error} role={calculation.error ? "alert" : undefined}>
        {calculation.error}
      </p>

      <div className={styles.resultGrid} aria-live="polite" aria-atomic="true">
        {(["vw", "vh", "vmin", "vmax"] as const).map((unit) => (
          <div className={styles.resultItem} key={unit}>
            <span>{unit}</span>
            <strong>
              {calculation.result
                ? formatConversionNumber(calculation.result[unit])
                : "—"}
            </strong>
            <small>{unit}</small>
          </div>
        ))}
      </div>

      <div className={styles.resultBox}>
        <div className={styles.resultHeader}>
          <span>Width-relative CSS</span>
          <CopyOutputButton value={cssValue} disabled={!calculation.result} />
        </div>
        <code className={styles.codeValue}>{cssValue || "Enter valid values"}</code>
      </div>
    </div>
  );
}

function ViewportField({
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
          step="0.1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <b>px</b>
      </span>
    </label>
  );
}
