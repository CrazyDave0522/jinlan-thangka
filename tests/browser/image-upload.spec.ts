import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";
import type { ChatRequest } from "../../src/lib/chat/conversation";

const home = "http://127.0.0.1:3100";
const picker = (page: Page) => page.getByLabel("选择图片", { exact: true });
const send = (page: Page) => page.getByRole("button", { name: "发送消息" });
const draft = (page: Page) => page.getByRole("textbox", { name: "消息内容" });
async function files(count = 4) {
  return Promise.all(Array.from({ length: count }, async (_, i) => ({ name: `synthetic-${i}.png`, mimeType: "image/png", buffer: await sharp({ create: { width: 500 + i * 10, height: 360, channels: 4, background: ["#8f4848", "#387f69", "#6d65a0", "#aa8233"][i % 4] } }).png().toBuffer() })));
}
async function select(page: Page, input: Awaited<ReturnType<typeof files>>) {
  await picker(page).setInputFiles(input);
  await expect(page.getByText("正在处理图片…", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("list", { name: "待发送图片" }).getByRole("listitem")).toHaveCount(input.length);
}
const viewports = [
  { width: 360, height: 800 }, { width: 390, height: 844 }, { width: 414, height: 896 },
  { width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1536, height: 864 },
  { width: 1920, height: 1080 }, { width: 2560, height: 1440 },
];
for (const viewport of viewports) {
  test(`real multi-image bytes, context and layout at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    const requests: ChatRequest[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => { if (request.url().endsWith("/api/chat")) requests.push(request.postDataJSON()); });
    await page.goto(home);
    await select(page, await files());
    await expect(send(page)).toBeEnabled();
    const panel = page.getByRole("list", { name: "待发送图片" });
    expect(await panel.evaluate((element) => element.getBoundingClientRect().height)).toBeLessThanOrEqual(160);
    await expect(page.getByRole("button", { name: "移除图片 4" })).toBeVisible();
    for (const width of [viewport.width, ...(viewport.width === 390 ? [375, 430, 639, 640, 641, 768, 1024] : [])]) {
      await page.setViewportSize({ width, height: viewport.height });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const bounds = await send(page).boundingBox();
      expect(bounds!.y + bounds!.height).toBeLessThan(viewport.height);
    }
    await page.setViewportSize(viewport);
    if ([390, 1366].includes(viewport.width)) await page.screenshot({ path: `test-results/image-draft-${viewport.width}.png` });
    await send(page).click();
    await expect(page.getByRole("region", { name: "对话内容" }).getByRole("alert")).toHaveText("图片解读暂未接入，请先发送纯文字问题。");
    await expect(page.getByRole("listitem", { name: "用户消息" })).toHaveCount(1);
    const submitted = page.getByRole("listitem", { name: "用户消息" });
    await expect(submitted.getByRole("img")).toHaveCount(4);
    for (const image of await submitted.getByRole("img").all()) expect(await image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    expect(requests).toHaveLength(1);
    const images = requests[0].messages[0].images!;
    expect(images).toHaveLength(4);
    for (const [index, image] of images.entries()) {
      const meta = await sharp(Buffer.from(image.data, "base64")).metadata();
      expect(meta.width).toBe(500 + index * 10);
      expect(meta.height).toBe(360);
      expect(Buffer.from(image.data, "base64").length).toBeLessThanOrEqual(500_000);
      expect(image).not.toHaveProperty("url");
    }
    await draft(page).fill("比较以上图片");
    await send(page).click();
    await expect(page.getByRole("region", { name: "对话内容" }).getByRole("status").last()).toHaveText("AI 服务暂未开启，暂时无法回复。");
    await expect(page.getByRole("region", { name: "对话内容" }).getByRole("status")).toHaveCount(1);
    expect(requests[1].messages[0].images).toBeUndefined();
    expect(requests[1].messages[0].text).toBe("比较以上图片");
    if ([390, 1366].includes(viewport.width)) await page.screenshot({ path: `test-results/image-submitted-${viewport.width}.png` });
    await page.reload();
    await expect(page.getByRole("heading", { name: "一起探索唐卡艺术" })).toBeVisible();
    await expect(page.getByRole("list")).toHaveCount(0);
    expect(requests).toHaveLength(2);
    expect(errors).toEqual([]);
  });
}

test("invalid and excessive batches preserve a valid draft; remove/reselect is supported", async ({ page }) => {
  await page.goto(home);
  await select(page, await files(1));
  await draft(page).fill("保留文字");
  const alert = page.getByRole("region", { name: "消息输入" }).getByRole("alert");
  await picker(page).setInputFiles({ name: "unsupported.webp", mimeType: "image/webp", buffer: Buffer.from("not a supported image") });
  await expect(alert).toContainText(/仅支持|损坏/);
  await expect(page.getByRole("list", { name: "待发送图片" }).getByRole("listitem")).toHaveCount(1);
  await picker(page).setInputFiles(await files(4));
  await expect(alert).toHaveText("每条消息最多选择 4 张图片。");
  await picker(page).setInputFiles({ name: "huge.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(5_000_001) });
  await expect(alert).toContainText("5 MB");
  await expect(draft(page)).toHaveValue("保留文字");
  await page.getByRole("button", { name: "移除图片 1" }).click();
  await expect(page.getByRole("list", { name: "待发送图片" })).toHaveCount(0);
  await select(page, await files(1));
  await expect(draft(page)).toHaveValue("保留文字");
});

test("real worker applies JPEG orientation, downscales and preserves PNG alpha", async ({ page }) => {
  const jpeg = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: "#995030" } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const png = await sharp({ create: { width: 10, height: 12, channels: 4, background: { r: 50, g: 100, b: 150, alpha: 0.25 } } }).png().toBuffer();
  await page.goto(home);
  await select(page, [{ name: "rotated.JPG", mimeType: "image/jpeg", buffer: jpeg }, { name: "alpha.png", mimeType: "image/png", buffer: png }]);
  const request = page.waitForRequest((req) => req.url().endsWith("/api/chat"));
  await send(page).click();
  const body = (await request).postDataJSON() as ChatRequest;
  const images = body.messages[0].images!;
  expect([images[0].width, images[0].height]).toEqual([800, 1600]);
  const decoded = await sharp(Buffer.from(images[1].data, "base64")).raw().toBuffer({ resolveWithObject: true });
  expect(decoded.info.channels).toBe(4);
  expect(decoded.data[3]).toBeGreaterThan(0);
  expect(decoded.data[3]).toBeLessThan(255);
  await expect(page.getByRole("region", { name: "对话内容" }).getByRole("alert")).toContainText("图片解读暂未接入");
});

test("image retry reuses identical bytes while preserving a pending next image draft", async ({ page }) => {
  let release!: () => void;
  const requests: ChatRequest[] = [];
  await page.route("**/api/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    if (requests.length === 1) {
      await new Promise<void>((resolve) => { release = resolve; });
      await route.fulfill({ status: 500, json: {} });
    } else await route.fulfill({ status: 503, json: { error: { code: "generation_unavailable" } } });
  });
  await page.goto(home);
  await select(page, await files(2));
  await send(page).click();
  await expect(page.getByRole("region", { name: "对话内容" }).getByRole("status")).toContainText("正在处理");
  await select(page, await files(1));
  await draft(page).fill("下一条的文字与图片");
  await expect(send(page)).toBeDisabled();
  await page.screenshot({ path: "test-results/image-pending.png" });
  release();
  await expect(page.getByRole("button", { name: "重试" })).toBeVisible();
  await page.screenshot({ path: "test-results/image-retry.png" });
  await page.getByRole("button", { name: "重试" }).click();
  await expect(page.getByRole("region", { name: "对话内容" }).getByRole("status")).toContainText("AI 服务暂未开启");
  expect(requests[1]).toEqual(requests[0]);
  await expect(page.getByRole("listitem", { name: "用户消息" })).toHaveCount(1);
  await expect(page.getByRole("list", { name: "待发送图片" }).getByRole("listitem")).toHaveCount(1);
  await expect(draft(page)).toHaveValue("下一条的文字与图片");
});

test("oversized text preserves the draft after an unavailable image turn", async ({ page }) => {
  let count = 0;
  page.on("request", (request) => { if (request.url().endsWith("/api/chat")) count++; });
  await page.goto(home);
  await select(page, await files(1));
  await send(page).click();
  await expect(page.getByRole("region", { name: "对话内容" }).getByRole("alert")).toContainText("图片解读暂未接入");
  const text = "文".repeat(1_333_334);
  await draft(page).fill(text);
  await send(page).click();
  await expect(page.getByRole("region", { name: "消息输入" }).getByRole("alert")).toContainText("缩短问题");
  expect(count).toBe(1);
  await expect(draft(page)).toHaveValue(text);
  await expect(page.getByRole("listitem", { name: "用户消息" })).toHaveCount(1);
});

test("gateway size and invalid-image outcomes require correction instead of identical retry", async ({ page }) => {
  for (const status of [413, 422]) {
    await page.route("**/api/chat", (route) => route.fulfill(status === 413 ? { status, body: "gateway too large" } : { status, json: { error: { code: "invalid_image" } } }));
    await page.goto(home);
    await select(page, await files(1));
    await send(page).click();
    await expect(page.getByRole("region", { name: "对话内容" }).getByRole("alert")).toContainText(status === 413 ? "减少图片" : "重新选择");
    await expect(page.getByRole("button", { name: "重试" })).toHaveCount(0);
    await page.unroute("**/api/chat");
  }
});

test("four previews keep controls reachable at reduced heights and image-only load failure is labelled", async ({ page }) => {
  await page.goto(home);
  await select(page, await files());
  for (const viewport of [{ width: 844, height: 390 }, { width: 390, height: 640 }, { width: 1024, height: 720 }]) {
    await page.setViewportSize(viewport);
    const layout = await page.evaluate(() => {
      const region = document.querySelector(".chat-messages")!.getBoundingClientRect();
      const field = document.querySelector("textarea")!.getBoundingClientRect();
      const footer = document.querySelector("footer")!.getBoundingClientRect();
      return { overflow: document.documentElement.scrollWidth > innerWidth, region: region.height, field: field.bottom <= footer.top, footer: footer.bottom <= innerHeight + 1 };
    });
    expect(layout.overflow).toBe(false);
    expect(layout.region).toBeGreaterThan(0);
    expect(layout.field).toBe(true);
    expect(layout.footer).toBe(true);
  }
  await send(page).click();
  await expect(page.getByRole("region", { name: "对话内容" }).getByRole("alert")).toContainText("图片解读暂未接入");
  const image = page.getByRole("listitem", { name: "用户消息" }).getByRole("img").first();
  await image.evaluate((element) => element.dispatchEvent(new Event("error")));
  await expect(page.getByText("图片 1：图片暂时无法显示")).toBeVisible();
  await expect(page.getByRole("listitem", { name: "用户消息" }).getByRole("img")).toHaveCount(3);
});

test("bounded preparation rejects high-entropy PNG rather than degrading below the policy", async ({ page }) => {
  const pixels = Buffer.alloc(1200 * 1200 * 3);
  let seed = 1234567;
  for (let i = 0; i < pixels.length; i++) { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; pixels[i] = seed & 255; }
  const buffer = await sharp(pixels, { raw: { width: 1200, height: 1200, channels: 3 } }).png().toBuffer();
  expect(buffer.length).toBeLessThan(5_000_000);
  await page.goto(home);
  await draft(page).fill("保留原草稿");
  await picker(page).setInputFiles({ name: "synthetic-noise.png", mimeType: "image/png", buffer });
  await expect(page.getByRole("region", { name: "消息输入" }).getByRole("alert")).toContainText("处理后仍超过 0.5 MB");
  await expect(draft(page)).toHaveValue("保留原草稿");
  await expect(page.getByRole("list", { name: "待发送图片" })).toHaveCount(0);
});

test("the visible image button opens the picker and does not upload on selection", async ({ page }) => {
  let requests = 0;
  page.on("request", (request) => { if (request.url().endsWith("/api/chat")) requests++; });
  await page.goto(home);
  const dialog = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "上传图片" }).click();
  await (await dialog).setFiles(await files(1));
  await expect(page.getByRole("button", { name: "移除图片 1" })).toBeVisible();
  expect(requests).toBe(0);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});
