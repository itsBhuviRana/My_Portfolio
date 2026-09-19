/**
 * Content model for ASSEMBLY. Pure data types, shared by every consumer
 * (web today; mobile, résumé and PDF generators later).
 *
 * Media is referenced by logical `id` and resolved to real files per platform.
 * Nothing in this package knows about files, URLs of assets, React or the DOM.
 */

/** Only `published` entries may ever reach production. Use the selectors. */
export type PublishStatus = "draft" | "published";

/** `YYYY-MM`, for example `2024-03`. Validated by the integrity tests. */
export type YearMonth = string;

export interface Period {
  readonly start: YearMonth;
  /** Absent means ongoing. */
  readonly end?: YearMonth;
}

// ── Site ──────────────────────────────────────────────────────────────────

export type AvailabilityStatus = "open" | "limited" | "closed";

export interface Availability {
  readonly status: AvailabilityStatus;
  readonly note?: string;
}

export interface Site {
  readonly name: string;
  readonly role: string;
  readonly headline: string;
  readonly summary: {
    readonly short: string;
    readonly long: string;
  };
  readonly location?: string;
  readonly availability?: Availability;
}

// ── Social links ──────────────────────────────────────────────────────────

export type SocialId = "github" | "linkedin" | "email" | "website";

export interface SocialLink {
  readonly id: SocialId;
  readonly label: string;
  /** `https:` or `mailto:` only. */
  readonly url: string;
}

// ── Media (resolved per platform by `id`) ─────────────────────────────────

export type Media =
  | {
      readonly kind: "image";
      readonly id: string;
      readonly alt: string;
      readonly width: number;
      readonly height: number;
    }
  | {
      readonly kind: "video";
      readonly id: string;
      readonly posterId: string;
      readonly description: string;
    }
  | {
      readonly kind: "diagram";
      readonly id: string;
      readonly description: string;
    };

// ── Skills ────────────────────────────────────────────────────────────────

export type SkillId = string;

export type SkillLevel = "daily" | "comfortable" | "familiar";

export interface Skill {
  readonly id: SkillId;
  readonly label: string;
  readonly level?: SkillLevel;
}

/** Provisional taxonomy, mirroring the layers of the exploded-view concept. */
export type SkillLayerId =
  "interface" | "components" | "state" | "native" | "delivery" | "leadership";

export interface SkillGroup {
  readonly id: SkillLayerId;
  readonly label: string;
  readonly skills: readonly Skill[];
}

// ── Case studies (structured blocks, not MDX) ─────────────────────────────

export type CaseStudyBlock =
  | { readonly type: "heading"; readonly text: string }
  | { readonly type: "paragraph"; readonly text: string }
  | {
      readonly type: "decision";
      readonly context: string;
      readonly decision: string;
      readonly tradeoffs: string;
    }
  | { readonly type: "metric"; readonly label: string; readonly value: string }
  | { readonly type: "media"; readonly media: Media };

export interface CaseStudy {
  readonly blocks: readonly CaseStudyBlock[];
}

// ── Projects ──────────────────────────────────────────────────────────────

export type ProjectCategory = "mobile" | "web" | "architecture";

export interface Metric {
  readonly label: string;
  readonly value: string;
}

export interface ProjectLinks {
  readonly live?: string;
  readonly repo?: string;
  readonly store?: string;
}

export interface Project {
  readonly slug: string;
  readonly title: string;
  readonly oneLiner: string;
  readonly category: ProjectCategory;
  readonly role: string;
  /** Required for published projects (enforced by the integrity tests). */
  readonly period?: Period;
  readonly stack: readonly SkillId[];
  readonly outcome: string;
  readonly metrics: readonly Metric[];
  readonly media: readonly Media[];
  readonly links: ProjectLinks;
  readonly featured: boolean;
  readonly status: PublishStatus;
  readonly caseStudy?: CaseStudy;
}

// ── Experience ────────────────────────────────────────────────────────────

export interface Leadership {
  readonly teamSize?: number;
  readonly scope: string;
}

export interface Experience {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  /** Required for published entries (enforced by the integrity tests). */
  readonly period?: Period;
  readonly location?: string;
  readonly summary: string;
  readonly impact: readonly string[];
  readonly leadership?: Leadership;
  readonly stack: readonly SkillId[];
  readonly status: PublishStatus;
}
