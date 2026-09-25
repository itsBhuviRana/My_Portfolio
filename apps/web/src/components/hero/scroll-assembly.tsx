"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * How much page height the pin borrows, and how far past the illustration's resting position each layer
 * travels at full scroll (a multiple of the small entrance offset `ExplodedPhone` already carries as
 * `--hero-from-x`/`--hero-from-y` — reused rather than a second hand-picked geometry, so the direction
 * each layer moves in stays identical to the one the entrance already established).
 */
const PIN_VH = 170;
const EXPLODE_SCALE = 4.5;
/** How much further a stack connector stretches at full scroll, beyond its normal drawn length. */
const CONNECTOR_STRETCH = 0.9;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Wraps the Hero's illustration column so that scrolling past it pulls the layers further apart instead
 * of just scrolling them out of view — the page's own concept line ("taken apart layer by layer, so you
 * can see how it's built") read literally: scrolling is what takes it apart.
 *
 * The mechanism is CSS `position: sticky`, not an intercepted scroll/wheel handler: the browser's native
 * scrolling is never touched, so trackpad/wheel/touch momentum, keyboard scrolling and screen-reader
 * navigation all behave exactly as they do anywhere else on the page. A scroll listener only *reads* the
 * pinned wrapper's position (rAF-throttled, direct DOM writes, no React state on every tick) to compute
 * how far through the pin the visitor is, then writes that straight onto the existing `[data-layer]` /
 * `[data-connector]` elements `ExplodedPhone` already renders — no restructuring of that component, no
 * new markup for it to understand.
 *
 * Safe by default, the same way `AtlasField` and the Hero's own entrance already are: this renders
 * `children` plumb (no extra height, no pin, no JS-driven transform) until a `useEffect` confirms the
 * viewport is wide enough for the two-column Hero layout this depends on and the visitor has not asked
 * for reduced motion — so a narrow viewport, `prefers-reduced-motion: reduce`, or JavaScript never
 * running at all all fall back to exactly today's Hero: the illustration's own one-shot CSS entrance,
 * nothing pinned, nothing extra to scroll through.
 */
export function ScrollAssembly({ children }: { children: ReactNode }) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const evaluate = () => setActive(wide.matches && motionOk.matches);
    evaluate();
    wide.addEventListener("change", evaluate);
    motionOk.addEventListener("change", evaluate);
    return () => {
      wide.removeEventListener("change", evaluate);
      motionOk.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const spacer = spacerRef.current;
    if (!spacer) return;

    const layers = Array.from(spacer.querySelectorAll<SVGGElement>("[data-layer]")).map((el) => {
      const style = getComputedStyle(el);
      return {
        el,
        fromX: Number.parseFloat(style.getPropertyValue("--hero-from-x")) || 0,
        fromY: Number.parseFloat(style.getPropertyValue("--hero-from-y")) || 0,
      };
    });
    const connectors = Array.from(spacer.querySelectorAll<SVGLineElement>("[data-connector]"));

    let rafId = 0;
    const apply = () => {
      rafId = 0;
      const rect = spacer.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;

      for (const layer of layers) {
        const x = layer.fromX * EXPLODE_SCALE * progress;
        const y = layer.fromY * EXPLODE_SCALE * progress;
        layer.el.style.translate = `${x}px ${y}px`;
      }
      for (const connector of connectors) {
        connector.style.scale = `1 ${1 + progress * CONNECTOR_STRETCH}`;
      }
    };
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      for (const layer of layers) layer.el.style.translate = "";
      for (const connector of connectors) connector.style.scale = "";
    };
  }, [active]);

  if (!active) return <>{children}</>;

  return (
    <div ref={spacerRef} style={{ height: `${PIN_VH}vh` }} className="relative">
      <div className="hero-scroll-assembly sticky top-0 flex min-h-screen items-center">
        {children}
      </div>
    </div>
  );
}
