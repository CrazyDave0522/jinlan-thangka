// @vitest-environment node
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { archiveColumns, isArchiveReviewField } from "./database";

const db = new PGlite();
const id = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const schema = await readFile("database/schema.sql", "utf8");
const migration = await readFile("database/migrations/20261018_archive_data_quality.sql", "utf8");
type State = { content_revision: number; current_review_id: string | null; review_status: string | null };
const state = async (table = "artists", key = id(1)) => (await db.query<State>(`SELECT content_revision,current_review_id,review_status FROM thangka.${table} WHERE id=$1`, [key])).rows[0];
async function review(entity = "artist", key = id(1), revision = 1, previous: string | null = null, decision = "verified") {
  return (await db.query<{ id: string }>("SELECT thangka.record_archive_review($1,$2,$3,$4,$5,'Synthetic reviewer','Synthetic notes') AS id", [entity, key, revision, previous, decision])).rows[0].id;
}
async function rejects(sql: string, params: unknown[] = [], code?: string) {
  await db.exec("SAVEPOINT invalid_write");
  const error = await db.query(sql, params).then(() => null, (e: unknown) => e);
  await db.exec("ROLLBACK TO SAVEPOINT invalid_write; RELEASE SAVEPOINT invalid_write");
  expect(error).not.toBeNull();
  if (code) expect(error).toMatchObject({ code });
}
beforeAll(async () => {
  await db.exec("CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN");
  await db.exec(schema);
  await db.exec(await readFile("database/migrations/20261016_archive_search.sql", "utf8"));
  await db.exec(await readFile("database/migrations/20261016_archive_read_access.sql", "utf8"));
}, 30_000);
beforeEach(async () => {
  await db.exec("BEGIN");
  await db.query("INSERT INTO thangka.artists(id,display_name,collected_by,collected_on) VALUES($1,'Synthetic artist','Collector A','2026-10-18')", [id(1)]);
  await db.query("INSERT INTO thangka.artworks(id,title) VALUES($1,'Synthetic artwork')", [id(2)]);
  await db.query("INSERT INTO thangka.images(id,artwork_id,storage_locator) VALUES($1,$2,'fixture/original.png')", [id(3), id(2)]);
  await db.query("INSERT INTO thangka.sources(id,title) VALUES($1,'Synthetic source')", [id(4)]);
});
afterEach(async () => { await db.exec("ROLLBACK"); });
afterAll(async () => { await db.close(); });

it("records a database-derived snapshot and current decision without replacing collection responsibility", async () => {
  const key = await review();
  expect(await state()).toEqual({ content_revision: 1, current_review_id: key, review_status: "verified" });
  const event = (await db.query<{ reviewer: string; reviewed_at: Date; snapshot: Record<string, unknown>; decision_order: number }>("SELECT * FROM thangka.archive_reviews WHERE id=$1", [key])).rows[0];
  expect(event.reviewer).toBe("Synthetic reviewer");
  expect(event.reviewed_at).toBeInstanceOf(Date);
  expect(Number(event.decision_order)).toBeGreaterThan(0);
  expect(event.snapshot).toMatchObject({ id: id(1), display_name: "Synthetic artist", collected_by: "Collector A", collected_on: "2026-10-18" });
  for (const field of ["content_revision", "current_review_id", "review_status", "created_at", "updated_at"]) expect(event.snapshot).not.toHaveProperty(field);
});
it("advances content once, clears verification, and preserves the old snapshot before re-review", async () => {
  const first = await review();
  await db.exec("UPDATE thangka.artists SET biography='Changed biography'");
  expect(await state()).toEqual({ content_revision: 2, current_review_id: null, review_status: "pending" });
  await rejects("SELECT thangka.record_archive_review('artist',$1,1,$2,'verified','Stale reviewer')", [id(1), first], "40001");
  const second = await review("artist", id(1), 2);
  const events = (await db.query<{ id: string; snapshot: Record<string, unknown> }>("SELECT id,snapshot FROM thangka.archive_reviews ORDER BY decision_order")).rows;
  expect(events.map((e) => e.id)).toEqual([first, second]);
  expect(events[0].snapshot.biography).toBeNull();
  expect(events[1].snapshot.biography).toBe("Changed biography");
});
it("keeps no-op/timestamp maintenance stable and resets image verification after rights edits", async () => {
  const first = await review();
  await db.exec("UPDATE thangka.artists SET display_name=display_name; UPDATE thangka.artists SET updated_at=clock_timestamp()");
  expect(await state()).toEqual({ content_revision: 1, current_review_id: first, review_status: "verified" });
  await review("image", id(3));
  await db.exec("UPDATE thangka.images SET permission_notes='Changed permission'");
  expect(await state("images", id(3))).toEqual({ content_revision: 2, current_review_id: null, review_status: "pending" });
});
it("does not replay an old approval after a new decision on unchanged content", async () => {
  const first = await review();
  const second = await review("artist", id(1), 1, first, "disputed");
  expect(await state()).toEqual({ content_revision: 1, current_review_id: second, review_status: "disputed" });
  await rejects("UPDATE thangka.artists SET review_status='verified',current_review_id=$1", [first], "23514");
  await rejects("SELECT thangka.record_archive_review('artist',$1,1,$2,'verified','Stale reviewer')", [id(1), first], "40001");
  await rejects("SELECT thangka.record_archive_review('artist',$1,1,NULL,'verified','Stale first reviewer')", [id(1)], "40001");
  expect((await db.query("SELECT id FROM thangka.archive_reviews")).rows).toHaveLength(2);
});
it("rejects direct verification, forged revisions and cross-entity decisions", async () => {
  for (const decision of ["verified", "disputed"]) await rejects(`INSERT INTO thangka.artists(display_name,review_status) VALUES('Invalid', '${decision}')`, [], "23514");
  await rejects("UPDATE thangka.artists SET review_status='verified'", [], "23514");
  await rejects("UPDATE thangka.artists SET content_revision=2", [], "23514");
  const event = await review();
  await rejects("UPDATE thangka.artworks SET review_status='verified',current_review_id=$1", [event], "23514");
  await rejects("UPDATE thangka.artists SET biography='Mixed change',review_status='pending'", [], "23514");
});
it("keeps review history immutable and rejects operator-supplied snapshots, times and ordering", async () => {
  await review();
  for (const sql of ["UPDATE thangka.archive_reviews SET reviewer='Replacement'", "DELETE FROM thangka.archive_reviews", "TRUNCATE thangka.archive_reviews CASCADE"]) await rejects(sql, [], "55000");
  for (const [field, value] of [["snapshot", "'{}'::jsonb"], ["reviewed_at", "clock_timestamp()"], ["decision_order", "999999"]]) {
    await rejects(`INSERT INTO thangka.archive_reviews(artist_id,content_revision,decision,reviewer,${field}) VALUES($1,1,'verified','Forged',${value})`, [id(1)], "23514");
  }
  expect((await db.query("SELECT reviewer FROM thangka.archive_reviews")).rows).toEqual([{ reviewer: "Synthetic reviewer" }]);
});
it("rejects invalid review inputs atomically while accepting an explicit null previous decision", async () => {
  for (const [entity, revision, decision, reviewer] of [["source", 1, "verified", "A"], ["artist", 0, "verified", "A"], ["artist", 1, "other", "A"], ["artist", 1, "verified", "   "], [null, 1, "verified", "A"]]) {
    await rejects("SELECT thangka.record_archive_review($1,$2,$3,NULL,$4,$5)", [entity, id(1), revision, decision, reviewer], "22023");
  }
  await rejects("SELECT thangka.record_archive_review('artist',$1,1,NULL,'verified','A')", [id(999)], "22023");
  expect((await db.query("SELECT id FROM thangka.archive_reviews")).rows).toEqual([]);
  await review();
});
it("matches source-field allowlists to every supported business descriptor and rejects operational/invalid fields", async () => {
  for (const [link, target, fk, key] of [["artist_sources", "artists", "artist_id", id(1)], ["artwork_sources", "artworks", "artwork_id", id(2)], ["image_sources", "images", "image_id", id(3)]] as const) {
    for (const field of ["", ...Object.keys(archiveColumns[target]).filter((f) => !isArchiveReviewField(f))]) {
      await db.query(`INSERT INTO thangka.${link}(${fk},source_id,supported_field) VALUES($1,$2,$3)`, [key, id(4), field]);
    }
    for (const field of ["name_typo", " title ", "content_revision", "current_review_id", target === "artists" ? "title" : "display_name"]) {
      await rejects(`INSERT INTO thangka.${link}(${fk},source_id,supported_field) VALUES($1,$2,$3)`, [key, id(4), field], "23514");
    }
  }
});
it("accepts empty and literal string arrays while rejecting null members and nested arrays for every array field", async () => {
  for (const [table, columns] of Object.entries(archiveColumns)) for (const [column, spec] of Object.entries(columns)) if (spec.kind === "text[]") {
    await db.exec(`UPDATE thangka.${table} SET ${column}=ARRAY[]::text[]`);
    await db.exec(`UPDATE thangka.${table} SET ${column}=ARRAY['NULL','中文','མི་']::text[]`);
    await rejects(`UPDATE thangka.${table} SET ${column}=ARRAY['valid',NULL]::text[]`, [], "23514");
    await rejects(`UPDATE thangka.${table} SET ${column}=ARRAY[['one','two'],['three','four']]::text[]`, [], "23514");
  }
});
it("denies all new operational authority to anonymous/authenticated callers and keeps business reads", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`SET LOCAL ROLE ${role}`);
    try {
      await rejects("SELECT * FROM thangka.archive_reviews", [], "42501");
      await rejects("SELECT nextval('thangka.archive_review_order')", [], "42501");
      await rejects("SELECT thangka.record_archive_review('artist',$1,1,NULL,'verified','Visitor')", [id(1)], "42501");
      if (role === "anon") expect((await db.query("SELECT display_name FROM thangka.artists")).rows).toHaveLength(1);
    } finally { await db.exec("RESET ROLE"); }
  }
  const functions = (await db.query<{ prosecdef: boolean; proconfig: string[]; public_execute: boolean }>(`SELECT p.prosecdef,p.proconfig,
    EXISTS(SELECT 1 FROM aclexplode(COALESCE(p.proacl,acldefault('f',p.proowner))) a WHERE a.grantee=0 AND a.privilege_type='EXECUTE') AS public_execute
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='thangka' AND p.proname LIKE '%archive%' AND p.proname <> 'search_archive_candidates'`)).rows;
  expect(functions).toHaveLength(5);
  for (const f of functions) { expect(f.prosecdef).toBe(false); expect(f.proconfig).toContain('search_path=""'); expect(f.public_execute).toBe(false); }
});

it("migrates the preserved baseline without altering IDs/data and matches fresh initialization", async () => {
  const legacy = new PGlite();
  try {
    await legacy.exec("CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN");
    await legacy.exec(await readFile("tests/fixtures/archive-schema-before-quality.sql", "utf8"));
    await legacy.query("INSERT INTO thangka.artists(id,display_name,collected_by) VALUES($1,'Preserved pending artist','Original collector')", [id(999)]);
    await legacy.exec(migration);
    expect((await legacy.query("SELECT id,display_name,collected_by,content_revision,current_review_id FROM thangka.artists")).rows).toEqual([{ id: id(999), display_name: "Preserved pending artist", collected_by: "Original collector", content_revision: 1, current_review_id: null }]);
    const sql = `SELECT table_name,column_name,udt_name,is_nullable,column_default FROM information_schema.columns WHERE table_schema='thangka' ORDER BY table_name,column_name`;
    expect((await legacy.query(sql)).rows).toEqual((await db.query(sql)).rows);
    expect((await legacy.query("SELECT tablename,policyname FROM pg_policies WHERE schemaname='thangka'")).rows).toEqual([]);
    await legacy.exec(await readFile("database/migrations/20261016_archive_search.sql", "utf8"));
    await legacy.exec(await readFile("database/migrations/20261016_archive_read_access.sql", "utf8"));
    const definitions = `SELECT c.relname,pg_get_constraintdef(k.oid) AS definition FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='thangka' ORDER BY c.relname,definition`;
    expect((await legacy.query(definitions)).rows).toEqual((await db.query(definitions)).rows);
  } finally { await legacy.close(); }
}, 20_000);
it("rolls back incompatible legacy review states instead of fabricating historical reviewers", async () => {
  const legacy = new PGlite();
  try {
    await legacy.exec(await readFile("tests/fixtures/archive-schema-before-quality.sql", "utf8"));
    await legacy.exec("INSERT INTO thangka.artists(display_name,review_status) VALUES('Legacy disputed','disputed')");
    await expect(legacy.exec(migration)).rejects.toThrow("Reconcile legacy verified/disputed");
    await legacy.exec("ROLLBACK");
    expect((await legacy.query("SELECT review_status FROM thangka.artists")).rows).toEqual([{ review_status: "disputed" }]);
    expect((await legacy.query("SELECT column_name FROM information_schema.columns WHERE table_schema='thangka' AND column_name='content_revision'")).rows).toEqual([]);
  } finally { await legacy.close(); }
}, 20_000);
it("rejects incompatible legacy arrays and citation fields without rewriting collected values", async () => {
  const legacy = new PGlite();
  try {
    await legacy.exec(await readFile("tests/fixtures/archive-schema-before-quality.sql", "utf8"));
    await legacy.query("INSERT INTO thangka.artists(id,display_name,aliases) VALUES($1,'Legacy artist',ARRAY['valid',NULL])", [id(1)]);
    for (const value of ["ARRAY['valid',NULL]::text[]", "ARRAY[['one','two']]::text[]"]) {
      await legacy.exec(`UPDATE thangka.artists SET aliases=${value}`);
      await expect(legacy.exec(migration)).rejects.toMatchObject({ code: "23514" });
      await legacy.exec("ROLLBACK");
      expect((await legacy.query("SELECT column_name FROM information_schema.columns WHERE table_schema='thangka' AND column_name='content_revision'")).rows).toEqual([]);
    }
    await legacy.exec("UPDATE thangka.artists SET aliases='{}'");
    await legacy.query("INSERT INTO thangka.sources(id,title) VALUES($1,'Legacy source')", [id(4)]);
    await legacy.query("INSERT INTO thangka.artist_sources(artist_id,source_id,supported_field) VALUES($1,$2,'birth_peroid_text')", [id(1), id(4)]);
    await expect(legacy.exec(migration)).rejects.toMatchObject({ code: "23514" });
    await legacy.exec("ROLLBACK");
    expect((await legacy.query("SELECT supported_field FROM thangka.artist_sources")).rows).toEqual([{ supported_field: "birth_peroid_text" }]);
  } finally { await legacy.close(); }
}, 20_000);
it.each(["routine_collision", "inherited_execution"])("stops on %s without rewriting unknown privilege intent", async (mode) => {
  const legacy = new PGlite();
  try {
    await legacy.exec("CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN");
    await legacy.exec(await readFile("tests/fixtures/archive-schema-before-quality.sql", "utf8"));
    if (mode === "routine_collision") {
      await legacy.exec("CREATE FUNCTION thangka.record_archive_review(integer) RETURNS integer LANGUAGE SQL AS 'SELECT 1'");
      await expect(legacy.exec(migration)).rejects.toThrow("existing maintenance routines");
      await legacy.exec("ROLLBACK");
      expect((await legacy.query<{ allowed: boolean }>("SELECT has_function_privilege('anon','thangka.record_archive_review(integer)','EXECUTE') AS allowed")).rows[0].allowed).toBe(true);
    } else {
      await legacy.exec("CREATE ROLE visitor_parent NOLOGIN; GRANT visitor_parent TO anon; ALTER DEFAULT PRIVILEGES IN SCHEMA thangka GRANT EXECUTE ON FUNCTIONS TO visitor_parent");
      await expect(legacy.exec(migration)).rejects.toThrow("inherited maintenance execution");
      await legacy.exec("ROLLBACK");
    }
    expect((await legacy.query("SELECT column_name FROM information_schema.columns WHERE table_schema='thangka' AND column_name='content_revision'")).rows).toEqual([]);
  } finally { await legacy.close(); }
}, 20_000);
