// Packs the package the way it is published (`npm pack`, npm and not pnpm),
// installs the tarball into an empty project, and uses it as somebody who
// installed it would: every entry in `exports` imported by ESM and loaded by
// `require`, both word lists read, and a seeded game dealt, played and read
// back. A package whose `exports` name a file that is not in the tarball
// fails here, before it can be published, and so does one that ships a word
// list without its licence's notice. `pnpm test:package` builds first.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const windows = process.platform === "win32";
const scratch = mkdtempSync(join(tmpdir(), "kumimoji-package-"));

/** Run a command and hand back what it printed. On Windows, npm is a .cmd file, which only a shell runs; node itself is run directly. */
function run(command, args, cwd, viaShell = false) {
  const ran = spawnSync(command, args, { cwd, encoding: "utf8", shell: viaShell && windows });
  if (ran.status !== 0) {
    console.error(`FAIL ${command} ${args.join(" ")}\n${ran.stdout}\n${ran.stderr}`);
    process.exit(1);
  }
  return ran.stdout;
}
function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

// 1. Pack, with npm.
const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", scratch], root, true));
const tarball = join(scratch, packed[0].filename);
const inTarball = new Set(packed[0].files.map((file) => file.path));
console.log(`ok   npm pack: ${packed[0].filename}, ${packed[0].files.length} files`);
// The README's pictures are in docs/images, for GitHub and npm to show by address, and are never in what is installed.
const shipped = [...inTarball].filter((file) => file.startsWith("docs/") || /\.(webp|png|jpe?g|gif)$/.test(file));
if (shipped.length > 0) {
  console.error(`FAIL the tarball holds pictures or docs: ${shipped.join(", ")}`);
  process.exit(1);
}
console.log("ok   no picture and nothing from docs/ is in the tarball");

// 2. Everything package.json points at is in the tarball, and the notices of the word lists travel with them.
const pointed = [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.bin ?? {}), ...Object.values(pkg.exports).flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry)))];
for (const file of new Set(pointed)) if (!inTarball.has(file.replace(/^\.\//, ""))) fail(`package.json points at ${file}, which is not in the tarball`);
console.log(`ok   every file package.json points at is in the tarball (${new Set(pointed).size})`);
for (const file of ["LICENSE", "NOTICE.md", "dist/words.en.data.js", "dist/words.ja.data.js"]) if (!inTarball.has(file)) fail(`${file} is not in the tarball`);
for (const file of inTarball) if (/\.test\.|^src\/|^demo\/|^table\//.test(file)) fail(`the tarball carries ${file}, which nobody who installs it needs`);

// 3. Install it into an empty project, with the one optional peer its React entry needs.
const project = join(scratch, "project");
mkdirSync(project);
writeFileSync(join(project, "package.json"), JSON.stringify({ name: "scratch", private: true, version: "0.0.0" }));
run("npm", ["install", "--no-audit", "--no-fund", "--silent", tarball, "react"], project, true);
console.log("ok   npm install of the tarball");

// The notices, as installed: each list's own file says whose it is and under what terms.
const installed = join(project, "node_modules", ...pkg.name.split("/"));
const notice = readFileSync(join(installed, "NOTICE.md"), "utf8");
const english = readFileSync(join(installed, "dist", "words.en.data.js"), "utf8").slice(0, 3000);
const japanese = readFileSync(join(installed, "dist", "words.ja.data.js"), "utf8").slice(0, 3000);
if (!notice.includes("Copyright 2000-2018 by Kevin Atkinson") || !notice.includes("Creative Commons Attribution-ShareAlike 4.0") || !notice.includes("edrdg.org")) fail("NOTICE.md has lost a word list's notice");
if (!english.includes("Copyright 2000-2018 by Kevin Atkinson") || !english.includes("Permission to use, copy, modify, distribute and sell")) fail("the English list's file has lost SCOWL's notice");
if (!japanese.includes("JMdict") || !japanese.includes("CC BY-SA 4.0") || !japanese.includes("edrdg.org/edrdg/licence.html")) fail("the Japanese list's file has lost JMdict's notice");
console.log("ok   the word lists' notices are in NOTICE.md and in each list's own file");

// 4. Every entry in `exports`, by ESM and by require; both lists read; a seeded game that must come out as it always has.
const entries = Object.keys(pkg.exports).map((key) => (key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`));
const game = `
const { loadTileWords, generateKumimoji, deal, draw, placeFromHand, squareAt, judgeWithWords, isFinished, checkKumimoji, encodeGrid, kumimojiToJSON, kumimojiFromJSON, KUMIMOJI_VERSION } = kumimoji;
const english = await loadTileWords("english");
const japanese = await loadTileWords("japanese");
if (english.allowed.size !== 110316 || japanese.allowed.size !== 163461) throw new Error("the lists hold " + english.allowed.size + " and " + japanese.allowed.size + " words");
const dealt = generateKumimoji(3, "hard", 44);
if (dealt.givens !== "nwosy") throw new Error("seed 44 dealt " + dealt.givens);
if (generateKumimoji(7, "medium", 2026).givens !== "xbsnnnymrqao*et*cuutxmopsmdewie*aapirpfe") throw new Error("seed 2026 dealt another bag");
let play = deal(dealt.givens, 3);
play = placeFromHand(play, 0, squareAt(0, 0));
play = placeFromHand(play, 1, squareAt(0, 1));
play = placeFromHand(play, 0, squareAt(0, 2));
play = placeFromHand(draw(play), 0, squareAt(0, -1));
play = placeFromHand(draw(play), 0, squareAt(0, 3));
if (!isFinished(play, judgeWithWords(play.tiles, english))) throw new Error("SNOWY did not finish the game");
if (checkKumimoji(3, dealt.givens, encodeGrid(play.tiles), { level: "hard" }).ok !== true) throw new Error("the finished grid was refused");
const back = await kumimojiFromJSON(kumimojiToJSON({ deal: dealt, play, elapsedMs: 1000 }));
if (back === null || encodeGrid(back.play.tiles) !== "snowy") throw new Error("the game did not read back from JSON");
if (kumimoji.kumimojiDailySeed(new Date("2026-10-01T12:00:00Z")) !== 20261001) throw new Error("the day's seed is not the date as a number");
if (KUMIMOJI_VERSION !== ${JSON.stringify(pkg.version)}) throw new Error("KUMIMOJI_VERSION is " + KUMIMOJI_VERSION);
`;
const wordsEntry = JSON.stringify(`${pkg.name}/words`);
writeFileSync(
  join(project, "esm.mjs"),
  `${entries.map((entry, i) => `import * as m${i} from ${JSON.stringify(entry)};`).join("\n")}
const all = [${entries.map((_, i) => `m${i}`).join(", ")}];
const names = ${JSON.stringify(entries)};
// An entry that only defines the tag on a page (the /define one) exports nothing, and is imported for its effect.
all.forEach((m, i) => { if (Object.keys(m).length === 0 && !names[i].endsWith("/define")) throw new Error(names[i] + " exports nothing"); });
const kumimoji = m0;
${game}
console.log(names.join(" "));
`,
);
writeFileSync(
  join(project, "cjs.cjs"),
  `const names = ${JSON.stringify(entries)};
for (const name of names) { const m = require(name); if (Object.keys(m).length === 0 && !name.endsWith("/define")) throw new Error(name + " exports nothing"); }
require(${wordsEntry});
const kumimoji = require(${JSON.stringify(pkg.name)});
(async () => {
${game}
console.log(names.join(" "));
})().catch((error) => { console.error(error); process.exit(1); });
`,
);
console.log(`ok   import:  ${run(process.execPath, ["esm.mjs"], project).trim()}`);
console.log(`ok   require: ${run(process.execPath, ["cjs.cjs"], project).trim()}`);

rmSync(scratch, { recursive: true, force: true });
console.log("the package installs and runs as published, on", process.platform, process.version);
