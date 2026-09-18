import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import sitemap from "../app/sitemap.ts";
import robots from "../app/robots.ts";
import { siteConfig } from "../lib/metadata.ts";
import {
  developerTools,
  createDeveloperToolMetadata,
} from "../lib/developer-tools.ts";
import { converterDefinitions } from "../lib/converters.ts";
import { guides, createGuideMetadata } from "../lib/guides.ts";
import { infoPages } from "../lib/info-pages.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const entries = sitemap();
const paths = new Set(entries.map(({ url }) => new URL(url).pathname));
const converterPaths = new Set(
  converterDefinitions.map(({ slug }) => `/${slug}`),
);
const guidePaths = new Set(guides.map(({ slug }) => `/guides/${slug}`));

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

test("sitemap contains unique canonical routes backed by actual pages", () => {
  assert.equal(new Set(entries.map(({ url }) => url)).size, entries.length);
  for (const entry of entries) {
    const url = new URL(entry.url);
    assert.equal(url.origin, siteConfig.url);
    assert.equal(url.search + url.hash, "");
    assert.ok(
      entry.lastModified &&
        Number.isFinite(new Date(entry.lastModified).getTime()),
    );
    const page = join(root, "app", url.pathname, "page.tsx");
    assert.ok(
      existsSync(page) ||
        converterPaths.has(url.pathname) ||
        guidePaths.has(url.pathname),
      `Missing route: ${url.pathname}`,
    );
  }
  for (const page of files(join(root, "app")).filter(
    (path) => path.endsWith("/page.tsx") && !path.includes("["),
  )) {
    const path = "/" + relative(join(root, "app"), dirname(page));
    assert.ok(paths.has(path), `Published page absent from sitemap: ${path}`);
  }
  for (const path of [
    "/ai-image-upscaler",
    "/image-tools",
    "/loan-calculator",
    "/guides/ai-upscaling-vs-resizing",
  ])
    assert.ok(paths.has(path));
  assert.equal(robots().sitemap, `${siteConfig.url}/sitemap.xml`);
});

test("tool and guide metadata use unique titles, descriptions, and matching canonicals", () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const { metadata, path } of [
    ...developerTools.map((tool) => ({
      metadata: createDeveloperToolMetadata(tool),
      path: `/${tool.slug}`,
    })),
    ...guides.map((guide) => ({
      metadata: createGuideMetadata(guide),
      path: `/guides/${guide.slug}`,
    })),
  ]) {
    assert.equal(metadata.alternates?.canonical, `${siteConfig.url}${path}`);
    assert.equal(metadata.openGraph?.url, `${siteConfig.url}${path}`);
    assert.equal(typeof metadata.title, "string");
    assert.ok(metadata.description);
    const title = metadata.title as string;
    const description = metadata.description!;
    assert.ok(!titles.has(title), `Duplicate title: ${title}`);
    assert.ok(!descriptions.has(description), `Duplicate description: ${path}`);
    titles.add(title);
    descriptions.add(description);
  }
});

test("literal internal page links and content references resolve to published routes", () => {
  function checkLink(href: string, context: string) {
    if (!href.startsWith("/") || href.startsWith("//")) return;
    const path = href.split(/[?#]/)[0] || "/";
    assert.ok(
      paths.has(path) || existsSync(join(root, "public", path)),
      `Broken internal link ${href} in ${context}`,
    );
  }
  for (const file of ["app", "components", "lib"]
    .flatMap((directory) => files(join(root, directory)))
    .filter((path) => /\.tsx?$/.test(path))) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    function visit(node: ts.Node) {
      if (ts.isJsxAttribute(node) && node.name.getText(source) === "href") {
        const value = node.initializer;
        if (value && ts.isStringLiteral(value)) checkLink(value.text, file);
        if (
          value &&
          ts.isJsxExpression(value) &&
          value.expression &&
          ts.isStringLiteral(value.expression)
        )
          checkLink(value.expression.text, file);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  function visitContent(value: unknown) {
    if (Array.isArray(value)) value.forEach(visitContent);
    else if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) {
        if (key === "href" && typeof item === "string")
          checkLink(item, "content registry");
        else visitContent(item);
      }
    }
  }
  visitContent([developerTools, guides, infoPages]);
  const toolSlugs = new Set(
    [...developerTools, ...converterDefinitions].map(({ slug }) => slug),
  );
  for (const guide of guides)
    for (const slug of guide.relatedToolSlugs)
      assert.ok(toolSlugs.has(slug), `Unknown related tool: ${slug}`);
});
