/**
 * Architecture boundary checks. Run with `pnpm check:boundaries`.
 *
 * Three layers, so the guard itself cannot silently rot:
 *   1. Repo check    : the real workspace obeys the rules (manifests, structure, imports).
 *   2. Self-test     : fixture workspaces that contain violations MUST be rejected.
 *   3. Lint canaries : in-memory snippets MUST trigger the ESLint boundary rules.
 *
 * The rules mirror docs/adr/0001-monorepo-and-sharing-boundaries.md.
 */
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── The approved architecture. Changing any of this requires an ADR. ─────────

const APPROVED_APPS = ["web"];
const APPROVED_PACKAGES = ["content", "tokens"];
const ALLOWED_EDGES = new Set([
  "@assembly/web -> @assembly/content",
  "@assembly/web -> @assembly/tokens",
]);
const EXPECTED_PACKAGE_EXPORTS = { ".": "./src/index.ts" };
const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];
const UI_LIKE_NAME = /^(ui|components?|design-system|primitives?|widgets?)$/i;
const IGNORED_DIRS = new Set(["node_modules", ".next", "out", "coverage", ".git"]);
const SOURCE_FILE = /\.(?:[cm]?[jt]sx?)$/;
const RELATIVE_IMPORT = /\b(?:from|import)\s*\(?\s*(['"])(\.{1,2}(?:\/[^'"]*)?)\1/g;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function listDirs(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter(
        (entry) =>
          entry.isDirectory() && !entry.name.startsWith(".") && !IGNORED_DIRS.has(entry.name),
      )
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    return { __error: `${path.relative(ROOT, file)}: ${error.message}` };
  }
}

const rel = (root, file) => path.relative(root, file).split(path.sep).join("/");

// ── Layer 1: workspace rules ─────────────────────────────────────────────────

export async function checkWorkspace(root) {
  const violations = [];

  const appDirs = await listDirs(path.join(root, "apps"));
  const packageDirs = await listDirs(path.join(root, "packages"));

  for (const dir of appDirs) {
    if (!APPROVED_APPS.includes(dir)) {
      violations.push(
        `Unapproved app "apps/${dir}". Approved apps: ${APPROVED_APPS.join(", ")}. Adding one needs an ADR.`,
      );
    }
  }
  for (const dir of packageDirs) {
    if (!APPROVED_PACKAGES.includes(dir)) {
      const extra = UI_LIKE_NAME.test(dir)
        ? " That would be a shared UI layer: share data, not presentation."
        : "";
      violations.push(
        `Unapproved package "packages/${dir}". Approved packages: ${APPROVED_PACKAGES.join(", ")}. Adding one needs an ADR.${extra}`,
      );
    }
  }
  for (const dir of APPROVED_APPS) {
    if (!appDirs.includes(dir)) violations.push(`Missing approved app "apps/${dir}".`);
  }
  for (const dir of APPROVED_PACKAGES) {
    if (!packageDirs.includes(dir)) violations.push(`Missing approved package "packages/${dir}".`);
  }

  const workspaces = [
    ...appDirs.map((dir) => ({ kind: "app", dir: path.join(root, "apps", dir), folder: dir })),
    ...packageDirs.map((dir) => ({
      kind: "package",
      dir: path.join(root, "packages", dir),
      folder: dir,
    })),
  ];

  for (const workspace of workspaces) {
    const where = `${workspace.kind === "app" ? "apps" : "packages"}/${workspace.folder}`;
    const manifest = await readJson(path.join(workspace.dir, "package.json"));
    if (manifest.__error) {
      violations.push(`Unreadable manifest: ${manifest.__error}`);
      continue;
    }

    const expectedName = `@assembly/${workspace.folder}`;
    if (manifest.name !== expectedName) {
      violations.push(
        `${where}/package.json: name must be "${expectedName}" (found "${manifest.name}").`,
      );
    }
    if (manifest.private !== true) {
      violations.push(`${where}/package.json: must be "private": true.`);
    }

    // Workspace-to-workspace edges must be on the allowlist and use workspace:*.
    for (const field of DEPENDENCY_FIELDS) {
      for (const [dep, spec] of Object.entries(manifest[field] ?? {})) {
        if (!dep.startsWith("@assembly/")) continue;
        const edge = `${manifest.name} -> ${dep}`;
        if (!ALLOWED_EDGES.has(edge)) {
          violations.push(
            `${where}/package.json: dependency edge "${edge}" is not allowed. Adding an edge needs an ADR.`,
          );
        } else if (spec !== "workspace:*") {
          violations.push(
            `${where}/package.json: "${dep}" must use "workspace:*" (found "${spec}").`,
          );
        }
      }
    }

    if (workspace.kind === "package") {
      if (manifest.type !== "module") {
        violations.push(`${where}/package.json: shared packages must be "type": "module".`);
      }
      if (JSON.stringify(manifest.exports) !== JSON.stringify(EXPECTED_PACKAGE_EXPORTS)) {
        violations.push(
          `${where}/package.json: "exports" must be exactly ${JSON.stringify(EXPECTED_PACKAGE_EXPORTS)} (single public entry, no deep imports).`,
        );
      }
      for (const field of DEPENDENCY_FIELDS) {
        const deps = Object.keys(manifest[field] ?? {});
        if (deps.length > 0) {
          violations.push(
            `${where}/package.json: shared packages must not declare "${field}" (found ${deps.join(", ")}). Packages are dependency-free, pure TypeScript.`,
          );
        }
      }
    }

    // Source-level structure: no JSX files in packages, no relative imports escaping the workspace.
    for await (const file of walk(workspace.dir)) {
      if (workspace.kind === "package" && /\.(?:tsx|jsx)$/.test(file)) {
        violations.push(
          `${rel(root, file)}: shared packages must not contain .tsx/.jsx files. That would be a shared UI layer.`,
        );
      }
      if (!SOURCE_FILE.test(file)) continue;
      const source = await readFile(file, "utf8");
      for (const match of source.matchAll(RELATIVE_IMPORT)) {
        const target = path.resolve(path.dirname(file), match[2]);
        const inside = target === workspace.dir || target.startsWith(workspace.dir + path.sep);
        if (!inside) {
          violations.push(`${rel(root, file)}: relative import "${match[2]}" escapes ${where}/.`);
        }
      }
    }
  }

  return violations;
}

// ── Layer 2: self-test against fixture workspaces ────────────────────────────

async function writeFixtureFile(root, file, content) {
  const full = path.join(root, file);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content);
}

function manifest(name, extra = {}) {
  return JSON.stringify({ name, version: "0.0.0", private: true, ...extra }, null, 2);
}

async function buildCleanFixture(root) {
  const pkg = (name) =>
    manifest(`@assembly/${name}`, { type: "module", exports: EXPECTED_PACKAGE_EXPORTS });
  await writeFixtureFile(
    root,
    "apps/web/package.json",
    manifest("@assembly/web", {
      dependencies: { "@assembly/content": "workspace:*", "@assembly/tokens": "workspace:*" },
    }),
  );
  await writeFixtureFile(
    root,
    "apps/web/src/page.ts",
    "import { site } from '@assembly/content';\nexport const s = site;\n",
  );
  await writeFixtureFile(root, "packages/content/package.json", pkg("content"));
  await writeFixtureFile(root, "packages/content/src/index.ts", "export const site = 1;\n");
  await writeFixtureFile(root, "packages/tokens/package.json", pkg("tokens"));
  await writeFixtureFile(root, "packages/tokens/src/index.ts", "export const color = 1;\n");
}

const SELF_TEST_CASES = [
  {
    name: "unapproved packages/ui (shared UI layer)",
    expect: /Unapproved package "packages\/ui".*shared UI layer/,
    mutate: (root) => writeFixtureFile(root, "packages/ui/package.json", manifest("@assembly/ui")),
  },
  {
    name: "unapproved package with a neutral name",
    expect: /Unapproved package "packages\/utils"/,
    mutate: (root) =>
      writeFixtureFile(root, "packages/utils/package.json", manifest("@assembly/utils")),
  },
  {
    name: "unapproved app",
    expect: /Unapproved app "apps\/mobile"/,
    mutate: (root) =>
      writeFixtureFile(root, "apps/mobile/package.json", manifest("@assembly/mobile")),
  },
  {
    name: ".tsx file inside a package",
    expect: /must not contain \.tsx\/\.jsx files/,
    mutate: (root) =>
      writeFixtureFile(root, "packages/content/src/Card.tsx", "export const a = 1;\n"),
  },
  {
    name: "content depends on tokens",
    expect: /edge "@assembly\/content -> @assembly\/tokens" is not allowed/,
    mutate: (root) =>
      writeFixtureFile(
        root,
        "packages/content/package.json",
        manifest("@assembly/content", {
          type: "module",
          exports: EXPECTED_PACKAGE_EXPORTS,
          dependencies: { "@assembly/tokens": "workspace:*" },
        }),
      ),
  },
  {
    name: "tokens depends on content",
    expect: /edge "@assembly\/tokens -> @assembly\/content" is not allowed/,
    mutate: (root) =>
      writeFixtureFile(
        root,
        "packages/tokens/package.json",
        manifest("@assembly/tokens", {
          type: "module",
          exports: EXPECTED_PACKAGE_EXPORTS,
          devDependencies: { "@assembly/content": "workspace:*" },
        }),
      ),
  },
  {
    name: "a package depends on an app",
    expect: /edge "@assembly\/content -> @assembly\/web" is not allowed/,
    mutate: (root) =>
      writeFixtureFile(
        root,
        "packages/content/package.json",
        manifest("@assembly/content", {
          type: "module",
          exports: EXPECTED_PACKAGE_EXPORTS,
          peerDependencies: { "@assembly/web": "workspace:*" },
        }),
      ),
  },
  {
    name: "a package declares react",
    expect: /must not declare "dependencies".*react/,
    mutate: (root) =>
      writeFixtureFile(
        root,
        "packages/tokens/package.json",
        manifest("@assembly/tokens", {
          type: "module",
          exports: EXPECTED_PACKAGE_EXPORTS,
          dependencies: { react: "^19.0.0" },
        }),
      ),
  },
  {
    name: "a package opens up deep imports via exports",
    expect: /"exports" must be exactly/,
    mutate: (root) =>
      writeFixtureFile(
        root,
        "packages/content/package.json",
        manifest("@assembly/content", {
          type: "module",
          exports: { ".": "./src/index.ts", "./internal": "./src/internal.ts" },
        }),
      ),
  },
  {
    name: "a package imports into an app via a relative path",
    expect: /relative import "\.\.\/\.\.\/\.\.\/apps\/web\/src\/page" escapes packages\/tokens\//,
    mutate: (root) =>
      writeFixtureFile(
        root,
        "packages/tokens/src/leak.ts",
        "import '../../../apps/web/src/page';\n",
      ),
  },
  {
    name: "an app uses a workspace dependency with a version range",
    expect: /must use "workspace:\*"/,
    mutate: (root) =>
      writeFixtureFile(
        root,
        "apps/web/package.json",
        manifest("@assembly/web", {
          dependencies: { "@assembly/content": "^1.0.0", "@assembly/tokens": "workspace:*" },
        }),
      ),
  },
  {
    name: "wrong package name",
    expect: /name must be "@assembly\/tokens"/,
    mutate: (root) =>
      writeFixtureFile(
        root,
        "packages/tokens/package.json",
        manifest("@assembly/design-tokens", { type: "module", exports: EXPECTED_PACKAGE_EXPORTS }),
      ),
  },
];

async function withFixture(callback) {
  const root = await mkdtemp(path.join(os.tmpdir(), "assembly-boundaries-"));
  try {
    await buildCleanFixture(root);
    return await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

export async function runSelfTest() {
  const failures = [];
  let passed = 0;

  const clean = await withFixture((root) => checkWorkspace(root));
  if (clean.length === 0) passed += 1;
  else failures.push(`clean fixture should pass but reported: ${clean.join(" | ")}`);

  for (const testCase of SELF_TEST_CASES) {
    const found = await withFixture(async (root) => {
      await testCase.mutate(root);
      return checkWorkspace(root);
    });
    if (found.some((message) => testCase.expect.test(message))) passed += 1;
    else
      failures.push(
        `violation NOT detected: ${testCase.name} (got: ${found.join(" | ") || "nothing"})`,
      );
  }

  return { total: SELF_TEST_CASES.length + 1, passed, failures };
}

// ── Layer 3: ESLint canaries ─────────────────────────────────────────────────

const RESTRICTED_RULES = new Set([
  "no-restricted-imports",
  "no-restricted-globals",
  "no-restricted-syntax",
  "no-console",
]);

const CANARIES = [
  // Packages must not use React / RN / Next / Tailwind / animation / Node / DOM.
  {
    name: "content imports react",
    file: "packages/content/src/canary.ts",
    code: "import 'react';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "content imports react/jsx-runtime",
    file: "packages/content/src/canary.ts",
    code: "import 'react/jsx-runtime';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "content imports react-dom",
    file: "packages/content/src/canary.ts",
    code: "import 'react-dom';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "tokens imports react-native",
    file: "packages/tokens/src/canary.ts",
    code: "import 'react-native';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "tokens imports react-native-svg",
    file: "packages/tokens/src/canary.ts",
    code: "import 'react-native-svg';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "tokens imports next/link",
    file: "packages/tokens/src/canary.ts",
    code: "import 'next/link';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "tokens imports next",
    file: "packages/tokens/src/canary.ts",
    code: "import 'next';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "tokens imports tailwindcss",
    file: "packages/tokens/src/canary.ts",
    code: "import 'tailwindcss';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "content imports gsap",
    file: "packages/content/src/canary.ts",
    code: "import 'gsap';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "content imports expo-router",
    file: "packages/content/src/canary.ts",
    code: "import 'expo-router';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "content imports node:fs",
    file: "packages/content/src/canary.ts",
    code: "import 'node:fs';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "content imports fs",
    file: "packages/content/src/canary.ts",
    code: "import 'fs';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "content imports fs/promises",
    file: "packages/content/src/canary.ts",
    code: "import 'fs/promises';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "content uses DOM global window",
    file: "packages/content/src/canary.ts",
    code: "export const w = window;\n",
    rule: "no-restricted-globals",
  },
  {
    name: "content uses DOM global document",
    file: "packages/content/src/canary.ts",
    code: "export const d = document;\n",
    rule: "no-restricted-globals",
  },
  {
    name: "tokens uses Node global process",
    file: "packages/tokens/src/canary.ts",
    code: "export const p = process;\n",
    rule: "no-restricted-globals",
  },
  {
    name: "tokens uses console",
    file: "packages/tokens/src/canary.ts",
    code: "console.log(1);\n",
    rule: "no-console",
  },
  // Packages never import apps.
  {
    name: "content imports an app by relative path",
    file: "packages/content/src/canary.ts",
    code: "import '../../../apps/web/src/app/page';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "tokens imports @assembly/web",
    file: "packages/tokens/src/canary.ts",
    code: "import '@assembly/web';\n",
    rule: "no-restricted-imports",
  },
  // content and tokens do not depend on each other.
  {
    name: "content imports tokens",
    file: "packages/content/src/canary.ts",
    code: "import '@assembly/tokens';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "tokens imports content",
    file: "packages/tokens/src/canary.ts",
    code: "import '@assembly/content';\n",
    rule: "no-restricted-imports",
  },
  // No JSX files in packages.
  {
    name: ".tsx file in content",
    file: "packages/content/src/Canary.tsx",
    code: "export const a = 1;\n",
    rule: "no-restricted-syntax",
  },
  {
    name: ".jsx file in tokens",
    file: "packages/tokens/src/Canary.jsx",
    code: "export const a = 1;\n",
    rule: "no-restricted-syntax",
  },
  // Apps use the public entry points only.
  {
    name: "web deep-imports content internals",
    file: "apps/web/src/app/canary.ts",
    code: "import '@assembly/content/src/data/projects';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "web deep-imports tokens internals",
    file: "apps/web/src/app/canary.ts",
    code: "import '@assembly/tokens/src/color';\n",
    rule: "no-restricted-imports",
  },
  {
    name: "web imports another app-style name",
    file: "apps/web/src/app/canary.ts",
    code: "import '@assembly/web/src/x';\n",
    rule: "no-restricted-imports",
  },
  // Positive controls: allowed code must NOT trip the boundary rules.
  {
    name: "CONTROL: web imports the public entries",
    file: "apps/web/src/app/canary.ts",
    code: "import { site } from '@assembly/content';\nimport { color } from '@assembly/tokens';\nexport const v = [site, color];\n",
    rule: null,
  },
  {
    name: "CONTROL: package uses relative + type imports",
    file: "packages/content/src/canary.ts",
    code: "import type { Site } from './types';\nexport type T = Site;\n",
    rule: null,
  },
];

export async function runCanaries() {
  const eslint = new ESLint({ cwd: ROOT });
  const failures = [];
  let passed = 0;

  for (const canary of CANARIES) {
    const [result] = await eslint.lintText(canary.code, { filePath: path.join(ROOT, canary.file) });
    const messages = result?.messages ?? [];
    const fatal = messages.find((message) => message.fatal);
    const ignored = messages.find(
      (message) => message.ruleId === null && /ignored/i.test(message.message),
    );

    if (fatal || ignored) {
      failures.push(`${canary.name}: could not be linted (${(fatal ?? ignored).message})`);
      continue;
    }

    const boundaryHits = messages.filter((message) => RESTRICTED_RULES.has(message.ruleId));
    if (canary.rule === null) {
      if (boundaryHits.length === 0) passed += 1;
      else
        failures.push(
          `${canary.name}: allowed code was wrongly rejected (${boundaryHits[0].message})`,
        );
    } else if (boundaryHits.some((message) => message.ruleId === canary.rule)) {
      passed += 1;
    } else {
      failures.push(`${canary.name}: expected ${canary.rule} to fire but it did not`);
    }
  }

  return { total: CANARIES.length, passed, failures };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  let failed = false;

  const violations = await checkWorkspace(ROOT);
  if (violations.length === 0) {
    console.log("✔ repo: workspace structure, manifests and imports obey the boundaries");
  } else {
    failed = true;
    console.error(`✘ repo: ${violations.length} violation(s)`);
    for (const violation of violations) console.error(`   - ${violation}`);
  }

  const selfTest = await runSelfTest();
  if (selfTest.failures.length === 0) {
    console.log(
      `✔ self-test: ${selfTest.passed}/${selfTest.total} fixture workspaces behaved correctly`,
    );
  } else {
    failed = true;
    console.error(`✘ self-test: ${selfTest.failures.length} problem(s)`);
    for (const failure of selfTest.failures) console.error(`   - ${failure}`);
  }

  const canaries = await runCanaries();
  if (canaries.failures.length === 0) {
    console.log(
      `✔ lint canaries: ${canaries.passed}/${canaries.total} ESLint boundary rules fire as intended`,
    );
  } else {
    failed = true;
    console.error(`✘ lint canaries: ${canaries.failures.length} problem(s)`);
    for (const failure of canaries.failures) console.error(`   - ${failure}`);
  }

  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
