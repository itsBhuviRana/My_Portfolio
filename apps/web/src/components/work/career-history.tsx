import { education, getPublishedExperience, type Experience } from "@assembly/content";
import { formatPeriod } from "../../lib/format";
import { CareerMarquee } from "./career-marquee";

/**
 * One role as a liquid-glass card, with its node on the shared timeline line above the row: what the owner
 * did at the company (the role summary and responsibilities), not the projects — those live in the atlas.
 */
function RoleCard({ entry, version }: { entry: Experience; version: number }) {
  const current = entry.period !== undefined && entry.period.end === undefined;
  const place = [entry.location, entry.workMode].filter(Boolean).join(" · ");

  return (
    <article className="career-card glass flex flex-col p-5 md:p-6">
      <span aria-hidden="true" className={`career-node ${current ? "career-node-current" : ""}`} />
      <p className="tech-label m-0 flex flex-wrap items-center gap-2 text-ink">
        <span>v{version}.0</span>
        {current ? <span className="rounded-sm bg-ink px-1.5 py-0.5 text-paper">Now</span> : null}
        {entry.period ? <span>· {formatPeriod(entry.period)}</span> : null}
      </p>
      {place ? <p className="tech-label m-0 mt-1">{place}</p> : null}

      <h3 className="type-h3 m-0 mt-4">{entry.company}</h3>
      <p className="type-body-lg m-0 mt-1 text-ink-soft">{entry.role}</p>
      {entry.promotedFrom ? (
        <p className="tech-label m-0 mt-2">
          Joined as {entry.promotedFrom} · promoted to {entry.role}
        </p>
      ) : null}
      {entry.deployedTo?.length ? (
        <p className="tech-label m-0 mt-1">Deployed to {entry.deployedTo.join(" · ")}</p>
      ) : null}

      <p className="type-body m-0 mt-4">{entry.summary}</p>
      {entry.responsibilities?.length ? (
        <ul className="m-0 mt-4 grid list-none gap-2.5 p-0">
          {entry.responsibilities.map((item) => (
            <li key={item.title} className="type-small flex gap-2">
              <span aria-hidden="true" className="tech-label text-ink">
                +
              </span>
              <span>
                <span className="font-bold text-ink">{item.title}.</span> {item.detail}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

/**
 * Career history: every role, newest first, as a row of liquid-glass cards that glides sideways on its own
 * (`CareerMarquee`) — numbered from the first job (v1.0) up, with the current one marked. Everything comes
 * from the content package (`getPublishedExperience` and `education`), so nothing about a role is written
 * in this file. Draft entries never reach it. Education closes the section.
 */
export function CareerHistory() {
  const entries = getPublishedExperience();
  if (entries.length === 0) return null;
  const cards = (keyPrefix: string) =>
    entries.map((entry, index) => (
      <RoleCard key={`${keyPrefix}${entry.id}`} entry={entry} version={entries.length - index} />
    ));

  return (
    <section
      id="career"
      aria-labelledby="career-title"
      className="page-shell mt-12 pb-10 md:mt-16 md:pb-12"
    >
      <div className="rule-ink" />
      <h2 id="career-title" className="type-h1 m-0 mt-10">
        Career history
      </h2>
      <p className="tech-label m-0 mt-2">
        {entries.length} roles · newest first · hover or swipe to pause
      </p>

      <CareerMarquee label="Career history" copy={cards("copy-")}>
        {cards("")}
      </CareerMarquee>

      {education.length ? (
        <div className="mt-10 grid gap-4 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-3">
            <div className="rule-ink" />
            <h3 className="type-h3 m-0 mt-3">Education</h3>
          </div>
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 md:col-span-9">
            {education.map((item) => (
              <li key={item.id} className="glass flex flex-col gap-1 p-4">
                <span className="tech-label">{item.qualification}</span>
                <span className="type-body font-medium">{item.field}</span>
                <span className="type-small text-ink-soft">{item.institution}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
