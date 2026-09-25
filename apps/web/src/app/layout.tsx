import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { site } from "@assembly/content";
import { color } from "@assembly/tokens";
import { LoadingIntro } from "../components/site/loading-intro";
import { SiteFooter } from "../components/site/site-footer";
import "./globals.css";

// Two families, Latin subset, self-hosted at build time (D9). The `variable` names are what the
// generated theme (--font-sans, --font-mono) refers to: keep them in step with scripts/generate.mjs.
// Archivo needs its width axis requested (the expanded look is width 125). Only Archivo is preloaded.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains-mono",
});

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
    <html lang="en" className={`${archivo.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <LoadingIntro />
        <a
          href="#main"
          className="type-small sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
