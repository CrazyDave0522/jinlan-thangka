import type { NextConfig } from "next";

const fixtures = process.env.JINLAN_BROWSER_FIXTURES === "true";
if (fixtures && (process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://archive.fixture.test" || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== "sb_publishable_browser_fixture" || process.env.DEEPSEEK_API_KEY !== "synthetic-browser-key-never-real")) {
  throw new Error("Browser fixture builds require the isolated synthetic environment");
}
const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    ...(fixtures ? { resolveAlias: { "@/lib/vision/reference-manifest": "./tests/browser/server/reference-manifest.ts" } } : {}),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
