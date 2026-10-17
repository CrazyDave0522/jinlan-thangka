"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  createSnapshot,
  encodeSnapshot,
  parseResponseV2,
  preflight,
  rereadSnapshot,
  wireSnapshot,
  type ImageTurn as Turn,
} from "@/lib/chat/image-context";
import { Button } from "@/components/ui/button";
import { IMAGE_CONTEXT_NOTICE } from "@/lib/chat/image-policy";
import { useImageDraft } from "./use-image-draft";
import { ChatInterface } from "./chat-interface";

import { AnswerFailure, retryable as canRetry } from "@/lib/answers/contracts";
import { failureCopy } from "@/lib/answers/failure-copy";
import { ImageGrouping } from "./image-grouping";

export const REQUEST_TIMEOUT = 65_000;

type Attempt = {
  controller: AbortController;
  timer: ReturnType<typeof setTimeout>;
};

export function ChatConversation() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const imageDraft = useImageDraft();
  const [groups, setGroups] = useState<string[][]>([]);
  const [labels, setLabels] = useState(new Map<string, number>());
  const nextLabel = useRef(1);
  const history = useRef<Turn[]>([]);
  const active = useRef<Attempt | null>(null);
  const region = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const reading = useRef(false);
  const userScrolling = useRef(false);
  const composing = useRef(false);
  const compositionEnd = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (active.current) {
        clearTimeout(active.current.timer);
        active.current.controller.abort();
        active.current = null;
      }
      if (compositionEnd.current) clearTimeout(compositionEnd.current);
    },
    [],
  );

  useLayoutEffect(() => {
    if (follow.current && region.current)
      region.current.scrollTop = region.current.scrollHeight;
  }, [turns]);

  function update(next: Turn[]) {
    history.current = next;
    setTurns(next);
  }

  function run(turn: Turn) {
    if (active.current) return;
    let wire = wireSnapshot(turn.request);
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
    reading.current = false;
    userScrolling.current = false;
    update(
      history.current.some((item) => item.user.id === turn.user.id)
        ? history.current.map((item) =>
            item.user.id === turn.user.id
              ? { ...turn, status: "pending", failure: undefined }
              : item,
          )
        : [...history.current, turn],
    );

    function settle(result: Pick<Turn, "status" | "answer" | "failure">) {
      if (active.current !== attempt) return;
      clearTimeout(attempt.timer);
      active.current = null;
      update(
        history.current.map((item) =>
          item.user.id === turn.user.id
            ? {
                ...item,
                ...result,
                request: { ...item.request, images: wire.images },
              }
            : item,
        ),
      );
    }

    void (async () => {
      try {
        const encoded = turn.request.inputs.length
          ? await encodeSnapshot(turn.request, controller.signal)
          : {
              request: wireSnapshot(turn.request),
              body: JSON.stringify(wireSnapshot(turn.request)),
            };
        if (active.current !== attempt) return;
        wire = encoded.request;
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: encoded.body,
          signal: controller.signal,
          cache: "no-store",
        });
        if (response.status === 413) {
          settle({ status: "failed", failure: "request_too_large" });
          return;
        }
        const body: unknown = await response.json();
        const ids = history.current.flatMap((item) => [
          item.user.id,
          ...(item.answer ? [item.answer.id] : []),
        ]);
        settle(parseResponseV2(response.status, body, wire, ids));
      } catch (failure) {
        settle({
          status: "failed",
          ...(failure instanceof RangeError
            ? { failure: "request_too_large" as const }
            : failure instanceof AnswerFailure
              ? { failure: failure.code }
              : {}),
        });
      }
    })();
  }

  function submit() {
    const text = draft.trim();
    if (
      active.current ||
      imageDraft.isPreparing() ||
      (!text && !imageDraft.images.length)
    )
      return;
    const user = {
      id: crypto.randomUUID(),
      role: "user" as const,
      text,
      ...(imageDraft.images.length ? { images: [...imageDraft.images] } : {}),
    };
    const proposedLabels = new Map(labels);
    let proposedNext = nextLabel.current;
    for (const i of user.images ?? [])
      if (!proposedLabels.has(i.id)) proposedLabels.set(i.id, proposedNext++);
    const request = createSnapshot(
      history.current,
      user,
      proposedLabels,
      groups,
    );
    try {
      preflight(request);
    } catch (failure) {
      setNotice(
        failure instanceof AnswerFailure
          ? failureCopy(failure.code)
          : "本次图片或文字过大，请减少图片或文字后发送。",
      );
      return;
    }
    setLabels(proposedLabels);
    nextLabel.current = proposedNext;
    setNotice("");
    run({ user, request, status: "pending" });
    imageDraft.take();
    setGroups([]);
    setDraft("");
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      composing.current ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229
    )
      return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    event.preventDefault();
    submit();
  }

  function trackScroll() {
    if (!region.current || (reading.current && !userScrolling.current)) return;
    const root = getComputedStyle(document.documentElement);
    const spacing = root.getPropertyValue("--spacing").trim();
    const unit =
      parseFloat(spacing) *
      (spacing.endsWith("rem") ? parseFloat(root.fontSize) : 1);
    follow.current =
      region.current.scrollHeight -
        region.current.clientHeight -
        region.current.scrollTop <=
      12 * unit;
    reading.current = !follow.current;
  }

  function removeImage(id: string) {
    setNotice("");
    imageDraft.remove(id);
    setGroups((current) => current.map((g) => g.filter((imageId) => imageId !== id)).filter((g) => g.length >= 2));
  }

  const pending = turns.some((turn) => turn.status === "pending");
  const last = turns[turns.length - 1];
  return (
    <ChatInterface
      messages={turns.flatMap((turn) => [
        {
          ...turn.user,
          role: "user" as const,
          images: turn.user.images?.map((image) => ({
            src: image.url,
            alt: `图片 ${labels.get(image.id)}`,
            width: image.width,
            height: image.height,
            displayIndex: labels.get(image.id),
            anchor:
              turn.request.images.find((i) => i.id === image.id)
                ?.ownerMessageId === turn.user.id
                ? `image-${image.id}`
                : undefined,
            ...(turn.status === "completed"
              ? {
                  onSelect: () =>
                    imageDraft.images.some((i) => i.id === image.id)
                      ? removeImage(image.id)
                      : imageDraft.addRetained(image.id),
                  selected: imageDraft.images.some((i) => i.id === image.id),
                }
              : {}),
          })),
        },
        ...(turn.answer
          ? [
              {
                id: turn.answer.id,
                role: "assistant" as const,
                text: turn.answer.text,
                structured: turn.answer,
                imageContext: wireSnapshot(turn.request),
              },
            ]
          : []),
      ])}
      regionRef={region}
      onScroll={trackScroll}
      onReadAnswer={() => { reading.current = true; follow.current = false; userScrolling.current = false; }}
      onScrollIntent={() => { userScrolling.current = true; }}
      composer={{
        draft,
        onChange: (value) => {
          setDraft(value);
          setNotice("");
        },
        onSubmit: submit,
        onKeyDown: keyDown,
        pending,
        images: imageDraft.images,
        preparing: imageDraft.preparing,
        onFiles: (files) => {
          setNotice("");
          void imageDraft.select(files);
        },
        onRemove: removeImage,
        historicalIds: imageDraft.images
          .filter((i) => labels.has(i.id))
          .map((i) => i.id),
        imageLabels: labels,
        extra: (
          <ImageGrouping
            images={imageDraft.images}
            labels={labels}
            groups={groups}
            onChange={setGroups}
          />
        ),
        error: imageDraft.error || notice,
        onCompositionStart: () => {
          if (compositionEnd.current) clearTimeout(compositionEnd.current);
          composing.current = true;
        },
        onCompositionEnd: () => {
          compositionEnd.current = setTimeout(() => {
            composing.current = false;
          }, 0);
        },
      }}
      messageFooter={(id) => {
        const source = turns.find((t) => t.answer?.id === id);
        if (source?.answer?.kind === "clarification" && source.answer.reread)
          return (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  pending ||
                  source.answer.reread.imageIds.some((i) => !imageDraft.get(i))
                }
                onClick={() => {
                  if (active.current) return;
                  try {
                    const reread = rereadSnapshot(source, imageDraft.get);
                    setNotice("");
                    run({ ...reread, status: "pending" });
                  } catch (failure) {
                    setNotice(
                      failure instanceof AnswerFailure
                        ? failureCopy(failure.code)
                        : IMAGE_CONTEXT_NOTICE,
                    );
                  }
                }}
              >
                重看图片并回答
              </Button>
              <span>重看会发起新的 AI 请求，可能产生费用。</span>
            </div>
          );
        const turn = turns.find((item) => item.user.id === id);
        if (!turn || turn.status === "completed") return null;
        const retryable =
          turn === last &&
          turn.status === "failed" &&
          canRetry(turn.failure) &&
          !pending;
        const editable =
          turn === last &&
          turn.status !== "pending" &&
          !pending &&
          !draft &&
          !imageDraft.images.length &&
          !imageDraft.preparing;
        return (
          <div className="mt-2 flex max-w-full flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <p role={turn.status === "failed" ? "alert" : "status"}>
              {turn.status === "pending"
                ? "正在处理…"
                : turn === last
                  ? turn.failure === "request_too_large"
                    ? "本次图片或文字过大，请减少图片或文字后发送。"
                    : turn.failure
                      ? failureCopy(turn.failure)
                      : retryable
                        ? "发送失败，请重试。"
                        : "发送失败。"
                  : turn.status === "unavailable"
                    ? failureCopy("generation_unavailable")
                    : "发送失败。"}
            </p>
            {retryable && <span className="text-xs">重试会重新请求 AI</span>}
            {retryable && (
              <RetryButton
                onRetry={() => {
                  if (active.current || history.current.at(-1)?.user.id !== id)
                    return;
                  run(turn);
                }}
              />
            )}
            {editable && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    active.current ||
                    imageDraft.isPreparing() ||
                    draft ||
                    imageDraft.images.length ||
                    history.current.at(-1)?.user.id !== id
                  )
                    return;
                  const next = history.current.filter(
                    (item) => item.user.id !== id,
                  );
                  update(next);
                  setDraft(turn.user.text);
                  setNotice(
                    turn.user.images?.length
                      ? "已恢复问题文字，请按需重新选择图片。"
                      : "",
                  );
                  const retained = new Set(
                    next
                      .flatMap((t) => [
                        ...(t.user.images ?? []),
                        ...t.request.inputs,
                      ])
                      .map((i) => i.id),
                  );
                  imageDraft.releaseUnreferenced(retained);
                  document
                    .querySelector<HTMLTextAreaElement>(
                      'textarea[aria-label="消息内容"]',
                    )
                    ?.focus();
                }}
              >
                编辑问题
              </Button>
            )}
          </div>
        );
      }}
    />
  );
}

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onRetry}
      title="重试会重新请求 AI"
    >
      重试
    </Button>
  );
}
