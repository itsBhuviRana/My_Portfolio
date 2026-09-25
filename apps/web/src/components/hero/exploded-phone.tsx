import type { ComponentType, CSSProperties } from "react";
import { layer, layerIds } from "@assembly/tokens";
import type { LayerId } from "@assembly/tokens";

/**
 * The Hero object: a generic phone taken apart into its layers, drawn as an isometric exploded view.
 * Each layer is its own `<g data-layer="...">` at a fixed height, which is also what lets it assemble on
 * paint (see `ENTRY` and `hero-motion.css`): nothing here needed restructuring for motion beyond pulling
 * the stack's dashed connector lines out into their own siblings (`data-connector`), so they can resolve
 * on their own schedule instead of moving rigidly with the layer that draws them. Nothing here is a real
 * app or product.
 *
 * A plain server component, deliberately: the entrance is pure CSS `animation` (see `hero-motion.css`),
 * so nothing here needs client-side state to reveal itself. That is also the fix for a real regression —
 * the Phase 5E version gated the whole illustration behind a `useEffect` flip, so a visitor whose script
 * hadn't hydrated yet (slow network, throttled CPU — closer to the default on a real phone than a dev
 * machine) saw a blank Hero. The resting styles below are already the final design; motion only adds on
 * top of them.
 *
 * Geometry: a phone slab lies flat, `u` runs down and to the right (the short side) and `v` down and to
 * the left (the long side). The layers are stacked along the vertical axis with a gap between them.
 * Labels are HTML (see `Callouts`), never part of the SVG.
 */

const COS30 = Math.cos(Math.PI / 6);
const VIEW = { width: 590, height: 540 } as const;
const ORIGIN = { x: 258, y: 314 } as const;
/** The phone slab in scene units (about 9:19.5), its thickness, and the gap between exploded layers. */
const SLAB = { u: 120, v: 260, t: 8, gap: 72 } as const;
/** Where the callout labels start, in scene units. */
const LABEL_X = 442;

type Rect = readonly [u0: number, v0: number, u1: number, v1: number];
type Point = readonly [u: number, v: number];

const round = (value: number): number => Math.round(value * 10) / 10;
const xy = (u: number, v: number, z: number): [number, number] => [
  round(ORIGIN.x + (u - v) * COS30),
  round(ORIGIN.y + (u + v) / 2 - z),
];
const pt = (u: number, v: number, z: number): string => xy(u, v, z).join(",");
const poly = (...points: string[]): string => points.join(" ");

const flat = ([u0, v0, u1, v1]: Rect, z: number): string =>
  poly(pt(u0, v0, z), pt(u1, v0, z), pt(u1, v1, z), pt(u0, v1, z));
/** The two faces of a box that face the viewer: the right face (at u1) and the front face (at v1). */
const rightFace = ([, v0, u1, v1]: Rect, z: number, h: number): string =>
  poly(pt(u1, v0, z), pt(u1, v1, z), pt(u1, v1, z + h), pt(u1, v0, z + h));
const frontFace = ([u0, , u1, v1]: Rect, z: number, h: number): string =>
  poly(pt(u0, v1, z), pt(u1, v1, z), pt(u1, v1, z + h), pt(u0, v1, z + h));

/** Fill classes as whole literal strings, so Tailwind can see them. */
const FILL = {
  cobalt: "fill-cobalt",
  mint: "fill-mint",
  butter: "fill-butter",
  signal: "fill-signal",
  lilac: "fill-lilac",
  rose: "fill-rose",
} as const;

function Box({
  rect,
  z,
  h,
  top,
  side,
}: {
  rect: Rect;
  z: number;
  h: number;
  top: string;
  side: string;
}) {
  return (
    <>
      <polygon points={rightFace(rect, z, h)} className={`${side} stroke-outline`} />
      <polygon points={frontFace(rect, z, h)} className={`${side} stroke-outline`} />
      <polygon points={flat(rect, z + h)} className={`${top} stroke-outline`} />
    </>
  );
}

function Patch({
  rect,
  z,
  className,
  style,
}: {
  rect: Rect;
  z: number;
  className: string;
  style?: CSSProperties;
}) {
  return <polygon points={flat(rect, z)} className={className} style={style} />;
}

/** `flowDelay`, when set, marks this wire as carrying "live" signal (see `.hero-flow-line`). */
function Wire({
  from,
  to,
  z,
  flowDelay,
}: {
  from: Point;
  to: Point;
  z: number;
  flowDelay?: number;
}) {
  const [x1, y1] = xy(from[0], from[1], z);
  const [x2, y2] = xy(to[0], to[1], z);
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className={flowDelay === undefined ? "stroke-outline" : "stroke-outline hero-flow-line"}
      style={
        flowDelay === undefined ? undefined : ({ "--hero-flow-delay": `${flowDelay}ms` } as Vars)
      }
    />
  );
}

/** A wire with an open arrowhead at its end, drawn on the surface of a layer. */
function Arrow({
  from,
  to,
  z,
  flowDelay,
}: {
  from: Point;
  to: Point;
  z: number;
  flowDelay?: number;
}) {
  const [du, dv] = [to[0] - from[0], to[1] - from[1]];
  const length = Math.hypot(du, dv);
  const [ux, uy] = [du / length, dv / length];
  const base: Point = [to[0] - ux * 9, to[1] - uy * 9];
  const head = poly(
    pt(to[0], to[1], z),
    pt(base[0] - uy * 4.5, base[1] + ux * 4.5, z),
    pt(base[0] + uy * 4.5, base[1] - ux * 4.5, z),
  );
  return (
    <>
      <Wire from={from} to={to} z={z} flowDelay={flowDelay} />
      <polygon points={head} className="fill-ink" />
    </>
  );
}

// ── The five slabs, top to bottom: the art on each layer ───────────────────

/** Generic UI blocks. This is not a real app. */
function InterfaceArt({ z }: { z: number }) {
  const paper = "fill-paper stroke-outline";
  const blocks: Rect[] = [
    [8, 8, 112, 20],
    [8, 28, 112, 92],
    [8, 100, 58, 160],
    [62, 100, 112, 160],
    [8, 168, 112, 182],
    [8, 188, 112, 202],
    [8, 222, 112, 252],
  ];
  return (
    <>
      {blocks.map((rect, i) => (
        <Patch key={i} rect={rect} z={z} className={paper} />
      ))}
      {[24, 60, 96].map((u, i) => (
        <Patch
          key={u}
          rect={[u - 3, 234, u + 3, 240]}
          z={z}
          className="fill-ink hero-blink"
          style={{ "--hero-blink-delay": `${i * 300}ms` } as Vars}
        />
      ))}
    </>
  );
}

/** Six wireframe tiles: button, card, input, list, chip and toggle. */
function ComponentsArt({ z }: { z: number }) {
  const bars: Rect[][] = [
    [[62, 12, 106, 24]],
    [
      [62, 8, 106, 16],
      [62, 22, 90, 28],
    ],
    [[62, 24, 106, 26]],
    [
      [62, 8, 106, 11],
      [62, 16, 106, 19],
      [62, 24, 106, 27],
    ],
    [[62, 12, 86, 24]],
    [[90, 12, 106, 24]],
  ];
  return (
    <>
      {bars.map((tile, i) => {
        const v0 = 8 + i * 42;
        return (
          <g key={i}>
            <Patch rect={[56, v0, 112, v0 + 36]} z={z} className="fill-paper stroke-outline" />
            {tile.map(([u0, a, u1, b], j) => (
              <Patch
                key={j}
                rect={[u0, v0 + a, u1, v0 + b]}
                z={z}
                className={i === 5 ? "fill-ink hero-toggle" : "fill-ink"}
              />
            ))}
          </g>
        );
      })}
    </>
  );
}

/** Nodes and arrows. */
function StateArt({ z }: { z: number }) {
  const nodes: Point[] = [
    [72, 26],
    [100, 80],
    [72, 134],
    [100, 188],
    [72, 238],
  ];
  return (
    <>
      {nodes.slice(0, -1).map((from, i) => {
        const to = nodes[i + 1]!;
        const [du, dv] = [to[0] - from[0], to[1] - from[1]];
        const length = Math.hypot(du, dv);
        const inset = (k: number): Point => [
          from[0] + (du / length) * k,
          from[1] + (dv / length) * k,
        ];
        const start = inset(11);
        const end = inset(length - 11);
        return <Arrow key={i} from={start} to={end} z={z} flowDelay={i * 220} />;
      })}
      {nodes.map(([u, v]) => (
        <Patch
          key={`${u}-${v}`}
          rect={[u - 8, v - 8, u + 8, v + 8]}
          z={z}
          className="fill-paper stroke-outline"
        />
      ))}
    </>
  );
}

/** Module blocks with connectors. */
function NativeArt({ z }: { z: number }) {
  const modules: { rect: Rect; h: number }[] = [
    { rect: [58, 14, 84, 50], h: 12 },
    { rect: [92, 14, 112, 44], h: 8 },
    { rect: [58, 90, 100, 140], h: 16 },
    { rect: [70, 180, 112, 236], h: 10 },
  ];
  return (
    <>
      <Wire from={[71, 32]} to={[102, 29]} z={z} flowDelay={0} />
      <Wire from={[71, 32]} to={[79, 115]} z={z} flowDelay={260} />
      <Wire from={[79, 115]} to={[91, 208]} z={z} flowDelay={520} />
      {modules.map(({ rect, h }) => (
        <Box key={rect.join()} rect={rect} z={z} h={h} top="fill-paper" side="fill-vellum" />
      ))}
    </>
  );
}

/** The base plate. */
function DeliveryArt({ z }: { z: number }) {
  const ports: Rect[] = [
    [66, 240, 86, 254],
    [92, 240, 106, 254],
  ];
  return (
    <>
      <Patch rect={[60, 12, 108, 236]} z={z} className="fill-none stroke-hairline" />
      {ports.map((rect, i) => (
        <Patch
          key={rect.join()}
          rect={rect}
          z={z}
          className="fill-paper stroke-outline hero-port-blink"
          style={{ "--hero-port-delay": `${i * 400}ms` } as Vars}
        />
      ))}
    </>
  );
}

const SLAB_ART: Record<string, ComponentType<{ z: number }>> = {
  interface: InterfaceArt,
  components: ComponentsArt,
  state: StateArt,
  native: NativeArt,
  delivery: DeliveryArt,
};

const SLAB_IDS = layerIds.filter((id) => id !== "leadership");
const zOf = (id: (typeof SLAB_IDS)[number]): number =>
  (SLAB_IDS.length - 1 - SLAB_IDS.indexOf(id)) * SLAB.gap;
const SLAB_RECT: Rect = [0, 0, SLAB.u, SLAB.v];
const CORNERS: Point[] = [
  [SLAB.u, 0],
  [SLAB.u, SLAB.v],
  [0, SLAB.v],
];

/** The leadership layer: three detachable blocks, the hand-off object, beside the stack. */
const LEADERSHIP_Z = -34;
const BLOCKS: { rect: Rect; h: number }[] = [
  { rect: [140, 4, 164, 28], h: 22 },
  { rect: [140, 34, 164, 58], h: 36 },
  { rect: [170, 4, 194, 28], h: 12 },
];

/** Where each callout leader meets the art, in scene coordinates. */
const ANCHORS: Record<LayerId, [number, number]> = {
  interface: xy(SLAB.u, 0, zOf("interface") + SLAB.t / 2),
  components: xy(SLAB.u, 0, zOf("components") + SLAB.t / 2),
  state: xy(SLAB.u, 0, zOf("state") + SLAB.t / 2),
  native: xy(SLAB.u, 0, zOf("native") + SLAB.t / 2),
  delivery: xy(SLAB.u, 0, zOf("delivery") + SLAB.t / 2),
  leadership: xy(194, 4, LEADERSHIP_Z + 6),
};

const pct = (value: number, total: number): string => `${round((value / total) * 100)}%`;

/**
 * The assembly order and each layer's starting offset, in one table (see `hero-motion.css` for how it's
 * consumed). Base plate first, then up through the stack to the screen, then the leadership blocks attach
 * last — the same order you'd physically build the device in, read straight off `zOf`, not an arbitrary
 * sequence (`delivery` sits lowest/first at z=0; `interface` highest/last).
 *
 * `fromX`/`fromY` are each layer's starting position: a small nudge *further* from centre than its resting
 * exploded position, in the same direction it already sits away from the stack's midline (`state`) — so
 * the entrance reads as the explosion settling inward, not six unrelated slides. Layers use `fromY` (the
 * stack runs vertically); `leadership` sits beside the stack, not in it, so it uses `fromX` instead.
 */
const ENTRY: Record<LayerId, { delayMs: number; fromX: number; fromY: number }> = {
  delivery: { delayMs: 140, fromX: 0, fromY: 14 },
  native: { delayMs: 210, fromX: 0, fromY: 7 },
  state: { delayMs: 280, fromX: 0, fromY: 3 },
  components: { delayMs: 350, fromX: 0, fromY: -7 },
  interface: { delayMs: 420, fromX: 0, fromY: -14 },
  leadership: { delayMs: 520, fromX: 10, fromY: 0 },
};
/** A stack connector resolves this long after the layer beneath it starts settling, never before. */
const CONNECTOR_EXTRA = 300;
/** A callout — line, then pin, then label — starts once its layer has mostly seated, not mid-flight. */
const CALLOUT_EXTRA = 420;
const PIN_EXTRA = CALLOUT_EXTRA + 20;
const LABEL_EXTRA = CALLOUT_EXTRA + 40;

/** A CSS custom property in an inline `style` object — React's own type just doesn't spell this out. */
type Vars = CSSProperties & Record<`--${string}`, string | number>;

export function ExplodedPhone({ style }: { style?: CSSProperties } = {}) {
  const description =
    "Exploded view of a generic phone, taken apart into six layers from top to bottom: " +
    layerIds.join(", ") +
    ".";

  return (
    <div
      role="img"
      aria-label={description}
      className="hero-illustration hero-frame grid-iso relative w-full border border-rule bg-vellum"
      style={{ aspectRatio: `${VIEW.width} / ${VIEW.height}`, ...style }}
    >
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 size-full"
      >
        {[...SLAB_IDS].reverse().map((id) => {
          const z = zOf(id);
          const Art = SLAB_ART[id]!;
          const entry = ENTRY[id];
          return (
            <g
              key={id}
              data-layer={id}
              style={
                {
                  "--hero-delay": `${entry.delayMs}ms`,
                  "--hero-from-x": `${entry.fromX}px`,
                  "--hero-from-y": `${entry.fromY}px`,
                } as Vars
              }
            >
              <Box rect={SLAB_RECT} z={z} h={SLAB.t} top={FILL[layer[id].fill]} side="fill-paper" />
              <Art z={z + SLAB.t} />
            </g>
          );
        })}
        {/*
         * The dashed connector between each layer and the one above it, pulled out of the layer's own
         * group so it can resolve on its own schedule (a moment after that layer starts settling) instead
         * of moving as a rigid unit with it. Each is perfectly vertical (`x1 === x2`: both ends share the
         * same u,v, only z differs — see `xy`), so it "grows" via a Y-only scale from its own lower end,
         * the same origin point it's drawn from.
         */}
        {[...SLAB_IDS].reverse().map((id) => {
          const z = zOf(id);
          const upper = SLAB_IDS[SLAB_IDS.indexOf(id) - 1];
          if (!upper) return null;
          return CORNERS.map(([u, v]) => {
            const [x1, y1] = xy(u, v, z + SLAB.t);
            const [x2, y2] = xy(u, v, zOf(upper));
            return (
              <line
                key={`${id}-${u}-${v}`}
                data-connector={id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeDasharray="4 4"
                className="stroke-hairline"
                style={
                  {
                    "--hero-delay": `${ENTRY[id].delayMs + CONNECTOR_EXTRA}ms`,
                    "--hero-scale-from": "1 0",
                    transformOrigin: `${x1}px ${y1}px`,
                  } as Vars
                }
              />
            );
          });
        })}
        <g
          data-layer="leadership"
          style={
            {
              "--hero-delay": `${ENTRY.leadership.delayMs}ms`,
              "--hero-from-x": `${ENTRY.leadership.fromX}px`,
              "--hero-from-y": `${ENTRY.leadership.fromY}px`,
            } as Vars
          }
        >
          {BLOCKS.map(({ rect, h }) => (
            <Box
              key={rect.join()}
              rect={rect}
              z={LEADERSHIP_Z}
              h={h}
              top={FILL[layer.leadership.fill]}
              side="fill-paper"
            />
          ))}
        </g>
        {/*
         * A callout: the leader line grows outward from the layer's anchor point (horizontal, so it's an
         * X-only scale) toward the label, then the pin dot pops on once it's connected — the same
         * layer-settles -> line-resolves -> pin-activates chain the HTML labels below continue.
         */}
        {layerIds.map((id) => {
          const [x, y] = ANCHORS[id];
          return (
            <g
              key={id}
              data-callout={id}
              style={{ "--hero-delay": `${ENTRY[id].delayMs + CALLOUT_EXTRA}ms` } as Vars}
            >
              <line
                x1={x}
                y1={y}
                x2={LABEL_X - 6}
                y2={y}
                className="stroke-hairline"
                style={{ "--hero-scale-from": "0 1", transformOrigin: `${x}px ${y}px` } as Vars}
              />
              <circle
                cx={x}
                cy={y}
                r={3}
                className="fill-ink"
                style={{ "--hero-delay": `${ENTRY[id].delayMs + PIN_EXTRA}ms` } as Vars}
              />
            </g>
          );
        })}
      </svg>

      <ul className="pointer-events-none absolute inset-0 m-0 list-none p-0" aria-hidden="true">
        {layerIds.map((id) => {
          const [, y] = ANCHORS[id];
          return (
            <li
              key={id}
              style={
                {
                  left: pct(LABEL_X, VIEW.width),
                  top: pct(y, VIEW.height),
                  "--hero-delay": `${ENTRY[id].delayMs + LABEL_EXTRA}ms`,
                } as Vars
              }
              className="hero-label absolute flex -translate-y-1/2 items-center gap-2"
            >
              <span
                style={{ "--hero-delay": `${ENTRY[id].delayMs + PIN_EXTRA}ms` } as Vars}
                className={`layer-${id} hero-pin type-label inline-flex size-6 shrink-0 items-center justify-center rounded-pill`}
              >
                {layer[id].number}
              </span>
              <span className="tech-label hidden min-[480px]:inline">{id}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
