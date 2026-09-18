import type { MetadataRoute } from "next";
import { converterDefinitions } from "../lib/converters.ts";
import { developerTools } from "../lib/developer-tools.ts";
import { guides } from "../lib/guides.ts";
import { infoPages } from "../lib/info-pages.ts";
import { defaultContentLastModified, siteConfig } from "../lib/metadata.ts";

const fallbackLastModified = new Date(defaultContentLastModified);

const staticPages: Array<{
  path: string;
  lastModified: Date;
}> = [
  {
    path: "",
    lastModified: new Date("2026-09-18T00:00:00.000Z"),
  },
  { path: "/image-tools", lastModified: new Date("2026-09-18T00:00:00.000Z") },
  {
    path: "/loan-calculator",
    lastModified: new Date("2026-09-18T00:00:00.000Z"),
  },
  {
    path: "/developer-tools",
    lastModified: new Date("2026-09-18T00:00:00.000Z"),
  },
  {
    path: "/unit-converters",
    lastModified: new Date("2026-08-18T00:00:00.000Z"),
  },
  {
    path: "/guides",
    lastModified: new Date("2026-09-18T00:00:00.000Z"),
  },
  {
    path: "/contact",
    lastModified: new Date("2026-08-17T00:00:00.000Z"),
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPages.map((page) => ({
      url: `${siteConfig.url}${page.path}`,
      lastModified: page.lastModified,
    })),
    ...converterDefinitions.map((converter) => ({
      url: `${siteConfig.url}/${converter.slug}`,
      lastModified: converter.lastModified
        ? new Date(converter.lastModified)
        : fallbackLastModified,
    })),
    ...developerTools.map((tool) => ({
      url: `${siteConfig.url}/${tool.slug}`,
      lastModified: tool.lastModified
        ? new Date(tool.lastModified)
        : fallbackLastModified,
    })),
    ...guides.map((guide) => ({
      url: `${siteConfig.url}/guides/${guide.slug}`,
      lastModified: new Date(guide.lastModified),
    })),
    ...infoPages.map((page) => ({
      url: `${siteConfig.url}/${page.slug}`,
      lastModified: new Date(page.lastModified),
    })),
  ];
}
