import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import sharp from "sharp";
import type { ImageRequest, Success } from "../../src/lib/vision/types";
import { home, coreViewports, field, send, choose, submit, layout } from "./helpers/conversation";

for (const viewport of coreViewports) test(`empty-archive release journey at ${viewport.width}`, async ({ page, context }) => {
  await page.setViewportSize(viewport);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: home });
  const id = randomUUID();
  await page.setExtraHTTPHeaders({ "x-jinlan-test-case": id });
  const counts = async () => JSON.parse(await readFile(`test-results/source-audit/${id}.json`, "utf8"));
  const requests: ImageRequest[] = [], errors: string[] = [];
  page.on("request", (r) => { if (r.url().endsWith("/api/chat")) requests.push(r.postDataJSON()); });
  page.on("pageerror", (error) => errors.push(error.message));
  const answers = page.getByRole("listitem", { name: "雪域金澜的回答" });
  async function ask(question: string) {
    const response = await submit(page, question);
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe("no-store");
    const body: Success = await response.json();
    expect(body.message.references).toEqual([]);
    expect(body.message.referenceImages).toEqual([]);
    expect(body.message.comparisons).toEqual([]);
    await expect(answers).toHaveCount(requests.length);
    await layout(page);
    return body;
  }

  await page.goto(home);
  await ask("[fixture:empty] 请介绍无匹配的测试画师");
  await expect(answers.first()).toContainText("数据库未找到匹配记录");
  await expect(answers.first().getByRole("button", { name: "查看来源" })).toHaveCount(0);

  await choose(page, 4);
  const pictures = await ask("[vision:interpret] 请分别解读这四张图片");
  const imageRequest = requests[1];
  expect(imageRequest.inputs).toHaveLength(4);
  expect(pictures.message.observations.map((o) => o.imageId)).toEqual(imageRequest.inputs.map((i) => i.imageId));
  expect(pictures.message.groups.map((g) => g.identity.status)).toEqual(Array(4).fill("not_requested"));
  expect(imageRequest.messages[1].text).toContain("数据库未找到匹配记录");
  await expect(answers.nth(1).getByRole("heading", { name: "图片观察与解读", exact: true })).toBeVisible();

  const summary = await ask("[vision:summary] 根据已有观察总结这四张图片");
  expect(summary.message.observations).toEqual([]);
  expect(summary.message.notices).toContain("prior_observations");
  expect(requests[2].inputs).toEqual([]);
  expect(requests[2].observations.map((o) => o.id)).toEqual(pictures.message.observations.map((o) => o.id));
  for (const input of imageRequest.inputs) expect(JSON.stringify(requests[2])).not.toContain(input.data);
  await expect(answers.nth(2).getByRole("heading", { name: "此前图片观察", exact: true })).toBeVisible();

  const question = "[vision:reread] 请读第一张图角落的小字";
  const clarification = await ask(question);
  expect(clarification.message.kind).toBe("clarification");
  expect(clarification.message.reread?.imageIds).toEqual([imageRequest.images[0].id]);
  expect(requests[3].inputs).toEqual([]);
  const target = answers.nth(3).getByLabel("重新查看的图片").getByRole("link", { name: "[图片1]" });
  await expect(target).toHaveAttribute("href", `#image-${imageRequest.images[0].id}`);
  await target.click();
  await expect(page.locator(`[id="image-${imageRequest.images[0].id}"]`)).toBeInViewport();
  expect(await counts()).toMatchObject({ chat: 4, model: 7, storage: 0 });

  const draft = "重读期间保留的独立文字和图片草稿";
  await page.getByLabel("选择图片", { exact: true }).setInputFiles({
    name: "independent-draft.png", mimeType: "image/png",
    buffer: await sharp({ create: { width: 320, height: 180, channels: 3, background: "#5588bb" } }).png().toBuffer(),
  });
  const draftImages = page.getByRole("list", { name: "待发送图片" });
  await expect(draftImages.getByRole("listitem")).toHaveCount(1);
  await expect(send(page)).toBeEnabled();
  await field(page).fill(draft);
  const draftUrl = await draftImages.getByRole("img").getAttribute("src");
  const pending = page.waitForResponse((r) => r.url().endsWith("/api/chat"));
  await answers.nth(3).getByRole("button", { name: "重看图片并回答" }).click();
  const response = await pending;
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  const reread: Success = await response.json();
  expect(reread.message.references).toEqual([]);
  expect(reread.message.referenceImages).toEqual([]);
  expect(reread.message.comparisons).toEqual([]);
  await expect(answers).toHaveCount(5);
  expect(requests).toHaveLength(5);
  expect(requests[4].intent).toMatchObject({ kind: "reread", sourceTurnId: requests[3].turnId });
  expect(requests[4].messages.at(-1)?.text).toBe(question);
  expect(requests[4].inputs).toEqual([imageRequest.inputs[0]]);
  expect(requests[4].images.map((i) => i.id)).toEqual(imageRequest.images.map((i) => i.id));
  expect(JSON.stringify(requests[4])).not.toContain(draft);
  expect(reread.message.observations).toHaveLength(1);
  expect(reread.message.observations[0]).toMatchObject({ imageId: imageRequest.images[0].id, supersedes: pictures.message.observations[0].id });
  await expect(field(page)).toHaveValue(draft);
  await expect(draftImages.getByRole("img")).toHaveAttribute("src", draftUrl!);
  await layout(page);

  const beforeCopy = await counts();
  expect(beforeCopy).toMatchObject({ chat: 5, model: 9, storage: 0 });
  expect(beforeCopy.archive).toBeGreaterThan(0);
  await answers.last().getByRole("button", { name: "复制回答" }).click();
  await expect(answers.last().getByRole("status", { name: "复制状态" })).toHaveText("已复制");
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("[图片 1]");
  expect(text).toContain(reread.message.blocks[0].text);
  expect(text).not.toContain(draft);
  await expect(field(page)).toHaveValue(draft);
  await field(page).focus();
  await expect(field(page)).toBeFocused();
  if ([390, 1366].includes(viewport.width)) {
    await page.screenshot({ path: `test-results/release-journey-${viewport.width}.png` });
    for (const size of [{ width: 768, height: 720 }, { width: 844, height: 390 }, { width: 360, height: 640 }]) {
      await page.setViewportSize(size);
      await layout(page);
      await expect(field(page)).toHaveValue(draft);
    }
  }
  await page.reload();
  await expect(page.getByRole("heading", { name: "一起探索唐卡艺术" })).toBeVisible();
  await expect(answers).toHaveCount(0);
  await expect(page.getByRole("listitem", { name: "用户消息" })).toHaveCount(0);
  await expect(field(page)).toHaveValue("");
  await expect(draftImages).toHaveCount(0);
  await expect(page.getByLabel("本次选用的历史图片")).toHaveCount(0);
  await layout(page);
  expect(await counts()).toEqual(beforeCopy);
  expect(requests).toHaveLength(5);
  expect(errors).toEqual([]);
});
