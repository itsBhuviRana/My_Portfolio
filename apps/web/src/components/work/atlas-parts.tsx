import type { ProjectPlatform } from "@assembly/content";
import { platformLabel } from "../../lib/format";

/**
 * A small square in the platform's colour plus its name. Colour is never the only signal: the text says
 * which platform it is.
 */
const SWATCH: Record<ProjectPlatform, string> = { mobile: "bg-cobalt", web: "bg-mint" };

export function PlatformTag({
  platform,
  suffix = "",
}: {
  platform: ProjectPlatform;
  suffix?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`${SWATCH[platform]} size-3 shrink-0 border-[1.5px] border-ink`}
      />
      <span className="tech-label">
        {platformLabel(platform)}
        {suffix}
      </span>
    </span>
  );
}

/** Confirmed technologies as small outlined tags. */
export function TechChips({ items }: { items: readonly string[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {items.map((item) => (
        <li
          key={item}
          className="type-label rounded-sm border border-ink bg-vellum px-2 py-1 [overflow-wrap:anywhere]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * A project's domain, as a small chip. Solid ink border when the domain is confirmed by the product
 * itself; dashed when it is indicated only by the project name (never a stated fact).
 */
export function DomainTag({ domain, fromName }: { domain: string; fromName?: boolean }) {
  return (
    <span
      className={`type-label inline-flex w-fit items-center rounded-sm border bg-vellum px-2 py-1 [overflow-wrap:anywhere] ${
        fromName ? "border-dashed border-line" : "border-ink"
      }`}
    >
      {domain}
    </span>
  );
}

/**
 * The disclosure affordance: a small filled arrowhead, the same motif used for leader lines elsewhere in
 * the site. It points right when collapsed and down when open. Its parent `<details>` needs the `group`
 * class. The rotation respects the site-wide reduced-motion rule (foundations.css), so it never needs its
 * own media query.
 */
export function ExpandGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 10 10"
      className="size-2.5 shrink-0 -rotate-90 transition-transform group-open:rotate-0"
    >
      <polygon points="1,2 9,2 5,8" className="fill-ink" />
    </svg>
  );
}
