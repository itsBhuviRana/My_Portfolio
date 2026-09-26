/**
 * The pure layout half of the 3D Project Atlas (atlas-city.tsx): how projects are grouped for each
 * "Arrange by" choice, where every building stands, and how big it is. No three.js in here, so it can be
 * reasoned about (and tested) without a canvas.
 *
 * Only facts that exist for every project are used as axes: company, platform and tier are always known,
 * domain is known for some (the rest are grouped as "Not stated" rather than guessed), and years are known
 * for only a handful, so time is deliberately not an arrangement.
 */

export type AtlasCityMode = "company" | "platform" | "domain";

export const ATLAS_MODES: readonly { id: AtlasCityMode; label: string }[] = [
  { id: "company", label: "Company" },
  { id: "platform", label: "Platform" },
  { id: "domain", label: "Domain" },
];

export interface AtlasCityProject {
  id: string;
  name: string;
  company: string;
  platform: "mobile" | "web";
  tier: "featured" | "index" | "register";
  summary: string;
  domain?: string;
  /** True when the domain is indicated only by the project's name; the panel says so. */
  domainFromName?: boolean;
  product?: string;
  /** What the person did on the project. */
  personalWork?: readonly string[];
  /** Work or characteristics of the project itself. */
  notableWork?: readonly string[];
  /** The project has a full breakdown further down the page (today: Dijkastra). */
  hasDetail?: boolean;
  years?: string;
  client?: string;
  enterpriseClient?: string;
  framework?: string;
  technologies?: readonly string[];
}

export interface AtlasGroup {
  key: string;
  label: string;
  ids: string[];
}

const LAST_LABELS = new Set(["Freelance", "Not stated"]);

export function groupProjects(
  projects: readonly AtlasCityProject[],
  mode: AtlasCityMode,
): AtlasGroup[] {
  const labelOf = (p: AtlasCityProject): string => {
    if (mode === "company") return p.company;
    if (mode === "platform") return p.platform === "mobile" ? "Mobile" : "Web";
    return p.domain ?? "Not stated";
  };
  const map = new Map<string, string[]>();
  for (const project of projects) {
    const label = labelOf(project);
    const ids = map.get(label) ?? [];
    ids.push(project.id);
    map.set(label, ids);
  }
  const groups = [...map].map(([label, ids]) => ({ key: `${mode}:${label}`, label, ids }));
  return groups.sort((a, b) => {
    if (mode === "platform") return a.label === "Mobile" ? -1 : 1;
    const aLast = LAST_LABELS.has(a.label);
    const bLast = LAST_LABELS.has(b.label);
    if (aLast !== bLast) return aLast ? 1 : -1;
    return b.ids.length - a.ids.length;
  });
}

/** A building's footprint and height: slim towers for mobile, wide slabs for web, taller when featured. */
export function buildingSize(project: AtlasCityProject): { w: number; d: number; h: number } {
  const h = project.tier === "featured" ? 2.6 : project.tier === "index" ? 1.7 : 1.05;
  return project.platform === "mobile" ? { w: 0.72, d: 0.72, h } : { w: 1.3, d: 0.95, h };
}

export interface Layout {
  placements: Record<string, { x: number; z: number }>;
  anchors: Record<string, { x: number; z: number; w: number; d: number }>;
  width: number;
  depth: number;
}

const CELL = 1.75;
const GROUP_GAP = 1.5;

/**
 * Stands each group's buildings in a grid, then packs the groups into 1-5 rows, choosing the row count whose
 * overall shape best matches the stage's aspect ratio — so a wide desktop stage gets a long skyline and a
 * portrait phone gets a tall stack of districts, from the same data.
 */
export function layoutGroups(groups: readonly AtlasGroup[], aspect: number): Layout {
  const sized = groups.map((group) => {
    const cols = Math.max(1, Math.ceil(Math.sqrt(group.ids.length * 1.5)));
    const rows = Math.ceil(group.ids.length / cols);
    return { group, cols, rows, w: cols * CELL, d: rows * CELL };
  });

  type Packed = { rows: (typeof sized)[number][][]; width: number; depth: number };
  const pack = (rowCount: number): Packed => {
    const total = sized.reduce((sum, g) => sum + g.w, 0) + GROUP_GAP * (sized.length - 1);
    const target = total / rowCount;
    const rows: (typeof sized)[number][][] = [];
    let current: (typeof sized)[number][] = [];
    let currentWidth = 0;
    for (const item of sized) {
      if (current.length > 0 && currentWidth + item.w > target && rows.length < rowCount - 1) {
        rows.push(current);
        current = [];
        currentWidth = 0;
      }
      current.push(item);
      currentWidth += item.w + GROUP_GAP;
    }
    if (current.length > 0) rows.push(current);
    const widths = rows.map(
      (row) => row.reduce((s, g) => s + g.w, 0) + GROUP_GAP * (row.length - 1),
    );
    const depths = rows.map((row) => Math.max(...row.map((g) => g.d)));
    return {
      rows,
      width: Math.max(...widths),
      depth: depths.reduce((s, v) => s + v, 0) + GROUP_GAP * (rows.length - 1),
    };
  };

  let best = pack(1);
  let bestScore = Infinity;
  for (let rowCount = 1; rowCount <= Math.min(5, sized.length); rowCount += 1) {
    const candidate = pack(rowCount);
    const score = Math.abs(Math.log(candidate.width / candidate.depth / aspect));
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  const placements: Layout["placements"] = {};
  const anchors: Layout["anchors"] = {};
  let z = -best.depth / 2;
  for (const row of best.rows) {
    const rowDepth = Math.max(...row.map((g) => g.d));
    const rowWidth = row.reduce((s, g) => s + g.w, 0) + GROUP_GAP * (row.length - 1);
    let x = -rowWidth / 2;
    for (const item of row) {
      const centreX = x + item.w / 2;
      const centreZ = z + rowDepth / 2;
      anchors[item.group.key] = { x: centreX, z: centreZ, w: item.w, d: item.d };
      item.group.ids.forEach((id, i) => {
        const col = i % item.cols;
        const rowIndex = Math.floor(i / item.cols);
        placements[id] = {
          x: x + CELL / 2 + col * CELL,
          z: centreZ - item.d / 2 + CELL / 2 + rowIndex * CELL,
        };
      });
      x += item.w + GROUP_GAP;
    }
    z += rowDepth + GROUP_GAP;
  }
  return { placements, anchors, width: best.width, depth: best.depth };
}

export interface TourStep {
  mode: AtlasCityMode;
  /** Buildings the camera frames; null frames everything. */
  frame: string[] | null;
  /** Buildings kept lit while the rest dim; null lights everything. */
  highlight: string[] | null;
  text: string;
}

/** The guided walk-through, built entirely from the data so every number in it is a count of the atlas. */
export function buildTour(projects: readonly AtlasCityProject[]): TourStep[] {
  const companies = groupProjects(projects, "company");
  const mobile = projects.filter((p) => p.platform === "mobile");
  const web = projects.filter((p) => p.platform === "web");
  const featured = projects.filter((p) => p.tier === "featured");
  const enterprise = projects.filter((p) => p.enterpriseClient !== undefined);
  const clients = [...new Set(enterprise.map((p) => p.enterpriseClient as string))];
  const steps: TourStep[] = [
    {
      mode: "company",
      frame: null,
      highlight: null,
      text: `Here is my project atlas: ${projects.length} projects in ${companies.length} groups. Let me walk you through it.`,
    },
  ];
  for (const group of companies) {
    const inGroup = projects.filter((p) => group.ids.includes(p.id));
    const m = inGroup.filter((p) => p.platform === "mobile").length;
    const w = inGroup.length - m;
    steps.push({
      mode: "company",
      frame: group.ids,
      highlight: group.ids,
      text: `${group.label}: ${inGroup.length} project${inGroup.length === 1 ? "" : "s"} (${m} mobile, ${w} web).`,
    });
  }
  steps.push({
    mode: "platform",
    frame: null,
    highlight: null,
    text: `By platform: ${mobile.length} mobile and ${web.length} web.`,
  });
  steps.push({
    mode: "platform",
    frame: featured.map((p) => p.id),
    highlight: featured.map((p) => p.id),
    text: `${featured.length} featured projects, the tallest buildings: ${featured.map((p) => p.name).join(", ")}.`,
  });
  if (enterprise.length > 0) {
    steps.push({
      mode: "platform",
      frame: enterprise.map((p) => p.id),
      highlight: enterprise.map((p) => p.id),
      text: `${enterprise.length} projects for enterprise clients: ${clients.join(" · ")}.`,
    });
  }
  steps.push({
    mode: "company",
    frame: null,
    highlight: null,
    text: "That is the atlas. Tap any building to see what is confirmed about it.",
  });
  return steps;
}
