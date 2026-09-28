import type { Site } from "../types";

/** The owner's identity and bio, as supplied (designation and bio: 2026-09-28). */
export const site: Site = {
  name: "Bhuvneshwar Rana",
  role: "Application Development Lead",
  summary: {
    short:
      "Looking for someone who can turn complex product ideas into reliable, scalable mobile experiences? I build them.",
    long: "Looking for someone who can turn complex product ideas into reliable, scalable mobile experiences? I build them.",
  },
  // Supplied by the owner (September 2026): currently employed and looking for a good opportunity, with
  // six years of professional experience. Update `yearsOfExperience` by hand as the years pass.
  availability: { status: "open" },
  yearsOfExperience: 6,
};
