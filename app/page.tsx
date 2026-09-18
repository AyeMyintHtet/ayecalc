import Link from "next/link";
import Calculator from "@/components/calculator";
import HomeQuickConverter from "@/components/home-quick-converter";
import HomeToolDirectory, {
  type HomeTool,
} from "@/components/home-tool-directory";
import SiteHeader from "@/components/site-header";
import ToolIcon, { type ToolIconName } from "@/components/tool-icon";
import { converterDefinitions } from "@/lib/converters";
import { developerTools } from "@/lib/developer-tools";
import { guides } from "@/lib/guides";
import { createPageMetadata, siteConfig } from "@/lib/metadata";
import styles from "./home.module.css";

const description =
  "Free online calculators, unit converters, image tools, and CSS utilities. Find your tool, get clear results, and keep going. No account needed.";

export const metadata = createPageMetadata({
  title: "Free Online Calculators, Converters & Image Tools",
  description,
  path: "/",
});

const toolPresentation: Record<
  string,
  { description: string; icon: ToolIconName }
> = {
  "ai-image-upscaler": {
    description: "Enhance a small photo with private 2× AI upscaling.",
    icon: "spark",
  },
  "image-compressor": {
    description: "Smaller image files. More room for what matters.",
    icon: "image",
  },
  "background-remover": {
    description: "Remove an image background right in your browser.",
    icon: "spark",
  },
  "css-clamp-generator": {
    description: "Make your typography scale smoothly across screens.",
    icon: "code",
  },
  "ai-image-scanner": {
    description: "Explore signs that an image may be AI-generated.",
    icon: "scan",
  },
  "contrast-checker": {
    description: "Check text and background colors for readability.",
    icon: "color",
  },
  "image-resizer": {
    description: "Give your images the dimensions they need.",
    icon: "crop",
  },
  "image-cropper": {
    description: "Find the right frame with precise image cropping.",
    icon: "crop",
  },
  "color-converter": {
    description: "Move between HEX, RGB, and HSL color formats.",
    icon: "color",
  },
  "tailwind-grid-guide": {
    description: "Build a responsive grid and copy the Tailwind classes.",
    icon: "grid",
  },
  "content-credentials-inspector": {
    description: "Inspect image provenance, C2PA credentials, and metadata.",
    icon: "shield",
  },
};

const featuredHrefs = [
  "/ai-image-upscaler",
  "/image-compressor",
  "/px-to-rem",
  "/background-remover",
  "/css-clamp-generator",
  "/ai-image-scanner",
  "/contrast-checker",
  "/lb-to-kg",
  "/image-resizer",
  "/loan-calculator",
];

const allTools: HomeTool[] = [
  ...developerTools.map((tool): HomeTool => ({
    href: `/${tool.slug}`,
    title: tool.shortTitle,
    description: toolPresentation[tool.slug]?.description ?? tool.description,
    category: tool.category === "Image tools" ? "Images" : "Developer",
    icon:
      toolPresentation[tool.slug]?.icon ??
      (tool.category === "Image tools" ? "image" : "code"),
    keywords: `${tool.category} ${tool.searchTerms?.join(" ") ?? ""}`,
  })),
  ...converterDefinitions.map((converter): HomeTool => ({
    href: `/${converter.slug}`,
    title: converter.title,
    description:
      converter.slug === "px-to-rem"
        ? "Turn pixels into relative units, without the mental math."
        : converter.slug === "lb-to-kg"
          ? "Convert pounds to kilograms with a clear, exact factor."
          : `Convert ${converter.fromName.toLowerCase()} to ${converter.toName.toLowerCase()} with formulas and examples.`,
    category: "Converters",
    icon: converter.category === "Length" ? "ruler" : "swap",
    keywords: `${converter.category} ${converter.fromSymbol} ${converter.toSymbol} ${converter.searchTerms?.join(" ") ?? ""}`,
  })),
  {
    href: "/loan-calculator",
    title: "Loan Payment Calculator",
    description: "Get a monthly payment estimate with clear assumptions.",
    category: "Calculators",
    icon: "calculator",
    keywords: "loan mortgage finance principal interest monthly repayment",
  } satisfies HomeTool,
].map((tool) => ({ ...tool, featured: featuredHrefs.includes(tool.href) }));

const tools = [
  ...featuredHrefs.flatMap((href) =>
    allTools.filter((tool) => tool.href === href),
  ),
  ...allTools.filter((tool) => !tool.featured),
];

const faqs = [
  {
    question: "Is AyeCalc really free?",
    answer:
      "Yes. All calculators, converters, image tools, developer utilities, and guides are free to use. You do not need an account or subscription.",
  },
  {
    question: "What happens to my files and inputs?",
    answer:
      "Calculations and supported image processing happen in your browser. Some tools download a processing library or AI model before running locally. Each tool explains its network requirements and limitations, and our privacy policy describes how the site handles data.",
  },
  {
    question: "Can I use these tools on my phone?",
    answer:
      "Yes. The tools are designed for phones, tablets, and desktop browsers. Some image and AI tasks need a recent browser and enough device memory; individual tool pages explain any requirements.",
  },
  {
    question: "How do I know what a result means?",
    answer:
      "Tool pages explain their formulas, settings, examples, and limitations. Loan payments are estimates, and image analysis provides evidence rather than certainty. Check the method and assumptions before relying on a result.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: `${siteConfig.url}/`,
      name: "AyeCalc",
      alternateName: "ayecalc.com",
      description,
      inLanguage: "en-US",
    },
    {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/#webpage`,
      url: `${siteConfig.url}/`,
      name: "Free Online Calculators, Converters & Image Tools",
      description,
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      inLanguage: "en-US",
      dateModified: "2026-09-18",
      mentions: { "@id": `${siteConfig.url}/loan-calculator#application` },
    },
    {
      "@type": "WebApplication",
      "@id": `${siteConfig.url}/loan-calculator#application`,
      url: `${siteConfig.url}/loan-calculator`,
      name: "Loan Payment Calculator",
      description:
        "Estimate a monthly principal-and-interest payment from a loan amount, annual interest rate, and loan term.",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      browserRequirements: "JavaScript enabled for live calculations",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function Home() {
  return (
    <div className={styles.home} id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <SiteHeader appearance="light" />
      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                <span className={styles.statusDot} /> A little help for your
                everyday
              </span>
              <h1 id="hero-title">
                Your everyday
                <br />
                tools, <span>simplified.</span>
              </h1>
              <p>
                Convert a value. Perfect an image. Figure things out. Free
                calculators, converters, and web tools that help you get on with
                your day.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#tools">
                  Find your tool <ToolIcon name="arrow" />
                </a>
                <Link className={styles.secondaryLink} href="/guides">
                  Explore the guides <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <div className={styles.heroBenefits}>
                <span>
                  <ToolIcon name="check" /> Free to use
                </span>
                <span>
                  <ToolIcon name="check" /> No sign-up
                </span>
                <span>
                  <ToolIcon name="check" /> Works in your browser
                </span>
              </div>
            </div>
            <div className={styles.heroWorkspace}>
              <div className={styles.workspaceCaption}>
                <span>
                  <ToolIcon name="spark" /> Little tools. Big help.
                </span>
                <span>TRY ONE NOW ↓</span>
              </div>
              <HomeQuickConverter />
              <div className={styles.miniTools}>
                <Link
                  href="/image-compressor"
                  prefetch={false}
                  className={styles.miniImageTool}
                >
                  <span className={styles.miniArtwork} aria-hidden="true">
                    <span />
                    <span />
                    <ToolIcon name="image" />
                  </span>
                  <span>
                    <strong>
                      Less size.
                      <br />
                      More possibility.
                    </strong>
                    <small>
                      Image compressor <span aria-hidden="true">↗</span>
                    </small>
                  </span>
                </Link>
                <Link
                  href="/css-clamp-generator"
                  prefetch={false}
                  className={styles.miniCodeTool}
                >
                  <span className={styles.codeArtwork} aria-hidden="true">
                    Aa<span>↗</span>
                  </span>
                  <span>
                    <strong>
                      Type that
                      <br />
                      finds its flow.
                    </strong>
                    <small>
                      CSS clamp generator <span aria-hidden="true">↗</span>
                    </small>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.utilityStrip}>
          <div className={styles.container}>
            <span>
              <strong>{tools.length}</strong> useful tools, one happy tab.
            </span>
            <nav aria-label="Explore tool collections">
              <a href="#tools">
                <ToolIcon name="swap" /> Convert
              </a>
              <Link href="/image-tools">
                <ToolIcon name="image" /> Create
              </Link>
              <Link href="/loan-calculator">
                <ToolIcon name="calculator" /> Calculate
              </Link>
              <Link href="/guides">
                <ToolIcon name="code" /> Learn
              </Link>
            </nav>
          </div>
        </div>

        <div className={styles.container}>
          <HomeToolDirectory tools={tools} />
        </div>

        <section
          className={styles.whySection}
          id="why-ayecalc"
          aria-labelledby="why-title"
        >
          <div className={`${styles.container} ${styles.whyGrid}`}>
            <div className={styles.whyIntro}>
              <span className={styles.eyebrow}>Less fuss. More useful.</span>
              <h2 id="why-title">
                Good tools should
                <br />
                make life simpler.
              </h2>
              <Link href="/about">
                A little about AyeCalc <ToolIcon name="arrow" />
              </Link>
            </div>
            <div className={styles.reason}>
              <span className={styles.reasonIcon}>
                <ToolIcon name="spark" />
              </span>
              <h3>Open. Use. Done.</h3>
              <p>
                No account to create. No software to install. Just the tool you
                came for.
              </p>
            </div>
            <div className={styles.reason}>
              <span className={styles.reasonIcon}>
                <ToolIcon name="shield" />
              </span>
              <h3>Your work stays yours.</h3>
              <p>
                Browser-based processing, with clear privacy notes and network
                requirements on each tool.
              </p>
            </div>
            <div className={styles.reason}>
              <span className={styles.reasonIcon}>
                <ToolIcon name="check" />
              </span>
              <h3>Clarity comes standard.</h3>
              <p>
                Understand the result with visible formulas, helpful examples,
                and honest limitations.
              </p>
            </div>
          </div>
        </section>

        <section
          className={`${styles.container} ${styles.calculatorSection}`}
          id="calculator"
          aria-labelledby="calculator-title"
        >
          <div className={styles.calculatorCopy}>
            <span className={styles.eyebrow}>Make the numbers make sense</span>
            <h2 id="calculator-title">
              A little clarity for
              <br />
              your next big decision.
            </h2>
            <p>
              Try the loan payment calculator. Adjust the amount, annual
              interest rate, and term to see an estimated monthly payment in US
              dollars.
            </p>
            <ul>
              <li>
                <ToolIcon name="check" /> See your estimate as you type
              </li>
              <li>
                <ToolIcon name="check" /> Compare different amounts and terms
              </li>
              <li>
                <ToolIcon name="check" /> Calculate directly in your browser
              </li>
            </ul>
            <details className={styles.loanMethod} id="loan-method">
              <summary>
                How is the payment calculated? <span aria-hidden="true">+</span>
              </summary>
              <div>
                <p>
                  For a fixed-rate loan with equal monthly payments,{" "}
                  <code>
                    M = P × r ÷ (1 − (1 + r)<sup>−n</sup>)
                  </code>
                  . P is the principal, r is the annual interest rate (as a
                  percentage) divided by 1,200, and n is the term in years
                  multiplied by 12. At 0% interest, the payment is P ÷ n.
                </p>
                <p>
                  For example, $250,000 at 6.5% over 30 years is approximately
                  $1,580 per month, rounded to the nearest dollar. This estimate
                  includes principal and interest only. Taxes, insurance, fees,
                  and lender-specific terms are excluded.
                </p>
                <Link href="/methodology">
                  Read our methodology <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </details>
          </div>
          <div className={styles.calculatorPanel}>
            <Calculator />
            <p className={styles.calculatorDisclaimer}>
              For planning and comparison. Actual lender payments may differ.
            </p>
          </div>
        </section>

        <section
          className={styles.guideSection}
          id="guides"
          aria-labelledby="guides-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.eyebrow}>
                  A little know-how goes a long way
                </span>
                <h2 id="guides-title">Go beyond the quick answer.</h2>
                <p>Practical guides to help you understand the why.</p>
              </div>
              <Link className={styles.secondaryLink} href="/guides">
                All guides <ToolIcon name="arrow" />
              </Link>
            </div>
            <div className={styles.guideGrid}>
              {guides.slice(0, 3).map((guide, index) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className={styles.guideCard}
                >
                  <div
                    className={styles.guideArtwork}
                    data-artwork={index}
                    aria-hidden="true"
                  >
                    {index === 0 ? (
                      <>
                        <span className={styles.unitTile}>rem</span>
                        <span className={styles.unitConnector}>vs</span>
                        <span className={styles.unitTile}>em</span>
                      </>
                    ) : index === 1 ? (
                      <>
                        <span className={styles.typeScale}>
                          A
                          <span>
                            A<span>A</span>
                          </span>
                        </span>
                        <span className={styles.baseline} />
                      </>
                    ) : (
                      <>
                        <span className={styles.pixelGrid}>px</span>
                        <ToolIcon name="arrow" />
                        <span className={styles.remTile}>rem</span>
                      </>
                    )}
                  </div>
                  <div className={styles.guideContent}>
                    <span className={styles.miniLabel}>{guide.category}</span>
                    <h3>{guide.title}</h3>
                    <span className={styles.readGuide}>
                      Read the guide <ToolIcon name="arrow" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`${styles.container} ${styles.faqSection}`}
          aria-labelledby="faq-title"
        >
          <div>
            <span className={styles.eyebrow}>Good questions</span>
            <h2 id="faq-title">
              A few things
              <br />
              you might wonder.
            </h2>
            <p>
              Still curious?{" "}
              <Link href="/contact">
                Get in touch <span aria-hidden="true">↗</span>
              </Link>
            </p>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.closing} aria-labelledby="closing-title">
          <div className={styles.container}>
            <span className={styles.closingSpark} aria-hidden="true">
              ✳
            </span>
            <div>
              <h2 id="closing-title">One less thing to figure out.</h2>
              <p>Your next useful tool is right here.</p>
            </div>
            <a className={styles.primaryButton} href="#tools">
              Explore the toolbox <ToolIcon name="arrow" />
            </a>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <Link href="/" className="brand" aria-label="AyeCalc home">
                <span className="brand-mark" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                AyeCalc<span className={styles.brandPeriod}>.</span>
              </Link>
              <p>
                Little tools for everyday life.
                <br />
                Made to be useful. Free to use.
              </p>
            </div>
            <nav aria-label="Tools and learning">
              <h2>Find your tool</h2>
              <Link href="/unit-converters">Unit converters</Link>
              <Link href="/image-tools">Image tools</Link>
              <Link href="/developer-tools">Developer tools</Link>
              <Link href="/loan-calculator">Loan calculator</Link>
              <Link href="/guides">Practical guides</Link>
            </nav>
            <nav aria-label="About AyeCalc">
              <h2>Meet AyeCalc</h2>
              <Link href="/about">About us</Link>
              <Link href="/methodology">Our methodology</Link>
              <Link href="/contact">Contact</Link>
            </nav>
            <nav aria-label="Policies">
              <h2>The details</h2>
              <Link href="/privacy">Privacy policy</Link>
              <Link href="/cookies">Cookie policy</Link>
              <Link href="/terms">Terms of use</Link>
              <Link href="/disclaimer">Disclaimer</Link>
              <Link href="/advertising-disclosure">Advertising disclosure</Link>
            </nav>
          </div>
          <div className={styles.footerBottom}>
            <span>
              © {new Date().getFullYear()} AyeCalc. All rights reserved.
            </span>
            <a href="#top">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
