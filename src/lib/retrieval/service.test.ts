// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { retrieveArchive } from "./service";
import { archiveColumns, type ArchiveTable } from "./database";
import { archiveId as id, archiveRow as row } from "../../../tests/fixtures/archive";

const query = {kind:"search",entity:"artist",filters:[{field:"name",value:"画师",mode:"contains"}],limit:1};
const hit = (n=1) => ({id:id(n),rank:0,matches:[{field:"name",column:"display_name",mode:"exact"}]});
let tables: Record<ArchiveTable, Record<string, unknown>[]>;
let hits: unknown;
let requests: {url:URL; init:RequestInit}[];
let overrides: Partial<Record<ArchiveTable | "rpc", () => Response | Promise<Response>>>;
function response(data: unknown, status=200) { return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json"}}); }
beforeEach(()=>{
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL","https://archive.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY","sb_publishable_synthetic_fixture");
  tables={ artists:[row("artists",{id:id(1),display_name:"画师",review_status:"disputed",notes:"Preserve uncertainty"})],
    artworks:[row("artworks",{id:id(2),title:"作品",attribution_status:"unknown",creation_period_text:"约十九世纪"})],
    artwork_artists:[row("artwork_artists",{artist_id:id(1),artwork_id:id(2),role:"creator"}),row("artwork_artists",{artist_id:id(1),artwork_id:id(2),role:"collaborator",attribution_status:"disputed"})],
    images:[row("images",{id:id(3),artwork_id:id(2),is_primary:false,rights_status:"copyrighted"})],
    sources:[row("sources",{id:id(4),title:"Same title"}),row("sources",{id:id(5),title:"Same title"})],
    artist_sources:[row("artist_sources",{id:id(6),artist_id:id(1),source_id:id(4),supported_field:"",locator:""})],
    artwork_sources:[row("artwork_sources",{id:id(7),artwork_id:id(2),source_id:id(4),supported_field:"title",locator:"12"})],
    image_sources:[row("image_sources",{id:id(8),image_id:id(3),source_id:id(5),evidence_notes:"Conflicting source"})] };
  hits=[hit()]; requests=[]; overrides={};
  vi.stubGlobal("fetch",vi.fn(async (input: RequestInfo | URL, init:RequestInit={}) => {
    const url=new URL(String(input)); requests.push({url,init});
    if(url.pathname.includes("/rpc/")) return overrides.rpc ? overrides.rpc() : response(hits);
    const table=url.pathname.split("/").pop() as ArchiveTable;
    if(overrides[table]) return overrides[table]!();
    let rows=tables[table];
    for(const [key,value] of url.searchParams) if(value.startsWith("in.(")) {
      const ids=value.slice(4,-1).split(",").map(v=>v.replaceAll('"',''));
      rows=rows.filter(r=>ids.includes(String(r[key])));
    }
    return response(rows.slice(0,Number(url.searchParams.get("limit"))));
  }));
});
afterEach(()=>{vi.useRealTimers();});

describe("archive service over the real Supabase HTTP client",()=>{
  it("expands the finite evidence graph while preserving original identities, states and scoped links",async()=>{
    const result=await retrieveArchive(query);
    expect(result.status).toBe("matched");
    if(result.status!=="matched") return;
    expect(result).toMatchObject({traversal:"root-associations-v1",evidenceCompleteForReturnedGraph:true,candidateLimitReached:false});
    expect(result.graph.artworkArtists).toHaveLength(2);
    expect(result.graph.artworkArtists[0]).not.toHaveProperty("id");
    expect(result.graph.sources.map(s=>s.id)).toEqual([id(4),id(5)]);
    expect(result.graph.sourceLinks).toHaveLength(3);
    expect(result.graph.sourceLinks[0]).toMatchObject({entity:"artist",entityId:id(1),row:{id:id(6),source_id:id(4),supported_field:"",locator:""}});
    expect(result.graph.artists[0]).toMatchObject({review_status:"disputed",notes:"Preserve uncertainty"});
    expect(result.graph.artworks[0]).toMatchObject({attribution_status:"unknown",creation_period_text:"约十九世纪"});
    expect(result.graph.images[0]).toMatchObject({is_primary:false,rights_status:"copyrighted"});
    expect(requests).toHaveLength(9);
    expect(requests.filter(r=>r.url.pathname.endsWith("artwork_artists"))).toHaveLength(1);
    for(const {url,init} of requests) {
      expect(init.cache).toBe("no-store"); expect(init.signal).toBeInstanceOf(AbortSignal);
      const headers=new Headers(init.headers);
      expect(headers.get("cookie")).toBeNull();
      expect(headers.get(init.method==="POST"?"content-profile":"accept-profile")).toBe("thangka");
      if(url.pathname.includes("/rpc/")) {
        expect(JSON.parse(String(init.body))).toEqual({p_entity:"artist",p_filters:query.filters,p_limit:1});
      } else {
        expect(init.method).toBe("GET");
        const table=url.pathname.split("/").pop() as ArchiveTable;
        expect(url.searchParams.get("select")?.split(",")).toEqual(Object.keys(archiveColumns[table]));
        expect(url.searchParams.has("limit")).toBe(true);
      }
    }
  });
  it("probes roots without expanding the probe and preserves candidate order",async()=>{
    hits=[hit(),hit(9)];
    const result=await retrieveArchive(query);
    expect(result).toMatchObject({status:"matched",candidateLimitReached:true,candidates:[{id:id(1)}]});
    expect(requests.find(r=>r.url.pathname.endsWith("artists"))?.url.searchParams.get("id")).not.toContain(id(9));
  });
  it("supports artwork roots without recursively following counterpart artists",async()=>{
    const result=await retrieveArchive({kind:"lookup",entity:"artwork",id:id(2)});
    expect(result).toMatchObject({status:"matched",candidates:[{id:id(2),matches:[{field:"id",column:"id",mode:"exact"}]}]});
    expect(requests.some(r=>r.url.pathname.includes("/rpc/"))).toBe(false);
    expect(requests.filter(r=>r.url.pathname.endsWith("artwork_artists"))).toHaveLength(1);
  });
  it.each(["search","lookup"])("returns honest no_matches for an empty %s",async(kind)=>{
    tables.artists=[]; hits=[];
    expect(await retrieveArchive(kind==="search"?query:{kind,entity:"artist",id:id(1)})).toMatchObject({status:"no_matches",candidates:[],candidateLimitReached:false});
    expect(requests).toHaveLength(1);
  });
  it("accepts a record with no relationships or sources",async()=>{
    tables.artwork_artists=[]; tables.artist_sources=[];
    expect(await retrieveArchive(query)).toMatchObject({status:"matched",graph:{artworks:[],images:[],sourceLinks:[],sources:[]}});
  });
  it.each([null,"pending","verified","disputed"])("does not exclude review state %s",async(review_status)=>{
    tables.artists[0].review_status=review_status;
    expect(await retrieveArchive(query)).toMatchObject({status:"matched",graph:{artists:[{review_status}]}});
  });
  it("rejects invalid input before configuration or network access",async()=>{
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL","");
    expect(await retrieveArchive({...query,limit:11})).toEqual({status:"error",error:{code:"invalid_query"}});
    expect(requests).toEqual([]);
  });
  it.each(["","bad","ftp://archive.test","https://user:password@archive.test"])("reports invalid configuration %s",async(url)=>{
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL",url);
    expect(await retrieveArchive(query)).toEqual({status:"error",error:{code:"configuration_error"}});
    expect(requests).toEqual([]);
  });
  it.each(["artists","artworks","sources"] as const)("fails without partial evidence for missing %s",async(table)=>{
    tables[table]=[];
    expect(await retrieveArchive(query)).toEqual({status:"error",error:{code:"data_incomplete"}});
  });
  it.each([["42501",403,"access_denied"],["PGRST202",404,"schema_mismatch"],["42703",400,"schema_mismatch"],["unknown",500,"query_failed"]])("maps %s safely",async(code,status,expected)=>{
    overrides.rpc=()=>response({code,message:"sensitive SQL and token"},Number(status));
    expect(await retrieveArchive(query)).toEqual({status:"error",error:{code:expected}});
  });
  it("does not automatically retry a retryable HTTP failure",async()=>{
    overrides.artists=()=>response({code:"unavailable"},503);
    expect(await retrieveArchive(query)).toMatchObject({status:"error",error:{code:"query_failed"}});
    expect(requests.filter(r=>r.url.pathname.endsWith("artists"))).toHaveLength(1);
  });
  it.each(["", "bad key", "sb_secret_privileged", `e30.${Buffer.from(JSON.stringify({role:"service_role"})).toString("base64url")}.test`])("rejects missing/malformed/elevated public key %s",async(key)=>{
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",key);
    expect(await retrieveArchive(query)).toEqual({status:"error",error:{code:"configuration_error"}});
    expect(requests).toHaveLength(0);
  });
  it("accepts a legacy anon key without treating its payload as user authority",async()=>{
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",`e30.${Buffer.from(JSON.stringify({role:"anon"})).toString("base64url")}.test`);
    expect(await retrieveArchive(query)).toMatchObject({status:"matched"});
  });
  it("returns query_failed for an unresponsive network without retrying",async()=>{
    overrides.rpc=()=>{throw new TypeError("network failed");};
    expect(await retrieveArchive(query)).toEqual({status:"error",error:{code:"query_failed"}});
    expect(requests).toHaveLength(1);
  });
  it("fails a late evidence query rather than returning the earlier graph",async()=>{
    overrides.image_sources=()=>response({code:"42501"},403);
    expect(await retrieveArchive(query)).toEqual({status:"error",error:{code:"access_denied"}});
  });
  it.each([null,[{id:id(1),rank:0,matches:[]}],[hit(),hit()], [{...hit(),rank:99}]])("rejects malformed candidates %j",async(data)=>{
    hits=data;
    expect(await retrieveArchive(query)).toMatchObject({status:"error",error:{code:"schema_mismatch"}});
  });
  it("rejects incompatible projected row shape",async()=>{
    delete tables.artists[0].aliases;
    expect(await retrieveArchive(query)).toMatchObject({status:"error",error:{code:"schema_mismatch"}});
  });
  it("rejects association overflow without silently slicing it",async()=>{
    overrides.artwork_artists=()=>response(Array.from({length:101},(_,n)=>row("artwork_artists",{artist_id:id(1),artwork_id:id(100+n)})));
    expect(await retrieveArchive(query)).toMatchObject({status:"error",error:{code:"budget_exceeded"}});
  });
  it("detects entity graph overflow from artwork images",async()=>{
    tables.images=Array.from({length:99},(_,n)=>row("images",{id:id(100+n),artwork_id:id(2)}));
    expect(await retrieveArchive(query)).toMatchObject({status:"error",error:{code:"budget_exceeded"}});
  });
  it("detects source link overflow across owner kinds",async()=>{
    tables.artist_sources=Array.from({length:200},(_,n)=>row("artist_sources",{id:id(100+n),artist_id:id(1),source_id:id(4)}));
    expect(await retrieveArchive(query)).toMatchObject({status:"error",error:{code:"budget_exceeded"}});
  });
  it("detects distinct source overflow even within the link cap",async()=>{
    tables.artist_sources=Array.from({length:101},(_,n)=>row("artist_sources",{id:id(100+n),artist_id:id(1),source_id:id(300+n)}));
    expect(await retrieveArchive(query)).toMatchObject({status:"error",error:{code:"budget_exceeded"}});
  });
  it("rejects a streamed oversized raw response before parsing JSON",async()=>{
    overrides.rpc=()=>new Response(new ReadableStream({start(c){ c.enqueue(new Uint8Array(1_000_000)); c.enqueue(new Uint8Array(1_000_001)); c.close(); }}));
    expect(await retrieveArchive(query)).toMatchObject({status:"error",error:{code:"budget_exceeded"}});
  });
  it("rejects an oversized final graph assembled from individually valid responses",async()=>{
    tables.artists[0].notes="x".repeat(1_100_000);
    tables.artworks[0].notes="x".repeat(1_100_000);
    expect(await retrieveArchive(query)).toMatchObject({status:"error",error:{code:"budget_exceeded"}});
  });
  it("honors pre-abort without making a request",async()=>{
    const controller=new AbortController(); controller.abort();
    expect(await retrieveArchive(query,{signal:controller.signal})).toEqual({status:"error",error:{code:"aborted"}});
    expect(requests).toHaveLength(0);
  });
  it("settles deadline even when transport ignores abort, and ignores a late success",async()=>{
    vi.useFakeTimers();
    let finish!: (r:Response)=>void;
    overrides.rpc=()=>new Promise(resolve=>{finish=resolve;});
    const pending=retrieveArchive(query);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(await pending).toEqual({status:"error",error:{code:"timeout"}});
    expect(requests[0].init.signal?.aborted).toBe(true);
    finish(response([hit()]));
    await vi.advanceTimersByTimeAsync(1);
    expect(requests).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("cancels an in-flight query and removes the caller listener",async()=>{
    const controller=new AbortController();
    const remove=vi.spyOn(controller.signal,"removeEventListener");
    overrides.rpc=()=>new Promise(()=>{});
    const pending=retrieveArchive(query,{signal:controller.signal});
    await new Promise(resolve=>setTimeout(resolve,0));
    controller.abort();
    expect(await pending).toEqual({status:"error",error:{code:"aborted"}});
    expect(remove).toHaveBeenCalledWith("abort",expect.any(Function));
  });
});
