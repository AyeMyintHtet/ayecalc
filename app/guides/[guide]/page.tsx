import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content-chrome";
import styles from "@/app/content.module.css";
import { getConverterBySlug } from "@/lib/converters";
import { getDeveloperTool } from "@/lib/developer-tools";
import {
  createGuideMetadata,
  getGuide,
  guides,
} from "@/lib/guides";
import { siteConfig } from "@/lib/metadata";

type GuidePageProps = {
  params: Promise<{ guide: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((guide) => ({ guide: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { guide: slug } = await params;
  const guide = getGuide(slug);
  return guide ? createGuideMetadata(guide) : {};
}

function jsonLdString(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { guide: slug } = await params;
  const guide = getGuide(slug);

  if (!guide) notFound();

  const canonicalUrl = `${siteConfig.url}/guides/${guide.slug}`;
  const relatedTools = guide.relatedToolSlugs
    .map((toolSlug) => getDeveloperTool(toolSlug) ?? getConverterBySlug(toolSlug))
    .filter((tool) => tool !== undefined);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: guide.title,
        description: guide.description,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        inLanguage: "en-US",
        dateModified: "2026-08-17",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${siteConfig.url}/guides` },
          { "@type": "ListItem", position: 3, name: guide.title, item: canonicalUrl },
        ],
      },
    ],
  };

  return (
    <ContentPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <section className={styles.hero}>
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/guides">Guides</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{guide.title}</span>
          </nav>
          <span className={styles.eyebrow}>{guide.category}</span>
          <h1>{guide.title}</h1>
          <p className={styles.heroLead}>{guide.description}</p>
          <div className={styles.heroMeta}>
            <span>Original practical guidance</span>
            <span>Primary sources</span>
            <span>Reviewed {guide.reviewed}</span>
          </div>
        </div>
      </section>

      <div className={`${styles.container} ${styles.contentLayout}`}>
        <article className={styles.article}>
          <p className={styles.articleIntro}>{guide.introduction}</p>
          {guide.sections.map((section) => (
            <section className={styles.articleSection} id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
              {section.code && (
                <pre className={styles.codeBlock}>
                  <code>{section.code}</code>
                </pre>
              )}
              {section.callout && (
                <div className={styles.callout}>
                  <strong>{section.callout.title}</strong>
                  <p>{section.callout.text}</p>
                </div>
              )}
            </section>
          ))}

          <section className={styles.articleSection} id="sources">
            <h2>Sources and further reading</h2>
            <p>
              These references define the technical behavior described in this
              guide. Project-specific computed values should still be verified in
              the rendered application.
            </p>
            <ul className={styles.sourceList}>
              {guide.sources.map((source) => (
                <li key={source.href}>
                  <a href={source.href}>{source.label}</a>
                </li>
              ))}
            </ul>
            <p className={styles.reviewed}>Last reviewed: {guide.reviewed}</p>
          </section>

          {relatedTools.length > 0 && (
            <section className={styles.articleSection} id="related-tools">
              <h2>Use the related tools</h2>
              <div className={styles.cardGrid}>
                {relatedTools.map((tool) => (
                  <Link className={styles.card} href={`/${tool.slug}`} key={tool.slug}>
                    <span>{tool.category}</span>
                    <strong>{"shortTitle" in tool ? tool.shortTitle : tool.title}</strong>
                    <p>{tool.description}</p>
                    <small>Open tool ↗</small>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className={styles.toc} aria-label="On this page">
          <span>On this page</span>
          {guide.sections.map((section) => (
            <a href={`#${section.id}`} key={section.id}>
              {section.title}
            </a>
          ))}
          <a href="#sources">Sources</a>
          {relatedTools.length > 0 && <a href="#related-tools">Related tools</a>}
        </aside>
      </div>
    </ContentPage>
  );
}
