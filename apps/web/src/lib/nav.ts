/**
 * Sections of the portfolio, in reading order, after the Hero (sheet 1). Labels are the section names
 * from the brand guide. `available` flips to true, and the item becomes a real link to `#<id>`, when
 * that section is built. Until then it is shown as a placeholder and is not a link.
 */
export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly available: boolean;
}

export const navItems: readonly NavItem[] = [
  { id: "layers", label: "Layers", available: false },
  { id: "work", label: "Work", available: true },
  { id: "release-notes", label: "Release notes", available: false },
  { id: "engineering-thinking", label: "Engineering thinking", available: false },
  { id: "about", label: "About", available: false },
  { id: "contact", label: "Contact", available: true },
];

/** Total sheets: the Hero plus every section in the navigation. */
export const sheetCount = navItems.length + 1;

/** The sheet number of a section, matching the numbers shown in the navigation (the Hero is sheet 1). */
export function sheetNumber(id: string): number {
  return navItems.findIndex((item) => item.id === id) + 2;
}
