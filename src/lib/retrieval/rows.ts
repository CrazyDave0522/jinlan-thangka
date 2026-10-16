import { archiveColumns, archiveEnums, type ArchiveRow, type ArchiveTable } from "./database";
import { isObject, RetrievalFailure, UUID } from "./contracts";

export function projection(table: ArchiveTable) { return Object.keys(archiveColumns[table]).join(","); }
export function parseRows<T extends ArchiveTable>(table: T, data: unknown): ArchiveRow<T>[] {
  const fail = () => { throw new RetrievalFailure("schema_mismatch"); };
  if (!Array.isArray(data)) return fail();
  const seen = new Set<string>();
  for (const row of data) {
    if (!isObject(row) || Object.keys(row).some((key) => !(key in archiveColumns[table]))) return fail();
    for (const [column, spec] of Object.entries(archiveColumns[table])) {
      const value = row[column];
      if (value === null && spec.nullable) continue;
      switch (spec.kind) {
        case "uuid": if (typeof value !== "string" || !UUID.test(value) || value !== value.toLowerCase()) return fail(); break;
        case "text[]": if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) return fail(); break;
        case "boolean": if (typeof value !== "boolean") return fail(); break;
        case "numeric": case "integer": case "bigint":
          if (typeof value !== "number" || !Number.isFinite(value) || (spec.kind !== "numeric" && !Number.isSafeInteger(value))) return fail(); break;
        default: if (typeof value !== "string") return fail();
      }
      const allowed: readonly string[] | undefined = (archiveEnums as Record<string, readonly string[]>)[`${table}.${column}`];
      if (allowed && !allowed.includes(value as string)) return fail();
    }
    const identity = table === "artwork_artists" ? JSON.stringify([row.artwork_id, row.artist_id, row.role]) : String(row.id);
    if (seen.has(identity)) return fail();
    seen.add(identity);
  }
  return data as ArchiveRow<T>[];
}
