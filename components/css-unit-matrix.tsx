"use client";

import { useMemo, useState } from "react";
import CopyOutputButton from "@/components/copy-output-button";
import styles from "@/components/developer-tools.module.css";
import { formatConversionNumber } from "@/lib/conversion-math";
import {
  convertCssUnitMatrix,
  type CssUnit,
} from "@/lib/developer-math";

export default function CssUnitMatrix() {
  const [value, setValue] = useState("24");
  const [sourceUnit, setSourceUnit] = useState<CssUnit>("px");
  const [rootFontSize, setRootFontSize] = useState("16");
  const [elementFontSize, setElementFontSize] = useState("20");

  const calculation = useMemo(() => {
    const numericValue = Number(value);
    const root = Number(rootFontSize);
    const element = Number(elementFontSize);

    if (
      !value.trim() ||
      !rootFontSize.trim() ||
      !elementFontSize.trim() ||
      ![numericValue, root, element].every(Number.isFinite) ||
      root <= 0 ||
      element <= 0
    ) {
      return { error: "Enter a valid value and positive font sizes.", result: null };
    }

    return {
      error: "",
      result: convertCssUnitMatrix(numericValue, sourceUnit, root, element),
    };
  }, [elementFontSize, rootFontSize, sourceUnit, value]);

  const token = calculation.result
    ? `--size: ${formatConversionNumber(calculation.result.rem)}rem;`
    : "";

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>Context-aware units</span>
          <h2>Compare PX, REM, and EM</h2>
        </div>
        <span className={styles.privacyBadge}>Runs locally</span>
      </div>

      <div className={`${styles.fieldGrid} ${styles.fieldGridThree}`}>
        <label className={styles.field}>
          <span>Source value</span>
          <span className={styles.control}>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </span>
        </label>
        <label className={styles.selectField}>
          <span>Source unit</span>
          <span className={styles.selectControl}>
            <select
              value={sourceUnit}
              onChange={(event) => setSourceUnit(event.target.value as CssUnit)}
            >
              <option value="px">Pixels (px)</option>
              <option value="rem">Root ems (rem)</option>
              <option value="em">Ems (em)</option>
            </select>
          </span>
        </label>
        <MatrixNumberField
          label="Root font size"
          value={rootFontSize}
          onChange={setRootFontSize}
        />
        <MatrixNumberField
          label="Element font size"
          value={elementFontSize}
          onChange={setElementFontSize}
        />
      </div>

      <p className={styles.error} role={calculation.error ? "alert" : undefined}>
        {calculation.error}
      </p>

      <div className={styles.resultGrid} aria-live="polite" aria-atomic="true">
        {(["px", "rem", "em"] as const).map((unit) => (
          <div className={styles.resultItem} key={unit}>
            <span>{unit}</span>
            <strong>
              {calculation.result
                ? formatConversionNumber(calculation.result[unit])
                : "—"}
            </strong>
            <small>{unit === "px" ? "absolute reference" : "relative unit"}</small>
          </div>
        ))}
      </div>

      <div className={styles.resultBox}>
        <div className={styles.resultHeader}>
          <span>CSS token</span>
          <CopyOutputButton value={token} disabled={!calculation.result} />
        </div>
        <code className={styles.codeValue}>{token || "Enter valid values"}</code>
      </div>
    </div>
  );
}

function MatrixNumberField({
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
          step="0.1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <b>px</b>
      </span>
    </label>
  );
}
