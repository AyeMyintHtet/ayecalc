import Link from "next/link";
import { converterDefinitions } from "@/lib/converters";
import { developerTools } from "@/lib/developer-tools";
import styles from "@/components/all-tools-menu.module.css";

export default function AllToolsMenu({
  currentSlug,
}: {
  currentSlug?: string;
}) {
  const imageTools = developerTools.filter(
    (tool) => tool.category === "Image tools",
  );
  const codeTools = developerTools.filter(
    (tool) => tool.category !== "Image tools",
  );

  return (
    <details className={styles.menu}>
      <summary>
        All tools <span aria-hidden="true" />
      </summary>
      <div className={styles.dropdown}>
        <div className={styles.heading}>
          <div>
            <span>Explore AyeCalc</span>
            <strong>All tools</strong>
          </div>
          <Link href="/developer-tools">Browse tool directory ↗</Link>
        </div>
        <div className={styles.grid}>
          <section>
            <h2>Image tools</h2>
            {imageTools.map((tool) => (
              <Link
                href={`/${tool.slug}`}
                aria-current={tool.slug === currentSlug ? "page" : undefined}
                key={tool.slug}
              >
                {tool.shortTitle}
              </Link>
            ))}
          </section>
          <section>
            <h2>Developer &amp; CSS</h2>
            {codeTools.map((tool) => (
              <Link
                href={`/${tool.slug}`}
                aria-current={tool.slug === currentSlug ? "page" : undefined}
                key={tool.slug}
              >
                {tool.shortTitle}
              </Link>
            ))}
          </section>
          <section>
            <h2>Unit converters</h2>
            {converterDefinitions.map((converter) => (
              <Link
                href={`/${converter.slug}`}
                aria-current={converter.slug === currentSlug ? "page" : undefined}
                key={converter.slug}
              >
                {converter.title}
              </Link>
            ))}
          </section>
        </div>
      </div>
    </details>
  );
}
