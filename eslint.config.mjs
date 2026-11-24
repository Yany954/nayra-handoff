import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const forbid = (group, message) => ({ group, message });

const frameworkPackages = [
  "react",
  "react/*",
  "react-dom",
  "react-dom/*",
  "next",
  "next/*",
  "firebase",
  "firebase/*",
  "firebase-admin",
  "firebase-admin/*",
];

const layerBoundaries = [
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            forbid(
              ["@/application/*", "@/infrastructure/*", "@/presentation/*", "@/app/*"],
              "domain cannot depend on outer layers.",
            ),
            forbid(
              [...frameworkPackages, "zod", "zod/*"],
              "domain must stay free of frameworks and validation libraries.",
            ),
          ],
        },
      ],
    },
  },
  {
    files: ["src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            forbid(
              ["@/infrastructure/*", "@/presentation/*", "@/app/*"],
              "application depends only on domain; receive repositories as arguments.",
            ),
            forbid(frameworkPackages, "application must stay framework-free."),
          ],
        },
      ],
    },
  },
  {
    files: ["src/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            forbid(
              ["@/presentation/*", "@/app/*"],
              "infrastructure cannot depend on the UI.",
            ),
          ],
        },
      ],
    },
  },
  {
    files: ["src/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            forbid(
              ["@/infrastructure/*", "firebase", "firebase/*", "firebase-admin", "firebase-admin/*"],
              "components receive data as props; routes in src/app wire the container.",
            ),
          ],
        },
      ],
    },
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...layerBoundaries,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design handoff is reference material, not source.
    "design/**",
  ]),
]);

export default eslintConfig;
