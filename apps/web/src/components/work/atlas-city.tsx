"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  BufferGeometry,
  CanvasTexture,
  Group as ThreeGroup,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
} from "three";
import {
  ATLAS_MODES,
  buildTour,
  buildingSize,
  groupProjects,
  layoutGroups,
  type AtlasCityMode,
  type AtlasCityProject,
  type AtlasGroup,
} from "./atlas-layout";

/**
 * The Project Atlas as a 3D city: every project is a building (a slim tower for mobile, a wide slab for web,
 * taller when featured) standing in a district. The visitor rearranges the whole city by company, platform
 * or domain, taps a building for what is confirmed about it, or lets the guided walk-through drive the camera.
 * All of it is drawn from the atlas data; nothing here is invented.
 *
 * `children` is the original 2D overview, server-rendered: it stays in the page as the
 * fallback for reduced motion, no WebGL, or while three.js is still loading (it is imported lazily, so it
 * never counts against first load).
 */

type Api = {
  setMode: (mode: AtlasCityMode) => void;
  frame: (ids: string[] | null) => void;
  highlight: (ids: string[] | null) => void;
  select: (id: string | null) => void;
};

type LabelInfo = { key: string; label: string; count: number };

const FOV = 32;
const PITCH = 0.62;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** A small deterministic hash so the lit windows are the same on every load. */
function windowLit(col: number, row: number, seed: number): boolean {
  const n = Math.sin(col * 12.9898 + row * 78.233 + seed * 37.719) * 43758.5453;
  return n - Math.floor(n) > 0.42;
}

function drawWindows(seed: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 64, 128);
  ctx.fillStyle = "#fff";
  for (let row = 0; row < 12; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      if (windowLit(col, row, seed)) ctx.fillRect(6 + col * 11, 6 + row * 10, 6, 5);
    }
  }
  return canvas;
}

export function AtlasCity({
  projects,
  children,
}: {
  projects: readonly AtlasCityProject[];
  children: ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const labelEls = useRef(new Map<string, HTMLElement>());
  const apiRef = useRef<Api | null>(null);

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<AtlasCityMode>("company");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [labels, setLabels] = useState<LabelInfo[]>([]);

  const tour = useMemo(() => buildTour(projects), [projects]);
  const step = tourIndex === null ? null : (tour[tourIndex] ?? null);
  const selected = projects.find((p) => p.id === selectedId) ?? null;

  // Push React state into the scene.
  useEffect(() => {
    apiRef.current?.setMode(mode);
  }, [mode, ready]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.select(selectedId);
    if (selectedId) {
      api.frame([selectedId]);
      api.highlight([selectedId]);
    } else if (step) {
      api.frame(step.frame);
      api.highlight(step.highlight);
    } else {
      api.frame(null);
      api.highlight(null);
    }
  }, [selectedId, step, mode, ready]);

  const goStep = (index: number) => {
    const target = tour[index];
    if (!target) return;
    setTourIndex(index);
    setSelectedId(null);
    setMode(target.mode);
  };
  const exitTour = () => setTourIndex(null);

  useEffect(() => {
    if (tourIndex === null && !selectedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedId) setSelectedId(null);
        else setTourIndex(null);
      } else if (tourIndex !== null && !selectedId) {
        if (event.key === "ArrowRight" && tourIndex < tour.length - 1) goStep(tourIndex + 1);
        if (event.key === "ArrowLeft" && tourIndex > 0) goStep(tourIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // goStep only closes over `tour`, which is stable for a given `projects`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourIndex, selectedId, tour]);

  // The scene.
  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        return; // No WebGL: the 2D overview simply stays.
      }
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.5 : 2),
      );

      const rootStyle = getComputedStyle(document.documentElement);
      const token = (name: string) => rootStyle.getPropertyValue(name).trim();
      const inkColor = new THREE.Color(token("--color-ink"));
      const vellumColor = new THREE.Color(token("--color-vellum"));
      const mobileColor = new THREE.Color(token("--color-cobalt"));
      const webColor = new THREE.Color(token("--color-rose"));

      const scene = new THREE.Scene();
      const fog = new THREE.Fog(vellumColor, 16, 48);
      scene.fog = fog;
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 1.15));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(6, 10, 7);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.8);
      rim.position.set(-7, 4, -6);
      scene.add(rim);

      const grid = new THREE.GridHelper(90, 90, inkColor, inkColor);
      const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
      for (const m of gridMaterials) {
        m.transparent = true;
        m.opacity = 0.1;
      }
      scene.add(grid);

      // --- buildings ---------------------------------------------------------------------------
      const windowTextures = [
        new THREE.CanvasTexture(drawWindows(1)),
        new THREE.CanvasTexture(drawWindows(2)),
      ];
      for (const t of windowTextures) {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.colorSpace = THREE.SRGBColorSpace;
      }
      const geometries: BufferGeometry[] = [];
      const textures: CanvasTexture[] = [...windowTextures];

      type Building = {
        project: AtlasCityProject;
        index: number;
        mesh: Mesh;
        edges: LineSegments;
        sideMat: MeshStandardMaterial;
        topMat: MeshStandardMaterial;
        edgeMat: LineBasicMaterial;
        height: number;
        x: number;
        z: number;
        fromX: number;
        fromZ: number;
        toX: number;
        toZ: number;
        moveStart: number;
        hi: number;
        dim: number;
      };

      const world: ThreeGroup = new THREE.Group();
      scene.add(world);

      const buildings: Building[] = projects.map((project, index) => {
        const size = buildingSize(project);
        const base = project.platform === "mobile" ? mobileColor : webColor;
        const tex = windowTextures[index % 2]!.clone();
        tex.needsUpdate = true;
        tex.repeat.set(size.w * 0.9, size.h * 0.9);
        textures.push(tex);
        const sideMat = new THREE.MeshStandardMaterial({
          color: base.clone().multiplyScalar(0.55),
          roughness: 0.55,
          metalness: 0.15,
          emissive: inkColor,
          emissiveMap: tex,
          emissiveIntensity: 0.6,
          transparent: true,
        });
        const topMat = new THREE.MeshStandardMaterial({
          color: base,
          roughness: 0.4,
          metalness: 0.2,
          emissive: inkColor,
          emissiveIntensity: project.tier === "featured" ? 0.28 : 0.05,
          transparent: true,
        });
        const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
        geometry.translate(0, size.h / 2, 0);
        const edgeGeometry = new THREE.EdgesGeometry(geometry, 30);
        geometries.push(geometry, edgeGeometry);
        const mesh = new THREE.Mesh(geometry, [sideMat, sideMat, topMat, topMat, sideMat, sideMat]);
        mesh.userData.projectId = project.id;
        const edgeMat = new THREE.LineBasicMaterial({
          color: inkColor,
          transparent: true,
          opacity: 0.35,
        });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMat);
        world.add(mesh, edges);
        return {
          project,
          index,
          mesh,
          edges,
          sideMat,
          topMat,
          edgeMat,
          height: size.h,
          x: 0,
          z: 0,
          fromX: 0,
          fromZ: 0,
          toX: 0,
          toZ: 0,
          moveStart: 0,
          hi: 0,
          dim: 0,
        };
      });
      const byId = new Map(buildings.map((b) => [b.project.id, b]));

      // District pads under each group.
      const padGeometry = new THREE.PlaneGeometry(1, 1);
      padGeometry.rotateX(-Math.PI / 2);
      const padEdge = new THREE.EdgesGeometry(padGeometry);
      geometries.push(padGeometry, padEdge);
      const padMaterial = new THREE.MeshBasicMaterial({
        color: inkColor,
        transparent: true,
        opacity: 0.05,
        depthWrite: false,
      });
      const padLineMaterial = new THREE.LineBasicMaterial({
        color: inkColor,
        transparent: true,
        opacity: 0.22,
      });
      const pads = Array.from({ length: 14 }, () => {
        const pad = new THREE.Mesh(padGeometry, padMaterial);
        pad.add(new THREE.LineSegments(padEdge, padLineMaterial));
        pad.position.y = 0.01;
        pad.visible = false;
        world.add(pad);
        return pad;
      });

      // --- state ---------------------------------------------------------------------------------
      let currentMode: AtlasCityMode = "company";
      let groups: AtlasGroup[] = [];
      let anchors: Record<string, { x: number; z: number; w: number; d: number }> = {};
      let layoutAspect = 1;
      let layoutSpan = { width: 10, depth: 6 };
      let highlightIds: Set<string> | null = null;
      let selectedIdLocal: string | null = null;
      let hoverId: string | null = null;
      let frameIds: string[] | null = null;

      const yaw = 0.35;
      let pitch = PITCH;
      let userYaw = 0;
      let curYaw = yaw;
      let curPitch = pitch;
      let curDist = 30;
      let goalDist = 20;
      const curTarget = new THREE.Vector3(0, 0.8, 0);
      const goalTarget = new THREE.Vector3(0, 0.8, 0);
      let lastInteraction = -10;
      let idle = 0;
      let dragging = false;
      let dragTravel = 0;
      let lastX = 0;
      let lastY = 0;
      let visible = false;
      let entered = false;
      let enteredAt = 0;
      let width = 1;
      let height = 1;
      let raf = 0;
      let previous = performance.now();

      const fitDistance = (halfX: number, halfZ: number, halfY: number) => {
        const tan = Math.tan((FOV * Math.PI) / 360);
        const aspect = width / height;
        const vertical = halfZ * Math.sin(PITCH) + halfY * Math.cos(PITCH);
        return (
          Math.max(halfX / (tan * aspect), vertical / tan) * (aspect < 0.8 ? 1.42 : 1.18) + 1.5
        );
      };

      const applyFrame = () => {
        const ids = frameIds;
        const narrow = width < 720;
        if (!ids) {
          goalTarget.set(0, 0.8, 0);
          goalDist = fitDistance(layoutSpan.width / 2 + 0.8, layoutSpan.depth / 2 + 0.8, 1.4);
          return;
        }
        let minX = Infinity;
        let maxX = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;
        let maxH = 0;
        for (const id of ids) {
          const b = byId.get(id);
          if (!b) continue;
          minX = Math.min(minX, b.toX);
          maxX = Math.max(maxX, b.toX);
          minZ = Math.min(minZ, b.toZ);
          maxZ = Math.max(maxZ, b.toZ);
          maxH = Math.max(maxH, b.height);
        }
        if (!Number.isFinite(minX)) return;
        const single = ids.length === 1;
        const halfX = (maxX - minX) / 2 + (single ? 1.3 : 1.6);
        const halfZ = (maxZ - minZ) / 2 + (single ? 1.3 : 1.6);
        const cx = (minX + maxX) / 2;
        const cz = (minZ + maxZ) / 2;
        goalDist = fitDistance(halfX, halfZ, Math.max(1, maxH / 2)) * (single ? 1.25 : 1.05);
        // Keep the subject clear of the detail panel: to its left on wide screens, above it on phones.
        const shift = single ? goalDist * (narrow ? 0 : 0.2) : 0;
        goalTarget.set(
          cx + Math.cos(yaw) * shift,
          narrow && single ? maxH / 2 - goalDist * 0.1 : maxH / 2,
          cz - Math.sin(yaw) * shift,
        );
      };

      const relayout = (animate: boolean) => {
        groups = groupProjects(projects, currentMode);
        layoutAspect = width / height;
        const layout = layoutGroups(groups, layoutAspect);
        anchors = layout.anchors;
        layoutSpan = { width: layout.width, depth: layout.depth };
        const now = performance.now();
        groups.forEach((group) => {
          group.ids.forEach((id, i) => {
            const b = byId.get(id);
            const p = layout.placements[id];
            if (!b || !p) return;
            b.fromX = b.x;
            b.fromZ = b.z;
            b.toX = p.x;
            b.toZ = p.z;
            b.moveStart = animate ? now + i * 28 : now - 2000;
          });
        });
        pads.forEach((pad, i) => {
          const group = groups[i];
          const a = group ? anchors[group.key] : undefined;
          pad.visible = Boolean(a);
          if (a) {
            pad.position.set(a.x, 0.01, a.z);
            pad.scale.set(a.w + 0.4, 1, a.d + 0.4);
          }
        });
        setLabels(groups.map((g) => ({ key: g.key, label: g.label, count: g.ids.length })));
        applyFrame();
      };

      apiRef.current = {
        setMode: (next) => {
          currentMode = next;
          relayout(entered);
        },
        frame: (ids) => {
          frameIds = ids;
          applyFrame();
        },
        highlight: (ids) => {
          highlightIds = ids ? new Set(ids) : null;
        },
        select: (id) => {
          selectedIdLocal = id;
        },
      };

      const resize = () => {
        width = Math.max(1, host.clientWidth);
        height = Math.max(1, host.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (Math.abs(width / height - layoutAspect) > 0.3) relayout(false);
        else applyFrame();
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);

      const intersection = new IntersectionObserver(
        ([entry]) => {
          visible = (entry?.isIntersecting ?? false) && host.clientHeight > 40;
          if (visible && !raf) {
            previous = performance.now();
            raf = requestAnimationFrame(frame);
          }
        },
        { threshold: 0.25 },
      );
      intersection.observe(host);

      // --- pointer -------------------------------------------------------------------------------
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const pick = (event: PointerEvent): string | null => {
        const rect = canvas.getBoundingClientRect();
        ndc.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(
          buildings.map((b) => b.mesh),
          false,
        )[0];
        return (hit?.object.userData.projectId as string | undefined) ?? null;
      };
      const names = new Map(projects.map((p) => [p.id, p.name]));
      const tooltip = tooltipRef.current;
      const showTooltip = (event: PointerEvent, id: string | null) => {
        if (!tooltip) return;
        if (!id) {
          tooltip.style.opacity = "0";
          return;
        }
        const rect = host.getBoundingClientRect();
        tooltip.textContent = names.get(id) ?? "";
        tooltip.style.transform = `translate(${event.clientX - rect.left + 14}px, ${event.clientY - rect.top + 14}px)`;
        tooltip.style.opacity = "1";
      };

      const onDown = (event: PointerEvent) => {
        dragging = true;
        dragTravel = 0;
        lastX = event.clientX;
        lastY = event.clientY;
        lastInteraction = performance.now() / 1000;
        canvas.setPointerCapture(event.pointerId);
      };
      const onMove = (event: PointerEvent) => {
        if (dragging) {
          const dx = event.clientX - lastX;
          const dy = event.clientY - lastY;
          dragTravel += Math.abs(dx) + Math.abs(dy);
          userYaw += dx * 0.006;
          pitch = Math.min(1.15, Math.max(0.3, pitch + dy * 0.004));
          lastX = event.clientX;
          lastY = event.clientY;
          lastInteraction = performance.now() / 1000;
        } else if (event.pointerType === "mouse") {
          hoverId = pick(event);
          canvas.style.cursor = hoverId ? "pointer" : "grab";
          showTooltip(event, hoverId);
        }
      };
      const onUp = (event: PointerEvent) => {
        const wasClick = dragging && dragTravel < 6;
        dragging = false;
        if (canvas.hasPointerCapture(event.pointerId))
          canvas.releasePointerCapture(event.pointerId);
        if (wasClick) setSelectedId(pick(event));
      };
      const onLeave = () => {
        if (!dragging) {
          hoverId = null;
          if (tooltip) tooltip.style.opacity = "0";
        }
      };
      canvas.style.cursor = "grab";
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      canvas.addEventListener("pointerleave", onLeave);

      // --- frame ---------------------------------------------------------------------------------
      const tmp = new THREE.Vector3();

      function frame(now: number) {
        raf = 0;
        if (disposed || !visible) return;
        const dt = Math.min(0.05, (now - previous) / 1000);
        previous = now;

        if (!entered && document.documentElement.dataset.intro !== "on") {
          entered = true;
          enteredAt = now;
        }
        const enterT = entered ? (now - enteredAt) / 1000 : 0;

        // Camera.
        const t = now / 1000;
        idle += ((t - lastInteraction > 2.5 ? 1 : 0) - idle) * (1 - Math.exp(-dt * 1.5));
        const wantedDist = goalDist * (entered ? 1 + 0.6 * Math.max(0, 1 - enterT / 1.6) : 1.6);
        const k = 1 - Math.exp(-dt * 3.2);
        curDist += (wantedDist - curDist) * k;
        curTarget.lerp(goalTarget, k);
        curPitch += (pitch - curPitch) * k;
        curYaw += (yaw + userYaw + Math.sin(t * 0.25) * 0.1 * idle - curYaw) * k;
        camera.position.set(
          curTarget.x + curDist * Math.cos(curPitch) * Math.sin(curYaw),
          curTarget.y + curDist * Math.sin(curPitch),
          curTarget.z + curDist * Math.cos(curPitch) * Math.cos(curYaw),
        );
        camera.lookAt(curTarget);
        // Fog is relative to how far the camera is, so a zoomed-out portrait view is not swallowed by it.
        fog.near = curDist * 0.9;
        fog.far = curDist * 3;

        // Buildings.
        const focus = selectedIdLocal;
        for (const b of buildings) {
          const m = clamp01((now - b.moveStart) / 900);
          const e = easeInOut(m);
          b.x = b.fromX + (b.toX - b.fromX) * e;
          b.z = b.fromZ + (b.toZ - b.fromZ) * e;
          const hop = m > 0 && m < 1 ? Math.sin(Math.PI * m) * 0.7 : 0;

          const grow = entered ? clamp01((enterT - b.index * 0.045) / 0.9) : 0;
          const rise = grow === 0 ? 0.001 : grow === 1 ? 1 : easeOutBack(grow);

          const targetHi =
            focus === b.project.id
              ? 1
              : hoverId === b.project.id
                ? 0.8
                : highlightIds?.has(b.project.id)
                  ? 0.55
                  : 0;
          const targetDim =
            highlightIds && !highlightIds.has(b.project.id) && focus !== b.project.id ? 1 : 0;
          b.hi += (targetHi - b.hi) * (1 - Math.exp(-dt * 10));
          b.dim += (targetDim - b.dim) * (1 - Math.exp(-dt * 8));

          b.mesh.position.set(b.x, hop + b.hi * 0.12, b.z);
          b.mesh.scale.y = Math.max(0.001, rise);
          b.edges.position.copy(b.mesh.position);
          b.edges.scale.y = b.mesh.scale.y;

          const alpha = clamp01(grow * 1.4) * (1 - 0.72 * b.dim);
          b.sideMat.opacity = alpha;
          b.topMat.opacity = alpha;
          b.sideMat.emissiveIntensity = 0.6 + b.hi * 0.9;
          b.topMat.emissiveIntensity = (b.project.tier === "featured" ? 0.28 : 0.05) + b.hi * 0.7;
          b.edgeMat.opacity = (0.35 + 0.55 * b.hi) * alpha;
        }

        // District labels follow their groups on the ground.
        scene.updateMatrixWorld();
        for (const group of groups) {
          const a = anchors[group.key];
          const el = labelEls.current.get(group.key);
          if (!a || !el) continue;
          tmp.set(a.x, 0.05, a.z + a.d / 2 + 1.05);
          tmp.project(camera);
          const px = ((tmp.x + 1) / 2) * width;
          const py = ((1 - tmp.y) / 2) * height;
          el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, 0)`;
          const dimmed = highlightIds && !group.ids.some((id) => highlightIds?.has(id));
          el.style.opacity = entered ? (dimmed ? "0.25" : "1") : "0";
        }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
      // The stage is closed (zero height) until this is set; opening it is what lets it become visible.
      setReady(true);

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
        geometries.forEach((g) => g.dispose());
        textures.forEach((tex) => tex.dispose());
        for (const b of buildings) {
          b.sideMat.dispose();
          b.topMat.dispose();
          b.edgeMat.dispose();
        }
        padMaterial.dispose();
        padLineMaterial.dispose();
        for (const m of gridMaterials) m.dispose();
        grid.geometry.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [projects]);

  const stageOpen = ready;

  return (
    <div>
      <div
        ref={hostRef}
        data-ready={stageOpen}
        className={`glass grid-iso relative mt-8 w-full overflow-hidden ${
          stageOpen ? "h-[80dvh] max-h-[880px] min-h-[540px]" : "pointer-events-none h-0"
        }`}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 size-full touch-pan-y"
        />

        <div
          ref={tooltipRef}
          className="tech-label pointer-events-none absolute left-0 top-0 z-10 rounded-sm border border-ink/30 bg-vellum/90 px-2 py-1 text-ink opacity-0"
        />

        <ul className="pointer-events-none absolute inset-0 m-0 list-none p-0" aria-hidden="true">
          {labels.map((label) => (
            <li
              key={label.key}
              ref={(el) => {
                if (el) labelEls.current.set(label.key, el);
                else labelEls.current.delete(label.key);
              }}
              className="absolute left-0 top-0 whitespace-nowrap opacity-0 transition-opacity duration-500"
            >
              <span className="glass-chip type-label inline-flex items-center gap-2 px-2.5 py-1 text-ink">
                {label.label}
                <span className="text-ink-soft">{label.count}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="tech-label pointer-events-none absolute left-3 top-3 z-10 m-0 max-w-[55%] max-sm:hidden sm:left-4 sm:top-4">
          Slim tower = mobile · wide slab = web · taller = featured
        </p>
        {selected ? (
          <aside
            aria-label={`${selected.name} details`}
            className="glass absolute inset-x-3 bottom-3 z-20 max-h-[52%] overflow-y-auto p-4 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-16 sm:max-h-[calc(100%-6rem)] sm:w-[22rem]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="tech-label m-0">
                  {selected.company} · {selected.platform === "mobile" ? "Mobile" : "Web"}
                  {selected.tier === "featured" ? " · Featured" : ""}
                </p>
                <h3 className="type-h3 m-0 mt-1">{selected.name}</h3>
              </div>
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelectedId(null)}
                className="glass-chip type-label size-9 shrink-0 cursor-pointer text-ink"
              >
                ×
              </button>
            </div>
            <p className="type-body m-0 mt-3">{selected.summary}</p>
            <dl className="m-0 mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
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
                  ["Framework", selected.framework],
                  ["Technologies", selected.technologies?.join(" · ")],
                ] as const
              ).map(([label, value]) =>
                value ? (
                  <div key={label} className="contents">
                    <dt className="tech-label">{label}</dt>
                    <dd className="type-body m-0">{value}</dd>
                  </div>
                ) : null,
              )}
            </dl>
            {selected.personalWork?.length ? (
              <div className="mt-3">
                <p className="tech-label m-0">Personal work</p>
                <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
                  {selected.personalWork.map((item) => (
                    <li
                      key={item}
                      className="type-small flex gap-2 before:mt-[0.45em] before:size-1.5 before:shrink-0 before:bg-ink"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {selected.notableWork?.length ? (
              <div className="mt-3">
                <p className="tech-label m-0">Notable engineering</p>
                <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
                  {selected.notableWork.map((item) => (
                    <li
                      key={item}
                      className="type-small flex gap-2 before:mt-[0.45em] before:size-1.5 before:shrink-0 before:bg-ink"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {selected.hasDetail ? (
              <a
                href="#dijkastra"
                className="type-small mt-4 inline-flex min-h-11 items-center gap-2 text-accent underline underline-offset-4"
              >
                Open the full engineering breakdown ↓
              </a>
            ) : null}
          </aside>
        ) : null}

        <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col items-stretch gap-2 sm:inset-x-4 sm:bottom-4">
          {step && !selected ? (
            <div className="glass flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
              <p className="type-body m-0 flex-1" aria-live="polite">
                {step.text}
              </p>
              <div className="flex items-center gap-2">
                <span className="tech-label">
                  {(tourIndex ?? 0) + 1} / {tour.length}
                </span>
                <button
                  type="button"
                  disabled={(tourIndex ?? 0) === 0}
                  onClick={() => goStep((tourIndex ?? 0) - 1)}
                  className="glass-chip type-label min-h-9 cursor-pointer px-3 text-ink disabled:opacity-40"
                >
                  Back
                </button>
                {(tourIndex ?? 0) < tour.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => goStep((tourIndex ?? 0) + 1)}
                    className="type-label min-h-9 cursor-pointer rounded-pill bg-accent px-4 font-bold text-paper"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={exitTour}
                    className="type-label min-h-9 cursor-pointer rounded-pill bg-accent px-4 font-bold text-paper"
                  >
                    Explore
                  </button>
                )}
                <button
                  type="button"
                  onClick={exitTour}
                  className="glass-chip type-label min-h-9 cursor-pointer px-3 text-ink"
                >
                  Exit
                </button>
              </div>
            </div>
          ) : null}

          {!step && !selected ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="tech-label mr-1">Arrange by</span>
              {ATLAS_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={`type-label min-h-9 cursor-pointer rounded-pill px-3 ${
                    mode === m.id ? "bg-accent font-bold text-paper" : "glass-chip text-ink"
                  }`}
                >
                  {m.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goStep(0)}
                className="type-label ml-auto min-h-9 cursor-pointer rounded-pill bg-accent px-4 font-bold text-paper"
              >
                Walk me through
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div hidden={stageOpen}>{children}</div>
    </div>
  );
}
