import { archiveColumns, type ArchiveTable, type ArchiveRow } from "../../src/lib/retrieval/database";
export const archiveId = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
// Complete synthetic transport rows. SQL tests independently compare descriptors with the original DDL.
export function archiveRow<T extends ArchiveTable>(table: T, values: Partial<ArchiveRow<T>>): ArchiveRow<T> {
  const row: Record<string, unknown> = {};
  for (const [name, spec] of Object.entries(archiveColumns[table])) {
    row[name] = spec.nullable ? null : spec.kind === "uuid" ? archiveId(1)
      : spec.kind === "text[]" ? [] : spec.kind === "boolean" ? false
      : spec.kind === "timestamptz" ? "2026-10-16T00:00:00+00:00" : "Synthetic fixture";
  }
  if (table === "artworks" || table === "artwork_artists") row.attribution_status = "not_recorded";
  if (table === "artwork_artists") row.role = "creator";
  if (table === "images") row.rights_status = "pending";
  return {...row,...values} as ArchiveRow<T>;
}
