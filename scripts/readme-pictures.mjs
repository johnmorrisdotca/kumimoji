// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and is the same each run: the game is
// dealt from a seed, and the words laid are the ones the package's own computer player lays, tapped in one tile at a time as a
// person would. Motion is reduced. Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

import "../dist/words.js";
import { bestLaying, deal, draw, generateKumimoji, judgeTiles, loadTileWords, mayDraw } from "../dist/index.js";

const TABLE = '#table [data-testid="km-root"]';

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


/** Lay `words` words by taps, then wait for the table to settle. */
const laid = ({ language, seed, words }) => async (page) => {
  for (const step of await taps({ language, seed, words })) {
    if (step.draw) await page.locator('#table [data-testid="km-draw"]').click();
    else {
      await page.locator(`#table [data-hand="${step.hand}"]`).click();
      await page.locator(`#table [data-square="${step.square}"]`).click();
    }
  }
};
const address = ({ seed, hand = 7, level = "hard", words = "english", lang = "en", extra = "" }) => `/?seed=${seed}&hand=${hand}&level=${level}&words=${words}&lang=${lang}${extra}`;

/** The table alone, cropped. */
const table = (subject, query, play, shape = {}) => ({ subject, views: ["desk"], scale: 2, url: address(query), ready: `${TABLE}[data-state="playing"]`, target: `${TABLE} [data-testid="km-board"]`, prepare: laid(play), ...shape });

await takePictures({
  shots: [
    // English from the top of the page, so the header, the language chooser and the cloth patches show: a crossword half built.
    // On a phone, in kana, scrolled to the table.
    {
      subject: "hero",
      views: ["desk", "phone"],
      height: 900,
      url: address({ seed: 77 }),
      ready: `${TABLE}[data-state="playing"]`,
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto(`http://kumimoji.test${address({ seed: 1, words: "japanese", lang: "ja" })}`);
          await page.waitForSelector(`${TABLE}[data-state="playing"]`);
          await laid({ language: "japanese", seed: 1, words: 5 })(page);
          await page.locator(TABLE).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
        } else {
          await laid({ language: "english", seed: 77, words: 7 })(page);
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      },
    },
    table("english", { seed: 77 }, { language: "english", seed: 77, words: 7 }),
    table("kana", { seed: 1, words: "japanese", lang: "ja" }, { language: "japanese", seed: 1, words: 5 }),
    table("wild-tiles", { seed: 5, level: "easy" }, { language: "english", seed: 5, words: 0 }, { target: `${TABLE} [data-testid="km-hand"]` }),
    // The smallest game there is (seed 44, a hand of three): N beside W is not a word, and the table rings both.
    table("not-a-word", { seed: 44, hand: 3 }, { language: "english", seed: 44, words: 0 }, {
      async prepare(page) {
        for (const square of ["0,0", "0,1"]) {
          await page.locator('#table [data-hand="0"]').click();
          await page.locator(`#table [data-square="${square}"]`).click();
        }
        await page.locator(`${TABLE} .km-misspelt`).first().waitFor();
      },
    }),
    table("hand-of-eleven", { seed: 33, hand: 11 }, { language: "english", seed: 33, words: 5 }),
  ],
});
