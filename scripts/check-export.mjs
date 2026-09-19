/**
 * Static export sanity check. Run with `pnpm check:export` after `pnpm build`.
 *
 * Verifies that apps/web/out is deployable to GitHub Pages:
 *   - the expected entry files exist (index.html, 404.html, _next/)
 *   - every root-relative href/src honours BASE_PATH and points at a file that exists
 *   - Phase 1 invariants hold (one <main>, an <h1>, noindex, a theme-color from tokens)
 *   - no draft placeholder text leaked into the output
 *
 * Usage: BASE_PATH=/my-repo node scripts/check-export.mjs [outDir]
 * Build with the SAME BASE_PATH you check with.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.resolve(ROOT, process.argv[2] ?? "apps/web/out");
const basePath = (process.env.BASE_PATH ?? "").trim();
const DRAFT_MARKER = "[[DRAFT]]";
const TEXT_FILE = /\.(?:html|js|css|txt|json|xml|map)$/;

const problems = [];
const fail = (message) => problems.push(message);

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const rel = (file) => path.relative(outDir, file).split(path.sep).join("/");

async function resolves(urlPath) {
  const clean = urlPath.split("#")[0].split("?")[0];
  const target = path.join(outDir, decodeURIComponent(clean));
  if (clean.endsWith("/")) return exists(path.join(target, "index.html"));
  if (await exists(target))
    return !(await stat(target)).isDirectory() || exists(path.join(target, "index.html"));
  return exists(`${target}.html`);
}

async function main() {
  if (basePath && (!basePath.startsWith("/") || basePath.endsWith("/"))) {
    fail(`BASE_PATH "${basePath}" is invalid: it must start with "/" and not end with "/".`);
  }

  if (!(await exists(outDir))) {
    console.error(`✘ ${path.relative(ROOT, outDir)} does not exist. Run "pnpm build" first.`);
    process.exit(1);
  }

  for (const required of ["index.html", "404.html", "_next"]) {
    if (!(await exists(path.join(outDir, required)))) fail(`missing required output: ${required}`);
  }

  let htmlCount = 0;
  let assetRefCount = 0;
  let prefixedRefCount = 0;
  let filesScanned = 0;

  for await (const file of walk(outDir)) {
    if (!TEXT_FILE.test(file)) continue;
    filesScanned += 1;
    const content = await readFile(file, "utf8");

    if (content.includes(DRAFT_MARKER)) {
      fail(`${rel(file)}: contains draft placeholder text "${DRAFT_MARKER}"`);
    }
    if (!file.endsWith(".html")) continue;
    htmlCount += 1;

    for (const match of content.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = match[1];
      if (!url.startsWith("/") || url.startsWith("//")) continue; // relative, absolute, or protocol-relative
      assetRefCount += 1;

      let local = url;
      if (basePath) {
        if (url !== basePath && !url.startsWith(`${basePath}/`)) {
          fail(
            `${rel(file)}: root-relative URL "${url}" is missing the BASE_PATH prefix "${basePath}"`,
          );
          continue;
        }
        local = url.slice(basePath.length) || "/";
        prefixedRefCount += 1;
      } else if (url.includes("/_next/") && !url.startsWith("/_next/")) {
        fail(
          `${rel(file)}: "${url}" has a prefix before /_next/ but BASE_PATH is empty (stale build?)`,
        );
        continue;
      }

      if (!(await resolves(local)))
        fail(`${rel(file)}: "${url}" points to a file that is not in the export`);
    }
  }

  if (assetRefCount === 0)
    fail("no root-relative asset references found in any HTML file (unexpected)");

  const index = await readFile(path.join(outDir, "index.html"), "utf8").catch(() => "");
  if (index) {
    if ((index.match(/<main[\s>]/g) ?? []).length !== 1)
      fail("index.html: expected exactly one <main>");
    if (!/<h1[\s>]/.test(index)) fail("index.html: expected an <h1>");
    if (!/<meta name="robots" content="[^"]*noindex/.test(index))
      fail("index.html: missing robots noindex (foundation build must not be indexed)");
    if (!/<meta name="theme-color" content="#[0-9a-f]{6}"/.test(index))
      fail("index.html: missing theme-color meta (token consumption)");
  }

  const label = basePath ? `BASE_PATH="${basePath}"` : "no BASE_PATH";
  if (problems.length > 0) {
    console.error(`✘ static export check failed (${label}): ${problems.length} problem(s)`);
    for (const problem of problems) console.error(`   - ${problem}`);
    process.exit(1);
  }
  console.log(
    `✔ static export OK (${label}): ${htmlCount} HTML file(s), ${filesScanned} text file(s) scanned, ` +
      `${assetRefCount} root-relative reference(s)${basePath ? `, ${prefixedRefCount} prefixed` : ""}`,
  );
}

await main();
