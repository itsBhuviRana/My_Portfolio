import type { CSSProperties } from "react";

/**
 * The first-visit intro: a dark room lit by one shaded fixture — a tube light on desktop, a bulb hung from the
 * top edge on phones (max-width: 767px) — throwing a soft cone of light to the floor with dust hanging in it,
 * and a wall switch to turn it off. Both fixtures share the light, the dust, the switch and the off sequence;
 * only the CSS media query decides which fixture is visible (see the phone block in tube-intro.css).
 *
 * This is static markup only. Whether it shows, and everything that happens when the switch is used, is
 * handled by `TUBE_INTRO_SCRIPT` (tube-intro-script.ts), an inline `<head>` script that does not depend on
 * React hydrating; the styles are in tube-intro.css. Without that script's `data-intro` attribute on
 * `<html>` the overlay is `display: none` — no-JS, reduced-motion and repeat visits just get the page.
 * `?intro` in the URL forces a replay for review.
 */

/**
 * Dust hanging in the light (`.intro-beam`, tube-intro.css), the way it shows up in a shaft of sun in a
 * dark room: hundreds of fine specks, drifting slowly every which way rather than falling, and only visible
 * where the light catches it. Generated from a fixed seed (a plain Park-Miller generator), not `Math.random()`,
 * so the server and client render the exact same markup. Each mote carries only what has to be its own — kept
 * this small because every mote's inline style ships twice (in the HTML and in React's payload): `y`, how far
 * down the light it sits (0-1); `u`, how far across the cone's width at that height (-1 to 1), so the CSS can
 * place it inside the cone at any screen size; and `p`, its peak brightness — brighter nearer the bulb and the
 * middle of the light, the way the beam itself is, so motes fade toward its soft edges rather than stopping at
 * one. Sorted top to bottom, so the CSS can give the motes nearest the fixture, where the light is narrow, the
 * smaller loops. Every eighth is out of focus (big, soft, faint; see `.intro-dust > span:nth-child(8n)`).
 * Size, the wander loop, its timing and the glint's all come from the CSS (nth-child groups and these values).
 */
const DUST = (() => {
  let seed = 20260927;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const fixed = (n: number) => Number(n.toFixed(2));
  return Array.from({ length: 400 }, () => ({ y: 0.03 + rand() * 0.9, u: (rand() * 2 - 1) * 0.8 }))
    .sort((a, b) => a.y - b.y)
    .map(({ y, u }, i) => {
      const bokeh = i % 8 === 7;
      return {
        y: fixed(y),
        u: fixed(u),
        p: fixed((1 - y * 0.4) * (1 - Math.abs(u) * 0.55) * (bokeh ? 0.3 : 1)),
      };
    });
})();

export function TubeIntro() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tube-intro-title"
      className="tube-intro"
      suppressHydrationWarning
    >
      {/* The light itself, shared by both fixtures and spreading from whichever is showing: it starts
          halfway down the tube (or the bulb's glass), behind it (earlier in the markup), so the fixture
          hides where it begins. The same nested shape/blur structure as the closing contact scene's light
          (contact-light.tsx) — clip-path first, blurred by a plain wrapper around it (blurring and clipping
          the same element cuts the soft edge straight back off). The dust fills the same cone. */}
      <div className="intro-beam" aria-hidden="true">
        <div className="intro-beam-blur">
          <div className="intro-beam-shape" />
        </div>
        <div className="intro-dust">
          {DUST.map((d, i) => (
            <span key={i} style={{ "--y": d.y, "--u": d.u, "--p": d.p } as CSSProperties} />
          ))}
        </div>
      </div>

      <div className="tube-fixture" aria-hidden="true">
        <span className="tube-wire tube-wire-left" />
        <span className="tube-wire tube-wire-right" />
        <div className="tube-housing">
          <div className="tube-body">
            <div className="tube-lit" />
          </div>
        </div>
        {/* Last, so it paints over the wires and the housing's top edge: the tube sits up inside it. */}
        <div className="tube-shade" />
      </div>

      <div className="bulb-fixture" aria-hidden="true">
        <span className="bulb-wire" />
        <div className="bulb-grab">
          <div className="bulb-cap" />
          <div className="bulb-glass">
            <div className="bulb-lit" />
          </div>
          {/* A bare bulb throws light in every direction; this small reflector is what gives the light below a
              reason to be soft and downward rather than an even sphere with nothing to shape it. Last in the
              markup so it paints over the glass's top edge and the light's own start — the bulb sits inside
              its shade, not level with its rim. */}
          <div className="bulb-shade" />
        </div>
      </div>

      <div className="tube-ui">
        <h2 id="tube-intro-title" className="tube-title type-h3 m-0">
          Go dark to discover my work
        </h2>
        <button
          type="button"
          role="switch"
          aria-checked="true"
          aria-label="Tube light"
          className="tube-switch"
          suppressHydrationWarning
        >
          <span className="tube-plate">
            <span className="tube-mark tube-mark-on" aria-hidden="true">
              ON
            </span>
            <span className="tube-rocker" aria-hidden="true" />
            <span className="tube-mark tube-mark-off" aria-hidden="true">
              OFF
            </span>
          </span>
        </button>
        <p className="tube-hint tech-label m-0" aria-hidden="true">
          Tap the switch
        </p>
      </div>
    </div>
  );
}
