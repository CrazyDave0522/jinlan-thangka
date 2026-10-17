"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { LocalImage } from "@/lib/chat/image-policy";

export function ImageGrouping({
  images,
  labels,
  groups,
  onChange,
}: {
  images: LocalImage[];
  labels: Map<string, number>;
  groups: string[][];
  onChange: (groups: string[][]) => void;
}) {
  const [chosen, setChosen] = useState<string[]>([]);
  const active = chosen.filter((id) => images.some((i) => i.id === id));
  if (active.length !== chosen.length) setChosen(active);
  const validGroups = groups
    .map((g) => g.filter((id) => images.some((i) => i.id === id)))
    .filter((g) => g.length >= 2);
  if (images.length < 2) return null;
  const newImages = images.filter((i) => !labels.has(i.id));
  const label = (id: string) =>
    labels.has(id)
      ? `图片 ${labels.get(id)}`
      : `新图片 ${newImages.findIndex((i) => i.id === id) + 1}`;
  return (
    <details
      className="mb-2 rounded-lg border p-2 text-xs"
      aria-label="图片分组"
    >
      <summary className="cursor-pointer">
        图片分组（可选）
        {validGroups.length ? ` · 已分为 ${validGroups.length} 组` : ""}
      </summary>
      <div className="mt-2 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {images.map((i) => (
            <Button
              key={i.id}
              type="button"
              size="xs"
              variant={active.includes(i.id) ? "secondary" : "outline"}
              aria-pressed={active.includes(i.id)}
              aria-label={`选择分组：${label(i.id)}`}
              onClick={() =>
                setChosen(
                  active.includes(i.id)
                    ? active.filter((id) => id !== i.id)
                    : [...active, i.id],
                )
              }
            >
              {label(i.id)}
            </Button>
          ))}
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={active.length < 2}
            onClick={() => {
              const remaining = validGroups
                .map((g) => g.filter((id) => !active.includes(id)))
                .filter((g) => g.length >= 2);
              onChange([
                ...remaining,
                images.filter((i) => active.includes(i.id)).map((i) => i.id),
              ]);
              setChosen([]);
            }}
          >
            标为同一件作品
          </Button>
        </div>
        {validGroups.map((group, index) => (
          <div
            key={group.join(":")}
            className="flex flex-wrap items-center gap-2"
          >
            <span>同一作品：{group.map(label).join("、")}</span>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() =>
                onChange(validGroups.filter((_, n) => n !== index))
              }
            >
              取消分组
            </Button>
          </div>
        ))}
        <p className="text-muted-foreground">
          分组仅用于整理图片，不代表已确认作品对应。
        </p>
      </div>
    </details>
  );
}
