// @vitest-environment node
import sharp from "sharp";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { parseGrants, readReferences, rowDigest, selectReferences } from "./references";
import { createScope } from "@/lib/answers/runtime";
import { artworkResult, imagePlan, visitorRequest } from "../../../tests/fixtures/vision-archive";
import { buildGroups } from "./identity";
import { digest } from "./images";
import type { ReferenceConfiguration } from "./reference-manifest";
import { stable } from "@/lib/answers/catalogue";

const config = { url: "https://archive.fixture.test", key: "sb_publishable_reference_fixture" };
const scopes: ReturnType<typeof createScope>[] = [];
const scope = () => { const s = createScope(); scopes.push(s); return s; };
afterEach(() => { scopes.splice(0).forEach((s) => s.close()); vi.useRealTimers(); });
async function fixture(count = 1) {
  const bytes = await sharp({ create: { width: 4, height: 3, channels: 4, background: "#ac4488" } }).png().toBuffer();
  const result = artworkResult(Array.from({ length: count }, (_, n) => n + 1));
  result.graph.images = result.graph.images.map((r) => ({ ...r, sha256: digest(bytes) }));
  const manifest: ReferenceConfiguration = { version: 1, grants: result.graph.images.map((row) => ({ imageId: row.id, rowDigest: rowDigest(row), bucket: "fixtures", objectPath: `${row.id}.png`, contentSha256: digest(bytes), permissionReference: row.license_or_permission_reference!, aiProcessing: true, reviewedBy: "Synthetic reviewer", reviewedOn: "2026-10-17" })) };
  const plan = imagePlan(visitorRequest());
  const groups = buildGroups(plan, [result], result.graph);
  return { bytes, manifest, result, plan, groups, selection: selectReferences(plan.groups, groups, result.graph, manifest) };
}
it("pins deterministic full-row JSON and rejects malformed permissions/paths/dates", async () => {
  const f = await fixture();
  expect(JSON.parse(stable(f.result.graph.images[0]))).toEqual(f.result.graph.images[0]);
  for (const change of [{ aiProcessing: false }, { reviewedBy: "Two\nnames" }, { objectPath: "../escape.png" }, { objectPath: "https://evil.test/x.png" }, { objectPath: "x%2fy.png" }, { reviewedOn: "2026-02-30" }, { reviewedOn: "2026-13-99" }, { extra: true }]) expect(() => parseGrants({ ...f.manifest, grants: [{ ...f.manifest.grants[0], ...change }] })).toThrow("reference_unavailable");
  expect(() => parseGrants({ ...f.manifest, grants: [...f.manifest.grants, ...f.manifest.grants] })).toThrow();
  expect(parseGrants({ version: 1, grants: [] }).grants).toEqual([]);
});
it("does not fetch stale/denied grants or interpret arbitrary locator URLs as network authority", async () => {
  const f = await fixture();
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  f.result.graph.images[0] = { ...f.result.graph.images[0], storage_locator: "https://evil.test/private.png", updated_at: "2026-10-17T01:00:00+00:00" };
  const selected = selectReferences(f.plan.groups, f.groups, f.result.graph, f.manifest);
  expect(selected.tasks).toEqual([]); expect(selected.reasons.get("G1")).toContain("reference_not_authorized");
  expect(await readReferences(selected, scope())).toEqual([]); expect(fetch).not.toHaveBeenCalled();
});
it("downloads once through the actual stateless anon SDK and exposes only reference provenance", async () => {
  const f = await fixture();
  const fetch = vi.fn(async (url, init) => {
    expect(String(url)).toBe(`${config.url}/storage/v1/object/fixtures/${f.result.graph.images[0].id}.png`);
    expect(init).toMatchObject({ cache: "no-store", redirect: "error" });
    expect(new Headers(init.headers).get("apikey")).toBe(config.key);
    return new Response(f.bytes, { headers: { "Content-Type": "image/png" } });
  }); vi.stubGlobal("fetch", fetch);
  const read = await readReferences(f.selection, scope(), config);
  expect(fetch).toHaveBeenCalledTimes(1); expect(read[0].evidence.contentSha256).toBe(digest(f.bytes));
  expect(read[0].mimeType).toBe("image/png"); expect(Buffer.from(read[0].data, "base64").length).toBeLessThanOrEqual(500_000);
  expect(read[0]).not.toHaveProperty("grant");
});
it.each([[401, "reference_unavailable"], [403, "reference_unavailable"], [404, "reference_unavailable"], [302, "reference_unavailable"], [429, "reference_failed"], [503, "reference_failed"]])("maps HTTP %s without retries or credential fallback", async (status, code) => {
  const f = await fixture();
  const fetch = vi.fn(async () => new Response("private upstream detail", { status: status as number })); vi.stubGlobal("fetch", fetch);
  await expect(readReferences(f.selection, scope(), config)).rejects.toThrow(code as string);
  expect(fetch).toHaveBeenCalledTimes(1);
});
it("retains transient network failure and bounds declared/actual bytes before Blob decoding", async () => {
  const f = await fixture();
  const fetch = vi.fn().mockRejectedValueOnce(new Error("network")); vi.stubGlobal("fetch", fetch);
  await expect(readReferences(f.selection, scope(), config)).rejects.toThrow("reference_failed");
  fetch.mockResolvedValueOnce(new Response(f.bytes, { headers: { "Content-Length": "5000001", "Content-Type": "image/png" } }));
  await expect(readReferences(f.selection, scope(), config)).rejects.toThrow("reference_unavailable");
  const cancel = vi.fn();
  fetch.mockResolvedValueOnce(new Response(new ReadableStream({ start(c) { c.enqueue(new Uint8Array(5_000_000)); c.enqueue(new Uint8Array(1)); }, cancel }), { headers: { "Content-Type": "image/png" } }));
  await expect(readReferences(f.selection, scope(), config)).rejects.toThrow("reference_unavailable");
  expect(cancel).toHaveBeenCalledOnce(); expect(fetch).toHaveBeenCalledTimes(3);
});
it("requires the granted original digest, valid static bytes and matching declared MIME", async () => {
  const f = await fixture(), fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  fetch.mockResolvedValueOnce(new Response(Buffer.from("bad data"), { headers: { "Content-Type": "image/png" } }));
  await expect(readReferences(f.selection, scope(), config)).rejects.toThrow("reference_unavailable");
  fetch.mockResolvedValueOnce(new Response(f.bytes, { headers: { "Content-Type": "image/jpeg" } }));
  await expect(readReferences(f.selection, scope(), config)).rejects.toThrow("reference_unavailable");
  await expect(readReferences(f.selection, scope(), { ...config, key: "sb_secret_prohibited" })).rejects.toThrow("reference_unavailable");
  expect(fetch).toHaveBeenCalledTimes(2);
});
it("uses a shared five-second reference stage and prevents late download success", async () => {
  const f = await fixture(); vi.useFakeTimers();
  let resolve!: (r: Response) => void;
  const fetch = vi.fn(() => new Promise<Response>((done) => { resolve = done; })); vi.stubGlobal("fetch", fetch);
  const work = readReferences(f.selection, scope(), config);
  const assertion = expect(work).rejects.toThrow("generation_timeout");
  await vi.advanceTimersByTimeAsync(5000); await assertion;
  resolve(new Response(f.bytes)); await Promise.resolve(); expect(fetch).toHaveBeenCalledTimes(1);
});
it("round-robins at most four pairs while sharing one authorized image across groups", async () => {
  const f = await fixture(), plan = imagePlan(visitorRequest(4));
  const groups = buildGroups(plan, [f.result, f.result, f.result, f.result], f.result.graph);
  const selected = selectReferences(plan.groups, groups, f.result.graph, f.manifest);
  expect(selected.tasks.map((t) => t.groupId)).toEqual(["G1", "G2", "G3", "G4"]);
  expect(selected.tasks.map((t) => t.referenceKey)).toEqual(["R1", "R1", "R1", "R1"]);
  expect(selected.references).toHaveLength(1);
});
