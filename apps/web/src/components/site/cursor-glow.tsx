"use client";

import { useEffect, useRef } from "react";

/**
 * A torch shining down from above the window onto the pointer. The source sits just off the top edge (near
 * the horizontal centre, drifting a little toward the pointer), a soft beam runs from it to the pointer,
 * and the beam ends in a small glass orb — the spot the torch is lighting — with a much softer, larger
 * halo trailing a beat behind. Everything sits behind all content (`z-index: -1`, see cursor-glow.css), so
 * it only ever shows on the bare black page and through the translucent glass panels, never over text.
 * Each part is eased toward the pointer at its own rate in one rAF loop and written as one transform; the
 * beam is a fixed-size element that is only rotated and stretched toward the orb, and the orb's flowing
 * light is pure CSS.
 *
 * Fine pointers only: touch has no cursor to follow, and reduced-motion users get no glow at all.
 */
const ORB_EASE = 0.1;
const HALO_EASE = 0.045;
/** How far the torch source drifts toward the pointer's x, as a fraction of its distance from centre. */
const SOURCE_DRIFT = 0.14;

export function CursorGlow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const orb = orbRef.current;
    const halo = haloRef.current;
    const beam = beamRef.current;
    const source = sourceRef.current;
    if (!root || !orb || !halo || !beam || !source) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reduceMotion.matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let orbX = targetX;
    let orbY = targetY;
    let haloX = targetX;
    let haloY = targetY;
    let frame = 0;

    // Sizes live in cursor-glow.css (one source of truth) and are read once here.
    const rootStyle = getComputedStyle(root);
    const orbRadius = parseFloat(rootStyle.getPropertyValue("--orb-size")) / 2 || 105;
    const headHalf = (parseFloat(rootStyle.getPropertyValue("--torch-head")) || 44) / 2;
    const pad = parseFloat(rootStyle.getPropertyValue("--torch-pad")) || 28;
    const orbBody = orb.firstElementChild as HTMLElement | null;

    const place = (el: HTMLElement, x: number, y: number) => {
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };

    /**
     * Aims the torch at the orb so the beam meets it exactly: both of the beam's edges are the tangent lines
     * from the two sides of the torch head to the orb's circle, and the beam stops at the chord through the
     * two tangent points, with the circle itself masked out of it (see `.torch-beam`). The light therefore
     * lands on the orb's near rim with nothing spilling past its edge. The orb's own highlight is turned
     * toward the torch, so the lit side of the glass faces the light.
     */
    const aim = () => {
      const sourceX = window.innerWidth / 2 + (orbX - window.innerWidth / 2) * SOURCE_DRIFT;
      const sourceY = -24;
      const dx = orbX - sourceX;
      const dy = orbY - sourceY;
      const length = Math.hypot(dx, dy);
      place(source, sourceX, 0);

      if (orbBody) {
        orbBody.style.setProperty("--ux", (-dx / length).toFixed(3));
        orbBody.style.setProperty("--uy", (-dy / length).toFixed(3));
      }

      // Too close to the torch for a beam to make sense (the orb is over its head).
      if (length < orbRadius * 1.4) {
        beam.style.visibility = "hidden";
        return;
      }
      beam.style.visibility = "visible";

      // Tangent from the head's right corner P = (headHalf, 0) to the circle centred (0, length).
      const D = Math.hypot(headHalf, length);
      const beta = Math.asin(orbRadius / D);
      const dirX = -headHalf / D;
      const dirY = length / D;
      const tangentX = dirX * Math.cos(beta) + dirY * Math.sin(beta);
      const tangentY = -dirX * Math.sin(beta) + dirY * Math.cos(beta);
      const reach = Math.sqrt(D * D - orbRadius * orbRadius);
      const halfWidth = headHalf + reach * tangentX;
      const beamLength = reach * tangentY;

      const angle = Math.atan2(-dx, dy);
      beam.style.width = `${(2 * (halfWidth + pad)).toFixed(1)}px`;
      beam.style.height = `${beamLength.toFixed(1)}px`;
      beam.style.marginLeft = `${(-(halfWidth + pad)).toFixed(1)}px`;
      beam.style.setProperty("--mask-y", `${(length - beamLength).toFixed(1)}px`);
      beam.style.transform = `translate3d(${sourceX.toFixed(1)}px, ${sourceY}px, 0) rotate(${angle.toFixed(4)}rad)`;
    };

    const tick = () => {
      orbX += (targetX - orbX) * ORB_EASE;
      orbY += (targetY - orbY) * ORB_EASE;
      haloX += (targetX - haloX) * HALO_EASE;
      haloY += (targetY - haloY) * HALO_EASE;
      place(orb, orbX, orbY);
      place(halo, haloX, haloY);
      aim();
      const settled =
        Math.abs(targetX - orbX) < 0.2 &&
        Math.abs(targetY - orbY) < 0.2 &&
        Math.abs(targetX - haloX) < 0.2 &&
        Math.abs(targetY - haloY) < 0.2;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (!root.dataset.on) {
        orbX = haloX = targetX = event.clientX;
        orbY = haloY = targetY = event.clientY;
        place(orb, orbX, orbY);
        place(halo, haloX, haloY);
        aim();
        root.dataset.on = "true";
      }
      targetX = event.clientX;
      targetY = event.clientY;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      delete root.dataset.on;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="cursor-glow" aria-hidden="true">
      <div ref={sourceRef} className="cursor-glow-track">
        <div className="torch-source" />
      </div>
      <div ref={beamRef} className="cursor-glow-track torch-beam">
        <div className="torch-beam-blur">
          <div className="torch-beam-shape" />
        </div>
      </div>
      <div ref={haloRef} className="cursor-glow-track">
        <div className="cursor-glow-halo" />
      </div>
      <div ref={orbRef} className="cursor-glow-track">
        <div className="cursor-glow-orb">
          <span className="cursor-glow-light cursor-glow-light-a" />
          <span className="cursor-glow-light cursor-glow-light-b" />
          <span className="cursor-glow-light cursor-glow-light-c" />
        </div>
      </div>
    </div>
  );
}
