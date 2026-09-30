// A game kept: saved as JSON and as text, a saved game loaded back, a file that is not a game
// refused, and a game left half way found again on return.
import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import "../dist/words.js";
import { deal, generateKumimoji, kumimojiToJSON, loadTileWords } from "../dist/index.js";
import { PLAYING, lay, open, sound, state, tap } from "./table.mjs";

/** Tap a button that saves a file, and hand back the file's text. */
async function saved(page, selector) {
  const [download] = await Promise.all([page.waitForEvent("download"), tap(page, selector)]);
  return { name: download.suggestedFilename(), text: readFileSync(await download.path(), "utf8") };
}

test("a game saves as JSON and as text", async ({ page }) => {
  const errors = await open(page);
  await lay(page, 0, 0, 0);
  await lay(page, 1, 0, 1);
  await lay(page, 0, 0, 2);
  await tap(page, '[data-testid="km-keep"] summary');
  await sound(page, errors);
  const json = await saved(page, '[data-testid="km-save-json"]');
  expect(json.name).toBe("kumimoji-44.json");
  const data = JSON.parse(json.text);
  expect({ ...data, elapsedMs: 0, generator: "" }).toEqual({ format: 1, game: "kumimoji", generator: "", size: 3, level: "hard", seed: 44, language: "english", gameLength: "short", doubleSet: false, diagonals: false, progress: "3:::now", elapsedMs: 0 });
  const text = await saved(page, '[data-testid="km-save-text"]');
  expect(text.name).toBe("kumimoji-44.txt");
  expect(text.text).toMatch(/^Kumimoji: English, a hand of 3, seed 44\nN O W\nHand: empty\nIn the bag: 2\nTime: 0:\d\d\n$/);
  // In Japanese the text is Japanese.
  await tap(page, '[data-lang="ja"]');
  expect((await saved(page, '[data-testid="km-save-text"]')).text).toMatch(/^組み文字: 英語、手札3枚、シード 44\nN O W\n手札: なし\n袋の残り: 2枚\n時間: 0:\d\d\n$/);
});

test("a saved game loads back, and a file that is not a game is refused", async ({ page }) => {
  const errors = await open(page);
  await lay(page, 0, 0, 0);
  await tap(page, '[data-testid="km-keep"] summary');
  const json = await saved(page, '[data-testid="km-save-json"]');
  const before = await state(page);

  // Play on, then go back to the saved game.
  await lay(page, 0, 0, 1);
  expect(Object.keys((await state(page)).table).length).toBe(2);
  await page.locator('[data-testid="km-file"]').setInputFiles({ name: "kumimoji-44.json", mimeType: "application/json", buffer: Buffer.from(json.text) });
  await expect(page.locator('[data-testid="km-note"]')).toHaveText("Game loaded.");
  let s = await sound(page, errors);
  expect(s.table).toEqual(before.table);
  expect(s.hand).toEqual(before.hand);

  // A tile this bag never dealt, a later format, and a file of something else.
  const data = JSON.parse(json.text);
  for (const text of [JSON.stringify({ ...data, progress: "3::wo:q" }), JSON.stringify({ ...data, format: 2 }), "not a game", "{}"]) {
    await page.locator('[data-testid="km-file"]').setInputFiles({ name: "other.json", mimeType: "application/json", buffer: Buffer.from(text) });
    await expect(page.locator('[data-testid="km-note"]')).toHaveText("That file is not a game of Kumimoji these rules can open.");
  }
  s = await sound(page, errors);
  expect(s.table).toEqual(before.table);

  // A game in the other language loads with its own tiles.
  await loadTileWords("japanese");
  const dealt = generateKumimoji(7, "medium", 2026, { language: "japanese" });
  const kana = kumimojiToJSON({ deal: dealt, play: deal(dealt.givens, 7), elapsedMs: 0 });
  await page.locator('[data-testid="km-file"]').setInputFiles({ name: "kana.json", mimeType: "application/json", buffer: Buffer.from(kana) });
  await expect(page.locator(`${PLAYING}.km-japanese`)).toBeVisible();
  s = await sound(page, errors);
  expect(s.table).toEqual({});
  expect(s.hand.join("")).toBe("よきめたんえら");
});

test("a game left half way is on the table again on return", async ({ page }) => {
  const errors = await open(page, "?lang=en");
  const first = (await state(page)).hand.findIndex((tile) => tile !== "*");
  await lay(page, first, 0, 0);
  const left = await state(page);
  expect(Object.keys(left.table).length).toBe(1);
  await page.goto("http://kumimoji.test/?lang=en");
  await expect(page.locator(PLAYING)).toBeVisible();
  await expect(page.locator(".km-board .km-tile")).toHaveCount(1);
  const back = await sound(page, errors);
  expect(back.table).toEqual(left.table);
  expect(back.hand).toEqual(left.hand);
  expect(back.seed).toBe(left.seed);
});
