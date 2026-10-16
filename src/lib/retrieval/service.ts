import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { ArchiveRow, ArchiveTable, Database, EvidenceLink, Json } from "./database";
import { isObject, normalizeQuery, RETRIEVAL_LIMITS as L, RetrievalFailure, UUID,
  type Candidate, type MatchReason, type NormalizedArchiveQuery, type RetrievalResult } from "./contracts";
import { parseRows, projection } from "./rows";
import { createOperation } from "./runtime";

function databaseFailure(error: { code?: string; status?: number }, status?: number): never {
  const code = error.code ?? "";
  if (["42501", "PGRST301", "PGRST302", "PGRST303"].includes(code) || status === 401 || status === 403) throw new RetrievalFailure("access_denied");
  if (["42P01", "42703", "42883", "PGRST106", "PGRST200", "PGRST202", "PGRST204", "PGRST205"].includes(code)) throw new RetrievalFailure("schema_mismatch");
  throw new RetrievalFailure("query_failed");
}
const nameColumns = { artist: ["display_name", "name_bo", "name_en", "aliases"], artwork: ["title", "title_bo", "title_en", "alternative_titles"] };
function parseCandidates(data: unknown, query: Extract<NormalizedArchiveQuery, { kind: "search" }>): Candidate[] {
  if (!Array.isArray(data)) throw new RetrievalFailure("schema_mismatch");
  if (data.length > query.limit + 1) throw new RetrievalFailure("budget_exceeded");
  const seen = new Set<string>();
  const candidates = data.map((row): Candidate => {
    if (!isObject(row) || typeof row.id !== "string" || !UUID.test(row.id) || row.id !== row.id.toLowerCase()
      || typeof row.rank !== "number" || !Number.isInteger(row.rank) || row.rank < 0 || row.rank > 5 * query.filters.length
      || !Array.isArray(row.matches) || !row.matches.length || seen.has(row.id)) throw new RetrievalFailure("schema_mismatch");
    seen.add(row.id);
    const reasons: MatchReason[] = [];
    for (const reason of row.matches) {
      if (!isObject(reason)) throw new RetrievalFailure("schema_mismatch");
      const filter = query.filters.find((f) => f.field === reason.field);
      const columns = reason.field === "name" ? nameColumns[query.entity] : reason.field === "style" ? ["styles"]
        : reason.field === "subject" ? ["subject_primary", "subject_details"] : reason.field === "collection" ? ["collection_name"] : ["accession_number"];
      if (!filter || typeof reason.column !== "string" || !columns.includes(reason.column)
        || (reason.mode !== "exact" && reason.mode !== "contains") || (filter.mode === "exact" && reason.mode !== "exact")
        || reasons.some((r) => r.field === reason.field && r.column === reason.column)) throw new RetrievalFailure("schema_mismatch");
      reasons.push({ field: filter.field, column: reason.column, mode: reason.mode });
    }
    if (query.filters.some((f) => !reasons.some((r) => r.field === f.field))) throw new RetrievalFailure("schema_mismatch");
    return { entity: query.entity, id: row.id, rank: row.rank, matches: reasons };
  });
  for (let i = 1; i < candidates.length; i++) {
    const prev = candidates[i - 1], next = candidates[i];
    if (prev.rank > next.rank || (prev.rank === next.rank && prev.id >= next.id)) throw new RetrievalFailure("schema_mismatch");
  }
  return candidates;
}

export async function retrieveArchive(input: unknown, options: { signal?: AbortSignal } = {}): Promise<RetrievalResult> {
  let query: NormalizedArchiveQuery;
  try { query = normalizeQuery(input); }
  catch { return { status: "error", error: { code: "invalid_query" } }; }
  const op = createOperation(options.signal);
  try {
    op.check();
    let config: ReturnType<typeof getSupabaseConfig>;
    try {
      config = getSupabaseConfig();
      const url = new URL(config.url);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error();
      if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(config.key)) {
        const parts = config.key.split(".");
        if (parts.length !== 3 || !parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p))) throw new Error();
        const payload: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
        if (!isObject(payload) || payload.role !== "anon") throw new Error();
      }
    } catch { throw new RetrievalFailure("configuration_error"); }
    const db = createClient<Database, "thangka">(config.url, config.key, {
      db: { schema: "thangka", retry: false }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: op.fetch },
    });
    async function read<T extends ArchiveTable>(table: T, column: keyof ArchiveRow<T> & string, ids: string[], cap: number): Promise<ArchiveRow<T>[]> {
      if (!ids.length) return [];
      let request = db.from(table as ArchiveTable).select(projection(table)).in(column as string, [...new Set(ids)]).limit(cap + 1);
      if (table === "artwork_artists") request = request.order("artwork_id").order("artist_id").order("role");
      else if (table === "images") request = request.order("artwork_id").order("is_primary", { ascending: false }).order("id");
      else request = request.order("id");
      const response = await op.wait(request.abortSignal(op.signal));
      if (response.error) databaseFailure(response.error, response.status);
      const rows = parseRows(table, response.data);
      if (rows.length > cap) throw new RetrievalFailure("budget_exceeded");
      const requested = new Set(ids);
      if (rows.some((row) => !requested.has(String(row[column])))) throw new RetrievalFailure("schema_mismatch");
      return rows;
    }
    function requireIds(rows: { id: string }[], ids: string[]) {
      const found = new Set(rows.map((row) => row.id));
      if (ids.some((id) => !found.has(id))) throw new RetrievalFailure("data_incomplete");
    }
    let candidates: Candidate[];
    let candidateLimitReached = false;
    if (query.kind === "search") {
      const response = await op.wait(db.rpc("search_archive_candidates", {
        p_entity: query.entity, p_filters: query.filters as Json, p_limit: query.limit,
      }).abortSignal(op.signal));
      if (response.error) databaseFailure(response.error, response.status);
      const probed = parseCandidates(response.data, query);
      candidateLimitReached = probed.length > query.limit;
      candidates = probed.slice(0, query.limit);
    } else {
      candidates = [{ entity: query.entity, id: query.id, rank: 0, matches: [{ field: "id", column: "id", mode: "exact" }] }];
    }
    let artists: ArchiveRow<"artists">[] = [], artworks: ArchiveRow<"artworks">[] = [];
    const rootIds = candidates.map((c) => c.id);
    if (query.entity === "artist") artists = await read("artists", "id", rootIds, L.entities);
    else artworks = await read("artworks", "id", rootIds, L.entities);
    const roots = query.entity === "artist" ? artists : artworks;
    if (query.kind === "lookup" && !roots.length || query.kind === "search" && !candidates.length) {
      return { status: "no_matches", query, candidates: [], candidateLimitReached: false };
    }
    requireIds(roots, rootIds);
    const order = new Map(rootIds.map((id, i) => [id, i]));
    roots.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
    const artworkArtists = await read("artwork_artists", query.entity === "artist" ? "artist_id" : "artwork_id", rootIds, L.associations);
    if (query.entity === "artist") {
      const ids = [...new Set(artworkArtists.map((r) => r.artwork_id))];
      artworks = await read("artworks", "id", ids, L.entities - artists.length);
      requireIds(artworks, ids);
    } else {
      const ids = [...new Set(artworkArtists.map((r) => r.artist_id))];
      artists = await read("artists", "id", ids, L.entities - artworks.length);
      requireIds(artists, ids);
    }
    const images = await read("images", "artwork_id", artworks.map((r) => r.id), L.entities - artists.length - artworks.length);
    const sourceLinks: EvidenceLink[] = [];
    const artistLinks = await read("artist_sources", "artist_id", artists.map((r) => r.id), L.sourceLinks);
    sourceLinks.push(...artistLinks.map((row): EvidenceLink => ({ entity: "artist", entityId: row.artist_id, row })));
    const artworkLinks = await read("artwork_sources", "artwork_id", artworks.map((r) => r.id), L.sourceLinks - sourceLinks.length);
    sourceLinks.push(...artworkLinks.map((row): EvidenceLink => ({ entity: "artwork", entityId: row.artwork_id, row })));
    const imageLinks = await read("image_sources", "image_id", images.map((r) => r.id), L.sourceLinks - sourceLinks.length);
    sourceLinks.push(...imageLinks.map((row): EvidenceLink => ({ entity: "image", entityId: row.image_id, row })));
    const sourceIds = [...new Set(sourceLinks.map((link) => link.row.source_id))];
    if (sourceIds.length > L.sources) throw new RetrievalFailure("budget_exceeded");
    const sources = await read("sources", "id", sourceIds, L.sources);
    requireIds(sources, sourceIds);
    const result: RetrievalResult = { status: "matched", query, candidates,
      graph: { artists, artworks, images, artworkArtists, sourceLinks, sources },
      candidateLimitReached, traversal: "root-associations-v1", evidenceCompleteForReturnedGraph: true };
    op.check();
    if (new TextEncoder().encode(JSON.stringify(result)).byteLength > L.resultBytes) throw new RetrievalFailure("budget_exceeded");
    op.check();
    return result;
  } catch (error) {
    // Supabase can convert a thrown fetch error into a response error; retain the operation's original failure.
    try { op.check(); } catch (stopped) { error = stopped; }
    return { status: "error", error: { code: error instanceof RetrievalFailure ? error.code : "query_failed" } };
  } finally { op.finish(); }
}
