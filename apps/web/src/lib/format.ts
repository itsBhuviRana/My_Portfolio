import type { ApproximateYears, AtlasProject, Period, ProjectPlatform } from "@assembly/content";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatYearMonth(value: string): string {
  const [year, month] = value.split("-");
  return `${MONTHS[Number(month) - 1] ?? month} ${year}`;
}

/** "Nov 2025 — Present" for an open period, "Nov 2025 — Mar 2027" for a closed one. */
export function formatPeriod(period: Period): string {
  return `${formatYearMonth(period.start)} — ${period.end ? formatYearMonth(period.end) : "Present"}`;
}

/** A URL as it reads on the page: no scheme and no trailing slash. */
export function displayUrl(url: string): string {
  return url
    .replace(/^mailto:/, "")
    .replace(/^https:\/\//, "")
    .replace(/\/$/, "");
}

/** "2024–2025", "2025–Present", or a single year. The periods in the atlas are approximate. */
export function formatYears(years: ApproximateYears): string {
  if (years.from === years.to) return String(years.from);
  return `${years.from}–${years.to === "present" ? "Present" : years.to}`;
}

export function platformLabel(platform: ProjectPlatform): string {
  return platform === "mobile" ? "Mobile" : "Web";
}

/** The domain as shown: plain when confirmed, marked "(from name)" when only the project name indicates it. */
export function domainLabel(project: AtlasProject): string | undefined {
  if (project.domain === undefined) return undefined;
  return project.domainFromName ? `${project.domain} (from name)` : project.domain;
}

/** The single most representative confirmed technology for a compact view: the first in the list, or the framework. */
export function primaryTechnology(project: AtlasProject): string | undefined {
  return project.technologies?.[0] ?? project.framework;
}
