// Isolated PostgreSQL 17 lock/restore checks; never reads project service credentials.
import assert from "node:assert/strict";
import { readFile, mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { randomUUID, createHash } from "node:crypto";
import EmbeddedPostgres from "embedded-postgres";
import { archiveColumns, isArchiveReviewField } from "../src/lib/retrieval/database.ts";

const socket = createServer();
await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
const port = socket.address().port;
await new Promise((resolve) => socket.close(resolve));
const directory = await mkdtemp(join(tmpdir(), "archive-quality-pg-"));
const server = new EmbeddedPostgres({
  databaseDir: directory, user: "postgres", password: randomUUID(), port,
  persistent: false, createPostgresUser: false,
  postgresFlags: ["-h", "127.0.0.1", "-k", directory],
  onLog: () => {}, onError: () => {},
});
const clients = [];
const results = [];
const id = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const sql = "SELECT thangka.record_archive_review('artist',$1,$2,$3,$4,'Synthetic concurrency reviewer') AS id";
const schema = await readFile("database/schema.sql", "utf8");
const setup = [await readFile("database/migrations/20261016_archive_search.sql", "utf8"), await readFile("database/migrations/20261016_archive_read_access.sql", "utf8")];
async function connect(database = "postgres") {
  const client = server.getPgClient(database, "127.0.0.1");
  await client.connect(); clients.push(client);
  await client.query("SET statement_timeout='10s'");
  return client;
}
async function waitForLock(control, pid) {
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    const row = (await control.query("SELECT wait_event_type FROM pg_stat_activity WHERE pid=$1", [pid])).rows[0];
    if (row?.wait_event_type === "Lock") return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error("The second independent session did not enter the expected lock wait");
}
function pending(query) {
  return query.then((result) => ({ result }), (error) => ({ error }));
}
async function seed(control, n) {
  await control.query("INSERT INTO thangka.artists(id,display_name,collected_by) VALUES($1,'Synthetic concurrent artist','Synthetic collector')", [id(n)]);
}
async function state(control, n) {
  return (await control.query("SELECT content_revision,current_review_id,review_status,biography FROM thangka.artists WHERE id=$1", [id(n)])).rows[0];
}
async function begin(a, b) { await a.query("BEGIN"); await b.query("BEGIN"); }
function pass(name) { results.push(name); process.stdout.write(`PASS ${name}\n`); }

try {
  await server.initialise(); await server.start();
  const control = await connect(), a = await connect(), b = await connect();
  const version = (await control.query("SHOW server_version")).rows[0].server_version;
  assert.match(version, /^17\./);
  const pidB = (await b.query("SELECT pg_backend_pid() AS pid")).rows[0].pid;
  await control.query("CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN");
  await control.query(schema);
  for (const artifact of setup) await control.query(artifact);

  await seed(control, 1); await begin(a, b);
  await a.query("UPDATE thangka.artists SET biography='Committed edit' WHERE id=$1", [id(1)]);
  let waiting = pending(b.query(sql, [id(1), 1, null, "verified"]));
  await waitForLock(control, pidB); await a.query("COMMIT");
  assert.equal((await waiting).error?.code, "40001"); await b.query("ROLLBACK");
  assert.equal((await state(control, 1)).content_revision, 2);
  pass("edit commits before waiting stale review");

  await seed(control, 2); await begin(a, b);
  const first = (await a.query(sql, [id(2), 1, null, "verified"])).rows[0].id;
  waiting = pending(b.query("UPDATE thangka.artists SET biography='Later edit' WHERE id=$1", [id(2)]));
  await waitForLock(control, pidB); await a.query("COMMIT");
  assert.equal((await waiting).error, undefined); await b.query("COMMIT");
  assert.deepEqual(await state(control, 2), { content_revision: 2, current_review_id: null, review_status: "pending", biography: "Later edit" });
  assert.equal((await control.query("SELECT snapshot->>'biography' AS biography FROM thangka.archive_reviews WHERE id=$1", [first])).rows[0].biography, null);
  pass("review commits before waiting edit without approving the edited content");

  await seed(control, 3); await begin(a, b);
  await a.query(sql, [id(3), 1, null, "verified"]);
  waiting = pending(b.query(sql, [id(3), 1, null, "disputed"]));
  await waitForLock(control, pidB); await a.query("COMMIT");
  assert.equal((await waiting).error?.code, "40001"); await b.query("ROLLBACK");
  assert.equal((await state(control, 3)).review_status, "verified");
  pass("competing first decisions compare null previous decision safely");

  await seed(control, 4); await begin(a, b);
  const rolledBack = (await a.query(sql, [id(4), 1, null, "verified"])).rows[0].id;
  waiting = pending(b.query(sql, [id(4), 1, null, "disputed"]));
  await waitForLock(control, pidB); await a.query("ROLLBACK");
  assert.equal((await waiting).error, undefined); await b.query("COMMIT");
  assert.equal((await state(control, 4)).review_status, "disputed");
  assert.equal((await control.query("SELECT id FROM thangka.archive_reviews WHERE id=$1", [rolledBack])).rowCount, 0);
  pass("rolled-back first decision does not block the waiting valid review");

  await seed(control, 5);
  const base = (await control.query(sql, [id(5), 1, null, "verified"])).rows[0].id;
  await begin(a, b); await a.query(sql, [id(5), 1, base, "disputed"]);
  waiting = pending(b.query(sql, [id(5), 1, base, "pending"]));
  await waitForLock(control, pidB); await a.query("COMMIT");
  assert.equal((await waiting).error?.code, "40001"); await b.query("ROLLBACK");
  assert.equal((await state(control, 5)).review_status, "disputed");
  pass("competing later decisions cannot overwrite an unseen current decision");

  await seed(control, 6); await begin(a, b);
  await a.query("UPDATE thangka.artists SET biography='Uncommitted edit' WHERE id=$1", [id(6)]);
  waiting = pending(b.query(sql, [id(6), 1, null, "verified"]));
  await waitForLock(control, pidB); await a.query("ROLLBACK");
  assert.equal((await waiting).error, undefined); await b.query("COMMIT");
  assert.equal((await state(control, 6)).content_revision, 1);
  assert.equal((await state(control, 6)).biography, null);
  pass("rolled-back edit never appears in the waiting review snapshot");

  for (const [table, columns] of Object.entries(archiveColumns)) {
    const oldProjection = Object.keys(columns).filter((field) => !isArchiveReviewField(field)).join(",");
    await control.query(`SELECT ${oldProjection} FROM thangka.${table}`);
  }
  pass("post-thumbnail baseline reader remains compatible with additive review schema");

  const tables = [...Object.keys(archiveColumns).filter((t) => !["images", "artwork_artists", "artist_sources", "artwork_sources", "image_sources"].includes(t)), "images", "artwork_artists", "artist_sources", "artwork_sources", "image_sources", "archive_reviews"];
  const backup = {};
  for (const table of tables) backup[table] = (await control.query(`SELECT to_jsonb(t)::text AS payload FROM thangka.${table} t ORDER BY ${table === "archive_reviews" ? "decision_order" : "to_jsonb(t)::text"}`)).rows.map((r) => r.payload);
  const sequence = (await control.query("SELECT last_value::text,is_called FROM thangka.archive_review_order")).rows[0];
  const backupText = JSON.stringify({ backup, sequence });
  const backupSha256 = createHash("sha256").update(backupText).digest("hex");
  await mkdir("evaluation-results/archive-quality", { recursive: true });
  await writeFile("evaluation-results/archive-quality/restore-fixture.json", backupText);
  const savedText = await readFile("evaluation-results/archive-quality/restore-fixture.json", "utf8");
  assert.equal(createHash("sha256").update(savedText).digest("hex"), backupSha256);
  const saved = JSON.parse(savedText);
  await server.createDatabase("archive_restore");
  const restored = await connect("archive_restore");
  await restored.query(schema);
  for (const artifact of setup) await restored.query(artifact);
  await restored.query("BEGIN; SET CONSTRAINTS ALL DEFERRED");
  // Owner-only recovery in an isolated empty database; constraints remain enabled.
  for (const table of tables) await restored.query(`ALTER TABLE thangka.${table} DISABLE TRIGGER USER`);
  for (const table of tables) for (const payload of saved.backup[table]) await restored.query(`INSERT INTO thangka.${table} SELECT (jsonb_populate_record(NULL::thangka.${table},$1::jsonb)).*`, [payload]);
  await restored.query("SELECT setval('thangka.archive_review_order',$1::bigint,$2)", [saved.sequence.last_value, saved.sequence.is_called]);
  await restored.query("SET CONSTRAINTS ALL IMMEDIATE");
  for (const table of tables) await restored.query(`ALTER TABLE thangka.${table} ENABLE TRIGGER USER`);
  await restored.query("COMMIT");
  for (const table of tables) {
    const actual = (await restored.query(`SELECT to_jsonb(t)::text AS payload FROM thangka.${table} t ORDER BY ${table === "archive_reviews" ? "decision_order" : "to_jsonb(t)::text"}`)).rows.map((r) => r.payload);
    assert.deepEqual(actual, backup[table]);
  }
  await assert.rejects(restored.query("UPDATE thangka.archive_reviews SET reviewer='forged'"), { code: "55000" });
  pass("owner restore preserves exact snapshots, pointers, statuses and timestamps and reenables guards");
  await writeFile("evaluation-results/archive-quality/concurrency.json", JSON.stringify({ serverVersion: version, independentSessions: 3, cases: results, backupSha256, externalServices: false }, null, 2) + "\n");
  process.stdout.write(`${results.length} PostgreSQL ${version} concurrency/compatibility/restore checks passed.\n`);
} catch (error) {
  process.stderr.write(`${error.message}\n`); process.exitCode = 1;
} finally {
  await Promise.allSettled(clients.map((client) => client.query("ROLLBACK")));
  await Promise.allSettled(clients.map((client) => client.end()));
  await server.stop().catch(() => {});
}
