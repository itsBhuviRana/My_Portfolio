# ADR 0001: Monorepo and sharing boundaries

- **Status:** Accepted
- **Date:** 2026-09-19
- **Scope:** Repository structure, package manager, and what is shared between apps.

## Context

ASSEMBLY is a premium personal portfolio. The primary product is a web site with heavy, art-directed
presentation (scroll choreography, SVG diagrams, device stages). A React Native (Expo) app is a likely
future addition. Both would present the same facts: projects, experience, skills, and the same design
values. The presentation code, however, has almost nothing in common: the web uses the DOM, CSS grid and
GSAP, while native uses `View`, `Pressable` and Reanimated.

We want the facts and values to have a single source of truth without forcing the two presentation layers
into a lowest-common-denominator design.

## Decision

### 1. A monorepo

One repository holds the web app, the shared packages, and (later) the mobile app.

- Shared data and tokens can be versioned and changed atomically with their consumers.
- There is no publishing, no version drift, and no copy-paste between repositories.
- Retrofitting a monorepo later means moving files and rewriting imports, CI and deploy paths. Starting with
  a minimal skeleton is cheap and forces a clean data boundary now.

**Honest caveat:** for a web-only site this would be unjustified overhead. The decision is conditional on the
mobile app and on the data boundary being valuable in its own right. If the mobile app never happens, the
cost is small and bounded (two packages and one config file).

### 2. pnpm workspaces

- Strict, isolated dependency resolution surfaces missing or undeclared dependencies early.
- Expo supports isolated installs and monorepos since SDK 54, with a documented fallback if they misbehave.
- The workspace protocol (`workspace:*`) refuses to resolve to anything but the local package.
- Dependency build scripts are blocked by default, which is a supply-chain benefit (`allowBuilds` records
  every exception with a reason).

The pnpm version is pinned exactly (`devEngines.packageManager`). Corepack is not required.

### 3. No Turborepo (yet)

Turborepo adds task caching and a task graph. With two source-only packages there are no package builds to
order, and the whole pipeline runs in minutes. It would add a config file and a dependency for seconds saved.

Adopt it when **any** of these becomes true: CI regularly exceeds about 5 minutes; a second app has its own
build; a shared package gains a build step that must run before its consumers.

### 4. No shared UI package

There is no `packages/ui`, and the tooling rejects one. A shared `Button` or `Card` would either constrain
the web (which needs semantic HTML, CSS grid, GSAP hooks and SVG) or the native app (`Pressable`, native
navigation). Components that look identical are cheap to duplicate; components that must diverge should not
be forced together. If two consumers ever prove an identical component, share a **contract** (prop types)
first, and implementations second, with a new ADR.

### 5. Shared data, types and tokens

| Shared                                                    | Package             |
| --------------------------------------------------------- | ------------------- |
| Types, projects, experience, skills, socials, site        | `@assembly/content` |
| Colour, spacing, radius and motion values (unitless data) | `@assembly/tokens`  |

Later: layered artwork and a pose manifest in `@assembly/avatar` (artwork only, never components).

Shared packages are **pure TypeScript**: dependency-free, with no React, React Native, Next.js, Tailwind, DOM,
Node APIs or JSX. That also avoids the classic monorepo problem of two copies of React. Each package exposes a
single entry point, so deep imports are impossible.

### 6. Platform-specific presentation

Each app owns its components, layout, routing, navigation and animation runtime. Tailwind stays web-only; a
generator will later turn token data into CSS. Native will consume the same token objects directly.

React Native Web is **not** used for the portfolio. React Native layout is flexbox-only, and the editorial
layouts need CSS grid, sticky positioning, clip-paths and direct DOM access for GSAP and semantic HTML.

## Enforcement

The boundaries are checked by tooling, so they cannot erode silently:

- ESLint import, global and syntax rules (`eslint.config.mjs`).
- TypeScript configuration: shared packages get no DOM and no Node types.
- `scripts/check-boundaries.mjs`: an allowlist of apps, packages and dependency edges; manifest rules; no
  `.tsx`/`.jsx` files in packages; relative imports must stay inside their workspace. It carries its own
  self-test (fixtures containing violations must be rejected) and ESLint canaries.
- `check:boundaries` is part of `pnpm check`, and CI requires it.

Allowed edges: `apps/web -> @assembly/content` and `apps/web -> @assembly/tokens`. Everything else, including
`content <-> tokens`, needs a new ADR.

## Toolchain pins (2026-09-19)

Chosen for stability, and each has a reason to revisit:

- **pnpm 11.26.0.** pnpm 12 (a rewrite) shipped weeks ago. Upgrade later.
- **TypeScript 6.0.x.** TypeScript 7 exists, but typescript-eslint does not yet support it.
- **ESLint 9.39.x.** ESLint 10 exists, but the plugins bundled in `eslint-config-next` declare peer support only
  up to ESLint 9. The registry marks 9.39.5 as deprecated ("no longer supported"), so plan to move to
  ESLint 10 as soon as those plugins declare support.
- **Vitest 4.1.x.** Vitest 5 was released 2026-09-03.
- **Node 24.** Node 26 becomes LTS in October 2026. Revisit once Next, Expo and pnpm list support.

## Consequences

- One repository and one lockfile. Changes to shared data and their consumers land in a single PR.
- A little extra ceremony for adding a package or edge: an ADR and an allowlist change. This is deliberate.
- Sharing stops at data. Duplicated presentation code between web and native is accepted.
- The unbuilt mobile app leaves some overhead in place until it exists.

## Alternatives considered

- **Web-only, single app with a `data/` folder.** Simplest today, but a later mobile app means a retrofit.
- **Separate repositories.** No tooling, but shared content would need publishing or copying, and drift is
  guaranteed.
- **Nx.** Powerful, but oriented to multiple teams and many app types. Too much for a solo repository.
- **Turborepo now.** See decision 3.
- **A shared UI package or React Native Web everywhere.** See decisions 4 and 6.
