"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Site-wide smooth scroll: eases the browser's own scroll position instead of the native
 * stepped/jumpy wheel-tick motion, so scrolling reads as content gliding upward rather than
 * mechanical scroll steps. This still drives the real `window.scrollY` every frame (Lenis
 * interpolates toward it, it does not replace it with a virtual position) — so keyboard scrolling
 * (arrows, Page Up/Down, Space, Home/End), `#anchor` links, the browser's own "find in page," and
 * screen readers all keep working exactly as they do without this component. The native scrollbar
 * is hidden separately, in `foundations.css`, unconditionally — that's a visual-only change with
 * no effect on scroll behaviour, so it doesn't need to wait on this component or on JavaScript at
 * all.
 *
 * Off entirely under `prefers-reduced-motion` and when JavaScript never runs — native scroll is
 * always the resting/fallback state here, the same "motion only adds, never gates" rule the rest
 * of the site's animation follows (see `exploded-phone.tsx`).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // Slower than Lenis's own default on purpose: the `SectionStage` handoffs (section-stage.tsx) need
      // enough physical scroll input to read clearly rather than being blown through in a couple of wheel
      // ticks. `duration` softens the easing itself; the wheel multiplier cuts how far a single wheel tick
      // moves the page. Both were tuned down further than this on the first pass and felt like the
      // transitions dragged on too long — this is the eased-back version.
      duration: 1.3,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 0.95,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
