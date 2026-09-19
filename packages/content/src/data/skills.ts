import type { SkillGroup } from "../types";

/**
 * Skills supplied by the owner. Proficiency `level` is intentionally unset until
 * the owner provides it. Layer assignment is provisional (TypeScript spans several
 * layers) and will be revisited with the design system.
 */
export const skillGroups: readonly SkillGroup[] = [
  {
    id: "interface",
    label: "Interface",
    skills: [
      { id: "react-native", label: "React Native" },
      { id: "react", label: "React" },
    ],
  },
  {
    id: "components",
    label: "Components",
    skills: [{ id: "typescript", label: "TypeScript" }],
  },
];
