import Link from "next/link";
import Calculator from "@/components/calculator";
import { ContentPage } from "@/components/content-chrome";
import { createPageMetadata, siteConfig } from "@/lib/metadata";
import styles from "@/app/content.module.css";

const description =
  "Calculate a fixed-rate loan's monthly payment, total interest, and total paid. Adjust the amount, annual interest rate, and term with clear assumptions.";
export const metadata = createPageMetadata({
  title: "Loan Payment Calculator — Monthly Payment & Interest",
  description,
  path: "/loan-calculator",
});
const url = `${siteConfig.url}/loan-calculator`;
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "Loan Payment Calculator",
      description,
      dateModified: "2026-09-18",
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      mainEntity: { "@id": `${url}#application` },
    },
    {
      "@type": "WebApplication",
      "@id": `${url}#application`,
      url,
      name: "Loan Payment Calculator",
      description,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      browserRequirements: "JavaScript enabled",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Loan calculator",
          item: url,
        },
      ],
    },
  ],
};

export default function LoanCalculatorPage() {
  return (
    <ContentPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className={styles.hero}>
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Loan calculator</span>
          </nav>
          <span className={styles.eyebrow}>Plan with clear assumptions</span>
          <h1>Loan payment calculator</h1>
          <p className={styles.heroLead}>
            Estimate the monthly principal-and-interest payment for a fixed-rate
            loan. Compare different amounts, annual interest rates, and terms,
            then see how much interest you would pay overall. Amounts are
            displayed in US dollars.
          </p>
          <Calculator expanded />
        </div>
      </section>
      <section className={styles.section} id="loan-method">
        <div className={styles.container}>
          <h2>How monthly loan payments are calculated</h2>
          <p>
            For equal monthly payments made at the end of each month, use{" "}
            <code>
              M = P × r ÷ (1 − (1 + r)<sup>−n</sup>)
            </code>
            .
          </p>
          <ul>
            <li>
              <strong>P:</strong> loan principal.
            </li>
            <li>
              <strong>r:</strong> annual interest rate as a percentage, divided
              by 1,200.
            </li>
            <li>
              <strong>n:</strong> the number of monthly payments, equal to the
              term in years multiplied by 12.
            </li>
          </ul>
          <p>
            At 0% interest, the monthly payment is simply P ÷ n. The calculator
            supports whole-month terms from one month to 50 years, annual rates
            from 0% to 100%, and principal amounts greater than zero up to $1
            trillion. A half-year term can be entered as 0.5.
          </p>
          <h2>Worked example: $250,000 at 6.5% for 30 years</h2>
          <p>
            The estimated monthly payment is $1,580.17 over 360 payments. Using
            the unrounded payment, total payments are approximately $568,861.22
            and total interest is approximately $318,861.22. Displayed amounts
            are rounded to cents; an actual lender may round each payment and
            adjust the final one.
          </p>
          <h2>What the estimate includes</h2>
          <p>
            This model includes principal and interest only. It assumes one
            fixed rate, a fully amortizing balance, and monthly repayments. It
            excludes taxes, insurance, origination fees, other charges, extra
            repayments, and changing rates. Enter the interest rate rather than
            an APR that includes fees.
          </p>
          <p>
            Use this estimate for comparison. Actual lender schedules and costs
            may differ. Review the lender’s disclosures before making a
            borrowing decision.
          </p>
          <p>
            For background on the distinction, the{" "}
            <a href="https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-mortgage-interest-rate-and-an-apr-en-135/">
              US Consumer Financial Protection Bureau explains interest rates
              and APR
            </a>
            . Loan disclosures and calculation conventions vary by country and
            lender.
          </p>
          <h2>Common questions</h2>
          <details>
            <summary>
              Why does a longer term usually cost more interest?
            </summary>
            <p>
              At the same positive interest rate, a longer term spreads
              repayment across more months. It usually lowers the monthly
              payment while increasing total interest.
            </p>
          </details>
          <details>
            <summary>Can I use this for a mortgage or car loan?</summary>
            <p>
              It can estimate principal and interest for a fixed-rate loan with
              equal monthly payments. A mortgage payment may also include taxes,
              insurance, and other charges that are excluded here. Some loans
              use different interest or repayment rules.
            </p>
          </details>
          <details>
            <summary>Are my loan inputs saved?</summary>
            <p>
              No. Values remain in browser memory while this page is open. This
              calculator does not store a loan history or send your entries to a
              calculation server.
            </p>
          </details>
          <p>
            Method reviewed September 18, 2026.{" "}
            <Link href="/methodology">Read AyeCalc’s methodology</Link> ·{" "}
            <Link href="/disclaimer">Disclaimer</Link> ·{" "}
            <Link href="/unit-converters">Unit converters</Link>
          </p>
        </div>
      </section>
    </ContentPage>
  );
}
