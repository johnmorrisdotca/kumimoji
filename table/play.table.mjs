// A game played by taps: laying, the words judged, drawing, moving and lifting, trading, a wild, and the end.
import { expect, test } from "@playwright/test";

import "../dist/words.js";
import { generateKumimoji, loadTileWords } from "../dist/index.js";
import { PLAYING, ROOT, lay, open, sound, state, tap } from "./table.mjs";

test("the table comes up with a hand dealt from the seed", async ({ page }) => {
  const errors = await open(page);
  const s = await sound(page, errors);
  expect(s.seed).toBe("44");
  expect(s.hand).toEqual(["n", "w", "o"]);
  expect(s.table).toEqual({});
  expect(s.squares).toBe(49);
  expect(s.status).toMatch(/^2 tiles left in the bag · 0:0\d$/);
  expect(s.controls).toEqual(["Draw (off)", "Trade for three (off)", "Sort", "Lift all", "New game"]);
});

test("a whole game by taps: NOW, then SNOW, then SNOWY", async ({ page }) => {
  const errors = await open(page);
  await lay(page, 0, 0, 0);
  let s = await sound(page, errors);
  expect(s.table).toEqual({ "0,0": "n" });
  expect(s.hand).toEqual(["w", "o"]);
  // N beside W is not a word, and the table says so.
  await lay(page, 0, 0, 1);
  s = await sound(page, errors);
  expect(s.notes).toBe("Not words: nw");
  expect(s.wrong.sort()).toEqual(["0,0", "0,1"]);
  expect(s.controls[0]).toBe("Draw (off)");
  // Move the W along, and lay the O between.
  await tap(page, `${ROOT} [data-square="0,1"]`);
  await tap(page, `${ROOT} [data-square="0,2"]`);
  await lay(page, 0, 0, 1);
  s = await sound(page, errors);
  expect(s.table).toEqual({ "0,0": "n", "0,1": "o", "0,2": "w" });
  expect(s.notes).toBe("");
  expect(s.handWords).toBe("No tiles in hand");
  expect(s.controls[0]).toBe("Draw");

  await tap(page, '[data-testid="km-draw"]');
  s = await sound(page, errors);
  expect(s.hand).toEqual(["s"]);
  expect(s.left).toBe(1);
  await lay(page, 0, 0, -1);
  await tap(page, '[data-testid="km-draw"]');
  s = await state(page);
  expect(s.hand).toEqual(["y"]);
  expect(s.status).toMatch(/^0 tiles left in the bag/);
  await lay(page, 0, 0, 3);
  await expect(page.locator(ROOT)).toHaveAttribute("data-state", "finished");
  s = await sound(page, errors);
  expect(s.table).toEqual({ "0,-1": "s", "0,0": "n", "0,1": "o", "0,2": "w", "0,3": "y" });
  expect(s.status).toMatch(/^Finished in 0:\d\d\. Every tile laid, every run a word\.$/);
  expect(s.controls).toEqual(["New game"]);
  await tap(page, '[data-testid="km-new"]');
  await expect(page.locator(PLAYING)).toBeVisible();
  expect((await state(page)).hand.length).toBe(3);
});

test("a tile is taken back by tapping it twice, and all of them by Lift all; Sort puts the hand in order", async ({ page }) => {
  const errors = await open(page);
  await lay(page, 0, 0, 0);
  await lay(page, 0, 1, 0);
  expect((await state(page)).hand).toEqual(["o"]);
  await tap(page, `${ROOT} [data-square="0,0"]`);
  await tap(page, `${ROOT} [data-square="0,0"]`);
  let s = await sound(page, errors);
  expect(s.hand).toEqual(["o", "n"]);
  expect(Object.values(s.table)).toEqual(["w"]);
  await tap(page, '[data-testid="km-lift"]');
  s = await sound(page, errors);
  expect(s.table).toEqual({});
  expect(s.hand).toEqual(["o", "n", "w"]);
  await tap(page, '[data-testid="km-sort"]');
  expect((await state(page)).hand).toEqual(["n", "o", "w"]);
});

test("a tile is traded for three, and a wild is given its letter before it is laid", async ({ page }) => {
  // A seed whose opening hand of seven holds a wild, found with the package itself.
  await loadTileWords("english");
  let seed = 1;
  while (!generateKumimoji(7, "easy", seed).givens.slice(0, 7).includes("*")) seed += 1;
  const givens = generateKumimoji(7, "easy", seed).givens;
  const errors = await open(page, `?seed=${seed}&hand=7&level=easy&words=english&lang=en`);
  let s = await sound(page, errors);
  expect(s.hand.join("")).toBe(givens.slice(0, 7));
  const wild = s.hand.indexOf("*");

  // The wild asks for a letter; a square tapped before it has one does nothing.
  await tap(page, `${ROOT} [data-hand="${wild}"]`);
  s = await sound(page, errors);
  expect(s.picker.length).toBe(26);
  await tap(page, `${ROOT} [data-square="0,0"]`);
  expect((await state(page)).table).toEqual({});
  await tap(page, '[data-testid="km-picker"] button >> nth=4');
  s = await sound(page, errors);
  expect(s.hand[wild]).toBe("e");
  await tap(page, `${ROOT} [data-square="0,0"]`);
  s = await sound(page, errors);
  expect(s.table).toEqual({ "0,0": "e" });
  expect(s.wilds).toEqual(["0,0"]);
  expect(s.hand.length).toBe(6);

  // One tile back into the bag for three.
  const left = s.left;
  await tap(page, `${ROOT} [data-hand="0"]`);
  expect((await state(page)).controls[1]).toBe("Trade for three");
  await tap(page, '[data-testid="km-trade"]');
  s = await sound(page, errors);
  expect(s.hand.length).toBe(8);
  expect(s.left).toBe(left - 2);
});

test("in kana: the hand is kana, and a word is judged in Japanese", async ({ page }) => {
  const words = await loadTileWords("japanese");
  const givens = generateKumimoji(7, "medium", 2026, { language: "japanese" }).givens;
  const errors = await open(page, "?seed=2026&hand=7&level=medium&words=japanese&lang=en");
  let s = await sound(page, errors);
  expect(s.japanese).toBe(true);
  expect(s.hand).toEqual([...givens.slice(0, 7)].map(words.glyphOf));
  expect(s.hand.join("")).toBe("よきめたんえら");
  // えき, a station: two kana side by side are a word.
  await lay(page, 5, 0, 0);
  await lay(page, 1, 0, 1);
  s = await sound(page, errors);
  expect(s.table).toEqual({ "0,0": "え", "0,1": "き" });
  expect(s.notes).toBe("");
  // よ after it is not one.
  await lay(page, 0, 0, 2);
  s = await sound(page, errors);
  expect(s.notes).toBe("Not words: えきよ");
  expect(s.pressed).toContain("language=japanese");
});

test("the set-up row deals the game it shows, and the other games deal theirs", async ({ page }) => {
  const errors = await open(page);
  await tap(page, '[data-set="language=japanese"]');
  await tap(page, '[data-set="hand=11"]');
  await tap(page, '[data-set="level=hard"]');
  await tap(page, "#new");
  await expect(page.locator(`${PLAYING}.km-japanese`)).toBeVisible();
  let s = await sound(page, errors);
  expect(s.hand.length).toBe(11);
  expect(s.hand.join("")).toMatch(/^[ぁ-ん]{11}$/);
  expect(s.left).toBe(39);

  await tap(page, '[data-try="small"]');
  await expect(page.locator(`${PLAYING}[data-seed="44"]`)).toBeVisible();
  s = await sound(page, errors);
  expect(s.hand).toEqual(["n", "w", "o"]);
  expect(s.pressed).toEqual(["language=english", "level=hard"]);

  await tap(page, '[data-try="full"]');
  await expect(page.locator(`${PLAYING}[data-left="133"]`)).toBeVisible({ timeout: 30000 });
  s = await sound(page, errors);
  expect(s.hand.length).toBe(11);

  await tap(page, '[data-try="diagonals"]');
  await expect(page.locator(`${PLAYING}[data-left="33"]`)).toBeVisible({ timeout: 30000 });
  s = await sound(page, errors);
  expect(s.pressed).toContain("diagonals=true");
});
