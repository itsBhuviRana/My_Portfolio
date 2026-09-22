"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type RevealState = "idle" | "pending" | "revealed";

/**
 * The Atlas field: the environment the project objects sit in. `className` carries the visual treatment
 * (the isometric grid backdrop, border and padding — see `featured-projects.tsx`); this component itself
 * owns only the entrance behaviour and the shared ancestor the objects react to, for both the entrance and
 * for dimming everything but the selected object.
 *
 * Safe by default: children render fully visible and interactive immediately, exactly as if this
 * component did nothing. Only once mounted does it check whether the field is already on screen; if it
 * is, nothing happens (`idle` and `revealed` are visually identical, so there is no flash of hidden
 * content for a field that loads already in view). Only a field that starts off-screen is briefly held
 * back (`pending`) until it scrolls into view. If JavaScript never runs, `pending` is never reached and
 * nothing is ever hidden.
 *
 * Reduced motion is handled entirely by the site-wide transition rule in foundations.css (which also
 * zeroes transition delay), so nothing here needs to check `prefers-reduced-motion` directly.
 */
export function AtlasField({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>("idle");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          if (!entry?.isIntersecting) {
            setState("pending");
            return;
          }
        }
        if (entry?.isIntersecting) {
          setState("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`group ${className}`} data-reveal={state}>
      {children}
    </div>
  );
}
