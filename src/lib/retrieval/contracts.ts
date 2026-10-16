import type { ArtistRow, ArtworkRow, ImageRow, ArtworkArtistRow, EvidenceLink, SourceRow } from "./database";

export const RETRIEVAL_LIMITS = {
  candidates: 10, defaultCandidates: 5, filters: 3, valueCodePoints: 200,
  entities: 100, associations: 100, sourceLinks: 200, sources: 100,
  calls: 12, responseBytes: 2_000_000, cumulativeBytes: 8_000_000,
  resultBytes: 2_000_000, deadlineMs: 5_000,
} as const;
export type Entity = "artist" | "artwork";
export type FilterField = "name" | "subject" | "style" | "collection" | "accession";
export type SearchFilter = { field: FilterField; value: string; mode: "exact" | "contains" };
export type ArchiveQuery =
  | { kind: "lookup"; entity: Entity; id: string }
  | { kind: "search"; entity: Entity; filters: SearchFilter[]; limit?: number };
export type NormalizedArchiveQuery = Exclude<ArchiveQuery, { kind: "search" }>
  | { kind: "search"; entity: Entity; filters: SearchFilter[]; limit: number };
export type MatchReason = { field: FilterField | "id"; column: string; mode: "exact" | "contains" };
export type Candidate = { entity: Entity; id: string; rank: number; matches: MatchReason[] };
export type RetrievalErrorCode = "invalid_query" | "configuration_error" | "access_denied"
  | "schema_mismatch" | "timeout" | "aborted" | "budget_exceeded" | "data_incomplete" | "query_failed";
export type RetrievalResult =
  | { status: "matched"; query: NormalizedArchiveQuery; candidates: Candidate[];
      graph: { artists: ArtistRow[]; artworks: ArtworkRow[]; images: ImageRow[];
        artworkArtists: ArtworkArtistRow[]; sourceLinks: EvidenceLink[]; sources: SourceRow[] };
      candidateLimitReached: boolean; traversal: "root-associations-v1"; evidenceCompleteForReturnedGraph: true }
  | { status: "no_matches"; query: NormalizedArchiveQuery; candidates: []; candidateLimitReached: false }
  | { status: "error"; error: { code: RetrievalErrorCode } };

export class RetrievalFailure extends Error {
  constructor(readonly code: RetrievalErrorCode) { super(code); }
}
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw new RetrievalFailure("invalid_query");
}
export function normalizeQuery(input: unknown): NormalizedArchiveQuery {
  const invalid = () => { throw new RetrievalFailure("invalid_query"); };
  if (!isObject(input) || (input.entity !== "artist" && input.entity !== "artwork")) return invalid();
  if (input.kind === "lookup") {
    keys(input, ["kind", "entity", "id"]);
    if (typeof input.id !== "string" || !UUID.test(input.id)) return invalid();
    return { kind: "lookup", entity: input.entity, id: input.id.toLowerCase() };
  }
  if (input.kind !== "search") return invalid();
  keys(input, ["kind", "entity", "filters", "limit"]);
  const limit = input.limit === undefined ? RETRIEVAL_LIMITS.defaultCandidates : input.limit;
  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > RETRIEVAL_LIMITS.candidates) return invalid();
  if (!Array.isArray(input.filters) || input.filters.length < 1 || input.filters.length > RETRIEVAL_LIMITS.filters) return invalid();
  const allowed = input.entity === "artist" ? ["name", "style"] : ["name", "style", "subject", "collection", "accession"];
  const seen = new Set<string>();
  const filters = input.filters.map((f): SearchFilter => {
    if (!isObject(f)) return invalid();
    keys(f, ["field", "value", "mode"]);
    if (typeof f.field !== "string" || !allowed.includes(f.field) || seen.has(f.field)
      || (f.mode !== "exact" && f.mode !== "contains") || typeof f.value !== "string") return invalid();
    // Validate before trimming so a control character cannot be hidden at either edge.
    if (!f.value.isWellFormed() || /\p{Cc}/u.test(f.value)) return invalid();
    const value = f.value.trim();
    if (!value || [...value].length > RETRIEVAL_LIMITS.valueCodePoints) return invalid();
    seen.add(f.field);
    return { field: f.field as FilterField, value, mode: f.mode };
  });
  return { kind: "search", entity: input.entity, filters, limit };
}
