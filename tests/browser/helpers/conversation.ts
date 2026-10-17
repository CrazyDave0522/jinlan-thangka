import { expect, type Page } from "@playwright/test";
import sharp from "sharp";

export const home = "http://127.0.0.1:3102";
export const coreViewports = [
  { width: 360, height: 800 }, { width: 390, height: 844 }, { width: 414, height: 896 },
  { width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1536, height: 864 },
  { width: 1920, height: 1080 }, { width: 2560, height: 1440 },
];
export const field = (page: Page) => page.getByRole("textbox", { name: "消息内容" });
export const send = (page: Page) => page.getByRole("button", { name: "发送消息" });

export async function visitorFiles(count: number) {
  return Promise.all(Array.from({ length: count }, async (_, n) => ({
    name: `visitor-${n}.png`, mimeType: "image/png",
    buffer: await sharp({ create: { width: 200 + n * 10, height: 140, channels: 4, background: ["#a04455", "#44a055", "#5544a0", "#a09944"][n % 4] } }).png().toBuffer(),
  })));
}

export async function choose(page: Page, count = 1) {
  await page.getByLabel("选择图片", { exact: true }).setInputFiles(await visitorFiles(count));
  await expect(page.getByRole("list", { name: "待发送图片" }).getByRole("listitem")).toHaveCount(count);
  await expect(send(page)).toBeEnabled();
}

export async function submit(page: Page, text: string) {
  await field(page).fill(text);
  const pending = page.waitForResponse((r) => r.url().endsWith("/api/chat"));
  await send(page).click();
  return pending;
}

export async function layout(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const button = await send(page).boundingBox(), height = page.viewportSize()!.height;
  expect(button!.y).toBeGreaterThanOrEqual(0);
  expect(button!.y + button!.height).toBeLessThanOrEqual(height);
  expect(await page.locator(".chat-messages").evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(0);
}
