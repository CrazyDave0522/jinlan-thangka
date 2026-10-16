// @vitest-environment node
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { archiveColumns } from "./database";

const db = new PGlite();
const id = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const f = (field: string, value: string, mode = "contains") => ({ field, value, mode });
type Hit = { id: string; rank: number; matches: { field: string; column: string; mode: string }[] };
async function search(entity: string, filters: unknown, limit = 5) {
  return (await db.query<Hit>("SELECT * FROM thangka.search_archive_candidates($1,$2::jsonb,$3)", [entity, JSON.stringify(filters), limit])).rows;
}
beforeAll(async () => {
  await db.exec(await readFile("database/schema.sql", "utf8"));
  await db.exec("CREATE ROLE anon NOLOGIN;");
  await db.exec(await readFile("database/migrations/20261016_archive_search.sql", "utf8"));
  for (let i = 1; i <= 7; i++) {
    const values = ["Tara", "Other", "Other", "Tara painting", "Other", "Other", "Tara"];
    await db.query(`INSERT INTO thangka.artworks(id,title,title_en,alternative_titles,styles,subject_primary,subject_details,collection_name,accession_number,review_status)
      VALUES($1,$2,$3,$4::text[],$5::text[],$6,$7,$8,$9,$10)`,
      [id(i), values[i-1], i === 2 ? "TARA" : i === 5 ? "Tara image" : null,
        i === 3 ? ["tara"] : i === 6 ? ["Old Tara"] : [], ["Menri"], "绿度母", "慈悲", "Museum", "A%(1)_*,'\\", [null,"pending","verified","disputed"][i % 4]]);
  }
  await db.query("INSERT INTO thangka.artists(id,display_name,name_bo,name_en,aliases,styles) VALUES($1,$2,$3,$4,$5::text[],$6::text[])", [id(20),"画师", "མི་", "Artist", ["别名"], ["Menri"]]);
}, 30_000);
afterAll(async () => { await db.close(); });

describe("actual PostgreSQL candidate function", () => {
  it("orders all six tiers and same-name UUID ties, retaining all review states", async () => {
    const rows = await search("artwork", [f("name","tara")],10);
    expect(rows.map((r) => [r.id,r.rank])).toEqual([[id(1),0],[id(7),0],[id(2),1],[id(3),2],[id(4),3],[id(5),4],[id(6),5]]);
    expect(rows[2].matches).toEqual([{ field:"name", column:"title_en", mode:"exact" }]);
  });
  it("uses full-value exact mode and one extra candidate probe", async () => {
    expect((await search("artwork",[f("name","tara","exact")],10)).map((r)=>r.id)).toEqual([id(1),id(7),id(2),id(3)]);
    expect(await search("artwork",[f("name","tara")],1)).toHaveLength(2);
    expect(await search("artwork",[f("name","missing")])).toEqual([]);
  });
  it.each([
    ["artist", "name", "画师", "display_name"], ["artist","name","མི་","name_bo"],
    ["artist","name","ARTIST","name_en"], ["artist","name","别名","aliases"],
    ["artist","style","menri","styles"], ["artwork","subject","绿度母","subject_primary"],
    ["artwork","subject","慈悲","subject_details"], ["artwork","style","MENRI","styles"],
    ["artwork","collection","museum","collection_name"], ["artwork","accession","A%(1)_*,'\\","accession_number"],
  ])("matches %s %s %s literally", async (entity, field, value, column) => {
    const rows = await search(entity,[f(field,value,"exact")],10);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].matches).toContainEqual({field,column,mode:"exact"});
  });
  it("combines filters with AND and scalar/array alternatives with OR", async () => {
    expect(await search("artwork",[f("name","tara"),f("style","absent")])).toEqual([]);
    expect((await search("artwork",[f("name","tara"),f("style","menri"),f("subject","慈悲")],10))[0].rank).toBe(2);
    expect(await search("artwork",[f("accession","Axx1")])).toEqual([]);
  });
  it.each([
    ["artist",[]], ["image",[f("name","x")]], ["artist",[f("subject","x")]],
    ["artwork",[f("name","")]], ["artwork",[f("name","x"),f("name","y")]],
    ["artwork",[f("name","x\n")]], ["artwork",[{...f("name","x"),sql:"x"}]],
    ["artwork",[f("name","x".repeat(201))]], ["artwork",[f("name","x","fuzzy")]],
    ["artwork",[null]], ["artwork",{}], ["artwork",[f("name","\u0085")]],
  ])("rejects invalid RPC input %j %j", async (entity,filters) => {
    await expect(search(entity as string,filters)).rejects.toMatchObject({code:"22023"});
  });
  it.each([0,11])("rejects RPC limit %i", async (limit) => {
    await expect(search("artist",[f("name","x")],limit)).rejects.toMatchObject({code:"22023"});
  });
  it("matches the supplied schema field types/nullability without inventing columns", async () => {
    const {rows} = await db.query<{table_name:string;column_name:string;udt_name:string;is_nullable:string}>("SELECT table_name,column_name,udt_name,is_nullable FROM information_schema.columns WHERE table_schema='thangka'");
    const kinds:Record<string,string> = { uuid:"uuid", text:"text", "text[]":"_text", integer:"int4",numeric:"numeric",bigint:"int8",boolean:"bool",date:"date",timestamptz:"timestamptz" };
    expect(rows.length).toBe(Object.values(archiveColumns).reduce((n,t)=>n+Object.keys(t).length,0));
    for (const [table,cols] of Object.entries(archiveColumns)) for (const [column,spec] of Object.entries(cols)) {
      expect(rows.find((r)=>r.table_name===table && r.column_name===column)).toMatchObject({ udt_name:kinds[spec.kind],is_nullable:spec.nullable?"YES":"NO" });
    }
  });
  it("respects invoker RLS and exact grants, without anonymous writes", async () => {
    const setup = await readFile("database/migrations/20261016_archive_read_access.sql","utf8");
    await db.exec("GRANT INSERT ON thangka.artists TO anon");
    await expect(db.exec(setup)).rejects.toThrow("Reconcile existing anon write grants");
    await db.exec("ROLLBACK; REVOKE INSERT ON thangka.artists FROM anon");
    await db.exec(setup);
    await expect(db.exec(setup)).rejects.toThrow("Review existing thangka policies");
    await db.exec("ROLLBACK");
    await db.exec("SET ROLE anon");
    try {
      expect(await search("artist",[f("name","画师")])).toHaveLength(1);
      await expect(db.exec("INSERT INTO thangka.artists(display_name) VALUES('unwanted')")).rejects.toMatchObject({code:"42501"});
    } finally { await db.exec("RESET ROLE"); }
    await db.exec("ALTER POLICY archive_retrieval_select ON thangka.artists USING (false); SET ROLE anon;");
    try { expect(await search("artist",[f("name","画师")])).toEqual([]); }
    finally { await db.exec("RESET ROLE"); }
    const {rows} = await db.query<{prosecdef:boolean;provolatile:string;proconfig:string[]}>("SELECT prosecdef,provolatile,proconfig FROM pg_proc WHERE oid='thangka.search_archive_candidates(text,jsonb,integer)'::regprocedure");
    expect(rows[0]).toMatchObject({prosecdef:false,provolatile:"s"});
    expect(rows[0].proconfig).toContain('search_path=""');
  });
});
