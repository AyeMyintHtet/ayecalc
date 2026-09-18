export type LoanInputs = {
  principal: number;
  annualRate: number;
  years: number;
};

/** Fixed-rate, end-of-month payments; fees, taxes and insurance are excluded. */
export function calculateLoanPayment({
  principal,
  annualRate,
  years,
}: LoanInputs) {
  if (!Number.isFinite(principal) || principal <= 0 || principal > 1e12) {
    throw new RangeError(
      "Enter a loan amount greater than 0 and no more than 1 trillion.",
    );
  }
  if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 100) {
    throw new RangeError("Enter an annual interest rate from 0% to 100%.");
  }
  const months = years * 12;
  if (
    !Number.isFinite(years) ||
    months < 1 ||
    years > 50 ||
    Math.abs(months - Math.round(months)) > 1e-8
  ) {
    throw new RangeError(
      "Enter a term from 1 month to 50 years, in whole months (for example, 0.5 years).",
    );
  }
  const payments = Math.round(months);
  const rate = annualRate / 1200;
  // log1p/expm1 preserve accuracy when a nonzero rate is close to zero.
  const monthlyPayment =
    rate === 0
      ? principal / payments
      : principal * (rate / -Math.expm1(-payments * Math.log1p(rate)));
  const totalPaid = monthlyPayment * payments;
  return {
    monthlyPayment,
    payments,
    totalPaid,
    totalInterest: Math.max(0, totalPaid - principal),
  };
}
