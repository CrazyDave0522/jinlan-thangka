// @vitest-environment node
import { expectTypeOf, it } from "vitest";
import type { ArchiveTable, ArchiveTransportRow, ArchiveRow } from "./database";
import type { Database, Json } from "./database.generated";

type LiveTables = Database["thangka"]["Tables"];
type ExpectedRows = { [T in ArchiveTable]: ArchiveTransportRow<T> };
type LiveRows = { [T in keyof LiveTables]: LiveTables[T]["Row"] };

it("keeps all runtime columns, transport types and nullability aligned with the live-generated snapshot", () => {
  expectTypeOf<ArchiveTable>().toEqualTypeOf<keyof LiveTables>();
  expectTypeOf<ExpectedRows>().toEqualTypeOf<LiveRows>();
});
it("keeps the structured search contract aligned with the deployed RPC", () => {
  type Search = Database["thangka"]["Functions"]["search_archive_candidates"];
  expectTypeOf<Search["Args"]>().toEqualTypeOf<{ p_entity: string; p_filters: Json; p_limit: number }>();
  expectTypeOf<Search["Returns"]>().toEqualTypeOf<{ id: string; rank: number; matches: Json }[]>();
});
it("retains narrower checked domain states over the generated transport strings", () => {
  expectTypeOf<ArchiveRow<"artworks">["attribution_status"]>().toEqualTypeOf<
    "not_recorded" | "confirmed" | "attributed" | "workshop" | "circle_or_school" | "unknown" | "disputed"
  >();
  expectTypeOf<ArchiveRow<"artwork_artists">["attribution_status"]>().toEqualTypeOf<
    "not_recorded" | "confirmed" | "attributed" | "disputed"
  >();
});
