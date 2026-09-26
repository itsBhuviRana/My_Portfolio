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
          className="glass-chip type-label rounded-sm px-2 py-1 [overflow-wrap:anywhere]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Short monograms for the fast-scan tech/company badges below. Curated by hand for legibility (an
 * auto-derived initialism reads worse for "React Native CLI" than a chosen "CLI" does) with a safe
 * fallback so an unlisted name still renders something reasonable instead of breaking.
 */
const MONOGRAMS: Record<string, string> = {
  "React Native": "RN",
  "React Native CLI": "CLI",
  Expo: "EX",
  "React.js": "R",
  "Next.js": "N",
  "Vue.js": "V",
  "Node.js": "JS",
  "Telus Digital": "TD",
  PwC: "PwC",
  BugendaiTech: "BT",
  "Candour Software": "CS",
  Sisgain: "SG",
};

function monogramFor(name: string): string {
  return (
    MONOGRAMS[name] ??
    name
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 2)
      .toUpperCase()
  );
}

/**
 * The same six layer fills used for the Hero/Atlas colour system, cycled by position — not because these
 * items *are* layers, just reusing the one palette the site already has rather than inventing a second.
 * The text colour pairs with each fill exactly as the Hero's own `layer` tokens do (`cobalt` is the one
 * fill that needs paper text; the rest read on ink).
 */
const BADGE_FILL = [
  { bg: "bg-cobalt", text: "text-paper" },
  { bg: "bg-mint", text: "text-ink" },
  { bg: "bg-butter", text: "text-ink" },
  { bg: "bg-signal", text: "text-ink" },
  { bg: "bg-lilac", text: "text-ink" },
  { bg: "bg-rose", text: "text-ink" },
] as const;

/**
 * A fast-scan credibility badge: a filled monogram square (colour cycling through the site's existing
 * palette, so a row of these reads at a glance the way the Hero's numbered layers do) plus the full name,
 * never colour alone. Used for the career stack and the companies worked with — real, confirmed names
 * only, never invented ones.
 */
export function StackBadge({ name, index }: { name: string; index: number }) {
  const fill = BADGE_FILL[index % BADGE_FILL.length]!;
  return (
    <span className="glass-chip inline-flex items-center gap-2 py-1 pr-3 pl-1">
      <span
        aria-hidden="true"
        className={`type-label flex h-6 min-w-6 shrink-0 items-center justify-center rounded-sm px-1 ${fill.bg} ${fill.text}`}
      >
        {monogramFor(name)}
      </span>
      <span className="type-label [overflow-wrap:anywhere]">{name}</span>
    </span>
  );
}

/**
 * A project's domain, as a small chip. Solid ink border when the domain is confirmed by the product
 * itself; dashed when it is indicated only by the project name (never a stated fact).
 */
export function DomainTag({ domain, fromName }: { domain: string; fromName?: boolean }) {
  return (
    <span
      className={`type-label inline-flex w-fit items-center rounded-sm border bg-[color-mix(in_srgb,var(--color-paper)_40%,transparent)] px-2 py-1 [overflow-wrap:anywhere] ${
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
