"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Detent } from "../site/bottom-sheet";
import { CapabilityPhone } from "./capability-phone";
import type {
  BufferGeometry,
  Color,
  Group as ThreeGroup,
  Material,
  Mesh,
  MeshStandardMaterial,
} from "three";

/**
 * The engineering capabilities as a vertical "ship-it pipeline": eight stations from building the app to
 * running its servers, each a small 3D prop on one glowing pipe. The camera rides down the pipe. The visitor
 * can press Play (the pipeline advances station by station by itself), pick any station, or step with
 * Back / Next. The station's capabilities appear as chips next to it and as small orbs circling the prop
 * (one orb per capability, so the count is visible too).
 *
 * "Hiring view" swaps the whole 3D stage for `children`, the plain matrix of every group and capability, for
 * a reader who just wants the list. It is also the fallback (reduced motion, no WebGL, while three.js loads).
 * The content data claims no proficiency level, so nothing here rates anything: a station is only "has it".
 */

export interface PipelineGroup {
  id: string;
  label: string;
  items: string[];
}

type Api = {
  setActive: (index: number) => void;
  /** Pixels at the bottom of the scene covered by the phone bottom sheet. */
  setInset: (px: number) => void;
};

const PHONE_QUERY = "(max-width: 767px)";

const SPACING = 3.6;
const FOV = 32;
const STEP_MS = 3600;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function CapabilityPipeline({
  groups,
  note,
  children,
}: {
  groups: PipelineGroup[];
  /** The honesty note shown with the full capability list on phones. */
  note: string;
  children: ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<Api | null>(null);

  const [ready, setReady] = useState(false);
  const [hiring, setHiring] = useState(false);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [detent, setDetent] = useState<Detent>(1);
  const insetRef = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const count = groups.length;
  const group = groups[active];

  useEffect(() => {
    apiRef.current?.setActive(active);
  }, [active, ready]);

  const onSheetVisible = useCallback((px: number) => {
    insetRef.current = px;
    apiRef.current?.setInset(px);
  }, []);
  useEffect(() => {
    apiRef.current?.setInset(insetRef.current);
  }, [ready]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        if (current >= count - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [playing, count]);

  const go = (index: number) => {
    setPlaying(false);
    setActive(Math.min(count - 1, Math.max(0, index)));
  };
  const play = () => {
    if (active >= count - 1) setActive(0);
    setPlaying((value) => !value);
  };

  // Phones: swipe the scene left/right to move to the previous/next station (the stories pattern).
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
    go(active + (dx < 0 ? 1 : -1));
  };

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
      const inkColor = new THREE.Color(token("--color-ink"));
      const greyColor = new THREE.Color(token("--color-signal"));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 1.25));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(4, 8, 8);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.8);
      rim.position.set(-6, 2, -5);
      scene.add(rim);

      const geometries: BufferGeometry[] = [];
      const materials: Material[] = [];
      const geo = <T extends BufferGeometry>(g: T): T => {
        geometries.push(g);
        return g;
      };
      const mat = (color: Color, emissive: number) => {
        const m = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.42,
          metalness: 0.25,
          emissive: inkColor,
          emissiveIntensity: emissive,
          transparent: true,
        });
        materials.push(m);
        return m;
      };

      // ---- the pipe ----------------------------------------------------------------------------
      const length = (count - 1) * SPACING + 4;
      const pipeGeo = geo(new THREE.CylinderGeometry(0.06, 0.06, 1, 16));
      const pipeMat = mat(greyColor.clone().multiplyScalar(0.6), 0.1);
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.scale.y = length;
      pipe.position.y = -((count - 1) * SPACING) / 2;
      scene.add(pipe);
      const glowMat = mat(inkColor.clone(), 1.1);
      const glow = new THREE.Mesh(pipeGeo, glowMat);
      glow.scale.set(0.9, 0.001, 0.9);
      scene.add(glow);
      const pulseGeo = geo(new THREE.SphereGeometry(0.16, 20, 16));
      const pulse = new THREE.Mesh(pulseGeo, glowMat);
      scene.add(pulse);

      // ---- stations ------------------------------------------------------------------------------
      type Station = {
        group: ThreeGroup;
        body: MeshStandardMaterial;
        accent: MeshStandardMaterial;
        orbs: Mesh[];
        prop: ThreeGroup;
        hi: number;
        animate: (t: number, hi: number) => void;
      };
      const orbGeo = geo(new THREE.SphereGeometry(0.055, 12, 10));
      const plateGeo = geo(new THREE.CylinderGeometry(1.55, 1.55, 0.07, 56));
      const ringGeo = geo(new THREE.TorusGeometry(1.55, 0.02, 8, 80));
      const boxGeo = (w: number, h: number, d: number, r = 0.05) =>
        geo(new RoundedBoxGeometry(w, h, d, 3, r));

      const build = (i: number): Station => {
        const g = groups[i]!;
        const body = mat(greyColor.clone().multiplyScalar(0.95), 0.06);
        const accent = mat(inkColor.clone(), 0.55);
        const root = new THREE.Group();
        root.position.y = -i * SPACING;
        const prop = new THREE.Group();
        root.add(prop);

        const plate = new THREE.Mesh(plateGeo, body);
        plate.position.y = -1.05;
        root.add(plate);
        const ring = new THREE.Mesh(ringGeo, accent);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -1.01;
        root.add(ring);

        const add = (mesh: Mesh, x = 0, y = 0, z = 0) => {
          mesh.position.set(x, y, z);
          prop.add(mesh);
          return mesh;
        };
        let animate: Station["animate"] = () => {};

        if (i === 0) {
          // application development: layers stacking into an app
          const slabs = [0, 1, 2].map((n) =>
            add(
              new THREE.Mesh(boxGeo(1.0, 0.1, 1.8), n === 2 ? accent : body),
              0,
              (n - 1) * 0.42,
              0,
            ),
          );
          animate = (t, hi) =>
            slabs.forEach(
              (s, n) =>
                (s.position.y = (n - 1) * (0.42 + 0.22 * hi) + Math.sin(t * 1.4 + n) * 0.03),
            );
        } else if (i === 1) {
          // integrations: plug-ins orbiting an app
          add(new THREE.Mesh(boxGeo(0.8, 1.5, 0.1, 0.08), body));
          const plugs = [0, 1, 2, 3].map(() =>
            add(new THREE.Mesh(boxGeo(0.3, 0.3, 0.3, 0.05), accent)),
          );
          animate = (t, hi) =>
            plugs.forEach((p, n) => {
              const a = t * 0.9 + (n * Math.PI) / 2;
              const r = 0.85 + 0.35 * hi;
              p.position.set(Math.cos(a) * r, Math.sin(t * 1.2 + n) * 0.25, Math.sin(a) * r);
              p.rotation.y = a;
            });
        } else if (i === 2) {
          // native platform: two halves (iOS / Android) meeting
          const left = add(new THREE.Mesh(boxGeo(0.75, 1.5, 0.1, 0.08), body), -0.5);
          const right = add(new THREE.Mesh(boxGeo(0.75, 1.5, 0.1, 0.08), accent), 0.5);
          animate = (t, hi) => {
            const gap = 0.5 + 0.35 * (1 - hi) + Math.sin(t * 1.6) * 0.08 * (1 - hi);
            left.position.x = -gap;
            right.position.x = gap;
          };
        } else if (i === 3) {
          // data / APIs: a database stack
          const discs = [0, 1, 2].map((n) =>
            add(
              new THREE.Mesh(
                geo(new THREE.CylinderGeometry(0.62, 0.62, 0.3, 36)),
                n === 1 ? accent : body,
              ),
              0,
              (n - 1) * 0.48,
            ),
          );
          animate = (t, hi) =>
            discs.forEach(
              (d, n) =>
                (d.position.y = (n - 1) * (0.48 + 0.12 * hi) + Math.sin(t * 1.3 + n) * 0.03),
            );
        } else if (i === 4) {
          // web: a browser window
          add(new THREE.Mesh(boxGeo(2.0, 1.3, 0.1, 0.06), body));
          add(new THREE.Mesh(boxGeo(2.0, 0.22, 0.13, 0.04), accent), 0, 0.54, 0.02);
          [-0.82, -0.68, -0.54].forEach((x) => add(new THREE.Mesh(orbGeo, body), x, 0.54, 0.1));
          animate = (t) => (prop.rotation.y = Math.sin(t * 0.7) * 0.35);
        } else if (i === 5) {
          // testing / quality: a scanner ring sweeping over an app
          add(new THREE.Mesh(boxGeo(0.75, 1.5, 0.1, 0.08), body));
          const scan = add(
            new THREE.Mesh(geo(new THREE.TorusGeometry(0.75, 0.035, 10, 60)), accent),
          );
          scan.rotation.x = Math.PI / 2;
          animate = (t, hi) => {
            scan.position.y = Math.sin(t * (1.4 + hi)) * 0.8;
            scan.scale.setScalar(1 + hi * 0.15);
          };
        } else if (i === 6) {
          // delivery / release: a package on its way out
          const box = add(new THREE.Mesh(boxGeo(1.2, 1.0, 1.2, 0.06), body));
          const tape = new THREE.Mesh(boxGeo(1.24, 0.14, 0.34, 0.02), accent);
          tape.position.y = 0.2;
          box.add(tape);
          const arrow = add(
            new THREE.Mesh(geo(new THREE.ConeGeometry(0.28, 0.5, 20)), accent),
            0,
            1.0,
          );
          animate = (t, hi) => {
            box.rotation.y = t * 0.5;
            arrow.position.y = 0.95 + Math.sin(t * 2.2) * 0.12 * (0.5 + hi);
            arrow.rotation.x = Math.PI;
          };
        } else {
          // infrastructure: a server rack
          const units = [0, 1, 2].map((n) =>
            add(new THREE.Mesh(boxGeo(1.4, 0.4, 0.9, 0.05), body), 0, (n - 1) * 0.55),
          );
          const lights = [0, 1, 2].map((n) =>
            add(new THREE.Mesh(orbGeo, accent), 0.5, (n - 1) * 0.55, 0.47),
          );
          animate = (t, hi) => {
            units.forEach((u, n) => (u.position.x = Math.sin(t * 0.6 + n) * 0.03));
            lights.forEach((l, n) =>
              l.scale.setScalar(0.8 + 0.5 * (Math.sin(t * 3 + n * 1.7) * 0.5 + 0.5) * (0.4 + hi)),
            );
          };
        }

        // one small orb per capability, circling the prop while the station is active
        const orbs = g.items.map(() => {
          const orb = new THREE.Mesh(orbGeo, accent);
          orb.visible = false;
          root.add(orb);
          return orb;
        });

        scene.add(root);
        return { group: root, body, accent, orbs, prop, hi: 0, animate };
      };
      const stations = groups.map((_, i) => build(i));

      // ---- state ---------------------------------------------------------------------------------
      let activeIndex = 0;
      let camY = 0;
      let curDist = 30;
      let goalDist = 14;
      let width = 1;
      let height = 1;
      let narrow = false;
      // Phone-only view tuning (desktop keeps `isPhoneView` false and the shift at 0, so it is unchanged).
      let isPhoneView = false;
      let inset = 0;
      let curShift = 0;
      let visible = false;
      let entered = false;
      let enteredAt = 0;
      let raf = 0;
      let previous = performance.now();
      let px = 0;
      let py = 0;
      let yaw = 0;
      let pulseY = 0;
      let glowLen = 0;

      const fit = () => {
        const tan = Math.tan((FOV * Math.PI) / 360);
        const aspect = width / height;
        const halfH = narrow ? 2.4 : 2.6;
        const halfW = narrow ? 1.9 : 3.0;
        if (isPhoneView) {
          // Fit the station into the part of the scene the bottom sheet leaves visible.
          const visibleFraction = Math.max(0.4, 1 - inset / height);
          goalDist = Math.max(halfW / (tan * aspect), halfH / (tan * visibleFraction)) * 1.05 + 1.2;
          return;
        }
        goalDist = Math.max(halfW / (tan * aspect), halfH / tan) * 1.05 + 1.5;
      };

      apiRef.current = {
        setActive: (index) => {
          activeIndex = index;
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
        fit();
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

      const onMove = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      };
      const onLeave = () => {
        px = 0;
        py = 0;
      };
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);

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
        const enter = entered ? clamp01((now - enteredAt) / 1200) : 0;

        const k = 1 - Math.exp(-dt * 3.2);
        const targetY = -activeIndex * SPACING;
        camY += (targetY - camY) * k;
        curDist += (goalDist * (1 + 0.6 * (1 - enter)) - curDist) * k;
        yaw += (px * 0.5 - yaw) * k;
        const elevation = 0.16 - py * 0.1;
        // Phones: look a little below the station so it sits in the space above the bottom sheet.
        const shiftGoal = isPhoneView
          ? Math.tan((FOV * Math.PI) / 360) * curDist * (inset / height)
          : 0;
        curShift += (shiftGoal - curShift) * k;
        camera.position.set(
          Math.sin(yaw) * curDist,
          camY + Math.sin(elevation) * curDist + 0.4 - curShift,
          Math.cos(yaw) * curDist,
        );
        camera.lookAt(0, camY - 0.1 - curShift, 0);

        // glow travels down the pipe to the active station
        glowLen += (activeIndex * SPACING - glowLen) * k;
        glow.scale.y = Math.max(0.001, glowLen + 2);
        glow.position.y = -(glowLen + 2) / 2 + 2;
        pulseY += (targetY - pulseY) * (1 - Math.exp(-dt * 2.2));
        pulse.position.y = pulseY;
        pulse.scale.setScalar(1 + Math.sin(t * 4) * 0.15);

        stations.forEach((station, i) => {
          const isActive = i === activeIndex;
          station.hi += ((isActive ? 1 : 0) - station.hi) * (1 - Math.exp(-dt * 5));
          const s = (0.78 + 0.28 * station.hi) * enter;
          station.group.scale.setScalar(Math.max(0.001, s));
          station.prop.rotation.y = i === 4 ? station.prop.rotation.y : t * 0.35 + i;
          station.animate(t, station.hi);
          const alpha = (0.5 + 0.5 * station.hi) * enter;
          station.body.opacity = alpha;
          station.accent.opacity = alpha;
          station.body.emissiveIntensity = 0.06 + station.hi * 0.25;
          station.accent.emissiveIntensity = 0.25 + station.hi * 0.6;
          station.orbs.forEach((orb, n) => {
            orb.visible = station.hi > 0.05;
            const a = t * 0.8 + (n / station.orbs.length) * Math.PI * 2;
            const r = 1.7 + (n % 2) * 0.25;
            orb.position.set(Math.cos(a) * r, -0.2 + Math.sin(a * 1.5) * 0.45, Math.sin(a) * r);
            orb.scale.setScalar(Math.max(0.001, station.hi));
          });
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
        canvas.removeEventListener("pointerleave", onLeave);
        apiRef.current = null;
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [groups, count]);

  const showStage = ready && !hiring;

  return (
    <div>
      {ready ? (
        <div
          className="mt-8 flex flex-wrap items-center gap-2 max-md:hidden"
          role="group"
          aria-label="View"
        >
          <button
            type="button"
            aria-pressed={!hiring}
            onClick={() => setHiring(false)}
            className={`type-label min-h-9 cursor-pointer rounded-pill px-4 ${!hiring ? "bg-accent font-bold text-paper" : "glass-chip text-ink"}`}
          >
            3D pipeline
          </button>
          <button
            type="button"
            aria-pressed={hiring}
            onClick={() => {
              setPlaying(false);
              setHiring(true);
            }}
            className={`type-label min-h-9 cursor-pointer rounded-pill px-4 ${hiring ? "bg-accent font-bold text-paper" : "glass-chip text-ink"}`}
          >
            Hiring view
          </button>
          <span className="tech-label">
            {hiring
              ? "Every capability, in one list"
              : "Ship-it pipeline: from building an app to running it"}
          </span>
        </div>
      ) : null}

      <div
        className={`cap-stage glass grid-iso relative mt-4 w-full overflow-hidden ${
          showStage
            ? "flex flex-col sm:block sm:h-[76dvh] sm:max-h-[800px] sm:min-h-[560px]"
            : "hidden"
        }`}
      >
        <div
          ref={hostRef}
          onPointerDown={onSwipeStart}
          onPointerUp={onSwipeEnd}
          data-covered={detent === 2}
          className="dj-host relative h-[52dvh] min-h-[340px] sm:absolute sm:inset-0 sm:h-auto sm:min-h-0"
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 size-full touch-pan-y"
          />
          <ol
            aria-label="Pipeline stations"
            className="absolute left-3 top-3 z-10 m-0 flex max-w-[calc(100%-1.5rem)] list-none gap-1.5 overflow-x-auto p-0 max-md:hidden sm:left-4 sm:top-4 sm:max-w-none sm:flex-col sm:overflow-visible"
          >
            {groups.map((g, i) => (
              <li key={g.id} className="shrink-0">
                <button
                  type="button"
                  aria-current={active === i ? "step" : undefined}
                  onClick={() => go(i)}
                  className={`type-label flex min-h-9 cursor-pointer items-center gap-2 rounded-pill px-3 whitespace-nowrap ${
                    active === i ? "bg-accent font-bold text-paper" : "glass-chip text-ink"
                  }`}
                >
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className={active === i ? "" : "max-sm:hidden"}>{g.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative z-10 flex flex-col gap-2 p-3 max-md:hidden sm:absolute sm:bottom-4 sm:right-4 sm:top-4 sm:w-[22rem] sm:p-0">
          <div className="glass flex flex-col gap-3 p-3 sm:max-h-full sm:overflow-y-auto sm:p-4">
            <div>
              <p className="tech-label m-0">
                Station {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")} ·{" "}
                {group?.items.length} capabilities
              </p>
              <h3 className="type-h3 m-0 mt-1">{group?.label}</h3>
            </div>
            <ul key={active} className="m-0 flex list-none flex-wrap gap-2 p-0" aria-live="polite">
              {group?.items.map((item, n) => (
                <li
                  key={item}
                  style={{ animationDelay: `${n * 60}ms` }}
                  className="glass-chip type-small cap-chip-in px-2.5 py-1 text-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={play}
                className="type-label min-h-9 cursor-pointer rounded-pill bg-accent px-4 font-bold text-paper"
              >
                {playing ? "Pause" : active >= count - 1 ? "Replay" : "Play the pipeline"}
              </button>
              <button
                type="button"
                disabled={active === 0}
                onClick={() => go(active - 1)}
                className="glass-chip type-label min-h-9 cursor-pointer px-3 text-ink disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                disabled={active >= count - 1}
                onClick={() => go(active + 1)}
                className="glass-chip type-label min-h-9 cursor-pointer px-3 text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <CapabilityPhone
          groups={groups}
          active={active}
          onGo={go}
          playing={playing}
          onPlay={play}
          note={note}
          detent={detent}
          onDetent={setDetent}
          onVisible={onSheetVisible}
        />
      </div>

      <div hidden={showStage} className="mt-4 max-md:hidden">
        {children}
      </div>
    </div>
  );
}
