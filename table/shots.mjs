// Pictures of the demo for a person to look at: `node table/shots.mjs <folder> <name>`. Not a test.
// 390px and 1280px, light and dark, English and Japanese, a few tiles into a seeded game.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const [folder = ".", name = "kumimoji"] = process.argv.slice(2);
const browser = await chromium.launch();
for (const width of [390, 1280]) {
  for (const colorScheme of ["light", "dark"]) {
    for (const lang of ["en", "ja"]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, colorScheme, deviceScaleFactor: 2, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.route("http://kumimoji.test/**", (route) => {
        const { pathname } = new URL(route.request().url());
        const file = join(site, pathname === "/" ? "index.html" : pathname);
        return existsSync(file) ? route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" }) : route.fulfill({ status: 404, body: "" });
      });
      // A game a few tiles in, in the language of the page: a word laid, one that is not, and the fold open.
      await page.goto(`http://kumimoji.test/?seed=2026&hand=7&level=medium&words=${lang === "ja" ? "japanese" : "english"}&lang=${lang}`);
      await page.waitForSelector('[data-testid="km-root"][data-state="playing"]');
      const lay = async (handAt, row, col) => {
        await page.locator(`[data-hand="${handAt}"]`).click();
        await page.locator(`[data-square="${row},${col}"]`).click();
      };
      if (lang === "ja") {
        await lay(5, 0, 0);
        await lay(1, 0, 1);
        await lay(0, 1, 1);
      } else {
        await lay(1, 0, 0);
        await lay(5, 0, 1);
        await lay(1, 1, 1);
      }
      await page.locator('[data-testid="km-keep"] summary').click();
      await page.screenshot({ path: join(folder, `${name}-${width}-${colorScheme}-${lang}.png`), fullPage: true });
      await context.close();
    }
  }
}
await browser.close();
