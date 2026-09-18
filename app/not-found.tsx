import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import ToolIcon from "@/components/tool-icon";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page could not be found. Find your way back to AyeCalc's calculators, converters, and image tools.",
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <SiteHeader appearance="light" />

      <main id="main-content" className={styles.main} tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="not-found-title">
          <div className={styles.copy}>
            <p className={styles.eyebrow}>
              <span>404</span> Page not found
            </p>
            <h1 id="not-found-title">
              This page doesn’t <span>add up.</span>
            </h1>
            <p className={styles.description}>
              We couldn’t find the page you’re looking for. The link may have
              changed, or there might be a typo in the address.
            </p>
            <div className={styles.actions}>
              <Link href="/" className={styles.primaryLink}>
                Back to home <ToolIcon name="arrow" />
              </Link>
              <Link href="/#tools" className={styles.secondaryLink}>
                <ToolIcon name="search" /> Find a tool
              </Link>
            </div>
            <p className={styles.reassurance}>
              A small detour. Plenty of useful tools ahead.
            </p>
          </div>

          <div className={styles.scene} aria-hidden="true">
            <div className={styles.orbit} />
            <div className={styles.sceneLabel}>
              <span /> A little outside the numbers
            </div>
            <span className={`${styles.symbol} ${styles.plus}`}>+</span>
            <span className={`${styles.symbol} ${styles.multiply}`}>×</span>
            <div className={styles.keyBoard}>
              <div className={styles.keyBed} />
              <span className={`${styles.key} ${styles.firstKey}`}>4</span>
              <span className={`${styles.key} ${styles.middleKey}`}>0</span>
              <span className={`${styles.key} ${styles.lastKey}`}>4</span>
            </div>
            <div className={styles.floatingTile}>
              <ToolIcon name="search" />
            </div>
            <span className={styles.caption}>
              Let’s find a better starting point.
            </span>
          </div>
        </section>

        <section className={styles.explore} aria-labelledby="explore-title">
          <div className={styles.exploreHeading}>
            <h2 id="explore-title">Pick up somewhere useful</h2>
            <span>What would you like to do?</span>
          </div>
          <div className={styles.destinations}>
            <Link href="/unit-converters" className={styles.destination}>
              <span className={styles.toolIcon}>
                <ToolIcon name="swap" />
              </span>
              <span>
                <strong>Convert a value</strong>
                <small>Units, sizes, and everyday numbers</small>
              </span>
              <ToolIcon name="arrow" className={styles.cardArrow} />
            </Link>
            <Link href="/image-tools" className={styles.destination}>
              <span className={`${styles.toolIcon} ${styles.imageIcon}`}>
                <ToolIcon name="image" />
              </span>
              <span>
                <strong>Work on an image</strong>
                <small>Enhance, resize, and compress</small>
              </span>
              <ToolIcon name="arrow" className={styles.cardArrow} />
            </Link>
            <Link href="/developer-tools" className={styles.destination}>
              <span className={`${styles.toolIcon} ${styles.codeIcon}`}>
                <ToolIcon name="code" />
              </span>
              <span>
                <strong>Build something better</strong>
                <small>Helpful tools for your next interface</small>
              </span>
              <ToolIcon name="arrow" className={styles.cardArrow} />
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          <strong>AyeCalc</strong>
          <span>Numbers, made human.</span>
        </p>
        <Link href="/contact">
          Found a broken link? Let us know <ToolIcon name="arrow" />
        </Link>
      </footer>
    </div>
  );
}
