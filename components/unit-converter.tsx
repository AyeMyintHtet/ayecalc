"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  convertValue,
  formatConversionNumber,
  type ConversionContext,
} from "@/lib/conversion-math";
import type { ContextField } from "@/lib/converters";
import styles from "@/app/[conversion]/converter.module.css";

type UnitConverterProps = {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  fromSymbol: string;
  toSymbol: string;
  defaultValue: number;
  inputStep: number;
  allowNegative: boolean;
  contextFields: ContextField[];
  reverseHref?: string;
};

function createInitialContext(fields: ContextField[]) {
  return Object.fromEntries(
    fields.map((field) => [field.key, String(field.defaultValue)]),
  );
}

export default function UnitConverter({
  from,
  to,
  fromName,
  toName,
  fromSymbol,
  toSymbol,
  defaultValue,
  inputStep,
  allowNegative,
  contextFields,
  reverseHref,
}: UnitConverterProps) {
  const [inputValue, setInputValue] = useState(String(defaultValue));
  const [contextValues, setContextValues] = useState<Record<string, string>>(
    () => createInitialContext(contextFields),
  );
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const calculation = useMemo(() => {
    const trimmedValue = inputValue.trim();
    const numericValue = Number(trimmedValue);

    if (!trimmedValue) {
      return {
        error: `Enter a value in ${fromName}.`,
        invalidField: "input",
        result: null,
      };
    }

    if (!Number.isFinite(numericValue)) {
      return {
        error: "Enter a valid finite number.",
        invalidField: "input",
        result: null,
      };
    }

    if (!allowNegative && numericValue < 0) {
      return {
        error: `${fromName} cannot be negative.`,
        invalidField: "input",
        result: null,
      };
    }

    const context: ConversionContext = {};

    for (const field of contextFields) {
      const rawContext = contextValues[field.key]?.trim() ?? "";
      const numericContext = Number(rawContext);

      if (!rawContext || !Number.isFinite(numericContext) || numericContext < field.min) {
        return {
          error: `${field.label} must be at least ${field.min}${field.unit}.`,
          invalidField: field.key,
          result: null,
        };
      }

      context[field.key] = numericContext;
    }

    const result = convertValue(from, to, numericValue, context);

    if (!Number.isFinite(result)) {
      return {
        error: "This value could not be converted.",
        invalidField: "input",
        result: null,
      };
    }

    return { error: "", invalidField: "", result };
  }, [
    allowNegative,
    contextFields,
    contextValues,
    from,
    fromName,
    inputValue,
    to,
  ]);

  const resultText =
    calculation.result === null
      ? "—"
      : formatConversionNumber(calculation.result);

  const equation =
    calculation.result === null
      ? ""
      : `${formatConversionNumber(Number(inputValue))} ${fromSymbol} = ${resultText} ${toSymbol}`;

  async function copyResult() {
    if (!equation || !navigator.clipboard) {
      setCopyState("failed");
      return;
    }

    try {
      await navigator.clipboard.writeText(equation);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  function updateInput(value: string) {
    setInputValue(value);
    setCopyState("idle");
  }

  function updateContext(key: ContextField["key"], value: string) {
    setContextValues((current) => ({ ...current, [key]: value }));
    setCopyState("idle");
  }

  return (
    <div className={styles.calculator}>
      <div className={styles.calculatorHeading}>
        <div>
          <span className={styles.calculatorEyebrow}>Instant conversion</span>
          <h2>
            {fromSymbol} <span aria-hidden="true">→</span> {toSymbol}
          </h2>
        </div>
        <span className={styles.localBadge}>Runs in your browser</span>
      </div>

      <div className={styles.inputGrid}>
        <label className={styles.converterField}>
          <span>{fromName}</span>
          <span className={styles.inputControl}>
            <input
              type="number"
              inputMode="decimal"
              step={inputStep}
              min={allowNegative ? undefined : 0}
              value={inputValue}
              onChange={(event) => updateInput(event.target.value)}
              aria-invalid={calculation.invalidField === "input"}
              aria-describedby={`${from}-to-${to}-message`}
            />
            <b>{fromSymbol}</b>
          </span>
        </label>

        <div className={styles.equals} aria-hidden="true">
          =
        </div>

        <div className={styles.resultPanel} aria-live="polite" aria-atomic="true">
          <span>{toName}</span>
          <strong>{resultText}</strong>
          <b>{toSymbol}</b>
        </div>
      </div>

      {contextFields.length > 0 && (
        <div className={styles.contextGrid}>
          {contextFields.map((field) => {
            const helpId = `${from}-to-${to}-${field.key}-help`;

            return (
              <label className={styles.contextField} key={field.key}>
                <span>{field.label}</span>
                <span className={styles.contextControl}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={field.min}
                    step={field.step}
                    value={contextValues[field.key] ?? ""}
                    onChange={(event) => updateContext(field.key, event.target.value)}
                    aria-invalid={calculation.invalidField === field.key}
                    aria-describedby={helpId}
                  />
                  <b>{field.unit}</b>
                </span>
                <small id={helpId}>{field.help}</small>
              </label>
            );
          })}
        </div>
      )}

      <div className={styles.calculatorFooter}>
        <p
          id={`${from}-to-${to}-message`}
          className={calculation.error ? styles.errorMessage : styles.precisionNote}
          role={calculation.error ? "alert" : undefined}
        >
          {calculation.error || "Result rounded to a maximum of six decimal places."}
        </p>
        <div className={styles.calculatorActions}>
          {reverseHref && (
            <Link href={reverseHref} className={styles.reverseLink}>
              Reverse converter
            </Link>
          )}
          <button
            type="button"
            className={styles.copyButton}
            onClick={copyResult}
            disabled={!equation}
          >
            {copyState === "copied"
              ? "Copied"
              : copyState === "failed"
                ? "Copy unavailable"
                : "Copy result"}
          </button>
        </div>
      </div>
    </div>
  );
}
