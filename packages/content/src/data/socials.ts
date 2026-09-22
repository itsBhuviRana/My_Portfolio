import type { SocialLink } from "../types";

/** Profile links supplied by the owner for publication. Only https and mailto URLs are allowed. */
export const socials: readonly SocialLink[] = [
  { id: "email", label: "Email", url: "mailto:ranabhuvi98@gmail.com" },
  { id: "github", label: "GitHub", url: "https://github.com/itsBhuviRana" },
  { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/itsbhuvirana/" },
];
