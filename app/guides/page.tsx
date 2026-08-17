import Link from "next/link";
import { ContentPage } from "@/components/content-chrome";
import styles from "@/app/content.module.css";
import { guides } from "@/lib/guides";
import { createPageMetadata, siteConfig } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "CSS & Developer Guides",
  description:
    "Read practical AyeCalc guides about CSS units, fluid typography, Tailwind spacing, design handoff, and accessible interface calculations.",
  path: "/guides",
  keywords: ["CSS guides", "developer guides", "REM guide", "fluid typography guide"],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      url: `${siteConfig.url}/guides`,
      name: "AyeCalc CSS and Developer Guides",
      description:
        "Practical guides for CSS units, responsive typography, and developer workflows.",
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
          name: "Guides",
          item: `${siteConfig.url}/guides`,
        },
      ],
    },
  ],
};

export default function GuidesPage() {
  return (
    <ContentPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className={styles.hero}>
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Guides</span>
          </nav>
          <span className={styles.eyebrow}>Knowledge base</span>
          <h1>CSS and developer guides</h1>
          <p className={styles.heroLead}>
            Understand the assumptions behind the tools, choose units intentionally,
            and carry calculations into accessible production interfaces.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>Practical explanations</span>
              <h2>Learn the method, not only the answer</h2>
            </div>
            <p>
              Each guide connects technical definitions to design and development
              decisions, with primary references and related calculators.
            </p>
          </div>
          <div className={styles.cardGrid}>
            {guides.map((guide) => (
              <Link className={styles.card} href={`/guides/${guide.slug}`} key={guide.slug}>
                <span>{guide.category}</span>
                <strong>{guide.title}</strong>
                <p>{guide.description}</p>
                <small>Read guide ↗</small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </ContentPage>
  );
}
