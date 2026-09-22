/**
 * Public API of @assembly/content. This is the ONLY entry point (see `exports`
 * in package.json). Deep imports are blocked by the exports map and by ESLint.
 */
export type {
  ApproximateYears,
  AtlasCompanySummary,
  AtlasProject,
  AtlasSummary,
  AtlasTier,
  Availability,
  AvailabilityStatus,
  CaseStudy,
  CapabilityGroup,
  CaseStudyBlock,
  Experience,
  Leadership,
  Media,
  Metric,
  Period,
  ExperienceProject,
  Project,
  ProjectArchitecture,
  ProjectCategory,
  ProjectLinks,
  ProjectPlatform,
  PublishStatus,
  Responsibility,
  Site,
  Skill,
  SkillGroup,
  SkillId,
  SkillLayerId,
  SkillLevel,
  SocialId,
  SocialLink,
  SyncFlow,
  TechnologyGroup,
  YearMonth,
} from "./types";

export { site } from "./data/site";
export { socials } from "./data/socials";
export { experience } from "./data/experience";
export { atlasProjects, careerRange } from "./data/atlas";
export { capabilityGroups } from "./data/capabilities";
export { skillGroups } from "./data/skills";
export { projects } from "./data/projects";

export {
  getAtlasSummary,
  getCurrentExperience,
  getProjectBySlug,
  getPublishedExperience,
  getPublishedProjects,
} from "./selectors";
