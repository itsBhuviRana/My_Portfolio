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

/**
 * The assembly entrance, in milliseconds: the field settles first and fastest, the flagship follows, the
 * supporting objects arrive after it in a small stagger, and each object's own "Inspect" callout is the
 * last thing to resolve — reading as the label settling once its object has landed. One pass only: once
 * `AtlasField` reaches `data-reveal="revealed"` nothing here fires again (see `atlas-field.tsx`), and the
 * site-wide reduced-motion rule (foundations.css) collapses every duration and delay below to nothing.
 */
const ASSEMBLY = {
  field: 0,
  anchor: 120,
  divider: 170,
  supportBase: 220,
  supportStep: 70,
  calloutExtra: 180,
} as const;

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
          href="#dijkastra"
          className="type-small mt-4 inline-flex min-h-12 items-center gap-2 text-accent underline underline-offset-4"
        >
          Open the full engineering breakdown ↓
        </a>
      ) : null}
    </div>
  );
}

/**
 * The object's index, as an engineering callout pin (the same 24px-circle convention as the Hero's layer
 * key). Filled ink for the anchor — the one object the field is organised around — outlined for every
 * other object, so which is dominant reads before any text does.
 *
 * A supporting object's pin fills in to match while its own `<details>` is open (`group-open/object`,
 * named so it reacts to that object alone and not the field-wide `group` used for reveal/dimming): the
 * one object currently under inspection briefly reads with the same weight as the flagship.
 */
function CalloutPin({ index, isAnchor }: { index: number; isAnchor: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`type-label inline-flex size-6 shrink-0 items-center justify-center rounded-pill border-[1.5px] border-ink transition-colors duration-300 ${
        isAnchor
          ? "bg-ink text-paper"
          : "bg-paper text-ink group-open/object:bg-ink group-open/object:text-paper"
      }`}
    >
      {index + 1}
    </span>
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
 * Dijkastra): a wider band with its own internal layout, and the accent border that also marks `hasDetail`
 * for a project without an anchor slot (there is at most one of each today, but they are independent).
 */
function ProjectObject({
  project,
  index,
  delayMs,
  hasDetail,
  variant,
}: {
  project: AtlasProject;
  index: number;
  delayMs: number;
  hasDetail: boolean;
  variant: "anchor" | "standard";
}) {
  const context = [project.company, project.client].filter(Boolean).join(" · ");
  const primary = primaryTechnology(project);
  const isAnchor = variant === "anchor";
  // The flagship travels a little further settling into place than a supporting object does. Each branch
  // is a complete class name so Tailwind's static scanner can find it (it cannot see a name assembled at
  // runtime from a partial string).
  const settleFrom = isAnchor
    ? "group-data-[reveal=pending]:translate-y-4"
    : "group-data-[reveal=pending]:translate-y-3";
  // The anchor's recede (when a supporting object is open instead) is owned by the `group/flagship`
  // wrapper in `FeaturedProjects` so it can dim the annotation along with the card as one unit; applying
  // it here too would double up (nested opacity/scale compounding). A standard object has no such
  // wrapper, so it still recedes on its own.
  const recede = isAnchor
    ? ""
    : "group-has-[[open]]:[&:not([open])]:scale-[0.98] group-has-[[open]]:[&:not([open])]:opacity-60";

  return (
    <details
      name={SELECT_GROUP}
      // Matches transition-property's order (opacity, translate, scale, box-shadow, border-color):
      // the one-time entrance stagger belongs to the first three (what actually moves the object into
      // place), never to box-shadow/border-color. A single delay value would apply to all five — which
      // is how this stayed unnoticed: it's correct for entrance, but it would also mean hovering or
      // opening this object months after page load still waits out its old entrance delay (up to ~430ms
      // for the last supporting object) before the inspection shadow appears. Inspection needs to be
      // instant regardless of where the object landed in the entrance stagger.
      style={{ transitionDelay: `${delayMs}ms, ${delayMs}ms, ${delayMs}ms, 0ms, 0ms` }}
      // `open:hover:` and `open:focus-within:` repeat the open shadow at higher (compound) specificity
      // than plain `hover:`/`focus-within:` alone: focus naturally lands on `<summary>` right after
      // opening it (by click or keyboard), so without this, `focus-within:shadow-cut-sm` — same
      // specificity as `open:shadow-cut-md`, and later in the generated stylesheet — would quietly win
      // and the "open" shadow would never actually be visible in the normal open-by-interacting flow.
      className={`atlas-object group/object border-[1.5px] bg-paper transition-[opacity,translate,scale,box-shadow,border-color] duration-500 ease-out ${settleFrom} group-data-[reveal=pending]:opacity-0 hover:-translate-y-1 hover:shadow-cut-sm focus-within:-translate-y-1 focus-within:shadow-cut-sm open:shadow-cut-md open:hover:shadow-cut-md open:focus-within:shadow-cut-md ${recede} ${hasDetail ? "border-accent" : "border-ink"} ${isAnchor ? "shadow-cut-sm" : ""}`}
    >
      <summary
        className={`flex cursor-pointer list-none gap-3 p-4 marker:content-none [&::-webkit-details-marker]:hidden ${
          isAnchor ? "flex-col sm:flex-row sm:items-center sm:justify-between" : "flex-col"
        }`}
      >
        <div className={isAnchor ? "min-w-0 sm:flex-1" : "flex flex-col gap-3"}>
          <div className="flex items-center justify-between gap-2">
            <CalloutPin index={index} isAnchor={isAnchor} />
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
          style={{ transitionDelay: `${delayMs + ASSEMBLY.calloutExtra}ms` }}
          className={`tech-label flex items-center gap-2 text-accent transition-[opacity,translate] duration-300 ease-out group-data-[reveal=pending]:translate-y-1 group-data-[reveal=pending]:opacity-0 ${isAnchor ? "mt-3 sm:mt-0" : "mt-3"}`}
        >
          {/* Closed reads as an action ("Inspect →"); open reads as a state ("Inspecting") — the same
              affordance describing what happens next, then what is currently true. `group-open/object`
              is the named group on this object's own `<details>` (see `CalloutPin`), so switching to a
              different object in the field doesn't affect a label that isn't its own. */}
          <span className="group-open/object:hidden">Inspect</span>
          <span className="hidden group-open/object:inline">Inspecting</span>
          <ExpandGlyph />
        </span>
      </summary>

      <DeepContent project={project} hasDetail={hasDetail} />
    </details>
  );
}

/**
 * A labelled break between the anchor and the supporting objects: a hairline on each side of a small
 * tag, in the same dashed style the field already uses for an inferred domain. Purely decorative — the
 * two `<ol>` around it carry the real grouping via `aria-label`, so a screen reader loses nothing if this
 * is skipped. It resolves into place between the flagship settling and the supporting objects arriving,
 * reading as the field announcing the next group rather than just appearing with everything else.
 */
function FieldDivider({ label, delayMs }: { label: string; delayMs: number }) {
  return (
    <div
      style={{ transitionDelay: `${delayMs}ms` }}
      className="my-6 flex items-center gap-4 transition-[opacity,translate] duration-300 ease-out group-data-[reveal=pending]:translate-y-1 group-data-[reveal=pending]:opacity-0 sm:my-8"
      aria-hidden="true"
    >
      <span className="h-px flex-1 border-t border-dashed border-line" />
      <span className="tech-label shrink-0 rounded-sm border border-dashed border-line bg-vellum px-2 py-1">
        {label}
      </span>
      <span className="h-px flex-1 border-t border-dashed border-line" />
    </div>
  );
}

/**
 * The flagship's own callout, resolving in place above the anchor object: the same dot-and-leader
 * convention as the Hero's exploded-view callouts (`exploded-phone.tsx`), reduced to its simplest form —
 * no SVG, just a marker, a short rule and a label, all in normal flow so it never needs its own
 * responsive geometry. "01" pairs with the pin inside the card directly beneath it; the date comes
 * straight off the project's own `years` field, so it is information the closed card does not already
 * show, not a restatement of the platform/domain/technology chips already on it.
 *
 * While Dijkastra is open, the label darkens from the muted `tech-label` tone to full ink and its leader
 * thickens to match — the annotation staying legibly "attached" to the object it names now that the
 * object itself is the one under inspection. `group-has-[[open]]/flagship` is the small named group on
 * `FeaturedProjects`' wrapper around this and the anchor `<ol>` (see below): it reacts only to Dijkastra's
 * own open state, never to a supporting object opening elsewhere in the field.
 */
function FlagshipAnnotation({ years, delayMs }: { years?: string; delayMs: number }) {
  return (
    <div
      aria-hidden="true"
      style={{ transitionDelay: `${delayMs}ms` }}
      className="ml-4 flex flex-col items-start gap-1 pb-2 transition-[opacity,translate] duration-300 ease-out group-data-[reveal=pending]:translate-y-1 group-data-[reveal=pending]:opacity-0"
    >
      <span className="tech-label flex items-center gap-2 transition-colors duration-300 ease-out group-has-[[open]]/flagship:text-ink">
        <span className="size-1.5 shrink-0 rounded-full bg-ink" />
        01 / Flagship{years ? ` · ${years}` : ""}
      </span>
      <span className="h-3 w-px bg-line transition-colors duration-300 ease-out group-has-[[open]]/flagship:bg-ink" />
    </div>
  );
}

/**
 * The stagger applied to a supporting object's grid item (not the object itself, which already owns the
 * hover/open/reveal transform — stacking a second, static transform on the same element would fight those).
 * Below `sm` it is a small alternating side-inset, echoed at `sm`+ as an alternating vertical offset: a
 * controlled, deterministic rhythm, not a uniform row.
 */
function fieldPosition(index: number): string {
  return index % 2 === 1 ? "ml-4 sm:ml-0 sm:translate-y-6" : "mr-4 sm:mr-0";
}

/**
 * The featured tier as a controlled field: one anchor object (the project with a full deep-inspection
 * section elsewhere on the page) organises the field, with the rest as a supporting group beneath it —
 * two separate lists (each with its own `aria-label`) joined by a labelled divider, not one flat row, so
 * the hierarchy is in the DOM and the reading order, not just the styling. If no single project has that
 * detail (or more than one does), every project falls back to one plain list, so this degrades safely
 * rather than guessing at a hierarchy the data doesn't support.
 */
export function FeaturedProjects() {
  const featured = atlasProjects.filter((project) => project.tier === "featured");
  const detailed = new Set(
    getPublishedExperience().flatMap((entry) => (entry.project ? (entry.projectIds ?? []) : [])),
  );
  const anchorId = detailed.size === 1 ? [...detailed][0] : undefined;
  const anchor = featured.find((project) => project.id === anchorId);
  const rest = anchor ? featured.filter((project) => project.id !== anchorId) : featured;
  // Pairs with FlagshipAnnotation's "01": the supporting field is whatever's left, numbered from 2.
  const supportRange = rest.length > 1 ? `2–${1 + rest.length}` : "2";

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

      <AtlasField className="grid-iso mt-8 border border-rule bg-vellum p-4 transition-opacity duration-300 ease-out data-[reveal=pending]:opacity-0 sm:p-6">
        {anchor ? (
          // `group/flagship` scopes two things to this object alone: FlagshipAnnotation's own emphasis
          // above, and the recede below — a supporting object opening elsewhere in the field dims and
          // scales this wrapper (annotation included, as one unit) exactly as `ProjectObject` dims any
          // other closed object on its own (the `recede` there is skipped for the anchor specifically to
          // avoid compounding the two), via the same field-wide `group-has-[[open]]` already used
          // everywhere else, just checked against "does *this* wrapper contain the open one" instead of
          // "am *I* the open one".
          <div className="group/flagship transition-[opacity,scale] duration-300 ease-out group-has-[[open]]:[&:not(:has([open]))]:scale-[0.98] group-has-[[open]]:[&:not(:has([open]))]:opacity-60">
            <FlagshipAnnotation
              years={anchor.years ? formatYears(anchor.years) : undefined}
              delayMs={ASSEMBLY.anchor}
            />
            <ol className="m-0 list-none p-0" aria-label="Flagship project">
              <li>
                <ProjectObject
                  project={anchor}
                  index={0}
                  delayMs={ASSEMBLY.anchor}
                  hasDetail
                  variant="anchor"
                />
              </li>
            </ol>
          </div>
        ) : null}
        {anchor ? (
          <FieldDivider label={`${supportRange} / Supporting field`} delayMs={ASSEMBLY.divider} />
        ) : null}
        <ol
          className="m-0 grid list-none grid-cols-1 items-start gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4"
          aria-label={anchor ? "Supporting projects" : "Featured projects"}
        >
          {rest.map((project, i) => (
            <li key={project.id} className={fieldPosition(i)}>
              <ProjectObject
                project={project}
                index={(anchor ? 1 : 0) + i}
                delayMs={ASSEMBLY.supportBase + i * ASSEMBLY.supportStep}
                hasDetail={detailed.has(project.id)}
                variant="standard"
              />
            </li>
          ))}
        </ol>
        <p className="tech-label m-0 pt-6 sm:pt-8" aria-hidden="true">
          Field · {featured.length} of {atlasProjects.length} in the atlas
        </p>
      </AtlasField>
    </section>
  );
}
