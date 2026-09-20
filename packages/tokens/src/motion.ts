/**
 * Motion foundations, as data only. There is no animation runtime here: web uses GSAP or CSS,
 * native uses Reanimated, and both read these numbers. Nothing animates yet (that is Phase 5).
 *
 * Durations are milliseconds. Easings are cubic-bezier control points (x1, y1, x2, y2).
 */
export const motion = {
  duration: {
    fast: 150,
    base: 300,
    slow: 600,
  },
  ease: {
    standard: [0.4, 0, 0.2, 1],
    emphasized: [0.2, 0, 0, 1],
  },
} as const;

export type DurationToken = keyof typeof motion.duration;
export type EaseToken = keyof typeof motion.ease;
