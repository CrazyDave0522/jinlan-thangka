// @vitest-environment node
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterEach, expect, it } from "vitest";
import { archiveColumns } from "./database";
import { parseRows, projection } from "./rows";

const schema = await readFile("database/schema.sql", "utf8");
const migration = await readFile("database/migrations/20261018_remove_image_thumbnail.sql", "utf8");
const databases: PGlite[] = [];
afterEach(async () => { await Promise.all(databases.splice(0).map((db) => db.close())); });
async function database(legacy = false) {
  const db = new PGlite(); databases.push(db);
  await db.exec(schema);
  if (legacy) await db.exec("ALTER TABLE thangka.images ADD COLUMN thumbnail_locator text");
  await db.exec("CREATE ROLE anon NOLOGIN");
  await db.exec(await readFile("database/migrations/20261016_archive_search.sql", "utf8"));
  await db.exec(await readFile("database/migrations/20261016_archive_read_access.sql", "utf8"));
  return db;
}
async function metadata(db: PGlite) {
  return (await db.query<{ table_name: string; column_name: string; udt_name: string; is_nullable: string; column_default: string | null }>(`SELECT table_name,column_name,udt_name,is_nullable,column_default
    FROM information_schema.columns WHERE table_schema='thangka' ORDER BY table_name,column_name`)).rows;
}
async function readable(db: PGlite) {
  await db.exec("SET ROLE anon");
  try {
    for (const table of Object.keys(archiveColumns) as (keyof typeof archiveColumns)[]) {
      expect(parseRows(table, (await db.query(`SELECT ${projection(table)} FROM thangka.${table}`)).rows)).toEqual([]);
    }
    expect((await db.query("SELECT * FROM thangka.search_archive_candidates('artwork','[{\"field\":\"name\",\"mode\":\"exact\",\"value\":\"missing\"}]',5)")).rows).toEqual([]);
    await expect(db.exec("INSERT INTO thangka.artworks(title) VALUES('forbidden')")).rejects.toMatchObject({ code: "42501" });
  } finally { await db.exec("RESET ROLE"); }
}
it("keeps the new reader compatible before and after deletion and matches fresh initialization", async () => {
  const legacy = await database(true), fresh = await database();
  await readable(legacy);
  await legacy.exec(migration);
  await readable(legacy);
  expect(await metadata(legacy)).toEqual(await metadata(fresh));
  expect(projection("images")).not.toContain("thumbnail_locator");
  expect((await metadata(legacy)).filter((r) => r.table_name === "images")).toHaveLength(22);
}, 20_000);
it("refuses populated image records without discarding their thumbnail or changing schema", async () => {
  const db = await database(true);
  await db.exec(`INSERT INTO thangka.artworks(id,title) VALUES('00000000-0000-0000-0000-000000000001','Synthetic artwork');
    INSERT INTO thangka.images(artwork_id,storage_locator,thumbnail_locator)
    VALUES('00000000-0000-0000-0000-000000000001','original.png','thumbnail.png')`);
  await expect(db.exec(migration)).rejects.toThrow("empty images table");
  await db.exec("ROLLBACK");
  expect((await db.query("SELECT storage_locator,thumbnail_locator FROM thangka.images")).rows).toEqual([{ storage_locator: "original.png", thumbnail_locator: "thumbnail.png" }]);
});
it("preserves dependent objects by failing instead of cascading their deletion", async () => {
  const db = await database(true);
  await db.exec("CREATE VIEW thangka.thumbnail_dependency AS SELECT thumbnail_locator FROM thangka.images");
  await expect(db.exec(migration)).rejects.toMatchObject({ code: "2BP01" });
  await db.exec("ROLLBACK");
  expect((await db.query("SELECT * FROM thangka.thumbnail_dependency")).rows).toEqual([]);
  expect((await metadata(db)).some((r) => r.table_name === "images" && r.column_name === "thumbnail_locator")).toBe(true);
});
it("fails closed on an unexpected schema or a second application", async () => {
  const db = await database(true);
  await db.exec("ALTER TABLE thangka.images ALTER COLUMN thumbnail_locator TYPE integer USING NULL::integer");
  await expect(db.exec(migration)).rejects.toThrow("original nullable text thumbnail");
  await db.exec("ROLLBACK; ALTER TABLE thangka.images ALTER COLUMN thumbnail_locator TYPE text");
  await db.exec(migration);
  await expect(db.exec(migration)).rejects.toThrow("original nullable text thumbnail");
  await db.exec("ROLLBACK");
});
