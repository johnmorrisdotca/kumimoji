// What every table test starts from: the built demo in `site/`, served to the
// page without a port, and the table's state read off the page.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".md": "text/markdown" };

export const ROOT = '#table [data-testid="km-root"]';
/** The table once a game is dealt. */
export const PLAYING = `${ROOT}[data-state="playing"]`;
/** The smallest game there is: a hand of three from seed 44, which deals N W O, then S, then Y. */
export const SMALL = "?seed=44&hand=3&level=hard&words=english&lang=en";

/** Open the demo with a query, wait for the game to be dealt, and collect anything the page complains of. */
export async function open(page, query = SMALL) {
  if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm site` first (`pnpm test:table` does)");
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await page.route("http://kumimoji.test/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
  await page.goto(`http://kumimoji.test/${query}`);
  await expect(page.locator(PLAYING)).toBeVisible({ timeout: 30000 });
  return errors;
}

/** Tap, as a finger would where the page is touched and as a mouse where it is not. */
export async function tap(page, selector, options = {}) {
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded();
  if (test.info().project.use.hasTouch === true) await target.tap(options);
  else await target.click(options);
}

/** Lay the hand's tile at `handAt` on the square at a row and column. */
export async function lay(page, handAt, row, col) {
  await tap(page, `${ROOT} [data-hand="${handAt}"]`);
  await tap(page, `${ROOT} [data-square="${row},${col}"]`);
}

/** The table as the page shows it. */
export function state(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const all = (s) => [...document.querySelectorAll(s)];
    const box = (e) => e.getBoundingClientRect();
    const root = q('#table [data-testid="km-root"]');
    return {
      lang: document.documentElement.lang,
      state: root.dataset.state,
      seed: root.dataset.seed,
      left: Number(root.dataset.left),
      japanese: root.classList.contains("km-japanese"),
      status: q('#table [data-testid="km-status"]').textContent,
      notes: q('#table [data-testid="km-notes"]').textContent,
      hand: all('#table [data-testid="km-hand"] [data-hand]').map((tile) => tile.dataset.tile),
      handWords: q('#table [data-testid="km-hand"]').textContent,
      table: Object.fromEntries(all("#table .km-board .km-tile").map((tile) => [tile.dataset.square, tile.dataset.tile])),
      wrong: all("#table .km-board .km-misspelt").map((tile) => tile.dataset.square),
      wilds: all("#table .km-board .km-wild").map((tile) => tile.dataset.square),
      squares: all("#table .km-board .km-square, .km-board .km-tile").length,
      picker: all('#table [data-testid="km-picker"] button').map((b) => b.textContent),
      controls: all('#table [data-testid="km-controls"] button').map((b) => `${b.textContent}${b.disabled ? " (off)" : ""}`),
      keep: all('#table [data-testid="km-keep"] button').map((b) => b.textContent),
      note: q('#table [data-testid="km-note"]')?.textContent ?? "",
      unreviewed: !q("#unreviewed").hidden,
      pitch: q('[data-say="pitch"]').textContent,
      pressed: all('[data-set][aria-pressed="true"]').map((b) => b.dataset.set),
      pageWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
      // Anything to be tapped that is smaller than a fingertip. Links in running text are words, not targets.
      small: all("button, input, select, textarea, summary, nav a, footer .family a")
        .filter((e) => box(e).width > 0 && !e.hidden && (box(e).height < 43.5 || box(e).width < 43.5))
        .map((e) => `${e.dataset.testid ?? e.className ?? e.tagName} “${e.textContent.trim().slice(0, 20)}”: ${Math.round(box(e).width)}×${Math.round(box(e).height)}`),
    };
  });
}

/** What holds in every state the table can be in: nothing wider than the screen, nothing too small to tap, nothing complained of. */
export async function sound(page, errors) {
  const s = await state(page);
  expect(s.pageWidth, "the page is no wider than the window").toBe(s.windowWidth);
  expect(s.small, "every target is at least 44px").toEqual([]);
  expect(errors, "the page complained of nothing").toEqual([]);
  return s;
}
