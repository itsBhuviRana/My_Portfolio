"use client";

import { useId, useRef, useState } from "react";
import type { NavItem } from "../../lib/nav";

/**
 * Primary navigation. On smaller screens the list is a disclosure opened by a button (Escape closes it and
 * returns focus to the button). From `xl` up the list is always visible, because six items do not fit
 * beside the wordmark on a tablet. Sections that are not built yet
 * are shown as placeholders, not links.
 */
export function NavMenu({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();

  return (
    <nav
      aria-label="Primary"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="tech-label inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-ink px-4 text-ink xl:hidden"
      >
        {open ? "Close" : "Menu"}
      </button>
      <ul
        id={listId}
        className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-full z-40 m-0 list-none flex-col border-b-[1.5px] border-ink bg-paper p-0 xl:static xl:flex xl:flex-row xl:gap-6 xl:border-0 xl:bg-transparent`}
      >
        {items.map((item, index) => (
          <li key={item.id} className="border-t border-rule xl:border-0">
            {item.available ? (
              <a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="tech-label flex min-h-11 items-center gap-2 px-4 text-ink md:px-8 xl:px-0"
              >
                <span aria-hidden="true">{String(index + 2).padStart(2, "0")}</span>
                {item.label}
              </a>
            ) : (
              <span className="tech-label flex min-h-11 items-center gap-2 px-4 md:px-8 xl:px-0">
                <span aria-hidden="true">{String(index + 2).padStart(2, "0")}</span>
                {item.label}
                <span className="sr-only"> (coming soon)</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
