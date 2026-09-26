"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Detent } from "../site/bottom-sheet";
import { DijkastraPhone, defaultDetent } from "./dijkastra-phone";
import type {
  BufferGeometry,
  Color,
  Vector3,
  CanvasTexture,
  Group as ThreeGroup,
  Material,
  Mesh,
  MeshStandardMaterial,
} from "three";

/**
 * "Dijkastra Live": the current project as one object to walk around instead of a page to read. A 3D phone
 * (its screen is drawn here, a generic field-management UI, never a real screenshot) and four chapters the
 * visitor switches between:
 *   - Sync: an Offline/Online switch and an "Add field record" button. Records land in the on-device database
 *     while offline and fly to the backend the moment the switch goes Online (the confirmed sync flow).
 *   - Architecture: the phone comes apart into the five Atomic Design levels.
 *   - My role: the responsibilities orbit the phone; pick one.
 *   - Stack: the technology groups as tiles; pick one.
 * Everything shown comes from the content data passed in. `children` is the full 2D breakdown, server
 * rendered: it is the fallback (reduced motion, no WebGL, while three.js loads) and, once the 3D stage is up,
 * sits under "Full engineering breakdown" so no detail is lost.
 */

export interface LiveData {
  name: string;
  tagline: string;
  syncNodes: { label: string; detail: string }[];
  syncNote: string;
  architecture: { name: string; summary: string; levels: string[] };
  responsibilities: { title: string; detail: string }[];
  stack: { label: string; technologies: string[] }[];
  /** The header facts and product notes, shown in the phone sheet's "About" section. */
  about: {
    description: string;
    facts: [label: string, value: string][];
    characteristics: string[];
    outcome: string;
  };
}

type Chapter = "sync" | "architecture" | "role" | "stack";
const CHAPTERS: readonly { id: Chapter; label: string }[] = [
  { id: "sync", label: "Sync" },
  { id: "architecture", label: "Architecture" },
  { id: "role", label: "My role" },
  { id: "stack", label: "Stack" },
];

type Api = {
  setChapter: (chapter: Chapter) => void;
  setOnline: (online: boolean) => void;
  addRecord: () => void;
  setPick: (index: number | null) => void;
  setLevel: (index: number | null) => void;
  /** Pixels at the bottom of the scene covered by the phone bottom sheet. */
  setInset: (px: number) => void;
};

const FOV = 32;
const PHONE_QUERY = "(max-width: 767px)";
const MAX_QUEUE = 24;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let cursor = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursor);
      line = word;
      cursor += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursor);
}

function drawScreen(
  name: string,
  tagline: string,
  online: boolean,
  ink: string,
  paper: string,
  vellum: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = vellum;
  ctx.fillRect(0, 0, 512, 1024);
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = 3;
  ctx.font = "700 44px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText(name, 36, 60);
  ctx.globalAlpha = 0.6;
  ctx.font = "500 22px ui-sans-serif, system-ui, sans-serif";
  wrapText(ctx, tagline, 36, 118, 320, 28);
  ctx.globalAlpha = 1;
  // sync pill
  ctx.fillStyle = online ? ink : paper;
  ctx.beginPath();
  ctx.roundRect(360, 62, 120, 40, 20);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = online ? vellum : ink;
  ctx.font = "700 18px ui-monospace, monospace";
  ctx.fillText(online ? "ONLINE" : "OFFLINE", 378, 73);
  // map card with field polygons
  ctx.strokeStyle = ink;
  ctx.fillStyle = paper;
  ctx.beginPath();
  ctx.roundRect(36, 200, 440, 300, 22);
  ctx.fill();
  ctx.stroke();
  const fields: [number, number][][] = [
    [
      [70, 250],
      [210, 235],
      [230, 340],
      [95, 360],
    ],
    [
      [250, 250],
      [430, 270],
      [410, 380],
      [265, 360],
    ],
    [
      [120, 390],
      [300, 400],
      [330, 470],
      [110, 460],
    ],
  ];
  fields.forEach((poly, i) => {
    ctx.beginPath();
    poly.forEach(([px, py], j) => (j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
    ctx.closePath();
    ctx.globalAlpha = 0.12 + i * 0.1;
    ctx.fillStyle = ink;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
  });
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(300, 330, 9, 0, Math.PI * 2);
  ctx.fill();
  // list rows
  for (let i = 0; i < 3; i += 1) {
    const y = 540 + i * 118;
    ctx.fillStyle = paper;
    ctx.beginPath();
    ctx.roundRect(36, y, 440, 98, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(60, y + 26, 170 - i * 20, 14);
    ctx.globalAlpha = 0.4;
    ctx.fillRect(60, y + 56, 250 - i * 30, 12);
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(440, y + 49, 14, 0, Math.PI * 2);
    ctx.stroke();
  }
  // tab bar
  ctx.fillStyle = ink;
  for (let i = 0; i < 4; i += 1) {
    ctx.globalAlpha = i === 0 ? 1 : 0.35;
    ctx.beginPath();
    ctx.arc(96 + i * 106, 960, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return canvas;
}

function drawCard(
  index: number,
  title: string,
  sub: string,
  ink: string,
  vellum: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = vellum;
  ctx.fillRect(0, 0, 512, 320);
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = 5;
  ctx.strokeRect(10, 10, 492, 300);
  ctx.textBaseline = "top";
  ctx.globalAlpha = 0.6;
  ctx.font = "700 34px ui-monospace, monospace";
  ctx.fillText(String(index + 1).padStart(2, "0"), 34, 32);
  ctx.globalAlpha = 1;
  ctx.font = "800 58px ui-sans-serif, system-ui, sans-serif";
  wrapText(ctx, title, 34, 86, 444, 64);
  ctx.globalAlpha = 0.6;
  ctx.font = "600 26px ui-monospace, monospace";
  ctx.fillText(sub, 34, 262);
  ctx.globalAlpha = 1;
  return canvas;
}

export function DijkastraLive({ data, children }: { data: LiveData; children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [labelEls] = useState(() => new Map<string, HTMLElement>());
  const apiRef = useRef<Api | null>(null);

  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState<Chapter>("sync");
  const [online, setOnline] = useState(false);
  const [counts, setCounts] = useState({ device: 0, synced: 0 });
  const [pick, setPick] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [detent, setDetent] = useState<Detent>(defaultDetent("sync"));
  const insetRef = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const cards = chapter === "role" ? data.responsibilities : chapter === "stack" ? data.stack : [];

  useEffect(() => {
    apiRef.current?.setChapter(chapter);
  }, [chapter, ready]);

  const chooseChapter = (next: Chapter) => {
    setChapter(next);
    setPick(null);
    setLevel(null);
    setDetent(defaultDetent(next));
  };
  const onSheetVisible = useCallback((px: number) => {
    insetRef.current = px;
    apiRef.current?.setInset(px);
  }, []);
  useEffect(() => {
    apiRef.current?.setInset(insetRef.current);
  }, [ready]);

  // Phones: swipe the scene left/right for the next/previous chapter (the stories pattern).
  const onSwipeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    swipe.current = { x: event.clientX, y: event.clientY };
  };
  const onSwipeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || !window.matchMedia(PHONE_QUERY).matches) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const host = hostRef.current;
    if (host) {
      host.dataset.swiped = "true";
      window.setTimeout(() => delete host.dataset.swiped, 350);
    }
    const index = CHAPTERS.findIndex((c) => c.id === chapter);
    const target = CHAPTERS[index + (dx < 0 ? 1 : -1)];
    if (target) chooseChapter(target.id);
  };
  useEffect(() => {
    apiRef.current?.setOnline(online);
  }, [online, ready]);
  useEffect(() => {
    apiRef.current?.setPick(pick);
  }, [pick, ready]);
  useEffect(() => {
    apiRef.current?.setLevel(level);
  }, [level, ready]);

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
        return;
      }
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.5 : 2),
      );

      const css = getComputedStyle(document.documentElement);
      const token = (name: string) => css.getPropertyValue(name).trim();
      const inkHex = token("--color-ink");
      const paperHex = token("--color-paper");
      const vellumHex = token("--color-vellum");
      const inkColor = new THREE.Color(inkHex);
      const bodyColor = new THREE.Color(token("--color-signal"));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 1.2));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(4, 7, 8);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.8);
      rim.position.set(-6, 3, -4);
      scene.add(rim);

      const geometries: BufferGeometry[] = [];
      const materials: Material[] = [];
      const textures: CanvasTexture[] = [];
      const track = <T extends Material>(m: T): T => {
        materials.push(m);
        return m;
      };
      const solid = (color: Color, emissive = 0) =>
        track(
          new THREE.MeshStandardMaterial({
            color,
            roughness: 0.42,
            metalness: 0.25,
            emissive: inkColor,
            emissiveIntensity: emissive,
            transparent: true,
          }),
        );

      // ---- phone ----------------------------------------------------------------------------
      const phone = new THREE.Group();
      const bodyGeo = new RoundedBoxGeometry(1.3, 2.7, 0.14, 4, 0.14);
      geometries.push(bodyGeo);
      const bodyMat = solid(bodyColor.clone().multiplyScalar(0.5));
      phone.add(new THREE.Mesh(bodyGeo, bodyMat));
      const screenGeo = new THREE.PlaneGeometry(1.14, 2.54);
      geometries.push(screenGeo);
      const screenMat = track(
        new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false }),
      );
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.075;
      phone.add(screen);
      let screenTexture: CanvasTexture | null = null;
      const paintScreen = (isOnline: boolean) => {
        screenTexture?.dispose();
        const texture = new THREE.CanvasTexture(
          drawScreen(data.name, data.tagline, isOnline, inkHex, paperHex, vellumHex),
        );
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        screenTexture = texture;
        screenMat.map = texture;
        screenMat.needsUpdate = true;
      };
      paintScreen(false);
      scene.add(phone);

      // ---- sync: database + backend + packets ------------------------------------------------
      const dbGroup = new THREE.Group();
      const dbGeo = new THREE.CylinderGeometry(0.62, 0.62, 1, 40);
      geometries.push(dbGeo);
      const dbMat = solid(bodyColor.clone().multiplyScalar(0.7), 0.05);
      dbMat.depthWrite = false;
      const dbShell = new THREE.Mesh(dbGeo, dbMat);
      dbShell.scale.y = 1.25;
      dbGroup.add(dbShell);
      const dbFillMat = solid(inkColor.clone(), 0.9);
      const dbFill = new THREE.Mesh(dbGeo, dbFillMat);
      dbFill.scale.set(0.8, 0.05, 0.8);
      dbGroup.add(dbFill);
      scene.add(dbGroup);

      const beGroup = new THREE.Group();
      const beGeo = new RoundedBoxGeometry(1.5, 0.5, 1.1, 3, 0.06);
      geometries.push(beGeo);
      const beMats = [0, 1, 2].map((i) =>
        solid(bodyColor.clone().multiplyScalar(0.7 - i * 0.06), 0.05),
      );
      beMats.forEach((m, i) => {
        const box = new THREE.Mesh(beGeo, m);
        box.position.y = (i - 1) * 0.62;
        beGroup.add(box);
      });
      scene.add(beGroup);

      const wireGeo = new THREE.BoxGeometry(1, 0.05, 0.05);
      geometries.push(wireGeo);
      const wireA = new THREE.Mesh(wireGeo, solid(inkColor.clone(), 0.6));
      const wireB = new THREE.Mesh(wireGeo, solid(inkColor.clone(), 0.6));
      scene.add(wireA, wireB);

      const packetGeo = new THREE.SphereGeometry(0.11, 16, 12);
      geometries.push(packetGeo);
      const packetMat = solid(inkColor.clone(), 1.4);
      type Packet = { mesh: Mesh; state: "idle" | "toDb" | "toBackend"; t: number };
      const packets: Packet[] = Array.from({ length: MAX_QUEUE + 6 }, () => {
        const mesh = new THREE.Mesh(packetGeo, packetMat);
        mesh.visible = false;
        scene.add(mesh);
        return { mesh, state: "idle" as const, t: 0 };
      });

      // ---- architecture slabs ----------------------------------------------------------------
      const archGroup = new THREE.Group();
      const slabGeo = new RoundedBoxGeometry(1.5, 0.09, 2.8, 3, 0.04);
      geometries.push(slabGeo);
      const slabEdge = new THREE.EdgesGeometry(slabGeo, 35);
      geometries.push(slabEdge);
      const edgeMat = track(
        new THREE.LineBasicMaterial({ color: inkColor, transparent: true, opacity: 0.6 }),
      );
      const levelCount = data.architecture.levels.length;
      const slabs = data.architecture.levels.map((_, i) => {
        const mat = solid(
          bodyColor.clone().multiplyScalar(0.9 + (i / Math.max(1, levelCount)) * 0.8),
          0.1,
        );
        const mesh = new THREE.Mesh(slabGeo, mat);
        mesh.add(new THREE.LineSegments(slabEdge, edgeMat));
        archGroup.add(mesh);
        return { mesh, mat, hi: 0 };
      });
      scene.add(archGroup);

      // ---- cards (role ring / stack grid) ----------------------------------------------------
      const CARD_COUNT = Math.max(data.responsibilities.length, data.stack.length);
      const cardGeo = new RoundedBoxGeometry(1.7, 1.06, 0.07, 3, 0.03);
      geometries.push(cardGeo);
      const roleTex = data.responsibilities.map((r, i) =>
        drawCard(i, r.title, "Responsibility", inkHex, vellumHex),
      );
      const stackTex = data.stack.map((g, i) =>
        drawCard(i, g.label, `${g.technologies.length} technologies`, inkHex, vellumHex),
      );
      const toTexture = (c: HTMLCanvasElement) => {
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        textures.push(t);
        return t;
      };
      const roleMaps = roleTex.map(toTexture);
      const stackMaps = stackTex.map(toTexture);
      const cardsGroup = new THREE.Group();
      const cardObjs = Array.from({ length: CARD_COUNT }, (_, i) => {
        const mats = [0, 1, 2, 3, 4, 5].map(() =>
          track(
            new THREE.MeshStandardMaterial({
              color: 0xffffff,
              roughness: 0.5,
              metalness: 0.1,
              emissive: 0xffffff,
              transparent: true,
            }),
          ),
        );
        const mesh = new THREE.Mesh(cardGeo, mats);
        mesh.userData.cardIndex = i;
        cardsGroup.add(mesh);
        return { mesh, mats, hi: 0 };
      });
      scene.add(cardsGroup);
      const setCardMaps = (maps: CanvasTexture[]) => {
        cardObjs.forEach((card, i) => {
          const map = maps[i];
          card.mesh.visible = Boolean(map);
          card.mats.forEach((m) => {
            m.map = map ?? null;
            m.emissiveMap = map ?? null;
            m.needsUpdate = true;
          });
        });
      };

      // ---- state ---------------------------------------------------------------------------
      let chapterNow: Chapter = "sync";
      let isOnline = false;
      let picked: number | null = null;
      let levelPin: number | null = null;
      let hoverCard: number | null = null;
      let deviceCount = 0;
      let syncedCount = 0;
      let syncClock = 0;
      let arrivalPulse = 0;
      let width = 1;
      let height = 1;
      let narrow = false;
      // Phone-only view tuning (the desktop path keeps `isPhoneView` false and the shift at 0, so it is unchanged).
      let isPhoneView = false;
      let inset = 0;
      let curShift = 0;
      let visible = false;
      let entered = false;
      let enteredAt = 0;
      let raf = 0;
      let previous = performance.now();
      let ringRot = 0;
      let yaw = 0;
      let pitchOffset = 0;
      let px = 0;
      let py = 0;
      let curDist = 20;
      let goalDist = 12;
      let lastChapterAt = 0;

      type Slot = { group: ThreeGroup; presence: number; pos: Vector3; scale: number };
      const slot = (group: ThreeGroup): Slot => ({
        group,
        presence: 0,
        pos: new THREE.Vector3(),
        scale: 1,
      });
      const phoneSlot = slot(phone);
      const dbSlot = slot(dbGroup);
      const beSlot = slot(beGroup);
      const archSlot = slot(archGroup);
      const cardSlot = slot(cardsGroup);
      const slots = [phoneSlot, dbSlot, beSlot, archSlot, cardSlot];
      const target = { present: new Set<Slot>(), halfW: 6, halfH: 3 };
      const phonePos = new THREE.Vector3();
      const dbPos = new THREE.Vector3();
      const bePos = new THREE.Vector3();
      const tmp = new THREE.Vector3();

      const layout = () => {
        target.present.clear();
        const ch = chapterNow;
        if (ch === "sync") {
          if (narrow) {
            phoneSlot.pos.set(0, 3.0, 0);
            phoneSlot.scale = 0.55;
            dbSlot.pos.set(0, 0.15, 0);
            dbSlot.scale = 0.8;
            beSlot.pos.set(0, -2.9, 0);
            beSlot.scale = 0.8;
            target.halfW = 2.6;
            target.halfH = 4.5;
          } else {
            phoneSlot.pos.set(-3.7, 0, 0);
            phoneSlot.scale = 0.78;
            dbSlot.pos.set(0, 0, 0);
            dbSlot.scale = 1;
            beSlot.pos.set(3.7, 0, 0);
            beSlot.scale = 1;
            target.halfW = 5.0;
            target.halfH = 2.2;
          }
          target.present.add(phoneSlot).add(dbSlot).add(beSlot);
        } else if (ch === "architecture") {
          archSlot.pos.set(0, 0, 0);
          archSlot.scale = narrow ? 0.85 : 1;
          target.halfW = narrow ? 2.4 : 3.2;
          target.halfH = isPhoneView ? 2.5 : 3.2;
          target.present.add(archSlot);
        } else if (ch === "role") {
          phoneSlot.pos.set(0, 0, 0);
          phoneSlot.scale = 1;
          cardSlot.pos.set(0, 0, 0);
          cardSlot.scale = 1;
          // On a phone the orbit's cards shrink to unreadable, so they become a grid of large cards instead.
          target.halfW = narrow ? 1.95 : 4.6;
          target.halfH = narrow ? 2.35 : 2.5;
          if (!narrow) target.present.add(phoneSlot);
          target.present.add(cardSlot);
        } else {
          if (narrow) {
            cardSlot.pos.set(0, 0, 0);
            target.halfW = 1.95;
            target.halfH = 2.35;
          } else {
            phoneSlot.pos.set(-4.4, 0, 0);
            phoneSlot.scale = 0.72;
            cardSlot.pos.set(1.3, 0, 0);
            target.halfW = 5.6;
            target.halfH = 2.3;
            target.present.add(phoneSlot);
          }
          cardSlot.scale = 1;
          target.present.add(cardSlot);
        }
        phonePos.copy(phoneSlot.pos);
        dbPos.copy(dbSlot.pos);
        bePos.copy(beSlot.pos);
        fit();
      };

      const fit = () => {
        const tan = Math.tan((FOV * Math.PI) / 360);
        const aspect = width / height;
        if (isPhoneView) {
          // Fit the subject into the part of the scene the bottom sheet leaves visible.
          const visibleFraction = Math.max(0.4, 1 - inset / height);
          goalDist =
            Math.max(target.halfW / (tan * aspect), target.halfH / (tan * visibleFraction)) * 1.06 +
            0.8;
          return;
        }
        goalDist = Math.max(target.halfW / (tan * aspect), target.halfH / tan) * 1.12 + 1;
      };

      const emitCounts = () => setCounts({ device: deviceCount, synced: syncedCount });

      apiRef.current = {
        setChapter: (next) => {
          chapterNow = next;
          lastChapterAt = performance.now();
          if (next === "role") setCardMaps(roleMaps);
          if (next === "stack") setCardMaps(stackMaps);
          layout();
        },
        setOnline: (next) => {
          isOnline = next;
          paintScreen(next);
        },
        addRecord: () => {
          if (deviceCount >= MAX_QUEUE) return;
          const free = packets.find((p) => p.state === "idle");
          if (!free) return;
          free.state = "toDb";
          free.t = 0;
          free.mesh.visible = true;
        },
        setPick: (index) => {
          picked = index;
        },
        setLevel: (index) => {
          levelPin = index;
        },
        setInset: (px) => {
          inset = px;
          fit();
        },
      };

      const resize = () => {
        width = Math.max(1, host.clientWidth);
        height = Math.max(1, host.clientHeight);
        narrow = width < 720;
        isPhoneView = window.matchMedia(PHONE_QUERY).matches;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        layout();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

      const intersection = new IntersectionObserver(
        ([entry]) => {
          visible = (entry?.isIntersecting ?? false) && host.clientHeight > 40;
          if (visible && !raf) {
            previous = performance.now();
            raf = requestAnimationFrame(frame);
          }
        },
        { threshold: 0.2 },
      );
      intersection.observe(host.parentElement ?? host);

      // ---- pointer ---------------------------------------------------------------------------
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const pickCard = (event: PointerEvent): number | null => {
        if (!cardSlot.group.visible || cardSlot.presence < 0.6) return null;
        const rect = canvas.getBoundingClientRect();
        ndc.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(
          cardObjs.filter((c) => c.mesh.visible).map((c) => c.mesh),
          false,
        )[0];
        return (hit?.object.userData.cardIndex as number | undefined) ?? null;
      };
      const onMove = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        if (event.pointerType === "mouse") {
          hoverCard = pickCard(event);
          canvas.style.cursor = hoverCard !== null ? "pointer" : "default";
        }
      };
      const onClick = (event: PointerEvent) => {
        if (host.dataset.swiped) return; // that pointer-up ended a chapter swipe, not a tap
        const index = pickCard(event);
        if (index !== null) setPick(index);
      };
      const onLeave = () => {
        hoverCard = null;
        px = 0;
        py = 0;
      };
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onClick);
      canvas.addEventListener("pointerleave", onLeave);

      // ---- frame -----------------------------------------------------------------------------
      const between = (a: Vector3, b: Vector3, t: number, lift = 0) => {
        tmp.lerpVectors(a, b, t);
        tmp.y += Math.sin(Math.PI * t) * lift;
        return tmp;
      };
      const placeWire = (
        mesh: Mesh,
        a: Vector3,
        b: Vector3,
        gapA: number,
        gapB: number,
        alpha: number,
      ) => {
        const dir = new THREE.Vector3().subVectors(b, a);
        const len = dir.length();
        dir.normalize();
        const start = a.clone().addScaledVector(dir, gapA);
        const finish = b.clone().addScaledVector(dir, -gapB);
        const span = start.distanceTo(finish);
        mesh.position.copy(start).add(finish).multiplyScalar(0.5);
        mesh.scale.set(Math.max(0.001, span), 1, 1);
        mesh.rotation.z = Math.atan2(dir.y, dir.x);
        (mesh.material as MeshStandardMaterial).opacity = alpha;
        mesh.visible = alpha > 0.02 && len > 0.1;
      };

      function frame(now: number) {
        raf = 0;
        if (disposed || !visible) return;
        const dt = Math.min(0.05, (now - previous) / 1000);
        previous = now;
        if (!entered && document.documentElement.dataset.intro !== "on") {
          entered = true;
          enteredAt = now;
        }
        const t = now / 1000;
        const enter = entered ? easeInOut(clamp01((now - enteredAt) / 1200)) : 0;

        // camera
        const k = 1 - Math.exp(-dt * 3.4);
        curDist += (goalDist * (1 + 0.5 * (1 - enter)) - curDist) * k;
        yaw += (px * 0.35 - yaw) * k;
        pitchOffset += (-py * 0.12 - pitchOffset) * k;
        // Phones: look a little below the subject so it sits in the space above the bottom sheet.
        const shiftGoal = isPhoneView
          ? Math.tan((FOV * Math.PI) / 360) * curDist * (inset / height)
          : 0;
        curShift += (shiftGoal - curShift) * k;
        camera.position.set(
          Math.sin(yaw) * curDist,
          0.5 + pitchOffset * curDist * 0.4 - curShift,
          Math.cos(yaw) * curDist,
        );
        camera.lookAt(0, -curShift, 0);

        // presence / placement of each group
        for (const s of slots) {
          const want = target.present.has(s) ? 1 : 0;
          s.presence += (want - s.presence) * (1 - Math.exp(-dt * 6));
          s.group.visible = s.presence > 0.02;
          s.group.position.lerp(s.pos, 1 - Math.exp(-dt * 6));
          const sc = Math.max(0.001, s.presence * s.scale * enter);
          s.group.scale.setScalar(sc);
        }

        // phone idle
        phone.rotation.y = Math.sin(t * 0.6) * 0.18 + px * 0.25;
        phone.rotation.x = -py * 0.08;
        phone.position.y += Math.sin(t * 1.1) * 0.0025;

        // ---- sync simulation
        if (isOnline && deviceCount > 0) {
          syncClock += dt;
          if (syncClock > 0.32) {
            syncClock = 0;
            const free = packets.find((p) => p.state === "idle");
            if (free) {
              deviceCount -= 1;
              free.state = "toBackend";
              free.t = 0;
              free.mesh.visible = true;
              emitCounts();
            }
          }
        }
        const packetSpeed = 1.15;
        for (const p of packets) {
          if (p.state === "idle") continue;
          p.t += dt * packetSpeed;
          if (p.state === "toDb") {
            if (p.t >= 1) {
              p.state = "idle";
              p.mesh.visible = false;
              deviceCount += 1;
              emitCounts();
            } else {
              p.mesh.position.copy(between(phonePos, dbPos, easeInOut(p.t), 0.35));
            }
          } else if (p.state === "toBackend") {
            if (p.t >= 1) {
              p.state = "idle";
              p.mesh.visible = false;
              syncedCount += 1;
              arrivalPulse = 1;
              emitCounts();
            } else {
              p.mesh.position.copy(between(dbPos, bePos, easeInOut(p.t), 0.45));
            }
          }
          p.mesh.scale.setScalar(Math.max(0.001, dbSlot.presence));
        }
        arrivalPulse = Math.max(0, arrivalPulse - dt * 2.2);
        const fillTarget = 0.05 + (deviceCount / MAX_QUEUE) * 1.15;
        dbFill.scale.y += (fillTarget - dbFill.scale.y) * (1 - Math.exp(-dt * 8));
        dbFill.position.y = -0.625 + (dbFill.scale.y / 2) * 1 * 1.0;
        dbFillMat.opacity = 0.9;
        dbMat.opacity = 0.42 * clamp01(dbSlot.presence);
        beMats.forEach((m, i) => (m.emissiveIntensity = 0.05 + arrivalPulse * (0.8 - i * 0.2)));
        const wireShow = clamp01((dbSlot.presence - 0.4) / 0.6);
        const wireOn = (isOnline ? 0.95 : 0.12) * wireShow;
        placeWire(wireA, phonePos, dbPos, narrow ? 1.0 : 1.7, 0.9, 0.9 * wireShow);
        placeWire(wireB, dbPos, bePos, 0.9, narrow ? 0.7 : 1.1, wireOn);

        // ---- architecture
        archGroup.rotation.x = 0.25;
        archGroup.rotation.y = t * 0.25;
        const gap = narrow ? 0.62 : 0.72;
        slabs.forEach((slabObj, i) => {
          const hiTarget = levelPin === i ? 1 : 0;
          slabObj.hi += (hiTarget - slabObj.hi) * (1 - Math.exp(-dt * 10));
          slabObj.mesh.position.y =
            (i - (levelCount - 1) / 2) * gap + Math.sin(t * 1.2 + i) * 0.03 + slabObj.hi * 0.15;
          slabObj.mat.emissiveIntensity = 0.1 + slabObj.hi * 0.7;
          slabObj.mat.opacity = levelPin !== null && levelPin !== i ? 0.45 : 1;
        });

        // ---- cards
        const cardCount =
          chapterNow === "role"
            ? data.responsibilities.length
            : chapterNow === "stack"
              ? data.stack.length
              : 0;
        if (cardCount > 0) {
          if (chapterNow === "role" && !narrow) {
            const R = 3.5;
            const sel = picked;
            const wantedRot =
              sel !== null
                ? -(sel * ((Math.PI * 2) / cardCount)) - (Math.PI / 2) * 0
                : ringRot + dt * 0.25;
            if (sel !== null) {
              let d = wantedRot - ringRot;
              d = Math.atan2(Math.sin(d), Math.cos(d));
              ringRot += d * (1 - Math.exp(-dt * 4));
            } else {
              ringRot = wantedRot;
            }
            cardObjs.forEach((card, i) => {
              if (!card.mesh.visible) return;
              const a = ringRot + i * ((Math.PI * 2) / cardCount);
              const front = (Math.cos(a) + 1) / 2;
              card.mesh.position.set(
                Math.sin(a) * R,
                Math.sin(t + i) * 0.05,
                Math.cos(a) * R * 0.5 - 0.6,
              );
              card.mesh.rotation.set(0, Math.sin(a) * -0.35, 0);
              const hiTarget = picked === i ? 1 : hoverCard === i ? 0.7 : 0;
              card.hi += (hiTarget - card.hi) * (1 - Math.exp(-dt * 10));
              const s = (narrow ? 0.62 : 0.85) * (0.75 + front * 0.35) * (1 + card.hi * 0.25);
              card.mesh.scale.setScalar(s);
              card.mats.forEach((m) => {
                m.emissiveIntensity = 0.12 + card.hi * 0.5;
                m.opacity = (0.45 + front * 0.55) * (picked !== null && picked !== i ? 0.55 : 1);
              });
            });
          } else {
            const cols = narrow ? 2 : 3;
            const rows = Math.ceil(cardCount / cols);
            const dx = narrow ? 1.9 : 2.05;
            const dy = narrow ? 1.3 : 1.35;
            cardObjs.forEach((card, i) => {
              if (!card.mesh.visible) return;
              const c = i % cols;
              const r = Math.floor(i / cols);
              const wobble = Math.sin(t * 1.1 + i) * 0.04;
              card.mesh.position.set(
                (c - (cols - 1) / 2) * dx,
                ((rows - 1) / 2 - r) * dy + wobble,
                0,
              );
              card.mesh.rotation.set(0, Math.sin(t * 0.5 + i) * 0.08 + px * 0.2, 0);
              const hiTarget = picked === i ? 1 : hoverCard === i ? 0.7 : 0;
              card.hi += (hiTarget - card.hi) * (1 - Math.exp(-dt * 10));
              const s = (narrow ? 1.0 : 1) * (1 + card.hi * 0.12);
              card.mesh.scale.setScalar(s);
              card.mats.forEach((m) => {
                m.emissiveIntensity = 0.12 + card.hi * 0.5;
                m.opacity = picked !== null && picked !== i ? 0.55 : 1;
              });
            });
          }
        }

        // ---- HTML labels follow their 3D anchors
        scene.updateMatrixWorld();
        const project = (v: Vector3, id: string, dx = 0, dy = 0) => {
          const el = labelEls.get(id);
          if (!el) return;
          tmp.copy(v).project(camera);
          el.style.transform = `translate(${(((tmp.x + 1) / 2) * width + dx).toFixed(1)}px, ${(((1 - tmp.y) / 2) * height + dy).toFixed(1)}px) translate(-50%, -50%)`;
        };
        const show = (id: string, on: boolean) => {
          const el = labelEls.get(id);
          if (el) el.style.opacity = on && entered ? "1" : "0";
        };
        const inSync = chapterNow === "sync" && now - lastChapterAt > 350;
        ["phone", "db", "be", "wire"].forEach((id) => show(`sync-${id}`, inSync));
        if (inSync) {
          const off = 1.6;
          const side = narrow ? width * 0.27 : 0;
          project(tmp.set(phonePos.x, phonePos.y - (narrow ? 0 : off), 0), "sync-phone", side);
          project(tmp.set(dbPos.x, dbPos.y - (narrow ? 0 : off), 0), "sync-db", side);
          project(tmp.set(bePos.x, bePos.y - (narrow ? 0 : off), 0), "sync-be", side);
          project(
            tmp.set((dbPos.x + bePos.x) / 2, (dbPos.y + bePos.y) / 2 + (narrow ? 0 : 0.4), 0),
            "sync-wire",
            narrow ? -side : 0,
          );
        }
        const inArch = chapterNow === "architecture" && now - lastChapterAt > 350;
        data.architecture.levels.forEach((_, i) => {
          show(`level-${i}`, inArch);
          if (inArch) {
            const slabObj = slabs[i];
            if (!slabObj) return;
            slabObj.mesh.getWorldPosition(tmp);
            tmp.x += narrow ? 1.1 : 1.6;
            project(tmp, `level-${i}`, narrow ? 44 : 60);
          }
        });

        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        resizeObserver.disconnect();
        intersection.disconnect();
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onClick);
        canvas.removeEventListener("pointerleave", onLeave);
        apiRef.current = null;
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
        textures.forEach((tx) => tx.dispose());
        screenTexture?.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [data, labelEls]);

  const detail =
    pick !== null ? (chapter === "role" ? data.responsibilities[pick] : data.stack[pick]) : null;
  const setLabel = (id: string) => (el: HTMLElement | null) => {
    if (el) labelEls.set(id, el);
    else labelEls.delete(id);
  };

  return (
    <div>
      <div
        className={`dj-stage glass grid-iso relative mt-8 w-full overflow-hidden ${
          ready ? "flex flex-col sm:block sm:h-[78dvh] sm:max-h-[820px] sm:min-h-[560px]" : "hidden"
        }`}
      >
        <div
          ref={hostRef}
          onPointerDown={onSwipeStart}
          onPointerUp={onSwipeEnd}
          data-covered={detent === 2}
          className="dj-host relative h-[54dvh] min-h-[360px] sm:absolute sm:inset-0 sm:h-auto sm:min-h-0"
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 size-full touch-pan-y"
          />

          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {data.syncNodes.length >= 3 ? (
              <>
                <div
                  ref={setLabel("sync-phone")}
                  className="absolute left-0 top-0 text-center opacity-0 transition-opacity duration-500"
                >
                  <p className="type-label m-0 text-ink">{data.syncNodes[0]!.label}</p>
                  <p className="tech-label m-0 max-sm:hidden">{data.syncNodes[0]!.detail}</p>
                </div>
                <div
                  ref={setLabel("sync-db")}
                  className="absolute left-0 top-0 text-center opacity-0 transition-opacity duration-500"
                >
                  <p className="type-label m-0 text-ink">{data.syncNodes[1]!.label}</p>
                  <p className="tech-label m-0 max-sm:hidden">{data.syncNodes[1]!.detail}</p>
                </div>
                <div
                  ref={setLabel("sync-be")}
                  className="absolute left-0 top-0 text-center opacity-0 transition-opacity duration-500"
                >
                  <p className="type-label m-0 text-ink">{data.syncNodes[2]!.label}</p>
                  <p className="tech-label m-0 max-sm:hidden">{data.syncNodes[2]!.detail}</p>
                </div>
              </>
            ) : null}
            <div
              ref={setLabel("sync-wire")}
              className="absolute left-0 top-0 opacity-0 transition-opacity duration-500"
            >
              <span className="glass-chip type-label inline-block px-2 py-1 text-ink">
                {online ? "Connected" : "No connection"}
              </span>
            </div>
            {data.architecture.levels.map((name, i) => (
              <div
                key={name}
                ref={setLabel(`level-${i}`)}
                className="absolute left-0 top-0 opacity-0 transition-opacity duration-500"
              >
                <span className="type-label whitespace-nowrap text-ink">
                  {i + 1} · {name}
                </span>
              </div>
            ))}
          </div>

          <div
            className="absolute inset-x-3 top-3 z-10 flex flex-wrap items-center gap-2 max-md:hidden sm:inset-x-4 sm:top-4"
            role="tablist"
            aria-label="Chapters"
          >
            {CHAPTERS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={chapter === c.id}
                onClick={() => chooseChapter(c.id)}
                className={`type-label min-h-9 cursor-pointer rounded-pill px-3 ${
                  chapter === c.id ? "bg-accent font-bold text-paper" : "glass-chip text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-2 p-3 max-md:hidden sm:absolute sm:inset-x-4 sm:bottom-4 sm:p-0">
          {chapter === "sync" ? (
            <div className="glass flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
              <p className="type-body m-0 flex-1">{data.syncNote}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={online}
                  onClick={() => setOnline((v) => !v)}
                  className={`type-label min-h-9 cursor-pointer rounded-pill px-4 ${online ? "bg-accent font-bold text-paper" : "glass-chip text-ink"}`}
                >
                  {online ? "Online" : "Offline"}
                </button>
                <button
                  type="button"
                  onClick={() => apiRef.current?.addRecord()}
                  disabled={counts.device >= MAX_QUEUE}
                  className="glass-chip type-label min-h-9 cursor-pointer px-3 text-ink disabled:opacity-40"
                >
                  Add field record
                </button>
                <span className="tech-label" aria-live="polite">
                  On device {counts.device} · Synced {counts.synced}
                </span>
              </div>
            </div>
          ) : null}

          {chapter === "architecture" ? (
            <div className="glass flex flex-col gap-3 p-3 sm:p-4">
              <p className="type-body m-0">
                <span className="font-bold">{data.architecture.name}.</span>{" "}
                {data.architecture.summary}
              </p>
              <div className="flex flex-wrap gap-2">
                {data.architecture.levels.map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={level === i}
                    onClick={() => setLevel((v) => (v === i ? null : i))}
                    className={`type-label min-h-9 cursor-pointer rounded-pill px-3 ${level === i ? "bg-accent font-bold text-paper" : "glass-chip text-ink"}`}
                  >
                    {i + 1} {name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {cards.length > 0 ? (
            <div className="glass flex flex-col gap-3 p-3 sm:p-4">
              {detail ? (
                <div aria-live="polite">
                  <p className="type-body m-0 font-bold">
                    {"title" in detail ? detail.title : detail.label}
                  </p>
                  <p className="type-body m-0 mt-1">
                    {"detail" in detail ? detail.detail : detail.technologies.join(" · ")}
                  </p>
                </div>
              ) : (
                <p className="type-body m-0">
                  {chapter === "role"
                    ? "Pick a responsibility to bring it forward."
                    : "Pick a technology group to see what is in it."}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {cards.map((item, i) => {
                  const name = "title" in item ? item.title : item.label;
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={pick === i}
                      onClick={() => setPick((v) => (v === i ? null : i))}
                      className={`type-label min-h-9 cursor-pointer rounded-pill px-3 ${pick === i ? "bg-accent font-bold text-paper" : "glass-chip text-ink"}`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <DijkastraPhone
          data={data}
          chapter={chapter}
          onChapter={chooseChapter}
          online={online}
          onOnline={setOnline}
          counts={counts}
          maxQueue={MAX_QUEUE}
          onAddRecord={() => apiRef.current?.addRecord()}
          pick={pick}
          onPick={setPick}
          level={level}
          onLevel={setLevel}
          detent={detent}
          onDetent={setDetent}
          onVisible={onSheetVisible}
        />
      </div>

      {ready ? (
        <details className="mt-8 max-md:hidden">
          <summary className="glass-chip type-label inline-flex min-h-11 cursor-pointer items-center px-4 text-ink">
            Full engineering breakdown
          </summary>
          <div className="mt-6">{children}</div>
        </details>
      ) : (
        <div className="max-md:hidden">{children}</div>
      )}
    </div>
  );
}
