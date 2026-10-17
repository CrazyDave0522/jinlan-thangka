import "server-only";
import { getSupabaseConfig } from "./config";

export function validateArchiveConfig(config: { url: string; key: string }) {
  const url = new URL(config.url);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Invalid archive configuration");
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(config.key)) {
    const parts = config.key.split(".");
    if (parts.length !== 3 || !parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p))) throw new Error("Invalid anon key");
    const payload: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!payload || typeof payload !== "object" || !("role" in payload) || payload.role !== "anon") throw new Error("Invalid anon role");
  }
  return config;
}
export const archiveConfig = () => validateArchiveConfig(getSupabaseConfig());
