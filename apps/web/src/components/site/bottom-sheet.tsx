"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

export type Detent = 0 | 1 | 2;

/**
 * A draggable bottom sheet for phones (the Apple Maps pattern): it sits at the bottom of its positioned parent
 * and rests at one of three heights — a peek (just the header), about half, or nearly full. The visitor drags
 * the header up or down and it settles on the nearest height, carrying a flick's momentum with it; a tap on the
 * header toggles peek/half. The body scrolls once the sheet is open (and holds onto its own scroll), never at peek.
 *
 * Controlled: the parent owns `detent`. `onVisible` reports how many pixels of the sheet are showing at rest,
 * so whatever is behind it (a 3D scene) can keep its subject clear of the sheet.
 */
export function BottomSheet({
  detent,
  onDetent,
  peek,
  header,
  children,
  onVisible,
  label,
}: {
  detent: Detent;
  onDetent: (next: Detent) => void;
  /** Pixels showing at the smallest height. */
  peek: number;
  header: ReactNode;
  children: ReactNode;
  onVisible?: (px: number) => void;
  label: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState(0);
  const [live, setLive] = useState<number | null>(null);
  const drag = useRef<{
    startY: number;
    startVisible: number;
    moved: number;
    lastY: number;
    lastT: number;
    velocity: number;
  } | null>(null);

  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(() => setBox(parent.clientHeight));
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const full = Math.max(peek + 140, box - 56);
  const half = Math.min(full - 60, Math.max(peek + 120, Math.round(box * 0.5)));
  const heights: [number, number, number] = [peek, half, full];
  const resting = heights[detent];

  useEffect(() => {
    onVisible?.(resting);
  }, [resting, onVisible]);

  const onDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Buttons and switches in the header keep their own taps; only the empty header area drags.
    if ((event.target as HTMLElement).closest("button, [role='switch'], a")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startY: event.clientY,
      startVisible: resting,
      moved: 0,
      lastY: event.clientY,
      lastT: performance.now(),
      velocity: 0,
    };
    setLive(resting);
  };
  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    const dy = d.startY - event.clientY;
    d.moved = Math.max(d.moved, Math.abs(dy));
    const dt = Math.max(1, now - d.lastT);
    d.velocity = (d.lastY - event.clientY) / dt;
    d.lastY = event.clientY;
    d.lastT = now;
    setLive(Math.max(peek * 0.85, Math.min(full, d.startVisible + dy)));
  };
  const onUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (d.moved < 6) {
      onDetent(detent === 0 ? 1 : detent === 1 ? 0 : 1);
    } else {
      const projected = (live ?? resting) + d.velocity * 180;
      let best: Detent = 0;
      for (const i of [0, 1, 2] as const) {
        if (Math.abs(heights[i] - projected) < Math.abs(heights[best] - projected)) best = i;
      }
      onDetent(best);
    }
    setLive(null);
  };
  const onKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onDetent(detent === 0 ? 1 : 0);
    }
  };

  const visible = live ?? resting;
  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={label}
      className="bottom-sheet"
      style={{
        height: full,
        transform: `translateY(${full - visible}px)`,
        transition: live === null ? "transform 460ms cubic-bezier(0.2, 0.9, 0.25, 1)" : "none",
      }}
    >
      <div
        className="bottom-sheet-head"
        role="button"
        tabIndex={0}
        aria-expanded={detent > 0}
        aria-label={`${label}: ${detent === 0 ? "expand" : "collapse"}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      >
        <span className="bottom-sheet-grab" aria-hidden="true" />
        {header}
      </div>
      <div className="bottom-sheet-body" style={{ overflowY: detent === 0 ? "hidden" : "auto" }}>
        {children}
      </div>
    </div>
  );
}
