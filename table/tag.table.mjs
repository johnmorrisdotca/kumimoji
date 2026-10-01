// What the demo offers beside the table: a table in a tag, today's game, and a link that deals the same game.
import { expect, test } from "@playwright/test";

import { kumimojiDailySeed } from "../dist/index.js";
import { ROOT, open, sound, tap } from "./table.mjs";

const TAG = '[data-testid="tag"] [data-testid="km-root"]';

test("the table in a tag is on the page, dealt from its seed, and speaks the page's language", async ({ page }) => {
  const errors = await open(page);
  const tag = page.locator(TAG);
  await expect(tag).toHaveAttribute("data-state", "playing");
  await expect(tag).toHaveAttribute("data-seed", "44");
  await expect(tag.locator("[data-hand]")).toHaveCount(3);
  await expect(page.locator('[data-testid="tag"] [data-testid="km-keep"]')).toHaveCount(0);
  await expect(tag.locator('[data-testid="km-status"]')).toContainText("tiles left in the bag");
  await tap(page, '[data-lang="ja"]');
  await expect(tag.locator('[data-testid="km-status"]')).toContainText("袋の残り");
  await tap(page, '[data-lang="en"]');
  await expect(tag.locator('[data-testid="km-status"]')).toContainText("tiles left in the bag");
  await sound(page, errors);
});

test("a page opened in Japanese has its tag in Japanese from the start", async ({ page }) => {
  const errors = await open(page, "?seed=44&hand=3&level=hard&words=english&lang=ja");
  await expect(page.locator(`${TAG} [data-testid="km-status"]`)).toContainText("袋の残り");
  await sound(page, errors);
});

test("Today's game deals the day's seed, whatever the set-up", async ({ page }) => {
  const errors = await open(page);
  await tap(page, '[data-set="hand=11"]');
  await tap(page, "#daily");
  await expect(page.locator(`${ROOT}[data-seed="${kumimojiDailySeed(new Date())}"]`)).toBeVisible();
  await expect(page.locator("#table [data-hand]")).toHaveCount(11);
  await sound(page, errors);
});

test("Copy link copies a link that deals the same game, and the address is read back", async ({ page }) => {
  // The page is served over http, where a browser keeps no clipboard; this one is a stand-in that remembers what was written.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text) => void (window.__copied = text) } });
  });
  const errors = await open(page, "?seed=2026&hand=11&level=easy&words=japanese&diagonals=1&length=medium&lang=en");
  await expect(page.locator("#table [data-hand]")).toHaveCount(11);
  await expect(page.locator(`${ROOT}.km-japanese`)).toBeVisible();
  await tap(page, "#share");
  await expect(page.locator("#share")).toHaveText("Copied");
  const copied = new URL(await page.evaluate(() => window.__copied));
  expect(copied.origin).toBe("http://kumimoji.test");
  expect(Object.fromEntries(copied.searchParams)).toEqual({ seed: "2026", words: "japanese", hand: "11", level: "easy", length: "medium", lang: "en", diagonals: "1" });
  await expect(page.locator("#share")).toHaveText("Copy link");
  await sound(page, errors);
});

test("Copy link says so when the browser will not let it", async ({ page }) => {
  const errors = await open(page);
  await tap(page, "#share");
  await expect(page.locator("#share")).toHaveText("Could not copy");
  await sound(page, errors);
});

test("the tag's attributes are read again when they change, and its moves are events", async ({ page }) => {
  const errors = await open(page);
  const tag = page.locator('[data-testid="tag"]');
  await page.evaluate(() => {
    window.__changes = 0;
    window.__finished = 0;
    document.getElementById("tag").addEventListener("kumimoji-change", () => (window.__changes += 1));
    document.getElementById("tag").addEventListener("kumimoji-finish", () => (window.__finished += 1));
  });
  await tag.evaluate((el) => {
    el.setAttribute("language", "japanese");
    el.setAttribute("hand", "7");
    el.setAttribute("seed", "2026");
  });
  await expect(tag.locator('[data-testid="km-root"].km-japanese[data-state="playing"]')).toBeVisible();
  await expect(tag.locator("[data-hand]")).toHaveCount(7);
  expect(await tag.evaluate((el) => el.saved.deal.seed)).toBe(2026);
  await expect.poll(() => page.evaluate(() => window.__changes)).toBeGreaterThan(0);
  // The smallest game, finished from the tag: a finish is an event.
  await tag.evaluate((el) => {
    el.setAttribute("language", "english");
    el.setAttribute("hand", "3");
    el.setAttribute("level", "hard");
    el.setAttribute("seed", "44");
  });
  await expect(tag.locator('[data-testid="km-root"][data-seed="44"][data-state="playing"]')).toBeVisible();
  const place = async (handAt, square) => {
    await tag.locator(`[data-hand="${handAt}"]`).click();
    await tag.locator(`[data-square="${square}"]`).click();
  };
  await place(0, "0,0");
  await place(0, "0,2");
  await place(0, "0,1");
  await tag.locator('[data-testid="km-draw"]').click();
  await place(0, "0,-1");
  await tag.locator('[data-testid="km-draw"]').click();
  await place(0, "0,3");
  await expect(tag.locator('[data-testid="km-root"]')).toHaveAttribute("data-state", "finished");
  expect(await page.evaluate(() => window.__finished)).toBe(1);
  // A daily seed, and then a table the rules do not offer, which draws nothing.
  await tag.evaluate((el) => el.setAttribute("seed", "daily"));
  await expect(tag.locator(`[data-testid="km-root"][data-seed="${kumimojiDailySeed(new Date())}"]`)).toBeVisible();
  await tag.evaluate((el) => el.setAttribute("hand", "5"));
  await expect(tag.locator('[data-testid="km-root"]')).toHaveCount(0);
  expect(await tag.evaluate((el) => el.saved)).toBeNull();
  await sound(page, errors);
});
