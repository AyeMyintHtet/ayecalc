import Link from "next/link";
import { ContentPage } from "@/components/content-chrome";
import { developerTools } from "@/lib/developer-tools";
import { createPageMetadata, siteConfig } from "@/lib/metadata";
import styles from "@/app/content.module.css";

const imageTools = developerTools.filter(
  (tool) => tool.category === "Image tools",
);
const description =
  "Free image tools to upscale photos with AI, remove backgrounds, resize, compress, convert, crop, and inspect image metadata. Process files in your browser.";
export const metadata = createPageMetadata({
  title: "Free Online Image Tools & Photo Utilities",
  description,
  path: "/image-tools",
});
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${siteConfig.url}/image-tools#webpage`,
      url: `${siteConfig.url}/image-tools`,
      name: "Free Online Image Tools",
      description,
      dateModified: "2026-09-18",
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: imageTools.length,
        itemListElement: imageTools.map((tool, index) => ({
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
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Image tools",
          item: `${siteConfig.url}/image-tools`,
        },
      ],
    },
  ],
};

export default function ImageToolsPage() {
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
            <span aria-current="page">Image tools</span>
          </nav>
          <span className={styles.eyebrow}>A little help for every image</span>
          <h1>Free online image tools</h1>
          <p className={styles.heroLead}>
            Prepare a photo for your website, make a small image larger, or
            inspect the information inside a file. Choose one focused tool and
            keep working in your browser.
          </p>
          <div className={styles.heroMeta}>
            <span>No account required</span>
            <span>Browser-based processing</span>
            <span>Clear format and size limits</span>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionKicker}>
                Choose your next step
              </span>
              <h2>Improve, prepare, and understand your images</h2>
            </div>
            <p>
              AI tools download model files on first use. Your selected images
              are processed locally; individual pages explain supported browsers
              and device limits.
            </p>
          </div>
          <div className={styles.cardGrid}>
            {imageTools.map((tool) => (
              <Link
                className={styles.card}
                href={`/${tool.slug}`}
                key={tool.slug}
                prefetch={false}
              >
                <span>
                  {tool.slug === "ai-image-upscaler"
                    ? "Photo enhancement"
                    : "Image utility"}
                </span>
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
          <h2>Which image tool should you use?</h2>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <strong>Make a small photo larger</strong>
              <p>
                Use the <Link href="/ai-image-upscaler">AI image upscaler</Link>{" "}
                for 2× enlargement with learned detail, or the{" "}
                <Link href="/image-resizer">image resizer</Link> for an exact
                width and height. AI results need visual inspection.
              </p>
            </div>
            <div className={styles.card}>
              <strong>Prepare an image for the web</strong>
              <p>
                Crop the frame, resize the dimensions, then use the{" "}
                <Link href="/image-compressor">image compressor</Link>. Removing
                a background first can help prepare product photos. Keep
                transparent output as PNG or WebP.
              </p>
            </div>
            <div className={styles.card}>
              <strong>Understand a file before editing</strong>
              <p>
                Use the{" "}
                <Link href="/content-credentials-inspector">
                  Content Credentials inspector
                </Link>{" "}
                to review embedded provenance and metadata. Keep the original
                because image exports may remove this information.
              </p>
            </div>
          </div>
          <p>
            <Link href="/guides/ai-upscaling-vs-resizing">
              Read the guide to AI upscaling vs. resizing
            </Link>{" "}
            ·{" "}
            <Link href="/developer-tools">Explore CSS and developer tools</Link>
          </p>
        </div>
      </section>
    </ContentPage>
  );
}
