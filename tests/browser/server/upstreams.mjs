import { syntheticEnvironment } from "./settings.mjs";
import { readFileSync } from "node:fs";
for (const [key, value] of Object.entries(syntheticEnvironment)) {
  if (key === "DEEPSEEK_ENABLED") continue;
  if (process.env[key] !== value) throw new Error("Unsafe browser fixture configuration");
}
if (!["true", "false"].includes(process.env.DEEPSEEK_ENABLED)) throw new Error("Missing fixture enablement");
const artist = JSON.parse(readFileSync(new URL("./artist.json", import.meta.url), "utf8"));
const originalFetch = globalThis.fetch;
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
const completion = (data) => reply({ choices: [{ finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(data) } }], usage: { prompt_tokens: 100, completion_tokens: 40, total_tokens: 140 } });
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) return originalFetch(input, options);
  if (url.origin === "https://api.deepseek.com" && url.pathname === "/chat/completions") {
    if (process.env.DEEPSEEK_ENABLED !== "true" || new Headers(options.headers).get("Authorization") !== `Bearer ${syntheticEnvironment.DEEPSEEK_API_KEY}`) throw new Error("Unexpected fixture provider access");
    const payload = JSON.parse(options.body);
    if (payload.stream !== false || payload.thinking?.type !== "disabled" || payload.model !== "deepseek-flash") throw new Error("Invalid fixture provider options");
    const data = JSON.parse(payload.messages[1].content);
    const question = data.context.at(-1).text;
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
      ...(fact ? [{ kind: "archive", text: "该画师的档案生平记载：这是用于浏览器验证的合成生平。", evidenceKeys: [fact.key] }] : []),
      { kind: "general", text: "唐卡艺术可从题材、构图与设色等方面欣赏。", evidenceKeys: [] },
      { kind: "general", text: "同一题材可以采用不同风格，观察时可分别比较。", evidenceKeys: [] },
    ] });
  }
  if (url.origin === syntheticEnvironment.NEXT_PUBLIC_SUPABASE_URL) {
    if (url.pathname.endsWith("/rpc/search_archive_candidates")) {
      const data = JSON.parse(options.body);
      return reply(data.p_filters.some((f) => f.value === "无匹配") ? [] : [{ id: artist.id, rank: 0, matches: [{ field: "name", column: "display_name", mode: "exact" }] }]);
    }
    const table = url.pathname.split("/").at(-1);
    return reply(table === "artists" ? [artist] : []);
  }
  throw new Error("Blocked nonallowlisted browser fixture network");
};
