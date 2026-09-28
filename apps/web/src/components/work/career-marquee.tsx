"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Auto-scroll speed, in px per second: slow enough to read a card as it passes. */
const SPEED = 22;
/** How long after the visitor's own scroll, swipe or key press the auto-scroll waits before resuming. */
const RESUME_AFTER_MS = 2500;

/**
 * A horizontal scroller that keeps gliding on its own: the cards (`children`) are followed by a second,
 * hidden copy (`copy`) so the scroll can wrap from the end of the first set back to its start without a
 * visible jump — a continuous loop. It is a real scroll container, so the visitor can still swipe or
 * trackpad through it (or use the arrow keys once it has focus); the auto-scroll pauses on hover, focus
 * and touch, and picks up again from wherever they left it. Off entirely under `prefers-reduced-motion`
 * and while the section is off screen; without JavaScript it is simply a scrollable row.
 */
export function CareerMarquee({
  label,
  children,
  copy,
}: {
  label: string;
  children: ReactNode;
  copy: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const firstSet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    const set = firstSet.current;
    if (!el || !set) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // One loop is the first set plus the gap after it: scrolling that far shows the copy exactly where the
    // first set started, so wrapping back by it is invisible.
    const period = () =>
      set.offsetWidth + parseFloat(getComputedStyle(set.parentElement!).columnGap || "0");

    let pos = el.scrollLeft;
    let last = performance.now();
    let hovered = false;
    let focused = false;
    let visible = false;
    let resumeAt = 0;
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      if (visible && !hovered && !focused && now >= resumeAt) {
        pos += SPEED * dt;
        const loop = period();
        if (pos >= loop) pos -= loop;
        el.scrollLeft = pos;
      }
      frame = requestAnimationFrame(tick);
    };

    // The visitor's own scrolling moves the position; keep it wrapped too, so a swipe past the end of the
    // first set lands back at the matching card rather than hitting the end of the row.
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - pos) <= 1) return;
      pos = el.scrollLeft;
      const loop = period();
      if (pos >= loop) {
        pos -= loop;
        el.scrollLeft = pos;
      }
    };
    const holdOff = () => {
      resumeAt = performance.now() + RESUME_AFTER_MS;
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === "mouse") hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    const onFocusIn = () => {
      focused = true;
    };
    const onFocusOut = () => {
      focused = false;
      holdOff();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      last = performance.now();
    });
    observer.observe(el);

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", holdOff);
    el.addEventListener("touchstart", holdOff, { passive: true });
    el.addEventListener("wheel", holdOff, { passive: true });
    el.addEventListener("keydown", holdOff);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", holdOff);
      el.removeEventListener("touchstart", holdOff);
      el.removeEventListener("wheel", holdOff);
      el.removeEventListener("keydown", holdOff);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <div ref={scroller} className="career-scroller" role="region" aria-label={label} tabIndex={0}>
      <div className="career-track">
        <div ref={firstSet} className="career-set">
          {children}
        </div>
        {/* The loop's second pass: for the eye only, so screen readers and Tab meet every role once. */}
        <div className="career-set" aria-hidden="true" inert>
          {copy}
        </div>
      </div>
    </div>
  );
}
