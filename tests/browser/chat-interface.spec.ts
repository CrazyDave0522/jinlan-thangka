import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 360, height: 800 }, { width: 390, height: 844 }, { width: 414, height: 896 },
  { width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1536, height: 864 },
  { width: 1920, height: 1080 }, { width: 2560, height: 1440 },
];

async function verifyLayout(page: Page) {
  const metrics = await page.evaluate(() => {
    const field = document.querySelector('[aria-label="消息内容"]')!.getBoundingClientRect();
    const composer = document.querySelector('[aria-label="消息输入"]')!.getBoundingClientRect();
    const messages = document.querySelector('[aria-label="对话内容"]')!.getBoundingClientRect();
    const footer = document.querySelector("footer")!.getBoundingClientRect();
    return { overflow: document.documentElement.scrollWidth > innerWidth, composerVisible: field.top >= 0 && composer.bottom <= innerHeight && footer.bottom >= innerHeight - 1, overlap: messages.bottom > composer.top + 1 || composer.bottom > footer.top + 1, footerVisible: footer.bottom <= innerHeight + 1 };
  });
  expect(metrics).toEqual({ overflow: false, composerVisible: true, overlap: false, footerVisible: true });
  if (page.viewportSize()!.width < 640) {
    const footerAlignment = await page.getByRole("contentinfo").evaluate((footer) => {
      const bounds = footer.getBoundingClientRect();
      return Array.from(footer.querySelectorAll("p")).map((paragraph) => {
        const textBounds = paragraph.getBoundingClientRect();
        return {
          centerOffset: Math.abs(textBounds.x + textBounds.width / 2 - (bounds.x + bounds.width / 2)),
          textAlign: getComputedStyle(paragraph).textAlign,
        };
      });
    });
    for (const paragraph of footerAlignment) {
      expect(paragraph.centerOffset).toBeLessThan(1);
      expect(paragraph.textAlign).toBe("center");
    }
  }
}

for (const viewport of viewports) {
  test(`home and long conversation at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("http://127.0.0.1:3100");
    await expect(page.getByRole("heading", { name: "一起探索唐卡艺术" })).toBeVisible();
    await expect(page).toHaveTitle("雪域金澜 · 唐卡 AI 对话演示");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByRole("list", { name: "对话消息" })).toHaveCount(0);
    const area = await page.getByRole("region", { name: "对话内容" }).boundingBox();
    const welcomeHeading = await page.getByRole("heading", { name: "一起探索唐卡艺术" }).boundingBox();
    const welcomeText = await page.getByText("你可以询问唐卡的题材、尊像与艺术风格，也可以上传图片进行交流。").boundingBox();
    expect(Math.abs(welcomeHeading!.x + welcomeHeading!.width / 2 - (area!.x + area!.width / 2))).toBeLessThan(2);
    expect(Math.abs((welcomeHeading!.y + welcomeText!.y + welcomeText!.height) / 2 - (area!.y + area!.height / 2))).toBeLessThan(2);
    await expect(page.getByRole("img")).toHaveCount(1);
    await expect.poll(() => page.getByRole("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(page.getByRole("button", { name: "发送消息" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "上传图片" })).toBeEnabled();
    const field = page.getByRole("textbox", { name: "消息内容" });
    await page.keyboard.press("Tab");
    const conversationRegion = page.getByRole("region", { name: "对话内容" });
    await expect(conversationRegion).toBeFocused();
    expect(await conversationRegion.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("solid");
    await page.keyboard.press("Tab");
    await expect(field).toBeFocused();
    expect(await field.evaluate((element) => getComputedStyle(element.parentElement!).boxShadow)).not.toBe("none");
    await field.fill("草稿");
    await field.press("End");
    await field.press("Shift+Enter");
    await expect(field).toHaveValue("草稿\n");
    await field.press("Tab");
    await verifyLayout(page);
    await page.reload();
    await expect(field).toHaveValue("");
    await page.screenshot({ path: `test-results/home-${viewport.width}.png` });
    expect(errors).toEqual([]);

    await page.goto("http://127.0.0.1:3101/?mode=long");
    await expect(page.getByRole("listitem")).toHaveCount(40);
    await verifyLayout(page);
    const region = page.getByRole("region", { name: "对话内容" });
    const before = await page.getByRole("textbox", { name: "消息内容" }).boundingBox();
    const scrolled = await region.evaluate((element) => { element.scrollTop = element.scrollHeight; return element.scrollTop; });
    expect(scrolled).toBeGreaterThan(0);
    expect(await page.getByRole("textbox", { name: "消息内容" }).boundingBox()).toEqual(before);
    const bounds = await region.boundingBox();
    const last = await page.getByRole("listitem").last().boundingBox();
    expect(last!.y + last!.height).toBeLessThanOrEqual(bounds!.y + bounds!.height + 1);
    await verifyLayout(page);
    expect(errors).toEqual([]);
  });
}

test("components resize through intermediate widths and reduced height", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/?mode=populated");
  for (const width of [375, 384, 393, 412, 430, 638, 639, 640, 641, 768, 1024, 1440, 1707]) {
    await page.setViewportSize({ width, height: 900 });
    await verifyLayout(page);
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await verifyLayout(page);
  await expect(page.getByRole("button", { name: "查看来源" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "复制回答" })).toBeEnabled();
  await page.setViewportSize({ width: 1486, height: 1060 });
  await page.screenshot({ path: "test-results/populated-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/populated-mobile.png" });
});

test("failed image preserves its question", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/?mode=broken");
  await expect(page.getByRole("status")).toContainText("图片暂时无法显示");
  await expect(page.getByText("图片失败后仍保留的问题")).toBeVisible();
});

test("shared spacing and typography tokens control conversation chrome", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3101/");
  await expect(page.getByRole("heading", { name: "一起探索唐卡艺术" })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--spacing", "5px");
    document.documentElement.style.setProperty("--text-xs", "14px");
  });
  const sizes = await page.evaluate(() => {
    const welcome = getComputedStyle(document.querySelector(".chat-welcome")!);
    const composer = getComputedStyle(document.querySelector(".chat-composer")!);
    const footer = getComputedStyle(document.querySelector("footer")!);
    return {
      welcomePadding: [welcome.paddingTop, welcome.paddingLeft],
      composerPadding: [composer.paddingTop, composer.paddingLeft, composer.paddingBottom],
      footerPadding: [footer.paddingTop, footer.paddingLeft],
      footerGap: [footer.rowGap, footer.columnGap],
      footerType: [footer.fontSize, footer.lineHeight],
    };
  });
  expect(sizes).toEqual({
    welcomePadding: ["40px", "30px"],
    composerPadding: ["15px", "30px", "10px"],
    footerPadding: ["15px", "60px"],
    footerGap: ["5px", "30px"],
    footerType: ["14px", "25px"],
  });
  await verifyLayout(page);
});
