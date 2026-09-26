import type { NextConfig } from "next";

/**
 * Sub-path the site is served from. Empty for a custom domain or a user site
 * (`<user>.github.io`); `/<repo>` for a GitHub Pages project site. Never hard-code
 * a repository name here: CI derives it from `actions/configure-pages`.
 */
function resolveBasePath(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  if (!value.startsWith("/") || value.endsWith("/")) {
    throw new Error(
      `Invalid BASE_PATH "${value}". It must start with "/" and must not end with "/" (for example "/my-repo").`,
    );
  }
  return value;
}

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: resolveBasePath(process.env.BASE_PATH),
  images: { unoptimized: true },
  transpilePackages: ["@assembly/content", "@assembly/tokens"],
  // Dev only (ignored by the static export). Without this, `next dev` refuses the JS and HMR requests of a
  // phone opening the site over the LAN (http://192.168.x.x:3000), so the page never hydrates there. The
  // wildcards cover a router handing out a different address next time.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  // `next dev` would otherwise write AGENTS.md and CLAUDE.md into the repo. Not wanted here.
  agentRules: false,
};

export default nextConfig;
