import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Generated files: Payload owns their contents.
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "next-env.d.ts",
    "migrations/**",
    "payload-types.ts",
    "app/(payload)/admin/importMap.js",
  ]),
]);
