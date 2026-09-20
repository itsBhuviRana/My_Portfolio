/**
 * Stroke, depth, grid, focus and device values (brand guide, section 11). Unitless px unless noted.
 *
 * Depth is cut-paper: a solid offset shadow, down and right, in ink at low opacity, with no blur.
 */
export const shape = {
  /** Outline on every filled shape. Kept at this width at any scale in the browser. */
  stroke: 1.5,
  /** Hairline rules and dividers. */
  hairline: 1,
  /** Solid shadow offsets. */
  elevation: { sm: 2, md: 4, lg: 8 },
  /** Ink opacity of the cut-paper shadow (0 to 1). */
  shadowOpacity: 0.16,
  grid: {
    /** Layout grid base. */
    base: 8,
    /** Isometric grid tile edge, for illustration. */
    isoTile: 64,
    /** The grid is decoration: at most this opacity, and never animated. */
    maxOpacity: 0.1,
  },
  /** Two-tone focus ring: `inner` in paper next to the element, `outer` in ink around it. */
  focus: { inner: 2, outer: 2 },
  /** Generic phone frame: bezel width, and the logical screen it frames (about 9:19.5). */
  device: { bezel: 12, screen: { width: 390, height: 844 } },
} as const;
