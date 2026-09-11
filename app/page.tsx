import Calculator from "@/components/calculator";
import ScrollToTop from "@/components/scroll-to-top";
import SiteHeader from "@/components/site-header";
import { converterDefinitions } from "@/lib/converters";
import { developerTools } from "@/lib/developer-tools";
import { guides } from "@/lib/guides";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Free Online Calculators, Converters & Image Tools",
  description:
    "Use AyeCalc's free calculators, unit converters, private AI image scanner, browser image tools, CSS generators, and practical guides.",
  path: "/",
  keywords: [
    "online calculator",
    "free calculator",
    "online tools",
    "unit converter",
    "financial calculator",
    "developer tools",
    "image tools",
    "AI image scanner",
    "image resizer",
    "image compressor",
    "image cropper",
    "image converter",
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
    title: "Calculators",
    description: "Work through everyday numbers with clear inputs and visible assumptions.",
    tools: "Try calculator",
    href: "#calculator",
    accent: "mint",
  },
  {
    icon: "↔",
    title: "Unit Converters",
    description: "Convert common measurements and CSS units with dependable factors.",
    tools: "Browse converters",
    href: "/unit-converters",
    accent: "yellow",
  },
  {
    icon: "⌁",
    title: "Image Tools",
    description: "Inspect, resize, compress, crop, convert, and watermark images in your browser.",
    tools: "Explore image tools",
    href: "/developer-tools",
    accent: "coral",
  },
  {
    icon: "⌘",
    title: "Developer & CSS",
    description: "Generate CSS, check accessibility, and solve common front-end tasks.",
    tools: "Explore developer tools",
    href: "/developer-tools",
    accent: "blue",
  },
];

const popularQueryDestinations = [
  {
    label: "Loan payment calculator",
    aliases: "Monthly payment estimate",
    href: "#calculator",
  },
  {
    label: "AI image scanner",
    aliases: "Check if an image may be AI-generated",
    href: "/ai-image-scanner",
  },
  {
    label: "Image compressor",
    aliases: "Reduce image file size in your browser",
    href: "/image-compressor",
  },
  {
    label: "Content Credentials inspector",
    aliases: "Check C2PA credentials and image metadata",
    href: "/content-credentials-inspector",
  },
  {
    label: "PX to REM",
    aliases: "Pixels to REM converter",
    href: "/px-to-rem",
  },
  {
    label: "Pounds to kilograms",
    aliases: "LB to KG converter",
    href: "/lb-to-kg",
  },
];

const faqs = [
  {
    question: "Are all AyeCalc tools free to use?",
    answer:
      "Yes. AyeCalc calculators, converters, image utilities, developer tools, and guides are free to use without an account or subscription.",
  },
  {
    question: "Do my files or inputs leave my device?",
    answer:
      "AyeCalc is browser-first. Calculations and supported image processing happen locally and are not connected to a personal profile. Each tool explains any network requirement it may have.",
  },
  {
    question: "How should I use the results?",
    answer:
      "AyeCalc shows formulas, assumptions, settings, and limitations where they matter. Calculations are estimates, and image analysis provides evidence rather than absolute certainty.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.ayecalc.com/#website",
      url: "https://www.ayecalc.com/",
      name: "AyeCalc",
      alternateName: "ayecalc.com",
      description:
        "Free online calculators, unit converters, browser image utilities, developer and CSS tools, and practical guides.",
      inLanguage: "en-US",
      dateModified: "2026-09-11",
    },
    {
      "@type": "WebApplication",
      "@id": "https://www.ayecalc.com/#loan-calculator",
      url: "https://www.ayecalc.com/#calculator",
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
      dateModified: "2026-08-18",
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

      <SiteHeader />

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                Calculators, converters, image tools &amp; more
              </div>
              <h1 id="hero-title">
                Everyday tools
                <br />
                <em>made simple.</em>
              </h1>
              <p className="hero-lead">
                Calculate, convert units, inspect or edit images, generate CSS,
                and learn with practical guides—all in one clear, browser-friendly place.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#tools">
                  Explore all tools
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

        <section className="popular-searches" id="tools" aria-labelledby="popular-searches-title">
          <div className="container popular-searches-inner">
            <div className="popular-searches-heading">
              <span className="kicker">Popular searches</span>
              <h2 id="popular-searches-title">Find a tool for the task at hand</h2>
            </div>
            <nav className="popular-search-grid" aria-label="Popular tools and guides">
              {popularQueryDestinations.map((destination) => (
                <a href={destination.href} key={destination.href}>
                  <strong>{destination.label}</strong>
                  <span>{destination.aliases}</span>
                  <b aria-hidden="true">↗</b>
                </a>
              ))}
            </nav>
          </div>
        </section>

        <section className="categories section" id="tool-categories" aria-labelledby="categories-title">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Explore by category</span>
                <h2 id="categories-title">What can you do with AyeCalc?</h2>
              </div>
              <p>
                Calculate, convert, inspect, create, and learn with focused tools
                that explain their results without unnecessary clutter.
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
                <h2 id="converters-title">Convert common units with confidence</h2>
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
                <h2 id="developer-tools-title">Browser tools for images, code, and the web</h2>
              </div>
              <p>
                Scan for AI-image patterns, shape CSS corners, generate fluid
                values, compare units, and process images with clear privacy
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
                <strong>Useful by design</strong>
                <small>Clear guidance. No hidden steps.</small>
              </div>
              <span className="visual-chip chip-one">Clear</span>
              <span className="visual-chip chip-two">Fast</span>
              <span className="visual-chip chip-three">Private</span>
            </div>

            <div className="why-copy">
              <span className="kicker light">Why AyeCalc</span>
              <h2 id="why-title">Clear tools. Useful results. Better privacy.</h2>
              <p>
                From a quick conversion to image inspection and CSS generation,
                every AyeCalc tool is built to be understandable, dependable,
                and respectful of your privacy.
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
                    <strong>Methods you can inspect</strong>
                    <p>Formulas, settings, evidence, and limitations are made visible.</p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>Your work stays yours</strong>
                    <p>No accounts, with supported calculations and image tasks handled locally.</p>
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
                <h2 id="home-guides-title">Learn how the tools and methods work</h2>
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
              <h2 id="guides-title">Helpful answers before you begin</h2>
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

        <section className="closing-cta" aria-label="Explore AyeCalc tools">
          <div className="container closing-inner">
            <div>
              <span className="kicker light">Ready when you are</span>
              <h2>Your next useful tool is ready.</h2>
            </div>
            <a className="button button-light" href="#tools">
              Explore all tools <span aria-hidden="true">→</span>
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
      <ScrollToTop />
    </>
  );
}
