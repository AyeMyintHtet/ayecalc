import Link from "next/link";
import AllToolsMenu from "@/components/all-tools-menu";
import styles from "@/components/site-header.module.css";

export default function SiteHeader({ currentSlug }: { currentSlug?: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="AyeCalc home">
          <span className={styles.brandMark} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>AyeCalc</span>
        </Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          <Link href="/developer-tools">Developer tools</Link>
          <Link href="/unit-converters">Converters</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/methodology">Methodology</Link>
        </nav>
        <AllToolsMenu currentSlug={currentSlug} />
      </div>
    </header>
  );
}
