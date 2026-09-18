import {
  outputFormats,
  type BatchMode,
  type BatchSettings,
} from "@/lib/image-batch";
import type { SupportedImageMime } from "@/lib/image-tools";
import styles from "@/components/image-tools.module.css";

export default function BatchOutputSettings({
  mode,
  settings,
  onChange,
  supportedOutputs,
  showQuality,
  showBackground,
  hasUnsupportedOutput,
  hasIncompatibleTarget,
}: {
  mode: BatchMode;
  settings: BatchSettings;
  onChange: (value: Partial<BatchSettings>) => void;
  supportedOutputs: SupportedImageMime[];
  showQuality: boolean;
  showBackground: boolean;
  hasUnsupportedOutput: boolean;
  hasIncompatibleTarget: boolean;
}) {
  return (
    <div className={styles.outputSettings}>
      <label className={styles.field}>
        <span>Output format</span>
        <select
          value={settings.outputFormat}
          onChange={(event) =>
            onChange({
              outputFormat: event.target.value as BatchSettings["outputFormat"],
            })
          }
        >
          {outputFormats
            .filter(
              (format) => mode !== "convert" || format.value !== "original",
            )
            .map((format) => (
              <option
                key={format.value}
                value={format.value}
                disabled={
                  format.value !== "original" &&
                  !supportedOutputs.includes(format.value)
                }
              >
                {format.label}
              </option>
            ))}
        </select>
        {hasUnsupportedOutput && (
          <small className={styles.formatWarning}>
            Choose an output format this browser can encode.
          </small>
        )}
      </label>
      {showQuality && (
        <label className={`${styles.field} ${styles.rangeField}`}>
          <span>
            Quality <b>{settings.quality}%</b>
          </span>
          <input
            type="range"
            min="10"
            max="95"
            value={settings.quality}
            onChange={(event) =>
              onChange({ quality: Number(event.target.value) })
            }
          />
        </label>
      )}
      {showBackground && (
        <label className={styles.field}>
          <span>JPEG background</span>
          <span className={styles.colorControl}>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(event) =>
                onChange({ backgroundColor: event.target.value })
              }
            />
            <code>{settings.backgroundColor}</code>
          </span>
        </label>
      )}
      {mode === "compress" && (
        <div className={styles.targetControl}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.targetEnabled}
              onChange={(event) =>
                onChange({ targetEnabled: event.target.checked })
              }
            />
            Target file size
          </label>
          {settings.targetEnabled && (
            <>
              <label className={styles.field}>
                <span>Target</span>
                <span className={styles.numberControl}>
                  <input
                    type="number"
                    min="1"
                    max="102400"
                    value={settings.targetKilobytes}
                    onChange={(event) =>
                      onChange({
                        targetKilobytes: Math.max(
                          1,
                          Number(event.target.value),
                        ),
                      })
                    }
                  />
                  <b>KB</b>
                </span>
              </label>
              {hasIncompatibleTarget && (
                <small className={styles.formatWarning}>
                  Target size is available only for JPEG and WebP output.
                </small>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
