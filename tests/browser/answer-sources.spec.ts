import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";
import type { ImageRequest } from "../../src/lib/vision/types";

const home = "http://127.0.0.1:3102";
const sizes = [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 414, height: 896 }, { width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1536, height: 864 }, { width: 1920, height: 1080 }, { width: 2560, height: 1440 }];
type TestClipboard = { writes: string[]; mode: string };
async function stubClipboard(page: Page, mode = "memory") {
  await page.addInitScript((mode) => {
    const state = { writes: [] as string[], mode: new URLSearchParams(location.search).get("clipboard") ?? mode };
    (window as unknown as { sourceClipboard: TestClipboard }).sourceClipboard = state;
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText(text: string) {
      state.writes.push(text);
      return state.mode === "reject" ? Promise.reject(new Error("Synthetic denied clipboard")) : Promise.resolve();
    } } });
  }, mode);
}
async function copied(page: Page) { return page.evaluate(() => (window as unknown as { sourceClipboard: TestClipboard }).sourceClipboard.writes); }
async function send(page: Page, question: string) {
  await page.getByRole("textbox", { name: "消息内容" }).fill(question);
  const response = page.waitForResponse((r) => r.url().endsWith("/api/chat"));
  await page.getByRole("button", { name: "发送消息" }).click();
  const received = await response;
  expect(received.status()).toBe(200);
  return received.json();
}
async function counts(id: string) { return JSON.parse(await readFile(`test-results/source-audit/${id}.json`, "utf8")); }
async function layout(page: Page) {
  const result = await page.evaluate(() => {
    const composer = document.querySelector('[aria-label="消息输入"]')!.getBoundingClientRect();
    const field = document.querySelector('[aria-label="消息内容"]')!.getBoundingClientRect();
    const footer = document.querySelector("footer")!.getBoundingClientRect();
    return { overflow: document.documentElement.scrollWidth > innerWidth, reachable: field.top >= 0 && composer.bottom <= innerHeight && composer.bottom <= footer.top + 1 };
  });
  expect(result).toEqual({ overflow: false, reachable: true });
}

for (const size of sizes) test(`source inspection/copy and maximum evidence layout at ${size.width}`, async ({ page }) => {
  await page.setViewportSize(size);
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  const id = randomUUID(); await page.setExtraHTTPHeaders({ "x-jinlan-test-case": id });
  await stubClipboard(page);
  await page.goto(home);
  const initial = await send(page, "[sources:original] [fixture:answer] 介绍测试画师");
  const first = page.getByRole("listitem", { name: "雪域金澜的回答" }).first();
  const key = initial.message.references[0].key;
  const before = await counts(id);
  expect(before.chat).toBe(1); expect(before.model).toBe(2); expect(before.archive).toBeGreaterThan(0);
  await expect(first.getByRole("button", { name: "查看来源" })).toHaveAttribute("aria-expanded", "false");
  const marker = first.getByRole("button", { name: `查看依据 ${key}：生平` });
  await marker.click();
  await expect(first.getByLabel(`依据 ${key}`, { exact: true })).toBeFocused();
  const area = first.getByRole("region", { name: "本条回答使用的依据" });
  await expect(area).toContainText("原始合成资料");
  await expect(area).toContainText("第 3 页");
  await first.getByRole("button", { name: "返回引用" }).click();
  await expect(marker).toBeFocused();
  await first.getByRole("button", { name: "复制回答" }).click();
  await expect(first.getByRole("status", { name: "复制状态" })).toHaveText("已复制");
  expect((await copied(page))[0]).toContain("原始合成资料");
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await counts(id)).toEqual(before);
  await layout(page);
  const nextRequest = page.waitForRequest((r) => r.url().endsWith("/api/chat"));
  const nextResponse = send(page, "[sources:revised] [fixture:answer] 再查一次测试画师");
  const sent = (await nextRequest).postDataJSON();
  expect(sent.messages[1].text).toBe(initial.message.text);
  expect(sent.messages[1]).not.toHaveProperty("references");
  expect(sent.observations).toEqual([]); expect(sent.images).toEqual([]);
  await nextResponse;
  const second = page.getByRole("listitem", { name: "雪域金澜的回答" }).nth(1);
  await second.getByRole("button", { name: "查看来源" }).click();
  await expect(second.getByRole("region", { name: "本条回答使用的依据" })).toContainText("修订合成资料");
  await expect(second.getByRole("region", { name: "本条回答使用的依据" })).toContainText("更新后的合成生平");
  await expect(area).toContainText("原始合成资料"); await expect(area).not.toContainText("更新后的合成生平");
  if ([390, 1366].includes(size.width)) await page.screenshot({ path: `test-results/sources-${size.width}.png` });

  await page.goto("http://127.0.0.1:3101/?mode=sources&clipboard=reject");
  const maximum = page.getByRole("listitem", { name: "雪域金澜的回答" }).first();
  await maximum.getByRole("button", { name: "查看依据 E64：生平" }).click();
  await expect(maximum.getByLabel("依据 E64", { exact: true })).toBeFocused();
  await expect(maximum.getByLabel("依据 R4", { exact: true })).toContainText("图片记录");
  await maximum.getByRole("button", { name: "复制回答" }).click();
  const fallback = maximum.getByRole("textbox", { name: "本条回答的复制文本" });
  await expect(fallback).toHaveAttribute("readonly");
  await expect(fallback).toHaveValue(/第 64 页/);
  await maximum.getByRole("button", { name: "选择全部" }).click();
  await expect(fallback).toBeFocused();
  expect(await fallback.evaluate((node: HTMLTextAreaElement) => node.selectionEnd === node.value.length && node.selectionStart === 0)).toBe(true);
  await layout(page);
  if ([390, 1366].includes(size.width)) await page.screenshot({ path: `test-results/source-fallback-${size.width}.png` });
  expect(errors).toEqual([]);
});

test("a held answer and pending image preparation preserve old-source selection and a newer draft", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stubClipboard(page, "reject");
  await page.goto(home);
  await send(page, "[sources:original] 介绍测试画师");
  const first = page.getByRole("listitem", { name: "雪域金澜的回答" }).first();
  await first.getByRole("button", { name: "查看来源" }).click();
  const field = page.getByRole("textbox", { name: "消息内容" });
  let release!: () => void, ready!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const upstreamReady = new Promise<void>((resolve) => { ready = resolve; });
  await page.route("**/api/chat", async (route) => {
    const response = await route.fetch();
    ready();
    await gate;
    await route.fulfill({ response });
  });
  try {
    await field.fill("[fixture:general] 通用交流");
    const response = page.waitForResponse((r) => r.url().endsWith("/api/chat"));
    await page.getByRole("button", { name: "发送消息" }).click();
    await upstreamReady;
    await field.fill("保留的下一条草稿");
    await first.getByRole("button", { name: "复制回答" }).click();
    await first.getByRole("button", { name: "选择全部" }).click();
    const fallback = first.getByRole("textbox", { name: "本条回答的复制文本" });
    await fallback.evaluate((node: HTMLTextAreaElement) => node.setSelectionRange(3, 11, "backward"));
    const picture = await sharp({ create: { width: 180, height: 180, channels: 4, background: "#535a67" } }).png().toBuffer();
    await page.getByLabel("选择图片", { exact: true }).setInputFiles({ name: "pending-source-picture.png", mimeType: "image/png", buffer: picture });
    await expect(page.getByRole("img", { name: "待发送图片 1", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "发送消息" })).toBeDisabled();
    await expect(page.getByRole("listitem", { name: "雪域金澜的回答" })).toHaveCount(1);
    await expect(fallback).toBeFocused();
    const before = await fallback.boundingBox();
    const selection = () => fallback.evaluate((node: HTMLTextAreaElement) => [node.selectionStart, node.selectionEnd, node.selectionDirection]);
    expect(await selection()).toEqual([3, 11, "backward"]);
    release();
    expect((await response).status()).toBe(200);
    await expect(page.getByRole("listitem", { name: "雪域金澜的回答" })).toHaveCount(2);
    await expect(fallback).toBeFocused();
    expect((await fallback.boundingBox())!.y).toBeCloseTo(before!.y, 0);
    expect(await selection()).toEqual([3, 11, "backward"]);
    await expect(first.getByRole("button", { name: "查看来源" })).toHaveAttribute("aria-expanded", "true");
    await expect(field).toHaveValue("保留的下一条草稿");
    await expect(page.getByRole("img", { name: "待发送图片 1", exact: true })).toBeVisible();
    await field.click(); await expect(field).toBeFocused();
    await layout(page);
  } finally {
    release();
  }
});

test("keyboard scrolling from an evidence entry resumes following the latest answers", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(home);
  await send(page, "[sources:original] 介绍测试画师");
  await send(page, "[sources:original] 再说说测试画师");
  const first = page.getByRole("listitem", { name: "雪域金澜的回答" }).first();
  const region = page.getByRole("region", { name: "对话内容" });
  const bottomDistance = () => region.evaluate((node) => node.scrollHeight - node.clientHeight - node.scrollTop);
  await page.getByRole("textbox", { name: "消息内容" }).fill("[fixture:slow] 通用交流");
  const response = page.waitForResponse((r) => r.url().endsWith("/api/chat"));
  await page.getByRole("button", { name: "发送消息" }).click();
  await first.getByRole("button", { name: /查看依据 E\d+：生平/ }).click();
  await expect(first.getByLabel(/^依据 E\d+$/)).toBeFocused();
  expect(await bottomDistance()).toBeGreaterThan(100);
  await page.keyboard.press("End");
  await expect.poll(bottomDistance).toBeLessThan(2);
  await response;
  await expect(page.getByRole("listitem", { name: "雪域金澜的回答" })).toHaveCount(3);
  await expect.poll(bottomDistance).toBeLessThan(2);
});

test("expanded evidence and fallback adapt continuously through intermediate widths and landscape", async ({ page }) => {
  await stubClipboard(page, "reject");
  await page.goto("http://127.0.0.1:3101/?mode=sources");
  const first = page.getByRole("listitem", { name: "雪域金澜的回答" }).first();
  await first.getByRole("button", { name: "查看来源" }).click();
  await first.getByRole("button", { name: "复制回答" }).click();
  for (const [width, height] of [[430, 800], [638, 720], [640, 720], [768, 720], [1024, 720], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await first.getByRole("button", { name: "选择全部" }).click();
    await layout(page);
  }
});

test("native Chromium clipboard copies the chosen answer at trusted loopback", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(home);
  await send(page, "[fixture:general] 通用交流");
  await page.getByRole("button", { name: "复制回答" }).click();
  await expect(page.getByRole("status", { name: "复制状态" })).toHaveText("已复制");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("通用知识补充");
});

test("dismissing manual copy returns focus to a visible copy control in a short viewport", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await stubClipboard(page, "reject");
  await page.goto("http://127.0.0.1:3101/?mode=sources");
  const first = page.getByRole("listitem", { name: "雪域金澜的回答" }).first();
  const copy = first.getByRole("button", { name: "复制回答" });
  await copy.click();
  await first.getByRole("button", { name: "选择全部" }).click();
  const dismiss = first.getByRole("button", { name: "收起复制文本" });
  await dismiss.focus();
  await dismiss.press("Enter");
  await expect(copy).toBeFocused();
  const control = (await copy.boundingBox())!;
  const region = (await page.getByRole("region", { name: "对话内容" }).boundingBox())!;
  const clearance = await copy.evaluate((node) => parseFloat(getComputedStyle(node).scrollMarginTop));
  expect(clearance).toBeGreaterThan(0);
  expect(control.y).toBeGreaterThanOrEqual(region.y + clearance - 1);
  expect(control.y + control.height).toBeLessThanOrEqual(region.y + region.height - clearance + 1);
  await layout(page);
  await page.screenshot({ path: "test-results/close-copy-844.png" });
  const composer = page.getByRole("textbox", { name: "消息内容" });
  await composer.fill("收起后的独立草稿");
  await expect(composer).toBeFocused();
});

test("collapsing a long source panel with focus inside keeps its disclosure control visible", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("http://127.0.0.1:3101/?mode=sources");
  const first = page.getByRole("listitem", { name: "雪域金澜的回答" }).first();
  const trigger = first.getByRole("button", { name: "查看来源" });
  await first.getByRole("button", { name: "查看依据 E64：生平" }).click();
  await expect(first.getByLabel("依据 E64", { exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  expect(await first.getByRole("region", { name: "本条回答使用的依据" }).evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await trigger.evaluate((node: HTMLButtonElement) => node.click());
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
  const control = (await trigger.boundingBox())!;
  const region = (await page.getByRole("region", { name: "对话内容" }).boundingBox())!;
  const clearance = await trigger.evaluate((node) => parseFloat(getComputedStyle(node).scrollMarginTop));
  expect(clearance).toBeGreaterThan(0);
  expect(control.y).toBeGreaterThanOrEqual(region.y + clearance - 1);
  expect(control.y + control.height).toBeLessThanOrEqual(region.y + region.height - clearance + 1);
  await layout(page);
  await page.screenshot({ path: "test-results/close-sources-844.png" });
  const composer = page.getByRole("textbox", { name: "消息内容" });
  await composer.fill("来源收起后的独立草稿");
  await expect(composer).toBeFocused();
});

test("real image comparison E/R navigation and copying leave observations/canonical follow-up unchanged", async ({ page }) => {
  const id = randomUUID(); await page.setExtraHTTPHeaders({ "x-jinlan-test-case": id });
  await stubClipboard(page);
  const requests: ImageRequest[] = [];
  page.on("request", (request) => { if (request.url().endsWith("/api/chat")) requests.push(request.postDataJSON()); });
  await page.goto(home);
  const picture = await sharp({ create: { width: 180, height: 180, channels: 4, background: "#905044" } }).png().toBuffer();
  await page.getByLabel("选择图片", { exact: true }).setInputFiles({ name: "synthetic-source-picture.png", mimeType: "image/png", buffer: picture });
  await expect(page.getByRole("button", { name: "发送消息" })).toBeEnabled();
  const initial = await send(page, "[vision:ordinary] 核对这张图的档案依据");
  const first = page.getByRole("listitem", { name: "雪域金澜的回答" }).first();
  const before = await counts(id);
  expect(before.storage).toBe(2);
  await first.getByRole("button", { name: "查看参考图依据 R1：档案参考图" }).click();
  await expect(first.getByLabel("依据 R1", { exact: true })).toBeFocused();
  const proof = first.getByLabel("依据 R1", { exact: true }).getByRole("button", { name: /查看依据 E\d+：作品说明/ }).first();
  await proof.click();
  await expect(first.getByLabel(`依据 ${initial.message.comparisons[0].proofs[0].evidenceKey}`, { exact: true })).toBeFocused();
  await first.getByRole("button", { name: "复制回答" }).click();
  const output = (await copied(page))[0];
  expect(output).toContain("局部花瓣与所选图片不同");
  expect(output).toContain("实际支持图片：图片 1");
  expect(output).not.toContain(requests[0].inputs[0].data);
  expect(await counts(id)).toEqual(before);
  await send(page, "[vision:summary] 沿用已有观察解释");
  expect(requests[1].messages[1].text).toBe(initial.message.text);
  expect(requests[1].observations).toEqual(initial.message.observations);
  expect(requests[1].images).toEqual(requests[0].images);
  expect(requests[1].inputs).toEqual([]);
  await first.getByRole("button", { name: "复制回答" }).click();
  expect((await copied(page)).at(-1)).toBe(output);
});
