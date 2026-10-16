import "server-only";
import { archiveColumns, type ArchiveRow, type EvidenceLink } from "@/lib/retrieval/database";
import type { RetrievalResult } from "@/lib/retrieval/contracts";
import { AnswerFailure, type AnswerReference, type EvidenceOwner } from "./contracts";
import { ROLE_LABELS } from "./labels";

type Match = Extract<RetrievalResult, { status: "matched" }>;
export type Graph = Match["graph"];
export function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => `${JSON.stringify(key)}:${stable(v)}`).join(",")}}`;
  return JSON.stringify(value);
}
export function mergeEvidence(results: Exclude<RetrievalResult, { status: "error" }>[]): Graph {
  const graph: Graph = { artists: [], artworks: [], images: [], artworkArtists: [], sourceLinks: [], sources: [] };
  for (const table of Object.keys(graph) as (keyof Graph)[]) {
    const seen = new Map<string, { value: unknown; payload: string }>();
    for (const result of results) {
      if (result.status !== "matched") continue;
      for (const row of result.graph[table]) {
        const key = table === "sourceLinks" ? `${(row as EvidenceLink).entity}:${(row as EvidenceLink).row.id}`
          : table === "artworkArtists" ? stable([(row as ArchiveRow<"artwork_artists">).artwork_id, (row as ArchiveRow<"artwork_artists">).artist_id, (row as ArchiveRow<"artwork_artists">).role]) : (row as { id: string }).id;
        const payload = stable(row);
        if (seen.has(key) && seen.get(key)!.payload !== payload) throw new AnswerFailure("evidence_changed");
        seen.set(key, { value: row, payload });
      }
    }
    // Each table retains its own validated row type; no row crosses a graph collection.
    (graph[table] as unknown[]) = [...seen.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, entry]) => entry.value);
  }
  return graph;
}
export type CatalogueFact = AnswerReference & { evidenceNotes: { linkId: string; notes: string | null; sourceNotes: Record<string, unknown> }[] };
export function buildCatalogue(graph: Graph): CatalogueFact[] {
  const facts: CatalogueFact[] = [];
  const sources = new Map(graph.sources.map((s) => [s.id, s]));
  const tables = ["artists", "artworks", "images", "artwork_artists"] as const;
  for (const table of tables) {
    const rows = table === "artwork_artists" ? graph.artworkArtists : graph[table];
    for (const raw of rows) {
      const row = raw as unknown as Record<string, AnswerReference["value"]>;
      const owner: EvidenceOwner = table === "artwork_artists"
        ? { table, artworkId: String(row.artwork_id), artistId: String(row.artist_id), role: String(row.role) }
        : { table, id: String(row.id) };
      const name = row.display_name ?? row.title;
      const label = typeof name === "string" && name.trim() ? name : table === "artwork_artists"
        ? `${ROLE_LABELS[String(row.role)]}（${row.artwork_id} / ${row.artist_id}）` : `记录 ${row.id}`;
      for (const field of Object.keys(archiveColumns[table])) {
        const kind = { artists: "artist", artworks: "artwork", images: "image", artwork_artists: "association" }[table];
        const links = graph.sourceLinks.filter((l) => l.entity === kind && l.entityId === row.id && (l.row.supported_field === "" || l.row.supported_field === field));
        links.sort((a, b) => a.row.id.localeCompare(b.row.id));
        facts.push({ key: `E${facts.length + 1}`, owner, label, field, value: row[field],
          reviewStatus: (row.review_status ?? null) as AnswerReference["reviewStatus"],
          attributionStatus: (row.attribution_status ?? null) as AnswerReference["attributionStatus"],
          sources: links.map((link) => {
            const source = sources.get(link.row.source_id);
            if (!source) throw new AnswerFailure("retrieval_failed");
            return { linkTable: `${link.entity}_sources` as "artist_sources", linkId: link.row.id, sourceId: source.id,
              title: source.title, supportedField: link.row.supported_field, locator: link.row.locator };
          }),
          evidenceNotes: links.map((link) => ({ linkId: link.row.id, notes: link.row.evidence_notes, sourceNotes: { ...sources.get(link.row.source_id) } })),
        });
      }
    }
  }
  return facts;
}
export function publicReference(fact: CatalogueFact): AnswerReference {
  const { evidenceNotes: _notes, ...ref } = fact;
  void _notes;
  return ref;
}
