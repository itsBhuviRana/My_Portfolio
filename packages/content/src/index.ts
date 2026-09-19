/**
 * Public API of @assembly/content. This is the ONLY entry point (see `exports`
 * in package.json). Deep imports are blocked by the exports map and by ESLint.
 */
export type {
  Availability,
  AvailabilityStatus,
  CaseStudy,
  CaseStudyBlock,
  Experience,
  Leadership,
  Media,
  Metric,
  Period,
  Project,
  ProjectCategory,
  ProjectLinks,
  PublishStatus,
  Site,
  Skill,
  SkillGroup,
  SkillId,
  SkillLayerId,
  SkillLevel,
  SocialId,
  SocialLink,
  YearMonth,
} from "./types";

export { site } from "./data/site";
export { socials } from "./data/socials";
export { experience } from "./data/experience";
export { skillGroups } from "./data/skills";
export { projects } from "./data/projects";

export { getProjectBySlug, getPublishedProjects } from "./selectors";
