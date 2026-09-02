import Link from "next/link";
import { ContentPage } from "@/components/content-chrome";
import styles from "@/app/content.module.css";
import { developerTools } from "@/lib/developer-tools";
import { guides } from "@/lib/guides";
import { createPageMetadata, siteConfig } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Free Developer, CSS & Image Tools",
  description:
    "Use free browser-based tools to scan for AI-image patterns, watermark, convert, resize, compress, crop, remove backgrounds, and generate CSS.",
  path: "/developer-tools",
  keywords: [
    "developer tools",
    "CSS tools",
    "CSS corner shape generator",
    "AI image scanner",
    "AI image detector",
    "image tools",
    "image resizer",
    "image compressor",
    "image cropper",
    "image format converter",
    "batch watermark images",
    "HEIC to JPG converter",
    "background remover",
    "web design calculators",
  ],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      url: `${siteConfig.url}/developer-tools`,
      name: "AyeCalc Developer Tools",
      description:
        "Browser-based developer, CSS, accessibility, and image utilities with visible methods and practical guidance.",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: developerTools.length,
        itemListElement: developerTools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.title,
          url: `${siteConfig.url}/${tool.slug}`,
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
          name: "Developer tools",
          item: `${siteConfig.url}/developer-tools`,
        },
      ],
    },
  ],
};

export default function DeveloperToolsPage() {
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
            <span aria-current="page">Developer tools</span>
          </nav>
          <span className={styles.eyebrow}>Browser-based utilities</span>
          <h1>Free developer, CSS, and image tools</h1>
          <p className={styles.heroLead}>
            Build responsive interfaces, check accessibility, detect AI-image
            patterns, and process images with focused tools that explain their
            methods and privacy behavior.
          </p>
          <div className={styles.heroMeta}>
            <span>No account</span>
            <span>Local processing</span>
            <span>Copy-ready results</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>Toolbox</span>
              <h2>Tools for practical digital workflows</h2>
            </div>
            <p>
              Scan for AI-image patterns, shape CSS corners, generate production
              values, inspect context-dependent units, and process images
              directly in your browser.
            </p>
          </div>
          <div className={styles.cardGrid}>
            {developerTools.map((tool) => (
              <Link className={styles.card} href={`/${tool.slug}`} key={tool.slug}>
                <span>{tool.category}</span>
                <strong>{tool.shortTitle}</strong>
                <p>{tool.description}</p>
                <small>Open tool ↗</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>Learn the context</span>
              <h2>Guides that explain the tradeoffs</h2>
            </div>
            <p>
              Conversion numbers are useful only when the CSS context and intended
              behavior are understood.
            </p>
          </div>
          <div className={styles.cardGrid}>
            {guides.slice(0, 3).map((guide) => (
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
