"use client";

import Image from "next/image";
import type { AnswerBlock, AssistantMessage } from "@/lib/answers/contracts";
import { FIELD_LABELS, NOTICE_TEXT, fieldValueLabel } from "@/lib/answers/labels";
import { useState, type ReactNode } from "react";
import { BookOpen, Bot, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type ChatMessage =
  | {
      id: string;
      role: "user";
      text: string;
      image?: { src: string; alt: string; width: number; height: number };
      images?: { src: string; alt: string; width: number; height: number }[];
    }
  | {
      id: string;
      role: "assistant";
      text: string;
      structured?: AssistantMessage;
      evidence?: string;
      generalKnowledge?: string;
      sourceLabel?: string;
    };

function Attachment({ image }: { image: NonNullable<Extract<ChatMessage, { role: "user" }>["image"]> }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === image.src) {
    return <p className="rounded-lg border p-4 text-sm text-muted-foreground" role="status">{image.alt}：图片暂时无法显示</p>;
  }

  return (
    <Image
      unoptimized
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      onError={() => setFailedSrc(image.src)}
      className="h-auto max-h-80 w-auto max-w-full rounded-lg object-contain"
    />
  );
}

export function Message({ message, footer }: { message: ChatMessage; footer?: ReactNode }) {
  if (message.role === "user") {
    return (
      <li className="flex flex-col items-end" aria-label="用户消息">
        <div className="flex max-w-[90%] min-w-0 flex-col gap-3 rounded-xl bg-muted p-4 sm:max-w-[75%]">
          <span className="sr-only">你</span>
          {message.image && <Attachment image={message.image} />}
          {Boolean(message.images?.length) && <ol aria-label="本条消息的图片" className="grid grid-cols-2 gap-2">
            {message.images?.map((image, index) => <li key={image.src} className="min-w-0"><Attachment image={image} /><p className="mt-1 text-xs text-muted-foreground">图片 {index + 1}</p></li>)}
          </ol>}
          {message.text && <p className="whitespace-pre-wrap wrap-anywhere">{message.text}</p>}
        </div>
        {footer}
      </li>
    );
  }

  const unavailableId = `answer-actions-${message.id}`;
  return (
    <li className="flex min-w-0 items-start gap-2 sm:gap-4" aria-label="雪域金澜的回答">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted sm:size-11" aria-hidden="true">
        <Bot className="size-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-medium">雪域金澜</p>
        <Card>
          <CardContent className="space-y-5 text-base leading-7 wrap-anywhere">
            {message.structured ? <StructuredAnswer message={message.structured} /> : message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
            {message.evidence && <section aria-label="数据库依据"><h2 className="font-semibold">数据库依据</h2><p className="whitespace-pre-wrap">{message.evidence}</p></section>}
            {message.generalKnowledge && <section aria-label="通用知识补充"><h2 className="font-semibold">通用知识补充</h2><p className="whitespace-pre-wrap">{message.generalKnowledge}</p></section>}
            <div className="space-y-2 border-t pt-3">
              {message.sourceLabel && (
                <div className="flex min-w-0 items-center gap-2 border-b pb-3 text-sm text-muted-foreground">
                  <BookOpen className="size-5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1">{message.sourceLabel}</span>
                  <Button disabled variant="ghost" size="sm" aria-label="查看来源" aria-describedby={unavailableId}>查看来源</Button>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button disabled variant="ghost" size="icon" aria-label="复制回答" aria-describedby={unavailableId}><Copy aria-hidden="true" /></Button>
                <p id={unavailableId} className="text-xs leading-5 text-muted-foreground">{message.sourceLabel ? "来源查看与复制功能暂未开放。" : "复制功能暂未开放。"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </li>
  );
}

function StructuredAnswer({ message }: { message: AssistantMessage }) {
  const sections: { kind: AnswerBlock["kind"]; blocks: AnswerBlock[] }[] = [];
  for (const block of message.blocks) {
    const previous = sections.at(-1);
    if (previous?.kind === block.kind) previous.blocks.push(block);
    else sections.push({ kind: block.kind, blocks: [block] });
  }

  return <>
    {message.kind === "clarification" ? <p className="whitespace-pre-wrap">{message.question}</p> : sections.map((section, index) => <section key={index} className="space-y-3" aria-label={section.kind === "archive" ? "数据库依据" : "通用知识补充"}>
      <h2 className="font-semibold">{section.kind === "archive" ? "数据库依据" : "通用知识补充"}</h2>
      {section.blocks.map((block, paragraph) => <p key={paragraph} className="whitespace-pre-wrap">{block.text}{block.evidenceKeys.map((key) => <span key={key} className="ml-1 text-xs text-muted-foreground">[{key}]</span>)}</p>)}
    </section>)}
    {message.references.length > 0 && <section aria-label="依据摘要" className="space-y-3 border-t pt-3 text-sm">
      <h2 className="font-semibold">依据摘要</h2>
      {message.references.map((ref) => <div key={ref.key} className="space-y-1">
        <p>[{ref.key}] {ref.label} · {FIELD_LABELS[ref.field]}</p>
        <p className="text-muted-foreground">{fieldValueLabel(ref.field, ref.value)}</p>
        {ref.sources.length ? ref.sources.map((source) => <p key={source.linkId} className="text-muted-foreground">来源：{source.title || "未记录标题"}{source.locator ? ` · ${source.locator}` : ""}{!source.supportedField ? "（未限定支持字段）" : ""}</p>) : <p className="text-muted-foreground">仅数据库记录，暂无字段来源。</p>}
      </div>)}
    </section>}
    {message.notices.map((notice) => <p key={notice} className="text-sm text-muted-foreground">{NOTICE_TEXT[notice]}</p>)}
  </>;
}
