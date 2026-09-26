"use client";

import { useEffect, useRef } from "react";

/**
 * The Hero's scroll cue, floating at the bottom centre of the screen: a glowing disc with a down arrow and
 * rings of light (all in hero-motion.css). It only makes sense at the very top of the page, so it fades out
 * as soon as the visitor starts scrolling and returns if they come back up. It is a plain anchor to the next
 * section, and it is a direct child of the Hero `<section>` on purpose: `position: fixed` would be trapped
 * by any ancestor that has a transform, and the Hero's animated text groups do.
 */
export function HeroScrollCue() {
  const cueRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const cue = cueRef.current;
    if (!cue) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      cue.dataset.away = window.scrollY > 80 ? "true" : "false";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <a ref={cueRef} href="#work" aria-label="Scroll down for more" className="hero-scroll-cue">
      <span className="hero-scroll-ripple" aria-hidden="true" />
      <span className="hero-scroll-ripple hero-scroll-ripple-late" aria-hidden="true" />
      <svg viewBox="0 0 24 24" aria-hidden="true" className="hero-scroll-arrow">
        <path className="hero-scroll-chevron" d="M6 6.5l6 6 6-6" />
        <path className="hero-scroll-chevron hero-scroll-chevron-late" d="M6 12l6 6 6-6" />
      </svg>
    </a>
  );
}
