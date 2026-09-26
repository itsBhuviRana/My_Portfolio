import { describe, expect, it } from "vitest";
import * as api from "./index";
import {
  color,
  font,
  layer,
  layerIds,
  motion,
  radius,
  shape,
  space,
  typeScale,
  weight,
} from "./index";
import type { ColorToken } from "./index";

const isPositiveInteger = (value: number): boolean => Number.isInteger(value) && value > 0;

/** WCAG 2.x contrast ratio between two palette tokens. */
function contrast(a: ColorToken, b: ColorToken): number {
  const luminance = (hex: string): number => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(color[a]), luminance(color[b])].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

describe("@assembly/tokens public API", () => {
  it("exposes exactly the approved token categories", () => {
    expect(Object.keys(api).sort()).toEqual([
      "color",
      "fluidRange",
      "font",
      "layer",
      "layerIds",
      "motion",
      "radius",
      "shape",
      "space",
      "typeScale",
      "weight",
    ]);
  });
});

describe("space", () => {
  it("is strictly increasing with unique positive integer steps", () => {
    expect(space.every(isPositiveInteger)).toBe(true);
    for (let i = 1; i < space.length; i += 1) {
      expect(space[i]!).toBeGreaterThan(space[i - 1]!);
    }
  });

  it("is on the 4 px grid, so it fits Tailwind default spacing", () => {
    expect(space.every((step) => step % 4 === 0)).toBe(true);
  });
});

describe("radius", () => {
  it("is exactly the approved 4 / 8 / 16 / pill", () => {
    expect(radius).toEqual({ sm: 4, md: 8, lg: 16, pill: 9999 });
  });
});

describe("color", () => {
  it("uses lowercase 6-digit hex values", () => {
    for (const value of Object.values(color)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("is exactly the approved Vellum & Layers palette", () => {
    expect(color).toEqual({
      vellum: "#0a0a09",
      paper: "#211f16",
      ink: "#f2efe6",
      inkSoft: "#a39c8c",
      line: "#8a8370",
      rule: "#2b2820",
      accent: "#f5f2ea",
      cobalt: "#d6d6d6",
      mint: "#2a2a2a",
      butter: "#363636",
      signal: "#434343",
      lilac: "#4f4f4f",
      rose: "#5c5c5c",
    });
  });

  it("meets the text contrast rules (4.5:1) on the surfaces they are allowed on", () => {
    for (const bg of ["vellum", "paper"] as const) {
      expect(contrast("ink", bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast("inkSoft", bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast("accent", bg)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast("paper", "accent")).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps informative lines at 3:1 or better, and does not let rules carry information", () => {
    for (const bg of ["vellum", "paper"] as const) {
      expect(contrast("line", bg)).toBeGreaterThanOrEqual(3);
      expect(contrast("rule", bg)).toBeLessThan(3);
    }
  });

  it("matches the contrast figures recorded in the brand guide", () => {
    expect(contrast("ink", "vellum")).toBeCloseTo(17.23, 1);
    expect(contrast("ink", "paper")).toBeCloseTo(14.36, 1);
    expect(contrast("paper", "cobalt")).toBeCloseTo(11.36, 1);
    expect(contrast("ink", "cobalt")).toBeCloseTo(1.26, 1);
  });
});

describe("layer", () => {
  it("has the six frozen layer IDs, in plane order", () => {
    expect([...layerIds]).toEqual([
      "interface",
      "components",
      "state",
      "native",
      "delivery",
      "leadership",
    ]);
    expect(Object.keys(layer)).toEqual([...layerIds]);
  });

  it("gives every layer a unique number, colour and hatch, so colour is never the only signal", () => {
    const entries = Object.values(layer);
    expect(entries.map((l) => l.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(new Set(entries.map((l) => l.fill)).size).toBe(6);
    expect(new Set(entries.map((l) => JSON.stringify(l.hatch))).size).toBe(6);
  });

  it("puts only readable text on each fill (4.5:1)", () => {
    for (const { fill, on } of Object.values(layer)) {
      expect(["ink", "paper"]).toContain(on);
      expect(contrast(on, fill)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("hatches only on the isometric axes", () => {
    for (const { hatch } of Object.values(layer)) {
      expect(hatch.angles.every((angle) => [30, 90, 150].includes(angle))).toBe(true);
      expect(isPositiveInteger(hatch.pitch)).toBe(true);
    }
  });
});

describe("shape", () => {
  it("has ordered solid shadow offsets and a subtle, blur-free shadow", () => {
    const { sm, md, lg } = shape.elevation;
    expect(sm).toBeLessThan(md);
    expect(md).toBeLessThan(lg);
    expect(shape.shadowOpacity).toBeGreaterThan(0);
    expect(shape.shadowOpacity).toBeLessThanOrEqual(0.2);
  });

  it("keeps the grid decorative and on the 8 px base", () => {
    expect(shape.grid.base).toBe(8);
    expect(shape.grid.isoTile % shape.grid.base).toBe(0);
    expect(shape.grid.maxOpacity).toBeLessThanOrEqual(0.1);
  });

  it("keeps the phone frame at about 9:19.5", () => {
    const { width, height } = shape.device.screen;
    expect(width / height).toBeCloseTo(9 / 19.5, 2);
  });
});

describe("typography", () => {
  it("uses only weights and widths inside each font's variable axes", () => {
    const [minW, maxW] = font.sans.weight;
    const [minWd, maxWd] = font.sans.width;
    for (const step of Object.values(typeScale)) {
      const w = weight[step.weight];
      const range = font[step.font].weight;
      expect(w).toBeGreaterThanOrEqual(range[0]);
      expect(w).toBeLessThanOrEqual(range[1]);
      if ("width" in step) {
        expect(step.width).toBeGreaterThanOrEqual(minWd);
        expect(step.width).toBeLessThanOrEqual(maxWd);
      }
    }
    expect(minW).toBe(100);
    expect(maxW).toBe(900);
  });

  it("never sets text under 12 px, and desktop is never smaller than mobile", () => {
    for (const { size } of Object.values(typeScale)) {
      expect(size[0]).toBeGreaterThanOrEqual(12);
      expect(size[1]).toBeGreaterThanOrEqual(size[0]);
    }
  });

  it("scales display sizes fluidly and keeps body leading at 1.5", () => {
    expect("fluid" in typeScale.display1 && "fluid" in typeScale.display2).toBe(true);
    expect(typeScale.body.leading).toBe(1.5);
  });

  it("sets technical labels in the mono face, uppercase", () => {
    expect(typeScale.label.font).toBe("mono");
    expect(typeScale.label.uppercase).toBe(true);
  });
});

describe("motion", () => {
  it("has positive integer millisecond durations ordered fast < base < slow", () => {
    const { fast, base, slow } = motion.duration;
    expect([fast, base, slow].every(isPositiveInteger)).toBe(true);
    expect(fast).toBeLessThan(base);
    expect(base).toBeLessThan(slow);
  });

  it("has valid cubic-bezier easings (x control points within 0..1)", () => {
    for (const curve of Object.values(motion.ease)) {
      expect(curve).toHaveLength(4);
      const [x1, , x2] = curve;
      expect(x1).toBeGreaterThanOrEqual(0);
      expect(x1).toBeLessThanOrEqual(1);
      expect(x2).toBeGreaterThanOrEqual(0);
      expect(x2).toBeLessThanOrEqual(1);
    }
  });
});
