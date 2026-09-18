"use client";

import { useState } from "react";
import Link from "next/link";
import ToolIcon from "@/components/tool-icon";
import { convertValue, formatConversionNumber } from "@/lib/conversion-math";
import styles from "@/app/home.module.css";

export default function HomeQuickConverter() {
  const [value, setValue] = useState("24");
  const [root, setRoot] = useState("16");
  const [reversed, setReversed] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const from = reversed ? "rem" : "px";
  const to = reversed ? "px" : "rem";
  const validValue = value.trim() !== "" && Number.isFinite(Number(value));
  const validRoot = root.trim() !== "" && Number.isFinite(Number(root)) && Number(root) > 0;
  const result = validValue && validRoot
    ? convertValue(from, to, Number(value), { rootFontSize: Number(root) })
    : Number.NaN;
  const validResult = Number.isFinite(result);
  const formattedResult = formatConversionNumber(result);

  function swapUnits() {
    if (validResult) setValue(String(result));
    setReversed(!reversed);
    setCopyStatus("");
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(`${Number(result.toFixed(6))}${to}`);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Select the result to copy it.");
    }
  }

  return (
    <div className={styles.quickConverter}>
      <div className={styles.quickHeader}>
        <span className={styles.quickIcon}><ToolIcon name="swap" /></span>
        <div><span className={styles.miniLabel}>A little less mental math</span><h2>{from.toUpperCase()} to {to.toUpperCase()} converter</h2></div>
        <span className={styles.liveBadge}><span /> Live</span>
      </div>
      <div className={styles.conversionFields}>
        <label className={styles.conversionInput}>
          <span>{reversed ? "REM" : "Pixels"}</span>
          <span className={styles.conversionValue}>
            <input id="quick-value" type="number" step="any" inputMode="decimal" value={value}
              aria-invalid={!validValue} aria-describedby="quick-conversion-note"
              onChange={(event) => { setValue(event.target.value); setCopyStatus(""); }} />
            <span>{from}</span>
          </span>
        </label>
        <button className={styles.swapButton} type="button" onClick={swapUnits} aria-label={`Switch to ${to.toUpperCase()} to ${from.toUpperCase()}`}>
          <ToolIcon name="swap" />
        </button>
        <div className={styles.conversionOutput}>
          <span>{reversed ? "Pixels" : "REM"}</span>
          <output className={styles.conversionValue} htmlFor="quick-value quick-root" aria-live="polite" aria-atomic="true">
            <strong>{formattedResult}</strong><span>{to}</span>
          </output>
        </div>
      </div>
      <div className={styles.rootSetting}>
        <label htmlFor="quick-root">Root font size</label>
        <span><input id="quick-root" type="number" inputMode="decimal" min="0.01" step="any" value={root}
          aria-invalid={!validRoot} aria-describedby="quick-conversion-note"
          onChange={(event) => { setRoot(event.target.value); setCopyStatus(""); }} /> px</span>
        <button type="button" onClick={copyResult} disabled={!validResult} className={styles.copyButton} aria-label={`Copy ${to.toUpperCase()} result`}>
          <ToolIcon name="copy" /> <span>Copy result</span>
        </button>
      </div>
      <p id="quick-conversion-note" className={styles.conversionNote}>
        {!validRoot ? "Enter a root font size greater than zero." : !validValue ? "Enter a number to convert." : !validResult ? "This value is too large. Try a smaller number." : `1 rem = ${formatConversionNumber(Number(root))} px. Results rounded to 6 decimals.`}
      </p>
      <span className={styles.copyStatus} role="status">{copyStatus}</span>
      <Link className={styles.quickFooter} href={`/${from}-to-${to}`} prefetch={false}>
        Full converter, formula &amp; examples <ToolIcon name="arrow" />
      </Link>
    </div>
  );
}
