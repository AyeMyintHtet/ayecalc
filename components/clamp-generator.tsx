"use client";

import { useMemo, useState } from "react";
import CopyOutputButton from "@/components/copy-output-button";
import styles from "@/components/developer-tools.module.css";
import { calculateClamp } from "@/lib/developer-math";

function parseValue(value: string) {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : null;
}

export default function ClampGenerator() {
  const [minimumViewport, setMinimumViewport] = useState("320");
  const [maximumViewport, setMaximumViewport] = useState("1280");
  const [minimumSize, setMinimumSize] = useState("16");
  const [maximumSize, setMaximumSize] = useState("32");
  const [rootFontSize, setRootFontSize] = useState("16");

  const calculation = useMemo(() => {
    const values = {
      minimumViewport: parseValue(minimumViewport),
      maximumViewport: parseValue(maximumViewport),
      minimumSize: parseValue(minimumSize),
      maximumSize: parseValue(maximumSize),
      rootFontSize: parseValue(rootFontSize),
    };

    if (Object.values(values).some((value) => value === null)) {
      return { error: "Enter a valid number in every field.", result: null };
    }

    const validValues = values as Record<keyof typeof values, number>;

    if (
      validValues.minimumViewport < 0 ||
      validValues.maximumViewport <= 0 ||
      validValues.minimumSize < 0 ||
      validValues.maximumSize < 0 ||
      validValues.rootFontSize <= 0
    ) {
      return {
        error: "Use non-negative sizes and a positive viewport maximum and root size.",
        result: null,
      };
    }

    if (validValues.maximumViewport <= validValues.minimumViewport) {
      return {
        error: "Maximum viewport width must be greater than minimum viewport width.",
        result: null,
      };
    }

    if (validValues.maximumSize < validValues.minimumSize) {
      return {
        error: "Maximum size must be greater than or equal to minimum size.",
        result: null,
      };
    }

    return {
      error: "",
      result: calculateClamp(
        validValues.minimumViewport,
        validValues.maximumViewport,
        validValues.minimumSize,
        validValues.maximumSize,
        validValues.rootFontSize,
      ),
    };
  }, [
    maximumSize,
    maximumViewport,
    minimumSize,
    minimumViewport,
    rootFontSize,
  ]);

  const remCss = calculation.result
    ? `font-size: ${calculation.result.remValue};`
    : "";

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>Fluid scale inputs</span>
          <h2>Generate your clamp()</h2>
        </div>
        <span className={styles.privacyBadge}>Runs locally</span>
      </div>

      <div className={styles.fieldGrid}>
        <NumberField
          label="Minimum viewport"
          value={minimumViewport}
          onChange={setMinimumViewport}
          unit="px"
        />
        <NumberField
          label="Maximum viewport"
          value={maximumViewport}
          onChange={setMaximumViewport}
          unit="px"
        />
        <NumberField
          label="Minimum size"
          value={minimumSize}
          onChange={setMinimumSize}
          unit="px"
        />
        <NumberField
          label="Maximum size"
          value={maximumSize}
          onChange={setMaximumSize}
          unit="px"
        />
        <NumberField
          label="Root font size"
          value={rootFontSize}
          onChange={setRootFontSize}
          unit="px"
          help="Used for the REM version."
        />
      </div>

      <p className={styles.error} role={calculation.error ? "alert" : undefined}>
        {calculation.error}
      </p>

      <div className={styles.resultBox} aria-live="polite" aria-atomic="true">
        <div className={styles.resultHeader}>
          <span>Generated CSS</span>
          <CopyOutputButton
            value={remCss}
            label="Copy REM CSS"
            disabled={!calculation.result}
          />
        </div>
        <code className={styles.codeValue}>
          {calculation.result?.remValue ?? "Enter valid values"}
        </code>
        {calculation.result && (
          <code className={styles.secondaryCode}>{calculation.result.pixelValue}</code>
        )}
      </div>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
  help?: string;
};

function NumberField({ label, value, onChange, unit, help }: NumberFieldProps) {
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
        <b>{unit}</b>
      </span>
      {help && <small>{help}</small>}
    </label>
  );
}
