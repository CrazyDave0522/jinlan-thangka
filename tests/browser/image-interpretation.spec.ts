import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";
import type { ImageRequest, Success } from "../../src/lib/vision/types";

const home = "http://127.0.0.1:3102";
const viewports = [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 414, height: 896 }, { width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1536, height: 864 }, { width: 1920, height: 1080 }, { width: 2560, height: 1440 }];
const field = (page: Page) => page.getByRole("textbox", { name: "消息内容" });
const send = (page: Page) => page.getByRole("button", { name: "发送消息" });
async function visitorFiles(count: number) {
  return Promise.all(Array.from({ length: count }, async (_, n) => ({ name: `visitor-${n}.png`, mimeType: "image/png", buffer: await sharp({ create: { width: 200 + n * 10, height: 140, channels: 4, background: ["#a04455", "#44a055", "#5544a0", "#a09944"][n % 4] } }).png().toBuffer() })));
}
async function choose(page: Page, count = 1) {
  await page.getByLabel("选择图片", { exact: true }).setInputFiles(await visitorFiles(count));
  await expect(page.getByRole("list", { name: "待发送图片" }).getByRole("listitem")).toHaveCount(count);
  await expect(send(page)).toBeEnabled();
}
async function submit(page: Page, text: string) {
  await field(page).fill(text);
  const pending = page.waitForResponse((r) => r.url().endsWith("/api/chat"));
  await send(page).click();
  return pending;
}
async function layout(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const button = await send(page).boundingBox(), height = page.viewportSize()!.height;
  expect(button!.y).toBeGreaterThanOrEqual(0); expect(button!.y + button!.height).toBeLessThanOrEqual(height);
  expect(await page.locator(".chat-messages").evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(0);
}
for (const viewport of viewports) test(`selected-image interpretation and four-work identity at ${viewport.width}`, async ({ page }) => {
  await page.setViewportSize(viewport);
  const errors: string[] = [], requests: ImageRequest[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => { if (request.url().endsWith("/api/chat")) requests.push(request.postDataJSON()); });
  await page.goto(home); await choose(page, 4); await layout(page);
  const response = await submit(page, "[vision:numbered] 请分别识别这四件作品");
  expect(response.status()).toBe(200);
  const result: Success = await response.json();
  expect(result.version).toBe(2); expect(result.message.groups.map((g) => g.identity.status)).toEqual(["identified", "identified", "identified", "identified"]);
  expect(result.message.referenceImages).toEqual([]); expect(result.message.references).toHaveLength(8);
  await expect(page.getByRole("heading", { name: "图片观察与解读", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "图片与档案" })).toContainText("合成作品 4（编号核对）");
  await layout(page);
  if ([390, 1366].includes(viewport.width)) await page.screenshot({ path: `test-results/vision-numbered-${viewport.width}.png` });
  const follow = await submit(page, "[vision:summary] 根据已有观察说明题材");
  expect(follow.status()).toBe(200);
  const summary: Success = await follow.json();
  expect(summary.message.observations).toEqual([]); expect(summary.message.notices).toContain("prior_observations");
  expect(requests[1].inputs).toEqual([]);
  for (const input of requests[0].inputs) expect(JSON.stringify(requests[1])).not.toContain(input.data);
  await expect(page.getByRole("heading", { name: "此前图片观察", exact: true })).toBeVisible();
  const clarification = await submit(page, "[vision:multi-reread] 请重看这四张图的角落文字");
  expect(clarification.status()).toBe(200);
  const targets = page.getByLabel("重新查看的图片");
  await expect(targets.getByRole("link")).toHaveText(["[图片1]", "[图片2]", "[图片3]", "[图片4]"]);
  for (const [n, image] of requests[0].images.entries()) await expect(targets.getByRole("link").nth(n)).toHaveAttribute("href", `#image-${image.id}`);
  await layout(page);
  if ([390, 1366].includes(viewport.width)) await page.screenshot({ path: `test-results/vision-reread-targets-${viewport.width}.png` });
  await page.getByRole("button", { name: "用于本次提问：图片 1", exact: true }).click();
  await choose(page, 2);
  await page.locator('details[aria-label="图片分组"] > summary').click();
  for (const n of [1, 2]) await expect(page.getByRole("button", { name: `选择分组：新图片 ${n}`, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "选择分组：新图片 3", exact: true })).toHaveCount(0);
  for (const name of ["图片 1", "新图片 1"]) await page.getByRole("button", { name: `选择分组：${name}`, exact: true }).click();
  await page.getByRole("button", { name: "标为同一件作品", exact: true }).click();
  await expect(page.getByText("同一作品：图片 1、新图片 1", { exact: true })).toBeVisible();
  await layout(page);
  if ([390, 1366].includes(viewport.width)) await page.screenshot({ path: `test-results/vision-mixed-group-${viewport.width}.png` });
  await page.getByLabel("本次选用的历史图片").getByRole("button", { name: "取消选择：图片 1", exact: true }).click();
  await page.getByRole("button", { name: "用于本次提问：图片 1", exact: true }).click();
  await expect(page.getByText(/^同一作品：/)).toHaveCount(0);
  expect((await submit(page, "[vision:interpret] 分别解读本次所选图片")).status()).toBe(200);
  expect(requests[3].sameWorkSets).toEqual([]);
  expect(errors).toEqual([]);
});
test("ordinary-photo verification uses permitted references and keeps uncertain alternatives as candidates", async ({ page }) => {
  for (const marker of ["ordinary", "uncertain"]) {
    await page.goto(home); await choose(page);
    const response = await submit(page, `[vision:${marker}] 请确认这张照片对应哪件档案作品`);
    expect(response.status()).toBe(200);
    const body: Success = await response.json();
    expect(body.message.groups[0].identity.status).toBe(marker === "ordinary" ? "identified" : "candidates");
    expect(body.message.comparisons).toHaveLength(2); expect(body.message.referenceImages).toHaveLength(2);
    expect(JSON.stringify(body)).not.toContain("storage/v1"); expect(JSON.stringify(body)).not.toContain("reviewedBy");
    await page.getByRole("button", { name: "查看来源" }).click();
    await expect(page.getByRole("region", { name: "本条回答使用的依据" })).toContainText("档案参考图核对");
    expect(await page.getByRole("region", { name: "图片与档案" }).innerText()).not.toMatch(/[0-9a-f]{8}-[0-9a-f-]{27}/);
    await expect(page.locator('img[src^="https://archive.fixture.test"]')).toHaveCount(0);
    await layout(page);
  }
});
test("unresolved identity contradictions remain candidates until an explicit pixel-based correction", async ({ page }) => {
  for (const marker of ["identity-limit", "reference-conflict", "corrected-conflict", "corrected-number-conflict", "corrected-number-consistent"]) {
    await page.goto(home); await choose(page);
    const response = await submit(page, `[vision:${marker}] 请确认这张照片对应哪件作品`);
    expect(response.status()).toBe(200);
    const result: Success = await response.json();
    const identity = result.message.groups[0].identity;
    if (marker === "corrected-conflict" || marker === "corrected-number-consistent") {
      expect(identity.status).toBe("identified");
      expect(result.message.observations[0]).toMatchObject({ pass: "verification", limitations: [{ affectsIdentity: false }] });
      expect(result.message.observations[0].readings.find((r) => r.kind === "accession")?.text).toBe("S-1");
      if (marker === "corrected-number-consistent") expect(identity).toMatchObject({ method: "identifier", referenceKeys: [] });
    } else {
      expect(identity).toMatchObject({ status: "candidates", reasons: expect.arrayContaining(["identity_conflict"]) });
      await expect(page.getByRole("region", { name: "图片与档案" })).toContainText("对应依据存在冲突");
      await expect(page.getByRole("region", { name: "图片与档案" })).not.toContainText("档案对应：");
      if (marker === "corrected-number-conflict") expect(result.message.comparisons[0].assessment).toBe("different_work");
    }
  }
});
test("history selection during real image preparation cannot commit a fifth active picture", async ({ page }) => {
  const requests: ImageRequest[] = [];
  page.on("request", (r) => { if (r.url().endsWith("/api/chat")) requests.push(r.postDataJSON()); });
  await page.goto(home); await choose(page, 2);
  expect((await submit(page, "[vision:interpret] 先看两张图")).status()).toBe(200);
  await page.evaluate(() => {
    const OriginalWorker = window.Worker;
    const queue: (() => void)[] = [];
    let held = true;
    window.Worker = class extends OriginalWorker {
      postMessage(message: unknown, options?: Transferable[] | StructuredSerializeOptions) {
        const send = () => { if (Array.isArray(options)) super.postMessage(message, options); else super.postMessage(message, options); };
        if (held) queue.push(send); else send();
      }
    };
    (window as Window & { releaseReviewWorkers?: () => void }).releaseReviewWorkers = () => { held = false; queue.splice(0).forEach((send) => send()); };
  });
  await field(page).fill("保留草稿");
  await page.getByLabel("选择图片", { exact: true }).setInputFiles(await visitorFiles(3));
  await expect(page.getByText("正在处理图片…", { exact: true })).toBeVisible();
  for (const n of [1, 2]) await page.getByRole("button", { name: `用于本次提问：图片 ${n}`, exact: true }).click();
  await page.evaluate(() => (window as Window & { releaseReviewWorkers?: () => void }).releaseReviewWorkers!());
  await expect(page.getByRole("region", { name: "消息输入" }).getByRole("alert")).toContainText("最多可同时查看 4 张");
  await expect(page.getByRole("list", { name: "待发送图片" })).toHaveCount(0);
  await expect(page.getByLabel("本次选用的历史图片").getByRole("button")).toHaveCount(2);
  await expect(field(page)).toHaveValue("保留草稿");
  expect(requests).toHaveLength(1);
  expect((await submit(page, "[vision:interpret] 仅重看两张历史图")).status()).toBe(200);
  expect(requests[1].inputs).toEqual(requests[0].inputs);
  await layout(page);
});
test("one-click reread captures the source question while preserving later context and a new image draft", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests: ImageRequest[] = [];
  page.on("request", (r) => { if (r.url().endsWith("/api/chat")) requests.push(r.postDataJSON()); });
  await page.goto(home); await choose(page);
  expect((await submit(page, "[vision:interpret] 先解读图片")).status()).toBe(200);
  expect((await submit(page, "[vision:reread] 请读角落的小字")).status()).toBe(200);
  await expect(page.getByRole("button", { name: "重看图片并回答" })).toBeVisible();
  const target = page.getByLabel("重新查看的图片").getByRole("link", { name: "[图片1]" });
  await expect(target).toBeVisible();
  await expect(target).toHaveAttribute("href", `#image-${requests[0].images[0].id}`);
  await target.click();
  await expect(page.locator(`[id="image-${requests[0].images[0].id}"]`)).toBeInViewport();
  expect((await submit(page, "后来的独立问题")).status()).toBe(200);
  await choose(page); await field(page).fill("保留独立的新草稿");
  const pending = page.waitForResponse((r) => r.url().endsWith("/api/chat"));
  await page.getByRole("button", { name: "重看图片并回答" }).evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
  const response = await pending; expect(response.status()).toBe(200);
  const body: Success = await response.json();
  expect(requests).toHaveLength(4); expect(requests[3].intent.kind).toBe("reread");
  expect(requests[3].messages.at(-1)?.text).toBe("[vision:reread] 请读角落的小字");
  expect(JSON.stringify(requests[3])).not.toContain("后来的独立问题"); expect(JSON.stringify(requests[3])).not.toContain("保留独立的新草稿");
  expect(requests[3].inputs).toEqual(requests[0].inputs);
  expect(body.message.observations[0].supersedes).toBe(requests[3].observations[0].id);
  await expect(field(page)).toHaveValue("保留独立的新草稿");
  await expect(page.getByRole("button", { name: "移除图片 1" })).toBeVisible();
  await page.screenshot({ path: "test-results/vision-reread-draft.png" });
});
test("reference failures are explicit and retries recheck current permission metadata", async ({ page }) => {
  await page.goto(home); await choose(page);
  expect((await submit(page, "[vision:reference-failure] 核对参考图")).status()).toBe(503);
  await expect(page.getByText("档案参考图暂不可用，当前无法完成核对。")).toBeVisible();
  await expect(page.getByRole("button", { name: "重试", exact: true })).toHaveCount(0);
  await expect(page.getByRole("listitem", { name: "雪域金澜的回答" })).toHaveCount(0);
  await page.goto(home); await choose(page);
  expect((await submit(page, "[vision:reference-retry] 重查许可")).status()).toBe(502);
  await field(page).fill("重试期间的独立草稿");
  const pending = page.waitForResponse((r) => r.url().endsWith("/api/chat"));
  await page.getByRole("button", { name: "重试", exact: true }).click();
  const response = await pending; expect(response.status()).toBe(200);
  const body: Success = await response.json();
  expect(body.message.groups[0].identity).toMatchObject({ status: "candidates", reasons: expect.arrayContaining(["reference_not_authorized"]) });
  expect(body.message.referenceImages).toEqual([]); expect(body.message.comparisons).toEqual([]);
  await expect(field(page)).toHaveValue("重试期间的独立草稿");
  await expect(page.getByRole("listitem", { name: "用户消息" })).toHaveCount(1);
});
test("explicit grouping and optional controls fit landscape and resized widths", async ({ page }) => {
  await page.goto(home); await choose(page, 3);
  await page.locator('details[aria-label="图片分组"] > summary').click();
  await page.getByRole("button", { name: "选择分组：新图片 1" }).click();
  await page.getByRole("button", { name: "选择分组：新图片 2" }).click();
  await page.getByRole("button", { name: "标为同一件作品", exact: true }).click();
  for (const viewport of [{ width: 360, height: 640 }, { width: 430, height: 800 }, { width: 768, height: 720 }, { width: 844, height: 390 }, { width: 1024, height: 720 }]) { await page.setViewportSize(viewport); await layout(page); }
  const response = await submit(page, "[vision:interpret] 前两张是同一作品的正面和局部");
  expect(response.status()).toBe(200);
  const result: Success = await response.json();
  expect(result.message.groups.map((g) => g.imageIds.length)).toEqual([2, 1]);
  expect(result.message.groups.every((g) => g.identity.status === "not_requested")).toBe(true);
});
test("twenty retained pictures reject a new batch while existing history remains selectable", async ({ page }) => {
  await page.goto(home);
  for (let n = 0; n < 5; n++) { await choose(page, 4); expect((await submit(page, `[vision:interpret] 第 ${n + 1} 组图片`)).status()).toBe(200); }
  await field(page).fill("保留这个草稿");
  await page.getByRole("button", { name: "用于本次提问：图片 1", exact: true }).click();
  await page.getByLabel("选择图片", { exact: true }).setInputFiles({ name: "twenty-one.png", mimeType: "image/png", buffer: await sharp({ create: { width: 10, height: 10, channels: 3, background: "white" } }).png().toBuffer() });
  await expect(page.getByRole("region", { name: "消息输入" }).getByRole("alert")).toContainText("图片上下文已达到本次对话上限");
  await expect(page.getByLabel("本次选用的历史图片")).toContainText("图片 1"); await expect(field(page)).toHaveValue("保留这个草稿");
  await expect(page.getByRole("listitem", { name: "用户消息" })).toHaveCount(5);
});
test("stale valid requests fail before paid work and explicit minimal-text opt-in returns v2", async ({ request }) => {
  const data = { turnId: "q", messages: [{ id: "q", role: "user", text: "[fixture:general] 文字问题" }] };
  const stale = await request.post(`${home}/api/chat`, { data }); expect(stale.status()).toBe(400); expect(await stale.json()).toEqual({ error: { code: "invalid_request" } });
  const current = await request.post(`${home}/api/chat`, { data, headers: { "X-Chat-Protocol": "2" } }); expect(current.status()).toBe(200); expect((await current.json()).version).toBe(2);
});

test("empty archive named lookups recover skipped/overfiltered plans and remain distinct from unsearched images", async ({ page }) => {
  for (const marker of ["empty-named", "empty-overfiltered", "empty-no-clue"]) {
    await page.goto(home); await choose(page);
    const named = marker !== "empty-no-clue";
    const result = await submit(page, `[vision:${marker}] ${named ? "这张图对应作品《空库合成作品17》吗？" : "请识别这件作品，没有可读编号。"}`);
    expect(result.status()).toBe(200);
    const body: Success = await result.json();
    expect(body.message.references).toEqual([]);
    expect(body.message.referenceImages).toEqual([]);
    expect(body.message.comparisons).toEqual([]);
    expect(body.message.notices).toContain(named ? "no_matches" : "no_retrieval");
    expect(body.message.notices).not.toContain(named ? "no_retrieval" : "no_matches");
    expect(body.message.groups[0].identity.status).toBe(marker === "empty-overfiltered" ? "no_match" : "insufficient_evidence");
    await expect(page.getByText(named ? "数据库未找到匹配记录，以下内容不代表数据库结论。" : "本次未检索数据库。", { exact: true })).toBeVisible();
    await layout(page);
  }
});

test("malformed/overlong planner output and duplicate picture markers or notices never publish an answer", async ({ page }) => {
  for (const marker of ["bad-shape", "long-observation", "duplicate-marker", "duplicate-notice"]) {
    await page.goto(home); await choose(page);
    const result = await submit(page, `[vision:${marker}] 解读所选图片`);
    expect(result.status()).toBe(502);
    expect(await result.json()).toEqual({ error: { code: "invalid_model_output" } });
    await expect(page.getByRole("listitem", { name: "雪域金澜的回答" })).toHaveCount(0);
    await expect(page.getByRole("listitem", { name: "用户消息" })).toHaveCount(1);
    await expect(page.getByRole("img", { name: "图片 1", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "编辑问题", exact: true })).toBeVisible();
  }
});
