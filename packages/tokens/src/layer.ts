import type { ColorToken } from "./color";

/**
 * The six layers of the exploded view. The IDs are frozen (D10) and mirror `SkillLayerId` in
 * @assembly/content. Packages may not depend on each other, so the two lists are kept in sync by hand.
 */
export const layerIds = [
  "interface",
  "components",
  "state",
  "native",
  "delivery",
  "leadership",
] as const;

export type LayerId = (typeof layerIds)[number];

interface LayerToken {
  /** Plane number. Layer identity is never colour alone: number, text label and hatch too. */
  readonly number: number;
  readonly fill: ColorToken;
  /** The only text colour allowed on the fill (see the contrast notes in color.ts). */
  readonly on: "ink" | "paper";
  /**
   * Hatch lines, as inclination in degrees from horizontal, on the isometric axes
   * (30, 90 and 150). `pitch` is the distance between parallel lines, in px.
   * Hatching goes on a strip or swatch, never behind text.
   */
  readonly hatch: { readonly angles: readonly number[]; readonly pitch: number };
}

export const layer = {
  interface: { number: 1, fill: "cobalt", on: "paper", hatch: { angles: [30], pitch: 6 } },
  components: { number: 2, fill: "mint", on: "ink", hatch: { angles: [150], pitch: 6 } },
  state: { number: 3, fill: "butter", on: "ink", hatch: { angles: [90], pitch: 6 } },
  native: { number: 4, fill: "signal", on: "ink", hatch: { angles: [30, 150], pitch: 8 } },
  delivery: { number: 5, fill: "lilac", on: "ink", hatch: { angles: [30, 90], pitch: 8 } },
  leadership: { number: 6, fill: "rose", on: "ink", hatch: { angles: [150, 90], pitch: 8 } },
} as const satisfies Record<LayerId, LayerToken>;
