"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

/** A CSS custom property in an inline `style` object — React's own type just doesn't spell this out. */
type Vars = CSSProperties & Record<`--${string}`, string | number>;

const SEEN_KEY = "assembly:intro-seen";
/**
 * Set to `true` only while iterating locally, to replay the intro on every load instead of once per
 * session — makes it easy to eyeball repeatedly. Must stay `false` here: this flag ships with whatever
 * this file is pushed as, and this repo's CI deploys `main` straight to the live site (see
 * .github/workflows/ci.yml) — `true` would mean every real visitor sees the intro on every visit, not
 * just their first. See `decide()` below.
 */
const ALWAYS_SHOW_FOR_REVIEW = false;
const COUNT_MS = 2200;
const FADE_MS = 350;
/** The viewBox is 0 0 SIZE SIZE, centred at CENTER, CENTER. */
const SIZE = 200;
const CENTER = SIZE / 2;
const NODE_COUNT = 30;

type Phase = "idle" | "active" | "leaving" | "done";
type Node = { x: number; y: number; r: number; delay: number; duration: number };
type Edge = { a: number; b: number };

/**
 * A small deterministic PRNG (mulberry32) seeded once at module load: reproducible layout without
 * depending on `Math.random()`'s timing, and safe to compute at module scope because this component
 * never renders this markup during SSR (see the doc comment on `LoadingIntro`) — there is no
 * server/client mismatch to worry about.
 */
function makeRand(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The "brain signal" network: a cluster of nodes in a deliberately irregular blob (not a circle — radius
 * per angle is wobbled by a couple of low-frequency harmonics plus per-node jitter), each connected to
 * its two nearest neighbours. Edges are then ordered by a breadth-first walk out from one origin node, so
 * revealing them in that order (see the `tick` loop in `LoadingIntro`) reads as a signal actually
 * propagating outward through the network as the count climbs, not switching on at random.
 */
function makeNetwork(nodeCount: number): { nodes: Node[]; edges: Edge[] } {
  const rand = makeRand(1337);

  const nodes: Node[] = [];
  for (let i = 0; i < nodeCount; i += 1) {
    const angle = rand() * Math.PI * 2;
    const wobble = 16 * Math.sin(angle * 3 + 1.3) + 9 * Math.sin(angle * 5 + 0.4);
    const maxRadius = 52 + wobble;
    const radius = Math.sqrt(rand()) * maxRadius;
    nodes.push({
      x: CENTER + Math.cos(angle) * radius,
      y: CENTER + Math.sin(angle) * radius,
      r: 1.1 + rand() * 1.3,
      delay: rand() * 2.4,
      duration: 1.6 + rand() * 1.6,
    });
  }

  const adjacency: number[][] = nodes.map(() => []);
  const seenPair = new Set<string>();
  nodes.forEach((node, i) => {
    const nearest = nodes
      .map((other, j) => ({
        j,
        d: i === j ? Infinity : Math.hypot(other.x - node.x, other.y - node.y),
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seenPair.has(key)) continue;
      seenPair.add(key);
      adjacency[i]!.push(j);
      adjacency[j]!.push(i);
    }
  });

  // Nearest-neighbour graphs aren't guaranteed connected — a walk from a single origin would silently
  // drop any node (and its edges) sitting in its own separate component. Restarting the walk from every
  // not-yet-visited node instead guarantees every edge ends up in `edges`, just with more than one
  // "signal origin" if the layout happens to produce more than one component.
  const edges: Edge[] = [];
  const edgeSeen = new Set<string>();
  const visited = new Set<number>();
  for (let start = 0; start < nodes.length; start += 1) {
    if (visited.has(start)) continue;
    visited.add(start);
    const queue = [start];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const next of adjacency[current]!) {
        const key = current < next ? `${current}-${next}` : `${next}-${current}`;
        if (!edgeSeen.has(key)) {
          edgeSeen.add(key);
          edges.push({ a: current, b: next });
        }
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
  }

  return { nodes, edges };
}

const { nodes: NODES, edges: EDGES } = makeNetwork(NODE_COUNT);

/**
 * A brief, first-visit-only intro: a small network of nodes — a stand-in for a brain's signal, not a
 * progress-bar shape on purpose (no ring, no enclosing circle) — lights up outward from one point as a
 * 0–100 count runs behind it, then the whole thing fades out of the way. Purely decorative chrome layered
 * on top of a page that is already fully rendered underneath it — this component starts in `idle`
 * (renders nothing) and only ever *adds* the overlay via a client effect, the same one-way rule the rest
 * of the Hero's motion follows (see `exploded-phone.tsx`): a visitor without JavaScript, on a repeat
 * visit this session, or with `prefers-reduced-motion` set never sees it and never waits on it, because
 * the real page beneath was never hidden to begin with — only covered. `sessionStorage`, not a cookie or
 * every-load replay: once per session is enough to make the first impression without becoming a tax on
 * every return visit.
 */
export function LoadingIntro() {
  const [phase, setPhase] = useState<Phase>("idle");
  const countRef = useRef<HTMLSpanElement>(null);
  const edgeRefs = useRef<(SVGLineElement | null)[]>([]);
  const decidedRef = useRef(false);

  useEffect(() => {
    // Guards against React Strict Mode's dev-only double-invoke of effects: without this, the first
    // pass would mark `SEEN_KEY` and show the intro, then the immediate second pass would read that
    // same flag back as already-seen and hide it again before the first paint — the intro would never
    // actually appear in `next dev`. The ref (unlike the effect body) survives that synthetic
    // mount/cleanup/remount, so `decide` only ever really runs once per mount.
    if (decidedRef.current) return;
    decidedRef.current = true;

    const decide = () => {
      let seen = true;
      if (ALWAYS_SHOW_FOR_REVIEW) {
        seen = false;
      } else {
        try {
          seen = sessionStorage.getItem(SEEN_KEY) === "1";
        } catch {
          seen = true; // storage unavailable (private mode, etc.): don't force a replay on every load either
        }
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (seen || reduced) {
        setPhase("done");
        return;
      }
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // ignore — worst case it can replay once more this session
      }
      setPhase("active");
    };
    decide();
  }, []);

  useEffect(() => {
    if (phase !== "active") return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_MS);
      if (countRef.current) countRef.current.textContent = String(Math.round(progress * 100));

      const revealed = Math.floor(progress * EDGES.length);
      edgeRefs.current.forEach((el, i) => {
        if (el) el.style.opacity = i < revealed ? "1" : "";
      });

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setPhase("leaving");
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      html.style.overflow = previousOverflow;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const timer = window.setTimeout(() => setPhase("done"), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`loading-intro fixed inset-0 z-50 flex items-center justify-center bg-vellum ${
        phase === "leaving" ? "loading-intro-leaving" : ""
      }`}
    >
      <div className="relative flex size-52 items-center justify-center sm:size-64">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full">
          <defs>
            <linearGradient id="loading-intro-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "var(--color-butter)" }} />
              <stop offset="100%" style={{ stopColor: "var(--color-signal)" }} />
            </linearGradient>
            <filter id="loading-intro-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#loading-intro-glow)">
            {EDGES.map((edge, i) => {
              const a = NODES[edge.a]!;
              const b = NODES[edge.b]!;
              return (
                <line
                  key={i}
                  ref={(el) => {
                    edgeRefs.current[i] = el;
                  }}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  strokeWidth="1"
                  className="loading-intro-edge"
                  stroke="url(#loading-intro-gold)"
                />
              );
            })}
            {NODES.map((node, i) => (
              <circle
                key={i}
                cx={node.x}
                cy={node.y}
                r={node.r}
                className="loading-intro-node"
                style={
                  {
                    "--node-delay": `${node.delay}s`,
                    "--node-duration": `${node.duration}s`,
                  } as Vars
                }
                fill="url(#loading-intro-gold)"
              />
            ))}
          </g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="loading-intro-readout type-label tabular-nums">
            <span ref={countRef}>0</span>
            <span className="text-ink-soft">%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
