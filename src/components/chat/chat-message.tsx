"use client";

import Image from "next/image";
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
            {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
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
