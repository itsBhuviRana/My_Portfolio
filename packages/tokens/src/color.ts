/**
 * The Vellum & Layers palette (brand guide, section 3; D3 approved as the working direction).
 * Contrast figures are recomputed by tests, and must be recomputed if any value changes.
 *
 * Text rules that hold everywhere (tests enforce the pairs):
 *   - ink and paper are the only text colours on layer fills; cobalt takes paper text.
 *   - inkSoft is for secondary text on vellum or paper only, never on layer fills.
 *   - line carries information (3:1 or better). rule is decorative and never carries information.
 *   - mint, butter, signal, lilac and rose are far too light against vellum, so shapes in them
 *     always need an ink outline.
 *
 * Token modules are leaf modules: they have no runtime imports (type-only imports are erased), so
 * the generator in scripts/generate.mjs can load each one directly.
 */
export const color = {
  // Surfaces and text
  vellum: "#ede8da", // page background
  paper: "#f8f4e9", // cards and surfaces
  ink: "#1a1916", // text and all outlines
  inkSoft: "#55514a", // secondary text
  // Hairlines
  line: "#7d7666", // informative hairlines
  rule: "#b8b19f", // decorative hairlines and grid only
  // Interactive
  accent: "#bf351b", // links, CTA fills, interactive icons
  // Layer colours
  cobalt: "#2b47e8", // interface
  mint: "#8bd8b6", // components
  butter: "#f2cb4a", // state
  signal: "#f2583a", // native
  lilac: "#b7a4f2", // delivery
  rose: "#f4a3be", // leadership
} as const;

export type ColorToken = keyof typeof color;
