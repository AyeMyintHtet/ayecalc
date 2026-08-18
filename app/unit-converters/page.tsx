import Link from "next/link";
import { ContentPage } from "@/components/content-chrome";
import styles from "@/app/content.module.css";
import { converterDefinitions } from "@/lib/converters";
import { createPageMetadata, siteConfig } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Free Unit Converters",
  description:
    "Browse accurate AyeCalc converters for PX, REM, EM, pounds, kilograms, centimeters, and inches with formulas and reference tables.",
  path: "/unit-converters",
  keywords: ["unit converters", "CSS unit converter", "weight converter", "length converter"],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      url: `${siteConfig.url}/unit-converters`,
      name: "AyeCalc Unit Converters",
      description:
        "Unit converters with visible formulas, adjustable assumptions, and reference tables.",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: converterDefinitions.length,
        itemListElement: converterDefinitions.map((converter, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: converter.title,
          url: `${siteConfig.url}/${converter.slug}`,
        })),
      },
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
          name: "Unit converters",
          item: `${siteConfig.url}/unit-converters`,
        },
      ],
    },
  ],
};

export default function UnitConvertersPage() {
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
            <span aria-current="page">Unit converters</span>
          </nav>
          <span className={styles.eyebrow}>Conversion directory</span>
          <h1>Free unit converters</h1>
          <p className={styles.heroLead}>
            Convert CSS, weight, and length units with documented factors,
            configurable context where needed, and instant browser-based results.
          </p>
        </div>
      </section>

      {(["Developer units", "Weight", "Length"] as const).map((category, index) => {
        const converters = converterDefinitions.filter(
          (converter) => converter.category === category,
        );

        return (
          <section
            className={`${styles.section} ${index % 2 ? styles.sectionAlt : ""}`}
            key={category}
          >
            <div className={styles.container}>
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.sectionKicker}>Conversion group</span>
                  <h2>{category}</h2>
                </div>
                <p>
                  Every converter includes its calculation method, a worked example,
                  practical limitations, and a pre-calculated reference table.
                </p>
              </div>
              <div className={styles.cardGrid}>
                {converters.map((converter) => (
                  <Link className={styles.card} href={`/${converter.slug}`} key={converter.slug}>
                    <span>{converter.category}</span>
                    <strong>{converter.title}</strong>
                    <p>{converter.description}</p>
                    <small>Open converter ↗</small>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </ContentPage>
  );
}
