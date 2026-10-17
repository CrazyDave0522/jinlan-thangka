import "server-only";
import { randomUUID } from "node:crypto";
import { AnswerFailure, codePoints, jsonBytes, type AnswerReference } from "@/lib/answers/contracts";
import { buildAnswerCatalogue, mergeEvidence, publicReference } from "@/lib/answers/catalogue";
import { generateAnswer } from "@/lib/answers/orchestrator";
import { complete, type ProviderConfig, type ProviderPart } from "@/lib/answers/provider";
import type { Scope } from "@/lib/answers/runtime";
import { retrieveArchive } from "@/lib/retrieval/service";
import type { ImageRequest, Assistant, Observation, Plan, Success } from "./types";
import { VISION_NOTICES } from "./types";
import { parseImagePlan } from "./validation";
import { canonicalImage, parseAssistantV2, parseGenerated, REREAD_QUESTION } from "./output";
import { buildGroups, identifyByNumber, identifyByReference, type SuccessResult } from "./identity";
import { readReferences, selectReferences } from "./references";
import { IMAGE_ANSWER_PROMPT, IMAGE_PLANNER_PROMPT } from "./prompts";
import { namedLookups, requireNamedLookups } from "@/lib/answers/named-retrieval";

const dependencies = { complete, retrieve: retrieveArchive, selectReferences, readReferences };
function finish(message: Assistant, request: ImageRequest, scope: Scope): Success {
  message.text = canonicalImage(message, request);
  const response: Success = { version: 2, turnId: request.turnId, message };
  if (codePoints(message.text) > 3500 || jsonBytes(response) > 128_000) throw new AnswerFailure("evidence_too_large");
  parseAssistantV2(message, request); scope.check(); return response;
}
export async function generateV2(request: ImageRequest, config: ProviderConfig, scope: Scope, deps = dependencies): Promise<Success> {
  if (!request.images.length) {
    const legacy = await generateAnswer({ turnId: request.turnId, messages: request.messages.map(({ id, role, text }) => ({ id, role, text })) }, config, scope, { complete: deps.complete, retrieve: deps.retrieve });
    const answer = legacy.message;
    const base = { id: answer.id, role: answer.role, text: "", notices: answer.notices.filter((n) => n !== "image_history_omitted"), references: answer.references, observations: [], groups: [], referenceImages: [], comparisons: [] };
    return finish(answer.kind === "clarification" ? { ...base, kind: "clarification", question: answer.question, reread: null, blocks: [], notices: [] } : { ...base, kind: "answer", reread: null, blocks: answer.blocks.map((b) => ({ ...b, observationIds: [] })) }, request, scope);
  }
  let id = randomUUID(); while (request.messages.some((m) => m.id === id)) id = randomUUID();
  const context = request.messages.map(({ role, text, imageIds }) => ({ role, text, imageIds }));
  const requiredLookups = namedLookups(request.messages.at(-1)!.text);
  const question = request.messages.at(-1)!.text;
  const planData = { protocol: 2, kind: "plan", turnId: request.turnId, question, intent: request.intent.kind, context, images: request.images, selectedImageIds: request.inputs.map((i) => i.imageId), priorObservations: request.observations, sameWorkSets: request.sameWorkSets, requiredLookups };
  const parts: ProviderPart[] = [{ type: "text", text: JSON.stringify(planData) }];
  for (const input of request.inputs) {
    const image = request.images.find((i) => i.id === input.imageId)!;
    parts.push({ type: "text", text: `Visitor image ${image.id} [图片${image.displayIndex}]` }, { type: "image_url", image_url: { url: `data:${image.mimeType};base64,${input.data}`, detail: "original" } });
  }
  const planned = await deps.complete(config, request.inputs.length ? "analysis" : "planner", [{ role: "system", content: IMAGE_PLANNER_PROMPT }, { role: "user", content: parts }], scope);
  let plan: Plan = parseImagePlan(planned.content, request);
  if (plan.action === "answer") plan = parseImagePlan({ ...plan, queries: requireNamedLookups(plan.queries, requiredLookups, plan.groups.length ? 4 : 2, (query) => ({ query, groupIds: [] })) }, request);
  if (plan.action === "answer" && plan.groups.some((g) => g.task === "identify" && !g.representativeImageId)) {
    const targets = new Set([...request.inputs.map((i) => i.imageId), ...plan.groups.filter((g) => g.task === "identify").flatMap((g) => g.imageIds)]);
    plan = { action: "needs_image", imageIds: request.images.filter((i) => targets.has(i.id)).sort((a, b) => a.displayIndex - b.displayIndex).map((i) => i.id) };
  }
  const base = { id, role: "assistant" as const, text: "", notices: [], blocks: [], references: [], observations: [], groups: [], referenceImages: [], comparisons: [] };
  if (plan.action !== "answer") return finish({ ...base, kind: "clarification", question: plan.action === "clarify" ? plan.question : REREAD_QUESTION,
    reread: plan.action === "needs_image" ? { sourceTurnId: request.turnId, sourceAssistantId: id, imageIds: plan.imageIds } : null }, request, scope);
  const current: Observation[] = request.inputs.map((input) => ({ ...plan.observations.find((o) => o.imageId === input.imageId)!, id: randomUUID(), imageSha256: request.images.find((i) => i.id === input.imageId)!.sha256,
    originTurnId: request.turnId, originAssistantId: id, pass: "analysis", supersedes: request.observations.find((o) => o.imageId === input.imageId)?.id ?? null }));
  const results: SuccessResult[] = await scope.wait(Promise.all(plan.queries.map(async (q) => {
    try { const result = await deps.retrieve(q.query, { signal: scope.signal }); scope.check(); if (result.status === "error") throw new AnswerFailure("retrieval_failed"); return result; }
    catch (error) { scope.check(); throw error instanceof AnswerFailure ? error : new AnswerFailure("retrieval_failed"); }
  })));
  const graph = mergeEvidence(results);
  const catalogue = buildAnswerCatalogue(graph);
  const groups = buildGroups(plan, results, graph);
  for (const [n, g] of plan.groups.entries()) groups[n].identity = identifyByNumber(g, groups[n], current, plan, results, graph, catalogue);
  const selection = deps.selectReferences(plan.groups, groups, graph);
  const references = selection.references.length ? await deps.readReferences(selection, scope) : [];
  const provenance = plan.queries.map((q, n) => ({ ...q, roots: results[n].candidates, candidateLimitReached: results[n].candidateLimitReached }));
  const priorObservations = request.observations.filter((o) => !current.some((c) => c.imageId === o.imageId));
  const answerTask = { question, intent: request.intent.kind, selectedImageIds: request.inputs.map((i) => i.imageId), currentObservationIds: current.map((o) => o.id), priorObservationIds: priorObservations.map((o) => o.id) };
  const answerData = { protocol: 2, kind: "answer", turnId: request.turnId, answerTask, context, observations: current, priorObservations, groups, provenance, catalogue,
    retrievalStatus: !results.length ? "not_searched" : results.some((r) => r.candidates.length) ? "matched" : "no_matches", tasks: selection.tasks };
  const answerParts: ProviderPart[] = [{ type: "text", text: JSON.stringify(answerData) }];
  for (const visitorId of new Set(selection.tasks.map((t) => t.visitorImageId))) {
    const image = request.images.find((i) => i.id === visitorId)!, input = request.inputs.find((i) => i.imageId === visitorId)!;
    answerParts.push({ type: "text", text: `Visitor image ${visitorId}` }, { type: "image_url", image_url: { url: `data:${image.mimeType};base64,${input.data}`, detail: "original" } });
  }
  for (const reference of references) answerParts.push({ type: "text", text: `Archive reference ${reference.evidence.key}, artwork ${reference.evidence.artworkId}` }, { type: "image_url", image_url: { url: `data:${reference.mimeType};base64,${reference.data}`, detail: "original" } });
  const generated = await deps.complete(config, selection.tasks.length ? "verification" : request.inputs.length ? "image_answer" : "answer", [{ role: "system", content: IMAGE_ANSWER_PROMPT }, { role: "user", content: selection.tasks.length ? answerParts : JSON.stringify(answerData) }], scope);
  const parsed = parseGenerated(generated.content, request, current, catalogue, selection.tasks);
  for (const update of parsed.observationUpdates) {
    const index = current.findIndex((o) => o.imageId === update.imageId);
    current[index] = { ...current[index], ...update, pass: "verification" };
  }
  for (const [n, group] of groups.entries()) {
    group.identity = identifyByNumber(plan.groups[n], group, current, plan, results, graph, catalogue);
    group.identity = identifyByReference(group, parsed.comparisons, selection.tasks, catalogue, graph, selection.reasons.get(group.id) ?? [], current);
  }
  const comparisons = parsed.comparisons.map((c, n) => { const { id: _id, ...task } = selection.tasks[n]; void _id; return { ...c, ...task }; });
  const used = new Set([...parsed.blocks.flatMap((b) => b.evidenceKeys), ...comparisons.flatMap((c) => c.proofs.map((p) => p.evidenceKey)), ...groups.flatMap((g) => g.identity.status === "identified" ? g.identity.evidenceKeys : [])]);
  if (used.size > 64) throw new AnswerFailure("evidence_too_large");
  const publicRefs: AnswerReference[] = catalogue.filter((f) => used.has(f.key)).map(publicReference);
  const applicable = new Set<string>();
  if (!results.length) applicable.add("no_retrieval"); else if (!results.some((r) => r.candidates.length)) applicable.add("no_matches");
  if (publicRefs.some((r) => !r.sources.some((s) => s.supportedField === r.field))) applicable.add("record_only");
  if (results.some((r) => r.candidateLimitReached) || groups.some((g) => g.candidateLimitReached)) applicable.add("candidate_limit");
  if (publicRefs.some((r) => (r.owner.table !== "artwork_artists" && r.reviewStatus !== "verified") || (["artworks", "artwork_artists"].includes(r.owner.table) && r.attributionStatus !== "confirmed"))) applicable.add("uncertain_records");
  if (current.length) applicable.add("image_interpretation");
  if (parsed.blocks.some((b) => b.observationIds.some((i) => !current.some((o) => o.id === i)))) applicable.add("prior_observations");
  if (comparisons.length) applicable.add("reference_compared");
  if (groups.some((g) => (g.identity.status === "candidates" || g.identity.status === "insufficient_evidence") && g.identity.reasons.some((r) => ["references_missing", "reference_not_authorized", "reference_limit"].includes(r)))) applicable.add("reference_limited");
  return finish({ ...base, kind: "answer", reread: null, blocks: parsed.blocks, references: publicRefs, observations: current, groups,
    comparisons, referenceImages: references.map((r) => r.evidence), notices: VISION_NOTICES.filter((n) => applicable.has(n)) }, request, scope);
}
