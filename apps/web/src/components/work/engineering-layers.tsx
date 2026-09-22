import type { TechnologyGroup } from "@assembly/content";
import { layer } from "@assembly/tokens";

/**
 * The technologies used in the project, grouped by layer. A group without a layer (maps) cuts across
 * the layers and is drawn without a fill. Layer identity is the number, the label and the hatch, never
 * colour alone.
 */
export function EngineeringLayers({ groups }: { groups: readonly TechnologyGroup[] }) {
  return (
    <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => {
        const number = group.layer ? layer[group.layer].number : undefined;
        return (
          <li key={group.id} className="flex flex-col">
            <h4
              className={`${
                group.layer ? `layer-${group.layer}` : "border-[1.5px] border-ink bg-paper"
              } type-label m-0 flex min-h-11 items-center gap-3 rounded-t-sm px-3`}
            >
              <span aria-hidden="true">{number ?? "·"}</span>
              {group.label}
            </h4>
            {group.layer ? (
              <div
                className={`hatch-${group.layer} h-3 border-x-[1.5px] border-b-[1.5px] border-ink`}
                aria-hidden="true"
              />
            ) : null}
            <ul className="m-0 flex flex-1 list-none flex-wrap content-start gap-2 border-x-[1.5px] border-b-[1.5px] border-ink bg-paper p-3">
              {group.technologies.map((technology) => (
                <li
                  key={technology}
                  className="type-label rounded-sm border border-ink bg-vellum px-2 py-1 [overflow-wrap:anywhere]"
                >
                  {technology}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
