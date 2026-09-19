import { DRAFT_MARKER } from "../draft";
import type { Project } from "../types";

/**
 * No real projects yet. The single entry below is a clearly marked draft fixture
 * that exercises the types, selectors and tests. It is not real work and is
 * excluded from every published selector.
 */
export const projects: readonly Project[] = [
  {
    slug: "example-project",
    title: `${DRAFT_MARKER} Example project`,
    oneLiner: `${DRAFT_MARKER} Placeholder used to exercise types and tests. Not real work.`,
    category: "mobile",
    role: `${DRAFT_MARKER} Role`,
    stack: ["react-native", "typescript"],
    outcome: `${DRAFT_MARKER} Outcome`,
    metrics: [],
    media: [],
    links: {},
    featured: false,
    status: "draft",
  },
];
