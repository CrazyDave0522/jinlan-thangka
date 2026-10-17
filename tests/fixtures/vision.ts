import type { Assistant, ImageRequest, Success } from "../../src/lib/vision/types";
import { canonicalImage } from "../../src/lib/vision/output";

export function successV2(request: ImageRequest, text = "测试回答", id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"): Success {
  const observations = request.inputs.map((i, n) => ({ imageId: i.imageId, id: `bbbbbbbb-bbbb-4bbb-8bbb-${(parseInt(id.slice(-12), 16) + n + 1).toString(16).padStart(12, "0").slice(-12)}`, imageSha256: request.images.find((d) => d.id === i.imageId)!.sha256,
    originTurnId: request.turnId, originAssistantId: id, pass: "analysis" as const, supersedes: request.observations.find((o) => o.imageId === i.imageId)?.id ?? null,
    facts: [{ text: "这是合成图片观察。", region: "whole" as const }], readings: [], interpretations: [], limitations: [] }));
  const message: Assistant = { id, role: "assistant", kind: "answer", reread: null, text: "", blocks: [{ kind: observations.length ? "visual" : "general", text: text.trim(), evidenceKeys: [], observationIds: observations.map((o) => o.id) }], references: [], observations,
    groups: observations.map((o, n) => ({ id: `G${n + 1}`, imageIds: [o.imageId], searchStatus: "not_searched", candidates: [], candidateLimitReached: false, identity: { status: "not_requested" } })), referenceImages: [], comparisons: [], notices: observations.length ? ["image_interpretation"] : [] };
  message.text = canonicalImage(message, request);
  return { version: 2, turnId: request.turnId, message };
}
