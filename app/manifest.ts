import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AyeCalc — Free Online Calculators",
    short_name: "AyeCalc",
    description: "Fast, free, and private calculators for everyday decisions.",
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
