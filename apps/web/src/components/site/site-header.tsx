import Link from "next/link";
import { Wordmark } from "../../generated/brand-marks";
import { navItems } from "../../lib/nav";
import { NavMenu } from "./nav-menu";

/** Global header: the approved wordmark (192 px wide, its minimum) and the primary navigation. */
export function SiteHeader() {
  return (
    <header className="relative border-b-[1.5px] border-ink bg-vellum">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4 py-2">
        <Link href="/" aria-label="Bhuvneshwar Rana, home" className="block w-48 shrink-0 md:w-56">
          <Wordmark className="block h-auto w-full" />
        </Link>
        <NavMenu items={navItems} />
      </div>
    </header>
  );
}
