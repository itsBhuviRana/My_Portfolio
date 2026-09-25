import { AtlasOverview } from "./atlas-overview";
import { CapabilityMatrix } from "./capability-matrix";
import { ContactPrompt } from "./contact-prompt";
import { CurrentProject } from "./current-project";
import { FeaturedProjects } from "./featured-projects";
import { ProjectRegister } from "./project-register";

/**
 * The Work section, in reading order: the breadth of the atlas, the featured projects, the current
 * project in detail, then a single contact touchpoint (see `ContactPrompt` for why it sits exactly here),
 * then the full register, then the wider engineering capabilities.
 */
export function WorkSection() {
  return (
    <>
      <AtlasOverview />
      <FeaturedProjects />
      <CurrentProject />
      <ContactPrompt />
      <ProjectRegister />
      <CapabilityMatrix />
    </>
  );
}
