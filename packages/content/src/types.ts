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
  /** Total professional experience in whole years, as supplied by the owner. */
  readonly yearsOfExperience?: number;
}

// ── Social links ──────────────────────────────────────────────────────────

export type SocialId = "github" | "linkedin" | "email" | "whatsapp" | "website";

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

/** One thing the person is responsible for in a role. Keep it to what was actually supplied. */
export interface Responsibility {
  readonly title: string;
  readonly detail: string;
}

/**
 * A group of technologies used in a project, shown as one layer of the exploded view. This says the
 * technologies were used in the project. It is not a claim that each one was personally owned.
 */
export interface TechnologyGroup {
  readonly id: string;
  /** The frozen layer the group is drawn on. Absent when the group cuts across the layers. */
  readonly layer?: SkillLayerId;
  readonly label: string;
  readonly technologies: readonly string[];
}

export interface ProjectArchitecture {
  readonly name: string;
  readonly summary: string;
  /** Ordered from the smallest building block to the largest. */
  readonly levels: readonly string[];
}

/** How local data reaches the backend: an ordered list of nodes and a one-line note. */
export interface SyncFlow {
  readonly nodes: readonly { readonly label: string; readonly detail: string }[];
  readonly note: string;
}

/**
 * The product a role was spent on. Facts about the product only: what the person did on it lives in
 * `Experience.responsibilities`. Anything not supplied is left out, never guessed.
 */
export interface ExperienceProject {
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  /** The organisation or programme the project relates to. */
  readonly context: string;
  readonly platform: string;
  readonly users: string;
  readonly characteristics: readonly string[];
  readonly architecture: ProjectArchitecture;
  readonly syncFlow: SyncFlow;
  readonly technologyGroups: readonly TechnologyGroup[];
  /** Impact is not supplied yet, so this holds an editorial placeholder rather than a claim. */
  readonly outcome: string;
}

export interface Experience {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  /** Required for published entries. An entry with no `period.end` is the current role. */
  readonly period?: Period;
  readonly location?: string;
  readonly summary: string;
  readonly impact: readonly string[];
  readonly leadership?: Leadership;
  readonly responsibilities?: readonly Responsibility[];
  /** Detailed profile of the product this role is spent on. */
  readonly project?: ExperienceProject;
  /** Ids of the atlas projects worked on in this role. */
  readonly projectIds?: readonly string[];
  readonly stack: readonly SkillId[];
  readonly status: PublishStatus;
}

// ── Project atlas ─────────────────────────────────────────────────────────

export type ProjectPlatform = "mobile" | "web";

/**
 * How much the page says about a project. This is a presentation strategy, not a judgement of the project:
 * `featured` projects get a detailed sheet, `index` (standard) projects get a domain, a summary and any
 * confirmed facts, and `register` projects get a general engineering summary because only their name,
 * company and platform are known.
 */
export type AtlasTier = "featured" | "index" | "register";

/** Periods are approximate years. `to` is "present" for work that is still going on. */
export interface ApproximateYears {
  readonly from: number;
  readonly to: number | "present";
}

/**
 * One project in the career atlas. Every optional field is present only when it was confirmed.
 * Nothing is inferred: a project with no `product` has no product on the page.
 */
export interface AtlasProject {
  readonly id: string;
  readonly name: string;
  /** The company or context as supplied. It is not a statement about employment unless it is Telus Digital. */
  readonly company: string;
  readonly platform: ProjectPlatform;
  readonly tier: AtlasTier;
  /**
   * One or two sentences. Where product details are not confirmed this is a general engineering description
   * built from the confirmed work patterns (feature development, API integration, reusable components). It
   * never names a product feature, a client, a technology or a number that was not confirmed for the project.
   */
  readonly summary: string;
  /** The domain, kept cautious. See `domainFromName`. */
  readonly domain?: string;
  /** True when the domain is indicated only by the project name and is not otherwise confirmed. */
  readonly domainFromName?: true;
  readonly years?: ApproximateYears;
  /** The client or context the project relates to, where confirmed. */
  readonly client?: string;
  /** An enterprise client the project belongs to, where the resume supports it. */
  readonly enterpriseClient?: string;
  readonly framework?: string;
  readonly product?: string;
  /** What the person did on the project. */
  readonly personalWork?: readonly string[];
  /** Work or characteristics of the project itself. Not automatically the person's own work. */
  readonly notableWork?: readonly string[];
  /** Technologies confirmed for this project. Not the full stack unless the list says so. */
  readonly technologies?: readonly string[];
}

/**
 * A group of engineering capabilities from across the career. It does not say that every item was used on
 * every project, and it never names a project.
 */
export interface CapabilityGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly string[];
}

export interface AtlasCompanySummary {
  readonly name: string;
  readonly total: number;
  readonly mobile: number;
  readonly web: number;
  readonly freelance: boolean;
}

export interface AtlasSummary {
  readonly total: number;
  /** Companies, not counting freelance work. */
  readonly organisations: number;
  readonly freelanceProjects: number;
  readonly platforms: { readonly mobile: number; readonly web: number };
  readonly tiers: Readonly<Record<AtlasTier, number>>;
  readonly enterprise: { readonly projects: number; readonly clients: readonly string[] };
  /** Domains across the atlas. `fromName` holds those indicated only by a project name. */
  readonly domains: { readonly confirmed: readonly string[]; readonly fromName: readonly string[] };
  /** In the order they first appear in the atlas. Not chronological: earlier employers have no dates. */
  readonly companies: readonly AtlasCompanySummary[];
}
