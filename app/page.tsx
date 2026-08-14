import type { Metadata } from "next";
import Calculator from "@/components/calculator";

export const metadata: Metadata = {
  title: "Free Online Calculators for Everyday Decisions",
  description:
    "Use AyeCalc's free online calculators for loans, savings, percentages, BMI, dates, and everyday math. Fast results with no account required.",
  alternates: { canonical: "/" },
};

const categories = [
  {
    icon: "↗",
    title: "Finance",
    description: "Plan loans, savings, investments, and budgets.",
    tools: "18 calculators",
    accent: "mint",
  },
  {
    icon: "%",
    title: "Everyday Math",
    description: "Solve percentages, fractions, tips, and conversions.",
    tools: "24 calculators",
    accent: "yellow",
  },
  {
    icon: "♡",
    title: "Health",
    description: "Understand BMI, calories, hydration, and more.",
    tools: "12 calculators",
    accent: "coral",
  },
  {
    icon: "⌁",
    title: "Time & Date",
    description: "Calculate age, duration, workdays, and deadlines.",
    tools: "10 calculators",
    accent: "blue",
  },
];

const faqs = [
  {
    question: "Are AyeCalc calculators free to use?",
    answer:
      "Yes. Every AyeCalc calculator is free to use, with no account, subscription, or download required.",
  },
  {
    question: "Are my calculations saved?",
    answer:
      "No. Calculations happen in your browser and are not stored or connected to a personal profile.",
  },
  {
    question: "How accurate are the results?",
    answer:
      "AyeCalc uses established formulas and clearly shows assumptions. Results are estimates and should not replace professional financial or medical advice.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://ayecalc.com/#website",
      url: "https://ayecalc.com/",
      name: "AyeCalc",
      description: "Free online calculators for smarter everyday decisions.",
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      name: "AyeCalc Loan Calculator",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      url: "https://ayecalc.com/",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1240",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="site-header">
        <div className="container nav-wrap">
          <a className="brand" href="#top" aria-label="AyeCalc home">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>AyeCalc</span>
          </a>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#calculators">Calculators</a>
            <a href="#why-ayecalc">Why AyeCalc</a>
            <a href="#guides">Guides</a>
          </nav>

          <a className="nav-cta" href="#calculator">
            Try a calculator
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                Simple tools. Clear answers.
              </div>
              <h1 id="hero-title">
                Make numbers
                <br />
                <em>make sense.</em>
              </h1>
              <p className="hero-lead">
                Free, accurate calculators designed to make everyday decisions
                feel a little easier.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#calculators">
                  Explore calculators
                  <span aria-hidden="true">→</span>
                </a>
                <a className="text-link" href="#why-ayecalc">
                  Why people choose us
                </a>
              </div>
              <div className="trust-line" aria-label="AyeCalc benefits">
                <span>✓ No sign-up</span>
                <span>✓ Always free</span>
                <span>✓ Privacy-first</span>
              </div>
            </div>

            <div className="hero-calculator" id="calculator">
              <div className="card-float card-float-top" aria-hidden="true">
                <span>⌁</span>
                <div>
                  <strong>Instant results</strong>
                  <small>As you type</small>
                </div>
              </div>
              <Calculator />
              <div className="card-float card-float-bottom" aria-hidden="true">
                <span>✓</span>
                <div>
                  <strong>1,240,000+</strong>
                  <small>calculations this month</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="categories section" id="calculators" aria-labelledby="categories-title">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Find your calculator</span>
                <h2 id="categories-title">A useful tool for every number</h2>
              </div>
              <p>
                From quick everyday math to bigger life decisions, get a clear
                answer without the clutter.
              </p>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <a className="category-card" href="#calculator" key={category.title}>
                  <span className={`category-icon ${category.accent}`} aria-hidden="true">
                    {category.icon}
                  </span>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <span className="category-meta">
                    {category.tools}
                    <b aria-hidden="true">→</b>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="why section" id="why-ayecalc" aria-labelledby="why-title">
          <div className="container why-grid">
            <div className="why-visual" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="visual-center">
                <span className="visual-check">✓</span>
                <strong>Clear by design</strong>
                <small>No jargon. No hidden steps.</small>
              </div>
              <span className="visual-chip chip-one">98%</span>
              <span className="visual-chip chip-two">$2.4k</span>
              <span className="visual-chip chip-three">42 days</span>
            </div>

            <div className="why-copy">
              <span className="kicker light">Why AyeCalc</span>
              <h2 id="why-title">Confidence in every calculation.</h2>
              <p>
                Numbers should help you decide, not leave you second-guessing.
                Every tool is built to be understandable, dependable, and kind
                to your privacy.
              </p>
              <ul className="feature-list">
                <li>
                  <span>01</span>
                  <div>
                    <strong>Built for clarity</strong>
                    <p>Plain language, helpful context, and results you can act on.</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>Formulas you can trust</strong>
                    <p>Carefully tested calculations with assumptions made visible.</p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>Your numbers stay yours</strong>
                    <p>No accounts and no personal calculation history stored.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="guides section" id="guides" aria-labelledby="guides-title">
          <div className="container narrow">
            <div className="center-heading">
              <span className="kicker">Good to know</span>
              <h2 id="guides-title">Answers before you calculate</h2>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>
                    {faq.question}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="closing-cta" aria-label="Start calculating">
          <div className="container closing-inner">
            <div>
              <span className="kicker light">Ready when you are</span>
              <h2>One less thing to overthink.</h2>
            </div>
            <a className="button button-light" href="#calculator">
              Start calculating <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-grid">
          <div>
            <a className="brand footer-brand" href="#top" aria-label="AyeCalc home">
              <span className="brand-mark" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span>AyeCalc</span>
            </a>
            <p>Numbers, made human.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#calculators">Calculators</a>
            <a href="#why-ayecalc">About</a>
            <a href="#guides">FAQs</a>
          </nav>
          <p className="copyright">© {new Date().getFullYear()} AyeCalc. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
