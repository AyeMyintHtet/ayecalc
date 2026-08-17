import type { ReactNode } from "react";
import Link from "next/link";
import CopyCode from "@/components/copy-code";
import styles from "@/components/tool-page.module.css";
import {
  developerTools,
  type DeveloperToolDefinition,
} from "@/lib/developer-tools";
import { siteConfig } from "@/lib/metadata";

type DeveloperToolPageProps = {
  tool: DeveloperToolDefinition;
  children: ReactNode;
};

function jsonLdString(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function DeveloperToolPage({
  tool,
  children,
}: DeveloperToolPageProps) {
  const canonicalUrl = `${siteConfig.url}/${tool.slug}`;
  const isImageTool = tool.category === "Image tools";
  const relatedTools = developerTools
    .filter((candidate) => candidate.slug !== tool.slug)
    .slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: tool.title,
        description: tool.description,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        inLanguage: "en-US",
      },
      {
        "@type": "WebApplication",
        "@id": `${canonicalUrl}#application`,
        name: tool.title,
        url: canonicalUrl,
        description: tool.description,
        applicationCategory: isImageTool
          ? "MultimediaApplication"
          : "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: isImageTool
          ? "Modern browser with JavaScript; network access required for first-use model files"
          : "JavaScript enabled for live calculations",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteConfig.url}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Developer Tools",
            item: `${siteConfig.url}/developer-tools`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.shortTitle,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/" aria-label="AyeCalc home">
            <span className={styles.brandMark} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>AyeCalc</span>
          </Link>
          <nav className={styles.headerNav} aria-label="Tool navigation">
            <Link href="/developer-tools">Developer tools</Link>
            <Link href="#formula">Method</Link>
            <Link href="#faq">FAQ</Link>
          </nav>
          <Link className={styles.headerCta} href="/unit-converters">
            Unit converters <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.pageContainer}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/developer-tools">Developer tools</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{tool.shortTitle}</span>
            </nav>

            <div className={styles.heroCopy}>
              <span className={styles.kicker}>{tool.category}</span>
              <h1>{tool.title}</h1>
              <p>{tool.introduction}</p>
              <div className={styles.heroFacts} aria-label="Tool benefits">
                {tool.benefits.map((benefit) => (
                  <span key={benefit}>{benefit}</span>
                ))}
              </div>
            </div>

            {children}
          </div>
        </section>

        <section className={styles.summaryStrip} aria-label="Method summary">
          <div className={styles.pageContainer}>
            <span>Core formula</span>
            <strong>{tool.formula}</strong>
            <p>{tool.formulaNote}</p>
          </div>
        </section>

        <div className={`${styles.pageContainer} ${styles.contentLayout}`}>
          <article className={styles.article}>
            <section id="formula" className={styles.contentSection}>
              <span className={styles.sectionNumber}>01</span>
              <div>
                <span className={styles.sectionKicker}>Method</span>
                <h2>How the {tool.shortTitle.toLowerCase()} works</h2>
                <p>{tool.method}</p>
                <div className={styles.formulaCard}>
                  <span>Formula</span>
                  <code>{tool.formula}</code>
                  <p>{tool.formulaNote}</p>
                </div>
              </div>
            </section>

            <section className={styles.contentSection}>
              <span className={styles.sectionNumber}>02</span>
              <div>
                <span className={styles.sectionKicker}>Worked example</span>
                <h2>{tool.exampleTitle}</h2>
                <p>{tool.exampleText}</p>
              </div>
            </section>

            <section className={styles.contentSection}>
              <span className={styles.sectionNumber}>03</span>
              <div>
                <span className={styles.sectionKicker}>
                  {isImageTool ? "Output" : "Implementation"}
                </span>
                <h2>
                  {isImageTool ? "Using the transparent PNG" : "Copyable code examples"}
                </h2>
                <p>
                  {isImageTool
                    ? "Preserve the PNG alpha channel and provide accurate dimensions and alternative text when adding the result to a page."
                    : "Use these examples as a starting point, then match the values and assumptions to the rendered project."}
                </p>
                <div className={styles.snippetGrid}>
                  {tool.codeSnippets.map((snippet) => (
                    <CopyCode
                      label={snippet.label}
                      code={snippet.code}
                      key={snippet.label}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className={styles.contentSection}>
              <span className={styles.sectionNumber}>04</span>
              <div>
                <span className={styles.sectionKicker}>Practical guidance</span>
                <h2>Using the result accurately</h2>
                <p>{tool.guidance}</p>
                <div className={styles.limitCard}>
                  <strong>Important limitation</strong>
                  <p>{tool.limitation}</p>
                </div>
                <p className={styles.sourceLine}>
                  Reference: <a href={tool.source.href}>{tool.source.label}</a>.
                </p>
              </div>
            </section>
          </article>

          <aside className={styles.sideRail} aria-label="On this page">
            <div className={styles.sideCard}>
              <span>On this page</span>
              <a href="#formula">Formula and method</a>
              <a href="#faq">Frequently asked questions</a>
              <a href="#related-tools">Related tools</a>
            </div>
            <div className={styles.reviewCard}>
              <span aria-hidden="true">✓</span>
              <div>
                <strong>Reviewed</strong>
                <small>August 17, 2026</small>
              </div>
            </div>
          </aside>
        </div>

        <section id="faq" className={styles.faqSection}>
          <div className={`${styles.pageContainer} ${styles.faqInner}`}>
            <div className={styles.faqHeading}>
              <span className={styles.sectionKicker}>Common questions</span>
              <h2>{tool.shortTitle} FAQ</h2>
              <p>Answers about the method, assumptions, and practical use.</p>
            </div>
            <div className={styles.faqList}>
              {tool.faqs.map((faq, index) => (
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

        <section id="related-tools" className={styles.relatedSection}>
          <div className={styles.pageContainer}>
            <div className={styles.relatedHeading}>
              <div>
                <span className={styles.sectionKicker}>
                  {isImageTool ? "Continue creating" : "Build better interfaces"}
                </span>
                <h2>Related tools</h2>
              </div>
              <Link href="/developer-tools">View all developer tools</Link>
            </div>
            <div className={styles.relatedGrid}>
              {relatedTools.map((relatedTool) => (
                <Link href={`/${relatedTool.slug}`} key={relatedTool.slug}>
                  <span>{relatedTool.category}</span>
                  <strong className={styles.relatedToolName}>{relatedTool.shortTitle}</strong>
                  <p>{relatedTool.description}</p>
                  <small aria-hidden="true">Open tool ↗</small>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <Link className={styles.brand} href="/" aria-label="AyeCalc home">
              <span className={styles.brandMark} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span>AyeCalc</span>
            </Link>
            <p>Numbers, made human.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/developer-tools">Developer tools</Link>
            <Link href="/unit-converters">Converters</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/methodology">Methodology</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <p>© {new Date().getFullYear()} AyeCalc. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
