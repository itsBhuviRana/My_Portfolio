import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { site } from "@assembly/content";
import { color } from "@assembly/tokens";
import "./globals.css";

export const metadata: Metadata = {
  title: site.name,
  description: site.summary.short,
  // Foundation build only: keep it out of search indexes until the real site launches.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: color.vellum,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
