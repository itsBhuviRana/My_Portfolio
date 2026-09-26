import { SectionStage } from "../site/section-stage";
import {
  SketchAtlas,
  SketchCapabilities,
  SketchFeatured,
  SketchInspect,
  SketchRegister,
} from "../site/sketch-figures";
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
 *
 * Every sheet except `ContactPrompt` is wrapped in `SectionStage` so scrolling through the Work section
 * plays the same stack/zoom handoff as Hero->Atlas, sheet to sheet. `ContactPrompt` is deliberately left
 * plain: it's an inline CTA banner, not one of the site's seven sheets, and sits in ordinary flow between
 * Current Project's release and Register's approach.
 */
export function WorkSection() {
  return (
    <>
      <SectionStage tint="cobalt" sketch={<SketchAtlas />}>
        <AtlasOverview />
      </SectionStage>
      <SectionStage tint="mint" sketch={<SketchFeatured />}>
        <FeaturedProjects />
      </SectionStage>
      <SectionStage tint="butter" sketch={<SketchInspect />}>
        <CurrentProject />
      </SectionStage>
      <ContactPrompt />
      <SectionStage tint="signal" sketch={<SketchRegister />}>
        <ProjectRegister />
      </SectionStage>
      <SectionStage tint="lilac" sketch={<SketchCapabilities />}>
        <CapabilityMatrix />
      </SectionStage>
    </>
  );
}
