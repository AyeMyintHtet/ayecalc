import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const siteUrl = "https://ayecalc.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AyeCalc — Free, Fast & Private Online Calculators",
    template: "%s | AyeCalc",
  },
  description:
    "Calculate loans, savings, percentages, health metrics, and more with AyeCalc. Free, accurate, private, and easy-to-use online calculators.",
  keywords: [
    "online calculator",
    "free calculator",
    "financial calculator",
    "loan calculator",
    "savings calculator",
    "percentage calculator",
  ],
  authors: [{ name: "AyeCalc", url: siteUrl }],
  creator: "AyeCalc",
  publisher: "AyeCalc",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "AyeCalc",
    title: "AyeCalc — Free, Fast & Private Online Calculators",
    description:
      "Accurate everyday calculators for your money, health, and daily life. No sign-up required.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AyeCalc online calculator dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AyeCalc — Calculate anything, clearly",
    description:
      "Free, accurate, and private calculators for everyday decisions.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071c17",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
