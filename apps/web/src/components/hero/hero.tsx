import { site } from "@assembly/content";
import { layer, layerIds } from "@assembly/tokens";
import { sheetCount } from "../../lib/nav";
import { ExplodedPhone } from "./exploded-phone";

/** The approved concept line (README and brand guide). It is the tagline, not a claim about the work. */
const CONCEPT =
  "A developer's world taken apart layer by layer, so you can see how it's built and who builds it.";

/** The headline reads "<craft> · <title>". Both halves come from the content data. */
const [craft = site.headline] = site.headline.split(" · ");

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="page-shell py-6 md:py-8">
      <div className="title-block" aria-hidden="true">
        <span className="tech-label">Sheet 1/{sheetCount}</span>
        <span className="tech-label">Hero</span>
        <span className="tech-label">Exploded</span>
      </div>

      <div className="mt-8">
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

        <div className="flex flex-col gap-6 lg:order-1 lg:col-span-5">
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
          <li key={id}>
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
