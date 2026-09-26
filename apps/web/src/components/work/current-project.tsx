import type { ReactNode } from "react";
import { getCurrentExperience } from "@assembly/content";
import { layer } from "@assembly/tokens";
import { formatPeriod } from "../../lib/format";
import { ArchitectureSteps, SyncFlowDiagram } from "./diagrams";
import { EngineeringLayers } from "./engineering-layers";
import { DijkastraLive } from "./dijkastra-live";

/** A titled block of the section, marked with a letter like a callout on a drawing sheet. */
function Block({
  mark,
  title,
  note,
  children,
}: {
  mark: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="rule-ink" />
      <h3 className="type-h3 m-0 mt-3 flex items-baseline gap-3">
        <span className="tech-label" aria-hidden="true">
          {mark}
        </span>
        {title}
      </h3>
      {note ? <p className="tech-label m-0 mt-2">{note}</p> : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

/**
 * The current role and the product it is spent on, in detail. Everything comes from the content package
 * (`getCurrentExperience`), so nothing about the role or the product is written in this file.
 */
export function CurrentProject() {
  const current = getCurrentExperience();
  const project = current?.project;
  if (!current || !current.period || !project) return null;

  const facts: [label: string, value: string][] = [
    ["Product", project.tagline],
    ["Context", project.context],
    ["Platform", project.platform],
    ["Used by", project.users],
  ];
  const responsibilities = current.responsibilities ?? [];

  return (
    <section
      id="dijkastra"
      aria-labelledby="dijkastra-title"
      className="page-shell mt-12 pb-10 md:mt-16 md:pb-12"
    >
      <div className="rule-ink" />
      <p className="tech-label m-0 mt-10 max-md:hidden">
        The one project shown in full engineering detail
      </p>
      <div className="mt-3 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-7">
          <p className="tech-label m-0 max-md:hidden">
            {current.role} · {current.company} · {formatPeriod(current.period)}
          </p>
          <h2 id="dijkastra-title" className="type-h1 m-0 mt-3">
            {project.name}
          </h2>
          <p className="type-small m-0 mt-2 text-ink-soft md:hidden">
            {current.company} · {formatPeriod(current.period)}
          </p>
        </div>
        <p className="type-body-lg m-0 max-md:hidden lg:col-span-5">{project.description}</p>
      </div>

      <dl className="m-0 mt-8 grid gap-[1.5px] border-[1.5px] border-ink bg-ink max-md:hidden sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-col gap-1 bg-paper p-4">
            <dt className="tech-label">{label}</dt>
            <dd className="type-body m-0 font-medium [overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>

      <DijkastraLive
        data={{
          name: project.name,
          tagline: project.tagline,
          syncNodes: project.syncFlow.nodes.map((node) => ({
            label: node.label,
            detail: node.detail,
          })),
          syncNote: project.syncFlow.note,
          architecture: {
            name: project.architecture.name,
            summary: project.architecture.summary,
            levels: [...project.architecture.levels],
          },
          responsibilities: responsibilities.map((item) => ({
            title: item.title,
            detail: item.detail,
          })),
          stack: project.technologyGroups.map((group) => ({
            label: group.label,
            technologies: [...group.technologies],
          })),
          about: {
            description: project.description,
            facts,
            characteristics: [...project.characteristics],
            outcome: project.outcome,
          },
        }}
      >
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Block mark="A" title="Product characteristics">
              <ul className="m-0 grid list-none p-0 sm:grid-cols-2 sm:gap-x-8">
                {project.characteristics.map((item) => (
                  <li
                    key={item}
                    className="border-t border-rule py-3 first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
                  >
                    <span className="type-body font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <SyncFlowDiagram flow={project.syncFlow} />
              </div>
            </Block>
          </div>
          <div className="lg:col-span-5">
            <Block mark="B" title="Architecture" note={project.architecture.name}>
              <ArchitectureSteps architecture={project.architecture} />
            </Block>
          </div>
        </div>

        <div className="mt-12">
          <Block mark="C" title="Engineering layers" note="Technologies used in the project">
            <EngineeringLayers groups={project.technologyGroups} />
          </Block>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Block mark="D" title="Responsibilities" note={`In the ${current.role} role`}>
              <div>
                <div
                  className={`layer-leadership type-label flex min-h-11 items-center gap-3 rounded-t-sm px-3`}
                >
                  <span aria-hidden="true">{layer.leadership.number}</span>
                  Personal role
                </div>
                <div
                  className="hatch-leadership h-3 border-x-[1.5px] border-b-[1.5px] border-ink"
                  aria-hidden="true"
                />
                <ol className="m-0 grid list-none gap-px border-x-[1.5px] border-b-[1.5px] border-ink bg-rule p-0 md:grid-cols-2">
                  {responsibilities.map((item, index) => (
                    <li key={item.title} className="flex flex-col gap-1 bg-paper p-4">
                      <span className="tech-label" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="type-body font-bold">{item.title}</span>
                      <span className="type-small">{item.detail}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Block>
          </div>
          <div className="lg:col-span-4">
            <Block mark="E" title="Outcome and impact">
              <p className="type-body m-0 border-[1.5px] border-dashed border-line bg-paper p-4">
                {project.outcome}
              </p>
            </Block>
          </div>
        </div>
      </DijkastraLive>
    </section>
  );
}
