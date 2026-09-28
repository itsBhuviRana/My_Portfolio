import type { Education } from "../types";

/**
 * Supplied by the owner (2026-09-28), highest first. High school was supplied too but is left out on purpose:
 * after six years of professional work it tells a reader nothing the degree does not.
 */
export const education: readonly Education[] = [
  {
    id: "btech",
    qualification: "B.Tech",
    field: "Computer Science Engineering",
    institution: "Bharat Institute of Technology",
  },
  {
    id: "diploma",
    qualification: "Diploma",
    field: "Computer Science",
    institution: "Neelkhanth Group of Institutions",
  },
];
