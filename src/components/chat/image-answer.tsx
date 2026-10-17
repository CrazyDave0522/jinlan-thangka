"use client";

import type {
  Assistant,
  Block,
  ImageRequest,
  Reason,
} from "@/lib/vision/types";
import { FIELD_LABELS, fieldValueLabel } from "@/lib/answers/labels";
import { NOTICE_COPY } from "@/lib/vision/output";

const REASON_COPY: Record<Reason, string> = {
  no_clue: "缺少可用的检索线索",
  record_unverified: "相关记录尚未核验",
  source_support_missing: "缺少对应字段的来源支持",
  identifier_unclear: "收藏机构或藏品编号的依据不完整",
  identifier_mismatch: "图片编号与记录不一致",
  identity_conflict: "对应依据存在冲突",
  candidate_limit: "候选范围尚不完整",
  references_missing: "缺少可核对的参考图",
  reference_not_authorized: "参考图尚无可用的处理许可",
  reference_limit: "本次参考图核对范围有限",
  visual_uncertain: "图片对应关系仍不确定",
  insufficient_features: "可确认的独特特征不足",
};
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
  const key = (block: Block) =>
    block.kind === "visual"
      ? block.observationIds.every((id) =>
          message.observations.some((o) => o.id === id),
        )
        ? "current"
        : "prior"
      : block.kind;
  const titles = {
    current: "图片观察与解读",
    prior: "此前图片观察",
    archive: "数据库依据",
    general: "通用知识补充",
  };
  const sections: { kind: keyof typeof titles; blocks: Block[] }[] = [];
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
        sections.map((s, n) => (
          <section key={n} className="space-y-3" aria-label={titles[s.kind]}>
            <h2 className="font-semibold">{titles[s.kind]}</h2>
            {s.blocks.map((b, p) => (
              <p key={p} className="whitespace-pre-wrap">
                {b.text}
                {b.evidenceKeys.map((k) => (
                  <span key={k} className="ml-1 text-xs text-muted-foreground">
                    [{k}]
                  </span>
                ))}
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
        ))
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
                  ].map((k) => (
                    <span
                      key={k}
                      className="ml-1 text-xs text-muted-foreground"
                    >
                      [{k}]
                    </span>
                  ))}
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
      {message.references.length > 0 && (
        <section
          aria-label="依据摘要"
          className="space-y-3 border-t pt-3 text-sm"
        >
          <h2 className="font-semibold">依据摘要</h2>
          {message.references.map((r) => (
            <div key={r.key} className="space-y-1">
              <p>
                [{r.key}] {r.label} · {FIELD_LABELS[r.field]}
              </p>
              <p className="text-muted-foreground">
                {fieldValueLabel(r.field, r.value)}
              </p>
              {r.sources.length ? (
                r.sources.map((s) => (
                  <p key={s.linkId} className="text-muted-foreground">
                    来源：{s.title || "未记录标题"}
                    {s.locator ? ` · ${s.locator}` : ""}
                    {!s.supportedField ? "（未限定支持字段）" : ""}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">
                  仅数据库记录，暂无字段来源。
                </p>
              )}
            </div>
          ))}
        </section>
      )}
      {message.referenceImages.length > 0 && (
        <section className="space-y-1 text-sm" aria-label="档案参考图核对">
          <h2 className="font-semibold">档案参考图核对</h2>
          {message.referenceImages.map((r) => (
            <p key={r.key}>
              [{r.key}]{" "}
              {
                message.groups
                  .flatMap((g) => g.candidates)
                  .find((c) => c.artworkId === r.artworkId)!.label
              }{" "}
              · 已使用获准的档案参考图
            </p>
          ))}
        </section>
      )}
      {message.notices.map((n) => (
        <p key={n} className="text-sm text-muted-foreground">
          {NOTICE_COPY[n]}
        </p>
      ))}
    </>
  );
}
