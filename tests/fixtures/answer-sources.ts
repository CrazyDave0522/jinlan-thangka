import {
  canonical,
  type AnswerReference,
  type AssistantMessage,
} from "../../src/lib/answers/contracts";
import { canonicalImage } from "../../src/lib/vision/output";
import { successV2 } from "./vision";
import { visitorRequest } from "./vision-archive";

export const sourceId = (n: number) =>
  `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
export function sourceAnswer(
  value = "这是一条合成档案生平。",
  id = sourceId(9000),
) {
  const reference: AnswerReference = {
    key: "E1",
    owner: { table: "artists", id: sourceId(1) },
    label: "合成画师",
    field: "biography",
    value,
    reviewStatus: "pending",
    attributionStatus: null,
    sources: [
      {
        linkTable: "artist_sources",
        linkId: sourceId(11),
        sourceId: sourceId(10),
        title: "合成资料",
        supportedField: "biography",
        locator: "第 3 页",
      },
      {
        linkTable: "artist_sources",
        linkId: sourceId(12),
        sourceId: sourceId(10),
        title: "合成资料",
        supportedField: "",
        locator: "第 7 页",
      },
    ],
  };
  const message: AssistantMessage = {
    id,
    role: "assistant",
    kind: "answer",
    text: "",
    blocks: [
      {
        kind: "archive",
        text: "这位画师的生平记录仍待核验。",
        evidenceKeys: ["E1"],
      },
      { kind: "archive", text: "此处再次引用同一字段。", evidenceKeys: ["E1"] },
      { kind: "general", text: "这是明确区分的通用知识。", evidenceKeys: [] },
    ],
    references: [reference],
    notices: ["uncertain_records"],
  };
  message.text = canonical(message);
  return {
    id,
    role: "assistant" as const,
    text: message.text,
    structured: message,
  };
}
export function imageSourceAnswer(maximum = false) {
  const request = visitorRequest(maximum ? 4 : 2);
  const message = successV2(request, "合成图片观察。", sourceId(9001)).message;
  const count = maximum ? 64 : 2;
  message.references = Array.from(
    { length: count },
    (_, n): AnswerReference => {
      const work = n < request.inputs.length;
      return {
        key: `E${n + 1}`,
        owner: { table: work ? "artworks" : "artists", id: sourceId(n + 1) },
        label: `${work ? "合成作品" : "合成画师"} ${n + 1}`,
        field: work ? "description" : "biography",
        value: work ? "右下角莲花与边框纹样。" : `合成生平字段 ${n + 1}。`,
        reviewStatus: "verified",
        attributionStatus: work ? "unknown" : null,
        sources: [
          {
            linkTable: work ? "artwork_sources" : "artist_sources",
            linkId: sourceId(n + 1000),
            sourceId: sourceId(777),
            title: `合成档案目录 ${"LongSourceToken".repeat(maximum ? 10 : 1)}`,
            supportedField: work ? "description" : "biography",
            locator: `第 ${n + 1} 页`,
          },
        ],
      };
    },
  );
  message.observations[0].readings = [
    {
      text: "未能辨认",
      region: "bottom_right",
      kind: "accession",
      certainty: "unreadable",
    },
  ];
  message.observations[0].interpretations = [
    { text: "可能为莲花纹样。", certainty: "tentative" },
  ];
  message.observations[0].limitations = [
    { text: "局部题记仍有模糊之处。", affectsIdentity: false },
  ];
  message.groups = request.inputs.map((input, n) => ({
    id: `G${n + 1}`,
    imageIds: [input.imageId],
    searchStatus: "matched",
    candidates: [{ artworkId: sourceId(n + 1), label: `合成作品 ${n + 1}` }],
    candidateLimitReached: false,
    identity: { status: "candidates", reasons: ["visual_uncertain"] },
  }));
  message.referenceImages = request.inputs.map((_, n) => ({
    key: `R${n + 1}`,
    artworkId: sourceId(n + 1),
    imageId: sourceId(n + 100),
    contentSha256: "b".repeat(64),
  }));
  message.comparisons = request.inputs.map((input, n) => ({
    taskId: `V${n + 1}`,
    groupId: `G${n + 1}`,
    artworkId: sourceId(n + 1),
    referenceKey: `R${n + 1}`,
    visitorImageId: input.imageId,
    assessment: "uncertain",
    proofs: [
      {
        evidenceKey: `E${n + 1}`,
        quote: "右下角莲花",
        kind: "local_detail",
        finding: "match",
        visitorRegion: "bottom_right",
        referenceRegion: "bottom_right",
      },
    ],
    contradictions: n === 0 ? ["边框局部仍无法确定。"] : [],
  }));
  message.blocks = maximum
    ? Array.from({ length: 8 }, (_, n) => ({
        kind: "archive" as const,
        text: `合成字段组 ${n + 1}。`,
        evidenceKeys: message.references
          .slice(n * 8, n * 8 + 8)
          .map((r) => r.key),
        observationIds: [],
      }))
    : [
        {
          kind: "visual",
          text: "两张图片的局部观察仍需核对。",
          evidenceKeys: [],
          observationIds: message.observations.map((o) => o.id),
        },
      ];
  message.notices = [
    "uncertain_records",
    "image_interpretation",
    "reference_compared",
  ];
  message.text = canonicalImage(message, request);
  return {
    id: message.id,
    role: "assistant" as const,
    text: message.text,
    structured: message,
    imageContext: request,
  };
}
