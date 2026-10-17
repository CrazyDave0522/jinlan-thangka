import { AnswerFailure, codePoints } from "./contracts";
import { normalizeQuery, type NormalizedArchiveQuery } from "@/lib/retrieval/contracts";

// Only explicit naming syntax in the current visitor question is authoritative.
// Unmarked names and conversational pronouns still belong to the planner.
export function namedLookups(question: string): NormalizedArchiveQuery[] {
  const targets: NormalizedArchiveQuery[] = [];
  const add = (entity: "artist" | "artwork", value: string) => {
    if (!value || value !== value.trim() || codePoints(value) > 64 || /[\p{Cc}\p{Cf}]|https?:\/\/|www\./iu.test(value)) return;
    const query = normalizeQuery({ kind: "search", entity, filters: [{ field: "name", mode: "exact", value }], limit: 5 });
    if (!targets.some((old) => JSON.stringify(old) === JSON.stringify(query))) targets.push(query);
  };
  for (const match of question.matchAll(/(?:作品|唐卡|画作)(?:名(?:称)?)?\s*[：:]?\s*《([^《》\n]+)》/gu)) add("artwork", match[1]);
  for (const match of question.matchAll(/(画师|艺术家|作品)(?:名(?:称)?)?\s*[：:]?\s*(?:“([^“”\n]+)”|「([^「」\n]+)」|"([^"\n]+)")/gu)) {
    add(match[1] === "作品" ? "artwork" : "artist", match[2] ?? match[3] ?? match[4]);
  }
  return targets;
}

export function requireNamedLookups<T extends { query: NormalizedArchiveQuery }>(
  queries: T[], required: NormalizedArchiveQuery[], cap: number, wrap: (query: NormalizedArchiveQuery) => T,
): T[] {
  const result = queries.map((entry) => ({ ...entry }));
  for (const query of required) {
    if (query.kind !== "search") continue;
    const value = query.filters[0].value;
    const existing = result.filter((entry) => entry.query.kind === "search" && entry.query.entity === query.entity && entry.query.filters.some((f) => f.field === "name" && f.value === value));
    // A literal name lookup must not be narrowed by inferred subject/style fields.
    if (existing.length) existing.forEach((entry) => { entry.query = query; });
    else result.push(wrap(query));
  }
  if (result.length > cap) throw new AnswerFailure("invalid_model_output");
  return result;
}
