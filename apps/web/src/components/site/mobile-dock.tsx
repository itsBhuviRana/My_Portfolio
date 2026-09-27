"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";

/**
 * The phone's navigation: a floating liquid-glass dock at the bottom of the screen (thumb range), with one
 * item per section and a glass "lens" that slides to the section being read. Phones only: the whole thing is
 * `display: none` from 768px up (mobile-dock.css), and nothing below even attaches a listener there, so the
 * desktop page is untouched. It hides while the visitor scrolls down and returns as soon as they scroll up.
 *
 * Every item is a plain `#anchor` link, so it works (and is announced) like any other link.
 */
const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "work", label: "Projects" },
  { id: "dijkastra", label: "Now" },
  { id: "capabilities", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

const PHONE = "(max-width: 767px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function Icon({ id }: { id: (typeof SECTIONS)[number]["id"] }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    className: "mobile-dock-icon",
  } as const;
  switch (id) {
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "work":
      return (
        <svg {...common}>
          <path d="M3 21h18M5 21V10h5v11M10 21V4h5v17M15 21v-8h4v8" />
        </svg>
      );
    case "dijkastra":
      return (
        <svg {...common}>
          <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
          <path d="M10.5 18.5h3" />
        </svg>
      );
    case "capabilities":
      return (
        <svg {...common}>
          <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3.5 7.5l8.5 6 8.5-6" />
        </svg>
      );
  }
}

export function MobileDock() {
  const isPhone = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );
  const [active, setActive] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  // Tapping a dock item scrolls the page down; that scroll must not hide the dock the visitor is still using.
  const pinnedUntil = useRef(0);

  useEffect(() => {
    if (!isPhone) return;
    const nav = navRef.current;
    if (!nav) return;
    let frame = 0;
    let last = window.scrollY;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current = 0;
      SECTIONS.forEach((section, index) => {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= line) current = index;
      });
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(atBottom ? SECTIONS.length - 1 : current);

      const y = window.scrollY;
      const dy = y - last;
      if (y < 80 || atBottom || dy < -6 || performance.now() < pinnedUntil.current) {
        nav.dataset.hidden = "false";
      } else if (dy > 8) {
        nav.dataset.hidden = "true";
      }
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isPhone]);

  return (
    <nav
      ref={navRef}
      aria-label="Sections"
      className="mobile-dock"
      data-hidden="false"
      style={{ "--i": active } as CSSProperties}
    >
      <span className="mobile-dock-lens" aria-hidden="true" />
      <ul className="mobile-dock-list">
        {SECTIONS.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === index ? "true" : undefined}
              className="mobile-dock-item"
              onClick={() => {
                setActive(index);
                pinnedUntil.current = performance.now() + 2200;
              }}
            >
              <Icon id={section.id} />
              <span>{section.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
