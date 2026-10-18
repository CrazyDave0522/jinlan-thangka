import { archiveColumns, archiveEnums, isArchiveReviewField } from "@/lib/retrieval/database";
import { isObject, UUID } from "@/lib/retrieval/contracts";
import type { TextMessage } from "@/lib/chat/conversation";
import { FIELD_LABELS, NOTICE_TEXT } from "./labels";

export const LIMITS = { messages: 32, question: 2_000, context: 16_000, blocks: 8, blockText: 2_000, canonical: 3_500,
  plannerBytes: 64_000, answerBytes: 128_000, providerBytes: 256_000, replyBytes: 128_000,
  deadline: 55_000, plannerMs: 18_000, answerMs: 28_000 } as const;
export const ERROR_STATUS = {
  invalid_request: 400, request_too_large: 413, unsupported_media_type: 415, invalid_image: 422,
  generation_unavailable: 503, context_too_large: 422, evidence_too_large: 422, image_understanding_unavailable: 422,
  busy: 429, provider_unavailable: 503, provider_busy: 429, provider_failed: 502, retrieval_failed: 502,
  evidence_changed: 409, invalid_model_output: 502, generation_timeout: 504,
  invalid_image_context: 422, image_context_too_large: 422, reference_unavailable: 503, reference_failed: 502,
} as const;
export type ChatErrorCode = keyof typeof ERROR_STATUS;
export class AnswerFailure extends Error {
  constructor(readonly code: ChatErrorCode) { super(code); }
}
export function retryable(code?: ChatErrorCode) {
  return !code || (["busy", "provider_busy", "provider_failed", "reference_failed", "evidence_changed", "generation_timeout"] as string[]).includes(code);
}
export type EvidenceTable = "artists" | "artworks" | "images" | "artwork_artists";
export type EvidenceOwner = { table: Exclude<EvidenceTable, "artwork_artists">; id: string }
  | { table: "artwork_artists"; artworkId: string; artistId: string; role: string };
export type SourceCitation = { linkTable: "artist_sources" | "artwork_sources" | "image_sources";
  linkId: string; sourceId: string; title: string; supportedField: string; locator: string };
export type AnswerReference = { key: string; owner: EvidenceOwner; label: string; field: string;
  value: string | number | boolean | string[] | null;
  reviewStatus: "pending" | "verified" | "disputed" | null;
  attributionStatus: typeof archiveEnums["artworks.attribution_status"][number] | null; sources: SourceCitation[] };
export type NoticeCode = keyof typeof NOTICE_TEXT;
export type AnswerBlock = { kind: "archive" | "general"; text: string; evidenceKeys: string[] };
export type AssistantMessage = { id: string; role: "assistant"; text: string; notices: NoticeCode[] } & (
  { kind: "answer"; blocks: AnswerBlock[]; references: AnswerReference[] }
  | { kind: "clarification"; question: string; blocks: []; references: [] });
export const codePoints = (value: string) => [...value].length;
export const jsonBytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).byteLength;
export function exact(value: unknown, keys: string[]): value is Record<string, unknown> {
  return isObject(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
export function text(value: unknown, max = Infinity): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.isWellFormed() && codePoints(value) <= max;
}
export function contextValid(messages: Pick<TextMessage, "text">[]) {
  return messages.length <= LIMITS.messages && codePoints(messages.at(-1)?.text ?? "") <= LIMITS.question &&
    messages.reduce((sum, message) => sum + codePoints(message.text), 0) <= LIMITS.context;
}
export function canonical(message: Pick<AssistantMessage, "kind" | "blocks" | "references" | "notices"> & { question?: string }) {
  const parts = message.kind === "clarification" ? [message.question ?? ""] : [
    ...message.blocks.map((block) => `${block.kind === "archive" ? "数据库依据：" : "通用知识补充："}${block.text.trim()}${block.evidenceKeys.map((key) => `[${key}]`).join("")}`),
    ...message.references.map((ref) => `记录索引：[${ref.key}] ${ref.label} / ${FIELD_LABELS[ref.field]}`),
  ];
  const content = parts.join("\n\n");
  return [content, ...message.notices.map((notice) => NOTICE_TEXT[notice])].join("\n").trim();
}
export function parseBlocks(input: unknown): AnswerBlock[] {
  const fail = () => { throw new AnswerFailure("invalid_model_output"); };
  if (!exact(input, ["blocks"]) || !Array.isArray(input.blocks) || !input.blocks.length || input.blocks.length > LIMITS.blocks) return fail();
  let length = 0;
  for (const b of input.blocks) {
    if (!exact(b, ["kind", "text", "evidenceKeys"]) || !text(b.text) || !Array.isArray(b.evidenceKeys)
      || !b.evidenceKeys.every((k) => typeof k === "string" && /^E[1-9]\d*$/.test(k)) || new Set(b.evidenceKeys).size !== b.evidenceKeys.length
      || (b.kind !== "archive" && b.kind !== "general") || (b.kind === "general" ? b.evidenceKeys.length !== 0 : b.evidenceKeys.length < 1 || b.evidenceKeys.length > 8)
      || /https?:\/\/|www\./i.test(b.text)) return fail();
    length += codePoints(b.text);
  }
  if (length > LIMITS.blockText) return fail();
  return input.blocks as AnswerBlock[];
}
const uuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v) && v === v.toLowerCase();
export function validReference(v: unknown): v is AnswerReference {
  if (!exact(v, ["key", "owner", "label", "field", "value", "reviewStatus", "attributionStatus", "sources"]) || !isObject(v.owner)
    || typeof v.key !== "string" || !/^E[1-9]\d*$/.test(v.key) || !text(v.label) || typeof v.field !== "string") return false;
  const o = v.owner;
  if (o.table === "artwork_artists") {
    if (!exact(o, ["table", "artworkId", "artistId", "role"]) || !uuid(o.artworkId) || !uuid(o.artistId) || !archiveEnums["artwork_artists.role"].includes(o.role as never)) return false;
  } else if (!exact(o, ["table", "id"]) || !["artists", "artworks", "images"].includes(String(o.table)) || !uuid(o.id)) return false;
  if (o.table === "artwork_artists") {
    if ((v.field === "artwork_id" && v.value !== o.artworkId) || (v.field === "artist_id" && v.value !== o.artistId) || (v.field === "role" && v.value !== o.role)) return false;
  } else if (v.field === "id" && v.value !== o.id) return false;
  if ((v.field === "review_status" && v.value !== v.reviewStatus) || (v.field === "attribution_status" && v.value !== v.attributionStatus)) return false;
  const table = o.table as EvidenceTable;
  const descriptor = (archiveColumns[table] as Record<string, { kind: string; nullable: boolean }>)[v.field];
  if (!descriptor || isArchiveReviewField(v.field) || !Object.hasOwn(FIELD_LABELS, v.field)) return false;
  if (v.value === null ? !descriptor.nullable : descriptor.kind === "text[]" ? !Array.isArray(v.value) || !v.value.every((s) => typeof s === "string")
    : ["numeric", "integer", "bigint"].includes(descriptor.kind) ? typeof v.value !== "number" || !Number.isFinite(v.value) || (descriptor.kind !== "numeric" && !Number.isSafeInteger(v.value))
    : descriptor.kind === "boolean" ? typeof v.value !== "boolean" : typeof v.value !== "string" || (descriptor.kind === "uuid" && !uuid(v.value))) return false;
  const enums = archiveEnums as Record<string, readonly string[]>;
  if (v.value !== null && enums[`${table}.${v.field}`] && !enums[`${table}.${v.field}`].includes(v.value as string)) return false;
  if (table === "artwork_artists" ? v.reviewStatus !== null : v.reviewStatus !== null && !archiveEnums["artists.review_status"].includes(v.reviewStatus as never)) return false;
  if (["artworks", "artwork_artists"].includes(table) ? !enums[`${table}.attribution_status`].includes(v.attributionStatus as string) : v.attributionStatus !== null) return false;
  if (!Array.isArray(v.sources) || (table === "artwork_artists" && v.sources.length)) return false;
  const expected = { artists: "artist_sources", artworks: "artwork_sources", images: "image_sources", artwork_artists: "" }[table];
  const ids = new Set<string>();
  let previous = "";
  return v.sources.every((s) => {
    if (!exact(s, ["linkTable", "linkId", "sourceId", "title", "supportedField", "locator"]) || s.linkTable !== expected || !uuid(s.linkId) || !uuid(s.sourceId)
      || typeof s.title !== "string" || (s.supportedField !== "" && s.supportedField !== v.field) || typeof s.locator !== "string" || ids.has(s.linkId) || s.linkId < previous) return false;
    ids.add(s.linkId); previous = s.linkId; return true;
  });
}
export function parseAssistant(input: unknown): AssistantMessage {
  const fail = () => { throw new Error("Invalid assistant response"); };
  if (!isObject(input) || !exact(input, ["id", "role", "text", "notices", "kind", "blocks", "references", ...(input.kind === "clarification" ? ["question"] : [])])
    || !uuid(input.id) || input.role !== "assistant" || !text(input.text, LIMITS.canonical) || !Array.isArray(input.notices)
    || !input.notices.every((n) => typeof n === "string" && Object.hasOwn(NOTICE_TEXT, n)) || new Set(input.notices).size !== input.notices.length) return fail();
  const order = Object.keys(NOTICE_TEXT);
  if (input.notices.some((n, i, arr) => i > 0 && order.indexOf(n) <= order.indexOf(arr[i - 1])) || (input.notices.includes("no_retrieval") && input.notices.includes("no_matches"))) return fail();
  if (input.kind === "clarification") {
    if (!text(input.question, 200) || !Array.isArray(input.blocks) || input.blocks.length || !Array.isArray(input.references) || input.references.length || input.notices.some((n) => n !== "image_history_omitted")) return fail();
  } else if (input.kind === "answer") {
    parseBlocks({ blocks: input.blocks });
    if (!Array.isArray(input.references) || input.references.length > 64 || !input.references.every(validReference)) return fail();
    const refs = input.references as AnswerReference[];
    const keys = (input.blocks as AnswerBlock[]).flatMap((b) => b.evidenceKeys);
    if (new Set(refs.map((r) => r.key)).size !== refs.length || refs.length !== new Set(keys).size
      || refs.some((r, i) => !keys.includes(r.key) || (i > 0 && Number(r.key.slice(1)) <= Number(refs[i - 1].key.slice(1))))
      || (input.notices.some((n) => n === "no_matches" || n === "no_retrieval") && refs.length)) return fail();
  } else return fail();
  const message = input as AssistantMessage;
  if (canonical(message) !== message.text) return fail();
  return message;
}
