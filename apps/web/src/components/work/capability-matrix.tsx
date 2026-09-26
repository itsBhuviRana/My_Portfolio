import { capabilityGroups } from "@assembly/content";
import { CapabilityPipeline } from "./capability-pipeline";
import { TechChips } from "./atlas-parts";

/** One capability group as a small specification card, so the whole matrix is scanned, not read line by line. */
function CapabilityCard({
  label,
  items,
  index,
}: {
  label: string;
  items: readonly string[];
  index: number;
}) {
  return (
    <li className="glass flex flex-col transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-cut-sm">
      <h3 className="type-label m-0 flex min-h-11 items-center gap-3 border-b-[1.5px] border-ink px-3">
        <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        {label}
      </h3>
      <div className="p-3">
        <TechChips items={items} />
      </div>
    </li>
  );
}

/**
 * Engineering capabilities from across the career, as a matrix of cards: eight categories, each scannable
 * on its own. It is deliberately not attached to any project: the note says so, and the content package
 * never names a project here.
 */
export function CapabilityMatrix() {
  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-title"
      className="page-shell pb-10 md:pb-12"
    >
      <div className="rule-ink" />
      <h2 id="capabilities-title" className="type-h1 m-0 mt-10">
        Engineering capabilities
      </h2>
      <p className="tech-label m-0 mt-2">
        Experience across the projects above. Not every item was used on every project.
      </p>
      <CapabilityPipeline
        groups={capabilityGroups.map((group) => ({
          id: group.id,
          label: group.label,
          items: [...group.items],
        }))}
      >
        <ol className="m-0 grid list-none grid-cols-1 items-start gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {capabilityGroups.map((group, index) => (
            <CapabilityCard key={group.id} label={group.label} items={group.items} index={index} />
          ))}
        </ol>
      </CapabilityPipeline>
    </section>
  );
}
