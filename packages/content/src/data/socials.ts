import type { SocialLink } from "../types";

/** Profile links supplied by the owner for publication. Only https and mailto URLs are allowed. */
export const socials: readonly SocialLink[] = [
  { id: "email", label: "Email", url: "mailto:ranabhuvi98@gmail.com" },
  // Supplied by the owner (September 2026). wa.me opens WhatsApp with this number, country code included.
  { id: "whatsapp", label: "WhatsApp", url: "https://wa.me/917409974400" },
  { id: "github", label: "GitHub", url: "https://github.com/itsBhuviRana" },
  { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/itsbhuvirana/" },
];
