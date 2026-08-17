import Link from "next/link";
import { ContentPage } from "@/components/content-chrome";
import styles from "@/app/content.module.css";
import { createPageMetadata, siteConfig } from "@/lib/metadata";

const contactEmail = "ayemyinthtet099@gmail.com";
const canonicalUrl = `${siteConfig.url}/contact`;

export const metadata = createPageMetadata({
  title: "Contact AyeCalc",
  description:
    "Contact AyeCalc about calculator errors, accessibility, privacy, technical feedback, or another question about the site.",
  path: "/contact",
  imageAlt: "Contact AyeCalc",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: "Contact AyeCalc",
      description:
        "Public contact information for calculator feedback, accessibility, privacy, and site questions.",
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      inLanguage: "en-US",
      dateModified: "2026-08-17",
    },
    {
      "@type": "BreadcrumbList",
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
          name: "Contact",
          item: canonicalUrl,
        },
      ],
    },
  ],
};

export default function ContactPage() {
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
            <span aria-current="page">Contact</span>
          </nav>
          <span className={styles.eyebrow}>Get in touch</span>
          <h1>Contact AyeCalc</h1>
          <p className={styles.heroLead}>
            Report a calculation problem, share technical feedback, ask a privacy
            question, or flag an accessibility issue.
          </p>
          <div className={styles.heroMeta}>
            <span>Public contact email</span>
            <span>Useful feedback welcome</span>
            <span>Reviewed August 17, 2026</span>
          </div>
        </div>
      </section>

      <div className={`${styles.container} ${styles.contentLayout}`}>
        <article className={styles.article}>
          <p className={styles.articleIntro}>
            Email AyeCalc at{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>

          <section className={styles.articleSection} id="what-to-send">
            <h2>What to include</h2>
            <p>
              For a tool or calculation issue, include the page URL, the inputs and
              units used, the result you received, and the result you expected.
              Screenshots and browser details can help identify display-specific
              problems.
            </p>
            <ul>
              <li>Calculation, formula, conversion-factor, or rounding errors</li>
              <li>Broken links, outdated references, or unclear explanations</li>
              <li>Keyboard, screen-reader, contrast, zoom, or mobile issues</li>
              <li>Privacy, cookie, advertising, or disclosure questions</li>
            </ul>
          </section>

          <section className={styles.articleSection} id="privacy">
            <h2>Protect private information</h2>
            <p>
              Do not email passwords, payment details, government identifiers,
              confidential client data, medical records, or other sensitive
              information. AyeCalc does not need those details to investigate an
              ordinary calculator or website issue.
            </p>
          </section>

          <section className={styles.articleSection} id="scope">
            <h2>Support scope</h2>
            <p>
              The contact channel is for AyeCalc site and content questions. It is
              not a substitute for professional financial, medical, tax, legal,
              engineering, or accessibility-certification advice.
            </p>
          </section>

          <p className={styles.reviewed}>Last reviewed: August 17, 2026</p>
        </article>

        <aside className={styles.toc} aria-label="On this page">
          <span>On this page</span>
          <a href="#what-to-send">What to include</a>
          <a href="#privacy">Protect private information</a>
          <a href="#scope">Support scope</a>
        </aside>
      </div>
    </ContentPage>
  );
}
