import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});
const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "coverage/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Local File/Blob previews need native image decoding and object URLs.
  {
    files: [
      "components/*image*.tsx",
      "components/background-remover.tsx",
      "components/heic-converter.tsx",
      "components/content-credentials-inspector.tsx",
    ],
    rules: { "@next/next/no-img-element": "off" },
  },
];
export default config;
