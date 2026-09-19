/**
 * Single root ESLint config (ESLint 9, flat config). Run once from the repo root: `eslint .`
 *
 * Boundary rules live here. IMPORTANT: for a given rule, a later matching block REPLACES an
 * earlier one's options. Keep `no-restricted-imports` scopes disjoint (packages vs apps), or
 * let a more specific block restate everything, as the per-package blocks below do.
 * scripts/check-boundaries.mjs proves these rules fire; keep the two in sync.
 */
import { builtinModules } from "node:module";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import globals from "globals";
import tseslint from "typescript-eslint";

// ── Shared packages: platform-neutral, no React / DOM / Node / apps ──────────

const PACKAGE_RULE =
  "Shared packages must stay platform-neutral: pure TypeScript with no React, React Native, " +
  "Next.js, Tailwind, animation libraries, DOM or Node APIs. Share data, not presentation.";

const forbiddenBareModules = [
  "react",
  "react-dom",
  "react-native",
  "next",
  "expo",
  "gsap",
  "motion",
  "tailwindcss",
  ...builtinModules.filter((name) => !name.startsWith("_")),
];

const forbiddenModulePatterns = [
  "react/**",
  "react-dom/**",
  "react-native/**",
  "react-native-*",
  "react-native-*/**",
  "next/**",
  "expo/**",
  "expo-*",
  "expo-*/**",
  "gsap/**",
  "motion/**",
  "tailwindcss/**",
  "@tailwindcss/**",
  "node:*",
];

/** Options for `no-restricted-imports` inside a shared package. */
function packageImportRule(extraGroups = [], extraMessage = "") {
  return [
    "error",
    {
      paths: forbiddenBareModules.map((name) => ({ name, message: PACKAGE_RULE })),
      patterns: [
        { group: forbiddenModulePatterns, message: PACKAGE_RULE },
        {
          group: ["**/apps/**", "@assembly/web", "@assembly/web/**"],
          message: "Packages must never import from apps.",
        },
        ...(extraGroups.length > 0
          ? [{ group: extraGroups, message: extraMessage || "Import direction not allowed." }]
          : []),
      ],
    },
  ];
}

const packageGlobalsRule = [
  "error",
  ...["window", "document", "navigator", "localStorage", "sessionStorage", "location", "history"]
    .map((name) => ({ name, message: `DOM global "${name}" is not allowed in shared packages.` }))
    .concat(
      ["process", "Buffer", "require", "__dirname", "__filename"].map((name) => ({
        name,
        message: `Node global "${name}" is not allowed in shared packages.`,
      })),
    ),
];

// ── Apps: public package entry points only ───────────────────────────────────

const appImportRule = [
  "error",
  {
    patterns: [
      {
        group: ["@assembly/*/**"],
        message:
          'Import workspace packages only through their public entry (for example "@assembly/content"), never their internals.',
      },
      {
        group: ["@assembly/web", "@assembly/web/**"],
        message: "Apps must not import from other apps.",
      },
    ],
  },
];

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/coverage/**",
    "**/next-env.d.ts",
  ]),

  // Repo scripts and root config: plain Node ESM.
  {
    files: ["scripts/**/*.mjs", "eslint.config.mjs"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },

  // Shared packages (baseline for every package).
  {
    files: ["packages/**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      eqeqeq: "error",
      "no-console": "error",
      "no-restricted-imports": packageImportRule(),
      "no-restricted-globals": packageGlobalsRule,
    },
  },

  // Per-package import direction. These restate the full rule (see note at the top).
  {
    files: ["packages/content/**/*.ts"],
    rules: {
      "no-restricted-imports": packageImportRule(
        ["@assembly/tokens", "@assembly/tokens/**"],
        "content must not depend on tokens. Adding a package-to-package edge needs an ADR.",
      ),
    },
  },
  {
    files: ["packages/tokens/**/*.ts"],
    rules: {
      "no-restricted-imports": packageImportRule(
        ["@assembly/content", "@assembly/content/**"],
        "tokens must not depend on content. Adding a package-to-package edge needs an ADR.",
      ),
    },
  },

  // Shared packages must never contain JSX files: that would be a shared UI layer.
  {
    files: ["packages/**/*.{tsx,jsx}"],
    extends: [tseslint.configs.recommended],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program",
          message:
            "Shared packages must not contain .tsx/.jsx files. That would be a shared UI layer: share data, not presentation.",
        },
      ],
    },
  },

  // The web app.
  {
    files: ["apps/web/**/*.{js,jsx,mjs,ts,tsx}"],
    extends: [nextVitals, nextTs],
    // `react.version` is pinned to the major so the plugin never has to resolve `react` from the
    // repo root (where it is not installed). Keep it equal to the React major in apps/web.
    settings: { next: { rootDir: "apps/web/" }, react: { version: "19" } },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      eqeqeq: "error",
      "no-restricted-imports": appImportRule,
    },
  },
]);
