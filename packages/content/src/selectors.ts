import { FREELANCE, atlasProjects } from "./data/atlas";
import { experience } from "./data/experience";
import { projects } from "./data/projects";
import type { AtlasCompanySummary, AtlasSummary, AtlasTier, Experience, Project } from "./types";

/** Projects that are allowed to appear in production. Always use this, never `projects`. */
export function getPublishedProjects(): readonly Project[] {
  return projects.filter((project) => project.status === "published");
}

/** Looks a project up among the published ones only. Drafts are never returned. */
export function getProjectBySlug(slug: string): Project | undefined {
  return getPublishedProjects().find((project) => project.slug === slug);
}

/** Experience that is allowed to appear in production, newest first. Always use this, never `experience`. */
export function getPublishedExperience(): readonly Experience[] {
  return experience
    .filter((entry) => entry.status === "published")
    .toSorted((a, b) => (b.period?.start ?? "").localeCompare(a.period?.start ?? ""));
}

/** The role held now: a published entry with no end date. There is at most one. */
export function getCurrentExperience(): Experience | undefined {
  return getPublishedExperience().find(
    (entry) => entry.period !== undefined && entry.period.end === undefined,
  );
}

/** Counts for the atlas overview, derived from the atlas data so they can never drift from it. */
export function getAtlasSummary(): AtlasSummary {
  const companies = new Map<string, { mobile: number; web: number }>();
  for (const project of atlasProjects) {
    const counts = companies.get(project.company) ?? { mobile: 0, web: 0 };
    counts[project.platform] += 1;
    companies.set(project.company, counts);
  }
  const companySummaries: AtlasCompanySummary[] = [...companies].map(([name, counts]) => ({
    name,
    total: counts.mobile + counts.web,
    mobile: counts.mobile,
    web: counts.web,
    freelance: name === FREELANCE,
  }));
  const tiers: Record<AtlasTier, number> = { featured: 0, index: 0, register: 0 };
  for (const project of atlasProjects) tiers[project.tier] += 1;
  const enterprise = atlasProjects.filter((project) => project.enterpriseClient !== undefined);
  const confirmed = [
    ...new Set(
      atlasProjects.flatMap((project) =>
        project.domain !== undefined && !project.domainFromName ? [project.domain] : [],
      ),
    ),
  ];
  const fromName = [
    ...new Set(
      atlasProjects.flatMap((project) =>
        project.domain !== undefined &&
        project.domainFromName &&
        !confirmed.includes(project.domain)
          ? [project.domain]
          : [],
      ),
    ),
  ];
  return {
    total: atlasProjects.length,
    organisations: companySummaries.filter((company) => !company.freelance).length,
    freelanceProjects: companySummaries.find((company) => company.freelance)?.total ?? 0,
    platforms: {
      mobile: atlasProjects.filter((project) => project.platform === "mobile").length,
      web: atlasProjects.filter((project) => project.platform === "web").length,
    },
    tiers,
    enterprise: {
      projects: enterprise.length,
      clients: [...new Set(enterprise.map((project) => project.enterpriseClient as string))],
    },
    domains: { confirmed, fromName },
    companies: companySummaries,
  };
}
