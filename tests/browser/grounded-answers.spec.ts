import { expect, test } from "@playwright/test";
const home = "http://127.0.0.1:3102";
const viewports = [{width:360,height:800},{width:390,height:844},{width:414,height:896},{width:1280,height:720},{width:1366,height:768},{width:1536,height:864},{width:1920,height:1080},{width:2560,height:1440}];
for (const viewport of viewports) test(`real orchestration and evidence layout at ${viewport.width}`, async ({ page }) => {
  await page.setViewportSize(viewport);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(home);
  const field = page.getByRole("textbox", { name: "消息内容" });
  await field.fill("[fixture:answer] 介绍测试画师");
  const response = page.waitForResponse((r) => r.url().endsWith("/api/chat"));
  await page.getByRole("button", {name:"发送消息"}).click();
  expect((await response).status()).toBe(200);
  await expect(page.getByRole("heading", {name:"数据库依据",exact:true})).toBeVisible();
  await expect(page.getByRole("heading", {name:"通用知识补充",exact:true})).toHaveCount(1);
  const general = page.getByRole("region", {name:"通用知识补充",exact:true});
  await expect(general.locator("p")).toHaveCount(2);
  await expect(general.getByText("唐卡艺术可从题材、构图与设色等方面欣赏。", {exact:true})).toBeVisible();
  await expect(general.getByText("同一题材可以采用不同风格，观察时可分别比较。", {exact:true})).toBeVisible();
  await page.getByRole("button", {name:"查看来源"}).click();
  await expect(page.getByRole("region", {name:"本条回答使用的依据"})).toContainText("测试画师 · 生平");
  await expect(page.getByText("部分依据仅为数据库记录，尚无对应字段的外部来源确认。")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const send = await page.getByRole("button", {name:"发送消息"}).boundingBox();
  expect(send!.y + send!.height).toBeLessThan(viewport.height);
  await field.fill("下一条草稿");
  const seen = page.waitForRequest((r) => r.url().endsWith("/api/chat"));
  await page.getByRole("button", {name:"发送消息"}).click();
  const body = (await seen).postDataJSON();
  expect(body.messages.map((m: {role:string}) => m.role)).toEqual(["user","assistant","user"]);
  expect(body.messages[1].text).toContain("记录索引：");
  expect(body.messages[1]).not.toHaveProperty("references");
  await expect(page.getByRole("listitem", {name:"雪域金澜的回答"})).toHaveCount(2);
  if ([390,1366].includes(viewport.width)) await page.screenshot({path:`test-results/grounded-${viewport.width}.png`});
  expect(errors).toEqual([]);
});
test("real clarification/no-match and known provider failures stay distinct", async ({ page }) => {
  for (const [marker, expected, retry] of [
    ["clarify","你想了解哪位画师或哪件作品？",false],
    ["empty","数据库未找到匹配记录，以下内容不代表数据库结论。",false],
    ["busy","发送失败，请重试。",true],
    ["credit","AI 服务暂时不可用，请稍后再试。",false],
    ["invalid","AI 回答未通过校验，本次未展示。请调整问题后重新发送。",false],
    ["image","图片理解服务暂不可用，请稍后重新提问。",false],
  ] as const) {
    await page.goto(home);
    await page.getByRole("textbox",{name:"消息内容"}).fill(`[fixture:${marker}] 测试问题`);
    await page.getByRole("button",{name:"发送消息"}).click();
    await expect(page.getByText(expected,{exact:true})).toBeVisible();
    await expect(page.getByRole("button",{name:"重试",exact:true})).toHaveCount(retry ? 1 : 0);
    if (retry) {
      await page.getByRole("button",{name:"重试",exact:true}).click();
      await expect(page.getByText(expected,{exact:true})).toBeVisible();
      await expect(page.getByRole("listitem",{name:"用户消息"})).toHaveCount(1);
    }
  }
});
test("corrective editing is explicit, creates a fresh question and protects next drafts", async ({ page }) => {
  await page.goto(home);
  const field = page.getByRole("textbox",{name:"消息内容"});
  await field.fill("[fixture:image] 比较历史图片");
  await page.getByRole("button",{name:"发送消息"}).click();
  await expect(page.getByRole("button",{name:"编辑问题"})).toBeVisible();
  await field.fill("保留的新草稿");
  await expect(page.getByRole("button",{name:"编辑问题"})).toHaveCount(0);
  await field.fill("");
  await page.getByRole("button",{name:"编辑问题"}).click();
  await expect(field).toHaveValue("[fixture:image] 比较历史图片");
  await expect(field).toBeFocused();
  await expect(page.getByRole("listitem",{name:"用户消息"})).toHaveCount(0);
  await field.fill("[fixture:general] 文字交流");
  await page.getByRole("button",{name:"发送消息"}).click();
  await expect(page.getByRole("heading",{name:"通用知识补充",exact:true})).toBeVisible();
});
test("pending generation preserves input and reload discards the old attempt", async ({ page }) => {
  await page.goto(home);
  const field = page.getByRole("textbox",{name:"消息内容"});
  await field.fill("[fixture:slow] 慢速测试");
  await page.getByRole("button",{name:"发送消息"}).click();
  await expect(page.getByRole("status")).toHaveText("正在处理…");
  await field.fill("保留草稿");
  await expect(page.getByRole("button",{name:"发送消息"})).toBeDisabled();
  await page.reload();
  await expect(field).toHaveValue("");
  await expect(page.getByRole("heading",{name:"一起探索唐卡艺术"})).toBeVisible();
});
