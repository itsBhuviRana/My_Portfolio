# ASSEMBLY

> A developer's world taken apart layer by layer, so you can see how it's built and who builds it.

ASSEMBLY is the personal developer portfolio of Bhuvneshwar Rana: a React Native and React developer and
Application Module Development Lead. The concept is an exploded-view engineering illustration: layered
product views, precise callouts, and a cartoon character as a recurring narrator.

## Status

**Phase 4A: Global Shell + Hero.** Phase 1 (monorepo, tooling, typed content,
boundary enforcement, deployment) and Phase 2 (brand and assets, see `docs/brand/`) are complete. This
repository now also has the approved Vellum & Layers tokens, a small typography scale (Archivo and
JetBrains Mono), and a handful of CSS primitives (technical labels, rules, grids, layer surfaces, device
and title-block styling). The site now has a real global shell (header, footer) and the first Hero, an
exploded-view phone. The main sections (Layers, Work, Release notes, Engineering thinking, About, Contact),
the character and all animation are still to come. The Work section shows the current role and the Dijkastra
product profile, and the contact links are live.

## Repository structure

```text
assembly/
├─ apps/
│  └─ web/               Next.js (App Router), static export, Tailwind CSS v4. The website.
│                        src/components/ (site shell, hero) and src/lib/nav.ts (navigation data).
├─ packages/
│  ├─ content/           @assembly/content: typed portfolio data. Pure TypeScript.
│  └─ tokens/            @assembly/tokens:  design tokens as data. Pure TypeScript.
├─ scripts/
│  ├─ check-boundaries.mjs   Architecture boundary checks (with self-test and lint canaries).
│  ├─ check-export.mjs       Static export sanity checks (GitHub Pages readiness).
│  └─ generate.mjs           Writes apps/web/src/generated/ from the tokens and the approved brand SVGs.
├─ docs/
│  ├─ adr/               Architecture decision records.
│  ├─ brand/             Brand guide, character bible, asset register, approved brand SVGs (source/).
│  └─ content/           Content checklist and project intake.
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

| Command                 | What it does                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `pnpm install`          | Install all workspace dependencies.                                                 |
| `pnpm dev`              | Start the web app in development (Turbopack).                                       |
| `pnpm build`            | Static production build. Output: `apps/web/out/`.                                   |
| `pnpm lint`             | ESLint for the whole repo (includes the boundary rules).                            |
| `pnpm typecheck`        | `tsc --noEmit` in every project.                                                    |
| `pnpm test`             | Vitest in every package that has tests.                                             |
| `pnpm format`           | Format everything with Prettier.                                                    |
| `pnpm format:check`     | Check formatting without writing.                                                   |
| `pnpm generate`         | Regenerate `apps/web/src/generated/` (theme CSS and brand SVG components).          |
| `pnpm check:generated`  | Fail if the generated files are out of date.                                        |
| `pnpm check:boundaries` | Verify the architecture boundaries, and that the guards themselves work.            |
| `pnpm check:export`     | Validate `apps/web/out/` after a build (run it with the same `BASE_PATH`).          |
| `pnpm check`            | `format:check`, `lint`, `typecheck`, `test`, `check:boundaries`, `check:generated`. |

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

## Design foundations

Tokens are the single source of truth: `packages/tokens/src/*.ts` (colour, layers, radius, spacing, shape,
typography, motion). `pnpm generate` turns them into `apps/web/src/generated/tokens.css`, which
`apps/web/src/app/globals.css` imports into Tailwind v4. Nothing is written by hand twice.

- **Palette, radii, shadows, easings** become Tailwind theme values (`bg-vellum`, `text-ink`,
  `rounded-md`, `shadow-cut-md`). The default Tailwind palette and radii are removed, so only approved
  values exist.
- **Type scale** becomes `type-display-1`, `type-display-2`, `type-h1` to `type-h3`, `type-body-lg`,
  `type-body`, `type-small` and `type-label`. Fonts are loaded in `layout.tsx` with `next/font/google`
  (self-hosted at build time, Latin subset, only Archivo preloaded).
- **Layers** become `layer-<id>` (fill, its one readable text colour, ink outline) and `hatch-<id>` (a
  hatch strip). Layer identity is never colour alone: number, text label and hatch go with it. Put hatch on
  a strip, never behind text.
- **Primitives** (`apps/web/src/app/foundations.css`): `tech-label`, `rule-decor`, `rule-info`, `rule-ink`,
  `grid-8`, `grid-iso`, `surface`, `device-frame`, `device-screen`, `title-block`, plus a two-tone focus
  ring and a reduced-motion base rule.
- **Brand marks**: the approved SVGs in `docs/brand/source/` are turned into server components
  (`Wordmark`, `WordmarkReversed`, `Monogram`, `MonogramReversed`) in
  `apps/web/src/generated/brand-marks.tsx`. Minimum sizes: wordmark 192 px wide, monogram 32 px.

Do not edit anything in `apps/web/src/generated/`. Change the source and run `pnpm generate`.

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

The current role is an `Experience` entry with no `period.end`. It can carry the product it is spent on
(`project`: facts, architecture, sync flow, technologies grouped by layer) and the person's
`responsibilities`, kept separate on purpose. Read them with `getCurrentExperience()` and
`getPublishedExperience()`. Leave out anything that was not supplied: the tests reject invented dates,
digits in the product facts, and claim words such as "led", "owned" or "architected".

The Work section also shows a career atlas: `atlasProjects` (each has a tier of `featured`, `index` or
`register`, a one-to-two sentence `summary`, an optional cautious `domain`, and otherwise only the fields that
were confirmed) and `capabilityGroups` (cross-project capabilities, never attached to a project).
`getAtlasSummary()` derives every count on the page. To add a project, add it to
`packages/content/src/data/atlas.ts` with only what you know, and update the counts in the tests.

The Featured Projects grid is a small interactive field: one project (whichever `Experience.project` links
to, today Dijkastra) renders as a full-width anchor band, the rest as a quad beneath it. `<details name="...">`
gives native, scriptless exclusive selection (opening one closes any other), `:has()` dims the rest of the
field while one is open, and `AtlasField` (`components/work/atlas-field.tsx`) is the one small client
component in the section: it uses `IntersectionObserver` to settle the field into place once scrolled into
view, defaulting to fully visible so nothing breaks with JavaScript off.

On the page, featured and non-featured entries open on demand with a native `<details>` disclosure: the
closed state is the compact signal (name, context, domain, platform, primary technology for featured cards;
name, years, domain, platform for register rows), and every confirmed fact still appears once opened. This
needs no script and no dependency, and it is fully keyboard- and screen-reader-operable.

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
