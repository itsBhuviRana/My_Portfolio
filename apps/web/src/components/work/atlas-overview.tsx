import { careerRange, getAtlasSummary } from "@assembly/content";
import { SheetStrip } from "./sheet-strip";
import { DomainTag, TechChips } from "./atlas-parts";

const SECTION_LINKS = [
  ["featured", "Featured"],
  ["discastra", "Current project"],
  ["register", "Register"],
  ["capabilities", "Capabilities"],
] as const;

/** One cell of the breadth strip: a label, a large figure and a short line under it. */
function Signal({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-paper p-4">
      <dt className="tech-label">{label}</dt>
      <dd className="type-h1 m-0">{value}</dd>
      <dd className="tech-label m-0 [overflow-wrap:anywhere]">{note}</dd>
    </div>
  );
}

/**
 * The first thing in the Work section: how much ground the work covers. Every figure is derived from the
 * atlas data (`getAtlasSummary`), so the counts cannot drift from the register below.
 */
export function AtlasOverview() {
  const summary = getAtlasSummary();
  const { mobile, web } = summary.platforms;

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="page-shell mt-12 pb-10 md:mt-16 md:pb-12"
    >
      <div className="rule-ink" />
      <div className="mt-10">
        <SheetStrip tag="Atlas" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-7">
          <p className="tech-label m-0">All projects · approximate periods</p>
          <h2 id="work-title" className="type-h1 m-0 mt-3">
            Project atlas
          </h2>
        </div>
        <p className="type-body-lg m-0 lg:col-span-5">
          Projects worked on across companies, platforms and stacks. Details appear only where they
          are confirmed.
        </p>
      </div>

      <dl className="m-0 mt-8 grid gap-[1.5px] border-[1.5px] border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
        <Signal label="Projects" value={String(summary.total)} note="across the whole atlas" />
        <Signal
          label="Companies"
          value={String(summary.organisations)}
          note={summary.freelanceProjects > 0 ? "and freelance work" : "worked with"}
        />
        <div className="flex min-w-0 flex-col gap-3 bg-paper p-4">
          <dt className="tech-label">Platforms</dt>
          <dd className="m-0 flex h-11 border-[1.5px] border-ink">
            <span
              style={{ flex: `${mobile} 1 0` }}
              className="type-label flex min-w-0 items-center bg-cobalt px-2 text-paper"
            >
              {mobile} Mobile
            </span>
            <span
              style={{ flex: `${web} 1 0` }}
              className="type-label flex min-w-0 items-center border-l-[1.5px] border-ink bg-mint px-2 text-ink"
            >
              {web} Web
            </span>
          </dd>
          <dd className="tech-label m-0">by project platform</dd>
        </div>
        <Signal
          label="Enterprise"
          value={String(summary.enterprise.projects)}
          note={summary.enterprise.clients.join(" · ")}
        />
      </dl>

      <div className="mt-8 grid gap-3 lg:grid-cols-12 lg:items-baseline lg:gap-10">
        <p className="tech-label m-0 lg:col-span-2">Range</p>
        <div className="lg:col-span-10">
          <TechChips items={careerRange} />
        </div>
      </div>

      {summary.domains.confirmed.length + summary.domains.fromName.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-12 lg:items-baseline lg:gap-10">
          <p className="tech-label m-0 lg:col-span-2">Domains</p>
          <div className="lg:col-span-10">
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {summary.domains.confirmed.map((domain) => (
                <li key={domain}>
                  <DomainTag domain={domain} />
                </li>
              ))}
              {summary.domains.fromName.map((domain) => (
                <li key={domain}>
                  <DomainTag domain={domain} fromName />
                </li>
              ))}
            </ul>
            <p className="tech-label m-0 mt-2">Dashed: indicated by the project name only</p>
          </div>
        </div>
      ) : null}

      <nav aria-label="In this section" className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
        {SECTION_LINKS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="tech-label inline-flex min-h-11 items-center text-accent underline underline-offset-4"
          >
            {label}
          </a>
        ))}
      </nav>
    </section>
  );
}
