// Takes the pictures the README shows, from the built demo in `site/`: `pnpm pictures` (builds the demo, then runs this).
// The page is served to a browser without a port, never fetched from the live site, and the same each run:
// the game is dealt from a seed, and the words laid are the ones the package's own computer player lays,
// tapped in one tile at a time as a person would. Motion is reduced.
// Output: docs/desktop.jpg (1280 wide, light, English) and docs/phone.jpg (390 by 844, dark, Japanese kana).
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import "../dist/words.js";
import { bestLaying, deal, draw, generateKumimoji, judgeTiles, loadTileWords, mayDraw } from "../dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const docs = join(root, "docs");
const host = "http://kumimoji.test";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".md": "text/markdown" };
const QUALITY = 76;

if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm pictures` (it builds the demo first)");

/** The taps that lay `words` words the computer player would lay on a bag dealt from `seed`: a tile from the hand onto a square, or a draw. */
async function taps({ language, seed, words }) {
  const list = await loadTileWords(language);
  const deal7 = generateKumimoji(7, "hard", seed, { language });
  let play = deal(deal7.givens, 7);
  const steps = [];
  let laid = 0;
  for (let step = 0; step < 200 && laid < words; step += 1) {
    const next = bestLaying(play, list);
    if (next !== null) {
      const hand = [...play.hand];
      for (const [square, tile] of next.play.tiles) {
        if (play.tiles.has(square)) continue;
        const at = hand.indexOf(tile);
        hand.splice(at, 1);
        steps.push({ hand: at, square });
      }
      play = next.play;
      laid += 1;
    } else if (play.hand.length === 0 || mayDraw(play, judgeTiles(play.tiles, list))) {
      play = draw(play);
      steps.push({ draw: true });
    } else break;
  }
  // A tile drawn at the end, so the picture shows a hand to lay from.
  if (play.hand.length === 0 && mayDraw(play, judgeTiles(play.tiles, list))) steps.push({ draw: true });
  return steps;
}

const browser = await chromium.launch();

async function shot({ width, height, colorScheme, lang, language, seed, words, path, scrollTo }) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme, reducedMotion: "reduce", locale: "en-US", deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.route(`${host}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
  await page.goto(`${host}/?seed=${seed}&hand=7&level=hard&words=${language}&lang=${lang}`);
  await page.waitForSelector('[data-testid="km-root"][data-state="playing"]');
  for (const step of await taps({ language, seed, words })) {
    if (step.draw) await page.locator('[data-testid="km-draw"]').click();
    else {
      await page.locator(`[data-hand="${step.hand}"]`).click();
      await page.locator(`[data-square="${step.square}"]`).click();
    }
  }
  await page.waitForTimeout(300);
  if (scrollTo) await page.locator(scrollTo).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
  else await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(0, 0);
  await page.screenshot({ path, type: "jpeg", quality: QUALITY });
  await context.close();
}

// English from the top of the page, so the header, the language chooser and the cloth patches show: a crossword half built.
await shot({ width: 1280, height: 900, colorScheme: "light", lang: "en", language: "english", seed: 77, words: 7, path: join(docs, "desktop.jpg") });
// Kana on a phone, scrolled to the table.
await shot({ width: 390, height: 844, colorScheme: "dark", lang: "ja", language: "japanese", seed: 1, words: 5, path: join(docs, "phone.jpg"), scrollTo: '[data-testid="km-root"]' });
await browser.close();
