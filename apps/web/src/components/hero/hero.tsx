import type { CSSProperties } from "react";
import { site } from "@assembly/content";
import { layer, layerIds } from "@assembly/tokens";
import { sheetCount } from "../../lib/nav";
import { ExplodedPhone } from "./exploded-phone";

/** The approved concept line (README and brand guide). It is the tagline, not a claim about the work. */
const CONCEPT =
  "A developer's world taken apart layer by layer, so you can see how it's built and who builds it.";

/** The headline reads "<craft> · <title>". Both halves come from the content data. */
const [craft = site.headline] = site.headline.split(" · ");

/**
 * When the intro text and the CTA row resolve, in milliseconds — coordinated with, but independent of,
 * `ExplodedPhone`'s own timing (its `ENTRY` table): the illustration is substantially assembled by the
 * time the name/title appear, and the CTA is the last thing to settle, once the whole system reads as
 * ready. Two groups only, not a line-by-line reveal — see `hero-text-group` in `hero-motion.css`.
 */
const INTRO_DELAY = 900;
const CTA_DELAY = 1200;

/**
 * Each key item's delay, mirroring (not importing — see `ExplodedPhone`'s own note on why these two
 * files each carry their own small timing table rather than sharing one) the corresponding layer's own
 * delay in `exploded-phone.tsx`'s `ENTRY`, plus a fixed offset: the key item activates a beat after its
 * layer starts settling, not simultaneously and not only once everything else is done.
 */
const KEY_EXTRA = 280;
const KEY_DELAY: Record<string, number> = {
  delivery: 140 + KEY_EXTRA,
  native: 210 + KEY_EXTRA,
  state: 280 + KEY_EXTRA,
  components: 350 + KEY_EXTRA,
  interface: 420 + KEY_EXTRA,
  leadership: 520 + KEY_EXTRA,
};

/** A CSS custom property in an inline `style` object — React's own type just doesn't spell this out. */
type Vars = CSSProperties & Record<`--${string}`, string | number>;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="page-shell py-6 md:py-8">
      <div className="hero-chrome title-block" aria-hidden="true">
        <span className="tech-label">Sheet 1/{sheetCount}</span>
        <span className="tech-label">Hero</span>
        <span className="tech-label">Exploded</span>
      </div>

      <div style={{ "--hero-delay": `${INTRO_DELAY}ms` } as Vars} className="hero-text-group mt-8">
        <p className="tech-label m-0">Assembly · Developer portfolio</p>
        {/* Below 380px the display floor (40px) is wider than the screen: 8.46em is the width of "Bhuvneshwar". */}
        <h1
          id="hero-title"
          className="type-display-2 m-0 mt-3 max-[380px]:text-[length:calc((100vw_-_2rem)/8.6)]"
        >
          <span className="inline-block">Bhuvneshwar</span>{" "}
          <span className="inline-block">Rana</span>
        </h1>
        <div className="mt-5">
          <p className="type-h3 m-0">{craft}</p>
          <p className="type-h3 m-0 mt-1 text-ink-soft">{site.role}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
        <div className="lg:order-2 lg:col-span-7">
          <ExplodedPhone />
        </div>

        <div
          style={{ "--hero-delay": `${CTA_DELAY}ms` } as Vars}
          className="hero-text-group flex flex-col gap-6 lg:order-1 lg:col-span-5"
        >
          <div className="rule-info" />
          <p className="type-body-lg m-0 max-w-[44ch]">{CONCEPT}</p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#layer-key"
              className="type-body inline-flex min-h-12 items-center rounded-pill bg-accent px-6 font-bold text-paper"
            >
              Inspect the layers
            </a>
            <a
              href="#contact"
              className="type-body inline-flex min-h-12 items-center rounded-pill border-[1.5px] border-ink px-6 font-bold text-ink"
            >
              Get in touch
            </a>
          </div>
        </div>
      </div>

      <ol
        id="layer-key"
        aria-label="The six layers of the exploded phone"
        className="m-0 mt-10 grid list-none grid-cols-2 gap-x-4 gap-y-5 p-0 sm:grid-cols-3 lg:grid-cols-6"
      >
        {layerIds.map((id) => (
          <li
            key={id}
            style={{ "--hero-delay": `${KEY_DELAY[id]}ms` } as Vars}
            className="hero-key-item"
          >
            <div
              className={`layer-${id} type-label flex min-h-11 items-center gap-3 rounded-sm px-3`}
            >
              <span aria-hidden="true">{layer[id].number}</span>
              {id}
            </div>
            <div
              className={`hatch-${id} h-3 border-x-[1.5px] border-b-[1.5px] border-ink`}
              aria-hidden="true"
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
