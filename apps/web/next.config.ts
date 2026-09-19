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
  // `next dev` would otherwise write AGENTS.md and CLAUDE.md into the repo. Not wanted here.
  agentRules: false,
};

export default nextConfig;
