/**
 * The Vellum & Layers palette (brand guide, section 3; D3 approved as the working direction).
 * Contrast figures are recomputed by tests, and must be recomputed if any value changes.
 *
 * Dark revision: every role was inverted in lightness (page/surface backgrounds went from near-white
 * to near-black, text went from near-black to near-white) while keeping every token *name* exactly as
 * it was — nothing that reads `bg-vellum`, `fill-cobalt`, `layer-native`, `--color-signal`, etc. needed
 * to change, only what each name resolves to. `cobalt` and `accent` stayed light (they still take dark
 * `paper`-coloured text on top of them); `mint`/`butter`/`signal`/`lilac`/`rose` went dark instead of
 * light (they still take light `ink`-coloured text). `paper` is a step lighter than `vellum`, not
 * darker, the same "surface sits slightly above the page" relationship the light version had.
 *
 * Text rules that hold everywhere (tests enforce the pairs):
 *   - ink and paper are the only text colours on layer fills; cobalt (and now accent) take paper text.
 *   - inkSoft is for secondary text on vellum or paper only, never on layer fills.
 *   - line carries information (3:1 or better). rule is decorative and never carries information.
 *   - mint, butter, signal, lilac and rose are dark greys, so shapes in them always need an ink outline
 *     to stay legible, the same rule as before, just against a dark ground instead of a light one.
 *
 * Token modules are leaf modules: they have no runtime imports (type-only imports are erased), so
 * the generator in scripts/generate.mjs can load each one directly.
 */
export const color = {
  // Surfaces and text
  vellum: "#0a0a09", // page background
  paper: "#211f16", // cards and surfaces
  ink: "#f2efe6", // text and all outlines
  inkSoft: "#a39c8c", // secondary text
  // Hairlines
  line: "#8a8370", // informative hairlines
  rule: "#2b2820", // decorative hairlines and grid only
  // Interactive
  accent: "#f5f2ea", // links, CTA fills, interactive icons — near-white, distinct from ink
  // Layer colours (grey, light to dark; only cobalt is light enough for paper (dark) text)
  cobalt: "#d6d6d6", // interface
  mint: "#2a2a2a", // components
  butter: "#363636", // state
  signal: "#434343", // native
  lilac: "#4f4f4f", // delivery
  rose: "#5c5c5c", // leadership
} as const;

export type ColorToken = keyof typeof color;
