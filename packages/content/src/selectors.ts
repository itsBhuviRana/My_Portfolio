import { projects } from "./data/projects";
import type { Project } from "./types";

/** Projects that are allowed to appear in production. Always use this, never `projects`. */
export function getPublishedProjects(): readonly Project[] {
  return projects.filter((project) => project.status === "published");
}

/** Looks a project up among the published ones only. Drafts are never returned. */
export function getProjectBySlug(slug: string): Project | undefined {
  return getPublishedProjects().find((project) => project.slug === slug);
}
