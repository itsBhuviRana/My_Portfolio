/**
 * Typography (D9: Archivo variable and JetBrains Mono). Data only: how the fonts are loaded is an
 * app concern (`next/font/google` on web). The scale follows the brand guide, section 10, and is a
 * PROPOSED working scale rather than a separately approved one. Sizes are unitless px.
 */
export const font = {
  /** Variable axes: weight 100 to 900, width 62 to 125. */
  sans: { family: "Archivo", generic: "sans-serif", weight: [100, 900], width: [62, 125] },
  /** Variable axis: weight 100 to 800. */
  mono: { family: "JetBrains Mono", generic: "monospace", weight: [100, 800] },
} as const;

export const weight = { regular: 400, medium: 500, bold: 700, black: 800 } as const;

/** Viewport range (px) over which the display sizes scale smoothly. */
export const fluidRange = { min: 375, max: 1440 } as const;

interface TypeStep {
  readonly font: keyof typeof font;
  /** Size in px on mobile and on desktop. Fluid steps scale between them across `fluidRange`. */
  readonly size: readonly [mobile: number, desktop: number];
  /** Fluid steps scale smoothly. The others switch to the desktop size at a breakpoint. */
  readonly fluid?: true;
  readonly leading: number;
  readonly weight: keyof typeof weight;
  /** Archivo width axis (percent). */
  readonly width?: number;
  /** Letter spacing in em. */
  readonly tracking?: number;
  readonly uppercase?: true;
}

export const typeScale = {
  display1: {
    font: "sans",
    size: [56, 128],
    fluid: true,
    leading: 1.05,
    weight: "black",
    width: 125,
  },
  display2: {
    font: "sans",
    size: [40, 88],
    fluid: true,
    leading: 1.1,
    weight: "black",
    width: 125,
  },
  h1: { font: "sans", size: [32, 56], leading: 1.15, weight: "bold", width: 112 },
  h2: { font: "sans", size: [24, 36], leading: 1.2, weight: "bold", width: 112 },
  h3: { font: "sans", size: [20, 26], leading: 1.25, weight: "bold", width: 112 },
  bodyLg: { font: "sans", size: [18, 20], leading: 1.5, weight: "regular", width: 100 },
  body: { font: "sans", size: [16, 18], leading: 1.5, weight: "regular", width: 100 },
  small: { font: "sans", size: [14, 14], leading: 1.5, weight: "regular", width: 100 },
  /** Technical labels: specs, numerals, callouts, title blocks. */
  label: {
    font: "mono",
    size: [12, 13],
    leading: 1.4,
    weight: "medium",
    tracking: 0.04,
    uppercase: true,
  },
} as const satisfies Record<string, TypeStep>;

export type TypeStepName = keyof typeof typeScale;
