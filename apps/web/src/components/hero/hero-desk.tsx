import Image from "next/image";
import type { CSSProperties } from "react";
import { getCurrentExperience } from "@assembly/content";
import baseImage from "../../assets/images/hero-desk.webp";
import personImage from "../../assets/images/hero-desk-person.webp";
import { TiltStage } from "../site/tilt-stage";

type Hotspot = {
  /** Position of the marker as a percentage of the illustration. */
  x: number;
  y: number;
  chip: string;
  title: string;
  body: string;
  href: string;
  side: "top" | "bottom";
  align: "left" | "right";
};

/**
 * The hero portrait: the illustration split into a background plate and a cut-out of the person, so the
 * two shift by different amounts as the pointer moves and the person reads as standing in front of the
 * desk. Four props in the scene are links into the page (laptop, books, whiteboard, mug); each shows a
 * short card on hover or keyboard focus. Every hotspot is a real anchor, so the illustration is fully
 * usable without a pointer.
 */
export function HeroDesk({ className = "" }: { className?: string }) {
  const project = getCurrentExperience()?.project;

  const hotspots: Hotspot[] = [
    ...(project
      ? [
          {
            x: 77,
            y: 66,
            chip: "Now building",
            title: "Now building",
            body: `${project.name}: ${project.tagline}`,
            href: "#dijkastra",
            side: "top",
            align: "right",
          } satisfies Hotspot,
        ]
      : []),
    {
      x: 90,
      y: 31,
      chip: "My stack",
      title: "My stack",
      body: "React Native · Next.js · TypeScript",
      href: "#capabilities",
      side: "bottom",
      align: "right",
    },
    {
      x: 22,
      y: 29,
      chip: "How I work",
      title: "How I work",
      body: "Ideas, Design, Code, Build, Ship, Grow.",
      href: "#work",
      side: "bottom",
      align: "left",
    },
    {
      x: 22,
      y: 80,
      chip: "The motto",
      title: "The motto",
      body: "Build. Ship. Improve. Repeat.",
      href: "#contact",
      side: "top",
      align: "left",
    },
  ];

  return (
    <TiltStage className={`hero-desk ${className}`}>
      <div className="tilt-plane hero-desk-plane">
        <div className="tilt-layer hero-desk-plate" style={{ "--depth": 5 } as CSSProperties}>
          <Image
            src={baseImage}
            alt="Illustration of Bhuvneshwar at his desk with a laptop, a shelf of React Native, Next.js and TypeScript books, and a mug that reads Build, Ship, Improve, Repeat."
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            className="hero-desk-img"
          />
          <div className="tilt-glare" aria-hidden="true" />
        </div>
        <Image
          src={personImage}
          alt=""
          aria-hidden="true"
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="tilt-layer hero-desk-person"
          style={{ "--depth": 16, "--z": "34px" } as CSSProperties}
        />
        <ul
          className="tilt-layer hero-desk-hotspots m-0 list-none p-0"
          style={{ "--depth": 9, "--z": "46px" } as CSSProperties}
        >
          {hotspots.map((spot) => (
            <li
              key={spot.title}
              className="hero-desk-spot"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              <a
                href={spot.href}
                className="hotspot"
                data-side={spot.side}
                data-align={spot.align}
                aria-label={`${spot.title}: ${spot.body}`}
              >
                <span className="hotspot-dot" aria-hidden="true" />
                <span className="hotspot-chip type-label" aria-hidden="true">
                  {spot.chip}
                </span>
                <span className="hotspot-tip" aria-hidden="true">
                  <span className="tech-label block">{spot.title}</span>
                  <span className="type-body mt-1 block">{spot.body}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </TiltStage>
  );
}
