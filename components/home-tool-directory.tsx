"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ToolIcon, { type ToolIconName } from "@/components/tool-icon";
import styles from "@/app/home.module.css";

export type HomeTool = {
  href: string;
  title: string;
  description: string;
  category: "Images" | "Converters" | "Developer" | "Calculators";
  icon: ToolIconName;
  keywords: string;
  featured?: boolean;
};

const filters = [
  "Featured",
  "All tools",
  "Images",
  "Converters",
  "Developer",
  "Calculators",
] as const;
type Filter = (typeof filters)[number];

export default function HomeToolDirectory({ tools }: { tools: HomeTool[] }) {
  const [filter, setFilter] = useState<Filter>("Featured");
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matchesFilter = (tool: HomeTool, category: Filter) =>
    category === "All tools" ||
    (category === "Featured" ? tool.featured : tool.category === category);
  const visibleTools = tools.filter((tool) => {
    const text =
      `${tool.title} ${tool.description} ${tool.keywords} ${tool.category}`.toLowerCase();
    return (
      matchesFilter(tool, filter) && words.every((word) => text.includes(word))
    );
  });

  function resetSearch() {
    setQuery("");
    setFilter("All tools");
    searchInput.current?.focus();
  }

  return (
    <section
      className={styles.directory}
      id="tools"
      aria-labelledby="tools-title"
    >
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.eyebrow}>The toolbox</span>
          <h2 id="tools-title">A shortcut for your to-do list.</h2>
          <p>Find the right tool. Get your answer. Keep going.</p>
        </div>
        <form
          className={styles.search}
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="tool-search" className={styles.srOnly}>
            Search AyeCalc tools
          </label>
          <ToolIcon name="search" />
          <input
            ref={searchInput}
            id="tool-search"
            type="search"
            placeholder="Search tools, e.g. image resizer"
            value={query}
            autoComplete="off"
            aria-controls="tool-results"
            onChange={(event) => {
              setQuery(event.target.value);
              setFilter("All tools");
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchInput.current?.focus();
              }}
              aria-label="Clear search"
            >
              <ToolIcon name="close" />
            </button>
          )}
        </form>
      </div>
      <div
        className={styles.filters}
        role="group"
        aria-label="Filter tools by category"
      >
        {filters.map((category) => (
          <button
            type="button"
            key={category}
            aria-pressed={filter === category}
            aria-controls="tool-results"
            className={filter === category ? styles.activeFilter : undefined}
            onClick={() => setFilter(category)}
          >
            {category}
            <span>
              {tools.filter((tool) => matchesFilter(tool, category)).length}
            </span>
          </button>
        ))}
      </div>
      <p className={styles.resultsCount} role="status" aria-atomic="true">
        {words.length
          ? `${visibleTools.length} ${visibleTools.length === 1 ? "tool" : "tools"} found for “${query.trim()}”`
          : filter === "Featured"
            ? "A few useful places to start"
            : `${visibleTools.length} ${filter === "All tools" ? "tools, ready when you are" : `${filter.toLowerCase()} tools`}`}
      </p>
      <div className={styles.toolGrid} id="tool-results">
        {visibleTools.map((tool) => (
          <Link
            className={styles.toolCard}
            key={tool.href}
            href={tool.href}
            prefetch={false}
          >
            <span className={styles.toolIcon} data-category={tool.category}>
              <ToolIcon name={tool.icon} />
            </span>
            <div className={styles.toolContent}>
              <span className={styles.toolCategory}>{tool.category}</span>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
            </div>
            <ToolIcon name="arrow" className={styles.toolArrow} />
          </Link>
        ))}
      </div>
      {visibleTools.length === 0 && (
        <div className={styles.emptyState}>
          <ToolIcon name="search" />
          <h3>No tools found just yet.</h3>
          <p>Try a shorter search like “image”, “CSS”, or “convert”.</p>
          <button type="button" onClick={resetSearch}>
            Show all tools <ToolIcon name="arrow" />
          </button>
        </div>
      )}
      {filter === "Featured" && !words.length && (
        <div className={styles.directoryBottom}>
          <span>One handy place. Plenty of possibilities.</span>
          <button type="button" onClick={resetSearch}>
            Browse all {tools.length} tools <ToolIcon name="arrow" />
          </button>
        </div>
      )}
      <noscript>
        <p className={styles.noScript}>
          Browse the complete <Link href="/image-tools">image tools</Link>,{" "}
          <Link href="/developer-tools">developer tools</Link>, or{" "}
          <Link href="/unit-converters">unit converters</Link>. Live search
          needs JavaScript.
        </p>
      </noscript>
    </section>
  );
}
