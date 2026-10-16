"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createRequest, parseChatResponse, type Turn } from "@/lib/chat/conversation";
import { Button } from "@/components/ui/button";
import { encodeRequest, requestSize, requestLimitNotice } from "@/lib/chat/image-client";
import { IMAGE_LIMITS, INVALID_IMAGE_NOTICE } from "@/lib/chat/image-policy";
import { useImageDraft } from "./use-image-draft";
import { ChatInterface } from "./chat-interface";

export const REQUEST_TIMEOUT = 30_000;

type Attempt = { controller: AbortController; timer: ReturnType<typeof setTimeout> };

export function ChatConversation() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const imageDraft = useImageDraft();
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
      ? history.current.map((item) => item.user.id === turn.user.id ? { ...turn, status: "pending", failure: undefined } : item)
      : [...history.current, turn]);

    function settle(result: Pick<Turn, "status" | "answer" | "failure">) {
      if (active.current !== attempt) return;
      clearTimeout(attempt.timer);
      active.current = null;
      update(history.current.map((item) => item.user.id === turn.user.id ? { ...item, ...result } : item));
    }

    void (async () => {
      try {
        const payload = turn.request.messages.some((message) => message.images?.length)
          ? await encodeRequest(turn.request, controller.signal) : JSON.stringify(turn.request);
        if (active.current !== attempt) return;
        const response = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: payload, signal: controller.signal, cache: "no-store",
        });
        if (response.status === 413) { settle({ status: "failed", failure: "request_too_large" }); return; }
        const body: unknown = await response.json();
        if (response.status === 422 && body && typeof body === "object" && "error" in body &&
          body.error && typeof body.error === "object" && "code" in body.error && body.error.code === "invalid_image") {
          settle({ status: "failed", failure: "invalid_image" }); return;
        }
        const ids = history.current.flatMap((item) => [item.user.id, ...(item.answer ? [item.answer.id] : [])]);
        settle(parseChatResponse(response.status, body, turn.request, ids));
      } catch (failure) {
        settle({ status: "failed", ...(failure instanceof RangeError ? { failure: "request_too_large" as const } : {}) });
      }
    })();
  }

  function submit() {
    const text = draft.trim();
    if (active.current || imageDraft.isPreparing() || (!text && !imageDraft.images.length)) return;
    const user = { id: crypto.randomUUID(), role: "user" as const, text, ...(imageDraft.images.length ? { images: [...imageDraft.images] } : {}) };
    const request = createRequest(history.current, user);
    if (requestSize(request) > IMAGE_LIMITS.requestBytes) { setNotice(requestLimitNotice(request)); return; }
    setNotice("");
    run({ user, request, status: "pending" });
    imageDraft.take();
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
    messages={turns.flatMap((turn) => [{ ...turn.user, role: "user" as const, images: turn.user.images?.map((image, index) => ({ src: image.url, alt: `图片 ${index + 1}`, width: image.width, height: image.height })) }, ...(turn.answer ? [{ id: turn.answer.id, role: "assistant" as const, text: turn.answer.text }] : [])])}
    regionRef={region} onScroll={trackScroll}
    composer={{ draft, onChange: (value) => { setDraft(value); setNotice(""); }, onSubmit: submit, onKeyDown: keyDown, pending,
      images: imageDraft.images, preparing: imageDraft.preparing, onFiles: (files) => { setNotice(""); void imageDraft.select(files); }, onRemove: (id) => { setNotice(""); imageDraft.remove(id); },
      error: imageDraft.error || notice,
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
      const retryable = turn === last && turn.status === "failed" && !turn.failure && !pending;
      return <div className="mt-2 flex max-w-full items-center gap-2 text-sm text-muted-foreground">
        <p role={turn.status === "failed" ? "alert" : "status"}>
          {turn.status === "pending" ? "正在处理…" : turn.status === "unavailable" ? "AI 回复暂未接入，暂时无法回复。" : turn === last && turn.failure ? (turn.failure === "invalid_image" ? INVALID_IMAGE_NOTICE : requestLimitNotice(turn.request)) : retryable ? "发送失败，请重试。" : "发送失败。"}
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
