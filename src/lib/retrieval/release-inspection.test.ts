// @vitest-environment node
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, expect, it } from "vitest";

const db = new PGlite();
const inspection = await readFile("scripts/inspect-archive-release.sql", "utf8");
type Inspection = {
  inspection_role: string; role_superuser: boolean; role_bypass_rls: boolean;
  anon_schema_usage: boolean; counts: Record<string, number>;
  tables: { table_name: string; rls_enabled: boolean; anon_select: boolean; anon_insert: boolean; anon_update: boolean; anon_delete: boolean; anon_truncate: boolean }[];
  policies: { tablename: string; cmd: string; qual: string }[];
  functions: { security_definer: boolean; volatility: string; anon_execute: boolean; public_execute: boolean }[];
  operational_tables: { table_name: string; rls_enabled: boolean; anon_select: boolean; anon_insert: boolean; authenticated_access: boolean }[];
  maintenance_functions: { security_definer: boolean; anon_execute: boolean; public_execute: boolean }[];
  unexpected_tables: string[]; unexpected_functions: unknown[];
  review_sequences: { name: string; anon_access: boolean }[];
};
async function inspect() {
  return (await db.query<{ release_inspection: Inspection }>(inspection)).rows[0].release_inspection;
}
beforeAll(async () => {
  await db.exec(await readFile("database/schema.sql", "utf8"));
  await db.exec("CREATE ROLE anon NOLOGIN");
  await db.exec(await readFile("database/migrations/20261016_archive_search.sql", "utf8"));
  await db.exec(await readFile("database/migrations/20261016_archive_read_access.sql", "utf8"));
}, 30_000);
afterAll(async () => { await db.close(); });

it("reports all eight empty counts, effective anon grants, RLS policies and the exact invoker function", async () => {
  const result = await inspect();
  expect(Object.keys(result.counts).sort()).toEqual(["artist_sources", "artists", "artwork_artists", "artwork_sources", "artworks", "image_sources", "images", "sources"]);
  expect(Object.values(result.counts)).toEqual(Array(8).fill(0));
  expect(result.anon_schema_usage).toBe(true);
  expect(result.tables).toHaveLength(8);
  for (const table of result.tables) expect(table).toMatchObject({ rls_enabled: true, anon_select: true, anon_insert: false, anon_update: false, anon_delete: false, anon_truncate: false });
  expect(result.policies).toHaveLength(8);
  for (const policy of result.policies) expect(policy).toMatchObject({ cmd: "SELECT", qual: "true" });
  expect(result.functions).toEqual([expect.objectContaining({ security_definer: false, volatility: "s", anon_execute: true, public_execute: false })]);
  expect(result.operational_tables).toEqual([expect.objectContaining({ table_name: "archive_reviews", rls_enabled: true, anon_select: false, anon_insert: false, authenticated_access: false })]);
  expect(result.maintenance_functions).toHaveLength(5);
  for (const fn of result.maintenance_functions) expect(fn).toMatchObject({ security_definer: false, anon_execute: false, public_execute: false });
  expect(result.review_sequences).toEqual([{ name: "archive_review_order", anon_access: false }]);
  expect(result.unexpected_tables).toEqual([]);
  expect(result.unexpected_functions).toEqual([]);
});

it("reports unexpected objects rather than hiding them behind the business-table filter", async () => {
  await db.exec("CREATE TABLE thangka.unexpected_probe(id integer); CREATE FUNCTION thangka.unexpected_probe() RETURNS integer LANGUAGE SQL AS 'SELECT 1'; CREATE FUNCTION thangka.record_archive_review(integer) RETURNS integer LANGUAGE SQL AS 'SELECT 1'");
  try {
    const result = await inspect();
    expect(result.unexpected_tables).toEqual(["unexpected_probe"]);
    expect(result.unexpected_functions).toEqual(expect.arrayContaining([expect.objectContaining({ name: "unexpected_probe" }), expect.objectContaining({ name: "record_archive_review" })]));
  } finally { await db.exec("DROP FUNCTION thangka.record_archive_review(integer); DROP FUNCTION thangka.unexpected_probe(); DROP TABLE thangka.unexpected_probe"); }
});

it("exposes the inspection role and separates RLS-hidden emptiness from privileged counts without changing rows", async () => {
  await db.exec("INSERT INTO thangka.artists(display_name) VALUES ('Synthetic hidden artist'); ALTER POLICY archive_retrieval_select ON thangka.artists USING (false)");
  const admin = await inspect();
  expect(admin.counts.artists).toBe(1);
  expect(admin.role_superuser || admin.role_bypass_rls).toBe(true);
  expect(admin.policies.find((p) => p.tablename === "artists")?.qual).toBe("false");
  await db.exec("SET ROLE anon");
  try {
    const anonymous = await inspect();
    expect(anonymous.inspection_role).toBe("anon");
    expect(anonymous.role_superuser).toBe(false);
    expect(anonymous.role_bypass_rls).toBe(false);
    expect(anonymous.counts.artists).toBe(0);
  } finally { await db.exec("RESET ROLE"); }
  expect((await inspect()).counts.artists).toBe(1);
});
