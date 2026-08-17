"use client";

import { useState } from "react";
import styles from "@/components/tool-page.module.css";

type CopyCodeProps = {
  label: string;
  code: string;
};

export default function CopyCode({ label, code }: CopyCodeProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  async function copyCode() {
    if (!navigator.clipboard) {
      setCopyState("failed");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className={styles.snippetCard}>
      <div className={styles.snippetHeading}>
        <span>{label}</span>
        <button type="button" onClick={copyCode}>
          {copyState === "copied"
            ? "Copied"
            : copyState === "failed"
              ? "Copy unavailable"
              : "Copy code"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
