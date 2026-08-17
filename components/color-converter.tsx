"use client";

import { useMemo, useState } from "react";
import styles from "@/components/developer-tools.module.css";
import {
  formatHexColor,
  formatHslColor,
  formatRgbColor,
  parseHexColor,
  rgbToHsl,
} from "@/lib/color-utils";

export default function ColorConverter() {
  const [hexInput, setHexInput] = useState("#67e5b4");
  const [copyState, setCopyState] = useState("");

  const calculation = useMemo(() => {
    const parsed = parseHexColor(hexInput);

    if (!parsed) {
      return {
        error: "Enter a 3, 4, 6, or 8 digit hexadecimal color.",
        formats: null,
      };
    }

    return {
      error: "",
      formats: {
        hex: formatHexColor(parsed),
        rgb: formatRgbColor(parsed),
        hsl: formatHslColor(rgbToHsl(parsed)),
      },
    };
  }, [hexInput]);

  async function copyFormat(label: string, value: string) {
    if (!navigator.clipboard) {
      setCopyState("unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopyState(label);
    } catch {
      setCopyState("unavailable");
    }
  }

  function updateHex(value: string) {
    setHexInput(value);
    setCopyState("");
  }

  const previewColor = calculation.formats?.hex ?? "#ffffff";

  return (
    <div className={styles.toolCard}>
      <div className={styles.toolHeading}>
        <div>
          <span>sRGB formats</span>
          <h2>Convert a CSS color</h2>
        </div>
        <span className={styles.privacyBadge}>Alpha supported</span>
      </div>

      <div className={styles.colorLayout}>
        <div className={styles.colorFields}>
          <label className={styles.field}>
            <span>HEX color</span>
            <span className={styles.hexShell}>
              <input
                className={styles.nativeColor}
                type="color"
                value={calculation.formats?.hex.slice(0, 7) ?? "#ffffff"}
                onChange={(event) => updateHex(event.target.value)}
                aria-label="Choose a color"
              />
              <input
                className={styles.hexInput}
                type="text"
                value={hexInput}
                onChange={(event) => updateHex(event.target.value)}
                spellCheck="false"
                autoCapitalize="characters"
                aria-invalid={Boolean(calculation.error)}
              />
            </span>
          </label>
          <p className={styles.error} role={calculation.error ? "alert" : undefined}>
            {calculation.error}
          </p>

          <div className={styles.formatList} aria-live="polite" aria-atomic="true">
            {calculation.formats &&
              Object.entries(calculation.formats).map(([label, value]) => (
                <div className={styles.formatRow} key={label}>
                  <span>{label}</span>
                  <code>{value}</code>
                  <button
                    type="button"
                    onClick={() => copyFormat(label, value)}
                  >
                    {copyState === label
                      ? "Copied"
                      : copyState === "unavailable"
                        ? "Unavailable"
                        : "Copy"}
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div
          className={styles.colorSwatch}
          style={{ backgroundColor: previewColor }}
          aria-label={`Color preview for ${previewColor}`}
        >
          <span>{previewColor}</span>
        </div>
      </div>
    </div>
  );
}
