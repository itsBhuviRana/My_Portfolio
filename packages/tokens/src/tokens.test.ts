import { describe, expect, it } from "vitest";
import * as api from "./index";
import { color, motion, radius, space } from "./index";

const isPositiveInteger = (value: number): boolean => Number.isInteger(value) && value > 0;

describe("@assembly/tokens public API", () => {
  it("exposes exactly the approved token categories", () => {
    expect(Object.keys(api).sort()).toEqual(["color", "motion", "radius", "space"]);
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
  it("has positive integer values, ordered md < lg < pill", () => {
    expect(Object.values(radius).every(isPositiveInteger)).toBe(true);
    expect(radius.md).toBeLessThan(radius.lg);
    expect(radius.lg).toBeLessThan(radius.pill);
  });
});

describe("color", () => {
  it("uses lowercase 6-digit hex values", () => {
    for (const value of Object.values(color)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
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
