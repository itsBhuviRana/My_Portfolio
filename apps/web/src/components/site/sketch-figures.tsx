/**
 * The seven sheets' corner sketches: one small, original line-figure per section, each doing something
 * that matches what that sheet is about — the same idea as the "Sheet N/7" numbering, just drawn instead
 * of set in type. Every figure shares one construction (a head, a torso line, two arms, two legs, all
 * plain strokes, no fill) so the set reads as one consistent hand, not seven unrelated icons; only the
 * limb angles and the one small prop per figure change.
 *
 * Pure line art, ink-only (no fill), matching the same `stroke-outline`-style convention the exploded
 * illustration already uses — a "pencil sketch" that stays legible on the site's paper background,
 * rather than a literal white line that would vanish on it.
 */

type FigureProps = { className?: string };

const STROKE = {
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

/** Hero: seated at a laptop — the first thing a visitor sees, so the plainest pose. */
export function SketchIntro({ className }: FigureProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g stroke="currentColor" {...STROKE}>
        <circle cx="50" cy="22" r="8" />
        <path d="M50 30 V58" />
        <path d="M50 36 L36 50 M50 36 L64 50" />
        <path d="M50 58 L38 80 M50 58 L62 80" />
        <path d="M30 52 H62 L58 44 H34 Z" />
      </g>
    </svg>
  );
}

/** Atlas: pointing at a small grid — surveying the breadth of the work. */
export function SketchAtlas({ className }: FigureProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g stroke="currentColor" {...STROKE}>
        <circle cx="45" cy="22" r="8" />
        <path d="M45 30 V60" />
        <path d="M45 36 L68 24 M45 36 L34 52" />
        <path d="M45 60 L36 88 M45 60 L54 88" />
        <path d="M72 8 H92 V28 H72 Z M72 18 H92 M82 8 V28" />
      </g>
    </svg>
  );
}

/** Featured Projects: holding a card up — the highlight reel. */
export function SketchFeatured({ className }: FigureProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g stroke="currentColor" {...STROKE}>
        <circle cx="50" cy="34" r="8" />
        <path d="M50 42 V70" />
        <path d="M50 48 L34 18 M50 48 L66 18" />
        <path d="M50 70 L40 92 M50 70 L60 92" />
        <path d="M28 6 H72 V20 H28 Z" />
      </g>
    </svg>
  );
}

/** Current Project: leaning in with a magnifying glass — the one project shown in full detail. */
export function SketchInspect({ className }: FigureProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g stroke="currentColor" {...STROKE}>
        <circle cx="38" cy="26" r="8" />
        <path d="M40 34 L58 58" />
        <path d="M42 40 L26 46 M46 44 L66 40" />
        <path d="M58 58 L48 86 M58 58 L70 82" />
        <circle cx="80" cy="30" r="12" />
        <path d="M71 39 L62 48" />
      </g>
    </svg>
  );
}

/** Project Register: crouched, arranging a small stack — the full catalogue, filed in order. */
export function SketchRegister({ className }: FigureProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g stroke="currentColor" {...STROKE}>
        <circle cx="50" cy="24" r="8" />
        <path d="M50 32 L44 58" />
        <path d="M46 40 L28 52 M48 44 L60 34" />
        <path d="M44 58 L34 78 M44 58 L56 84" />
        <path d="M18 84 H42 M22 76 H46 M26 68 H50" />
      </g>
    </svg>
  );
}

/** Capabilities: a wrench in hand, a gear nearby — the toolkit. */
export function SketchCapabilities({ className }: FigureProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g stroke="currentColor" {...STROKE}>
        <circle cx="45" cy="22" r="8" />
        <path d="M45 30 V58" />
        <path d="M45 36 L30 48 M45 36 L64 30" />
        <path d="M45 58 L36 88 M45 58 L54 88" />
        <path d="M18 44 L26 52 M22 40 L30 48" />
        <circle cx="76" cy="20" r="9" />
        <path d="M76 8 V13 M76 27 V32 M64 20 H69 M83 20 H88 M68 12 L71 15 M81 25 L84 28 M68 28 L71 25 M81 15 L84 12" />
      </g>
    </svg>
  );
}

/** Contact: a raised, waving arm — the sign-off. */
export function SketchContact({ className }: FigureProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g stroke="currentColor" {...STROKE}>
        <circle cx="46" cy="24" r="8" />
        <path d="M46 32 V60" />
        <path d="M46 38 L64 18 M60 12 L64 18 L58 22" />
        <path d="M46 38 L34 52" />
        <path d="M46 60 L36 88 M46 60 L56 88" />
      </g>
    </svg>
  );
}
