/**
 * UI radii (D6): 4 / 8 / 16 / pill. Unitless px. `pill` is effectively fully rounded.
 * Engineering art uses 0 to 4 unit corners, so it takes `sm` at most.
 */
export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
