"use client";

import { useState } from "react";
import styles from "@/components/developer-tools.module.css";

type CopyOutputButtonProps = {
  value: string;
  label?: string;
  disabled?: boolean;
};

export default function CopyOutputButton({
  value,
  label = "Copy result",
  disabled = false,
}: CopyOutputButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyValue() {
    if (!navigator.clipboard || disabled) {
      setState("failed");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <button
      type="button"
      className={styles.copyButton}
      onClick={copyValue}
      disabled={disabled}
    >
      {state === "copied"
        ? "Copied"
        : state === "failed"
          ? "Copy unavailable"
          : label}
    </button>
  );
}
