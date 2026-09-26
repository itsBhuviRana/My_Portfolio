import { site, socials } from "@assembly/content";
import { displayUrl } from "../../lib/format";
import { Monogram } from "../../generated/brand-marks";
import { ContactLight, type ContactCard } from "./contact-light";

/** Chip label for a social link; `website` and future ids fall back to their own label. */
const CARD_LABEL: Record<string, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  github: "GitHub",
};

/**
 * The contact destination (`#contact`): the closing "turn the light on" scene (see `ContactLight`), built from
 * the socials in the content package, plus the approved monogram (32 px, its minimum) and a status line.
 */
export function SiteFooter() {
  const order = ["email", "whatsapp", "linkedin", "github"];
  const cards: ContactCard[] = [...socials]
    .sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
    })
    .map((link) => ({
      id: link.id,
      label: CARD_LABEL[link.id] ?? link.label,
      display: link.id === "whatsapp" ? "+91 74099 74400" : displayUrl(link.url),
      href: link.url,
      external: link.url.startsWith("https:"),
      copy: link.id === "email" ? displayUrl(link.url) : undefined,
    }));

  return (
    <footer id="contact" className="rule-ink mt-12">
      <div className="page-shell">
        <ContactLight
          cards={cards}
          status={
            site.availability?.status === "open" ? (
              <>
                <span className="hero-status-dot" aria-hidden="true" />
                Open to new opportunities
              </>
            ) : null
          }
        />
      </div>
      <div className="rule-info">
        <div className="page-shell flex flex-wrap items-center gap-x-4 gap-y-2 py-6">
          <Monogram className="size-8 shrink-0" />
          <p className="type-small m-0">{site.name}</p>
        </div>
      </div>
    </footer>
  );
}
