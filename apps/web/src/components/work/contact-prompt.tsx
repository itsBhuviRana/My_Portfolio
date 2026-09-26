import { getAtlasSummary } from "@assembly/content";

/**
 * A single contact touchpoint between the current-project deep-inspection and the rest of the Work
 * section (the register and capabilities) — the point where a visitor has just seen the deepest, most
 * concrete proof of the work, not only its breadth. `href="#contact"` matches the Hero's own CTA exactly
 * (same destination, same wording), so this reads as the same offer surfacing again, not a second one.
 * The count is derived from the atlas data, never a hand-picked number, so it cannot drift.
 */
export function ContactPrompt() {
  const otherProjects = getAtlasSummary().total - 1;

  return (
    <div className="page-shell py-6 md:py-8">
      <div className="glass flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="type-body m-0">
          That is one project in full detail. {otherProjects} more are in the atlas above, with the
          full capability breakdown after it.
        </p>
        <a
          href="#contact"
          className="type-body inline-flex min-h-12 shrink-0 items-center rounded-pill bg-accent px-6 font-bold text-paper"
        >
          Get in touch
        </a>
      </div>
    </div>
  );
}
