import Link from "next/link";
import { ContentPage } from "@/components/content-chrome";
import styles from "@/app/content.module.css";
import type { InfoPageDefinition } from "@/lib/info-pages";
import { siteConfig } from "@/lib/metadata";

function jsonLdString(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function InfoPage({ page }: { page: InfoPageDefinition }) {
  const canonicalUrl = `${siteConfig.url}/${page.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: page.title,
        description: page.description,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        inLanguage: "en-US",
        dateModified: "2026-08-17",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
          { "@type": "ListItem", position: 2, name: page.title, item: canonicalUrl },
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
            <span aria-current="page">{page.title}</span>
          </nav>
          <span className={styles.eyebrow}>{page.category}</span>
          <h1>{page.title}</h1>
          <p className={styles.heroLead}>{page.description}</p>
          <div className={styles.heroMeta}>
            <span>Plain-language policy</span>
            <span>Last reviewed {page.reviewed}</span>
          </div>
        </div>
      </section>

      <div className={`${styles.container} ${styles.contentLayout}`}>
        <article className={styles.article}>
          <p className={styles.articleIntro}>{page.introduction}</p>
          {page.sections.map((section) => (
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
              {section.callout && (
                <div className={styles.callout}>
                  <strong>{section.callout.title}</strong>
                  <p>{section.callout.text}</p>
                </div>
              )}
            </section>
          ))}
          <p className={styles.reviewed}>Last reviewed: {page.reviewed}</p>
        </article>

        <aside className={styles.toc} aria-label="On this page">
          <span>On this page</span>
          {page.sections.map((section) => (
            <a href={`#${section.id}`} key={section.id}>
              {section.title}
            </a>
          ))}
        </aside>
      </div>
    </ContentPage>
  );
}
