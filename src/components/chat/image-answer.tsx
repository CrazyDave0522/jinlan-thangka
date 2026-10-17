"use client";

import type {
  Assistant,
  Block,
  ImageRequest,
} from "@/lib/vision/types";
import { REASON_COPY, blockTitle, observationLines, relevantObservations } from "@/lib/answers/presentation";
import { EvidenceMarker } from "./answer-sources";
import { useAnswerReading } from "./answer-actions-context";
import { NOTICE_COPY } from "@/lib/vision/output";

export function ImageLink({
  id,
  request,
}: {
  id: string;
  request: ImageRequest;
}) {
  const image = request.images.find((i) => i.id === id)!;
  return (
    <a
      className="ml-1 text-xs text-muted-foreground underline underline-offset-4"
      href={`#${encodeURIComponent(`image-${id}`)}`}
    >
      [图片{image.displayIndex}]
    </a>
  );
}
export function ImageAnswer({
  message,
  request,
}: {
  message: Assistant;
  request: ImageRequest;
}) {
  const read = useAnswerReading();
  const key = (block: Block) =>
    block.kind === "visual"
      ? block.observationIds.every((id) =>
          message.observations.some((o) => o.id === id),
        )
        ? "current"
        : "prior"
      : block.kind;
  const sections: { kind: ReturnType<typeof key>; blocks: Block[] }[] = [];
  for (const block of message.blocks) {
    const kind = key(block),
      previous = sections.at(-1);
    if (previous?.kind === kind) previous.blocks.push(block);
    else sections.push({ kind, blocks: [block] });
  }
  const observations = [
    ...request.observations.filter(
      (o) => !message.observations.some((c) => c.imageId === o.imageId),
    ),
    ...message.observations,
  ];
  return (
    <>
      {message.kind === "clarification" ? (
        <div className="space-y-2">
          <p className="whitespace-pre-wrap">{message.question}</p>
          {message.reread && (
            <p className="text-sm text-muted-foreground" aria-label="重新查看的图片">
              重新查看：
              {message.reread.imageIds.map((id) => (
                <ImageLink key={id} id={id} request={request} />
              ))}
            </p>
          )}
        </div>
      ) : (
        sections.map((s, n) => {
          const title = blockTitle(s.blocks[0], message);
          return (
            <section key={n} className="space-y-3" aria-label={title}>
              {title && <h2 className="font-semibold">{title}</h2>}
              {s.blocks.map((b, p) => (
                <p key={p} className="whitespace-pre-wrap">
                  {b.text}
                  {b.evidenceKeys.map((k) => <EvidenceMarker key={k} evidenceKey={k} />)}
                  {b.observationIds.map((id) => (
                    <ImageLink
                      key={id}
                      id={observations.find((o) => o.id === id)!.imageId}
                      request={request}
                    />
                  ))}
                </p>
              ))}
            </section>
          );
        })
      )}
      {message.groups.length > 0 && (
        <section
          className="space-y-3 border-t pt-3 text-sm"
          aria-label="图片与档案"
        >
          <h2 className="font-semibold">图片与档案</h2>
          {message.groups.map((g) => (
            <div key={g.id} className="space-y-1">
              <p>
                {g.imageIds.map((id) => (
                  <ImageLink key={id} id={id} request={request} />
                ))}{" "}
                ·{" "}
                {g.searchStatus === "not_searched"
                  ? "本次未检索档案"
                  : g.searchStatus === "no_matches"
                    ? "未找到匹配档案记录"
                    : "已检索到相关档案记录"}
              </p>
              {g.candidateLimitReached && <p className="text-muted-foreground">本组检索候选已达上限，结果不代表完整档案。</p>}
              {g.identity.status === "not_requested" && <p className="text-muted-foreground">本次未请求确认具体作品。</p>}
              {g.candidates.length > 0 && <details className="text-xs text-muted-foreground" onToggle={(event) => { if (event.currentTarget.open) read(); }}><summary className="cursor-pointer">候选档案标识</summary>{g.candidates.map((candidate) => <p key={candidate.artworkId}>候选档案：{candidate.label} · {candidate.artworkId}</p>)}</details>}
              {g.identity.status === "identified" ? (
                <p>
                  档案对应：
                  {
                    g.candidates.find(
                      (c) =>
                        c.artworkId ===
                        (g.identity.status === "identified"
                          ? g.identity.artworkId
                          : ""),
                    )!.label
                  }
                  （
                  {g.identity.method === "identifier"
                    ? "编号核对"
                    : "图像与档案特征核对"}
                  ）
                  {g.identity.supportingImageIds.map((id) => (
                    <ImageLink key={id} id={id} request={request} />
                  ))}
                  {[
                    ...g.identity.evidenceKeys,
                    ...g.identity.referenceKeys,
                  ].map((k) => <EvidenceMarker key={k} evidenceKey={k} />)}
                </p>
              ) : (
                <>
                  {g.candidates.length > 0 && (
                    <p>
                      待核对候选：{g.candidates.map((c) => c.label).join("、")}
                      。尚未确认具体对应。
                    </p>
                  )}
                  {g.identity.status === "insufficient_evidence" && (
                    <p>依据不足，暂无法确认具体作品。</p>
                  )}
                  {(g.identity.status === "candidates" ||
                    g.identity.status === "insufficient_evidence") && (
                    <p className="text-muted-foreground">
                      {g.identity.reasons.map((r) => REASON_COPY[r]).join("；")}
                      。
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </section>
      )}
      {relevantObservations(message, request).map((observation) => (
        <details key={observation.id} className="space-y-2 rounded-lg border p-3 text-sm" onToggle={(event) => { if (event.currentTarget.open) read(); }}>
          <summary className="cursor-pointer font-medium">图片 {request.images.find((i) => i.id === observation.imageId)!.displayIndex} · 观察说明</summary>
          {observationLines(observation, message.observations.some((o) => o.id === observation.id)).map((line, n) => <p key={n} className="whitespace-pre-wrap">{line}</p>)}
        </details>
      ))}
      {message.observations.flatMap((observation) => observation.limitations.filter((l) => l.affectsIdentity).map((limitation, n) => <p key={`${observation.id}-${n}`} className="text-sm text-muted-foreground">图片 {request.images.find((i) => i.id === observation.imageId)!.displayIndex} · 作品对应限制：{limitation.text}</p>))}
      {message.notices.map((n) => (
        <p key={n} className="text-sm text-muted-foreground">
          {NOTICE_COPY[n]}
        </p>
      ))}
    </>
  );
}
