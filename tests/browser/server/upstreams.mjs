import { syntheticEnvironment } from "./settings.mjs";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { AsyncLocalStorage } from "node:async_hooks";
import { Server } from "node:http";
import { fileURLToPath } from "node:url";
for (const [key, value] of Object.entries(syntheticEnvironment)) {
  if (["DEEPSEEK_ENABLED", "DEEPSEEK_VISION_ENABLED"].includes(key)) continue;
  if (process.env[key] !== value) throw new Error("Unsafe browser fixture configuration");
}
if (!["true", "false"].includes(process.env.DEEPSEEK_ENABLED)) throw new Error("Missing fixture enablement");
if (!["true", "false"].includes(process.env.DEEPSEEK_VISION_ENABLED)) throw new Error("Missing fixture vision enablement");
// Test-only HTTP scope keeps parallel browser cases out of each other's counters.
const auditScope = new AsyncLocalStorage();
const auditDirectory = fileURLToPath(new URL("../../../test-results/source-audit/", import.meta.url));
const auditCounters = new Map();
function record(kind) {
  const id = auditScope.getStore()?.id;
  if (!id) return;
  const counts = auditCounters.get(id) ?? { chat: 0, model: 0, archive: 0, storage: 0 };
  counts[kind]++;
  auditCounters.set(id, counts);
  mkdirSync(auditDirectory, { recursive: true });
  writeFileSync(`${auditDirectory}/${id}.json`, JSON.stringify(counts));
}
const originalEmit = Server.prototype.emit;
Server.prototype.emit = function (event, ...args) {
  if (event !== "request") return originalEmit.call(this, event, ...args);
  const request = args[0];
  const header = request.headers["x-jinlan-test-case"];
  return auditScope.run({ id: typeof header === "string" && /^[a-z0-9-]{1,64}$/.test(header) ? header : null, sources: false, revised: false }, () => {
    if (request.url.split("?")[0] === "/api/chat") record("chat");
    return originalEmit.call(this, event, ...args);
  });
};
const artist = JSON.parse(readFileSync(new URL("./artist.json", import.meta.url), "utf8"));
const vision = JSON.parse(readFileSync(new URL("./vision-archive.json", import.meta.url), "utf8"));
const artworkId = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const attempts = new Map();
let permissionReads = 0;
const originalFetch = globalThis.fetch;
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
const completion = (data) => reply({ choices: [{ finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(data) } }], usage: { prompt_tokens: 100, completion_tokens: 40, total_tokens: 140 } });
function visionCompletion(payload, data, question) {
  const parts = Array.isArray(payload.messages[1].content) ? payload.messages[1].content : [];
  const pictures = parts.filter((p) => p.type === "image_url");
  const current = data.context.at(-1).imageIds;
  if (data.kind === "plan") {
    if (pictures.length !== current.length || pictures.length > 4 || payload.max_tokens !== (current.length ? 2048 : 1024)) throw new Error("Unexpected selected-image planner traffic");
    const selected = new Map();
    for (let n = 0; n < current.length; n++) selected.set(current[n], pictures[n].image_url.url);
    attempts.set(data.turnId, { selected, answered: false });
    if (!current.length && /\[vision:(reread|multi-reread)\]/.test(question)) return completion({ action: "needs_image", imageIds: question.includes("[vision:multi-reread]") ? data.images.slice(0, 4).map((image) => image.id) : [data.images[0].id] });
    const ids = current.length ? current : data.images.slice(0, 1).map((i) => i.id);
    const correctedNumber = /\[vision:corrected-number-(conflict|consistent)\]/.test(question);
    const numbered = question.includes("[vision:numbered]") || question.includes("[vision:identity-limit]") || correctedNumber;
    const emptyNamed = /\[vision:empty-(named|overfiltered)\]/.test(question);
    const noClue = question.includes("[vision:empty-no-clue]");
    const identify = numbered || emptyNamed || noClue || /\[vision:(ordinary|uncertain|reference-failure|reference-retry|reference-conflict|corrected-conflict)\]/.test(question);
    const observations = current.map((imageId, n) => ({ imageId, facts: [{ text: "中央人物两侧有侍者，局部可见花纹。", region: "whole" }], readings: numbered ? [{ text: "合成收藏", kind: "collection", certainty: "clear", region: "bottom_left" }, { text: `S-${n + 1}`, kind: "accession", certainty: "clear", region: "bottom_left" }] : [], interpretations: [{ text: "可能为观音题材。", certainty: "tentative" }], limitations: [] }));
    if (correctedNumber) observations[0].readings[1].certainty = "tentative";
    if (/\[vision:(reference-conflict|corrected-conflict)\]/.test(question)) observations[0].readings = [{ text: "S-999", kind: "accession", certainty: "clear", region: "bottom_left" }];
    if (question.includes("[vision:identity-limit]")) observations[0].limitations = [{ text: "标签与作品本体存在未解决的冲突。", affectsIdentity: true }];
    const hinted = data.sameWorkSets.filter((set) => set.every((id) => ids.includes(id)));
    const groupSets = [...hinted, ...ids.filter((id) => !hinted.flat().includes(id)).map((id) => [id])];
    const groups = groupSets.map((imageIds, n) => ({ id: `G${n + 1}`, imageIds, representativeImageId: imageIds.find((i) => current.includes(i)) ?? null, task: identify ? "identify" : "interpret", search: identify ? "planned" : "not_requested" }));
    const queries = identify ? groups.map((group, n) => ({ groupIds: [group.id], query: { kind: "search", entity: "artwork", filters: numbered ? [{ field: "collection", mode: "exact", value: "合成收藏" }, { field: "accession", mode: "exact", value: `S-${n + 1}` }] : [{ field: "subject", mode: "exact", value: question.includes("reference-failure") ? "参考图失败" : question.includes("reference-retry") ? "权限重查" : "观音" }], limit: 5 } })) : [];
    if (emptyNamed || noClue) {
      queries.length = 0;
      if (question.includes("[vision:empty-overfiltered]")) queries.push({ groupIds: [groups[0].id], query: { kind: "search", entity: "artwork", filters: [{ field: "name", mode: "contains", value: "空库合成作品17" }, { field: "subject", mode: "exact", value: "观音" }], limit: 5 } });
      else groups.forEach((g) => { g.search = "no_clue"; });
    }
    if (question.includes("[vision:bad-shape]")) return completion({ type: "json_object", action: "answer", observations, groups, queries });
    if (question.includes("[vision:long-observation]")) observations[0].facts = Array.from({ length: 4 }, (_, n) => ({ text: `${n}${"字".repeat(75)}`, region: "whole" }));
    return completion({ action: "answer", observations, groups, queries });
  }
  const attempt = attempts.get(data.turnId);
  if (!attempt || attempt.answered) throw new Error("Unexpected extra image answer call");
  attempt.answered = true;
  const visitorIds = [...new Set(data.tasks.map((t) => t.visitorImageId))];
  const referenceKeys = [...new Set(data.tasks.map((t) => t.referenceKey))];
  if (pictures.length !== visitorIds.length + referenceKeys.length || payload.max_tokens !== (data.tasks.length ? 3072 : 1536)) throw new Error("Unexpected verification traffic");
  visitorIds.forEach((id, n) => { if (!attempt.selected.has(id) || pictures[n].image_url.url !== attempt.selected.get(id)) throw new Error("Unselected historical image resent"); });
  const observations = data.observations.length ? data.observations : data.priorObservations.slice(0, 4);
  const comparisons = data.tasks.map((task) => {
    const uncertain = question.includes("[vision:uncertain]");
    const key = data.catalogue.find((f) => f.owner.table === "artworks" && f.owner.id === task.artworkId && f.field === "description").key;
    const positive = task.artworkId === artworkId(1);
    return { taskId: task.id, assessment: uncertain ? "uncertain" : positive ? "same_work" : "different_work", proofs: uncertain ? [] : positive ? [
      { evidenceKey: key, quote: "中央主尊两侧分别排列四位侍者", kind: "composition", finding: "match", visitorRegion: "whole", referenceRegion: "whole" },
      { evidenceKey: key, quote: "右下角有一处独特的白色莲花", kind: "local_detail", finding: "match", visitorRegion: "bottom_right", referenceRegion: "bottom_right" },
    ] : [{ evidenceKey: key, quote: "右下角有一处独特的白色莲花", kind: "local_detail", finding: "mismatch", visitorRegion: "bottom_right", referenceRegion: "bottom_right" }], contradictions: uncertain || positive ? [] : ["局部花瓣与所选图片不同。"] };
  });
  const observationUpdates = question.includes("[vision:corrected-conflict]") ? [{ imageId: observations[0].imageId, facts: observations[0].facts, readings: [{ text: "S-1", kind: "accession", certainty: "clear", region: "bottom_left" }], interpretations: observations[0].interpretations, limitations: [{ text: "实际重看标牌后，更正此前误读的编号。", affectsIdentity: false }] }] : [];
  if (/\[vision:corrected-number-(conflict|consistent)\]/.test(question)) {
    observationUpdates.push({ imageId: observations[0].imageId, facts: observations[0].facts, readings: observations[0].readings.map((r) => ({ ...r, certainty: "clear" })), interpretations: observations[0].interpretations, limitations: [{ text: "实际重看确认此前模糊的编号为 S-1。", affectsIdentity: false }] });
    if (question.includes("[vision:corrected-number-conflict]")) comparisons[0] = { taskId: "V1", assessment: "different_work", proofs: [{ evidenceKey: comparisons[0].proofs[1].evidenceKey, quote: "右下角有一处独特的白色莲花", kind: "local_detail", finding: "mismatch", visitorRegion: "bottom_right", referenceRegion: "bottom_right" }], contradictions: ["编号虽已读清，右下角花瓣仍与档案参考图不同。"] };
  }
  let text = data.observations.length ? "本次观察到中央人物及周围侍者，题材解读仍需结合细节核实。" : "沿用此前观察，人物两侧可见侍者；不能据此辨认新的小字。";
  if (question.includes("[vision:duplicate-marker]")) text = "可见中央人物。[图片1]";
  if (question.includes("[vision:duplicate-notice]")) text = "本次未检索数据库。视觉描述只对应已供观察。";
  return completion({ blocks: [{ kind: observations.length ? "visual" : "general", text, evidenceKeys: [], observationIds: observations.map((o) => o.id) }], comparisons, observationUpdates });
}
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) return originalFetch(input, options);
  if (url.origin === "https://api.deepseek.com" && url.pathname === "/chat/completions") {
    if (process.env.DEEPSEEK_ENABLED !== "true" || new Headers(options.headers).get("Authorization") !== `Bearer ${syntheticEnvironment.DEEPSEEK_API_KEY}`) throw new Error("Unexpected fixture provider access");
    record("model");
    const payload = JSON.parse(options.body);
    if (payload.stream !== false || payload.thinking?.type !== "disabled" || payload.model !== "deepseek-flash" || payload.temperature !== 0) throw new Error("Invalid fixture provider options");
    const content = payload.messages[1].content;
    const data = JSON.parse(typeof content === "string" ? content : content.find((p) => p.type === "text").text);
    const question = data.context.at(-1).text;
    const audit = auditScope.getStore();
    if (audit) { audit.sources = question.includes("[sources:"); audit.revised = question.includes("[sources:revised]"); }
    if (data.protocol === 2) return visionCompletion(payload, data, question);
    if (question.includes("[fixture:busy]")) return reply({}, 429);
    if (question.includes("[fixture:credit]")) return reply({}, 402);
    if (question.includes("[fixture:slow]")) await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 2500);
      options.signal?.addEventListener("abort", () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); }, { once: true });
    });
    if (payload.max_tokens === 1024) {
      if (question.includes("[fixture:clarify]")) return completion({ action: "clarify", question: "你想了解哪位画师或哪件作品？" });
      if (question.includes("[fixture:image]")) return completion({ action: "needs_image" });
      return completion({ action: "answer", queries: question.includes("[fixture:general]") || question.includes("[fixture:slow]") ? [] : [{ kind: "search", entity: "artist", filters: [{ field: "name", value: question.includes("[fixture:empty]") ? "无匹配" : "测试画师", mode: "exact" }], limit: 5 }] });
    }
    if (question.includes("[fixture:invalid]")) return completion({ blocks: [{ kind: "archive", text: "伪造引用", evidenceKeys: ["E999999"] }] });
    const fact = data.catalogue.find((f) => f.field === "biography");
    return completion({ blocks: [
      ...(fact ? [{ kind: "archive", text: `该画师的档案生平记载：${fact.value}`, evidenceKeys: [fact.key] }] : []),
      { kind: "general", text: "唐卡艺术可从题材、构图与设色等方面欣赏。", evidenceKeys: [] },
      { kind: "general", text: "同一题材可以采用不同风格，观察时可分别比较。", evidenceKeys: [] },
    ] });
  }
  if (url.origin === syntheticEnvironment.NEXT_PUBLIC_SUPABASE_URL) {
    if (url.pathname.startsWith("/storage/")) {
      record("storage");
      const imageId = url.pathname.split("/").at(-1).replace(/\.png$/, "");
      if (url.pathname !== `/storage/v1/object/fixtures/${imageId}.png` || url.search || !vision.bytes[imageId] || new Headers(options.headers).get("apikey") !== syntheticEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) throw new Error("Unexpected fixture Storage access");
      if (imageId === artworkId(103)) return reply({}, 403);
      if (imageId === artworkId(104)) return reply({}, 503);
      return new Response(Buffer.from(vision.bytes[imageId], "base64"), { headers: { "Content-Type": "image/png" } });
    }
    record("archive");
    if (url.pathname.endsWith("/rpc/search_archive_candidates")) {
      const data = JSON.parse(options.body);
      if (data.p_entity === "artwork") {
        if (data.p_filters.some((f) => f.field === "name" && f.value === "空库合成作品17")) {
          if (data.p_filters.length !== 1 || data.p_filters[0].mode !== "exact" || data.p_limit !== 5) throw new Error("Named search was narrowed or changed");
          return reply([]);
        }
        const accession = data.p_filters.find((f) => f.field === "accession");
        const subject = data.p_filters.find((f) => f.field === "subject")?.value;
        if (subject === "权限重查") permissionReads++;
        const ids = accession ? [Number(accession.value.slice(2))] : subject === "参考图失败" ? [3] : subject === "权限重查" ? [4] : [1, 2];
        return reply(ids.map((n) => ({ id: artworkId(n), rank: 0, matches: data.p_filters.map((f) => ({ field: f.field, column: f.field === "collection" ? "collection_name" : f.field === "accession" ? "accession_number" : "subject_primary", mode: f.mode })) })));
      }
      return reply(data.p_filters.some((f) => f.value === "无匹配") ? [] : [{ id: artist.id, rank: 0, matches: [{ field: "name", column: "display_name", mode: "exact" }] }]);
    }
    const table = url.pathname.split("/").at(-1);
    const audit = auditScope.getStore();
    if (audit?.sources) {
      const revised = audit.revised;
      if (table === "artists") return reply([{ ...artist, biography: revised ? "这是更新后的合成生平。" : artist.biography }]);
      if (table === "artist_sources") return reply([{ id: artworkId(7002), artist_id: artist.id, source_id: artworkId(7001), supported_field: "biography", locator: revised ? "第 9 页" : "第 3 页", evidence_notes: null, created_at: artist.created_at, updated_at: artist.updated_at }]);
      if (table === "sources") return reply([{ ...vision.sources[0], id: artworkId(7001), title: revised ? "修订合成资料" : "原始合成资料" }]);
    }
    if (["artworks", "images", "artwork_sources", "sources"].includes(table)) {
      const field = table === "images" || table === "artwork_sources" ? "artwork_id" : "id";
      const filter = url.searchParams.get(field) ?? "";
      let rows = vision[table].filter((row) => filter.includes(row[field]));
      if (table === "images" && permissionReads > 1) rows = rows.map((row) => row.artwork_id === artworkId(4) ? { ...row, permission_notes: "Synthetic permission was revoked" } : row);
      return reply(rows);
    }
    return reply(table === "artists" ? [artist] : []);
  }
  throw new Error("Blocked nonallowlisted browser fixture network");
};
