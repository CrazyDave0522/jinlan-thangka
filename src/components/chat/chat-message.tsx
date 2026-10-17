"use client";

import Image from "next/image";
import type { AnswerBlock, AssistantMessage } from "@/lib/answers/contracts";
import {
  NOTICE_TEXT,
} from "@/lib/answers/labels";
import { useState, type ReactNode } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Assistant, ImageRequest } from "@/lib/vision/types";
import { ImageAnswer } from "./image-answer";
import { AnswerSources, EvidenceMarker } from "./answer-sources";
import { AnswerCopy } from "./answer-copy";
import { blockTitle } from "@/lib/answers/presentation";

type AttachmentImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  displayIndex?: number;
  anchor?: string;
  onSelect?: () => void;
  selected?: boolean;
};

export type ChatMessage =
  | {
      id: string;
      role: "user";
      text: string;
      image?: AttachmentImage;
      images?: AttachmentImage[];
    }
  | {
      id: string;
      role: "assistant";
      text: string;
      structured?: AssistantMessage | Assistant;
      imageContext?: ImageRequest;
      evidence?: string;
      generalKnowledge?: string;
      sourceLabel?: string;
    };

function Attachment({
  image,
}: {
  image: NonNullable<Extract<ChatMessage, { role: "user" }>["image"]>;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === image.src) {
    return (
      <p
        className="rounded-lg border p-4 text-sm text-muted-foreground"
        role="status"
      >
        {image.alt}：图片暂时无法显示
      </p>
    );
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

export function Message({
  message,
  footer,
}: {
  message: ChatMessage;
  footer?: ReactNode;
}) {
  if (message.role === "user") {
    return (
      <li className="flex flex-col items-end" aria-label="用户消息">
        <div className="flex max-w-[90%] min-w-0 flex-col gap-3 rounded-xl bg-muted p-4 sm:max-w-[75%]">
          <span className="sr-only">你</span>
          {message.image && <Attachment image={message.image} />}
          {Boolean(message.images?.length) && (
            <ol aria-label="本条消息的图片" className="grid grid-cols-2 gap-2">
              {message.images?.map((image, index) => (
                <li
                  key={image.src}
                  id={image.anchor}
                  tabIndex={image.anchor ? -1 : undefined}
                  className="min-w-0"
                >
                  <Attachment image={image} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    图片 {image.displayIndex ?? index + 1}
                  </p>
                  {image.onSelect && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      aria-label={`${image.selected ? "取消选择" : "用于本次提问"}：图片 ${image.displayIndex}`}
                      onClick={image.onSelect}
                    >
                      {image.selected ? "取消选择" : "用于本次提问"}
                    </Button>
                  )}
                </li>
              ))}
            </ol>
          )}
          {message.text && (
            <p className="whitespace-pre-wrap wrap-anywhere">{message.text}</p>
          )}
        </div>
        {footer}
      </li>
    );
  }

  return (
    <li
      className="flex min-w-0 items-start gap-2 sm:gap-4"
      aria-label="雪域金澜的回答"
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted sm:size-11"
        aria-hidden="true"
      >
        <Bot className="size-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-medium">雪域金澜</p>
        <Card>
          <CardContent className="space-y-5 text-base leading-7 wrap-anywhere">
            <AnswerSources answer={message}>
            {message.structured ? (
              "observations" in message.structured && message.imageContext ? (
                <ImageAnswer
                  message={message.structured}
                  request={message.imageContext}
                />
              ) : !("observations" in message.structured) ? (
                <StructuredAnswer message={message.structured} />
              ) : null
            ) : (
              message.text && (
                <p className="whitespace-pre-wrap">{message.text}</p>
              )
            )}
            {message.evidence && (
              <section aria-label="数据库依据">
                <h2 className="font-semibold">数据库依据</h2>
                <p className="whitespace-pre-wrap">{message.evidence}</p>
              </section>
            )}
            {message.generalKnowledge && (
              <section aria-label="通用知识补充">
                <h2 className="font-semibold">通用知识补充</h2>
                <p className="whitespace-pre-wrap">
                  {message.generalKnowledge}
                </p>
              </section>
            )}
            {message.sourceLabel && <p className="text-sm text-muted-foreground">{message.sourceLabel}</p>}
            </AnswerSources>
            <AnswerCopy answer={message} />
          </CardContent>
        </Card>
        {footer}
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

  return (
    <>
      {message.kind === "clarification" ? (
        <p className="whitespace-pre-wrap">{message.question}</p>
      ) : (
        sections.map((section, index) => {
          const title = blockTitle(section.blocks[0], message);
          return (
            <section key={index} className="space-y-3" aria-label={title}>
              {title && <h2 className="font-semibold">{title}</h2>}
              {section.blocks.map((block, paragraph) => (
                <p key={paragraph} className="whitespace-pre-wrap">
                  {block.text}
                  {block.evidenceKeys.map((key) => <EvidenceMarker key={key} evidenceKey={key} />)}
                </p>
              ))}
            </section>
          );
        })
      )}
      {message.notices.map((notice) => (
        <p key={notice} className="text-sm text-muted-foreground">
          {NOTICE_TEXT[notice]}
        </p>
      ))}
    </>
  );
}
