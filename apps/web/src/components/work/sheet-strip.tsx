import { navItems, sheetCount, sheetNumber } from "../../lib/nav";

/** The engineering title block that opens each part of the Work section: sheet, section, and the part. */
export function SheetStrip({ tag }: { tag: string }) {
  const label = navItems.find((item) => item.id === "work")?.label ?? "Work";
  return (
    <div className="title-block" aria-hidden="true">
      <span className="tech-label">
        Sheet {sheetNumber("work")}/{sheetCount}
      </span>
      <span className="tech-label">{label}</span>
      <span className="tech-label">{tag}</span>
    </div>
  );
}
