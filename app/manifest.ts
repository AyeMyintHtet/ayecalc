import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AyeCalc — Free Online Tools",
    short_name: "AyeCalc",
    description:
      "Free calculators, unit converters, image utilities, developer tools, and practical guides.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffefa",
    theme_color: "#071c17",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
