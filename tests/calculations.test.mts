import assert from "node:assert/strict";
import test from "node:test";
import { calculateLoanPayment } from "../lib/loan-math.ts";
import { convertValue, formatCodeNumber } from "../lib/conversion-math.ts";
import {
  calculateClamp,
  simplifyAspectRatio,
  convertPixelsToViewportUnits,
  convertCssUnitMatrix,
  calculateTailwindSpacing,
  calculateProportionalHeight,
} from "../lib/developer-math.ts";
import {
  parseCssColor,
  parseHexColor,
  contrastRatio,
  formatHexColor,
} from "../lib/color-utils.ts";

test("loan reference cases, zero interest, and near-zero stability", () => {
  const standard = calculateLoanPayment({
    principal: 250000,
    annualRate: 6.5,
    years: 30,
  });
  assert.ok(Math.abs(standard.monthlyPayment - 1580.1700587324) < 1e-8);
  assert.equal(
    calculateLoanPayment({ principal: 1200, annualRate: 0, years: 1 })
      .monthlyPayment,
    100,
  );
  assert.ok(
    Math.abs(
      calculateLoanPayment({ principal: 1200, annualRate: 1e-20, years: 1 })
        .monthlyPayment - 100,
    ) < 1e-9,
  );
  assert.equal(
    calculateLoanPayment({ principal: 1200, annualRate: 0, years: 0.5 })
      .payments,
    6,
  );
  assert.equal(standard.totalPaid, standard.monthlyPayment * 360);
});
test("invalid loan inputs never silently become defaults or zero payments", () => {
  for (const years of [0, -1, 51, NaN, Infinity, 0.01])
    assert.throws(
      () => calculateLoanPayment({ principal: 1000, annualRate: 5, years }),
      RangeError,
    );
  for (const annualRate of [-1, 101, NaN, Infinity])
    assert.throws(
      () => calculateLoanPayment({ principal: 1000, annualRate, years: 1 }),
      RangeError,
    );
  for (const principal of [0, -1, 1e13, NaN, Infinity])
    assert.throws(
      () => calculateLoanPayment({ principal, annualRate: 5, years: 1 }),
      RangeError,
    );
});
test("unit conversion reference cases and adjustable font sizes", () => {
  assert.equal(convertValue("inches", "cm", 1), 2.54);
  assert.equal(convertValue("lb", "kg", 1), 0.45359237);
  assert.equal(convertValue("px", "rem", 24, { rootFontSize: 12 }), 2);
  assert.equal(
    convertValue("rem", "em", 2, { rootFontSize: 16, elementFontSize: 20 }),
    1.6,
  );
  assert.equal(convertValue("kg", "lb", 0), 0);
  assert.ok(Number.isNaN(convertValue("unknown", "px", 1)));
});
test("CSS serialization has no thousands separators", () => {
  assert.equal(formatCodeNumber(12345.6789), "12345.6789");
  assert.equal(formatCodeNumber(-0), "0");
  assert.equal(formatCodeNumber(Infinity), "");
  const result = calculateClamp(320, 1280, 1000, 2000, 16);
  assert.equal(
    result.pixelValue,
    "clamp(1000px, 666.6667px + 104.1667vw, 2000px)",
  );
  const normal = calculateClamp(320, 1280, 16, 32, 16);
  assert.ok(Math.abs(normal.intercept + normal.slope * 3.2 - 16) < 1e-9);
  assert.ok(Math.abs(normal.intercept + normal.slope * 12.8 - 32) < 1e-9);
  assert.throws(() => calculateClamp(320, 320, 16, 32, 16), RangeError);
  assert.deepEqual(simplifyAspectRatio(1920, 1080), {
    width: 16,
    height: 9,
    decimal: 16 / 9,
  });
  assert.equal(convertPixelsToViewportUnits(144, 1440, 900).vw, 10);
});
test("CSS color formats and independent WCAG contrast reference cases", () => {
  for (const input of [
    "#f00",
    "rgb(255, 0, 0)",
    "rgb(100% 0% 0%)",
    "hsl(360 100% 50%)",
    "hsl(1turn,100%,50%)",
  ])
    assert.equal(formatHexColor(parseCssColor(input)!), "#FF0000");
  assert.equal(parseCssColor("rgba(255, 0, 0, 0.5)")?.alpha, 0.5);
  assert.equal(parseCssColor("hsl(120 100% 50% / 25%)")?.green, 255);
  for (const input of [
    "rgb(999 0 0)",
    "rgb(1,2,3,4,5)",
    "hsl(0 40 50)",
    "rgb(1 2)",
    "var(--color)",
    "rgb(1 2 3 / 2)",
  ])
    assert.equal(parseCssColor(input), null);
  assert.equal(
    contrastRatio(parseHexColor("#000")!, parseHexColor("#fff")!),
    21,
  );
  assert.equal(
    contrastRatio(parseHexColor("#fff")!, parseHexColor("#fff")!),
    1,
  );
});

test("derived overflow and unrepresentable ratios produce validation errors", () => {
  assert.throws(() => convertCssUnitMatrix(1e308, "rem", 16, 20), RangeError);
  assert.throws(() => calculateTailwindSpacing(1e308, 1, 16), RangeError);
  assert.throws(() => convertPixelsToViewportUnits(1e308, 1, 1), RangeError);
  assert.throws(() => simplifyAspectRatio(0.00001, 1080), RangeError);
  assert.throws(() => simplifyAspectRatio(1e308, 1080), RangeError);
  assert.throws(() => calculateProportionalHeight(1, 1e308, 1e308), RangeError);
  assert.deepEqual(convertCssUnitMatrix(2, "rem", 16, 20), {
    px: 32,
    rem: 2,
    em: 1.6,
  });
  assert.deepEqual(calculateTailwindSpacing(6, 0.25, 16), { rem: 1.5, px: 24 });
});
