import type { ReactNode } from "react";
import { atlasProjects, getPublishedExperience } from "@assembly/content";
import type { AtlasProject } from "@assembly/content";
import { formatYears, primaryTechnology } from "../../lib/format";
import { AtlasField } from "./atlas-field";
import { DomainTag, ExpandGlyph, PlatformTag, TechChips } from "./atlas-parts";
import { SheetStrip } from "./sheet-strip";

/**
 * The shared `name` puts every project object in one native exclusive-selection group: opening one closes
 * whichever other was open, with no script. `:has()` reacts to that live state to dim the rest (the
 * `group-has-[[open]]:` classes on `<details>` in `ProjectObject`), so "select" and "de-emphasise the
 * others" are one native mechanism, not two.
 */
const SELECT_GROUP = "featured-select";

/** `span="full"` spans both columns of the deep-content grid; the default is one column. */
function Field({ label, children, span }: { label: string; children: ReactNode; span?: "full" }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${span === "full" ? "col-span-2" : ""}`}>
      <dt className="tech-label">{label}</dt>
      <dd className="m-0">{children}</dd>
    </div>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {items.map((item) => (
        <li
          key={item}
          className="type-small flex gap-2 before:mt-[0.45em] before:size-1.5 before:shrink-0 before:bg-ink"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * The deep-inspection body: everything confirmed for the project that does not fit the closed preview.
 * Identical for every project regardless of layout variant — the anchor treatment below is a layout
 * distinction, not a content difference, so nothing is thrown away either way.
 */
function DeepContent({ project, hasDetail }: { project: AtlasProject; hasDetail: boolean }) {
  return (
    <div className="border-t-[1.5px] border-ink p-4 pt-4">
      <p className="type-body m-0">{project.summary}</p>
      <dl className="m-0 mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {project.product ? (
          <Field label="Product">
            <span className="type-small font-medium">{project.product}</span>
          </Field>
        ) : null}
        {project.framework ? (
          <Field label="Framework">
            <span className="type-small font-medium">{project.framework}</span>
          </Field>
        ) : null}
        {project.personalWork ? (
          <Field label="Personal work" span="full">
            <BulletList items={project.personalWork} />
          </Field>
        ) : null}
        {project.notableWork ? (
          <Field label="Notable engineering" span="full">
            <BulletList items={project.notableWork} />
          </Field>
        ) : null}
        {project.technologies ? (
          <Field label="Project technologies" span="full">
            <TechChips items={project.technologies} />
          </Field>
        ) : null}
      </dl>
      {project.years ? <p className="tech-label m-0 mt-4">{formatYears(project.years)}</p> : null}
      {hasDetail ? (
        <a
          href="#discastra"
          className="type-small mt-4 inline-flex min-h-12 items-center gap-2 text-accent underline underline-offset-4"
        >
          Open the full engineering breakdown ↓
        </a>
      ) : null}
    </div>
  );
}

/**
 * One project object in the field.
 *
 * Closed, it is the preview: index, platform, name, context, domain and primary technology — high-signal
 * only, the same on every device (nothing here is hover-exclusive, so touch loses nothing). Hovering or
 * focusing it lifts it (a native mechanism: `:hover`/`:focus-within`, no script). Opening it (click, tap,
 * Enter or Space) selects it: the native exclusive group closes any other open object, `:has()` dims the
 * rest of the field, and this object reveals `DeepContent`. Nothing about this needs JavaScript.
 *
 * `variant="anchor"` is the one project with a full detailed section elsewhere on the page (today,
 * Discastra): a wider band with its own internal layout, and the accent border that also marks `hasDetail`
 * for a project without an anchor slot (there is at most one of each today, but they are independent).
 */
function ProjectObject({
  project,
  index,
  hasDetail,
  variant,
}: {
  project: AtlasProject;
  index: number;
  hasDetail: boolean;
  variant: "anchor" | "standard";
}) {
  const context = [project.company, project.client].filter(Boolean).join(" · ");
  const primary = primaryTechnology(project);
  const isAnchor = variant === "anchor";

  return (
    <details
      name={SELECT_GROUP}
      style={{ transitionDelay: `${index * 90}ms` }}
      className={`atlas-object border-[1.5px] bg-paper transition-[opacity,transform,box-shadow,border-color] duration-500 ease-out group-data-[reveal=pending]:translate-y-3 group-data-[reveal=pending]:opacity-0 hover:-translate-y-1 hover:shadow-cut-sm focus-within:-translate-y-1 focus-within:shadow-cut-sm open:shadow-cut-md group-has-[[open]]:[&:not([open])]:scale-[0.98] group-has-[[open]]:[&:not([open])]:opacity-60 ${hasDetail ? "border-accent" : "border-ink"}`}
    >
      <summary
        className={`flex cursor-pointer list-none gap-3 p-4 marker:content-none [&::-webkit-details-marker]:hidden ${
          isAnchor ? "flex-col sm:flex-row sm:items-center sm:justify-between" : "flex-col"
        }`}
      >
        <div className={isAnchor ? "min-w-0 sm:flex-1" : "flex flex-col gap-3"}>
          <div className="flex items-center justify-between gap-2">
            <span className="tech-label" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            {!isAnchor ? <PlatformTag platform={project.platform} /> : null}
          </div>
          <h3 className={`${isAnchor ? "type-h2" : "type-h3"} m-0 mt-2 [overflow-wrap:anywhere]`}>
            {project.name}
          </h3>
          <p className="tech-label m-0 mt-1 [overflow-wrap:anywhere]">{context}</p>
        </div>
        <div className={`flex flex-wrap items-center gap-2 ${isAnchor ? "mt-3 sm:mt-0" : "mt-3"}`}>
          {isAnchor ? <PlatformTag platform={project.platform} /> : null}
          {project.domain ? (
            <DomainTag domain={project.domain} fromName={project.domainFromName} />
          ) : null}
          {primary ? (
            <span className="type-label inline-flex w-fit rounded-sm bg-ink px-2 py-1 text-paper [overflow-wrap:anywhere]">
              {primary}
            </span>
          ) : null}
        </div>
        <span
          className={`tech-label flex items-center gap-2 text-accent ${isAnchor ? "mt-3 sm:mt-0" : "mt-3"}`}
        >
          Inspect
          <ExpandGlyph />
        </span>
      </summary>

      <DeepContent project={project} hasDetail={hasDetail} />
    </details>
  );
}

/**
 * The featured tier as a controlled field: one anchor object (the project with a full deep-inspection
 * section elsewhere on the page) as a full-width band, and the rest as a quad beneath it. If no single
 * project has that detail (or more than one does), every project falls back to the same quad layout, so
 * this degrades safely rather than guessing.
 */
export function FeaturedProjects() {
  const featured = atlasProjects.filter((project) => project.tier === "featured");
  const detailed = new Set(
    getPublishedExperience().flatMap((entry) => (entry.project ? (entry.projectIds ?? []) : [])),
  );
  const anchorId = detailed.size === 1 ? [...detailed][0] : undefined;
  const anchor = featured.find((project) => project.id === anchorId);
  const rest = anchor ? featured.filter((project) => project.id !== anchorId) : featured;

  return (
    <section id="featured" aria-labelledby="featured-title" className="page-shell pb-10 md:pb-12">
      <div className="rule-ink" />
      <div className="mt-10">
        <SheetStrip tag="Featured" />
      </div>
      <h2 id="featured-title" className="type-h1 m-0 mt-8">
        Featured projects
      </h2>
      <p className="tech-label m-0 mt-2">Selected from the atlas · tap an object to inspect it</p>

      <AtlasField>
        <ol className="m-0 mt-8 grid list-none grid-cols-1 items-start gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {anchor ? (
            <li className="sm:col-span-2 xl:col-span-4">
              <ProjectObject project={anchor} index={0} hasDetail variant="anchor" />
            </li>
          ) : null}
          {rest.map((project, i) => (
            <li key={project.id}>
              <ProjectObject
                project={project}
                index={(anchor ? 1 : 0) + i}
                hasDetail={detailed.has(project.id)}
                variant="standard"
              />
            </li>
          ))}
        </ol>
      </AtlasField>
    </section>
  );
}
