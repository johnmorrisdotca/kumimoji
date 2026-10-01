// The demo page's own script: a game of Kumimoji alone, set up from the row above it, kept on this
// device between visits, and spoken in the language the header's chooser picks. The language of the
// page and the language of the tiles are two things: an English page can play kana.
/* global familyLanguage */
import { kumimojiDailySeed, kumimojiFromJSON, kumimojiToJSON } from "./dist/index.js";
import { mountKumimoji } from "./dist/ui.js";

// The page's own words, in the two languages the table speaks. Set as text, never as HTML.
const WORDS = {
  en: {
    pageApi: "API reference",
    pitch: "Build one crossword from every tile in the bag. Tap a tile in your hand, then a square. When your hand is empty and every run is a word, draw the next tile.",
    name: "Kumimoji (組み文字) is Japanese for letters put together.",
    nameLink: "About the name",
    words: "Tiles",
    english: "English",
    japanese: "Kana",
    hand: "Hand",
    wilds: "Wilds",
    easy: "Most",
    medium: "Some",
    hard: "None",
    diagonals: "Diagonals",
    newGame: "New game",
    daily: "Today's game",
    share: "Copy link",
    copied: "Copied",
    copyFailed: "Could not copy",
    tagTitle: "As a tag",
    tagText: "The same table in one element, with no framework: the smallest game there is, from a hand of three, dealt from a seed.",
    moreTitle: "Other games",
    moreText: "Each of these deals a new game another way, and says what the table was given to do it. To move a tile on the table, tap it and then a square; tap it twice to take it back. A tile you cannot use can be traded for three.",
    trySmall: "The smallest game there is: NOW, then SNOW, then SNOWY",
    tryKana: "In Japanese, on 45 kana tiles: が plays as か, ゃ as や",
    trySeed: "The same bag every time: a game from a seed",
    tryFull: "All 144 tiles, from a hand of eleven",
    tryDiagonals: "Every diagonal run of three or more must be a word too",
    credits: "The English words are from SCOWL. The Japanese words are derived from JMdict, the property of the Electronic Dictionary Research and Development Group, and are used under CC BY-SA 4.0.",
    creditsLink: "The word lists' notices",
    foot: "Every bag is dealt from a seed, by laying a crossword first, so every game can be finished. Your game stays on this device.",
  },
  ja: {
    pageApi: "API（英語）",
    pitch: "袋のタイルをすべて使って、1つのクロスワードを作ります。手札のタイルをタップしてから、マスをタップして置きます。手札がなくなり、どの並びも単語になったら、次の1枚を引きます。",
    name: "「組み文字」は、文字を組み合わせるという意味です。",
    nameLink: "名前について（英語）",
    words: "タイル",
    english: "英語",
    japanese: "かな",
    hand: "手札",
    wilds: "ワイルド",
    easy: "多め",
    medium: "少し",
    hard: "なし",
    diagonals: "斜めも読む",
    newGame: "新しいゲーム",
    daily: "今日のゲーム",
    share: "リンクをコピー",
    copied: "コピーしました",
    copyFailed: "コピーできませんでした",
    tagTitle: "タグとして",
    tagText: "同じテーブルを、フレームワークなしの一つの要素で。手札3枚のいちばん小さなゲームを、シードから配ります。",
    moreTitle: "ほかのゲーム",
    moreText: "下のボタンは、それぞれ別の設定で新しいゲームを配ります。ボタンには、そのときテーブルに渡す設定が書いてあります。テーブルのタイルを動かすには、タイルをタップしてからマスをタップします。同じタイルを2回タップすると手札に戻ります。使えないタイルは、3枚と交換できます。",
    trySmall: "いちばん小さなゲーム: NOW、SNOW、SNOWY の順に作ります",
    tryKana: "日本語で、45種類のかなタイル: 「が」は「か」、「ゃ」は「や」のタイルで置きます",
    trySeed: "毎回同じ袋: シードを指定したゲーム",
    tryFull: "144枚すべて、手札11枚から",
    tryDiagonals: "斜めに3枚以上並んだタイルも単語でなければなりません",
    credits: "英語の単語は SCOWL によるものです。日本語の単語は、Electronic Dictionary Research and Development Group の JMdict をもとにしており、CC BY-SA 4.0 のもとで利用しています。",
    creditsLink: "単語リストの表示（英語）",
    foot: "袋は、先にクロスワードを作ってからシードをもとに配るので、どのゲームも必ず完成できます。ゲームはこの端末にだけ保存されます。",
  },
};

const KEPT = "kumimoji.page.game";
const query = new URLSearchParams(location.search);
const number = (name, allowed) => (query.has(name) && allowed(Number(query.get(name))) ? Number(query.get(name)) : undefined);
const oneOf = (name, values) => (values.includes(query.get(name)) ? query.get(name) : undefined);
const seed = number("seed", (value) => Number.isInteger(value) && value >= 0 && value <= 0xffffffff);

let table = null;
const language = familyLanguage({
  id: "kumimoji",
  words: WORDS,
  onChange: (lang) => {
    table?.setLocale(lang);
    // The table in a tag follows the page's language the same way, by its attribute.
    document.getElementById("tag")?.setAttribute("lang", lang);
  },
});
document.getElementById("tag")?.setAttribute("lang", language.lang);

// What the row above the table shows and the next game is dealt as. On a first visit the tiles follow the page's language.
const setUp = {
  language: oneOf("words", ["english", "japanese"]) ?? (language.lang === "ja" ? "japanese" : "english"),
  hand: number("hand", (value) => [3, 7, 11].includes(value)) ?? 7,
  level: oneOf("level", ["easy", "medium", "hard"]) ?? "medium",
  gameLength: oneOf("length", ["short", "medium", "full"]) ?? "short",
  diagonals: query.get("diagonals") === "1",
};

function show() {
  for (const button of document.querySelectorAll("[data-set]")) {
    const [name, value] = button.dataset.set.split("=");
    button.setAttribute("aria-pressed", String(String(setUp[name]) === value));
  }
}

function keep(saved) {
  try {
    localStorage.setItem(KEPT, kumimojiToJSON(saved));
  } catch {
    // A browser that keeps nothing still plays.
  }
}

/** What was being played when this device last left, if it is still a game its own bag deals. */
async function kept() {
  try {
    const text = localStorage.getItem(KEPT);
    return text === null ? null : await kumimojiFromJSON(text);
  } catch {
    return null;
  }
}

// A game left half way is put back, unless the address asks for a deal of its own.
const before = seed === undefined && !query.has("words") && !query.has("hand") && !query.has("length") ? await kept() : null;
if (before !== null) Object.assign(setUp, { language: before.deal.language, hand: before.deal.size, level: before.deal.level, gameLength: before.deal.gameLength, diagonals: before.deal.diagonals === true });

table = mountKumimoji(document.getElementById("table"), {
  ...setUp,
  seed,
  locale: language.lang,
  // The family's paper, ink and felt, which follow light and dark on their own.
  theme: { "--km-ink": "var(--ink)", "--km-panel": "var(--surface)", "--km-font": "var(--font)", "--km-felt": "var(--felt)", "--km-accent": "var(--felt)", "--km-accent-ink": "var(--felt-ink)" },
  onChange: keep,
});
if (before !== null) await table.setGame(before);
show();

function start(changed = {}) {
  Object.assign(setUp, changed.setUp ?? {});
  show();
  void table.newGame({ ...setUp, seed: changed.seed });
  document.getElementById("table").scrollIntoView({ block: "nearest", behavior: "smooth" });
}

for (const button of document.querySelectorAll("[data-set]")) {
  button.addEventListener("click", () => {
    const [name, value] = button.dataset.set.split("=");
    // Diagonals is a switch; the others are one of several.
    setUp[name] = name === "diagonals" ? !setUp.diagonals : name === "hand" ? Number(value) : value;
    show();
  });
}
document.getElementById("new").addEventListener("click", () => start());
document.getElementById("daily").addEventListener("click", () => start({ seed: kumimojiDailySeed(new Date()) }));

/** Say what a button did for a moment, then say what it is for again. */
function said(button, text) {
  const key = button.dataset.say;
  button.textContent = text;
  button.dataset.said = "true";
  setTimeout(() => {
    button.textContent = WORDS[language.lang][key];
    delete button.dataset.said;
  }, 1500);
}

/** The link that deals the game on the table to whoever opens it: its seed, and the set-up that goes with it. */
function linkOf(deal) {
  const url = new URL(location.href);
  const asked = { seed: deal.seed, words: deal.language, hand: deal.size, level: deal.level, length: deal.gameLength, lang: language.lang };
  if (deal.diagonals === true) asked.diagonals = "1";
  url.search = new URLSearchParams(asked).toString();
  url.hash = "";
  return url.href;
}
document.getElementById("share").addEventListener("click", async () => {
  const button = document.getElementById("share");
  const deal = table.saved()?.deal;
  try {
    if (deal === undefined) throw new Error("no game yet");
    await navigator.clipboard.writeText(linkOf(deal));
    said(button, WORDS[language.lang].copied);
  } catch {
    said(button, WORDS[language.lang].copyFailed);
  }
});

const TRIES = {
  small: { setUp: { language: "english", hand: 3, level: "hard", gameLength: "short", diagonals: false }, seed: 44 },
  kana: { setUp: { language: "japanese", hand: 7, level: "medium", gameLength: "short", diagonals: false } },
  seed: { setUp: { language: "english", hand: 7, level: "medium", gameLength: "short", diagonals: false }, seed: 2026 },
  full: { setUp: { language: "english", hand: 11, level: "medium", gameLength: "full", diagonals: false } },
  diagonals: { setUp: { language: "english", hand: 7, level: "easy", gameLength: "short", diagonals: true } },
};
for (const button of document.querySelectorAll("[data-try]")) button.addEventListener("click", () => start(TRIES[button.dataset.try]));
