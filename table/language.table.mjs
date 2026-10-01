// The two languages of the page, which are not the languages of the tiles: the chooser in the
// header, the address, and what a device remembers.
import { expect, test } from "@playwright/test";

import { PLAYING, SMALL, open, sound, state, tap } from "./table.mjs";

test("the chooser turns the page and the table's words to Japanese, and the tiles stay as they were", async ({ page }) => {
  const errors = await open(page);
  let s = await state(page);
  expect(s.lang).toBe("en");
  expect(s.unreviewed).toBe(false);
  await tap(page, '[data-lang="ja"]');
  s = await sound(page, errors);
  expect(s.lang).toBe("ja");
  expect(s.unreviewed).toBe(true);
  expect(s.pitch).toContain("クロスワード");
  expect(s.status).toMatch(/^袋の残り2枚 · 0:\d\d$/);
  expect(s.controls).toEqual(["1枚引く (off)", "1枚を3枚と交換 (off)", "並べ替え", "すべて手札に戻す", "新しいゲーム"]);
  expect(s.keep).toEqual(["JSONで保存", "テキストで保存", "ゲームを読み込む"]);
  expect(s.hand).toEqual(["n", "w", "o"]);
  expect(s.japanese).toBe(false);
  await tap(page, '[data-lang="en"]');
  s = await sound(page, errors);
  expect(s.lang).toBe("en");
  expect(s.unreviewed).toBe(false);
  expect(s.controls[2]).toBe("Sort");
});

test("the address asks for a language, and a device remembers the one chosen", async ({ page }) => {
  const errors = await open(page, SMALL.replace("lang=en", "lang=ja"));
  let s = await sound(page, errors);
  expect(s.lang).toBe("ja");
  expect(s.controls[2]).toBe("並べ替え");

  const bare = SMALL.replace("&lang=en", "");
  await page.goto(`http://kumimoji.test/${bare}`);
  await expect(page.locator(PLAYING)).toBeVisible();
  await tap(page, '[data-lang="ja"]');
  await page.goto(`http://kumimoji.test/${bare}`);
  await expect(page.locator('#table [data-testid="km-sort"]')).toHaveText("並べ替え");
  s = await sound(page, errors);
  expect(s.lang).toBe("ja");
  await tap(page, '[data-lang="en"]');
  await page.goto(`http://kumimoji.test/${bare}`);
  await expect(page.locator('#table [data-testid="km-sort"]')).toHaveText("Sort");
});

test("a first visit follows the browser's language, in its words and in its tiles", async ({ browser }) => {
  const context = await browser.newContext({ locale: "ja-JP", viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = await open(page, "");
  const s = await sound(page, errors);
  expect(s.lang).toBe("ja");
  expect(s.japanese).toBe(true);
  expect(s.hand.join("")).toMatch(/^[ぁ-ん*]{7}$/);
  expect(s.pressed).toContain("language=japanese");
  await context.close();
});
