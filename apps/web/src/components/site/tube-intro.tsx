"use client";

import { useEffect, useRef, useState } from "react";
import { TUBE_INTRO_SEEN_KEY } from "./tube-intro-script";

/**
 * The first-visit intro: a blown-out white room lit by one tube light that rises in from the bottom edge,
 * and a wall switch. Turning the switch off flips it to OFF, dims the tube slowly, and lets the white light
 * drift up and out of the screen, uncovering the real (black) page.
 *
 * Whether it shows is decided by `TUBE_INTRO_SCRIPT` (tube-intro-script.ts), an inline script that runs in `<head>`
 * before first paint and sets `data-intro` on `<html>`. That is what lets CSS show the overlay from the very
 * first frame with no flash of the site, while a visitor without JavaScript, with reduced motion, or who
 * already switched it off this session never gets the attribute — so the overlay stays `display: none`
 * and the page is simply there. `?intro` in the URL forces a replay for review.
 *
 * `data-intro` values: "on" (waiting for the switch: page animations are paused so the Hero prints in
 * *after* the light goes out, and scrolling is locked) and "leaving" (the fade to the site).
 */
/** Time from the switch flip until the site's own animations are released, and until the overlay is removed. */
const RELEASE_MS = 3400;
const REMOVE_MS = 5800;

type Phase = "waiting" | "off" | "gone";

/** The head script only sets `data-intro` when the intro should show; otherwise the overlay is just hidden markup. */
function isIntroActive() {
  return document.documentElement.hasAttribute("data-intro");
}

/** Everything outside the overlay is made inert while it is up, so Tab and screen readers can't wander behind it. */
function setPageInert(overlay: HTMLElement, inert: boolean) {
  for (const child of Array.from(document.body.children)) {
    if (child === overlay || child.tagName === "SCRIPT") continue;
    if (inert) child.setAttribute("inert", "");
    else child.removeAttribute("inert");
  }
}

export function TubeIntro() {
  const [phase, setPhase] = useState<Phase>("waiting");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (phase !== "waiting" || !root || !isIntroActive()) return;
    setPageInert(root, true);
    return () => setPageInert(root, false);
  }, [phase]);

  useEffect(() => {
    if (phase !== "waiting" || !isIntroActive()) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") turnOff();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => {
    if (phase !== "off") return;
    const html = document.documentElement;
    const release = window.setTimeout(() => html.setAttribute("data-intro", "leaving"), RELEASE_MS);
    const remove = window.setTimeout(() => {
      html.removeAttribute("data-intro");
      setPhase("gone");
    }, REMOVE_MS);
    return () => {
      window.clearTimeout(release);
      window.clearTimeout(remove);
    };
  }, [phase]);

  function turnOff() {
    setPhase((current) => (current === "waiting" ? "off" : current));
    try {
      sessionStorage.setItem(TUBE_INTRO_SEEN_KEY, "1");
    } catch {
      // Storage unavailable: worst case the intro replays on the next load.
    }
  }

  if (phase === "gone") return null;

  const isOn = phase !== "off";

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tube-intro-title"
      className={`tube-intro ${isOn ? "" : "tube-intro--off"}`}
    >
      <div className="tube-room" aria-hidden="true" />

      <div className="tube-fixture" aria-hidden="true">
        <div className="tube-housing">
          <div className="tube-body">
            <div className="tube-lit" />
          </div>
        </div>
      </div>

      <div className="tube-ui">
        <h2 id="tube-intro-title" className="tube-title type-h3 m-0">
          Please turn off the tube light to know me who I am
        </h2>
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label="Tube light"
          className="tube-switch"
          onClick={turnOff}
        >
          <span className="tube-plate">
            <span className="tube-mark tube-mark-on" aria-hidden="true">
              ON
            </span>
            <span className="tube-rocker" aria-hidden="true" />
            <span className="tube-mark tube-mark-off" aria-hidden="true">
              OFF
            </span>
          </span>
        </button>
        <p className="tube-status tech-label m-0" aria-hidden="true">
          Light is <span className="tube-status-value">{isOn ? "ON" : "OFF"}</span>
        </p>
        <p className="tube-hint tech-label m-0" aria-hidden="true">
          Tap the switch
        </p>
      </div>
    </div>
  );
}
