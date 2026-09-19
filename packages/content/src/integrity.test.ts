import { describe, expect, it } from "vitest";
import { DRAFT_MARKER } from "./draft";
import {
  experience,
  getProjectBySlug,
  getPublishedProjects,
  projects,
  site,
  skillGroups,
  socials,
} from "./index";
import type { Experience, Media, Period, Project } from "./index";

// ── Rules (functions, so they can be tested against synthetic cases too) ────

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const SAFE_URL = /^(https:\/\/\S+|mailto:\S+)$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const isYearMonth = (value: string): boolean => YEAR_MONTH.test(value);
const isSafeUrl = (value: string): boolean => SAFE_URL.test(value);
const isSlug = (value: string): boolean => SLUG.test(value);
const isBlank = (value: string): boolean => value.trim() === "";

function containsDraftMarker(value: unknown): boolean {
  if (typeof value === "string") return value.includes(DRAFT_MARKER);
  if (Array.isArray(value)) return value.some(containsDraftMarker);
  if (value !== null && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(containsDraftMarker);
  }
  return false;
}

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function periodProblems(period: Period | undefined): string[] {
  if (period === undefined) return ["period is missing"];
  const problems: string[] = [];
  if (!isYearMonth(period.start)) problems.push(`invalid period.start "${period.start}"`);
  if (period.end !== undefined) {
    if (!isYearMonth(period.end)) problems.push(`invalid period.end "${period.end}"`);
    else if (period.end < period.start) problems.push("period.end is before period.start");
  }
  return problems;
}

function mediaProblems(media: Media): string[] {
  if (isBlank(media.id)) return ["media id is blank"];
  switch (media.kind) {
    case "image":
      return isBlank(media.alt) ? [`image "${media.id}" has no alt text`] : [];
    case "video":
    case "diagram":
      return isBlank(media.description) ? [`${media.kind} "${media.id}" has no description`] : [];
  }
}

/** Everything a project must satisfy before it may be published. */
function publishedProjectProblems(project: Project): string[] {
  const problems: string[] = [];
  if (containsDraftMarker(project)) problems.push("contains the draft marker");
  for (const field of ["title", "oneLiner", "role", "outcome"] as const) {
    if (isBlank(project[field])) problems.push(`${field} is blank`);
  }
  problems.push(...periodProblems(project.period));
  for (const media of project.media) problems.push(...mediaProblems(media));
  return problems;
}

/** Everything an experience entry must satisfy before it may be published. */
function publishedExperienceProblems(entry: Experience): string[] {
  const problems: string[] = [];
  if (containsDraftMarker(entry)) problems.push("contains the draft marker");
  for (const field of ["company", "role", "summary"] as const) {
    if (isBlank(entry[field])) problems.push(`${field} is blank`);
  }
  problems.push(...periodProblems(entry.period));
  return problems;
}

// ── The rules themselves behave correctly (guards against vacuous passes) ────

describe("integrity rules (synthetic cases)", () => {
  it("validates YYYY-MM dates", () => {
    expect(isYearMonth("2024-03")).toBe(true);
    for (const bad of ["2024-13", "2024-00", "2024-3", "24-03", "2024/03", ""]) {
      expect(isYearMonth(bad)).toBe(false);
    }
  });

  it("accepts only https and mailto URLs", () => {
    expect(isSafeUrl("https://example.com/a")).toBe(true);
    expect(isSafeUrl("mailto:someone@example.com")).toBe(true);
    for (const bad of [
      "http://example.com",
      "javascript:alert(1)",
      "data:text/html,x",
      "//x.com",
    ]) {
      expect(isSafeUrl(bad)).toBe(false);
    }
  });

  it("validates slugs", () => {
    expect(isSlug("my-project-2")).toBe(true);
    for (const bad of ["My-Project", "my_project", "-x", "x-", "a--b", ""]) {
      expect(isSlug(bad)).toBe(false);
    }
  });

  it("finds the draft marker at any depth", () => {
    expect(containsDraftMarker({ a: [{ b: `x ${DRAFT_MARKER}` }] })).toBe(true);
    expect(containsDraftMarker({ a: [{ b: "clean" }], c: 1, d: null })).toBe(false);
  });

  it("finds duplicates", () => {
    expect(findDuplicates(["a", "b", "a", "c", "b"]).sort()).toEqual(["a", "b"]);
    expect(findDuplicates(["a", "b"])).toEqual([]);
  });

  it("rejects an end date before the start date", () => {
    expect(periodProblems({ start: "2024-05", end: "2024-04" })).not.toEqual([]);
    expect(periodProblems({ start: "2024-05" })).toEqual([]);
    expect(periodProblems(undefined)).not.toEqual([]);
  });

  it("requires alt text or descriptions on media", () => {
    expect(mediaProblems({ kind: "image", id: "a", alt: "", width: 1, height: 1 })).not.toEqual([]);
    expect(mediaProblems({ kind: "image", id: "a", alt: "A screen", width: 1, height: 1 })).toEqual(
      [],
    );
    expect(mediaProblems({ kind: "video", id: "v", posterId: "p", description: " " })).not.toEqual(
      [],
    );
  });

  it("refuses to publish a draft-marked or incomplete project", () => {
    const complete: Project = {
      slug: "real-project",
      title: "Real",
      oneLiner: "A real one-liner",
      category: "web",
      role: "Lead",
      period: { start: "2024-01" },
      stack: [],
      outcome: "Shipped",
      metrics: [],
      media: [],
      links: {},
      featured: false,
      status: "published",
    };
    expect(publishedProjectProblems(complete)).toEqual([]);
    expect(publishedProjectProblems({ ...complete, title: `${DRAFT_MARKER} Real` })).not.toEqual(
      [],
    );
    expect(publishedProjectProblems({ ...complete, period: undefined })).not.toEqual([]);
    expect(publishedProjectProblems({ ...complete, outcome: "" })).not.toEqual([]);
  });

  it("refuses to publish a draft-marked or incomplete experience entry", () => {
    const complete: Experience = {
      id: "e",
      company: "Acme",
      role: "Lead",
      period: { start: "2022-01" },
      summary: "Did things",
      impact: [],
      stack: [],
      status: "published",
    };
    expect(publishedExperienceProblems(complete)).toEqual([]);
    expect(
      publishedExperienceProblems({ ...complete, company: `${DRAFT_MARKER} Acme` }),
    ).not.toEqual([]);
    expect(publishedExperienceProblems({ ...complete, period: undefined })).not.toEqual([]);
  });
});

// ── The real content ─────────────────────────────────────────────────────────

describe("site", () => {
  it("has real, non-blank identity fields and no draft marker", () => {
    for (const value of [site.name, site.role, site.headline, site.summary.short]) {
      expect(isBlank(value)).toBe(false);
    }
    expect(containsDraftMarker(site)).toBe(false);
  });
});

describe("identifiers", () => {
  it("has unique project slugs, in slug format", () => {
    const slugs = projects.map((project) => project.slug);
    expect(findDuplicates(slugs)).toEqual([]);
    expect(slugs.filter((slug) => !isSlug(slug))).toEqual([]);
  });

  it("has unique experience ids", () => {
    expect(findDuplicates(experience.map((entry) => entry.id))).toEqual([]);
  });

  it("has unique skill ids and unique group ids", () => {
    const skillIds = skillGroups.flatMap((group) => group.skills.map((skill) => skill.id));
    expect(findDuplicates(skillIds)).toEqual([]);
    expect(findDuplicates(skillGroups.map((group) => group.id))).toEqual([]);
  });

  it("has unique social ids", () => {
    expect(findDuplicates(socials.map((link) => link.id))).toEqual([]);
  });

  it("only references skill ids that exist", () => {
    const known = new Set(skillGroups.flatMap((group) => group.skills.map((skill) => skill.id)));
    const referenced = [
      ...projects.flatMap((project) => project.stack),
      ...experience.flatMap((entry) => entry.stack),
    ];
    expect(referenced.filter((id) => !known.has(id))).toEqual([]);
  });
});

describe("formats", () => {
  it("has valid dates wherever a period is present", () => {
    const periods = [...projects, ...experience].flatMap((entry) =>
      entry.period === undefined ? [] : [entry.period],
    );
    for (const period of periods) expect(periodProblems(period)).toEqual([]);
  });

  it("uses only https or mailto URLs", () => {
    const urls = [
      ...socials.map((link) => link.url),
      ...projects.flatMap((project) =>
        [project.links.live, project.links.repo, project.links.store].filter(
          (url): url is string => url !== undefined,
        ),
      ),
    ];
    expect(urls.filter((url) => !isSafeUrl(url))).toEqual([]);
  });
});

describe("draft safety", () => {
  it("marks every draft entry with the draft marker", () => {
    for (const entry of [...projects, ...experience]) {
      if (entry.status === "draft") expect(containsDraftMarker(entry)).toBe(true);
    }
  });

  it("lets a published entry through only when it is complete and marker-free", () => {
    for (const project of projects) {
      if (project.status === "published") expect(publishedProjectProblems(project)).toEqual([]);
    }
    for (const entry of experience) {
      if (entry.status === "published") expect(publishedExperienceProblems(entry)).toEqual([]);
    }
  });

  it("never returns a draft from the published selectors", () => {
    const published = getPublishedProjects();
    expect(published.every((project) => project.status === "published")).toBe(true);
    expect(containsDraftMarker(published)).toBe(false);
    for (const project of projects) {
      if (project.status === "draft") expect(getProjectBySlug(project.slug)).toBeUndefined();
    }
  });
});
