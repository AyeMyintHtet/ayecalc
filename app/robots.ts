import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://ayecalc.com/sitemap.xml",
    host: "https://ayecalc.com",
  };
}
