"use client";

import { useState } from "react";
import styles from "@/components/image-tools.module.css";

export default function SavedToolSettings<T>({
  tool,
  value,
  validate,
  onRestore,
}: {
  tool: string;
  value: T;
  validate: (value: unknown) => value is T;
  onRestore: (value: T) => void;
}) {
  const [status, setStatus] = useState("");
  const key = `ayecalc:settings:v1:${tool}`;
  function action(kind: "save" | "restore" | "forget") {
    try {
      if (kind === "save") {
        if (!validate(value)) {
          setStatus("Use valid settings before saving.");
          return;
        }
        localStorage.setItem(key, JSON.stringify(value));
        setStatus("Settings saved on this device.");
      } else if (kind === "forget") {
        localStorage.removeItem(key);
        setStatus("Saved settings removed.");
      } else {
        const raw = localStorage.getItem(key);
        const saved: unknown = raw ? JSON.parse(raw) : null;
        if (!validate(saved)) {
          setStatus("No compatible saved settings found.");
          return;
        }
        onRestore(saved);
        setStatus("Saved settings restored.");
      }
    } catch {
      setStatus("Your browser could not access saved settings.");
    }
  }
  return (
    <div>
      <div
        className={styles.presetRow}
        aria-label="Settings saved on this device"
      >
        <button type="button" onClick={() => action("save")}>
          Save settings
        </button>
        <button type="button" onClick={() => action("restore")}>
          Restore settings
        </button>
        <button type="button" onClick={() => action("forget")}>
          Forget settings
        </button>
      </div>
      <p className={styles.privacyNote}>
        Saved only when you choose. Remembers settings on this device, never
        your images.
      </p>
      <p role="status">{status}</p>
    </div>
  );
}
