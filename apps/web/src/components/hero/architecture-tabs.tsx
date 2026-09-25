"use client";

import { useState } from "react";
import { ExplodedPhone } from "./exploded-phone";

type Variant = "mobile" | "web";

const TABS: readonly { id: Variant; label: string }[] = [
  { id: "mobile", label: "Mobile Architecture" },
  { id: "web", label: "Web Architecture" },
];

function MobileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0">
      <rect x="7" y="2" width="10" height="20" rx="2" className="fill-none stroke-outline" />
      <line x1="10" y1="18.5" x2="14" y2="18.5" className="stroke-hairline" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0">
      <rect x="2" y="4" width="20" height="16" rx="2" className="fill-none stroke-outline" />
      <line x1="2" y1="8.5" x2="22" y2="8.5" className="stroke-hairline" />
      <circle cx="5" cy="6.25" r="0.6" className="fill-ink" />
      <circle cx="7.4" cy="6.25" r="0.6" className="fill-ink" />
    </svg>
  );
}

/**
 * Switches the Hero illustration between its two architecture readings. The stack underneath is the
 * same six layers either way — it represents one developer's practice, not two different codebases — so
 * only the frame changes: a browser chrome bar (address bar + traffic lights) appears above the
 * illustration for "Web", exactly the way a real browser window would sit above a rendered page. Mobile
 * is the default: it renders on the server with no client state needed, so a visitor without JavaScript
 * (or before this component hydrates) still sees the complete, correct illustration — switching tabs is
 * the only thing that needs the client.
 */
export function ArchitectureTabs() {
  const [variant, setVariant] = useState<Variant>("mobile");

  return (
    <div>
      <div role="tablist" aria-label="Illustration view" className="title-block">
        {TABS.map((tab) => {
          const active = variant === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setVariant(tab.id)}
              className={`type-label flex min-h-11 cursor-pointer items-center justify-center gap-2 transition-colors duration-200 ${
                active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              }`}
            >
              {tab.id === "mobile" ? <MobileIcon /> : <WebIcon />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {variant === "web" ? (
        <div
          aria-hidden="true"
          className="flex items-center gap-2 border-x-[1.5px] border-t-[1.5px] border-ink bg-paper px-3 py-2"
        >
          <span className="size-2 shrink-0 rounded-full bg-accent" />
          <span className="size-2 shrink-0 rounded-full bg-butter" />
          <span className="size-2 shrink-0 rounded-full bg-mint" />
          <span className="tech-label ml-2 truncate">assembly.dev/architecture</span>
        </div>
      ) : null}

      <ExplodedPhone />
    </div>
  );
}
