import Calculator from "@/components/calculator";
import { converterDefinitions } from "@/lib/converters";
import { developerTools } from "@/lib/developer-tools";
import { guides } from "@/lib/guides";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Free Online Calculators & Tools for Everyday Decisions",
  description:
    "Use AyeCalc's free loan calculator, unit converters, CSS developer tools, and practical guides with clear browser-based results.",
  path: "/",
  keywords: [
    "online calculator",
    "free calculator",
    "online tools",
    "unit converter",
    "financial calculator",
    "developer tools",
    "loan payment calculator",
    "monthly loan calculator",
    "loan repayment calculator",
    "mortgage payment calculator",
    "personal loan calculator",
    "principal and interest calculator",
  ],
});

const categories = [
  {
    icon: "↗",
    title: "Finance",
    description: "Estimate a monthly loan payment with visible assumptions.",
    tools: "Try calculator",
    href: "#calculator",
    accent: "mint",
  },
  {
    icon: "⌘",
    title: "Developer Units",
    description: "Move between PX, REM, and EM for CSS workflows.",
    tools: "Browse converters",
    href: "/developer-tools",
    accent: "yellow",
  },
  {
    icon: "↔",
    title: "Weight",
    description: "Convert pounds and kilograms with an exact factor.",
    tools: "Browse converters",
    href: "/unit-converters",
    accent: "coral",
  },
  {
    icon: "⌁",
    title: "Length",
    description: "Convert centimeters and inches for everyday measurements.",
    tools: "Browse converters",
    href: "/unit-converters",
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
      "@type": "WebApplication",
      "@id": "https://ayecalc.com/#loan-calculator",
      url: "https://ayecalc.com/#calculator",
      name: "Loan Payment Calculator",
      alternateName: [
        "Monthly Loan Calculator",
        "Loan Repayment Calculator",
        "Mortgage Payment Calculator",
        "Personal Loan Calculator",
        "Principal and Interest Calculator",
      ],
      description:
        "Estimate a monthly principal-and-interest payment from a loan amount, annual interest rate, and loan term.",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      browserRequirements: "JavaScript enabled for live calculations",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
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
            <a href="/developer-tools">Developer tools</a>
            <a href="/unit-converters">Converters</a>
            <a href="/guides">Guides</a>
          </nav>

          <a className="nav-cta" href="/developer-tools">
            Explore tools
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
                <a className="button button-primary" href="/developer-tools">
                  Explore developer tools
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
                  <strong>Private by default</strong>
                  <small>browser-based calculations</small>
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
                <a className="category-card" href={category.href} key={category.title}>
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

        <section
          className="converter-directory section"
          id="converters"
          aria-labelledby="converters-title"
        >
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Instant converters</span>
                <h2 id="converters-title">Move between units without the guesswork</h2>
              </div>
              <p>
                Fast browser-based conversions with visible formulas, adjustable
                assumptions, examples, and reference tables.
              </p>
            </div>

            <div className="converter-directory-grid">
              {converterDefinitions.map((converter) => (
                <a
                  className="converter-directory-card"
                  href={`/${converter.slug}`}
                  key={converter.slug}
                >
                  <span className="converter-card-category">{converter.category}</span>
                  <strong>
                    {converter.fromSymbol}
                    <span aria-hidden="true">→</span>
                    {converter.toSymbol}
                  </strong>
                  <h3>{converter.title}</h3>
                  <span className="converter-card-action">
                    Open converter <b aria-hidden="true">↗</b>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="resource-directory section" aria-labelledby="developer-tools-title">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Browser toolbox</span>
                <h2 id="developer-tools-title">Useful tools for real workflows</h2>
              </div>
              <p>
                Remove image backgrounds, generate fluid values, compare units,
                translate spacing, and check visual decisions with clear privacy
                and method notes.
              </p>
            </div>

            <div className="resource-grid">
              {developerTools.map((tool) => (
                <a className="resource-card" href={`/${tool.slug}`} key={tool.slug}>
                  <span>{tool.category}</span>
                  <h3>{tool.shortTitle}</h3>
                  <p>{tool.description}</p>
                  <small>Open tool ↗</small>
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
              <span className="visual-chip chip-one">Clear</span>
              <span className="visual-chip chip-two">Fast</span>
              <span className="visual-chip chip-three">Private</span>
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

        <section className="resource-directory resource-guides section" aria-labelledby="home-guides-title">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Practical guides</span>
                <h2 id="home-guides-title">Understand the method behind the value</h2>
              </div>
              <p>
                Learn how relative units, design handoff, framework spacing, and
                fluid typography behave before choosing a production value.
              </p>
            </div>
            <div className="resource-grid">
              {guides.slice(0, 3).map((guide) => (
                <a className="resource-card" href={`/guides/${guide.slug}`} key={guide.slug}>
                  <span>{guide.category}</span>
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                  <small>Read guide ↗</small>
                </a>
              ))}
            </div>
            <a className="directory-link" href="/guides">
              View all guides <span aria-hidden="true">→</span>
            </a>
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
            <a href="/developer-tools">Developer tools</a>
            <a href="/unit-converters">Converters</a>
            <a href="/guides">Guides</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </nav>
          <p className="copyright">© {new Date().getFullYear()} AyeCalc. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
