import type { Metadata } from "next";

export const siteConfig = {
  name: "AyeCalc",
  url: "https://ayecalc.com",
  defaultTitle: "AyeCalc — Free Online Calculators, Converters & Tools",
  defaultDescription:
    "Use free calculators, unit converters, CSS developer tools, image tools, and practical guides with visible methods and browser-based processing.",
} as const;

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}`;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  image = "/opengraph-image",
  imageAlt = `${title} on AyeCalc`,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = new URL(path, siteConfig.url).toString();
  const socialTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
  };
}
