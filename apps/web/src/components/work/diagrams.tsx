import type { ProjectArchitecture, SyncFlow } from "@assembly/content";

/** A connector between two nodes: an arrow in each direction. Horizontal from `sm`, vertical below it. */
function Connector() {
  return (
    <>
      <svg viewBox="0 0 12 40" aria-hidden="true" className="mx-auto h-10 w-3 shrink-0 sm:hidden">
        <line x1="6" y1="6" x2="6" y2="34" className="stroke-outline" />
        <polygon points="6,2 2,9 10,9" className="fill-ink" />
        <polygon points="6,38 2,31 10,31" className="fill-ink" />
      </svg>
      <svg
        viewBox="0 0 40 12"
        aria-hidden="true"
        className="hidden h-3 w-10 shrink-0 self-center sm:block"
      >
        <line x1="6" y1="6" x2="34" y2="6" className="stroke-outline" />
        <polygon points="2,6 9,2 9,10" className="fill-ink" />
        <polygon points="38,6 31,2 31,10" className="fill-ink" />
      </svg>
    </>
  );
}

/** Node styles by position: the app on the interface layer, the local store on the state layer. */
const NODE_STYLES = [
  "layer-interface",
  "layer-state",
  "border-[1.5px] border-ink bg-paper text-ink",
] as const;

/** Where local data lives and how it reaches the backend. Three nodes and two-way connectors. */
export function SyncFlowDiagram({ flow }: { flow: SyncFlow }) {
  return (
    <figure className="m-0">
      <ol className="m-0 flex list-none flex-col gap-0 p-0 sm:flex-row sm:items-stretch">
        {flow.nodes.map((node, index) => (
          <li key={node.label} className="contents">
            {index > 0 ? <Connector /> : null}
            <div
              className={`${NODE_STYLES[index] ?? NODE_STYLES[2]} flex min-w-0 flex-1 flex-col gap-1 rounded-sm p-3`}
            >
              <span className="type-label">{node.label}</span>
              <span className="type-small [overflow-wrap:anywhere]">{node.detail}</span>
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="tech-label mt-3">{flow.note}</figcaption>
    </figure>
  );
}

/** The levels of the architecture as steps that widen from the smallest block to the largest. */
export function ArchitectureSteps({ architecture }: { architecture: ProjectArchitecture }) {
  const last = architecture.levels.length - 1;
  return (
    <figure className="m-0">
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {architecture.levels.map((level, index) => (
          <li
            key={level}
            style={{ width: `${40 + (60 * index) / Math.max(last, 1)}%` }}
            className="layer-components type-label flex min-h-11 items-center gap-3 rounded-sm px-3"
          >
            <span aria-hidden="true">{index + 1}</span>
            {level}
          </li>
        ))}
      </ol>
      <figcaption className="tech-label mt-3">{architecture.summary}</figcaption>
    </figure>
  );
}
