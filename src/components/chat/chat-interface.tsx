import type { ComponentProps, ReactNode, Ref } from "react";
import Image from "next/image";
import { ArrowUp, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message, type ChatMessage } from "./chat-message";
import "./chat-interface.css";

const copyrightYear = new Date().getFullYear();

type Composer = {
  draft: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: ComponentProps<typeof Textarea>["onKeyDown"];
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  pending: boolean;
};

export function ChatInterface({ messages = [], composer, regionRef, onScroll, messageFooter }: {
  messages?: ChatMessage[];
  composer?: Composer;
  regionRef?: Ref<HTMLDivElement>;
  onScroll?: () => void;
  messageFooter?: (id: string) => ReactNode;
}) {
  return (
    <div className="chat-shell">
      <header className="flex shrink-0 items-center gap-4 border-b px-4 py-2 sm:px-8 lg:px-12">
        <div className="chat-brand">
          <Image src="/brand/jinlan-thangka-logo-full.png" alt="雪域金澜 · Jinlan Thangka" width={1774} height={887} className="chat-brandImage" />
        </div>
        <span className="border-l pl-4 text-sm text-muted-foreground">演示版</span>
      </header>
      <main className="chat-main">
        <div ref={regionRef} onScroll={onScroll} className="chat-messages" role="region" aria-label="对话内容" tabIndex={0}>
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">一起探索唐卡艺术</h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">你可以询问唐卡的题材、尊像与艺术风格，也可以上传图片进行交流。</p>
            </div>
          ) : (
            <div className="chat-conversation">
              <h1 className="sr-only">唐卡艺术对话</h1>
              <ol aria-label="对话消息" className="space-y-6">{messages.map((message) => <Message key={message.id} message={message} footer={messageFooter?.(message.id)} />)}</ol>
            </div>
          )}
        </div>
        <section aria-label="消息输入" className="chat-composer">
          <div className="rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-ring/50 sm:p-3">
            <Textarea value={composer?.draft} onChange={composer ? (event) => composer.onChange(event.target.value) : undefined} onKeyDown={composer?.onKeyDown} onCompositionStart={composer?.onCompositionStart} onCompositionEnd={composer?.onCompositionEnd} aria-label="消息内容" aria-describedby="composer-helper composer-notice" placeholder="聊聊唐卡，或上传一张图片…" className="max-h-32 min-h-12 resize-none overflow-y-auto border-0 shadow-none focus-visible:ring-0 md:text-base" />
            <div className="mt-1 flex items-center justify-between">
              <Button disabled type="button" variant="ghost" size="icon-lg" aria-label="上传图片" aria-describedby="composer-notice"><ImagePlus className="size-5" aria-hidden="true" /></Button>
              <Button disabled={!composer || composer.pending || !composer.draft.trim()} onClick={composer?.onSubmit} type="button" size="icon-lg" aria-label="发送消息"><ArrowUp className="size-5" aria-hidden="true" /></Button>
            </div>
          </div>
          <p id="composer-helper" className="mt-2 text-center text-xs leading-5 text-muted-foreground">回答会区分数据库依据与通用知识。</p>
          <p id="composer-notice" className="text-center text-xs leading-5 text-muted-foreground">图片上传功能暂未开放。</p>
        </section>
      </main>
      <footer className="chat-footer">
        <p>© {copyrightYear} 雪域金澜 · Jinlan Thangka</p>
        <p>AI 生成内容仅供参考，请结合来源核实。</p>
      </footer>
    </div>
  );
}
