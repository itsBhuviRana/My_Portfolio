import { describe, expect, it } from "vitest";
import { DRAFT_MARKER } from "./draft";
import {
  atlasProjects,
  capabilityGroups,
  careerRange,
  experience,
  getAtlasSummary,
  getCurrentExperience,
  getProjectBySlug,
  getPublishedExperience,
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

/** Wording that claims more than was supplied. Responsibilities and project facts must not use it. */
const INFLATED_CLAIM =
  /\b(architect(?:ed|s)?|owned|led|scaled|managed|delivered|launched|spearheaded)\b/i;

function projectProblems(project: NonNullable<Experience["project"]>): string[] {
  const problems: string[] = [];
  for (const field of [
    "name",
    "tagline",
    "description",
    "context",
    "platform",
    "users",
    "outcome",
  ] as const) {
    if (isBlank(project[field])) problems.push(`project.${field} is blank`);
  }
  if (project.characteristics.length === 0) problems.push("project has no characteristics");
  if (project.characteristics.some(isBlank)) problems.push("a project characteristic is blank");
  if (project.architecture.levels.length === 0) problems.push("architecture has no levels");
  if (project.syncFlow.nodes.length < 2) problems.push("sync flow needs at least two nodes");
  if (project.technologyGroups.length === 0) problems.push("project has no technology groups");
  problems.push(
    ...findDuplicates(project.technologyGroups.map((group) => group.id)).map(
      (id) => `duplicate technology group "${id}"`,
    ),
  );
  for (const group of project.technologyGroups) {
    if (isBlank(group.label) || group.technologies.length === 0)
      problems.push(`group "${group.id}" is incomplete`);
    if (group.technologies.some(isBlank))
      problems.push(`group "${group.id}" has a blank technology`);
    for (const duplicate of findDuplicates(group.technologies)) {
      problems.push(`group "${group.id}" repeats "${duplicate}"`);
    }
  }
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
  for (const item of entry.responsibilities ?? []) {
    if (isBlank(item.title) || isBlank(item.detail)) problems.push("a responsibility is blank");
  }
  if (entry.project !== undefined) problems.push(...projectProblems(entry.project));
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

describe("current experience", () => {
  it("has exactly one current role, and it is Telus Digital", () => {
    const current = getPublishedExperience().filter((entry) => entry.period?.end === undefined);
    expect(current).toHaveLength(1);
    expect(getCurrentExperience()?.company).toBe("Telus Digital");
    expect(getCurrentExperience()?.role).toBe("Application Module Development Lead");
    expect(getCurrentExperience()?.period).toEqual({ start: "2025-11" });
  });

  it("never presents a historical employer as current", () => {
    const historical = experience.filter((entry) => /bugendai/i.test(entry.company));
    for (const entry of historical) expect(entry.period?.end).toBeDefined();
    expect(getCurrentExperience()?.company).not.toMatch(/bugendai/i);
  });

  it("returns published experience newest first, and never a draft", () => {
    const published = getPublishedExperience();
    expect(published.every((entry) => entry.status === "published")).toBe(true);
    const starts = published.map((entry) => entry.period?.start ?? "");
    expect(starts).toEqual([...starts].sort().reverse());
  });
});

describe("Discastra profile", () => {
  const current = getCurrentExperience();
  const project = current?.project;

  it("is complete", () => {
    expect(project).toBeDefined();
    expect(publishedExperienceProblems(current!)).toEqual([]);
  });

  it("uses only frozen layer ids, and leaves the cross-cutting group without a layer", () => {
    const layers = new Set([
      "interface",
      "components",
      "state",
      "native",
      "delivery",
      "leadership",
    ]);
    for (const group of project!.technologyGroups) {
      if (group.layer !== undefined) expect(layers.has(group.layer)).toBe(true);
    }
    expect(project!.technologyGroups.find((group) => group.id === "maps")?.layer).toBeUndefined();
  });

  it("gives every layer at most one group, so layer identity stays unambiguous", () => {
    const layerIds = project!.technologyGroups.flatMap((group) =>
      group.layer === undefined ? [] : [group.layer],
    );
    expect(findDuplicates(layerIds)).toEqual([]);
  });

  it("keeps the supplied facts and adds no numbers or dates it was not given", () => {
    expect(project!.name).toBe("Discastra");
    expect(project!.context).toBe("Talis Agriculture");
    expect(project!.platform).toBe("React Native + Expo · iOS · Android");
    const facts = JSON.stringify([project!.description, project!.tagline, current!.summary]);
    expect(facts).not.toMatch(/\d/);
  });

  it("does not use wording that claims more than was supplied", () => {
    const prose = [
      current!.summary,
      project!.description,
      project!.architecture.summary,
      project!.syncFlow.note,
      ...(current!.responsibilities ?? []).flatMap((item) => [item.title, item.detail]),
    ];
    expect(prose.filter((text) => INFLATED_CLAIM.test(text))).toEqual([]);
  });

  it("states no impact until one can be sourced", () => {
    expect(current!.impact).toEqual([]);
    expect(current!.leadership).toBeUndefined();
    expect(project!.outcome).toBe("Project details coming soon.");
  });

  it("only references skill ids that exist", () => {
    const known = new Set(skillGroups.flatMap((group) => group.skills.map((skill) => skill.id)));
    expect(current!.stack.filter((id) => !known.has(id))).toEqual([]);
  });
});

describe("social links", () => {
  it("has the supplied email, GitHub and LinkedIn destinations", () => {
    expect(Object.fromEntries(socials.map((link) => [link.id, link.url]))).toEqual({
      email: "mailto:ranabhuvi98@gmail.com",
      github: "https://github.com/itsBhuviRana",
      linkedin: "https://www.linkedin.com/in/itsbhuvirana/",
    });
  });
});

describe("project atlas", () => {
  const byId = (id: string) => atlasProjects.find((project) => project.id === id);
  const summary = getAtlasSummary();

  it("has unique ids in slug format and unique names", () => {
    const ids = atlasProjects.map((project) => project.id);
    expect(findDuplicates(ids)).toEqual([]);
    expect(ids.filter((id) => !isSlug(id))).toEqual([]);
    expect(findDuplicates(atlasProjects.map((project) => project.name))).toEqual([]);
  });

  it("represents all 28 supplied projects", () => {
    expect(summary.total).toBe(28);
    expect(atlasProjects.map((project) => project.name).sort()).toEqual(
      [
        "Discastra",
        "IFL",
        "Coca-Cola",
        "Pinpoinx",
        "JSW Connection",
        "Poito",
        "BT-Ohana / HRMS",
        "BT-Evolve",
        "BT-Reward",
        "BT-Review",
        "Flaia",
        "Fish / Ferry",
        "Magwitch",
        "Notaroo",
        "AdMedic",
        "CPC-Sisgain",
        "Dr LaBike",
        "Virtu MD",
        "Desh Clinic",
        "Living Box",
        "GoMotorCar",
        "Wosh App",
        "Curetus App",
        "JuntoPlus",
        "Music Pie",
        "Vistara",
        "AgroPure",
        "Hindware",
      ].sort(),
    );
  });

  it("gives the five featured projects a sheet, nine standard projects a domain and summary, and fourteen a general summary", () => {
    const names = (tier: string) =>
      atlasProjects.filter((project) => project.tier === tier).map((project) => project.name);
    expect(names("featured")).toEqual([
      "Discastra",
      "IFL",
      "Coca-Cola",
      "Pinpoinx",
      "JSW Connection",
    ]);
    expect(names("index")).toEqual([
      "Poito",
      "BT-Ohana / HRMS",
      "AdMedic",
      "Virtu MD",
      "Desh Clinic",
      "GoMotorCar",
      "Music Pie",
      "AgroPure",
      "Hindware",
    ]);
    expect(summary.tiers).toEqual({ featured: 5, index: 9, register: 14 });
  });

  it("counts platforms and companies from the supplied data", () => {
    expect(summary.platforms).toEqual({ mobile: 19, web: 9 });
    expect(Object.fromEntries(summary.companies.map((c) => [c.name, c.total]))).toEqual({
      "Telus Digital": 1,
      PwC: 2,
      BugendaiTech: 12,
      Sisgain: 5,
      Freelance: 6,
      "Candour Software": 2,
    });
    expect(summary.organisations).toBe(5);
    expect(summary.freelanceProjects).toBe(6);
  });

  it("marks enterprise exposure only where the resume supports it", () => {
    expect(summary.enterprise.clients).toEqual(["PwC", "Coca-Cola", "JSW"]);
    expect(summary.enterprise.projects).toBe(3);
    expect(atlasProjects.filter((p) => p.enterpriseClient !== undefined).map((p) => p.id)).toEqual([
      "ifl",
      "coca-cola",
      "jsw-connection",
    ]);
  });

  it("gives register-tier projects nothing beyond name, company, platform and a general summary", () => {
    for (const project of atlasProjects.filter((p) => p.tier === "register")) {
      expect(Object.keys(project).sort()).toEqual([
        "company",
        "id",
        "name",
        "platform",
        "summary",
        "tier",
      ]);
    }
  });

  it("records only the supplied facts for the featured projects", () => {
    expect(byId("ifl")).toMatchObject({
      company: "PwC",
      product: "Banking application",
      framework: "React Native CLI",
      notableWork: ["KYC features", "Financial calculators"],
      technologies: ["React Native", "GraphQL", "SQLite", "TypeScript"],
    });
    expect(byId("coca-cola")).toMatchObject({
      product: "Customer management application",
      notableWork: [
        "Salesforce integration",
        "Native iOS integration",
        "Native Android integration",
      ],
      technologies: ["React Native CLI", "Salesforce", "TypeScript"],
    });
    expect(byId("pinpoinx")).toMatchObject({
      company: "BugendaiTech",
      product: "Home broker application",
      technologies: ["React Native CLI", "GraphQL", "SQLite", "TypeScript"],
    });
    expect(byId("jsw-connection")).toMatchObject({
      product: "Customer service application",
      technologies: ["Android / Kotlin", "iOS / Swift", "Salesforce"],
    });
    expect(byId("poito")).toMatchObject({
      platform: "web",
      technologies: ["React.js", "Node.js APIs"],
    });
  });

  it("does not claim the native modules on JSW Connection were personally written", () => {
    const jsw = byId("jsw-connection")!;
    expect(jsw.framework).toBeUndefined();
    expect((jsw.personalWork ?? []).join(" ")).not.toMatch(/native|kotlin|swift|module/i);
  });

  it("leaves the BT-Ohana / HRMS product unspecified", () => {
    const ohana = byId("bt-ohana-hrms")!;
    expect(ohana.product).toBeUndefined();
    expect(JSON.stringify(ohana)).not.toMatch(/student|study/i);
  });

  it("keeps Telus Digital as the current employer and links Discastra to its detailed profile", () => {
    const discastra = byId("discastra")!;
    const current = getCurrentExperience()!;
    expect(current.company).toBe("Telus Digital");
    expect(current.projectIds).toEqual(["discastra"]);
    expect(discastra.company).toBe(current.company);
    expect(discastra.client).toBe(current.project?.context);
    expect(discastra.years).toEqual({ from: 2025, to: "present" });
    const titles = new Set((current.responsibilities ?? []).map((item) => item.title));
    expect((discastra.personalWork ?? []).filter((item) => !titles.has(item))).toEqual([]);
    expect(atlasProjects.filter((p) => p.years?.to === "present").map((p) => p.id)).toEqual([
      "discastra",
    ]);
  });

  it("only links experience to atlas projects that exist", () => {
    for (const entry of experience) {
      for (const id of entry.projectIds ?? []) expect(byId(id)).toBeDefined();
    }
  });

  it("uses valid approximate years", () => {
    for (const project of atlasProjects) {
      if (project.years === undefined) continue;
      expect(project.years.from).toBeGreaterThanOrEqual(2000);
      if (project.years.to !== "present")
        expect(project.years.to).toBeGreaterThanOrEqual(project.years.from);
    }
  });

  it("uses normalised spellings and no wording that claims more than was supplied", () => {
    const text = JSON.stringify([atlasProjects, capabilityGroups, careerRange]);
    expect(text).not.toMatch(
      /React-Native|Graph QL|Soql|Type Script|Bugendaitech|Bugedaitech|Candoure/,
    );
    const prose = atlasProjects.flatMap((project) => [
      project.summary,
      ...(project.personalWork ?? []),
      ...(project.notableWork ?? []),
      project.product ?? "",
    ]);
    expect(prose.filter((entry) => INFLATED_CLAIM.test(entry))).toEqual([]);
  });
});

describe("engineering capabilities", () => {
  const items = capabilityGroups.flatMap((group) => group.items);

  it("has the eight groups, each with a unique id and at least one item", () => {
    expect(capabilityGroups.map((group) => group.id)).toEqual([
      "application-development",
      "integrations",
      "native-platform",
      "web",
      "data-apis",
      "testing-quality",
      "delivery-release",
      "infrastructure",
    ]);
    expect(findDuplicates(capabilityGroups.map((group) => group.id))).toEqual([]);
    for (const group of capabilityGroups) {
      expect(isBlank(group.label)).toBe(false);
      expect(group.items.length).toBeGreaterThan(0);
      expect(group.items.some(isBlank)).toBe(false);
    }
  });

  it("lists each capability once", () => {
    expect(findDuplicates(items)).toEqual([]);
  });

  it("is not attached to any project and claims no proficiency level", () => {
    const projectNames = atlasProjects.map((project) => project.name.toLowerCase());
    expect(items.filter((item) => projectNames.includes(item.toLowerCase()))).toEqual([]);
    expect(items.join(" ")).not.toMatch(/expert|advanced|master|senior|specialist/i);
  });

  it("carries the confirmed breadth (Stripe, Agora, Detox and AWS appear here, not on a project)", () => {
    for (const item of [
      "Stripe",
      "Detox",
      "Storybook",
      "Next.js",
      "Vue.js",
      "Node.js",
      "Swift",
      "Kotlin",
      "SQLite",
      "Local data handling",
    ]) {
      expect(items).toContain(item);
    }
    expect(items.some((item) => /Agora/.test(item))).toBe(true);
    expect(items.some((item) => /AWS/.test(item))).toBe(true);
    const onProjects = JSON.stringify(atlasProjects.flatMap((p) => p.technologies ?? []));
    expect(onProjects).not.toMatch(/Stripe|Agora|Detox|AWS/);
  });

  it("keeps the career range consistent with the capabilities", () => {
    expect(careerRange.filter((item) => !items.includes(item))).toEqual([]);
  });
});

describe("atlas enrichment", () => {
  const byId = (id: string) => atlasProjects.find((project) => project.id === id)!;
  const summary = getAtlasSummary();
  /** Technologies that must only appear in a summary when they are confirmed for that project. */
  const TECH = [
    "React Native",
    "React.js",
    "React",
    "Expo",
    "Salesforce",
    "Stripe",
    "GraphQL",
    "SQLite",
    "Kotlin",
    "Swift",
    "Node.js",
    "Vue",
    "Next.js",
    "TypeScript",
    "Detox",
    "Jest",
    "AWS",
    "Agora",
    "Firebase",
  ];
  /** Words that would invent a product domain or feature that was not supplied. */
  const INVENTED =
    /payroll|attendance|recruit|leave management|loyalty|reward|patients?|appointments?|prescription|telemedicine|clinical|diagnos|streaming|licens|artist|subscription|airline|flight|inventory|dealership|catalogue|e-?commerce|checkout|fishing|logistics|transport|users?\b|customers?\b.*\d|revenue|scale|million/i;

  it("gives every project a short summary of one or two sentences", () => {
    for (const project of atlasProjects) {
      expect(isBlank(project.summary)).toBe(false);
      expect(project.summary.length).toBeLessThanOrEqual(260);
      const sentences = project.summary.split(/(?<=[.!?])\s+/).filter((part) => part.trim() !== "");
      expect(sentences.length).toBeGreaterThanOrEqual(1);
      expect(sentences.length).toBeLessThanOrEqual(2);
      expect(project.summary).not.toMatch(/\d|%/);
    }
  });

  it("never states a technology in a summary that is not confirmed for that project", () => {
    for (const project of atlasProjects) {
      const confirmed = [
        project.framework ?? "",
        project.product ?? "",
        ...(project.technologies ?? []),
        ...(project.notableWork ?? []),
      ].join(" ");
      const extra = project.id === "bt-evolve" ? ["React"] : [];
      const stated = TECH.filter((tech) => project.summary.includes(tech));
      expect(
        stated.filter((tech) => !confirmed.includes(tech) && !extra.includes(tech)),
        project.name,
      ).toEqual([]);
    }
  });

  it("does not invent a product feature, domain detail or scale in any summary", () => {
    for (const project of atlasProjects)
      expect(project.summary, project.name).not.toMatch(INVENTED);
  });

  it("keeps the general summaries general: they name no client, product or domain", () => {
    for (const project of atlasProjects.filter((p) => p.tier === "register")) {
      expect(project.domain).toBeUndefined();
      expect(project.summary, project.name).toMatch(/^(Web|Mobile) application/);
    }
  });

  it("uses the owner's supplied wording where it was supplied", () => {
    expect(byId("bt-evolve").summary).toBe(
      "Web application involving React-based feature development, reusable interface patterns and API-driven workflows.",
    );
    expect(byId("admedic").summary).toBe(
      "Healthcare-focused mobile application involving feature development and cross-platform mobile engineering.",
    );
    expect(byId("bt-ohana-hrms").summary).toMatch(/^Internal HRMS \/ business application/);
  });

  it("does not call BT-Ohana / HRMS a student application or invent HR modules", () => {
    expect(byId("bt-ohana-hrms").summary).not.toMatch(/student|study|payroll|attendance|recruit/i);
  });

  it("keeps domains cautious: confirmed only where the product is confirmed, otherwise flagged as from the name", () => {
    const confirmed = ["discastra", "ifl", "coca-cola", "jsw-connection", "poito"];
    for (const project of atlasProjects) {
      if (project.domain === undefined) continue;
      expect(project.domainFromName === true, project.name).toBe(!confirmed.includes(project.id));
    }
    // A name alone does not support a domain for these, so they stay general.
    for (const id of [
      "pinpoinx",
      "curetus-app",
      "dr-labike",
      "wosh-app",
      "juntoplus",
      "vistara",
      "cpc-sisgain",
    ]) {
      expect(byId(id).domain, id).toBeUndefined();
    }
    expect(summary.domains.confirmed).toEqual([
      "Agriculture",
      "Banking",
      "Customer management",
      "Customer service",
      "Education",
    ]);
    expect(summary.domains.fromName).toEqual([
      "HRMS / business",
      "Healthcare",
      "Automotive",
      "Music / media",
      "Home / building products",
    ]);
  });

  it("keeps the confirmed facts separate from the summaries", () => {
    // personalWork and notableWork stay confirmed-only: no register or general project has them.
    for (const project of atlasProjects.filter(
      (p) => p.tier !== "featured" && p.tier !== "index",
    )) {
      expect(project.personalWork).toBeUndefined();
      expect(project.notableWork).toBeUndefined();
    }
    expect(byId("jsw-connection").summary).not.toMatch(/personally|wrote|built the/i);
  });
});
