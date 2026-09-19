/** PROVISIONAL. Unitless px. `pill` is effectively fully rounded. */
export const radius = {
  md: 12,
  lg: 20,
  pill: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
