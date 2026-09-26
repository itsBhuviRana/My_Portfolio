import { site, socials } from "@assembly/content";
import { displayUrl } from "../../lib/format";
import { sheetCount, sheetNumber } from "../../lib/nav";
import { Monogram } from "../../generated/brand-marks";

/** The contact destination (`#contact`) and a status line, with the approved monogram (32 px, its minimum). */
export function SiteFooter() {
  return (
    <footer id="contact" className="rule-ink mt-12">
      <div className="page-shell py-10">
        <div className="title-block" aria-hidden="true">
          <span className="tech-label">
            Sheet {sheetNumber("contact")}/{sheetCount}
          </span>
          <span className="tech-label">Contact</span>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-10">
          <h2 className="type-h1 m-0 lg:col-span-5">Get in touch</h2>
          <ul className="m-0 list-none p-0 lg:col-span-7">
            {socials.map((link) => (
              <li key={link.id} className="border-t border-rule first:border-t-0">
                <a
                  href={link.url}
                  {...(link.url.startsWith("https:") ? { rel: "noopener noreferrer" } : {})}
                  className="flex min-h-12 flex-wrap items-baseline gap-x-6 gap-y-1 py-3"
                >
                  <span className="tech-label w-24 shrink-0">{link.label}</span>
                  <span className="type-body-lg text-accent underline underline-offset-4 [overflow-wrap:anywhere]">
                    {displayUrl(link.url)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rule-info">
        <div className="page-shell flex flex-wrap items-center gap-x-4 gap-y-2 py-6">
          <Monogram className="size-8 shrink-0" />
          <p className="type-small m-0">{site.name}</p>
          <p className="tech-label m-0 md:ml-auto">Assembly · Sections in progress</p>
        </div>
      </div>
    </footer>
  );
}
