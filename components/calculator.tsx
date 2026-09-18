"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { calculateLoanPayment } from "@/lib/loan-math";
import styles from "@/components/calculator.module.css";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export default function Calculator({
  expanded = false,
}: {
  expanded?: boolean;
}) {
  const errorId = useId();
  const [amount, setAmount] = useState("250000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");

  const calculation = useMemo(() => {
    if (![amount, rate, years].every((value) => value.trim())) {
      return {
        result: null,
        error: "Enter a loan amount, annual rate, and term.",
      };
    }
    try {
      return {
        result: calculateLoanPayment({
          principal: Number(amount),
          annualRate: Number(rate),
          years: Number(years),
        }),
        error: "",
      };
    } catch (error) {
      return {
        result: null,
        error:
          error instanceof Error ? error.message : "Enter valid loan values.",
      };
    }
  }, [amount, rate, years]);

  return (
    <div className="calculator-card">
      <div className="calculator-head">
        <div>
          <span className="calculator-label">Popular calculator</span>
          <h2>Loan payment</h2>
        </div>
        <span className="calc-icon" aria-hidden="true">
          ↗
        </span>
      </div>

      <div className="field-grid">
        <label className="field field-wide">
          <span>Loan amount</span>
          <span className="input-shell">
            <b>$</b>
            <input
              type="number"
              min="0.01"
              max="1000000000000"
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-describedby={calculation.error ? errorId : undefined}
              aria-invalid={Boolean(calculation.error)}
              aria-label="Loan amount in dollars"
            />
          </span>
        </label>
        <label className="field">
          <span>Interest rate</span>
          <span className="input-shell">
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              aria-describedby={calculation.error ? errorId : undefined}
              aria-invalid={Boolean(calculation.error)}
              aria-label="Annual interest rate"
            />
            <b>%</b>
          </span>
        </label>
        <label className="field">
          <span>Loan term</span>
          <span className="input-shell">
            <input
              type="number"
              min="0.08333333333333333"
              max="50"
              step="any"
              value={years}
              onChange={(event) => setYears(event.target.value)}
              aria-describedby={calculation.error ? errorId : undefined}
              aria-invalid={Boolean(calculation.error)}
              aria-label="Loan term in years"
            />
            <b>years</b>
          </span>
        </label>
      </div>

      <p
        id={errorId}
        className={styles.error}
        role={calculation.error ? "alert" : undefined}
      >
        {calculation.error}
      </p>
      <div className="result-box" aria-live="polite" aria-atomic="true">
        <span>Estimated monthly payment</span>
        <strong>
          {calculation.result
            ? money.format(calculation.result.monthlyPayment)
            : "—"}
        </strong>
        <small>Principal &amp; interest only</small>
      </div>

      {expanded && calculation.result && (
        <dl className={styles.totals}>
          <div>
            <dt>Total interest</dt>
            <dd>{money.format(calculation.result.totalInterest)}</dd>
          </div>
          <div>
            <dt>Total paid</dt>
            <dd>{money.format(calculation.result.totalPaid)}</dd>
          </div>
          <div>
            <dt>Monthly payments</dt>
            <dd>{calculation.result.payments}</dd>
          </div>
        </dl>
      )}
      <Link
        className="full-calculator-link"
        href={expanded ? "#loan-method" : "/loan-calculator"}
      >
        {expanded ? "See calculation details" : "Open the loan calculator"}{" "}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
