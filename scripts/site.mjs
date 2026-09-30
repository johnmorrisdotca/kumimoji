// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's
// shared header and footer, with the family's stylesheet, Kumimoji's own, the page's script and the
// compiled library beside it, word lists, notices and all.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "kumimoji";
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Ctext x='50' y='70' font-size='60' text-anchor='middle' fill='%23f3efe4'%3E組%3C/text%3E%3C/svg%3E";

/** One segmented choice of the set-up row: its label, and each button's setting and words. */
const choice = (say, buttons) => `<span class="fam-label" data-say="${say}"></span>
        <div class="fam-seg" role="group" data-say-label="${say}">
          ${buttons.map(([set, word]) => `<button type="button" data-set="${set}"${word.say === undefined ? `>${word.text}` : ` data-say="${word.say}">`}</button>`).join("")}
        </div>`;

const tries = [
  ["small", `hand: 3, level: "hard", seed: 44`],
  ["kana", `language: "japanese"`],
  ["seed", `seed: 2026`],
  ["full", `hand: 11, gameLength: "full"`],
  ["diagonals", `diagonals: true`],
];

const page = `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({
      id,
      title: "Kumimoji · the crossword tile race, in English and Japanese",
      description: "Build one crossword from every tile in the bag, in English or in Japanese kana: lay tiles as words that cross, draw when every run is a word, and race the clock. Free and open source.",
      ogTitle: "Kumimoji crossword tile race",
      ogDescription: "Build one crossword from every tile in the bag, in English or Japanese.",
    })}
    <link rel="icon" href="${ICON}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="kumimoji.css" />
  </head>
  <body>
    <main>
      ${familyHeader({ id })}
      <div class="setup fam-row">
        ${choice("words", [["language=english", { say: "english" }], ["language=japanese", { say: "japanese" }]])}
        ${choice("hand", [["hand=7", { text: "7" }], ["hand=11", { text: "11" }]])}
        ${choice("wilds", [["level=easy", { say: "easy" }], ["level=medium", { say: "medium" }], ["level=hard", { say: "hard" }]])}
        <button type="button" class="fam-button" data-set="diagonals=true" data-say="diagonals"></button>
        <button type="button" class="fam-button" data-accent="true" id="new" data-say="newGame"></button>
      </div>
      <div id="table"></div>
      ${familyUnreviewed({ id })}
      <section class="more" aria-labelledby="more-title">
        <h2 id="more-title" data-say="moreTitle"></h2>
        <p data-say="moreText"></p>
        <ul>
          ${tries.map(([name, code]) => `<li><button type="button" data-try="${name}"><code>${code.replace(/"/g, "&quot;")}</code><span data-say="try${name[0].toUpperCase()}${name.slice(1)}"></span></button></li>`).join("\n          ")}
        </ul>
      </section>
      <p class="credits fam-fine"><span data-say="credits"></span> <a href="https://github.com/johnmorrisdotca/kumimoji/blob/main/NOTICE.md" data-say="creditsLink"></a></p>
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    <script type="module" src="demo.js"></script>
  </body>
</html>
`;

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
cpSync("dist", "site/dist", { recursive: true });
// The lists' notices go where the lists go.
cpSync("NOTICE.md", "site/NOTICE.md");
cpSync("LICENSE", "site/LICENSE");
writeFileSync("site/index.html", page);
console.log("site/ is ready: serve it, or let the Pages workflow publish it.");
