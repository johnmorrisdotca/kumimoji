/**
 * EVERY WORD KUMIMOJI SHOWS A PERSON, in English and Japanese: the table's
 * buttons and status lines, and the lines of a game written out as text
 * (`kumimojiToText`). This is the language of the page, which is not the
 * language of the tiles: an English page can play kana, and a Japanese page
 * English letters.
 *
 * A page in another language passes its own table, whole or in part:
 * `{ ...KUMIMOJI_STRINGS.en, draw: "Robar" }`. `{n}`, `{time}` and the other
 * braces are filled in when a line is shown; a table must keep them.
 * `docs/strings-ja.md` lists the two languages side by side and is made from
 * this file.
 */

/** The languages the table speaks: English and Japanese. */
export type KumimojiLocale = "en" | "ja";

const EN = {
  dealing: "Dealing…",
  leftOne: "1 tile left in the bag · {time}",
  left: "{n} tiles left in the bag · {time}",
  finished: "Finished in {time}. Every tile laid, every run a word.",
  tableLabel: "The table",
  tableKeys: "Arrow keys move between squares, Enter or Space taps one, and Escape lets go of a tile you have picked up.",
  handLabel: "Your hand",
  emptySquare: "Empty square",
  wildTile: "{tile}, wild",
  wildBlank: "Wild, no letter yet",
  notWords: "Not words: {words}",
  apart: "Every tile must join the one crossword.",
  noTiles: "No tiles in hand",
  giveWild: "Give the wild a letter:",
  changeWild: "Change the wild's letter:",
  draw: "Draw",
  trade: "Trade for three",
  sort: "Sort",
  liftAll: "Lift all",
  newGame: "New game",
  keep: "Save and load",
  saveJson: "Save as JSON",
  saveText: "Save as text",
  load: "Load a game",
  loaded: "Game loaded.",
  loadBad: "That file is not a game of Kumimoji these rules can open.",
  textTitle: "Kumimoji: {language}, a hand of {hand}, seed {seed}",
  textEmpty: "(no tiles on the table)",
  textHand: "Hand: {tiles}",
  textHandEmpty: "Hand: empty",
  textLeft: "In the bag: {n}",
  textTime: "Time: {time}",
  textFinished: "Finished: every tile laid, every run a word.",
  english: "English",
  japanese: "Japanese",
};

/** Every word the table shows, by name: one table of these for each language. */
export type KumimojiStrings = { [Name in keyof typeof EN]: string };

const JA: KumimojiStrings = {
  dealing: "配っています…",
  leftOne: "袋の残り1枚 · {time}",
  left: "袋の残り{n}枚 · {time}",
  finished: "{time}で完成しました。すべてのタイルを置き、どの並びも単語になっています。",
  tableLabel: "テーブル",
  tableKeys: "矢印キーでマスを移動し、Enterキーかスペースキーでタップします。Escapeキーで、選んだタイルの選択を解除します。",
  handLabel: "手札",
  emptySquare: "空きマス",
  wildTile: "{tile}（ワイルド）",
  wildBlank: "ワイルド（文字は未定）",
  notWords: "単語ではありません: {words}",
  apart: "すべてのタイルを1つのクロスワードにつなげてください。",
  noTiles: "手札にタイルはありません",
  giveWild: "ワイルドの文字を選んでください:",
  changeWild: "ワイルドの文字を変える:",
  draw: "1枚引く",
  trade: "1枚を3枚と交換",
  sort: "並べ替え",
  liftAll: "すべて手札に戻す",
  newGame: "新しいゲーム",
  keep: "保存と読み込み",
  saveJson: "JSONで保存",
  saveText: "テキストで保存",
  load: "ゲームを読み込む",
  loaded: "ゲームを読み込みました。",
  loadBad: "このファイルは、開くことのできる組み文字のゲームではありません。",
  textTitle: "組み文字: {language}、手札{hand}枚、シード {seed}",
  textEmpty: "（テーブルにタイルはありません）",
  textHand: "手札: {tiles}",
  textHandEmpty: "手札: なし",
  textLeft: "袋の残り: {n}枚",
  textTime: "時間: {time}",
  textFinished: "完成: すべてのタイルを置き、どの並びも単語になっています。",
  english: "英語",
  japanese: "日本語",
};

/** The table's words in each language it speaks: `KUMIMOJI_STRINGS.en`, `KUMIMOJI_STRINGS.ja`. */
export const KUMIMOJI_STRINGS: Readonly<Record<KumimojiLocale, KumimojiStrings>> = { en: EN, ja: JA };

/** A line from a table of strings with its braces filled in: `kumimojiSay(strings.left, { n: 12, time: "1:05" })`. A brace with no value is left as it is. */
export function kumimojiSay(line: string, values: Readonly<Record<string, string | number>> = {}): string {
  return line.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}

/** The table of strings for a locale with a page's own words laid over it. An unknown locale is English. */
export function kumimojiStrings(locale: KumimojiLocale | string | undefined, own: Partial<KumimojiStrings> = {}): KumimojiStrings {
  const base = typeof locale === "string" && locale.toLowerCase().startsWith("ja") ? JA : EN;
  return { ...base, ...own };
}
