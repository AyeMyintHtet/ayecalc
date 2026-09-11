import type { ReactNode } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import styles from "@/app/content.module.css";

export function ContentFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <Link className={styles.brand} href="/" aria-label="AyeCalc home">
            <span className={styles.brandMark} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>AyeCalc</span>
          </Link>
          <p>Numbers, made human.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/methodology">Methodology</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/advertising-disclosure">Advertising</Link>
        </nav>
        <p>© {new Date().getFullYear()} AyeCalc. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function ContentPage({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>{children}</main>
      <ContentFooter />
    </>
  );
}
