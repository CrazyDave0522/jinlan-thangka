// @vitest-environment node
import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { buildCatalogue, mergeEvidence, publicReference } from "./catalogue";
import { validReference } from "./contracts";
import { artworkResult, imagePlan, visitorRequest } from "../../../tests/fixtures/vision-archive";
import { buildGroups } from "@/lib/vision/identity";
import { rowDigest, selectReferences } from "@/lib/vision/references";
import type { ReferenceConfiguration } from "@/lib/vision/reference-manifest";

it("keeps operational fields out of model evidence keys and public references", () => {
  const result = artworkResult();
  const facts = buildCatalogue(result.graph);
  expect(facts.some((fact) => ["content_revision", "current_review_id"].includes(fact.field))).toBe(false);
  expect(facts.map((fact) => fact.key)).toEqual(facts.map((_, index) => `E${index + 1}`));
  const reference = publicReference(facts.find((fact) => fact.field === "title")!);
  expect(validReference(reference)).toBe(true);
  expect(validReference({ ...reference, field: "content_revision", value: 1 })).toBe(false);
  expect(validReference({ ...reference, field: "current_review_id", value: result.graph.artworks[0].current_review_id })).toBe(false);
});
it.each(["content_revision", "current_review_id"])("detects drift in %s even when all business facts and timestamps agree", (field) => {
  const result = artworkResult();
  const changed = structuredClone(result);
  changed.graph.artworks[0] = field === "content_revision"
    ? { ...changed.graph.artworks[0], content_revision: 2 }
    : { ...changed.graph.artworks[0], current_review_id: "00000000-0000-0000-0000-000000009999" };
  expect(() => mergeEvidence([result, changed])).toThrow("evidence_changed");
});
it.each(["content_revision", "current_review_id"])("requires a fresh full-row image grant after %s changes", (field) => {
  const result = artworkResult();
  const row = result.graph.images[0];
  const manifest: ReferenceConfiguration = { version: 1, grants: [{ imageId: row.id, rowDigest: rowDigest(row), bucket: "fixtures", objectPath: "original.png", contentSha256: "a".repeat(64), permissionReference: row.license_or_permission_reference!, aiProcessing: true, reviewedBy: "Synthetic reviewer", reviewedOn: "2026-10-18" }] };
  const plan = imagePlan(visitorRequest());
  const groups = buildGroups(plan, [result], result.graph);
  expect(selectReferences(plan.groups, groups, result.graph, manifest).references).toHaveLength(1);
  result.graph.images[0] = { ...row, current_review_id: "00000000-0000-0000-0000-000000009999", ...(field === "content_revision" ? { content_revision: 2 } : {}) };
  const denied = selectReferences(plan.groups, groups, result.graph, manifest);
  expect(denied.references).toEqual([]);
  expect(denied.reasons.get("G1")).toContain("reference_not_authorized");
});
