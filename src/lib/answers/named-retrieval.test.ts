// @vitest-environment node
import { expect, it } from "vitest";
import { namedLookups, requireNamedLookups } from "./named-retrieval";
import type { NormalizedArchiveQuery } from "@/lib/retrieval/contracts";

it("preserves complete explicit titles and quoted artist names, including provisional numbers", () => {
  expect(namedLookups('比较作品《示例 17 号唐卡》和画师“示例甲”的资料，再查《示例 17 号唐卡》。')).toEqual([
    { kind: "search", entity: "artwork", filters: [{ field: "name", mode: "exact", value: "示例 17 号唐卡" }], limit: 5 },
    { kind: "search", entity: "artist", filters: [{ field: "name", mode: "exact", value: "示例甲" }], limit: 5 },
  ]);
});

it("does not treat unmarked text, sources, URLs, oversized or normalized names as explicit archive targets", () => {
  for (const question of ["唐卡的题材是什么？", "那位画师的姓名？", "书籍《藏画研究》介绍什么？", "参考文献《藏画研究》", "《藏画研究》的作者？", "文献作者“示例甲”", '画师“ https://example.test ”', `作品《${"长".repeat(65)}》`, "作品《 标题 》", "作品《标\u200b题》"]) expect(namedLookups(question)).toEqual([]);
});

it("replaces over-filtered name searches and adds skipped names without modifying planner provenance", () => {
  const required = namedLookups("作品《示例17》"), original = { kind: "search" as const, entity: "artwork" as const, filters: [{ field: "name" as const, mode: "contains" as const, value: "示例17" }, { field: "subject" as const, mode: "exact" as const, value: "观音" }], limit: 5 };
  const entries: { query: NormalizedArchiveQuery; groupIds: string[] }[] = [{ query: original, groupIds: ["G1"] }];
  expect(requireNamedLookups(entries, required, 4, (query) => ({ query, groupIds: [] }))).toEqual([{ query: required[0], groupIds: ["G1"] }]);
  expect(original.filters).toHaveLength(2);
  expect(requireNamedLookups([], required, 2, (query) => ({ query, groupIds: [] }))).toEqual([{ query: required[0], groupIds: [] }]);
});

it("never evicts another image's query or exceeds the two/four-query budget to repair omitted names", () => {
  const required = namedLookups("作品《甲》与作品《乙》与作品《丙》");
  expect(() => requireNamedLookups([], required, 2, (query) => ({ query }))).toThrow("invalid_model_output");
  const existing = ["一", "二", "三", "四"].map((name) => ({ query: namedLookups(`作品《${name}》`)[0], groupIds: [name] }));
  expect(() => requireNamedLookups(existing, required, 4, (query) => ({ query, groupIds: [] }))).toThrow("invalid_model_output");
  expect(existing).toHaveLength(4);
});
