import "server-only";
import { AnswerFailure, LIMITS, jsonBytes } from "./contracts";
import { isObject } from "@/lib/retrieval/contracts";
import { createScope, readBounded, type Scope } from "./runtime";

export function providerConfig() {
  const key = process.env.DEEPSEEK_API_KEY;
  if (process.env.DEEPSEEK_ENABLED !== "true" || !key || !/^\S+$/.test(key) || /^(your[-_ ]|replace[-_ ]|<)/i.test(key)
    || (process.env.DEEPSEEK_MODEL ?? "deepseek-flash") !== "deepseek-flash") throw new AnswerFailure("generation_unavailable");
  return { key, model: "deepseek-flash" as const };
}
export type ProviderConfig = ReturnType<typeof providerConfig>;
export type ProviderPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail: "original" } };
export type ProviderMessage = { role: "system" | "user"; content: string | ProviderPart[] };
export type ProviderStage = "planner" | "answer" | "analysis" | "image_answer" | "verification";
export async function complete(config: ProviderConfig, stage: ProviderStage, messages: ProviderMessage[], scope: Scope) {
  const started = Date.now();
  const planner = stage === "planner" || stage === "analysis";
  const tokens = stage === "analysis" ? 2_048 : stage === "verification" ? 3_072 : stage === "planner" ? 1_024 : 1_536;
  const payload = { model: config.model, messages, stream: false, thinking: { type: "disabled" }, temperature: 0,
    response_format: { type: "json_object" }, max_tokens: tokens };
  const images = messages.flatMap((m) => Array.isArray(m.content) ? m.content.filter((p) => p.type === "image_url") : []);
  if (images.length > (stage === "analysis" ? 4 : stage === "verification" ? 8 : 0) || images.some((p) => p.image_url.detail !== "original" || !/^data:image\/(jpeg|png);base64,/.test(p.image_url.url))) throw new AnswerFailure(planner ? "context_too_large" : "evidence_too_large");
  const envelope = { ...payload, messages: messages.map((m) => ({ ...m, content: Array.isArray(m.content) ? m.content.filter((p) => p.type !== "image_url") : m.content })) };
  if (jsonBytes(envelope) > (planner ? LIMITS.plannerBytes : LIMITS.answerBytes) || jsonBytes(payload) > (stage === "analysis" ? 3_000_000 : stage === "verification" ? 6_000_000 : planner ? LIMITS.plannerBytes : LIMITS.answerBytes)) throw new AnswerFailure(planner ? "context_too_large" : "evidence_too_large");
  scope.check();
  const operation = createScope(scope.signal, stage === "analysis" ? 25_000 : stage === "image_answer" || stage === "verification" ? 20_000 : planner ? LIMITS.plannerMs : LIMITS.answerMs);
  try {
    const response = await operation.wait(fetch("https://api.deepseek.com/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.key}` },
      body: JSON.stringify(payload), cache: "no-store", signal: operation.signal, redirect: "error",
    }));
    if (!response.ok) {
      void response.body?.cancel().catch(() => {});
      if ([401, 402, 403].includes(response.status)) throw new AnswerFailure("provider_unavailable");
      if (response.status === 429) throw new AnswerFailure("provider_busy");
      throw new AnswerFailure(response.status >= 500 ? "provider_failed" : "provider_unavailable");
    }
    const raw = await readBounded(response, LIMITS.providerBytes, operation);
    let envelope: unknown;
    try { envelope = JSON.parse(raw); } catch { throw new AnswerFailure("invalid_model_output"); }
    if (!isObject(envelope) || !Array.isArray(envelope.choices) || envelope.choices.length !== 1) throw new AnswerFailure("invalid_model_output");
    const choice = envelope.choices[0];
    if (!isObject(choice) || choice.finish_reason !== "stop" || !isObject(choice.message) || choice.message.role !== "assistant"
      || typeof choice.message.content !== "string" || !choice.message.content.trim() || choice.message.tool_calls) throw new AnswerFailure("invalid_model_output");
    // Deliberately discard provider bodies and reasoning. Only bounded numeric usage can be recorded.
    const usage: Record<string, number> = {};
    if (isObject(envelope.usage)) for (const key of ["prompt_tokens", "completion_tokens", "total_tokens"]) {
      const n = envelope.usage[key];
      if (typeof n === "number" && Number.isSafeInteger(n) && n >= 0) usage[key] = n;
    }
    let content: unknown;
    try { content = JSON.parse(choice.message.content); } catch { throw new AnswerFailure("invalid_model_output"); }
    scope.check();
    console.info("ai_completion", { stage, model: config.model, usage, durationMs: Date.now() - started });
    return { content, usage };
  } catch (error) {
    scope.check(); operation.check();
    if (error instanceof AnswerFailure) throw error;
    throw new AnswerFailure("provider_failed");
  } finally { operation.close(); }
}
