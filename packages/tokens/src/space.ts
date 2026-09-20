/**
 * Spacing scale in unitless px. Every step is a multiple of 4 (the layout grid base is 8), so the
 * scale is a subset of Tailwind's default spacing and needs no override on web.
 * Native platforms use the same numbers directly.
 */
export const space = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;

export type SpaceStep = (typeof space)[number];
