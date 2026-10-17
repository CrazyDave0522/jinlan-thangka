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
import { cn } from "@/lib/utils";
import { exportAnswer, type DisplayAnswer } from "@/lib/answers/presentation";
import {
  AnswerActionsContext,
  createWriteCoordinator,
  useAnswerReading,
} from "./answer-actions-context";

export const COPY_WAIT_MS = 5_000;
export const COPY_SUCCESS_MS = 2_000;
export const COPY_PENDING_MS = 300;
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
  const [pendingVisible, setPendingVisible] = useState(false);
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
  useEffect(() => {
    if (status !== "pending") return;
    const timer = setTimeout(() => setPendingVisible(true), COPY_PENDING_MS);
    return () => clearTimeout(timer);
  }, [status]);
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => setStatus("idle"), COPY_SUCCESS_MS);
    return () => clearTimeout(timer);
  }, [status]);
  function copy() {
    if (!output || status === "success") return;
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
    setPendingVisible(false);
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
  const confirmed = status === "success";
  return (
    <div className="space-y-2 border-t pt-3" aria-label="回答复制操作">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex shrink-0 items-center">
          <Button
            ref={button}
            type="button"
            variant="ghost"
            size="icon"
            className="scroll-m-3 data-disabled:pointer-events-none data-disabled:active:translate-y-0"
            aria-label="复制回答"
            aria-describedby={feedback ? `${id}-status` : undefined}
            disabled={!output || status === "success"}
            focusableWhenDisabled={status === "success"}
            onClick={copy}
          >
            <span aria-hidden="true" className="grid size-4 place-items-center">
              <Copy className={cn("col-start-1 row-start-1 transition-opacity duration-200 ease-out motion-reduce:transition-none", confirmed ? "opacity-0" : "opacity-100")} />
              <Check className={cn("col-start-1 row-start-1 transition-opacity duration-200 ease-out motion-reduce:transition-none", confirmed ? "opacity-100" : "opacity-0")} />
            </span>
          </Button>
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-full ml-2 whitespace-nowrap text-xs text-muted-foreground transition-opacity duration-200 ease-out motion-reduce:transition-none",
              confirmed ? "opacity-100" : "opacity-0",
              status !== "idle" && !confirmed && "invisible",
            )}
          >
            已复制
          </span>
        </div>
        {feedback && (
          <p
            id={`${id}-status`}
            role="status"
            aria-label="复制状态"
            className={cn("text-xs text-muted-foreground", (confirmed || (status === "pending" && !pendingVisible)) && "sr-only")}
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
