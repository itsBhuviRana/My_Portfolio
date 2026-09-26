import type { CSSProperties, ReactNode } from "react";
import { site } from "@assembly/content";
import { layer, layerIds } from "@assembly/tokens";
import { sheetCount } from "../../lib/nav";
import { ArchitectureTabs } from "./architecture-tabs";
import { HeroDesk } from "./hero-desk";

/** The approved concept line (README and brand guide). It is the tagline, not a claim about the work. */
const CONCEPT =
  "A developer's world taken apart layer by layer, so you can see how it's built and who builds it.";

/** The headline reads "<craft> · <title>". Both halves come from the content data. */
const [craft = site.headline] = site.headline.split(" · ");

/**
 * The identity block resolves as three separate beats, not one group: the eyebrow, then the name, then
 * the role, each "printing" in character by character (see `PrintChars` below and `.hero-print-char` in
 * `hero-motion.css`) — coordinated with, but independent of, `ExplodedPhone`'s own timing (its `ENTRY`
 * table). The CTA row is still the last thing to settle, once the whole system reads as ready.
 */
const EYEBROW_DELAY = 900;
const NAME_DELAY = EYEBROW_DELAY + 180;
const ROLE_DELAY = NAME_DELAY + 180;
const ROLE_LINE_2_DELAY = ROLE_DELAY + 120;
const CTA_DELAY = ROLE_DELAY + 400;

/** How long, in ms, one word's characters take to fully print before the next beat can start reading. */
const PRINT_STEP = 13;

/**
 * Splits `text` on spaces into inline-block word groups (so a word never breaks mid-letter across a
 * line), each letter its own `.hero-print-char` span staggered by `PRINT_STEP` — the CSS keyframe does
 * the rest. The real string still exists for assistive tech via a sibling `sr-only` span at each call
 * site: this output is `aria-hidden`, decoration standing in front of the accessible text, never a
 * replacement for it.
 */
function PrintChars({ text, baseDelay }: { text: string; baseDelay: number }): ReactNode {
  const words = text.split(" ");
  let index = 0;
  const nodes: ReactNode[] = [];

  words.forEach((word, wi) => {
    nodes.push(
      <span key={`w${wi}`} className="inline-block">
        {[...word].map((ch, ci) => {
          const delay = baseDelay + index * PRINT_STEP;
          index += 1;
          return (
            <span
              key={ci}
              className="hero-print-char"
              style={{ "--hero-delay": `${delay}ms` } as Vars}
            >
              {ch}
            </span>
          );
        })}
      </span>,
    );
    if (wi < words.length - 1) nodes.push(" ");
  });

  return <span aria-hidden="true">{nodes}</span>;
}

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
      <div className="hero-chrome hero-border-flow title-block" aria-hidden="true">
        <span className="tech-label">Sheet 1/{sheetCount}</span>
        <span className="tech-label">Hero</span>
        <span className="tech-label">Exploded</span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-x-12 lg:gap-y-8">
        <div className="[container-type:inline-size] lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="tech-label m-0">
            <span className="sr-only">Assembly · Developer portfolio</span>
            <PrintChars text="Assembly · Developer portfolio" baseDelay={EYEBROW_DELAY} />
          </p>
          {/* Below 380px the display floor (40px) is wider than the screen: 8.46em is the width of "Bhuvneshwar". */}
          <h1
            id="hero-title"
            className="type-display-2 m-0 mt-3 max-[380px]:text-[length:calc((100vw_-_2rem)/8.6)] lg:text-[length:min(4.5rem,calc(100cqw/8.7))]"
          >
            <span className="sr-only">Bhuvneshwar Rana</span>
            <PrintChars text="Bhuvneshwar Rana" baseDelay={NAME_DELAY} />
          </h1>
          <div className="mt-5">
            <p className="type-h3 m-0">
              <span className="sr-only">{craft}</span>
              <PrintChars text={craft} baseDelay={ROLE_DELAY} />
            </p>
            <p className="type-h3 m-0 mt-1 text-ink-soft">
              <span className="sr-only">{site.role}</span>
              <PrintChars text={site.role} baseDelay={ROLE_LINE_2_DELAY} />
            </p>
          </div>
        </div>
        <HeroDesk className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center" />
        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <div
            style={{ "--hero-delay": `${CTA_DELAY}ms` } as Vars}
            className="hero-text-group flex flex-col gap-6"
          >
            <div className="rule-info" />
            <p className="type-body-lg m-0 max-w-[44ch]">{CONCEPT}</p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#layer-key"
                className="hero-btn-fill-pulse type-body inline-flex min-h-12 items-center rounded-pill bg-accent px-6 font-bold text-paper"
              >
                Inspect the layers
              </a>
              <a
                href="#contact"
                className="hero-btn-border-pulse glass type-body inline-flex min-h-12 items-center rounded-pill px-6 font-bold text-ink"
              >
                Get in touch
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <ArchitectureTabs />
      </div>

      <ol
        id="layer-key"
        aria-label="The six layers of the exploded illustration"
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
