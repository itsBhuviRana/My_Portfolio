import type { ComponentType } from "react";
import { layer, layerIds, shape } from "@assembly/tokens";
import type { LayerId } from "@assembly/tokens";

/**
 * The Hero object: a generic phone taken apart into its layers, drawn as an isometric exploded view.
 * Static for now. Each layer is its own `<g data-layer="...">` at a fixed height, so a later phase can
 * assemble and explode the same art by moving the groups. Nothing here is a real app or product.
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

function Patch({ rect, z, className }: { rect: Rect; z: number; className: string }) {
  return <polygon points={flat(rect, z)} className={className} />;
}

function Wire({ from, to, z }: { from: Point; to: Point; z: number }) {
  const [x1, y1] = xy(from[0], from[1], z);
  const [x2, y2] = xy(to[0], to[1], z);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-outline" />;
}

/** A wire with an open arrowhead at its end, drawn on the surface of a layer. */
function Arrow({ from, to, z }: { from: Point; to: Point; z: number }) {
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
      <Wire from={from} to={to} z={z} />
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
      {[24, 60, 96].map((u) => (
        <Patch key={u} rect={[u - 3, 234, u + 3, 240]} z={z} className="fill-ink" />
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
              <Patch key={j} rect={[u0, v0 + a, u1, v0 + b]} z={z} className="fill-ink" />
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
        return <Arrow key={i} from={start} to={end} z={z} />;
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
      <Wire from={[71, 32]} to={[102, 29]} z={z} />
      <Wire from={[71, 32]} to={[79, 115]} z={z} />
      <Wire from={[79, 115]} to={[91, 208]} z={z} />
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
      {ports.map((rect) => (
        <Patch key={rect.join()} rect={rect} z={z} className="fill-paper stroke-outline" />
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

export function ExplodedPhone() {
  const description =
    "Exploded view of a generic phone, taken apart into six layers from top to bottom: " +
    layerIds.join(", ") +
    ".";

  return (
    <div
      role="img"
      aria-label={description}
      className="grid-iso relative w-full border border-rule bg-vellum"
      style={{ aspectRatio: `${VIEW.width} / ${VIEW.height}` }}
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
          const upper = SLAB_IDS[SLAB_IDS.indexOf(id) - 1];
          return (
            <g key={id} data-layer={id}>
              <Box rect={SLAB_RECT} z={z} h={SLAB.t} top={FILL[layer[id].fill]} side="fill-paper" />
              <Art z={z + SLAB.t} />
              {upper
                ? CORNERS.map(([u, v]) => {
                    const [x1, y1] = xy(u, v, z + SLAB.t);
                    const [x2, y2] = xy(u, v, zOf(upper));
                    return (
                      <line
                        key={`${u}-${v}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        strokeDasharray="4 4"
                        className="stroke-hairline"
                      />
                    );
                  })
                : null}
            </g>
          );
        })}
        <g data-layer="leadership">
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
        {layerIds.map((id) => {
          const [x, y] = ANCHORS[id];
          return (
            <g key={id} data-callout={id}>
              <line x1={x} y1={y} x2={LABEL_X - 6} y2={y} className="stroke-hairline" />
              <circle cx={x} cy={y} r={3} className="fill-ink" />
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
              className="absolute flex -translate-y-1/2 items-center gap-2"
              style={{ left: pct(LABEL_X, VIEW.width), top: pct(y, VIEW.height) }}
            >
              <span
                className={`layer-${id} type-label inline-flex size-6 shrink-0 items-center justify-center rounded-pill`}
              >
                {layer[id].number}
              </span>
              <span className="tech-label hidden min-[480px]:inline">{id}</span>
            </li>
          );
        })}
      </ul>

      <p className="tech-label absolute bottom-2 left-3 hidden sm:block" aria-hidden="true">
        Generic screen · {shape.device.screen.width} × {shape.device.screen.height}
      </p>
    </div>
  );
}
