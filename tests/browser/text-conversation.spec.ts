import { expect, test, type Page, type Route } from "@playwright/test";
import type { ChatRequest } from "../../src/lib/chat/conversation";

const home = "http://127.0.0.1:3100";
const field = (page: Page) => page.getByRole("textbox", { name: "消息内容" });
async function submit(page: Page, text: string) {
  await field(page).fill(text);
  await page.getByRole("button", { name: "发送消息" }).click();
}
const viewports = [
  { width: 360, height: 800 }, { width: 390, height: 844 }, { width: 414, height: 896 },
  { width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1536, height: 864 },
  { width: 1920, height: 1080 }, { width: 2560, height: 1440 },
];
for (const viewport of viewports) {
  test(`real request and sequential context at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const requests: ChatRequest[] = [];
    page.on("request", (request) => { if (request.url().endsWith("/api/chat")) requests.push(request.postDataJSON()); });
    await page.goto(home);
    await field(page).fill("  唐卡\n艺术  ");
    const firstResponse = page.waitForResponse((response) => response.url().endsWith("/api/chat"));
    await field(page).press("Enter");
    const response = await firstResponse;
    expect(response.status()).toBe(503);
    expect(response.headers()["cache-control"]).toContain("no-store");
    await expect(page.getByRole("status")).toHaveText("AI 回复暂未接入，暂时无法回复。");
    await expect(field(page)).toHaveValue("");
    await expect(page.getByRole("listitem")).toHaveCount(1);
    await expect(page.getByRole("listitem", { name: "雪域金澜的回答" })).toHaveCount(0);
    await submit(page, "后续问题");
    await expect(page.getByRole("status").last()).toHaveText("AI 回复暂未接入，暂时无法回复。");
    await expect(page.getByRole("status")).toHaveCount(2);
    expect(requests).toHaveLength(2);
    expect(requests[1].messages.map((message) => message.text)).toEqual(["唐卡\n艺术", "后续问题"]);
    expect(requests[1].messages[0].id).toBe(requests[0].turnId);
    expect(requests[1].messages[1].id).toBe(requests[1].turnId);
    const metrics = await page.evaluate(() => {
      const composer = document.querySelector(".chat-composer")!.getBoundingClientRect();
      const footer = document.querySelector("footer")!.getBoundingClientRect();
      return { overflow: document.documentElement.scrollWidth > innerWidth, visible: composer.bottom <= footer.top + 1 && footer.bottom <= innerHeight + 1 };
    });
    expect(metrics).toEqual({ overflow: false, visible: true });
    if (viewport.width === 390 || viewport.width === 1366) await page.screenshot({ path: `test-results/unavailable-${viewport.width}.png` });
    await field(page).fill("未发送草稿");
    await page.reload();
    await expect(field(page)).toHaveValue("");
    await expect(page.getByRole("heading", { name: "一起探索唐卡艺术" })).toBeVisible();
    await expect(page.getByRole("list")).toHaveCount(0);
    expect(requests).toHaveLength(2);
  });
}

test("pending draft, duplicate guard, retry snapshot and success context", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests: ChatRequest[] = [];
  let release!: () => void;
  await page.route("**/api/chat", async (route) => {
    const body = route.request().postDataJSON() as ChatRequest;
    requests.push(body);
    if (requests.length === 1) {
      await new Promise<void>((resolve) => { release = resolve; });
      await route.fulfill({ status: 500, json: { error: { code: "test_failure" } } });
    } else if (requests.length === 2) {
      await route.fulfill({ json: { turnId: body.turnId, message: { id: "mock-answer", role: "assistant", text: "仅用于浏览器测试的回答" } } });
    } else await route.fulfill({ status: 503, json: { error: { code: "generation_unavailable" } } });
  });
  await page.goto(home);
  await submit(page, "原始问题");
  await expect(page.getByRole("status")).toHaveText("正在处理…");
  await field(page).fill("正在编辑的新草稿");
  await field(page).press("Enter");
  await expect(page.getByRole("button", { name: "发送消息" })).toBeDisabled();
  expect(requests).toHaveLength(1);
  await page.screenshot({ path: "test-results/conversation-pending.png" });
  release();
  await expect(page.getByRole("region", { name: "对话内容" }).getByRole("alert")).toHaveText("发送失败，请重试。");
  await page.screenshot({ path: "test-results/conversation-failed.png" });
  await page.getByRole("button", { name: "重试" }).click();
  await expect(page.getByText("仅用于浏览器测试的回答")).toBeVisible();
  await expect(page.getByRole("listitem", { name: "用户消息" })).toHaveCount(1);
  await expect(field(page)).toHaveValue("正在编辑的新草稿");
  expect(requests[1]).toEqual(requests[0]);
  await page.getByRole("button", { name: "发送消息" }).click();
  await expect(page.getByRole("status")).toHaveText("AI 回复暂未接入，暂时无法回复。");
  expect(requests[2].messages.map((message) => message.role)).toEqual(["user", "assistant", "user"]);
});

test("new questions retire failures and IME confirmation cannot submit", async ({ page }) => {
  const requests: ChatRequest[] = [];
  await page.route("**/api/chat", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status: requests.length === 1 ? 500 : 503, json: { error: { code: "generation_unavailable" } } });
  });
  await page.goto(home);
  await field(page).fill("输入法确认的文字");
  await field(page).evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true }));
    element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  });
  expect(requests).toHaveLength(0);
  await expect(field(page)).toHaveValue("输入法确认的文字");
  await page.getByRole("button", { name: "发送消息" }).click();
  await expect(page.getByRole("button", { name: "重试" })).toBeVisible();
  await submit(page, "新的问题");
  await expect(page.getByRole("region", { name: "对话内容" }).getByRole("alert")).toHaveText("发送失败。");
  await expect(page.getByRole("button", { name: "重试" })).toHaveCount(0);
  expect(requests[1].messages.map((message) => message.text)).toEqual(["新的问题"]);
});

test("touch Enter inserts a newline and the send button submits", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(home);
  await field(page).fill("触屏草稿");
  await field(page).press("End");
  await field(page).press("Enter");
  await expect(field(page)).toHaveValue("触屏草稿\n");
  await expect(page.getByRole("list")).toHaveCount(0);
  await page.getByRole("button", { name: "发送消息" }).tap();
  await expect(page.getByRole("status")).toHaveText("AI 回复暂未接入，暂时无法回复。");
  await page.screenshot({ path: "test-results/conversation-touch.png" });
  await context.close();
});

test("completion follows the bottom but preserves older reading and input focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let count = 0;
  let held: Route | undefined;
  await page.route("**/api/chat", async (route) => {
    count++;
    if (count === 4) { held = route; return; }
    const body = route.request().postDataJSON() as ChatRequest;
    await route.fulfill({ json: { turnId: body.turnId, message: { id: `answer-${count}`, role: "assistant", text: "浏览器测试长回答。\n".repeat(35) } } });
  });
  await page.goto(home);
  const region = page.getByRole("region", { name: "对话内容" });
  for (let index = 1; index <= 3; index++) {
    await submit(page, `问题${index}`);
    await expect(page.getByRole("listitem", { name: "雪域金澜的回答" })).toHaveCount(index);
    await expect.poll(() => region.evaluate((element) => element.scrollHeight - element.scrollTop - element.clientHeight)).toBeLessThan(2);
  }
  await submit(page, "等待中的问题");
  await expect(page.getByRole("status")).toHaveText("正在处理…");
  await expect.poll(() => region.evaluate((element) => element.scrollHeight - element.scrollTop - element.clientHeight)).toBeLessThan(2);
  await field(page).fill("保留焦点与草稿");
  await region.evaluate((element) => { element.scrollTop = 30; element.dispatchEvent(new Event("scroll")); });
  const before = await region.evaluate((element) => element.scrollTop);
  const composerBefore = await field(page).boundingBox();
  const body = held!.request().postDataJSON() as ChatRequest;
  await held!.fulfill({ json: { turnId: body.turnId, message: { id: "last-answer", role: "assistant", text: "追加的测试长回答。\n".repeat(40) } } });
  await expect(page.getByRole("listitem", { name: "雪域金澜的回答" })).toHaveCount(4);
  expect(await region.evaluate((element) => element.scrollTop)).toBe(before);
  await expect(field(page)).toBeFocused();
  await expect(field(page)).toHaveValue("保留焦点与草稿");
  expect(await field(page).boundingBox()).toEqual(composerBefore);
  await page.screenshot({ path: "test-results/conversation-reading-mobile.png" });
});

test("real endpoint rejects invalid bodies with no-store", async ({ request }) => {
  for (const data of ["{invalid", { turnId: "q", messages: [{ id: "q", role: "system", text: "invalid" }] }]) {
    const response = await request.post(`${home}/api/chat`, { data });
    expect(response.status()).toBe(400);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.json()).toEqual({ error: { code: "invalid_request" } });
  }
});

test("reload abandons pending state without replaying a request", async ({ page }) => {
  let requests = 0;
  let held: Route | undefined;
  await page.route("**/api/chat", (route) => { requests++; held = route; });
  await page.goto(home);
  await submit(page, "等待中的问题");
  await expect(page.getByRole("status")).toHaveText("正在处理…");
  await field(page).fill("等待时的新草稿");
  await page.reload();
  await expect(page.getByRole("heading", { name: "一起探索唐卡艺术" })).toBeVisible();
  await expect(field(page)).toHaveValue("");
  await expect(page.getByRole("list")).toHaveCount(0);
  expect(requests).toBe(1);
  await held?.abort();
});
