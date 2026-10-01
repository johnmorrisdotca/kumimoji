// The table played from a keyboard: one stop for Tab on the table and one in the hand, arrow keys between
// squares and between tiles, Enter to pick up and to lay, Escape to let go, and the keyboard left where it was
// when the table is drawn again.
import { expect, test } from "@playwright/test";

import { ROOT, open, sound, state } from "./table.mjs";

const SQUARES = "#table .km-square";
const HAND = "#table [data-hand]";
const on = (page) => page.evaluate(() => ({ square: document.activeElement?.getAttribute("data-square") ?? null, hand: document.activeElement?.getAttribute("data-hand") ?? null, id: document.activeElement?.getAttribute("data-testid") ?? null }));

test("Tab lands on one square and one tile, which are named, and arrows move between them", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator(`${SQUARES}[tabindex="0"]`)).toHaveCount(1);
  await expect(page.locator(`${HAND}[tabindex="0"]`)).toHaveCount(1);
  await expect(page.locator("#table .km-grid")).toHaveAttribute("aria-description", /Arrow keys/);

  const stop = page.locator(`${SQUARES}[tabindex="0"]`);
  await stop.focus();
  const first = (await on(page)).square;
  const [row, col] = first.split(",").map(Number);
  await page.keyboard.press("ArrowRight");
  expect((await on(page)).square).toBe(`${row},${col + 1}`);
  await page.keyboard.press("ArrowDown");
  expect((await on(page)).square).toBe(`${row + 1},${col + 1}`);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");
  expect((await on(page)).square).toBe(first);
  await expect(page.locator(`${SQUARES}[tabindex="0"]`)).toHaveCount(1);

  // The hand's tiles: Right and Left, Home and End.
  await page.locator(`${HAND}[tabindex="0"]`).focus();
  expect((await on(page)).hand).toBe("0");
  await page.keyboard.press("ArrowRight");
  expect((await on(page)).hand).toBe("1");
  await page.keyboard.press("End");
  expect((await on(page)).hand).toBe("2");
  await page.keyboard.press("ArrowRight");
  expect((await on(page)).hand).toBe("2");
  await page.keyboard.press("Home");
  expect((await on(page)).hand).toBe("0");
  await sound(page, errors);
});

test("Enter picks up a tile and lays it, Escape lets go, and the keyboard stays where it was after each draw of the table", async ({ page }) => {
  const errors = await open(page);
  const tile = page.locator('#table [data-hand="0"]');
  await tile.focus();
  await page.keyboard.press("Enter");
  await expect(tile).toHaveClass(/km-held/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#table .km-held")).toHaveCount(0);

  await tile.focus();
  await page.keyboard.press("Enter");
  const square = page.locator('#table [data-square="0,0"]');
  await square.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('#table [data-square="0,0"]')).toHaveAttribute("data-tile", "n");
  // The table was drawn again, and the keyboard is still on the square it laid on.
  expect((await on(page)).square).toBe("0,0");
  let s = await state(page);
  expect(s.hand).toEqual(["w", "o"]);

  // Sort is a button that draws the controls again: the keyboard is still on it.
  await page.locator('#table [data-testid="km-sort"]').focus();
  await page.keyboard.press("Enter");
  expect((await on(page)).id).toBe("km-sort");
  await page.keyboard.press(" ");
  expect((await on(page)).id).toBe("km-sort");
  s = await sound(page, errors);
  expect(s.table).toEqual({ "0,0": "n" });
  await expect(page.locator(ROOT)).toHaveAttribute("data-state", "playing");
});

test("the whole game from the keyboard: NOW, then SNOW, then SNOWY", async ({ page }) => {
  const errors = await open(page);
  const lay = async (handAt, square) => {
    await page.locator(`#table [data-hand="${handAt}"]`).focus();
    await page.keyboard.press("Enter");
    await page.locator(`#table [data-square="${square}"]`).focus();
    await page.keyboard.press("Enter");
  };
  await lay(0, "0,0");
  await lay(0, "0,2");
  await lay(0, "0,1");
  await page.locator('#table [data-testid="km-draw"]').focus();
  await page.keyboard.press("Enter");
  await lay(0, "0,-1");
  await page.locator('#table [data-testid="km-draw"]').focus();
  await page.keyboard.press("Enter");
  await lay(0, "0,3");
  await expect(page.locator(ROOT)).toHaveAttribute("data-state", "finished");
  const s = await sound(page, errors);
  expect(s.status).toMatch(/^Finished in /);
});
