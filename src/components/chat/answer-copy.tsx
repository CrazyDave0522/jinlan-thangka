"use client";

import {
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { exportAnswer, type DisplayAnswer } from "@/lib/answers/presentation";
import {
  AnswerActionsContext,
  createWriteCoordinator,
  useAnswerReading,
} from "./answer-actions-context";

export const COPY_WAIT_MS = 5_000;
const READY_COPY = "等待已结束，可再次点击复制。";
type Status = "idle" | "pending" | "success" | "failure" | "waiting" | "busy" | "ready";
export function AnswerCopy({ answer }: { answer: DisplayAnswer }) {
  const context = useContext(AnswerActionsContext);
  const [local] = useState(createWriteCoordinator);
  const coordinator = context?.coordinator ?? local;
  const busy = useSyncExternalStore(
    coordinator.subscribe,
    coordinator.getSnapshot,
    () => false,
  );
  const read = useAnswerReading();
  const [status, setStatus] = useState<Status>("idle");
  const [fallback, setFallback] = useState(false);
  const mounted = useRef(false);
  const active = useRef<{
    waiting: boolean;
    timer: ReturnType<typeof setTimeout> | null;
  } | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  const {
    text,
    structured,
    imageContext,
    evidence,
    generalKnowledge,
    sourceLabel,
  } = answer;
  const images = imageContext?.images;
  const observations = imageContext?.observations;
  const output = useMemo(
    () =>
      exportAnswer({
        text,
        structured,
        evidence,
        generalKnowledge,
        sourceLabel,
        imageContext:
          images && observations ? { images, observations } : undefined,
      }),
    [
      text,
      structured,
      evidence,
      generalKnowledge,
      sourceLabel,
      images,
      observations,
    ],
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (active.current?.timer) clearTimeout(active.current.timer);
    };
  }, []);
  function copy() {
    if (!output) return;
    const release = coordinator.acquire();
    if (!release) {
      setFallback(true);
      if (!active.current) setStatus("busy");
      return;
    }
    const attempt = {
      waiting: false,
      timer: null as ReturnType<typeof setTimeout> | null,
    };
    active.current = attempt;
    setStatus("pending");
    attempt.timer = setTimeout(() => {
      attempt.waiting = true;
      if (mounted.current && active.current === attempt) {
        setStatus("waiting");
        setFallback(true);
      }
    }, COPY_WAIT_MS);
    const settle = (success: boolean) => {
      if (attempt.timer) clearTimeout(attempt.timer);
      active.current = active.current === attempt ? null : active.current;
      release();
      if (!mounted.current) return;
      setStatus(attempt.waiting ? "ready" : success ? "success" : "failure");
      if (!success && !attempt.waiting) setFallback(true);
    };
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      void navigator.clipboard.writeText(output).then(
        () => settle(true),
        () => settle(false),
      );
    } catch {
      settle(false);
    }
  }
  const feedback = {
    idle: "",
    pending: "正在复制…",
    success: "已复制",
    ready: READY_COPY,
    failure: fallback
      ? "暂时无法自动复制，请手动选择下方内容复制。"
      : "暂时无法自动复制，可再次点击复制重试。",
    waiting: !busy ? READY_COPY : fallback
      ? "浏览器尚未完成复制，可先选择下方内容；待当前操作结束后再重试。"
      : "浏览器尚未完成复制；可再次点击复制展开文本，或待当前操作结束后重试。",
    busy: !busy ? READY_COPY : fallback
      ? "另一条回答正在复制，可先选择下方内容。"
      : "另一条回答正在复制；可再次点击复制展开文本。",
  }[status];
  return (
    <div className="space-y-2 border-t pt-3" aria-label="回答复制操作">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          ref={button}
          type="button"
          variant="ghost"
          size="icon"
          className="scroll-m-3"
          aria-label="复制回答"
          aria-describedby={feedback ? `${id}-status` : undefined}
          disabled={!output}
          onClick={copy}
        >
          {status === "success" ? (
            <Check aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
        </Button>
        {feedback && (
          <p
            id={`${id}-status`}
            role="status"
            aria-label="复制状态"
            className="text-xs text-muted-foreground"
          >
            {feedback}
          </p>
        )}
      </div>
      {fallback && (
        <div className="space-y-2">
          <Textarea
            ref={field}
            aria-label="本条回答的复制文本"
            readOnly
            value={output}
            onFocus={read}
            className="max-h-64 min-h-24 scroll-m-3 resize-none overflow-y-auto"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                read();
                field.current?.focus({ preventScroll: true });
                field.current?.scrollIntoView?.({ block: "nearest" });
                field.current?.select();
              }}
            >
              选择全部
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                read();
                setFallback(false);
                button.current?.focus({ preventScroll: true });
                button.current?.scrollIntoView?.({ block: "nearest" });
              }}
            >
              收起复制文本
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
