"use client";

import { useEffect, useState } from "react";
import styles from "@/components/scroll-to-top.module.css";

const SHOW_AFTER_PX = 560;

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > SHOW_AFTER_PX);

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      aria-hidden={!isVisible}
      aria-label="Back to top"
      className={`${styles.button} ${isVisible ? styles.visible : ""}`}
      onClick={scrollToTop}
      tabIndex={isVisible ? 0 : -1}
      title="Back to top"
      type="button"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m6.5 14.5 5.5-5 5.5 5" />
      </svg>
    </button>
  );
}
