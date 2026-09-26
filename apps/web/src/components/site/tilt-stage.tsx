"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A pointer-reactive 3D stage: it only publishes the pointer position as CSS custom properties
 * (`--tx`/`--ty` in -1..1, `--gx`/`--gy` in %) on its root. Everything visual — the plane's tilt, each
 * layer's parallax depth, the glare — lives in `tilt-stage.css`, so children stay plain server-rendered
 * markup and this file stays a few dozen lines with no animation library.
 *
 * Only a fine pointer with hover (a mouse or pen) drives it; touch devices get a slow CSS sway instead,
 * and `prefers-reduced-motion` gets neither.
 */
export function TiltStage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reduceMotion.matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      root.style.setProperty("--tx", currentX.toFixed(4));
      root.style.setProperty("--ty", currentY.toFixed(4));
      const settled = Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      targetX = Math.max(-1, Math.min(1, px * 2 - 1));
      targetY = Math.max(-1, Math.min(1, py * 2 - 1));
      root.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      root.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      kick();
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      kick();
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className={`tilt-stage ${className}`}>
      {children}
    </div>
  );
}
