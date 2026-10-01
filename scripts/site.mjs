// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's
// shared header and footer, with the family's stylesheet, Kumimoji's own, the page's script and the
// compiled library beside it, word lists, notices and all.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

import { API_CSS, apiPage } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "kumimoji";
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Ctext x='50' y='70' font-size='60' text-anchor='middle' fill='%23f3efe4'%3E組%3C/text%3E%3C/svg%3E";

/** One segmented choice of the set-up row: its label, each button's setting and words, and a line for the Help switch in both languages. */
const choice = (say, buttons, [en, ja]) => `<div class="fam-row" data-help-en="${en}" data-help-ja="${ja}">
          <span class="fam-label" data-say="${say}"></span>
          <div class="fam-seg" role="group" data-say-label="${say}">
            ${buttons.map(([set, word]) => `<button type="button" data-set="${set}"${word.say === undefined ? `>${word.text}` : ` data-say="${word.say}">`}</button>`).join("")}
          </div>
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
      ${familyHeader({ id, links: [{ href: "api.html", say: "pageApi" }] })}
      <div class="setup fam-row">
        ${choice("words", [["language=english", { say: "english" }], ["language=japanese", { say: "japanese" }]], ["Choose the tiles in the bag: English letters, or Japanese kana. It takes effect when you press New game.", "袋に入れるタイルを選びます（英語の文字か、日本語のかな）。「新しいゲーム」を押すと反映されます。"])}
        ${choice("hand", [["hand=7", { text: "7" }], ["hand=11", { text: "11" }]], ["How many tiles you hold at a time: 7 or 11. It takes effect when you press New game.", "手元に持つタイルの枚数です（7枚か11枚）。「新しいゲーム」を押すと反映されます。"])}
        ${choice("wilds", [["level=easy", { say: "easy" }], ["level=medium", { say: "medium" }], ["level=hard", { say: "hard" }]], ["How many wild tiles are in the bag: most, some or none. A wild stands for any letter. It takes effect when you press New game.", "袋に入れるワイルドタイル（どの文字にもなるタイル）の量です（多め・少し・なし）。「新しいゲーム」を押すと反映されます。"])}
        <button type="button" class="fam-button" data-set="diagonals=true" data-say="diagonals" data-tip-en="Also read words that run on a diagonal, not only across and down. A switch: it takes effect when you press New game." data-tip-ja="縦と横に加えて、斜めに並んだ言葉も読みます。オンとオフの切り替えで、「新しいゲーム」を押すと反映されます。"></button>
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
// The API reference, made from the source: every export of every entry point.
writeFileSync("site/api.css", API_CSS);
writeFileSync("site/api.html", apiPage({ id, name: "Kumimoji", icon: ICON }));
console.log("site/ is ready: serve it, or let the Pages workflow publish it.");
