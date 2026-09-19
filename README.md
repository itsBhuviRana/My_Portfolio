# ASSEMBLY

> A developer's world taken apart layer by layer, so you can see how it's built and who builds it.

ASSEMBLY is the personal developer portfolio of Bhuvneshwar Rana: a React Native and React developer and
Application Module Development Lead. The concept is an exploded-view engineering illustration: layered
product views, precise callouts, and a cartoon character as a recurring narrator.

## Status

**Phase 1: Foundation.** This repository currently contains the monorepo foundation only: tooling,
typed content, design tokens, a minimal static page, boundary enforcement and the deployment pipeline.
The visual portfolio, brand assets and avatar come in later phases. The text on the page today is
temporary foundation content.

## Repository structure

```text
assembly/
├─ apps/
│  └─ web/               Next.js (App Router), static export, Tailwind CSS v4. The website.
├─ packages/
│  ├─ content/           @assembly/content: typed portfolio data. Pure TypeScript.
│  └─ tokens/            @assembly/tokens:  design tokens as data. Pure TypeScript.
├─ scripts/
│  ├─ check-boundaries.mjs   Architecture boundary checks (with self-test and lint canaries).
│  └─ check-export.mjs       Static export sanity checks (GitHub Pages readiness).
├─ docs/adr/             Architecture decision records.
└─ .github/              CI/CD workflow and Dependabot config.
```

Planned but **not** created yet: `apps/mobile` (Expo) and `packages/avatar` (layered artwork and manifest).

## Prerequisites

- **Node 24.** `.nvmrc` pins it. With nvm: `nvm install 24 && nvm use`.
- **pnpm 11.26.0.** The exact version is pinned in `package.json` (`devEngines.packageManager`) and pnpm
  enforces it. Install once with `npm install -g pnpm@11.26.0`.

Corepack is not required.

## Setup

```bash
nvm use            # picks Node 24 from .nvmrc
pnpm install       # installs the whole workspace
pnpm check         # sanity check: format, lint, types, tests, boundaries
pnpm dev           # http://localhost:3000
```

## Commands

Run everything from the repository root.

| Command                 | What it does                                                               |
| ----------------------- | -------------------------------------------------------------------------- |
| `pnpm install`          | Install all workspace dependencies.                                        |
| `pnpm dev`              | Start the web app in development (Turbopack).                              |
| `pnpm build`            | Static production build. Output: `apps/web/out/`.                          |
| `pnpm lint`             | ESLint for the whole repo (includes the boundary rules).                   |
| `pnpm typecheck`        | `tsc --noEmit` in every project.                                           |
| `pnpm test`             | Vitest in every package that has tests.                                    |
| `pnpm format`           | Format everything with Prettier.                                           |
| `pnpm format:check`     | Check formatting without writing.                                          |
| `pnpm check:boundaries` | Verify the architecture boundaries, and that the guards themselves work.   |
| `pnpm check:export`     | Validate `apps/web/out/` after a build (run it with the same `BASE_PATH`). |
| `pnpm check`            | `format:check`, `lint`, `typecheck`, `test`, `check:boundaries`.           |

Package-specific examples: `pnpm --filter @assembly/web dev`, `pnpm --filter @assembly/content test`.

## Package boundaries

The rule is: **share data, not presentation.**

| Shared (packages)                    | Not shared (stays in each app)              |
| ------------------------------------ | ------------------------------------------- |
| Types                                | UI components (buttons, cards, layouts)     |
| Project, experience, skills, socials | Navigation and routing                      |
| Design tokens (raw values)           | Web animation runtime (GSAP, ScrollTrigger) |
| Motion values (as numbers)           | Native animation runtime                    |

Allowed dependency edges:

```text
apps/web ──▶ @assembly/content
apps/web ──▶ @assembly/tokens

packages ──✗ apps                content ✗ tokens
packages ──✗ React / React Native / Next.js / DOM / Node APIs / JSX / .tsx
```

These are enforced, not just documented:

- **ESLint** (`eslint.config.mjs`) rejects forbidden imports, DOM and Node globals, JSX, and deep imports
  such as `@assembly/content/src/...`.
- **TypeScript** gives packages no DOM and no Node types, so using those APIs fails typechecking.
- **`scripts/check-boundaries.mjs`** checks the manifests, the list of allowed packages (a new
  `packages/ui` is rejected), and that relative imports never leave their workspace. It also proves the
  guards work by feeding them fixtures that contain violations.
- Each package exposes a **single entry point** through `exports`, so deep imports cannot resolve.

Adding a package, an app, or a dependency edge means updating the allowlists in
`scripts/check-boundaries.mjs` **and** recording an ADR.

## Adding content

All portfolio content lives in `packages/content/src/data/`. Components never hard-code copy.

1. Edit or add an entry in the relevant file (`projects.ts`, `experience.ts`, `skills.ts`, `socials.ts`, `site.ts`).
2. Types are in `packages/content/src/types.ts`. TypeScript tells you what is missing.
3. New entries start as `status: 'draft'`. Placeholder text must contain the draft marker (see
   `src/draft.ts`).
4. Set `status: 'published'` only when the entry is real and complete. The integrity tests then require
   a valid period, non-blank fields, alt text on images, and **no draft marker**.
5. Consume content through the selectors (`getPublishedProjects()`, `getProjectBySlug()`), never the raw
   `projects` array, so drafts cannot reach production.
6. Run `pnpm check`.

Media is referenced by logical `id` and resolved to real files per platform later. No real assets exist
in Phase 1.

## Deployment

The site is a **static Next.js export** deployed to **GitHub Pages** by GitHub Actions
(`.github/workflows/ci.yml`).

```text
pull request ─▶ verify (install, check, build, validate export)
push to main ─▶ verify ─▶ build-pages ─▶ deploy
                            │              └─ actions/deploy-pages  (environment: github-pages)
                            ├─ actions/configure-pages  → base_path
                            ├─ pnpm build with BASE_PATH=<base_path>
                            └─ actions/upload-pages-artifact (apps/web/out)
```

- **`BASE_PATH`** is the only deployment setting. It is empty for a custom domain or a
  `<user>.github.io` site, and `/<repo>` for a GitHub Pages project site. CI derives it automatically, so
  no repository name is hard-coded anywhere.
- **Custom domain (later):** set it in Settings → Pages, add the DNS records, enforce HTTPS. `BASE_PATH`
  becomes empty with no code change.
- **Foundation builds are not indexable:** the page sets `noindex` until the real site launches.

### One-time repository setup (manual)

1. Create the GitHub repository (public) and push.
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Branches: protect `main` and require the **Verify** check.
4. Enable secret scanning with push protection, and Dependabot alerts.

## Decisions

See [`docs/adr/`](docs/adr/). Start with
[ADR 0001: monorepo and sharing boundaries](docs/adr/0001-monorepo-and-sharing-boundaries.md).
