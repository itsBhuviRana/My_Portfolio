"use client";

import { BottomSheet, type Detent } from "../site/bottom-sheet";
import type { LiveData } from "./dijkastra-live";

export type Chapter = "sync" | "architecture" | "role" | "stack";

export const CHAPTER_LIST: readonly { id: Chapter; label: string }[] = [
  { id: "sync", label: "Sync" },
  { id: "architecture", label: "Architecture" },
  { id: "role", label: "My role" },
  { id: "stack", label: "Stack" },
];

/** Where the sheet rests when a chapter opens: sync keeps its controls in the peek, the rest open to half. */
const DEFAULT_DETENT: Record<Chapter, Detent> = { sync: 0, architecture: 1, role: 1, stack: 1 };
const PEEK: Record<Chapter, number> = { sync: 142, architecture: 96, role: 96, stack: 96 };

export function defaultDetent(chapter: Chapter): Detent {
  return DEFAULT_DETENT[chapter];
}

/**
 * The phone version of Dijkastra Live's chrome: a story-style progress bar over the scene (tap a segment, or swipe
 * the scene, to change chapter) and a bottom sheet that carries everything the desktop overlay cards carry. The
 * same 3D scene sits behind both; this file only draws the controls and text. Everything shown comes from `data`.
 */
export function DijkastraPhone({
  data,
  chapter,
  onChapter,
  online,
  onOnline,
  counts,
  maxQueue,
  onAddRecord,
  pick,
  onPick,
  level,
  onLevel,
  detent,
  onDetent,
  onVisible,
}: {
  data: LiveData;
  chapter: Chapter;
  onChapter: (next: Chapter) => void;
  online: boolean;
  onOnline: (next: boolean) => void;
  counts: { device: number; synced: number };
  maxQueue: number;
  onAddRecord: () => void;
  pick: number | null;
  onPick: (next: number | null) => void;
  level: number | null;
  onLevel: (next: number | null) => void;
  detent: Detent;
  onDetent: (next: Detent) => void;
  onVisible: (px: number) => void;
}) {
  const index = CHAPTER_LIST.findIndex((c) => c.id === chapter);
  const isLast = index === CHAPTER_LIST.length - 1;
  const title = CHAPTER_LIST[index]!.label;
  const hint =
    chapter === "sync"
      ? "Works offline, syncs when online"
      : chapter === "architecture"
        ? `${data.architecture.name} · ${data.architecture.levels.length} levels`
        : chapter === "role"
          ? `${data.responsibilities.length} responsibilities`
          : `${data.stack.length} groups`;
  const next = () => onChapter(CHAPTER_LIST[(index + 1) % CHAPTER_LIST.length]!.id);

  const stackItem = pick !== null ? data.stack[pick] : undefined;

  return (
    <div className="dj-phone md:hidden">
      <div className="dj-bars" role="tablist" aria-label="Chapters">
        {CHAPTER_LIST.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={c.label}
            className="dj-bar"
            data-state={i < index ? "done" : i === index ? "on" : "todo"}
            onClick={() => onChapter(c.id)}
          >
            <span />
          </button>
        ))}
      </div>
      <p className="dj-step" aria-hidden="true">
        {index + 1} / {CHAPTER_LIST.length}
        <span>{title}</span>
      </p>

      <BottomSheet
        detent={detent}
        onDetent={onDetent}
        peek={PEEK[chapter]}
        onVisible={onVisible}
        label={`${title} details`}
        header={
          <>
            <div className="dj-sheet-top">
              <div className="min-w-0">
                <p className="dj-sheet-title">{title}</p>
                <p className="dj-sheet-hint">{hint}</p>
              </div>
              <button type="button" className="dj-next" onClick={next}>
                {isLast ? "Start over" : "Next"}
                <span aria-hidden="true"> ›</span>
              </button>
            </div>
            {chapter === "sync" ? (
              <div className="dj-sync-row">
                <button
                  type="button"
                  role="switch"
                  aria-checked={online}
                  aria-label="Connection"
                  className="dj-switch"
                  data-on={online}
                  onClick={() => onOnline(!online)}
                >
                  <span className="dj-switch-knob" aria-hidden="true" />
                  <span className="dj-switch-label">{online ? "Online" : "Offline"}</span>
                </button>
                <button
                  type="button"
                  className="dj-add"
                  onClick={onAddRecord}
                  disabled={counts.device >= maxQueue}
                >
                  <span aria-hidden="true">＋</span> Record
                </button>
                <p className="dj-tally" aria-live="polite">
                  <b>{counts.device}</b> on device · <b>{counts.synced}</b> synced
                </p>
              </div>
            ) : null}
          </>
        }
      >
        <div className="dj-sheet-content">
          {chapter === "sync" ? (
            <>
              <p className="dj-lede">{data.syncNote}</p>
              <ol className="dj-flow">
                {data.syncNodes.map((node) => (
                  <li key={node.label}>
                    <b>{node.label}</b>
                    <span>{node.detail}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : null}

          {chapter === "architecture" ? (
            <>
              <p className="dj-lede">{data.architecture.summary}</p>
              <ol className="dj-rows">
                {data.architecture.levels.map((name, i) => (
                  <li key={name}>
                    <button
                      type="button"
                      aria-pressed={level === i}
                      onClick={() => onLevel(level === i ? null : i)}
                    >
                      <span className="dj-num">{i + 1}</span>
                      {name}
                    </button>
                  </li>
                ))}
              </ol>
            </>
          ) : null}

          {chapter === "role" ? (
            <ol className="dj-rows">
              {data.responsibilities.map((item, i) => (
                <li key={item.title}>
                  <button
                    type="button"
                    aria-expanded={pick === i}
                    onClick={() => onPick(pick === i ? null : i)}
                  >
                    <span className="dj-num">{i + 1}</span>
                    {item.title}
                  </button>
                  {pick === i ? <p className="dj-row-detail">{item.detail}</p> : null}
                </li>
              ))}
            </ol>
          ) : null}

          {chapter === "stack" ? (
            <>
              <ul className="dj-chips">
                {data.stack.map((group, i) => (
                  <li key={group.label}>
                    <button
                      type="button"
                      aria-pressed={pick === i}
                      onClick={() => onPick(pick === i ? null : i)}
                    >
                      {group.label}
                    </button>
                  </li>
                ))}
              </ul>
              {stackItem ? (
                <p className="dj-lede">{stackItem.technologies.join(" · ")}</p>
              ) : (
                <p className="dj-lede">Pick a group to see what is in it.</p>
              )}
            </>
          ) : null}
          <section className="dj-about" aria-label="About the project">
            <h3>About {data.name}</h3>
            <p className="dj-lede">{data.about.description}</p>
            <dl>
              {data.about.facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <ul className="dj-chips dj-chips-static">
              {data.about.characteristics.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="dj-outcome">{data.about.outcome}</p>
          </section>
        </div>
      </BottomSheet>
    </div>
  );
}
