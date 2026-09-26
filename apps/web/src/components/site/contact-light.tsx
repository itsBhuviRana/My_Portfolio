"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TiltStage } from "./tilt-stage";

export interface ContactCard {
  id: string;
  label: string;
  display: string;
  href: string;
  external: boolean;
  /** Text copied by the "Copy" button, when the card has one (the email address). */
  copy?: string;
}

/**
 * The closing of the site, echoing its opening: the visitor started in a bright room and switched the tube
 * light off to see who this is; here the room is dark again and switching the light back on brings up the
 * ways to get in touch. Every card is a real link and is always in the page (dimmed, not hidden, while the
 * light is off), so nothing depends on the switch; without JavaScript the light is simply on (see
 * contact-light.css). The light hangs from the top and shines down onto the cards.
 */
export function ContactLight({
  cards,
  status,
  children,
}: {
  cards: ContactCard[];
  status: ReactNode;
  children?: ReactNode;
}) {
  const [lit, setLit] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // While the light is off the cards are dim and inert: no clicks, no Tab. Set from here (not in the markup) so
  // that without JavaScript, when nothing could turn the light on, the links stay usable.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.inert = !lit;
  }, [lit]);

  // The cursor torch (cursor-glow.tsx) steps out of the way while this light is on: `data-contact-lit` on <html>
  // is what its CSS reads. It comes back when the light goes off, and the light goes off by itself as soon as
  // the visitor scrolls back up (a short, deliberate distance, so a tiny jitter at the bottom doesn't count).
  useEffect(() => {
    const html = document.documentElement;
    if (!lit) {
      html.removeAttribute("data-contact-lit");
      return;
    }
    html.setAttribute("data-contact-lit", "true");
    let last = window.scrollY;
    let up = 0;
    const onScroll = () => {
      const y = window.scrollY;
      up = y < last ? up + (last - y) : 0;
      last = y;
      if (up > 60) setLit(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      html.removeAttribute("data-contact-lit");
    };
  }, [lit]);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(id);
    window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 2200);
  };

  return (
    <div className="contact-light" data-lit={lit}>
      <div className="contact-tube" aria-hidden="true">
        <span className="contact-wire contact-wire-left" />
        <span className="contact-wire contact-wire-right" />
        <div className="contact-tube-housing">
          <div className="contact-tube-body">
            <div className="contact-tube-lit" />
          </div>
        </div>
      </div>
      <div className="contact-beam" aria-hidden="true">
        <div className="contact-beam-blur">
          <div className="contact-beam-shape" />
        </div>
      </div>

      <div className="contact-head">
        <p className="tech-label m-0 flex items-center justify-center gap-2 text-ink">{status}</p>
        <h2 className="type-h1 m-0 mt-4">Now you know who I am</h2>
        <p className="type-body-lg m-0 mt-3">
          {lit ? "Let's talk." : "Turn the light on to get in touch."}
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={lit}
          aria-label="Light"
          onClick={() => {
            (window as unknown as { __tubeFx?: (kind: "on" | "off") => void }).__tubeFx?.(
              lit ? "off" : "on",
            );
            setLit((value) => !value);
          }}
          className="contact-switch"
        >
          <span className="contact-plate">
            <span className="contact-rocker" aria-hidden="true" />
          </span>
          <span className="tech-label contact-switch-label" aria-hidden="true">
            {lit ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      <ul ref={listRef} className="contact-cards m-0 list-none p-0">
        {cards.map((card, index) => (
          <li key={card.id} style={{ "--i": index } as CSSProperties} className="contact-card-wrap">
            <TiltStage>
              <div className="tilt-plane">
                <div className="contact-card glass">
                  <a
                    href={card.href}
                    {...(card.external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
                    className="contact-card-link"
                  >
                    <span className="tech-label">{card.label}</span>
                    <span className="type-body-lg contact-card-value">{card.display}</span>
                    <span className="contact-card-go" aria-hidden="true">
                      {card.id === "email" ? "Write" : card.id === "whatsapp" ? "Chat" : "Open"} →
                    </span>
                  </a>
                  {card.copy ? (
                    <button
                      type="button"
                      onClick={() => copy(card.id, card.copy as string)}
                      aria-label={copied === card.id ? "Email copied" : "Copy email address"}
                      className="contact-copy"
                    >
                      {copied === card.id ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="contact-copy-icon">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="contact-copy-icon">
                          <rect x="9" y="9" width="11" height="11" rx="2" />
                          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                        </svg>
                      )}
                    </button>
                  ) : null}
                </div>
                <div className="tilt-glare" aria-hidden="true" />
              </div>
            </TiltStage>
          </li>
        ))}
      </ul>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
      {children}
    </div>
  );
}
