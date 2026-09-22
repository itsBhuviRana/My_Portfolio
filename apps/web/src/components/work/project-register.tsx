import { atlasProjects, getAtlasSummary } from "@assembly/content";
import type { AtlasProject } from "@assembly/content";
import { domainLabel, formatYears, platformLabel } from "../../lib/format";
import { ExpandGlyph, PlatformTag } from "./atlas-parts";
import { SheetStrip } from "./sheet-strip";

/**
 * One line of extra facts for index-tier projects only, drawn from what was confirmed. Featured projects
 * have their own card above and skip this: register-tier projects have nothing more to add here.
 */
function facts(project: AtlasProject): string {
  const parts =
    project.tier === "index"
      ? [project.product, ...(project.technologies ?? [project.framework])]
      : [];
  return parts.filter(Boolean).join(" · ");
}

/** Name, platform, years and domain: what every row shows without opening it. */
function RegisterSpec({ project }: { project: AtlasProject }) {
  const domain = domainLabel(project);
  return (
    <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span className="type-body font-bold [overflow-wrap:anywhere]">{project.name}</span>
      <span className="tech-label flex flex-wrap items-center gap-x-4 gap-y-1">
        {project.years ? <span>{formatYears(project.years)}</span> : null}
        {domain ? <span>{domain}</span> : null}
        {project.tier === "featured" ? <span>Featured</span> : null}
        <PlatformTag platform={project.platform} suffix=" application" />
      </span>
    </div>
  );
}

/**
 * One project in the register. A featured project (already covered above) is a single closed line. Every
 * other project opens, on click or keyboard, to its general summary and any confirmed extras: nothing is
 * hidden, it is just not the default reading.
 */
function RegisterRow({ project }: { project: AtlasProject }) {
  if (project.tier === "featured") {
    return (
      <li className="border-t border-rule py-2.5 first:border-t-0">
        <RegisterSpec project={project} />
      </li>
    );
  }

  const extra = facts(project);
  return (
    <li className="border-t border-rule first:border-t-0">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-start gap-3 py-2.5 marker:content-none [&::-webkit-details-marker]:hidden">
          <RegisterSpec project={project} />
          <span className="mt-1.5">
            <ExpandGlyph />
          </span>
        </summary>
        <div className="pb-3">
          <p className="type-small m-0">{project.summary}</p>
          {extra ? <p className="tech-label m-0 mt-2">{extra}</p> : null}
          {project.tier === "index" && project.personalWork ? (
            <p className="tech-label m-0 mt-2">Personal work: {project.personalWork.join(", ")}</p>
          ) : null}
        </div>
      </details>
    </li>
  );
}

/** Every project in the atlas, grouped by company, as a compact register: one line to scan, one tap to read. */
export function ProjectRegister() {
  const summary = getAtlasSummary();

  return (
    <section id="register" aria-labelledby="register-title" className="page-shell pb-10 md:pb-12">
      <div className="rule-ink" />
      <div className="mt-10">
        <SheetStrip tag="Register" />
      </div>
      <h2 id="register-title" className="type-h1 m-0 mt-8">
        Project register
      </h2>
      <p className="tech-label m-0 mt-2">
        All {summary.total} projects, grouped by company · approximate periods
      </p>
      <p className="type-small m-0 mt-2 max-w-[70ch]">
        Every row opens to a short engineering summary, not a product description, where product
        details are not confirmed. A domain marked “from name” is indicated by the project name
        only.
      </p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2" aria-hidden="true">
        <PlatformTag platform="mobile" />
        <PlatformTag platform="web" />
      </div>

      <div className="mt-8 md:columns-2 md:gap-x-10">
        {summary.companies.map((company) => (
          <div key={company.name} className="mb-8 break-inside-avoid">
            <div className="rule-ink" />
            <h3 className="type-h3 m-0 mt-3 [overflow-wrap:anywhere]">{company.name}</h3>
            <p className="tech-label m-0 mt-1">
              {company.total} {company.total === 1 ? "project" : "projects"}
              {company.mobile > 0
                ? ` · ${company.mobile} ${platformLabel("mobile").toLowerCase()}`
                : ""}
              {company.web > 0 ? ` · ${company.web} ${platformLabel("web").toLowerCase()}` : ""}
            </p>
            <ul className="m-0 mt-3 list-none p-0">
              {atlasProjects
                .filter((project) => project.company === company.name)
                .map((project) => (
                  <RegisterRow key={project.id} project={project} />
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
