import type { ReactNode } from "react";
import Link from "next/link";
import CopyCode from "@/components/copy-code";
import SiteHeader from "@/components/site-header";
import styles from "@/components/tool-page.module.css";
import {
  developerTools,
  type DeveloperToolDefinition,
} from "@/lib/developer-tools";
import { getDateModified, siteConfig } from "@/lib/metadata";

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
  const isBackgroundRemover = tool.slug === "background-remover";
  const isHeicConverter = tool.slug === "heic-to-jpg";
  const isCornerShapeGenerator = tool.slug === "css-corner-shape-generator";
  const isAiImageScanner = tool.slug === "ai-image-scanner";
  const isCredentialInspector = tool.slug === "content-credentials-inspector";
  const priorityRelatedSlugs = isCredentialInspector
    ? ["ai-image-scanner", "image-format-converter", "image-compressor", "batch-watermark-images"]
    : isAiImageScanner
      ? ["content-credentials-inspector"]
      : [];
  const relatedTools = [
    ...priorityRelatedSlugs
      .map((slug) => developerTools.find((candidate) => candidate.slug === slug))
      .filter((candidate): candidate is DeveloperToolDefinition => Boolean(candidate)),
    ...developerTools.filter(
      (candidate) =>
        candidate.slug !== tool.slug &&
        !priorityRelatedSlugs.includes(candidate.slug) &&
        candidate.category === tool.category,
    ),
    ...developerTools.filter(
      (candidate) =>
        candidate.slug !== tool.slug &&
        !priorityRelatedSlugs.includes(candidate.slug) &&
        candidate.category !== tool.category,
    ),
  ].slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: tool.title,
        description: tool.description,
        keywords: tool.searchTerms?.join(", "),
        dateModified: getDateModified(tool.lastModified),
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        mainEntity: { "@id": `${canonicalUrl}#application` },
        inLanguage: "en-US",
      },
      {
        "@type": "WebApplication",
        "@id": `${canonicalUrl}#application`,
        name: tool.title,
        alternateName: tool.searchTerms,
        url: canonicalUrl,
        description: tool.description,
        applicationCategory: isImageTool
          ? "MultimediaApplication"
          : "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: isBackgroundRemover
          ? "Modern browser with JavaScript; network access required for first-use model files"
          : isHeicConverter
            ? "Modern browser with JavaScript, Web Workers, WebAssembly, and OffscreenCanvas"
          : isCornerShapeGenerator
            ? "Modern browser with JavaScript and CSS corner-shape support for the live preview"
          : isAiImageScanner
            ? "Modern browser with JavaScript, Web Workers, and WebAssembly; network access required for first-use model files"
          : isCredentialInspector
            ? "Modern browser with JavaScript, Web Workers, and WebAssembly"
          : isImageTool
            ? "Modern browser with JavaScript and Canvas image encoding"
            : "JavaScript enabled for live calculations",
        featureList: tool.benefits,
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
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        url: `${canonicalUrl}#faq`,
        mainEntity: tool.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      <SiteHeader currentSlug={tool.slug} />

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
                  {isCredentialInspector
                    ? "Evidence"
                    : isImageTool
                      ? "Output"
                      : "Implementation"}
                </span>
                <h2>
                  {isBackgroundRemover
                    ? "Using the transparent PNG"
                    : isCredentialInspector
                      ? "Reading the evidence report"
                    : isImageTool
                      ? "Using the processed image"
                      : "Copyable code examples"}
                </h2>
                <p>
                  {isBackgroundRemover
                    ? "Preserve the PNG alpha channel and provide accurate dimensions and alternative text when adding the result to a page."
                    : isCredentialInspector
                      ? "Read credential validation, AI disclosures, attribution, rights, capture, and privacy fields as separate signals. Save the JSON report when a technical record is useful."
                    : isImageTool
                      ? "Keep the exported dimensions, format, transparency, and compression level appropriate for where the image will be used."
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
                  References:{" "}
                  {[tool.source, ...(tool.additionalSources ?? [])].map(
                    (source, index) => (
                      <span key={source.href}>
                        {index > 0 ? " · " : ""}
                        <a href={source.href}>{source.label}</a>
                      </span>
                    ),
                  )}
                  .
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
                <small>{tool.reviewed ?? "August 18, 2026"}</small>
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
