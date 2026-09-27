"use client";

import { useEffect, useRef, type ReactNode } from "react";

type OrientationConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

/**
 * A pointer-reactive 3D stage: it only publishes the pointer position as CSS custom properties
 * (`--tx`/`--ty` in -1..1, `--gx`/`--gy` in %) on its root. Everything visual — the plane's tilt, each
 * layer's parallax depth, the glare — lives in `tilt-stage.css`, so children stay plain server-rendered
 * markup and this file stays a few dozen lines with no animation library.
 *
 * Only a fine pointer with hover (a mouse or pen) drives it; touch devices get a slow CSS sway instead,
 * and `prefers-reduced-motion` gets neither.
 *
 * With `gyro`, a phone's motion sensor drives the same variables: tilt the phone and the scene tilts with it.
 * Android just works; iPhone Safari (secure context only) makes the visitor grant motion access from a tap,
 * so a small "Tap to tilt" button appears there. Until the first sensor reading arrives the CSS sway stays.
 */
export function TiltStage({
  children,
  className = "",
  gyro = false,
}: {
  children: ReactNode;
  className?: string;
  gyro?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gyroButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phone = window.matchMedia("(max-width: 767px) and (hover: none) and (pointer: coarse)");
    if (reduceMotion.matches) return;

    if (gyro && phone.matches && !finePointer.matches) {
      const Orientation = window.DeviceOrientationEvent as OrientationConstructor | undefined;
      if (!Orientation) return;
      const button = gyroButtonRef.current;
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      // Degrees of phone tilt (from wherever it started, slowly re-centring) that map to the full -1..1 range.
      const RANGE = 20;
      let base: { b: number; g: number } | null = null;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let frame = 0;
      let listening = false;
      let askTimer = 0;

      const tick = () => {
        currentX += (targetX - currentX) * 0.14;
        currentY += (targetY - currentY) * 0.14;
        root.style.setProperty("--tx", currentX.toFixed(4));
        root.style.setProperty("--ty", currentY.toFixed(4));
        root.style.setProperty("--gx", `${(50 + currentX * 40).toFixed(1)}%`);
        root.style.setProperty("--gy", `${(40 + currentY * 40).toFixed(1)}%`);
        const settled =
          Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;
        frame = settled ? 0 : requestAnimationFrame(tick);
      };
      const onOrientation = (event: DeviceOrientationEvent) => {
        if (typeof event.beta !== "number" || typeof event.gamma !== "number") return;
        if (!base) {
          base = { b: event.beta, g: event.gamma };
          root.dataset.gyro = "true"; // a real reading arrived: the CSS sway steps aside
          if (button) button.hidden = true;
          window.clearTimeout(askTimer);
        }
        base.b += (event.beta - base.b) * 0.004;
        base.g += (event.gamma - base.g) * 0.004;
        targetX = clamp((event.gamma - base.g) / RANGE);
        targetY = clamp((event.beta - base.b) / RANGE);
        if (!frame) frame = requestAnimationFrame(tick);
      };
      const listen = () => {
        if (listening) return;
        listening = true;
        window.addEventListener("deviceorientation", onOrientation);
      };
      const onButton = async () => {
        try {
          const result = await (Orientation.requestPermission as () => Promise<string>)();
          if (result === "granted") {
            listen();
            if (button) button.hidden = true;
          } else if (button) button.hidden = true;
        } catch {
          if (button) button.hidden = true;
        }
      };

      // Listen straight away: Android (and iOS once access is granted) delivers readings without any prompt.
      listen();
      if (typeof Orientation.requestPermission === "function" && button) {
        // If nothing arrives, this is iPhone Safari waiting for permission, which has to be asked for from a tap.
        askTimer = window.setTimeout(() => {
          if (!base) {
            button.hidden = false;
            button.addEventListener("click", onButton);
          }
        }, 900);
      }
      return () => {
        window.clearTimeout(askTimer);
        window.removeEventListener("deviceorientation", onOrientation);
        button?.removeEventListener("click", onButton);
        if (button) button.hidden = true;
        delete root.dataset.gyro;
        if (frame) cancelAnimationFrame(frame);
      };
    }

    if (!finePointer.matches) return;

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
  }, [gyro]);

  return (
    <div ref={rootRef} className={`tilt-stage ${className}`}>
      {children}
      {gyro ? (
        <button ref={gyroButtonRef} type="button" hidden className="tilt-gyro-btn">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="tilt-gyro-icon">
            <rect x="8" y="3" width="8" height="15" rx="2" transform="rotate(-18 12 12)" />
            <path d="M4 20c3 2 13 2 16 0" />
          </svg>
          Tap to tilt
        </button>
      ) : null}
    </div>
  );
}
