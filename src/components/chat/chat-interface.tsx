import type { ComponentProps, ReactNode, Ref } from "react";
import Image from "next/image";
import { ArrowUp, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message, type ChatMessage } from "./chat-message";
import type { LocalImage } from "@/lib/chat/image-policy";
import "./chat-interface.css";
import { AnswerActionsProvider } from "./answer-actions-context";

const copyrightYear = new Date().getFullYear();

type Composer = {
  draft: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: ComponentProps<typeof Textarea>["onKeyDown"];
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  pending: boolean;
  images: LocalImage[];
  preparing: boolean;
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  error: string;
  historicalIds?: string[];
  imageLabels?: Map<string, number>;
  extra?: ReactNode;
};

export function ChatInterface({
  messages = [],
  composer,
  regionRef,
  onScroll,
  messageFooter,
  onReadAnswer,
  onScrollIntent,
}: {
  messages?: ChatMessage[];
  composer?: Composer;
  regionRef?: Ref<HTMLDivElement>;
  onScroll?: () => void;
  onReadAnswer?: () => void;
  onScrollIntent?: () => void;
  messageFooter?: (id: string) => ReactNode;
}) {
  return (
    <AnswerActionsProvider onRead={onReadAnswer}>
    <div className="chat-shell">
      <header className="flex shrink-0 items-center gap-4 border-b px-4 py-2 sm:px-8 lg:px-12">
        <div className="chat-brand">
          <Image
            src="/brand/jinlan-thangka-logo-full.png"
            alt="雪域金澜 · Jinlan Thangka"
            width={1774}
            height={887}
            className="chat-brandImage"
          />
        </div>
        <span className="border-l pl-4 text-sm text-muted-foreground">
          演示版
        </span>
      </header>
      <main className="chat-main">
        <div
          ref={regionRef}
          onScroll={onScroll}
          onWheel={onScrollIntent}
          onTouchStart={onScrollIntent}
          onPointerDown={(event) => { if (event.target === event.currentTarget) onScrollIntent?.(); }}
          onKeyDown={(event) => {
            if (event.defaultPrevented || !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) return;
            const target = event.target as HTMLElement;
            if (target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
            if (event.key === " " && target.closest('button, summary, [role="button"]')) return;
            onScrollIntent?.();
          }}
          className="chat-messages"
          role="region"
          aria-label="对话内容"
          tabIndex={0}
        >
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                一起探索唐卡艺术
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                你可以询问唐卡的题材、尊像与艺术风格，也可以上传图片进行交流。
              </p>
            </div>
          ) : (
            <div className="chat-conversation">
              <h1 className="sr-only">唐卡艺术对话</h1>
              <ol aria-label="对话消息" className="space-y-6">
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    message={message}
                    footer={messageFooter?.(message.id)}
                  />
                ))}
              </ol>
            </div>
          )}
        </div>
        <section aria-label="消息输入" className="chat-composer">
          <div className="rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-ring/50 sm:p-3">
            <div className="chat-input-context">
              {Boolean(composer?.historicalIds?.length) && (
                <div
                  aria-label="本次选用的历史图片"
                  className="mb-2 flex flex-wrap gap-2"
                >
                  {composer?.images
                    .filter((i) => composer.historicalIds?.includes(i.id))
                    .map((i) => (
                      <Button
                        key={i.id}
                        type="button"
                        size="sm"
                        variant="secondary"
                        aria-label={`取消选择：图片 ${composer.imageLabels?.get(i.id)}`}
                        onClick={() => composer.onRemove(i.id)}
                      >
                        图片 {composer.imageLabels?.get(i.id)}
                        <X aria-hidden="true" />
                      </Button>
                    ))}
                </div>
              )}
              {Boolean(
                composer?.images.some(
                  (i) => !composer.historicalIds?.includes(i.id),
                ),
              ) && (
                <ol
                  aria-label="待发送图片"
                  className="chat-preview-list mb-2 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4"
                >
                  {composer?.images
                    .filter((i) => !composer.historicalIds?.includes(i.id))
                    .map((image, index) => (
                      <li
                        key={image.id}
                        className="relative min-w-0 rounded-lg border p-2"
                      >
                        <Image
                          unoptimized
                          src={image.url}
                          width={image.width}
                          height={image.height}
                          alt={`待发送图片 ${index + 1}`}
                          className="h-20 w-full rounded object-contain"
                        />
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <span className="text-xs">新图片 {index + 1}</span>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`移除图片 ${index + 1}`}
                            onClick={() => composer.onRemove(image.id)}
                          >
                            <X className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </li>
                    ))}
                </ol>
              )}
              {composer?.extra}
              {Boolean(composer?.images.length || composer?.preparing) && (
                <details className="mb-2 text-xs leading-5 text-muted-foreground">
                  <summary className="cursor-pointer">
                    图片处理说明：所选图片将发送至 DeepSeek 处理。
                  </summary>
                  <p>
                    所选图片将发送至 DeepSeek 处理。本应用仅在当前页面和请求过程中临时使用图片，刷新会清空对话、图片和草稿。
                  </p>
                  <p>图片将适度缩放或压缩后发送。</p>
                </details>
              )}
            </div>
            <Textarea
              value={composer?.draft}
              onChange={
                composer
                  ? (event) => composer.onChange(event.target.value)
                  : undefined
              }
              onKeyDown={composer?.onKeyDown}
              onCompositionStart={composer?.onCompositionStart}
              onCompositionEnd={composer?.onCompositionEnd}
              aria-label="消息内容"
              aria-describedby="composer-helper composer-image-help"
              placeholder="聊聊唐卡，或上传一张图片…"
              className="max-h-32 min-h-12 resize-none overflow-y-auto border-0 shadow-none focus-visible:ring-0 md:text-base"
            />
            <div className="mt-1 flex items-center justify-between">
              <Button
                disabled={!composer || composer.preparing}
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label="上传图片"
                aria-describedby="composer-image-help"
                onClick={(event) =>
                  event.currentTarget.parentElement
                    ?.querySelector("input")
                    ?.click()
                }
              >
                <ImagePlus className="size-5" aria-hidden="true" />
              </Button>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                multiple
                hidden
                aria-label="选择图片"
                disabled={!composer || composer.preparing}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  composer?.onFiles(files);
                }}
              />
              <Button
                disabled={
                  !composer ||
                  composer.pending ||
                  composer.preparing ||
                  (!composer.draft.trim() && !composer.images.length)
                }
                onClick={composer?.onSubmit}
                type="button"
                size="icon-lg"
                aria-label="发送消息"
              >
                <ArrowUp className="size-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <p
            id="composer-helper"
            className="mt-2 text-center text-xs leading-5 text-muted-foreground"
          >
            回答会区分数据库依据与通用知识。
          </p>
          <p
            id="composer-image-help"
            className="text-center text-xs leading-5 text-muted-foreground"
          >
            最多 4 张 JPG/JPEG、PNG，单张不超过 5 MB。
          </p>
          {composer?.preparing && (
            <p
              role="status"
              className="text-center text-sm text-muted-foreground"
            >
              正在处理图片…
            </p>
          )}
          {composer?.error && (
            <p
              role="alert"
              className="mt-1 text-sm text-destructive wrap-anywhere"
            >
              {composer.error}
            </p>
          )}
        </section>
      </main>
      <footer className="chat-footer">
        <p>© {copyrightYear} 雪域金澜 · Jinlan Thangka</p>
        <p>AI 生成内容仅供参考，请结合来源核实。</p>
      </footer>
    </div>
    </AnswerActionsProvider>
  );
}
