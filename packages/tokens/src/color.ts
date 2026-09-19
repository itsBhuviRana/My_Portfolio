/**
 * PROVISIONAL. Placeholder neutrals, used only to prove the pipeline works.
 * The real palette is decided in the Brand & Assets phase.
 *
 * Token modules are leaf modules: they import nothing, so a future generator can
 * load each one directly.
 */
export const color = {
  ink: "#111111",
  vellum: "#f5f2ea",
} as const;

export type ColorToken = keyof typeof color;
