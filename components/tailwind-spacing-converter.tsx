"use client";

import { useMemo, useState } from "react";
import CopyOutputButton from "@/components/copy-output-button";
import styles from "@/components/developer-tools.module.css";
import { formatConversionNumber } from "@/lib/conversion-math";
import { calculateTailwindSpacing } from "@/lib/developer-math";

export default function TailwindSpacingConverter() {
  const [multiplier, setMultiplier] = useState("6");
  const [spacingRem, setSpacingRem] = useState("0.25");
  const [rootFontSize, setRootFontSize] = useState("16");

  const calculation = useMemo(() => {
    const numericMultiplier = Number(multiplier);
    const numericSpacing = Number(spacingRem);
    const numericRoot = Number(rootFontSize);

    if (
      !multiplier.trim() ||
      !spacingRem.trim() ||
      !rootFontSize.trim() ||
      ![numericMultiplier, numericSpacing, numericRoot].every(Number.isFinite) ||
      numericMultiplier < 0 ||
      numericSpacing <= 0 ||
      numericRoot <= 0
    ) {
      return { error: "Enter a non-negative spacing number and positive base values.", result: null };
    }

    return {
      error: "",
      result: calculateTailwindSpacing(
        numericMultiplier,
        numericSpacing,
        numericRoot,
      ),
    };
  }, [multiplier, rootFontSize, spacingRem]);

  const remText = calculation.result
    ? formatConversionNumber(calculation.result.rem)
    : "—";
  const pixelText = calculation.result
    ? formatConversionNumber(calculation.result.px)
    : "—";
  const cssValue = calculation.result
    ? `calc(var(--spacing) * ${formatConversionNumber(Number(multiplier))})`
    : "";

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>Tailwind CSS v4</span>
          <h2>Convert a spacing utility</h2>
        </div>
        <span className={styles.privacyBadge}>Custom theme ready</span>
      </div>

      <div className={`${styles.fieldGrid} ${styles.fieldGridThree}`}>
        <SpacingField
          label="Spacing number"
          value={multiplier}
          onChange={setMultiplier}
          step="0.5"
        />
        <SpacingField
          label="--spacing value"
          value={spacingRem}
          onChange={setSpacingRem}
          unit="rem"
          step="0.01"
        />
        <SpacingField
          label="Root font size"
          value={rootFontSize}
          onChange={setRootFontSize}
          unit="px"
          step="0.1"
        />
      </div>

      <p className={styles.error} role={calculation.error ? "alert" : undefined}>
        {calculation.error}
      </p>

      <div className={styles.resultGrid} aria-live="polite" aria-atomic="true">
        <div className={styles.resultItem}>
          <span>REM</span>
          <strong>{remText}</strong>
          <small>{remText}rem</small>
        </div>
        <div className={styles.resultItem}>
          <span>Pixels</span>
          <strong>{pixelText}</strong>
          <small>{pixelText}px at this root</small>
        </div>
        <div className={styles.resultItem}>
          <span>Multiplier</span>
          <strong>{calculation.result ? multiplier : "—"}</strong>
          <small>times --spacing</small>
        </div>
      </div>

      <div className={styles.utilityExamples} aria-label="Example utilities">
        {["p", "m", "gap", "w", "h"].map((prefix) => (
          <code key={prefix}>{`${prefix}-${multiplier || "…"}`}</code>
        ))}
      </div>

      <div className={styles.resultBox}>
        <div className={styles.resultHeader}>
          <span>Generated CSS value</span>
          <CopyOutputButton value={cssValue} disabled={!calculation.result} />
        </div>
        <code className={styles.codeValue}>{cssValue || "Enter valid values"}</code>
      </div>
    </div>
  );
}

function SpacingField({
  label,
  value,
  onChange,
  unit,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  step: string;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <span className={styles.control}>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {unit && <b>{unit}</b>}
      </span>
    </label>
  );
}
