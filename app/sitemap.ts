import type { MetadataRoute } from "next";
import { converterDefinitions } from "@/lib/converters";
import { developerTools } from "@/lib/developer-tools";
import { guides } from "@/lib/guides";
import { infoPages } from "@/lib/info-pages";
import { siteConfig } from "@/lib/metadata";

const lastModified = new Date("2026-08-17T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
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
      priority: tool.slug === "css-clamp-generator" ? 0.9 : 0.8,
    })),
    {
      url: `${siteConfig.url}/developer-tools`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/unit-converters`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/guides`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...guides.map((guide) => ({
      url: `${siteConfig.url}/guides/${guide.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    {
      url: `${siteConfig.url}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...infoPages.map((page) => ({
      url: `${siteConfig.url}/${page.slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: page.slug === "methodology" || page.slug === "about" ? 0.6 : 0.3,
    })),
  ];
}
