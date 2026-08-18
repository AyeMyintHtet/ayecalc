import type { MetadataRoute } from "next";
import { converterDefinitions } from "@/lib/converters";
import { developerTools } from "@/lib/developer-tools";
import { guides } from "@/lib/guides";
import { infoPages } from "@/lib/info-pages";
import { siteConfig } from "@/lib/metadata";

const lastModified = new Date("2026-08-18T00:00:00.000Z");

const highPriorityDeveloperTools = new Set([
  "css-clamp-generator",
  "background-remover",
  "image-resizer",
  "image-compressor",
  "image-cropper",
  "image-format-converter",
]);

const staticPages: Array<{
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/developer-tools", changeFrequency: "weekly", priority: 0.9 },
  { path: "/unit-converters", changeFrequency: "weekly", priority: 0.9 },
  { path: "/guides", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPages.map((page) => ({
      url: `${siteConfig.url}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...converterDefinitions.map((converter) => ({
      url: `${siteConfig.url}/${converter.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: converter.slug === "px-to-rem" ? 0.9 : 0.8,
    })),
    ...developerTools.map((tool) => ({
      url: `${siteConfig.url}/${tool.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: highPriorityDeveloperTools.has(tool.slug) ? 0.9 : 0.8,
    })),
    ...guides.map((guide) => ({
      url: `${siteConfig.url}/guides/${guide.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...infoPages.map((page) => ({
      url: `${siteConfig.url}/${page.slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: page.slug === "methodology" || page.slug === "about" ? 0.6 : 0.3,
    })),
  ];
}
