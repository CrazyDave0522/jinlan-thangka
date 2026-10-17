"use client";

import { useEffect, useRef, useState } from "react";
import { prepareImage } from "@/lib/chat/image-client";
import {
  IMAGE_LIMITS,
  IMAGE_MEMORY_NOTICE,
  IMAGE_CONTEXT_NOTICE,
  type LocalImage,
} from "@/lib/chat/image-policy";

export function useImageDraft() {
  const [images, setImages] = useState<LocalImage[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  const draft = useRef<LocalImage[]>([]);
  const registry = useRef(new Map<string, LocalImage>());
  const submitted = useRef(new Set<string>());
  const work = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      work.current?.abort();
      work.current = null;
      for (const image of registry.current.values())
        URL.revokeObjectURL(image.url);
      registry.current.clear();
    },
    [],
  );

  function cancel() {
    work.current?.abort();
    work.current = null;
    setPreparing(false);
  }
  function remove(id: string) {
    cancel();
    const image = registry.current.get(id);
    if (image && !submitted.current.has(id)) {
      URL.revokeObjectURL(image.url);
      registry.current.delete(id);
    }
    draft.current = draft.current.filter((image) => image.id !== id);
    setImages(draft.current);
    setError("");
  }
  function take() {
    const captured = draft.current;
    captured.forEach((i) => submitted.current.add(i.id));
    draft.current = [];
    setImages([]);
    setError("");
    return captured;
  }

  async function select(files: File[]) {
    if (!files.length || work.current) return;
    if (files.length + draft.current.length > IMAGE_LIMITS.count) {
      setError("每条消息最多选择 4 张图片。");
      return;
    }
    if (files.length + registry.current.size > 20) {
      setError(IMAGE_CONTEXT_NOTICE);
      return;
    }
    if (
      files.some((file) => !file.size || file.size > IMAGE_LIMITS.originalBytes)
    ) {
      setError("单张图片须大于 0 且不超过 5 MB。");
      return;
    }
    const controller = new AbortController();
    work.current = controller;
    setPreparing(true);
    setError("");
    const batch: LocalImage[] = [];
    try {
      for (const file of files) {
        const timer = setTimeout(
          () => controller.abort(new Error("图片处理超时，请选择更小的图片。")),
          IMAGE_LIMITS.preparationMs,
        );
        // Race allows timely UI recovery even if a native decoder finishes late.
        const aborted = new Promise<never>((_, reject) => {
          controller.signal.addEventListener(
            "abort",
            () => reject(controller.signal.reason),
            { once: true },
          );
        });
        try {
          const prepared = prepareImage(file, controller.signal).then(
            (image) => {
              if (controller.signal.aborted || work.current !== controller) {
                URL.revokeObjectURL(image.url);
                throw new DOMException("Aborted", "AbortError");
              }
              return image;
            },
          );
          const image = await Promise.race([prepared, aborted]);
          batch.push(image);
        } catch (failure) {
          if (controller.signal.aborted) throw controller.signal.reason;
          throw new Error(
            `${file.name}：${failure instanceof Error ? failure.message : "图片处理失败，请重新选择。"}`,
          );
        } finally {
          clearTimeout(timer);
        }
      }
      if (work.current !== controller || controller.signal.aborted) return;
      if (draft.current.length + batch.length > IMAGE_LIMITS.count)
        throw new Error("每次最多可同时查看 4 张图片，请减少新图片或取消已选历史图片。");
      if (registry.current.size + batch.length > 20)
        throw new Error(IMAGE_CONTEXT_NOTICE);
      const retained = [...registry.current.values()].reduce(
        (sum, image) => sum + image.blob.size,
        0,
      );
      if (
        retained + batch.reduce((sum, image) => sum + image.blob.size, 0) >
        IMAGE_LIMITS.retainedBytes
      )
        throw new Error(IMAGE_MEMORY_NOTICE);
      for (const image of batch) registry.current.set(image.id, image);
      draft.current = [...draft.current, ...batch];
      setImages(draft.current);
    } catch (failure) {
      if (work.current === controller)
        setError(
          failure instanceof Error
            ? failure.message
            : "图片处理失败，请重新选择。",
        );
    } finally {
      for (const image of batch)
        if (!registry.current.has(image.id)) URL.revokeObjectURL(image.url);
      if (work.current === controller) {
        work.current = null;
        setPreparing(false);
      }
    }
  }
  function releaseUnreferenced(retained: Set<string>) {
    const selected = new Set(draft.current.map((image) => image.id));
    for (const [id, image] of registry.current)
      if (!retained.has(id) && !selected.has(id)) {
        URL.revokeObjectURL(image.url);
        registry.current.delete(id);
        submitted.current.delete(id);
      }
  }
  function addRetained(id: string) {
    const image = registry.current.get(id);
    if (!image || draft.current.some((i) => i.id === id)) return;
    if (draft.current.length >= IMAGE_LIMITS.count) {
      setError("每次最多可同时查看 4 张图片，请减少新图片或取消已选历史图片。");
      return;
    }
    draft.current = [...draft.current, image];
    setImages(draft.current);
    setError("");
  }
  return {
    images,
    preparing,
    error,
    select,
    remove,
    take,
    releaseUnreferenced,
    addRetained,
    get: (id: string) => registry.current.get(id),
    isPreparing: () => work.current !== null,
  };
}
