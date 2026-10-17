import "server-only";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { AnswerFailure, exact } from "@/lib/answers/contracts";
import { stable, type Graph } from "@/lib/answers/catalogue";
import { createScope, type Scope } from "@/lib/answers/runtime";
import { archiveConfig, validateArchiveConfig } from "@/lib/supabase/archive-config";
import { imageHeader } from "@/lib/chat/image-policy";
import type { ImageRow } from "@/lib/retrieval/database";
import type { Group, GroupResult, Reason, ReferenceEvidence, VerificationTask } from "./types";
import { REFERENCE_CONFIGURATION, type ReferenceConfiguration, type ReferenceGrant } from "@/lib/vision/reference-manifest";
import { fail, prose, sha, uuid } from "./validation";
import { digest } from "./images";

export const rowDigest = (row: ImageRow) => digest(stable(row));
function calendarDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
export function parseGrants(value: unknown): ReferenceConfiguration {
  if (!exact(value, ["version", "grants"]) || value.version !== 1 || !Array.isArray(value.grants) || value.grants.length > 256) return fail("reference_unavailable");
  for (const grant of value.grants) {
    if (!exact(grant, ["imageId", "rowDigest", "bucket", "objectPath", "contentSha256", "permissionReference", "aiProcessing", "reviewedBy", "reviewedOn"]) || !uuid(grant.imageId) || !sha(grant.rowDigest) || !sha(grant.contentSha256) || typeof grant.bucket !== "string" || !/^[a-z0-9][a-z0-9-]{0,62}$/.test(grant.bucket) || typeof grant.objectPath !== "string" || grant.objectPath.length > 512 || !/\.(jpe?g|png)$/i.test(grant.objectPath) || grant.objectPath.split("/").length > 12 || grant.objectPath.split("/").some((s) => !/^[A-Za-z0-9_.-]{1,128}$/.test(s) || s === "." || s === "..") || !prose(grant.permissionReference, 500) || !prose(grant.reviewedBy, 100) || /\p{Cc}/u.test(grant.reviewedBy) || grant.aiProcessing !== true || !calendarDate(grant.reviewedOn)) return fail("reference_unavailable");
  }
  if (new Set(value.grants.map((g) => g.imageId)).size !== value.grants.length) return fail("reference_unavailable");
  return value as ReferenceConfiguration;
}
type SelectedReference = { row: ImageRow; grant: ReferenceGrant; evidence: ReferenceEvidence };
export type ReferenceSelection = { tasks: VerificationTask[]; references: SelectedReference[]; reasons: Map<string, Reason[]> };
export function selectReferences(groups: Group[], results: GroupResult[], graph: Graph, config: unknown = REFERENCE_CONFIGURATION): ReferenceSelection {
  const selection: ReferenceSelection = { tasks: [], references: [], reasons: new Map() };
  const active = groups.filter((g, n) => g.task === "identify" && g.representativeImageId && results[n].candidates.length && results[n].identity.status !== "identified");
  if (!active.length) return selection;
  const manifest = parseGrants(config);
  const queues = active.map((g) => {
    const result = results.find((r) => r.id === g.id)!;
    const reasons: Reason[] = []; selection.reasons.set(g.id, reasons);
    const candidates = result.candidates.map((candidate) => {
      const rows = graph.images.filter((i) => i.artwork_id === candidate.artworkId).sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.id.localeCompare(b.id));
      if (!rows.length) reasons.push("references_missing");
      const eligible = rows.flatMap((row) => {
        const grant = manifest.grants.find((p) => p.imageId === row.id);
        if (row.review_status !== "verified") { reasons.push("record_unverified"); return []; }
        if (!grant || grant.rowDigest !== rowDigest(row) || !row.license_or_permission_reference || grant.permissionReference !== row.license_or_permission_reference || (row.sha256 !== null && row.sha256 !== grant.contentSha256)) { reasons.push("reference_not_authorized"); return []; }
        return [{ row, grant }];
      });
      return eligible.slice(0, 2);
    });
    return { group: g, queue: [...candidates.flatMap((c) => c.slice(0, 1)), ...candidates.flatMap((c) => c.slice(1, 2))] };
  });
  while (selection.tasks.length < 4 && queues.some((q) => q.queue.length)) {
    for (const q of queues) {
      if (selection.tasks.length === 4) break;
      const item = q.queue.shift(); if (!item) continue;
      const existing = selection.references.find((r) => r.row.id === item.row.id);
      if (!existing && selection.references.filter((r) => r.row.artwork_id === item.row.artwork_id).length >= 2) { selection.reasons.get(q.group.id)!.push("reference_limit"); continue; }
      const reference = existing ?? { ...item, evidence: { key: `R${selection.references.length + 1}`, imageId: item.row.id, artworkId: item.row.artwork_id, contentSha256: item.grant.contentSha256 } };
      if (!existing) selection.references.push(reference);
      selection.tasks.push({ id: `V${selection.tasks.length + 1}`, groupId: q.group.id, artworkId: item.row.artwork_id, referenceKey: reference.evidence.key, visitorImageId: q.group.representativeImageId! });
    }
  }
  for (const q of queues) if (q.queue.length) selection.reasons.get(q.group.id)!.push("reference_limit");
  return selection;
}
export type PreparedReference = { evidence: ReferenceEvidence; mimeType: "image/jpeg" | "image/png"; data: string };
export async function readReferences(selection: ReferenceSelection, parent: Scope, config?: ReturnType<typeof archiveConfig>): Promise<PreparedReference[]> {
  if (!selection.references.length) return [];
  const scope = createScope(parent.signal, 5000);
  let failure: AnswerFailure | undefined;
  let total = 0;
  try {
    config = validateArchiveConfig(config ?? archiveConfig());
    const base = new URL(config.url);
    if (base.protocol !== "https:" || base.username || base.password || base.pathname !== "/" || base.search || base.hash) throw new AnswerFailure("reference_unavailable");
    const allowed = new Set(selection.references.map((r) => `${base.origin}/storage/v1/object/${r.grant.bucket}/${r.grant.objectPath}`));
    const boundedFetch: typeof fetch = async (input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      try {
        if (!allowed.delete(url) || (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase() !== "GET") throw new AnswerFailure("reference_unavailable");
        const response = await scope.wait(fetch(input, { ...init, redirect: "error", signal: scope.signal, cache: "no-store" }));
        if (!response.ok) { void response.body?.cancel().catch(() => {}); throw new AnswerFailure(response.status === 429 || response.status >= 500 ? "reference_failed" : "reference_unavailable"); }
        if (Number(response.headers.get("content-length")) > 5_000_000) { void response.body?.cancel().catch(() => {}); throw new AnswerFailure("reference_unavailable"); }
        const reader = response.body?.getReader();
        if (!reader) throw new AnswerFailure("reference_unavailable");
        const chunks: Uint8Array[] = []; let size = 0;
        try {
          for (;;) {
            const next = await scope.wait(reader.read()); if (next.done) break;
            size += next.value.byteLength; total += next.value.byteLength;
            if (size > 5_000_000 || total > 20_000_000) throw new AnswerFailure("reference_unavailable");
            chunks.push(next.value);
          }
        } finally { void reader.cancel().catch(() => {}); reader.releaseLock(); }
        const headers = new Headers(response.headers); headers.delete("content-length"); headers.delete("content-encoding");
        return new Response(Buffer.concat(chunks), { status: 200, headers });
      } catch (error) {
        scope.check(); parent.check();
        failure = error instanceof AnswerFailure ? error : new AnswerFailure("reference_failed"); throw failure;
      }
    };
    const client = createClient(config.url, config.key, { db: { retry: false }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: boundedFetch } });
    const prepared: PreparedReference[] = [];
    for (const reference of selection.references) {
      const download = await scope.wait(client.storage.from(reference.grant.bucket).download(reference.grant.objectPath, {}, { signal: scope.signal, cache: "no-store" }));
      if (failure) throw failure;
      if (download.error || !download.data) throw new AnswerFailure("reference_unavailable");
      const bytes = Buffer.from(await scope.wait(download.data.arrayBuffer()));
      if (digest(bytes) !== reference.grant.contentSha256) throw new AnswerFailure("reference_unavailable");
      try {
        const header = imageHeader(bytes);
        if (header.width * header.height > 16_000_000 || Math.max(header.width, header.height) > 8192 || (download.data.type && download.data.type !== header.mimeType) || (reference.row.mime_type && reference.row.mime_type !== header.mimeType)) throw new Error();
        const decoder = sharp(bytes, { limitInputPixels: 16_000_000, failOn: "warning" });
        const metadata = await scope.wait(decoder.metadata());
        if (metadata.pages && metadata.pages !== 1) throw new Error();
        await scope.wait(decoder.raw().toBuffer());
        let result: Buffer | undefined;
        for (const side of [1600, 1280]) {
          for (const quality of header.mimeType === "image/jpeg" ? [85, 75, 65] : [undefined]) {
            const pipeline = sharp(bytes, { limitInputPixels: 16_000_000, failOn: "warning" }).rotate().resize({ width: side, height: side, fit: "inside", withoutEnlargement: true });
            const encoded = await scope.wait((header.mimeType === "image/jpeg" ? pipeline.jpeg({ quality }) : pipeline.png()).toBuffer());
            if (encoded.length && encoded.length <= 500_000) { result = encoded; break; }
          }
          if (result) break;
        }
        if (!result) throw new Error();
        prepared.push({ evidence: reference.evidence, mimeType: header.mimeType, data: result.toString("base64") });
      } catch { scope.check(); parent.check(); throw new AnswerFailure("reference_unavailable"); }
    }
    parent.check(); scope.check(); return prepared;
  } catch (error) {
    parent.check(); scope.check();
    throw error instanceof AnswerFailure ? error : new AnswerFailure("reference_unavailable");
  } finally { scope.close(); }
}
