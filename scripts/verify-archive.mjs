// Read-only live smoke check. Prints status codes, never credentials or record contents.
// Run with Node 24: node --env-file=.env.local scripts/verify-archive.mjs
import { archiveColumns } from "../src/lib/retrieval/database.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Archive smoke check: missing public URL/key configuration.");
  process.exitCode = 1;
} else {
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    const parts = key.split(".");
    let role;
    try {
      if (parts.length === 3 && parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p))) {
        role = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")).role;
      }
    } catch { /* Invalid public-key configuration. */ }
    if (role !== "anon") throw new Error("Archive smoke requires a publishable or legacy anon key, never an elevated key");
  }
  const base = new URL(url);
  if (!["https:", "http:"].includes(base.protocol) || base.username || base.password) throw new Error("Invalid archive URL configuration");
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Accept-Profile": "thangka" };
  async function report(label, response) {
    let code = "";
    if (!response.ok) {
      try {
        const error = await response.json();
        if (typeof error?.code === "string" && /^[A-Z0-9]{4,12}$/.test(error.code)) code = ` (${error.code})`;
      } catch { /* Do not print remote messages or contents. */ }
    }
    console.log(`${label}: HTTP ${response.status}${code}`);
    await response.body?.cancel().catch(() => {});
  }
  let passed = true;
  for (const [table, columns] of Object.entries(archiveColumns)) {
    try {
      const target = new URL(`/rest/v1/${table}`, base);
      target.searchParams.set("select", Object.keys(columns).join(","));
      target.searchParams.set("limit", "0");
      const response = await fetch(target, { headers, signal: AbortSignal.timeout(5_000), cache: "no-store" });
      await report(table, response);
      passed &&= response.ok;
    } catch { console.log(`${table}: network/timeout failure`); passed = false; }
  }
  try {
    const response = await fetch(new URL("/rest/v1/rpc/search_archive_candidates", base), {
      method: "POST", headers: { ...headers, "Content-Profile": "thangka", "Content-Type": "application/json" },
      body: JSON.stringify({ p_entity: "artwork", p_filters: [{field:"name",value:"archive-read-smoke-nonexistent",mode:"exact"}],p_limit:1 }),
      signal: AbortSignal.timeout(5_000), cache: "no-store",
    });
    await report("search_archive_candidates", response);
    passed &&= response.ok;
  } catch { console.log("search_archive_candidates: network/timeout failure"); passed = false; }
  console.log("Smoke results do not verify grants/RLS completeness or deployed column types; inspect metadata separately.");
  if (!passed) process.exitCode = 1;
}
