import { AnswerFailure, codePoints, exact, type ChatErrorCode } from "@/lib/answers/contracts";
import { UUID, normalizeQuery } from "@/lib/retrieval/contracts";
import { REGIONS, type Comparison, type ImageRequest, type ObservationBody, type Observation, type Plan, type BoundQuery } from "./types";

export const id = (v: unknown): v is string => typeof v === "string" && v.isWellFormed() && v === v.trim() && [...v].length >= 1 && [...v].length <= 64 && !/[\p{Cc}\p{Cf}]/u.test(v);
export const uuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v) && v === v.toLowerCase();
export const sha = (v: unknown): v is string => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
export const prose = (v: unknown, max: number): v is string => typeof v === "string" && v.isWellFormed() && !!v.trim() && v === v.trim() && codePoints(v) <= max && !/[\p{Cc}]/u.test(v.replace(/[\n\t]/g, ""));
export const list = (v: unknown, max: number): v is string[] => Array.isArray(v) && v.length <= max && v.every(id) && new Set(v).size === v.length;
export const same = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((v, i) => v === b[i]);
export const comparisonContradicts = (comparison: Comparison) => comparison.assessment === "different_work" || comparison.contradictions.length > 0 || comparison.proofs.some((p) => p.finding === "mismatch");
export function fail(code: ChatErrorCode = "invalid_model_output"): never { throw new AnswerFailure(code); }
export function observationText(body: ObservationBody) { return [...body.facts, ...body.readings, ...body.interpretations, ...body.limitations].map((i) => i.text).join(""); }
export function parseObservationBody(value: unknown, code: ChatErrorCode = "invalid_model_output"): ObservationBody {
  const bad = () => fail(code);
  if (!exact(value, ["imageId", "facts", "readings", "interpretations", "limitations"]) || !id(value.imageId)) return bad();
  if (!Array.isArray(value.facts) || !value.facts.length || value.facts.length > 6 || !value.facts.every((f) => exact(f, ["text", "region"]) && prose(f.text, 80) && REGIONS.includes(f.region as never))) return bad();
  if (!Array.isArray(value.readings) || value.readings.length > 3 || !value.readings.every((r) => exact(r, ["text", "region", "kind", "certainty"]) && prose(r.text, 64) && REGIONS.includes(r.region as never) && ["collection", "accession", "inscription", "other"].includes(String(r.kind)) && ["clear", "tentative", "unreadable"].includes(String(r.certainty)) && (r.certainty !== "unreadable" || r.text === "未能辨认"))) return bad();
  if (!Array.isArray(value.interpretations) || value.interpretations.length > 3 || !value.interpretations.every((i) => exact(i, ["text", "certainty"]) && prose(i.text, 80) && ["clear", "tentative"].includes(String(i.certainty)))) return bad();
  if (!Array.isArray(value.limitations) || value.limitations.length > 3 || !value.limitations.every((l) => exact(l, ["text", "affectsIdentity"]) && prose(l.text, 80) && typeof l.affectsIdentity === "boolean")) return bad();
  for (const items of [value.facts, value.readings, value.interpretations, value.limitations]) if (new Set(items.map((i) => JSON.stringify(i))).size !== items.length) return bad();
  const body = value as ObservationBody;
  if (codePoints(observationText(body)) > 300 || /https?:\/\/|www\./i.test(observationText(body))) return bad();
  return body;
}
export function parseObservation(value: unknown, code: ChatErrorCode = "invalid_image_context"): Observation {
  if (!exact(value, ["imageId", "facts", "readings", "interpretations", "limitations", "id", "imageSha256", "originTurnId", "originAssistantId", "pass", "supersedes"])) return fail(code);
  const { imageId, facts, readings, interpretations, limitations } = value;
  parseObservationBody({ imageId, facts, readings, interpretations, limitations }, code);
  if (!uuid(value.id) || !sha(value.imageSha256) || !id(value.originTurnId) || !uuid(value.originAssistantId) || !["analysis", "verification"].includes(String(value.pass)) || (value.supersedes !== null && (!uuid(value.supersedes) || value.supersedes === value.id))) return fail(code);
  return value as Observation;
}
export function parseRequest(value: unknown, header: string | null = null): ImageRequest {
  if (header !== null && header !== "2") return fail("invalid_request");
  if (header === "2" && exact(value, ["turnId", "messages"]) && Array.isArray(value.messages)) {
    value = { version: 2, turnId: value.turnId, messages: value.messages.map((m) => exact(m, ["id", "role", "text"]) ? { ...m, imageIds: [] } : m), images: [], inputs: [], observations: [], sameWorkSets: [], intent: { kind: "question" } };
  }
  if (!exact(value, ["version", "turnId", "messages", "images", "inputs", "observations", "sameWorkSets", "intent"]) || value.version !== 2 || !id(value.turnId) || !Array.isArray(value.messages) || !value.messages.length) return fail("invalid_request");
  if (value.messages.some((m) => !exact(m, ["id", "role", "text", "imageIds"]) || typeof m.text !== "string" || !m.text.isWellFormed() || /[\p{Cc}]/u.test(m.text.replace(/[\n\t]/g, "")))) return fail("invalid_request");
  const r = { ...value, messages: value.messages.map((m) => ({ ...m, text: m.text.trim() })) } as ImageRequest;
  if (r.messages.length > 32) return fail("context_too_large");
  if ((Array.isArray(r.images) && r.images.length > 20) || (Array.isArray(r.inputs) && r.inputs.length > 4)) return fail("image_context_too_large");
  if (!r.messages.every((m) => exact(m, ["id", "role", "text", "imageIds"]) && id(m.id) && ["user", "assistant"].includes(m.role) && typeof m.text === "string" && m.text.isWellFormed() && m.text === m.text.trim() && (!m.text || prose(m.text, Infinity)) && list(m.imageIds, 4) && (m.role === "assistant" ? !!m.text && !m.imageIds.length : !!m.text || !!m.imageIds.length)) || new Set(r.messages.map((m) => m.id)).size !== r.messages.length || r.messages.at(-1)?.id !== r.turnId || r.messages.at(-1)?.role !== "user") return fail("invalid_request");
  if (!Array.isArray(r.images) || !Array.isArray(r.inputs)) return fail("invalid_request");
  if (r.images.length > 20 || r.inputs.length > 4) return fail("image_context_too_large");
  if (r.images.some((i) => !exact(i, ["id", "ownerMessageId", "displayIndex", "mimeType", "width", "height", "sha256"]) || !["image/jpeg", "image/png"].includes(i.mimeType))) return fail("invalid_request");
  if (!r.images.every((i) => exact(i, ["id", "ownerMessageId", "displayIndex", "mimeType", "width", "height", "sha256"]) && id(i.id) && id(i.ownerMessageId) && Number.isInteger(i.displayIndex) && i.displayIndex >= 1 && i.displayIndex <= 1_000_000 && ["image/jpeg", "image/png"].includes(i.mimeType) && [i.width, i.height].every((n) => Number.isInteger(n) && n > 0 && n <= 1600) && sha(i.sha256))) return fail("invalid_image_context");
  if (new Set(r.images.map((i) => i.id)).size !== r.images.length || new Set(r.images.map((i) => i.displayIndex)).size !== r.images.length) return fail("invalid_image_context");
  const manifest = new Map(r.images.map((i) => [i.id, i]));
  const used = new Set(r.messages.flatMap((m) => m.imageIds));
  if (used.size !== manifest.size || [...used].some((i) => !manifest.has(i))) return fail("invalid_image_context");
  for (const image of r.images) {
    const owner = r.messages.findIndex((m) => m.imageIds.includes(image.id));
    if (r.messages[owner]?.role !== "user" || r.messages[owner]?.id !== image.ownerMessageId || (owner < r.messages.length - 1 && r.messages[owner + 1]?.role !== "assistant")) return fail("invalid_image_context");
  }
  for (const m of r.messages) if (!same(m.imageIds, [...m.imageIds].sort((a, b) => manifest.get(a)!.displayIndex - manifest.get(b)!.displayIndex))) return fail("invalid_image_context");
  if (r.inputs.some((i) => !exact(i, ["imageId", "data"]) || typeof i.data !== "string")) return fail("invalid_request");
  if (!r.inputs.every((i) => id(i.imageId)) || !same(r.inputs.map((i) => i.imageId), r.messages.at(-1)!.imageIds)) return fail("invalid_image_context");
  if (!Array.isArray(r.observations) || r.observations.length > 20) return fail("invalid_image_context");
  r.observations.forEach((o) => {
    if (!exact(o, ["imageId", "facts", "readings", "interpretations", "limitations", "id", "imageSha256", "originTurnId", "originAssistantId", "pass", "supersedes"]) || !["analysis", "verification"].includes(o.pass)) fail("invalid_request");
    if (![o.facts, o.readings, o.interpretations, o.limitations].every(Array.isArray)) fail("invalid_request");
    if (o.limitations.some((l) => !exact(l, ["text", "affectsIdentity"]) || typeof l.affectsIdentity !== "boolean")) fail("invalid_request");
    if (o.facts.some((f) => !exact(f, ["text", "region"]) || !REGIONS.includes(f.region)) || o.readings.some((reading) => !exact(reading, ["text", "region", "kind", "certainty"]) || !REGIONS.includes(reading.region) || !["collection", "accession", "inscription", "other"].includes(reading.kind) || !["clear", "tentative", "unreadable"].includes(reading.certainty)) || o.interpretations.some((i) => !exact(i, ["text", "certainty"]) || !["clear", "tentative"].includes(i.certainty))) fail("invalid_request");
    parseObservation(o);
    const image = manifest.get(o.imageId), origin = r.messages.findIndex((m) => m.id === o.originTurnId);
    if (!image || image.ownerMessageId === r.turnId || o.imageSha256 !== image.sha256 || origin < 0 || r.messages[origin].role !== "user" || !r.messages[origin].imageIds.includes(o.imageId) || r.messages[origin + 1]?.id !== o.originAssistantId || r.messages[origin + 1]?.role !== "assistant") fail("invalid_image_context");
  });
  if (new Set(r.observations.map((o) => o.imageId)).size !== r.observations.length || new Set(r.observations.map((o) => o.id)).size !== r.observations.length) return fail("invalid_image_context");
  if (!Array.isArray(r.sameWorkSets) || r.sameWorkSets.length > 2 || r.sameWorkSets.some((s) => !list(s, 4) || s.length < 2 || s.some((i) => !manifest.has(i))) || r.sameWorkSets.flat().length > 4 || new Set(r.sameWorkSets.flat()).size !== r.sameWorkSets.flat().length) return fail("invalid_image_context");
  if (!exact(r.intent, ["kind"]) || r.intent.kind !== "question") {
    if (!exact(r.intent, ["kind", "sourceTurnId", "sourceAssistantId", "imageIds"]) || r.intent.kind !== "reread") return fail("invalid_request");
    if (!id(r.intent.sourceTurnId) || !uuid(r.intent.sourceAssistantId) || !list(r.intent.imageIds, 4) || !r.intent.imageIds.length || !same(r.intent.imageIds, r.messages.at(-1)!.imageIds) || r.messages.at(-3)?.id !== r.intent.sourceTurnId || r.messages.at(-3)?.role !== "user" || r.messages.at(-2)?.id !== r.intent.sourceAssistantId || r.messages.at(-2)?.role !== "assistant" || r.messages.at(-3)?.text !== r.messages.at(-1)?.text) return fail("invalid_image_context");
  }
  if (codePoints(r.messages.at(-1)!.text) > 2000 || r.messages.reduce((n, m) => n + codePoints(m.text), 0) + r.observations.reduce((n, o) => n + codePoints(observationText(o)), 0) > 16_000) return fail("context_too_large");
  return r;
}

export function parseImagePlan(value: unknown, request: ImageRequest): Plan {
  const known = new Map(request.images.map((i) => [i.id, i.displayIndex]));
  const selected = request.inputs.map((i) => i.imageId);
  if (exact(value, ["action", "question"]) && value.action === "clarify" && prose(value.question, 200) && /\p{Script=Han}/u.test(value.question) && !/https?:\/\/|www\./i.test(value.question)) return { action: "clarify", question: value.question };
  if (exact(value, ["action", "imageIds"]) && value.action === "needs_image" && list(value.imageIds, 4) && value.imageIds.length && value.imageIds.every((i) => known.has(i)) && value.imageIds.some((i) => !selected.includes(i))) return { action: "needs_image", imageIds: [...value.imageIds].sort((a, b) => known.get(a)! - known.get(b)!) };
  if (!exact(value, ["action", "observations", "groups", "queries"]) || value.action !== "answer" || !Array.isArray(value.observations) || !Array.isArray(value.groups) || value.groups.length > 4 || !Array.isArray(value.queries) || value.queries.length > (value.groups.length ? 4 : 2)) return fail();
  const p = value as Extract<Plan, { action: "answer" }>;
  p.observations.forEach((o) => parseObservationBody(o));
  if (!same(p.observations.map((o) => o.imageId).sort(), [...selected].sort())) return fail();
  const all: string[] = [];
  for (const [n, g] of p.groups.entries()) {
    if (!exact(g, ["id", "imageIds", "representativeImageId", "task", "search"]) || g.id !== `G${n + 1}` || !list(g.imageIds, 4) || !g.imageIds.length || g.imageIds.some((i) => !known.has(i)) || !same(g.imageIds, [...g.imageIds].sort((a, b) => known.get(a)! - known.get(b)!)) || !["interpret", "identify", "compare"].includes(g.task) || !["not_requested", "no_clue", "planned"].includes(g.search) || g.representativeImageId !== (g.imageIds.find((i) => selected.includes(i)) ?? null) || (g.imageIds.length > 1 && !request.sameWorkSets.some((s) => g.imageIds.every((i) => s.includes(i))))) return fail();
    all.push(...g.imageIds);
  }
  if (all.length > 4 || new Set(all).size !== all.length || selected.some((i) => !all.includes(i))) return fail();
  const queries: BoundQuery[] = [];
  for (const wrapper of p.queries) {
    if (!exact(wrapper, ["query", "groupIds"]) || !list(wrapper.groupIds, 4) || wrapper.groupIds.some((i) => !p.groups.some((g) => g.id === i && g.search === "planned"))) return fail();
    let query;
    try { query = normalizeQuery(wrapper.query); } catch { return fail(); }
    if (query.kind === "search" && (query.limit > 5 || query.filters.some((f) => codePoints(f.value) > 64 || /https?:\/\/|www\./i.test(f.value)))) return fail();
    if (query.entity !== "artwork" && wrapper.groupIds.some((i) => p.groups.find((g) => g.id === i)?.task === "identify")) return fail();
    const key = JSON.stringify(query), old = queries.find((q) => JSON.stringify(q.query) === key);
    if (old) {
      if (!old.groupIds.length || !wrapper.groupIds.length || wrapper.groupIds.some((i) => old.groupIds.includes(i))) return fail();
      old.groupIds.push(...wrapper.groupIds);
    } else queries.push({ query, groupIds: [...wrapper.groupIds] });
  }
  if (p.groups.some((g) => (g.search === "planned") !== queries.some((q) => q.groupIds.includes(g.id)))) return fail();
  return { ...p, queries };
}
