import type { MetadataRoute } from "next";
import { converterDefinitions } from "@/lib/converters";
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
  ];
}
