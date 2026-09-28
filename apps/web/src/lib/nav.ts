/**
 * Sections of the portfolio, in reading order, after the Hero (sheet 1). Only sections that are built are listed: an unbuilt one is left out entirely,
 * never shown as a placeholder. (Layers, Engineering thinking and About are planned but not built.)
 */
export interface NavItem {
  readonly id: string;
  readonly label: string;
}

export const navItems: readonly NavItem[] = [
  { id: "work", label: "Work" },
  { id: "career", label: "Career history" },
  { id: "contact", label: "Contact" },
];

/** Total sheets: the Hero plus every section in the navigation. */
export const sheetCount = navItems.length + 1;

/** The sheet number of a section, matching the numbers shown in the navigation (the Hero is sheet 1). */
export function sheetNumber(id: string): number {
  return navItems.findIndex((item) => item.id === id) + 2;
}
