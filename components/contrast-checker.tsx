"use client";

import { useMemo, useState } from "react";
import styles from "@/components/developer-tools.module.css";
import { contrastRatio, parseHexColor } from "@/lib/color-utils";

const thresholds = [
  { label: "AA normal text", value: 4.5 },
  { label: "AA large text", value: 3 },
  { label: "AAA normal text", value: 7 },
  { label: "AAA large text", value: 4.5 },
];

export default function ContrastChecker() {
  const [foreground, setForeground] = useState("#10221d");
  const [background, setBackground] = useState("#fffefa");

  const calculation = useMemo(() => {
    const foregroundColor = parseHexColor(foreground);
    const backgroundColor = parseHexColor(background);

    if (
      !foregroundColor ||
      !backgroundColor ||
      foregroundColor.alpha !== 1 ||
      backgroundColor.alpha !== 1
    ) {
      return { error: "Enter two opaque 3- or 6-digit HEX colors.", ratio: null };
    }

    return {
      error: "",
      ratio: contrastRatio(foregroundColor, backgroundColor),
    };
  }, [background, foreground]);

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>WCAG 2.2</span>
          <h2>Check text contrast</h2>
        </div>
        <span className={styles.privacyBadge}>AA and AAA</span>
      </div>

      <div className={styles.contrastLayout}>
        <div>
          <div className={styles.fieldGrid}>
            <ColorField
              label="Text color"
              value={foreground}
              onChange={setForeground}
            />
            <ColorField
              label="Background color"
              value={background}
              onChange={setBackground}
            />
          </div>
          <p className={styles.error} role={calculation.error ? "alert" : undefined}>
            {calculation.error}
          </p>

          <div className={styles.contrastRatio} aria-live="polite" aria-atomic="true">
            <span>Contrast ratio</span>
            <strong>
              {calculation.ratio ? `${calculation.ratio.toFixed(2)}:1` : "—"}
            </strong>
          </div>

          <div className={styles.statusGrid}>
            {thresholds.map((threshold) => {
              const passes =
                calculation.ratio !== null && calculation.ratio >= threshold.value;
              const status =
                calculation.ratio === null ? "Not checked" : passes ? "Pass" : "Fail";

              return (
                <div
                  className={`${styles.statusItem} ${
                    calculation.ratio === null ? "" : passes ? styles.pass : styles.fail
                  }`}
                  key={threshold.label}
                >
                  <span>{threshold.label}</span>
                  <b>{status}</b>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={styles.contrastPreview}
          style={{ color: foreground, backgroundColor: background }}
          aria-label="Contrast preview"
        >
          <span>
            AyeCalc
            <small>Readable text starts with real context.</small>
          </span>
        </div>
      </div>
    </div>
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
  const parsed = parseHexColor(value);
  const colorPickerValue =
    parsed && parsed.alpha === 1
      ? `#${[parsed.red, parsed.green, parsed.blue]
          .map((channel) => channel.toString(16).padStart(2, "0"))
          .join("")}`
      : "#ffffff";

  return (
    <label className={styles.field}>
      <span>{label}</span>
      <span className={styles.hexShell}>
        <input
          className={styles.nativeColor}
          type="color"
          value={colorPickerValue}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`Choose ${label.toLowerCase()}`}
        />
        <input
          className={styles.hexInput}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck="false"
          aria-invalid={!parsed || parsed.alpha !== 1}
        />
      </span>
    </label>
  );
}
