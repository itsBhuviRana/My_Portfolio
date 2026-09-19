import { describe, expect, it } from "vitest";
import * as api from "./index";

describe("@assembly/content public API", () => {
  it("exposes exactly the approved runtime exports", () => {
    // Types are erased, so this lists values only. Adding an export here is a
    // deliberate API change: update this list in the same change.
    expect(Object.keys(api).sort()).toEqual([
      "experience",
      "getProjectBySlug",
      "getPublishedProjects",
      "projects",
      "site",
      "skillGroups",
      "socials",
    ]);
  });

  it("does not export the internal draft marker", () => {
    expect(Object.keys(api)).not.toContain("DRAFT_MARKER");
  });
});
