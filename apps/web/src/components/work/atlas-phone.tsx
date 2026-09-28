"use client";

import { BottomSheet, type Detent } from "../site/bottom-sheet";
import {
  ATLAS_MODES,
  groupProjects,
  type AtlasCityMode,
  type AtlasCityProject,
  type TourStep,
} from "./atlas-layout";

export type AtlasView = "browse" | "project" | "tour";

/** Where the sheet rests when each view opens, and how many pixels of it show there. */
export const ATLAS_DEFAULT_DETENT: Record<AtlasView, Detent> = { browse: 0, project: 1, tour: 0 };
const PEEK: Record<AtlasView, number> = { browse: 152, project: 96, tour: 190 };

const platformLabel = (p: AtlasCityProject) => (p.platform === "mobile" ? "Mobile" : "Web");

/**
 * The phone version of the Project Atlas chrome (the same story-bar + bottom-sheet pattern as Dijkstra Live and the
 * capability pipeline). Three views share one sheet:
 *   - browse: "arrange by" switch, the tour button, and, pulled open, every project grouped by the current
 *     arrangement (a tap on a row is a tap on that building, for the ones too small to hit in the scene);
 *   - project: everything confirmed about one project (the same fields as the desktop detail panel);
 *   - tour: the guided walk-through, with the story bars over the scene and Back / Next in the sheet.
 * All of it comes from the atlas data passed in; nothing is written here.
 */
export function AtlasPhone({
  projects,
  mode,
  onMode,
  selected,
  onSelect,
  tour,
  tourIndex,
  onStep,
  onExitTour,
  detent,
  onDetent,
  onVisible,
  description,
  legend,
}: {
  projects: readonly AtlasCityProject[];
  mode: AtlasCityMode;
  onMode: (next: AtlasCityMode) => void;
  selected: AtlasCityProject | null;
  onSelect: (id: string | null) => void;
  tour: TourStep[];
  tourIndex: number | null;
  onStep: (index: number) => void;
  onExitTour: () => void;
  detent: Detent;
  onDetent: (next: Detent) => void;
  onVisible: (px: number) => void;
  description: string;
  legend: string;
}) {
  const step = tourIndex === null ? null : (tour[tourIndex] ?? null);
  const view: AtlasView = selected ? "project" : step ? "tour" : "browse";
  const groups = groupProjects(projects, mode);
  const byId = new Map(projects.map((p) => [p.id, p]));
  const modeLabel = ATLAS_MODES.find((m) => m.id === mode)?.label.toLowerCase() ?? mode;

  const rows = (ids: readonly string[]) => (
    <ol className="dj-rows atl-rows">
      {ids.map((id) => {
        const p = byId.get(id);
        if (!p) return null;
        return (
          <li key={id}>
            <button type="button" onClick={() => onSelect(id)}>
              <span className="atl-name">{p.name}</span>
              <span className="atl-meta">
                {platformLabel(p)}
                {p.tier === "featured" ? " · Featured" : ""}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  let title = "Project atlas";
  let hint = `${projects.length} projects · by ${modeLabel}`;
  let header: React.ReactNode;

  if (selected) {
    title = selected.name;
    hint = `${selected.company} · ${platformLabel(selected)}${selected.tier === "featured" ? " · Featured" : ""}`;
    header = (
      <div className="dj-sheet-top">
        <div className="min-w-0">
          <p className="dj-sheet-title">{title}</p>
          <p className="dj-sheet-hint">{hint}</p>
        </div>
        <button
          type="button"
          className="atl-close"
          aria-label="Close details"
          onClick={() => onSelect(null)}
        >
          ×
        </button>
      </div>
    );
  } else if (step && tourIndex !== null) {
    const last = tourIndex >= tour.length - 1;
    header = (
      <>
        <p className="atl-step" aria-live="polite">
          {step.text}
        </p>
        <div className="atl-tour-row">
          <button
            type="button"
            className="atl-ghost"
            disabled={tourIndex === 0}
            onClick={() => onStep(tourIndex - 1)}
          >
            ‹ Back
          </button>
          <button
            type="button"
            className="dj-next"
            onClick={() => (last ? onExitTour() : onStep(tourIndex + 1))}
          >
            {last ? "Explore" : "Next"}
            <span aria-hidden="true"> ›</span>
          </button>
          <button type="button" className="atl-ghost" onClick={onExitTour}>
            Exit
          </button>
        </div>
      </>
    );
  } else {
    header = (
      <>
        <div className="dj-sheet-top">
          <div className="min-w-0">
            <p className="dj-sheet-title">{title}</p>
            <p className="dj-sheet-hint">{hint}</p>
          </div>
          <button type="button" className="dj-next" onClick={() => onStep(0)}>
            Walk me through<span aria-hidden="true"> ›</span>
          </button>
        </div>
        <div className="atl-seg" role="group" aria-label="Arrange by">
          {ATLAS_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => onMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="dj-phone md:hidden">
      {tourIndex !== null && !selected ? (
        <>
          <div className="dj-bars" role="tablist" aria-label="Tour steps">
            {tour.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === tourIndex}
                aria-label={`Step ${i + 1}`}
                className="dj-bar"
                data-state={i < tourIndex ? "done" : i === tourIndex ? "on" : "todo"}
                onClick={() => onStep(i)}
              >
                <span />
              </button>
            ))}
          </div>
          <p className="dj-step" aria-hidden="true">
            {tourIndex + 1} / {tour.length}
          </p>
        </>
      ) : null}

      <BottomSheet
        detent={detent}
        onDetent={onDetent}
        peek={PEEK[view]}
        onVisible={onVisible}
        label={selected ? `${selected.name} details` : "Project atlas"}
        header={header}
      >
        <div className="dj-sheet-content">
          {selected ? (
            <>
              <p className="dj-lede">{selected.summary}</p>
              <dl className="atl-facts">
                {(
                  [
                    ["Product", selected.product],
                    [
                      "Domain",
                      selected.domain
                        ? selected.domainFromName
                          ? `${selected.domain} (from name)`
                          : selected.domain
                        : undefined,
                    ],
                    ["Period", selected.years],
                    ["Client", selected.client],
                    ["Enterprise", selected.enterpriseClient],
                    ["Via", selected.via],
                    ["Framework", selected.framework],
                    ["Technologies", selected.technologies?.join(" · ")],
                  ] as const
                ).map(([label, value]) =>
                  value ? (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
              {selected.personalWork?.length ? (
                <>
                  <p className="atl-sub">Personal work</p>
                  <ul className="atl-bullets">
                    {selected.personalWork.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {selected.notableWork?.length ? (
                <>
                  <p className="atl-sub">Notable engineering</p>
                  <ul className="atl-bullets">
                    {selected.notableWork.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {selected.hasDetail ? (
                <a className="atl-link" href="#dijkstra">
                  Open the featured project ↓
                </a>
              ) : null}
            </>
          ) : step?.highlight ? (
            <>
              <p className="atl-sub">In this stop</p>
              {rows(step.highlight)}
            </>
          ) : (
            <>
              <p className="dj-lede">{description}</p>
              <p className="atl-legend">{legend}</p>
              {groups.map((group) => (
                <section key={group.key} className="atl-group">
                  <h4>
                    {group.label}
                    <span>{group.ids.length}</span>
                  </h4>
                  {rows(group.ids)}
                </section>
              ))}
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
