"use client";

import { useMemo, useState } from "react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Calculator() {
  const [amount, setAmount] = useState(250000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  const monthly = useMemo(() => {
    const principal = Math.max(0, amount || 0);
    const payments = Math.max(1, (years || 1) * 12);
    const monthlyRate = Math.max(0, rate || 0) / 100 / 12;

    if (monthlyRate === 0) return principal / payments;

    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, payments)) /
      (Math.pow(1 + monthlyRate, payments) - 1)
    );
  }, [amount, rate, years]);

  return (
    <div className="calculator-card">
      <div className="calculator-head">
        <div>
          <span className="calculator-label">Popular calculator</span>
          <h2>Loan payment</h2>
        </div>
        <span className="calc-icon" aria-hidden="true">↗</span>
      </div>

      <div className="field-grid">
        <label className="field field-wide">
          <span>Loan amount</span>
          <span className="input-shell">
            <b>$</b>
            <input
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
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
              step="0.1"
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
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
              min="1"
              max="50"
              value={years}
              onChange={(event) => setYears(Number(event.target.value))}
              aria-label="Loan term in years"
            />
            <b>years</b>
          </span>
        </label>
      </div>

      <div className="result-box" aria-live="polite">
        <span>Estimated monthly payment</span>
        <strong>{money.format(Number.isFinite(monthly) ? monthly : 0)}</strong>
        <small>Principal &amp; interest only</small>
      </div>

      <a className="full-calculator-link" href="#guides">
        See calculation details <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
