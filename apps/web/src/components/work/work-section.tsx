import { AtlasOverview } from "./atlas-overview";
import { CapabilityMatrix } from "./capability-matrix";
import { CurrentProject } from "./current-project";

/**
 * The Work section, in reading order: the 3D project atlas (which carries every project's details, the
 * featured ones included), the current project in detail, then the wider engineering capabilities. The
 * separate Featured and Register sections were folded into the atlas, and the contact prompt bar was
 * dropped; their components are still in this folder.
 */
export function WorkSection() {
  return (
    <>
      <AtlasOverview />
      <CurrentProject />
      <CapabilityMatrix />
    </>
  );
}
