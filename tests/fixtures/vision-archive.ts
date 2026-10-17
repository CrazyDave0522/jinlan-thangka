import { archiveId as id, archiveRow as row } from "./archive";
import type { RetrievalResult } from "../../src/lib/retrieval/contracts";
import type { ImageRequest, ObservationBody, Plan } from "../../src/lib/vision/types";

export const featureText = "中央主尊两侧分别排列四位侍者。右下角有一处独特的白色莲花。";
export function artworkResult(numbers = [1]): Extract<RetrievalResult, { status: "matched" }> {
  const artworks = numbers.map((n) => row("artworks", { id: id(n), title: `合成作品 ${n}`, collection_name: "合成收藏", accession_number: `S-${n}`, subject_primary: "观音", description: featureText, review_status: "verified", attribution_status: "unknown" }));
  return { status: "matched", query: { kind: "search", entity: "artwork", filters: [{ field: "subject", mode: "exact", value: "观音" }], limit: 5 }, candidates: artworks.map((a) => ({ entity: "artwork", id: a.id, rank: 0, matches: [{ field: "subject", column: "subject_primary", mode: "exact" }] })), candidateLimitReached: false, traversal: "root-associations-v1", evidenceCompleteForReturnedGraph: true,
    graph: { artists: [], artworks, artworkArtists: [], images: numbers.map((n) => row("images", { id: id(n + 100), artwork_id: id(n), is_primary: true, review_status: "verified", storage_locator: `fixture/${n}.png`, license_or_permission_reference: "Synthetic fixture permission", rights_status: "authorized", mime_type: "image/png" })), sources: [row("sources", { id: id(900), title: "合成档案目录" })],
      sourceLinks: numbers.flatMap((n) => ["collection_name", "accession_number", "description"].map((field, index) => ({ entity: "artwork" as const, entityId: id(n), row: row("artwork_sources", { id: id(n * 10 + 1000 + index), artwork_id: id(n), source_id: id(900), supported_field: field, locator: `第${n}页` }) }))) } };
}
export function visitorRequest(count = 1): ImageRequest {
  const images = Array.from({ length: count }, (_, n) => ({ id: `picture-${n + 1}`, ownerMessageId: "q", displayIndex: n + 1, mimeType: "image/png" as const, width: 1, height: 1, sha256: "a".repeat(64) }));
  return { version: 2, turnId: "q", messages: [{ id: "q", role: "user", text: "请识别这些作品", imageIds: images.map((i) => i.id) }], images, inputs: images.map((i) => ({ imageId: i.id, data: `synthetic-selected-${i.id}` })), observations: [], sameWorkSets: [], intent: { kind: "question" } };
}
export function visitorObservation(imageId: string, number?: number): ObservationBody {
  return { imageId, facts: [{ text: "中央主尊两侧有侍者。", region: "whole" }], readings: number ? [{ text: "合成收藏", kind: "collection", certainty: "clear", region: "bottom_left" }, { text: `S-${number}`, kind: "accession", certainty: "clear", region: "bottom_left" }] : [], interpretations: [], limitations: [] };
}
export function imagePlan(request: ImageRequest, numbered = false): Extract<Plan, { action: "answer" }> {
  return { action: "answer", observations: request.inputs.map((i, n) => visitorObservation(i.imageId, numbered ? n + 1 : undefined)), groups: request.inputs.map((i, n) => ({ id: `G${n + 1}`, imageIds: [i.imageId], representativeImageId: i.imageId, task: "identify", search: "planned" })), queries: request.inputs.map((_, n) => ({ groupIds: [`G${n + 1}`], query: { kind: "search", entity: "artwork", filters: numbered ? [{ field: "collection", value: "合成收藏", mode: "exact" }, { field: "accession", value: `S-${n + 1}`, mode: "exact" }] : [{ field: "subject", value: "观音", mode: "exact" }], limit: 5 } })) };
}
