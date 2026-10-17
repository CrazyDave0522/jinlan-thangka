"use client";

import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FIELD_LABELS } from "@/lib/answers/labels";
import {
  comparisonLines,
  isImageAnswer,
  referenceImageLines,
  referenceLines,
  type DisplayAnswer,
} from "@/lib/answers/presentation";
import { useAnswerReading } from "./answer-actions-context";

const SourcesContext = createContext<{
  prefix: string;
  label: (key: string) => string | null;
  navigate: (key: string, origin: HTMLElement) => void;
} | null>(null);
export function EvidenceMarker({ evidenceKey }: { evidenceKey: string }) {
  const context = useContext(SourcesContext);
  const occurrence = useId();
  const label = context?.label(evidenceKey);
  if (!context || !label)
    return (
      <span className="ml-1 text-xs text-muted-foreground">
        [{evidenceKey}]
      </span>
    );
  return (
    <Button
      id={`${context.prefix}-citation-${occurrence}`}
      type="button"
      variant="link"
      size="xs"
      className="scroll-m-3"
      aria-label={`查看${evidenceKey.startsWith("R") ? "参考图依据" : "依据"} ${evidenceKey}：${label}`}
      onClick={(event) => context.navigate(evidenceKey, event.currentTarget)}
    >
      [{evidenceKey}]
    </Button>
  );
}
function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, n) => (
        <p key={n} className="whitespace-pre-wrap wrap-anywhere">
          {line}
        </p>
      ))}
    </>
  );
}
function SourcePanel({
  hidden,
  onHidden,
  ...props
}: ComponentProps<"div"> & { onHidden: () => void }) {
  // Base UI closes in stages; restore focus after its hidden layout commits.
  useLayoutEffect(() => {
    if (hidden) onHidden();
  }, [hidden, onHidden]);
  return <div {...props} hidden={hidden} />;
}
export function AnswerSources({
  answer,
  children,
}: {
  answer: DisplayAnswer;
  children: ReactNode;
}) {
  const message = answer.structured;
  const image = message && isImageAnswer(message) ? message : null;
  const references = message?.references ?? [];
  const images = image?.referenceImages ?? [];
  const prefix = useId();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<{ key: string } | null>(null);
  const [origin, setOrigin] = useState<HTMLElement | null>(null);
  const targets = useRef(new Map<string, HTMLDivElement>());
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const restoreTrigger = useRef(false);
  const read = useAnswerReading();
  useLayoutEffect(() => {
    if (!open || !pending) return;
    const target = targets.current.get(pending.key);
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    }
  }, [open, pending]);
  function targetProps(key: string) {
    return {
      id: `${prefix}-source-${key}`,
      tabIndex: -1,
      "aria-label": `依据 ${key}`,
      className:
        "scroll-m-3 space-y-1 rounded-lg border p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
      ref: (node: HTMLDivElement | null) => {
        if (node) targets.current.set(key, node);
        else targets.current.delete(key);
      },
    };
  }
  return (
    <SourcesContext.Provider
      value={{
        prefix,
        label: (key) =>
          references.find((r) => r.key === key)
            ? FIELD_LABELS[references.find((r) => r.key === key)!.field]
            : images.some((r) => r.key === key)
              ? "档案参考图"
              : null,
        navigate: (key, source) => {
          read();
          setOrigin(source);
          setOpen(true);
          setPending({ key });
        },
      }}
    >
      {children}
      {references.length + images.length > 0 && (
        <Collapsible
          open={open}
          onOpenChange={(next) => {
            read();
            if (!next) {
              restoreTrigger.current = Boolean(panel.current?.contains(document.activeElement));
              setPending(null);
            } else {
              restoreTrigger.current = false;
            }
            setOpen(next);
          }}
          className="space-y-3 border-t pt-3"
        >
          <CollapsibleTrigger
            ref={trigger}
            render={<Button type="button" variant="ghost" />}
            aria-label="查看来源"
            className="h-auto w-full scroll-m-3 justify-start whitespace-normal text-left"
          >
            <BookOpen aria-hidden="true" />
            <span className="min-w-0 flex-1">
              查看来源
              {references.length ? ` · ${references.length} 条档案依据` : ""}
              {images.length ? ` · ${images.length} 项参考图核对` : ""}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={open ? "rotate-180" : ""}
            />
          </CollapsibleTrigger>
          <CollapsibleContent
            keepMounted
            ref={panel}
            render={
              <SourcePanel onHidden={() => {
                if (!restoreTrigger.current) return;
                restoreTrigger.current = false;
                trigger.current?.focus({ preventScroll: true });
                trigger.current?.scrollIntoView?.({ block: "nearest" });
              }} />
            }
          >
            <section aria-label="本条回答使用的依据" className="space-y-3">
              <h2 className="text-sm font-semibold">本条回答使用的依据</h2>
              {origin && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    read();
                    const target = origin.isConnected
                      ? origin
                      : trigger.current;
                    target?.focus({ preventScroll: true });
                    target?.scrollIntoView?.({ block: "nearest" });
                  }}
                >
                  返回引用
                </Button>
              )}
              {references.map((reference) => (
                <div key={reference.key} {...targetProps(reference.key)}>
                  <Lines lines={referenceLines(reference)} />
                </div>
              ))}
              {image &&
                answer.imageContext &&
                images.map((reference) => (
                  <div key={reference.key} {...targetProps(reference.key)}>
                    <Lines lines={referenceImageLines(image, reference.key)} />
                    {image.comparisons
                      .filter((c) => c.referenceKey === reference.key)
                      .map((comparison) => (
                        <div
                          key={comparison.taskId}
                          className="space-y-1 border-t pt-2"
                        >
                          {comparisonLines(
                            comparison,
                            image,
                            answer.imageContext!,
                          ).map((line, n) => {
                            const proof = comparison.proofs[n - 2];
                            return (
                              <p
                                key={n}
                                className="whitespace-pre-wrap wrap-anywhere"
                              >
                                {proof
                                  ? line.slice(
                                      0,
                                      -` [${proof.evidenceKey}]`.length,
                                    )
                                  : line}
                                {proof && (
                                  <EvidenceMarker
                                    evidenceKey={proof.evidenceKey}
                                  />
                                )}
                              </p>
                            );
                          })}
                        </div>
                      ))}
                  </div>
                ))}
            </section>
          </CollapsibleContent>
        </Collapsible>
      )}
    </SourcesContext.Provider>
  );
}
