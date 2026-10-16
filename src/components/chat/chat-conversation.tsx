"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createRequest, parseChatResponse, type Turn } from "@/lib/chat/conversation";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "./chat-interface";

export const REQUEST_TIMEOUT = 30_000;

type Attempt = { controller: AbortController; timer: ReturnType<typeof setTimeout> };

export function ChatConversation() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const history = useRef<Turn[]>([]);
  const active = useRef<Attempt | null>(null);
  const region = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const composing = useRef(false);
  const compositionEnd = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (active.current) {
      clearTimeout(active.current.timer);
      active.current.controller.abort();
      active.current = null;
    }
    if (compositionEnd.current) clearTimeout(compositionEnd.current);
  }, []);

  useLayoutEffect(() => {
    if (follow.current && region.current) region.current.scrollTop = region.current.scrollHeight;
  }, [turns]);

  function update(next: Turn[]) {
    history.current = next;
    setTurns(next);
  }

  function run(turn: Turn) {
    const controller = new AbortController();
    const attempt: Attempt = {
      controller,
      timer: setTimeout(() => {
        if (active.current !== attempt) return;
        controller.abort();
        settle({ status: "failed" });
      }, REQUEST_TIMEOUT),
    };
    active.current = attempt;
    follow.current = true;
    update(history.current.some((item) => item.user.id === turn.user.id)
      ? history.current.map((item) => item.user.id === turn.user.id ? { ...turn, status: "pending" } : item)
      : [...history.current, turn]);

    function settle(result: Pick<Turn, "status" | "answer">) {
      if (active.current !== attempt) return;
      clearTimeout(attempt.timer);
      active.current = null;
      update(history.current.map((item) => item.user.id === turn.user.id ? { ...item, ...result } : item));
    }

    void (async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(turn.request), signal: controller.signal, cache: "no-store",
        });
        const body: unknown = await response.json();
        const ids = history.current.flatMap((item) => [item.user.id, ...(item.answer ? [item.answer.id] : [])]);
        settle(parseChatResponse(response.status, body, turn.request, ids));
      } catch {
        settle({ status: "failed" });
      }
    })();
  }

  function submit() {
    const text = draft.trim();
    if (active.current || !text) return;
    const user = { id: crypto.randomUUID(), role: "user" as const, text };
    run({ user, request: createRequest(history.current, user), status: "pending" });
    setDraft("");
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    event.preventDefault();
    submit();
  }

  function trackScroll() {
    if (!region.current) return;
    const root = getComputedStyle(document.documentElement);
    const spacing = root.getPropertyValue("--spacing").trim();
    const unit = parseFloat(spacing) * (spacing.endsWith("rem") ? parseFloat(root.fontSize) : 1);
    follow.current = region.current.scrollHeight - region.current.clientHeight - region.current.scrollTop <= 12 * unit;
  }

  const pending = turns.some((turn) => turn.status === "pending");
  const last = turns[turns.length - 1];
  return <ChatInterface
    messages={turns.flatMap((turn) => [turn.user, ...(turn.answer ? [turn.answer] : [])])}
    regionRef={region} onScroll={trackScroll}
    composer={{ draft, onChange: setDraft, onSubmit: submit, onKeyDown: keyDown, pending,
      onCompositionStart: () => {
        if (compositionEnd.current) clearTimeout(compositionEnd.current);
        composing.current = true;
      },
      onCompositionEnd: () => {
        compositionEnd.current = setTimeout(() => { composing.current = false; }, 0);
      },
    }}
    messageFooter={(id) => {
      const turn = turns.find((item) => item.user.id === id);
      if (!turn || turn.status === "completed") return null;
      const retryable = turn === last && turn.status === "failed" && !pending;
      return <div className="mt-2 flex max-w-full items-center gap-2 text-sm text-muted-foreground">
        <p role={turn.status === "failed" ? "alert" : "status"}>
          {turn.status === "pending" ? "正在处理…" : turn.status === "unavailable" ? "AI 回复暂未接入，暂时无法回复。" : retryable ? "发送失败，请重试。" : "发送失败。"}
        </p>
        {retryable && <RetryButton onRetry={() => {
          if (active.current || history.current.at(-1)?.user.id !== id) return;
          run(turn);
        }} />}
      </div>;
    }}
  />;
}

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return <Button type="button" variant="outline" size="sm" onClick={onRetry}>重试</Button>;
}
