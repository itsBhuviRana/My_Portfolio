import { DRAFT_MARKER } from "../draft";
import type { Experience } from "../types";

/**
 * One draft placeholder for the current role. Only the role title is real. The
 * company, dates, impact and stack are unknown and are not invented here.
 */
export const experience: readonly Experience[] = [
  {
    id: "current-role",
    company: `${DRAFT_MARKER} Company name`,
    role: "Application Module Development Lead",
    summary: `${DRAFT_MARKER} Role summary to be written in the content phase.`,
    impact: [],
    stack: [],
    status: "draft",
  },
];
