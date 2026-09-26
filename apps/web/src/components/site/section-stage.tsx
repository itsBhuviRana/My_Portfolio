"use client";

import { cloneElement, useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";

/** How far the outgoing section keeps travelling upward, in %, on top of its own shrink. */
const EXIT_TRAVEL = 15;
const MIN_SCALE = 0.85;
/** How saturated `tint` gets at its strongest (right at handoff), as a `color-mix` percentage. */
const MAX_TINT = 12;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** One of the site's existing six layer colours (see `@assembly/tokens`), reused here as a section's
 * own identity colour rather than introducing a new palette. */
type Tint = "cobalt" | "mint" | "butter" | "signal" | "lilac" | "rose";

/**
 * Wraps one complete section — everything in it, not just its title strip — so scrolling through it
 * reads as one sheet being pulled away into the distance while the next rises up from below to take its
 * place, at the same time. Three phases share one continuous scroll gesture, never a nested scrollbar:
 *
 *   1. Entry (skipped for `isFirst`): while the section's sticky frame is still approaching from below —
 *      its own `getBoundingClientRect().top` still positive, not yet stuck — it is scaled down and
 *      pushed further down in proportion to how far below the viewport it still is. This costs no extra
 *      scroll distance of its own: it rides the one viewport of *ordinary* scroll every sticky element
 *      needs to arrive at `top: 0` in the first place.
 *   2. Reveal: once stuck (`top` pinned at `0`), the section's own content — which is very often taller
 *      than one viewport — translates upward inside the fixed frame as the *same* scroll continues,
 *      exactly the reading order a normal, unpinned page would give it. Nothing about a section's real
 *      content is ever skipped or hidden; a short section (little content) just has a short reveal.
 *   3. Exit (skipped for `isLast`): once fully revealed, the frame releases and — like any released
 *      sticky element — spends one more viewport of ordinary scroll moving back into normal flow and off
 *      the top of the screen. That viewport is what phase 3 animates through (shrinking, fading, still
 *      travelling up), rather than leaving it as dead scroll. Because sheets sit back to back with no
 *      gap, this is the *exact* span of scroll the next sheet's own phase 1 is riding — so the two always
 *      land in sync without either component knowing about the other.
 *
 * `position: sticky`, not scroll-jacking: native scroll is only ever read (rAF-throttled, direct DOM
 * writes — the same safe pattern as `ScrollAssembly` and `ArchitectureTabs`'s illustration), never driven
 * by this component. Off entirely under `prefers-reduced-motion` or when JavaScript never runs — the
 * section then renders exactly as if this wrapper did not exist: normal flow, normal height, nothing
 * pinned, nothing to hide behind.
 */
export function SectionStage({
  children,
  isFirst,
  isLast,
  tint,
  sketch,
}: {
  children: ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  /** This section's own identity colour — see `Tint` above. Omit for no background tint at all. */
  tint?: Tint;
  /**
   * This section's corner line-figure (see `sketch-figures.tsx`), as an already-rendered element —
   * `<SketchIntro />`, not the component itself. A component reference is a function, and functions
   * can't cross from the server components that call `SectionStage` into this client component; a
   * rendered element is just data, so it can.
   */
  sketch?: ReactElement<{ className?: string }>;
}) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const evaluate = () => setActive(motionOk.matches);
    evaluate();
    motionOk.addEventListener("change", evaluate);
    return () => motionOk.removeEventListener("change", evaluate);
  }, []);

  useEffect(() => {
    if (!active) return;
    const spacer = spacerRef.current;
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!spacer || !frame || !content) return;

    // The spacer is always exactly one viewport (for the frame itself) plus however much of the
    // section's own content doesn't already fit in one viewport. No separate entry/exit budget is added
    // on top — phases 1 and 3 are "free", riding the one viewport of ordinary approach/release scroll
    // that a sticky element of this height already requires (see the doc comment above).
    let revealDistance = 0;
    const measure = () => {
      const vh = window.innerHeight;
      revealDistance = Math.max(0, content.scrollHeight - vh);
      spacer.style.height = `${vh + revealDistance}px`;
    };

    let rafId = 0;
    const apply = () => {
      rafId = 0;
      const vh = window.innerHeight;
      // `frame` already carries our own `scale`/`translate` from the previous tick, so its own
      // `getBoundingClientRect()` reflects that transform, not the plain sticky position underneath it
      // — reading it back here would feed the output of one frame in as the input to the next. The
      // spacer never has a transform applied, so its rect is used to derive what the frame's untransformed
      // top would be instead: still above the viewport while approaching (`spacerTop`), pinned at `0`
      // once there's still spacer left below one viewport's worth, and negative (released, moving up)
      // once there isn't.
      const spacerRect = spacer.getBoundingClientRect();
      const frameTop = spacerRect.top > 0 ? spacerRect.top : Math.min(0, spacerRect.bottom - vh);

      // Phase 1: how far the frame still is below its stuck position (positive = still approaching).
      // Phase 3: how far the frame has travelled past its stuck position after releasing (0 while still
      // approaching or stuck; grows only once `frameTop` goes negative). Both ride the *full* viewport on
      // purpose — `entryProgress` and `exitProgress` are then exact complements of each other across the
      // whole shared window (one section's `1 - exitProgress` is the next section's own `entryProgress`
      // at that same scroll position), so their opacities always sum to 1: there is no point in the
      // handoff where combined visible "weight" dips below a full section's worth. A smaller fraction
      // was tried here to make the handoff feel snappier — it broke exactly that complementary property
      // and produced a stretch where the outgoing section had already faded out before the incoming one
      // was more than partially faded in, which read as a blank gap.
      const entryProgress = isFirst ? 1 : clamp01(1 - frameTop / vh);
      const exitProgress = isLast ? 0 : clamp01(-frameTop / vh);

      // Phase 2: `-spacerRect.top` is already 0 exactly when the frame first becomes stuck (that's the
      // instant the spacer's own top reaches the viewport top) and grows from there — the approach phase
      // (phase 1) happens entirely *before* this value starts counting, while `spacerRect.top` is still
      // positive, so it needs no separate subtraction here. (An earlier version subtracted a full
      // viewport for it anyway, which double-counted the approach and meant any section whose
      // `revealDistance` was less than one viewport — i.e. every section except `isFirst` ones — could
      // never reveal past its first frame at all: `scrolledSinceTop` never got large enough to clear that
      // extra, needless subtraction before the section had already released.)
      const scrolledSinceTop = Math.max(0, -spacerRect.top);
      const revealed = revealDistance > 0 ? clamp01(scrolledSinceTop / revealDistance) : 0;

      const scale = 1 - (1 - entryProgress) * (1 - MIN_SCALE) - exitProgress * (1 - MIN_SCALE);
      const translateY = (1 - entryProgress) * 100 - exitProgress * EXIT_TRAVEL;
      frame.style.scale = `${scale}`;
      frame.style.translate = `0 ${translateY}%`;
      frame.style.opacity = String(entryProgress * (1 - exitProgress));
      content.style.translate = `0 ${-revealed * revealDistance}px`;

      // The tint reads as a colour pulse at the handoff — strongest right as this section arrives or
      // departs, settling back to plain paper for the (usually much longer) reading phase in between, so
      // the colour never competes with the section's own content while it's actually being read.
      if (tint) {
        const tintStrength = Math.max(1 - entryProgress, exitProgress);
        frame.style.backgroundColor = `color-mix(in srgb, var(--color-${tint}) ${tintStrength * MAX_TINT}%, transparent)`;
      }
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(apply);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // `measure()` at mount can under-measure content that grows afterward — a web font swapping in, an
    // image finishing layout, a section's own client-side reveal state (e.g. `AtlasField`'s staggered
    // entrance) changing height. A stale, too-small `revealDistance` then caps the spacer short of the
    // section's real height, so phase 2 can never translate far enough to show everything below the
    // fold — content is silently left unreachable rather than just revealed late. Re-measuring on any
    // actual size change (not just window resize) is what phase 2's "nothing is ever hidden" guarantee
    // depends on.
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(content);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      frame.style.scale = "";
      frame.style.translate = "";
      frame.style.opacity = "";
      frame.style.backgroundColor = "";
      content.style.translate = "";
      spacer.style.height = "";
    };
  }, [active, isFirst, isLast, tint]);

  if (!active) return <>{children}</>;

  return (
    <div ref={spacerRef} className="relative">
      <div ref={frameRef} className="sticky top-0 h-screen overflow-hidden">
        {sketch
          ? cloneElement(sketch, {
              className:
                "pointer-events-none absolute -right-6 -top-6 size-64 select-none text-line opacity-70 sm:size-80 lg:-right-10 lg:-top-10 lg:size-96",
            })
          : null}
        <div ref={contentRef} className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}
