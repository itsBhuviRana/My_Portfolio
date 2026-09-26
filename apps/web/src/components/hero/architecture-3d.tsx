"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type {
  BufferGeometry,
  CanvasTexture,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { layer, layerIds } from "@assembly/tokens";
import type { LayerId } from "@assembly/tokens";

export type ArchitectureVariant = "mobile" | "web";

/**
 * The Hero's architecture illustration as a real 3D scene: the six layers as slabs stacked in an exploded
 * view that you can drag to rotate, hover to inspect, and collapse or explode. The same six layers are shown
 * either way; only the slab changes shape (a phone for Mobile, a browser window for Web).
 *
 * Progressive enhancement: `fallback` (the SVG exploded view) is what the server renders and what stays
 * for visitors with reduced motion or no WebGL. `three` itself is imported lazily after mount, so it never
 * counts against first load. Layer colours come from the design tokens via CSS variables at runtime, and
 * labels are real buttons (the canvas is decorative and `aria-hidden`).
 */

const DIMS = { mobile: { w: 1.3, d: 2.7 }, web: { w: 3.0, d: 1.95 } } as const;
const THICK = 0.1;
const GAP = { exploded: 0.95, assembled: 0.17 } as const;
const ART_PX_PER_UNIT = 180;
const FOV = 30;

type Api = {
  setVariant: (variant: ArchitectureVariant) => void;
  setExploded: (exploded: boolean) => void;
  setHover: (id: LayerId | null) => void;
  setPinned: (id: LayerId | null) => void;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** The line art on the top face of each slab, drawn once per variant onto a transparent canvas. */
function drawArt(id: LayerId, variant: ArchitectureVariant, tone: string): HTMLCanvasElement {
  const { w, d } = DIMS[variant];
  const W = Math.round(w * 0.88 * ART_PX_PER_UNIT);
  const H = Math.round(d * 0.88 * ART_PX_PER_UNIT);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const wide = W > H;

  ctx.strokeStyle = tone;
  ctx.fillStyle = tone;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const box = (x: number, y: number, bw: number, bh: number, filled = false) => {
    ctx.beginPath();
    ctx.roundRect(x * W, y * H, bw * W, bh * H, 7);
    if (filled) {
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.stroke();
  };
  const line = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1 * W, y1 * H);
    ctx.lineTo(x2 * W, y2 * H);
    ctx.stroke();
  };
  const dot = (x: number, y: number, r: number, filled = false) => {
    ctx.beginPath();
    ctx.arc(x * W, y * H, r * Math.min(W, H), 0, Math.PI * 2);
    if (filled) {
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.stroke();
  };

  ctx.font = `700 ${Math.round(Math.min(W, H) * 0.12)}px ui-monospace, monospace`;
  ctx.textBaseline = "top";
  ctx.globalAlpha = 0.85;
  ctx.fillText(`0${layer[id].number}`, 0.05 * W, 0.04 * H);
  ctx.globalAlpha = 1;

  switch (id) {
    case "interface": {
      box(0.06, 0.16, 0.88, 0.12, true);
      if (wide) {
        box(0.06, 0.34, 0.42, 0.26, true);
        box(0.52, 0.34, 0.42, 0.26);
        for (let i = 0; i < 3; i += 1) line(0.06, 0.7 + i * 0.09, 0.94 - i * 0.16, 0.7 + i * 0.09);
      } else {
        box(0.06, 0.34, 0.88, 0.2, true);
        for (let i = 0; i < 4; i += 1)
          line(0.06, 0.64 + i * 0.075, 0.94 - i * 0.14, 0.64 + i * 0.075);
      }
      break;
    }
    case "components": {
      const cols = wide ? 3 : 2;
      const rows = wide ? 2 : 3;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const cw = (0.88 - (cols - 1) * 0.05) / cols;
          const ch = (0.72 - (rows - 1) * 0.05) / rows;
          box(0.06 + c * (cw + 0.05), 0.2 + r * (ch + 0.05), cw, ch, (r + c) % 2 === 0);
        }
      }
      break;
    }
    case "state": {
      const nodes: [number, number][] = wide
        ? [
            [0.2, 0.62],
            [0.5, 0.32],
            [0.8, 0.62],
          ]
        : [
            [0.5, 0.3],
            [0.25, 0.62],
            [0.75, 0.74],
          ];
      line(nodes[0]![0], nodes[0]![1], nodes[1]![0], nodes[1]![1]);
      line(nodes[1]![0], nodes[1]![1], nodes[2]![0], nodes[2]![1]);
      line(nodes[2]![0], nodes[2]![1], nodes[0]![0], nodes[0]![1]);
      nodes.forEach(([x, y]) => dot(x, y, 0.09, true));
      break;
    }
    case "native": {
      box(0.28, 0.3, 0.44, wide ? 0.44 : 0.2, true);
      const chipH = wide ? 0.44 : 0.2;
      for (let i = 0; i < 4; i += 1) {
        const t = 0.34 + i * 0.1;
        line(0.28 + 0.44 * ((i + 1) / 5), 0.3, 0.28 + 0.44 * ((i + 1) / 5), 0.22);
        line(
          0.28 + 0.44 * ((i + 1) / 5),
          0.3 + chipH,
          0.28 + 0.44 * ((i + 1) / 5),
          0.3 + chipH + 0.08,
        );
        line(0.28, t + (wide ? 0 : -0.04), 0.2, t + (wide ? 0 : -0.04));
        line(0.72, t + (wide ? 0 : -0.04), 0.8, t + (wide ? 0 : -0.04));
      }
      break;
    }
    case "delivery": {
      const n = 3;
      for (let i = 0; i < n; i += 1) {
        if (wide) {
          const bx = 0.06 + i * 0.32;
          box(bx, 0.36, 0.24, 0.28, i === 1);
          if (i < n - 1) line(bx + 0.24, 0.5, bx + 0.32, 0.5);
        } else {
          const by = 0.18 + i * 0.27;
          box(0.2, by, 0.6, 0.18, i === 1);
          if (i < n - 1) line(0.5, by + 0.18, 0.5, by + 0.27);
        }
      }
      break;
    }
    case "leadership": {
      box(wide ? 0.36 : 0.28, 0.18, wide ? 0.28 : 0.44, 0.16, true);
      const xs = wide ? [0.1, 0.4, 0.7] : [0.08, 0.38, 0.68];
      xs.forEach((x) => {
        line(wide ? 0.5 : 0.5, 0.34, x + 0.11, 0.5);
        box(x, 0.5, wide ? 0.2 : 0.24, 0.14 + (wide ? 0.06 : 0.12));
      });
      break;
    }
  }
  return canvas;
}

export function Architecture3D({
  variant,
  fallback,
}: {
  variant: ArchitectureVariant;
  fallback: ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<Partial<Record<LayerId, HTMLLIElement | null>>>({});
  const apiRef = useRef<Api | null>(null);
  const variantRef = useRef(variant);
  const [ready, setReady] = useState(false);
  const [fallbackGone, setFallbackGone] = useState(false);
  const [exploded, setExploded] = useState(true);
  const [pinned, setPinned] = useState<LayerId | null>(null);

  useEffect(() => {
    variantRef.current = variant;
    apiRef.current?.setVariant(variant);
  }, [variant]);

  useEffect(() => {
    apiRef.current?.setExploded(exploded);
  }, [exploded]);

  useEffect(() => {
    apiRef.current?.setPinned(pinned);
  }, [pinned]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setFallbackGone(true), 700);
    return () => window.clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        return; // No WebGL: the SVG fallback simply stays.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const rootStyle = getComputedStyle(document.documentElement);
      const token = (name: string) => rootStyle.getPropertyValue(name).trim();
      const inkColor = token("--color-ink");

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 1.5));
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(3, 6, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.9);
      rim.position.set(-4, 2, -3);
      scene.add(rim);

      const tilt = new THREE.Group();
      const spin = new THREE.Group();
      tilt.add(spin);
      scene.add(tilt);

      type Slab = {
        id: LayerId;
        index: number;
        group: Group;
        body: Mesh;
        edges: LineSegments;
        art: Mesh;
        bodyMat: MeshStandardMaterial;
        edgeMat: LineBasicMaterial;
        artMat: MeshBasicMaterial;
        artTexture: CanvasTexture | null;
        variant: ArchitectureVariant;
        hi: number;
        dim: number;
        morphStart: number | null;
        morphSwapped: boolean;
        morphTo: ArchitectureVariant;
      };

      const geometries = new Set<BufferGeometry>();
      const slabs: Slab[] = layerIds.map((id, index) => {
        const bodyMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(token(`--color-${layer[id].fill}`)),
          roughness: 0.38,
          metalness: 0.25,
          transparent: true,
        });
        const edgeMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(inkColor),
          transparent: true,
          opacity: 0.55,
        });
        const artMat = new THREE.MeshBasicMaterial({
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        });
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BufferGeometry(), bodyMat);
        body.userData.layerId = id;
        const edges = new THREE.LineSegments(new THREE.BufferGeometry(), edgeMat);
        const art = new THREE.Mesh(new THREE.BufferGeometry(), artMat);
        art.rotation.x = -Math.PI / 2;
        group.add(body, edges, art);
        spin.add(group);
        return {
          id,
          index,
          group,
          body,
          edges,
          art,
          bodyMat,
          edgeMat,
          artMat,
          artTexture: null,
          variant: variantRef.current,
          hi: 0,
          dim: 0,
          morphStart: null,
          morphSwapped: true,
          morphTo: variantRef.current,
        };
      });

      const applyVariant = (slab: Slab, next: ArchitectureVariant) => {
        const { w, d } = DIMS[next];
        for (const geometry of [slab.body.geometry, slab.edges.geometry, slab.art.geometry]) {
          geometries.delete(geometry);
          geometry.dispose();
        }
        const boxGeometry = new RoundedBoxGeometry(w, THICK, d, 4, 0.05);
        slab.body.geometry = boxGeometry;
        slab.edges.geometry = new THREE.EdgesGeometry(boxGeometry, 35);
        slab.art.geometry = new THREE.PlaneGeometry(w * 0.88, d * 0.88);
        slab.art.position.y = THICK / 2 + 0.003;
        geometries.add(slab.body.geometry).add(slab.edges.geometry).add(slab.art.geometry);
        slab.artTexture?.dispose();
        const tone = layer[slab.id].on === "paper" ? token("--color-paper") : token("--color-ink");
        const texture = new THREE.CanvasTexture(drawArt(slab.id, next, tone));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        slab.artTexture = texture;
        slab.artMat.map = texture;
        slab.artMat.needsUpdate = true;
        slab.variant = next;
      };
      slabs.forEach((slab) => applyVariant(slab, slab.variant));

      // --- state -----------------------------------------------------------------------------------
      let explodedTarget = true;
      let gap: number = GAP.exploded;
      // Hover from the labels and from the canvas are tracked apart: on moving from the canvas onto a
      // label, the browser dispatches the label's `pointerover` before the canvas's `pointerleave`, so a
      // single shared value would be cleared right after the label set it.
      let labelHover: LayerId | null = null;
      let canvasHover: LayerId | null = null;
      let pinnedId: LayerId | null = null;
      let yaw = 0.62;
      let pitch = 0.55;
      let lastInteraction = -10;
      let idle = 0;
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let visible = true;
      let raf = 0;
      let introStart = performance.now();
      let width = 1;
      let height = 1;

      apiRef.current = {
        setVariant: (next) => {
          const now = performance.now();
          slabs.forEach((slab, i) => {
            if (slab.variant === next && slab.morphTo === next) return;
            slab.morphTo = next;
            slab.morphStart = now + i * 70;
            slab.morphSwapped = false;
          });
          fit();
        },
        setExploded: (value) => {
          explodedTarget = value;
        },
        setHover: (id) => {
          labelHover = id;
        },
        setPinned: (id) => {
          pinnedId = id;
        },
      };

      const fit = () => {
        const tan = Math.tan((FOV * Math.PI) / 360);
        const narrow = width < 520;
        const halfW = (variantRef.current === "web" ? 2.4 : 1.8) + (narrow ? 0.7 : 0);
        const distance = Math.max(3.3 / tan, halfW / (tan * (width / height)));
        camera.position.set(0, 0, distance);
        tilt.position.x = narrow ? -0.6 : 0;
      };

      const resize = () => {
        width = Math.max(1, host.clientWidth);
        height = Math.max(1, host.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        fit();
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);

      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      });
      intersection.observe(host);

      // --- pointer ---------------------------------------------------------------------------------
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const pick = (event: PointerEvent): LayerId | null => {
        const rect = canvas.getBoundingClientRect();
        ndc.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(
          slabs.map((s) => s.body),
          false,
        )[0];
        return (hit?.object.userData.layerId as LayerId | undefined) ?? null;
      };

      const onDown = (event: PointerEvent) => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        lastInteraction = performance.now() / 1000;
        canvas.setPointerCapture(event.pointerId);
        canvas.style.cursor = "grabbing";
      };
      const onMove = (event: PointerEvent) => {
        if (dragging) {
          yaw += (event.clientX - lastX) * 0.008;
          pitch = Math.min(1.2, Math.max(0.28, pitch + (event.clientY - lastY) * 0.005));
          lastX = event.clientX;
          lastY = event.clientY;
          lastInteraction = performance.now() / 1000;
        } else if (event.pointerType === "mouse") {
          canvasHover = pick(event);
          canvas.style.cursor = canvasHover ? "pointer" : "grab";
        }
      };
      const onUp = (event: PointerEvent) => {
        dragging = false;
        canvas.style.cursor = "grab";
        if (canvas.hasPointerCapture(event.pointerId))
          canvas.releasePointerCapture(event.pointerId);
      };
      const onLeave = () => {
        if (!dragging) canvasHover = null;
      };
      canvas.style.cursor = "grab";
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      canvas.addEventListener("pointerleave", onLeave);

      // --- frame -----------------------------------------------------------------------------------
      const tmp = new THREE.Vector3();
      let previous = performance.now();
      let firstFrame = true;

      function frame(now: number) {
        raf = 0;
        if (disposed || !visible) return;
        const dt = Math.min(0.05, (now - previous) / 1000);
        previous = now;

        // Hold the entrance until the page intro (the tube-light overlay) is out of the way.
        if (document.documentElement.dataset.intro === "on") introStart = now;

        const gapTarget = explodedTarget ? GAP.exploded : GAP.assembled;
        gap += (gapTarget - gap) * (1 - Math.exp(-dt * 6));
        const explodedAmount = clamp01((gap - GAP.assembled) / (GAP.exploded - GAP.assembled));

        const t = now / 1000;
        idle += ((t - lastInteraction > 2.2 ? 1 : 0) - idle) * (1 - Math.exp(-dt * 1.5));
        spin.rotation.y = yaw + Math.sin(t * 0.4) * 0.28 * idle;
        tilt.rotation.x = pitch + Math.sin(t * 0.3) * 0.04 * idle;

        const focus = labelHover ?? canvasHover ?? pinnedId;
        const count = slabs.length;

        slabs.forEach((slab) => {
          // Entrance: each layer drops in from above, staggered.
          const entry = clamp01((now - introStart - slab.index * 110) / 1000);
          const eased = entry === 0 ? 0 : entry === 1 ? 1 : easeOutBack(entry);

          // Variant morph: shrink, swap the shape at the smallest point, grow back.
          let scale = 1;
          if (slab.morphStart !== null && now >= slab.morphStart) {
            const m = (now - slab.morphStart) / 750;
            if (m >= 0.5 && !slab.morphSwapped) {
              applyVariant(slab, slab.morphTo);
              slab.morphSwapped = true;
            }
            if (m >= 1) slab.morphStart = null;
            else scale = m < 0.5 ? 1 - Math.pow(m / 0.5, 2) : easeOutBack((m - 0.5) / 0.5);
          }
          slab.group.scale.set(Math.max(0.001, scale), 1, Math.max(0.001, scale));

          const targetHi = focus === slab.id ? 1 : 0;
          const targetDim = focus && focus !== slab.id ? 1 : 0;
          slab.hi += (targetHi - slab.hi) * (1 - Math.exp(-dt * 10));
          slab.dim += (targetDim - slab.dim) * (1 - Math.exp(-dt * 10));

          const baseY = ((count - 1) / 2 - slab.index) * gap;
          const bob = Math.sin(t * 1.2 + slab.index * 0.9) * 0.03 * explodedAmount;
          slab.group.position.y = baseY + bob + slab.hi * 0.16 + (1 - eased) * 2.6;

          const alpha = clamp01(eased) * (1 - 0.55 * slab.dim);
          slab.bodyMat.opacity = alpha;
          slab.bodyMat.emissive.setScalar(0.05 + 0.3 * slab.hi);
          slab.edgeMat.opacity = (0.7 + 0.3 * slab.hi) * alpha;
          slab.artMat.opacity = alpha;
        });

        // Labels follow their layers; collapsed, they spread out evenly so they never overlap.
        scene.updateMatrixWorld();
        slabs.forEach((slab) => {
          const el = labelRefs.current[slab.id];
          if (!el) return;
          slab.group.getWorldPosition(tmp);
          tmp.project(camera);
          const projected = ((1 - tmp.y) / 2) * height;
          const even = height * (0.16 + slab.index * (0.68 / (count - 1)));
          const y = even + (projected - even) * explodedAmount;
          el.style.transform = `translateY(${y.toFixed(1)}px)`;
          el.style.opacity = String(clamp01((now - introStart - slab.index * 110 - 500) / 500));
        });

        renderer.render(scene, camera);
        if (firstFrame) {
          firstFrame = false;
          setReady(true);
        }
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        resizeObserver.disconnect();
        intersection.disconnect();
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        canvas.removeEventListener("pointerleave", onLeave);
        apiRef.current = null;
        geometries.forEach((geometry) => geometry.dispose());
        slabs.forEach((slab) => {
          slab.bodyMat.dispose();
          slab.edgeMat.dispose();
          slab.artMat.dispose();
          slab.artTexture?.dispose();
        });
        renderer.dispose();
        renderer.forceContextLoss();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="relative h-[340px] w-full sm:h-[420px] lg:h-[520px]">
      {fallbackGone ? null : <div className="absolute inset-0">{fallback}</div>}

      <div
        ref={hostRef}
        className={`glass grid-iso absolute inset-0 overflow-hidden transition-opacity duration-700 ${
          ready ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 size-full touch-pan-y"
        />

        <ul className="pointer-events-none absolute inset-y-0 right-2 m-0 w-36 list-none p-0 sm:right-6">
          {layerIds.map((id) => (
            <li
              key={id}
              ref={(el) => {
                labelRefs.current[id] = el;
              }}
              className="absolute right-0 top-0 -mt-3 opacity-0"
            >
              <button
                type="button"
                aria-pressed={pinned === id}
                onClick={() => setPinned((current) => (current === id ? null : id))}
                onPointerEnter={() => apiRef.current?.setHover(id)}
                onPointerLeave={() => apiRef.current?.setHover(null)}
                onFocus={() => apiRef.current?.setHover(id)}
                onBlur={() => apiRef.current?.setHover(null)}
                className="pointer-events-auto flex min-h-6 cursor-pointer items-center gap-2 rounded-pill bg-transparent p-0"
              >
                <span
                  className={`layer-${id} type-label inline-flex size-6 shrink-0 items-center justify-center rounded-pill`}
                >
                  {layer[id].number}
                </span>
                <span className="tech-label hidden capitalize text-ink min-[480px]:inline">
                  {id}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
          <button
            type="button"
            aria-pressed={exploded}
            onClick={() => setExploded((value) => !value)}
            className="glass-chip type-label min-h-9 cursor-pointer px-3 text-ink"
          >
            {exploded ? "Assemble" : "Explode"}
          </button>
          <span className="tech-label hidden sm:inline">Drag to rotate · hover a layer</span>
        </div>
      </div>
    </div>
  );
}
