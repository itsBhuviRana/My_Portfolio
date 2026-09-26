"use client";

import { BottomSheet, type Detent } from "../site/bottom-sheet";
import type { PipelineGroup } from "./capability-pipeline";

/**
 * The phone version of the capability pipeline's chrome (the same story-bar + bottom-sheet pattern as
 * Dijkastra Live): one progress segment per station over the scene (tap one, or swipe the scene, to move along
 * the pipe), and a sheet with the station's capabilities, the Play / Next controls, and — pulled fully open —
 * every capability from every station (the "Hiring view" of the desktop page). Everything comes from `groups`.
 */
export function CapabilityPhone({
  groups,
  active,
  onGo,
  playing,
  onPlay,
  note,
  detent,
  onDetent,
  onVisible,
}: {
  groups: PipelineGroup[];
  active: number;
  onGo: (index: number) => void;
  playing: boolean;
  onPlay: () => void;
  note: string;
  detent: Detent;
  onDetent: (next: Detent) => void;
  onVisible: (px: number) => void;
}) {
  const count = groups.length;
  const group = groups[active];
  const isLast = active >= count - 1;
  if (!group) return null;

  return (
    <div className="dj-phone md:hidden">
      <div className="dj-bars" role="tablist" aria-label="Pipeline stations">
        {groups.map((g, i) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Station ${i + 1}: ${g.label}`}
            className="dj-bar"
            data-state={i < active ? "done" : i === active ? "on" : "todo"}
            onClick={() => onGo(i)}
          >
            <span />
          </button>
        ))}
      </div>
      <p className="dj-step" aria-hidden="true">
        {active + 1} / {count}
        <span>{group.label}</span>
      </p>

      <BottomSheet
        detent={detent}
        onDetent={onDetent}
        peek={148}
        onVisible={onVisible}
        label="Capabilities"
        header={
          <>
            <div className="dj-sheet-top">
              <div className="min-w-0">
                <p className="dj-sheet-title">{group.label}</p>
                <p className="dj-sheet-hint">
                  Station {active + 1} of {count} · {group.items.length} capabilities
                </p>
              </div>
              <button
                type="button"
                className="dj-next"
                onClick={() => onGo(isLast ? 0 : active + 1)}
              >
                {isLast ? "Start over" : "Next"}
                <span aria-hidden="true"> ›</span>
              </button>
            </div>
            <div className="dj-sync-row">
              <button type="button" className="dj-add" onClick={onPlay}>
                {playing ? "❚❚ Pause" : "▶ Play the pipeline"}
              </button>
            </div>
          </>
        }
      >
        <div className="dj-sheet-content">
          <ul key={active} className="dj-chips dj-chips-static" aria-live="polite">
            {group.items.map((item, n) => (
              <li key={item} className="cap-chip-in" style={{ animationDelay: `${n * 50}ms` }}>
                {item}
              </li>
            ))}
          </ul>

          <section className="dj-about" aria-label="All capabilities">
            <h3>All capabilities</h3>
            <p className="dj-lede">{note}</p>
            {groups.map((g, i) => (
              <div key={g.id} className="cap-group" data-active={i === active}>
                <h4>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {g.label}
                </h4>
                <p>{g.items.join(" · ")}</p>
              </div>
            ))}
          </section>
        </div>
      </BottomSheet>
    </div>
  );
}
