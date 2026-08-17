import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyCode from "@/components/copy-code";
import UnitConverter from "@/components/unit-converter";
import { convertValue, formatConversionNumber } from "@/lib/conversion-math";
import {
  converterDefinitions,
  getConverterBySlug,
  getConverterDefinition,
  getConverterFaqs,
  getDefaultContext,
  getExample,
} from "@/lib/converters";
import { createPageMetadata, siteConfig } from "@/lib/metadata";
import styles from "@/components/tool-page.module.css";

type ConverterPageProps = {
  params: Promise<{
    conversion: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return converterDefinitions.map(({ slug }) => ({ conversion: slug }));
}

export async function generateMetadata({
  params,
}: ConverterPageProps): Promise<Metadata> {
  const { conversion } = await params;
  const converter = getConverterBySlug(conversion);

  if (!converter) return {};

  return createPageMetadata({
    title: converter.title,
    description: converter.description,
    path: `/${converter.slug}`,
    keywords: [
      `${converter.fromSymbol} to ${converter.toSymbol}`,
      `${converter.fromName} to ${converter.toName}`,
      `${converter.fromSymbol} to ${converter.toSymbol} converter`,
      `${converter.fromSymbol} to ${converter.toSymbol} formula`,
      `convert ${converter.fromSymbol} to ${converter.toSymbol}`,
    ],
    imageAlt: `${converter.title} on AyeCalc`,
  });
}

function getSource(category: (typeof converterDefinitions)[number]["category"]) {
  if (category === "Developer units") {
    return {
      label: "W3C CSS Values and Units: font-relative lengths",
      href: "https://www.w3.org/TR/css-values-3/#font-relative-lengths",
    };
  }

  return {
    label: "NIST Guide to the SI: conversion factors",
    href: "https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8",
  };
}

function jsonLdString(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function ConverterPage({ params }: ConverterPageProps) {
  const { conversion } = await params;
  const converter = getConverterBySlug(conversion);

  if (!converter) notFound();

  const canonicalUrl = `${siteConfig.url}/${converter.slug}`;
  const defaultContext = getDefaultContext(converter);
  const example = getExample(converter);
  const faqs = getConverterFaqs(converter);
  const reverseConverter = getConverterDefinition(converter.to, converter.from);
  const source = getSource(converter.category);
  const relatedConverters = [
    ...converterDefinitions.filter(
      (item) => item.slug !== converter.slug && item.category === converter.category,
    ),
    ...converterDefinitions.filter(
      (item) => item.slug !== converter.slug && item.category !== converter.category,
    ),
  ].slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: converter.title,
        description: converter.description,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        inLanguage: "en-US",
      },
      {
        "@type": "WebApplication",
        "@id": `${canonicalUrl}#application`,
        name: converter.title,
        url: canonicalUrl,
        description: converter.description,
        applicationCategory:
          converter.category === "Developer units"
            ? "DeveloperApplication"
            : "UtilitiesApplication",
        operatingSystem: "Any",
        browserRequirements: "JavaScript enabled for live calculations",
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
            name: "Converters",
            item: `${siteConfig.url}/unit-converters`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: converter.title,
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
          <nav className={styles.headerNav} aria-label="Converter navigation">
            <Link href="/unit-converters">All converters</Link>
            <Link href="#formula">Formula</Link>
            <Link href="#conversion-table">Table</Link>
          </nav>
          <Link className={styles.headerCta} href="/developer-tools">
            Explore tools <span aria-hidden="true">↗</span>
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
              <Link href="/unit-converters">Converters</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{converter.title}</span>
            </nav>

            <div className={styles.heroCopy}>
              <span className={styles.kicker}>{converter.category}</span>
              <h1>{converter.title}</h1>
              <p>{converter.introduction}</p>
              <div className={styles.heroFacts} aria-label="Converter benefits">
                <span>Instant result</span>
                <span>Adjustable assumptions</span>
                <span>No data sent</span>
              </div>
            </div>

            <UnitConverter
              from={converter.from}
              to={converter.to}
              fromName={converter.fromName}
              toName={converter.toName}
              fromSymbol={converter.fromSymbol}
              toSymbol={converter.toSymbol}
              defaultValue={converter.defaultValue}
              inputStep={converter.inputStep}
              allowNegative={converter.allowNegative}
              contextFields={converter.contextFields}
              reverseHref={
                reverseConverter ? `/${reverseConverter.slug}` : undefined
              }
            />
          </div>
        </section>

        <section className={styles.summaryStrip} aria-label="Conversion summary">
          <div className={styles.pageContainer}>
            <span>Conversion rule</span>
            <strong>{converter.formula}</strong>
            <p>{converter.formulaNote}</p>
          </div>
        </section>

        <div className={`${styles.pageContainer} ${styles.contentLayout}`}>
          <article className={styles.article}>
            <section id="formula" className={styles.contentSection}>
              <span className={styles.sectionNumber}>01</span>
              <div>
                <span className={styles.sectionKicker}>Method</span>
                <h2>
                  How to convert {converter.fromName} to {converter.toName}
                </h2>
                <p>{converter.method}</p>
                <div className={styles.formulaCard}>
                  <span>Formula</span>
                  <code>{converter.formula}</code>
                  <p>{converter.formulaNote}</p>
                </div>
              </div>
            </section>

            <section className={styles.contentSection}>
              <span className={styles.sectionNumber}>02</span>
              <div>
                <span className={styles.sectionKicker}>Worked example</span>
                <h2>
                  Convert {example.input} {converter.fromSymbol} to {converter.toSymbol}
                </h2>
                <p>
                  Apply the conversion rule to {example.input} {converter.fromName}.
                  Using the default settings, the result is {example.output}{" "}
                  {converter.toSymbol}.
                </p>
                <div className={styles.exampleEquation}>
                  <span>
                    {example.input} {converter.fromSymbol}
                  </span>
                  <b aria-hidden="true">→</b>
                  <strong>
                    {example.output} {converter.toSymbol}
                  </strong>
                </div>
                {converter.contextFields.length > 0 && (
                  <p className={styles.assumptionNote}>
                    Default context:{" "}
                    {converter.contextFields
                      .map(
                        (field) =>
                          `${field.label.toLowerCase()} ${field.defaultValue}${field.unit}`,
                      )
                      .join(", ")}
                    .
                  </p>
                )}
              </div>
            </section>

            <section
              id="conversion-table"
              className={styles.contentSection}
            >
              <span className={styles.sectionNumber}>03</span>
              <div>
                <span className={styles.sectionKicker}>Quick reference</span>
                <h2>
                  {converter.fromSymbol} to {converter.toSymbol} conversion table
                </h2>
                <p>
                  These pre-calculated values use the same formula and default
                  settings as the converter above.
                </p>
                <div className={styles.tableWrap}>
                  <table>
                    <caption className={styles.visuallyHidden}>
                      Common {converter.fromName} to {converter.toName} conversions
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">
                          {converter.fromName} ({converter.fromSymbol})
                        </th>
                        <th scope="col">
                          {converter.toName} ({converter.toSymbol})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {converter.tableValues.map((value) => {
                        const result = convertValue(
                          converter.from,
                          converter.to,
                          value,
                          defaultContext,
                        );

                        return (
                          <tr key={value}>
                            <td>
                              {formatConversionNumber(value)} {converter.fromSymbol}
                            </td>
                            <td>
                              {formatConversionNumber(result)} {converter.toSymbol}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className={styles.contentSection}>
              <span className={styles.sectionNumber}>04</span>
              <div>
                <span className={styles.sectionKicker}>Practical use</span>
                <h2>Code and calculation snippets</h2>
                <p>
                  Reuse the same conversion in a stylesheet or application. Keep
                  contextual font sizes configurable when working with relative CSS
                  units.
                </p>
                <div className={styles.snippetGrid}>
                  {converter.codeSnippets.map((snippet) => (
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
              <span className={styles.sectionNumber}>05</span>
              <div>
                <span className={styles.sectionKicker}>Interpretation</span>
                <h2>Using the result accurately</h2>
                <p>{converter.guidance}</p>
                <div className={styles.limitCard}>
                  <strong>Important limitation</strong>
                  <p>{converter.limitation}</p>
                </div>
                <p className={styles.sourceLine}>
                  Reference:{" "}
                  <a href={source.href}>{source.label}</a>.
                </p>
              </div>
            </section>
          </article>

          <aside className={styles.sideRail} aria-label="On this page">
            <div className={styles.sideCard}>
              <span>On this page</span>
              <a href="#formula">Formula and method</a>
              <a href="#conversion-table">Reference table</a>
              <a href="#faq">Frequently asked questions</a>
              <a href="#related-converters">Related converters</a>
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
              <h2>{converter.title} FAQ</h2>
              <p>
                Short answers about the formula, assumptions, and displayed
                precision.
              </p>
            </div>
            <div className={styles.faqList}>
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

        <section id="related-converters" className={styles.relatedSection}>
          <div className={styles.pageContainer}>
            <div className={styles.relatedHeading}>
              <div>
                <span className={styles.sectionKicker}>Keep converting</span>
                <h2>Related converters</h2>
              </div>
              <Link href="/unit-converters">View all converters</Link>
            </div>
            <div className={styles.relatedGrid}>
              {relatedConverters.map((item) => (
                <Link href={`/${item.slug}`} key={item.slug}>
                  <span>{item.category}</span>
                  <strong>
                    {item.fromSymbol} <b aria-hidden="true">→</b> {item.toSymbol}
                  </strong>
                  <p>{item.title}</p>
                  <small aria-hidden="true">Open converter ↗</small>
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
