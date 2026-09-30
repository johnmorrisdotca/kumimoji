import { beforeAll, describe, expect, it } from "vitest";

import { KUMIMOJI_EXPORT_FORMAT, gridToText, kumimojiClock, kumimojiExported, kumimojiFromJSON, kumimojiToJSON, kumimojiToText, type KumimojiSaved } from "./export.ts";
import { generateKumimoji } from "./generate.ts";
import { decodeGrid, squareAt } from "./grid.ts";
import { deal, draw, encodeTileProgress, placeFromHand, trade } from "./play.ts";
import { KUMIMOJI_STRINGS } from "./strings.ts";
import { loadTileWordsFromModule } from "./tileWordsModule.ts";
import { KUMIMOJI_VERSION } from "./version.ts";

beforeAll(async () => {
  await loadTileWordsFromModule("english");
  await loadTileWordsFromModule("japanese");
});

/** The smallest game there is, played to its end: NOW, then SNOW, then SNOWY. */
function snowy(): KumimojiSaved {
  const dealt = generateKumimoji(3, "hard", 44);
  let play = deal(dealt.givens, 3);
  play = placeFromHand(play, 0, squareAt(0, 0));
  play = placeFromHand(play, 1, squareAt(0, 1));
  play = placeFromHand(play, 0, squareAt(0, 2));
  play = placeFromHand(draw(play), 0, squareAt(0, -1));
  play = placeFromHand(draw(play), 0, squareAt(0, 3));
  return { deal: dealt, play, elapsedMs: 65_400 };
}

/** A game half way: a few tiles laid, one traded, from a seed in either language. */
function halfWay(language: "english" | "japanese", diagonals = false): KumimojiSaved {
  const dealt = generateKumimoji(7, "medium", 2026, { language, diagonals });
  let play = deal(dealt.givens, 7);
  play = placeFromHand(play, 0, squareAt(0, 0));
  play = placeFromHand(play, 0, squareAt(0, 1));
  play = trade(play, 0);
  play = placeFromHand(play, 2, squareAt(1, 0));
  return { deal: dealt, play, elapsedMs: 12_000 };
}

describe("a game as JSON", () => {
  it("is the format's number, how the game was set up, and where the player has got to", () => {
    const saved = snowy();
    const data = JSON.parse(kumimojiToJSON(saved));
    expect(data).toEqual({ format: 1, game: "kumimoji", generator: `kumimoji ${KUMIMOJI_VERSION}`, size: 3, level: "hard", seed: 44, language: "english", gameLength: "short", doubleSet: false, diagonals: false, progress: "5:::snowy", elapsedMs: 65400 });
    expect(data.format).toBe(KUMIMOJI_EXPORT_FORMAT);
    expect(Object.keys(data)[0]).toBe("format");
    expect(data).toEqual(kumimojiExported(saved));
    expect(kumimojiToJSON(saved).endsWith("}\n")).toBe(true);
    // The bag is never written: the seed deals it again.
    expect(kumimojiToJSON(saved)).not.toContain(saved.deal.givens);
  });

  it("reads back as the same game, in English and in Japanese, with Diagonals or without", async () => {
    for (const saved of [snowy(), halfWay("english"), halfWay("japanese"), halfWay("english", true)]) {
      const back = (await kumimojiFromJSON(kumimojiToJSON(saved)))!;
      expect(back.deal).toEqual(saved.deal);
      expect(encodeTileProgress(back.play)).toBe(encodeTileProgress(saved.play));
      expect(back.play.bag).toBe(saved.play.bag);
      expect([...back.play.hand]).toEqual([...saved.play.hand]);
      expect(back.elapsedMs).toBe(saved.elapsedMs);
    }
  });

  it("trusts nothing: a hand or a grid this bag never dealt is refused", async () => {
    const data = kumimojiExported(halfWay("english"));
    const with_ = (change: object) => kumimojiFromJSON(JSON.stringify({ ...data, ...change }));
    expect(await with_({})).not.toBeNull();
    // A Q nobody drew, a tile more than was taken, another seed's bag.
    expect(await with_({ progress: data.progress.replace(/:[^:]*$/, ":qqqq") })).toBeNull();
    expect(await with_({ progress: `40${data.progress.slice(data.progress.indexOf(":"))}` })).toBeNull();
    expect(await with_({ seed: data.seed + 1 })).toBeNull();
    expect(await with_({ progress: "not progress" })).toBeNull();
    expect(await with_({ progress: "x".repeat(5000) })).toBeNull();
  });

  it("refuses what is not a game of Kumimoji", async () => {
    const data = kumimojiExported(snowy());
    const with_ = (change: object) => kumimojiFromJSON(JSON.stringify({ ...data, ...change }));
    for (const text of ["", "not json", "null", "[]", "{}", "7"]) expect(await kumimojiFromJSON(text), text).toBeNull();
    expect(await with_({ format: KUMIMOJI_EXPORT_FORMAT + 1 })).toBeNull();
    expect(await with_({ format: "1" })).toBeNull();
    expect(await with_({ format: 0 })).toBeNull();
    expect(await with_({ game: "tenka" })).toBeNull();
    expect(await with_({ game: undefined })).toBeNull();
    expect(await with_({ size: 8 })).toBeNull();
    expect(await with_({ level: "expert" })).toBeNull();
    expect(await with_({ seed: -1 })).toBeNull();
    expect(await with_({ seed: 1.5 })).toBeNull();
    expect(await with_({ seed: "44" })).toBeNull();
    expect(await with_({ language: "french" })).toBeNull();
    expect(await with_({ gameLength: "endless" })).toBeNull();
    expect(await with_({ doubleSet: "yes" })).toBeNull();
    expect(await with_({ diagonals: 1 })).toBeNull();
    expect(await with_({ language: "japanese", doubleSet: true })).toBeNull();
  });

  it("a time that is not one reads as none, and what wrote the file is not read at all", async () => {
    const data = kumimojiExported(snowy());
    expect((await kumimojiFromJSON(JSON.stringify({ ...data, elapsedMs: -5 })))!.elapsedMs).toBe(0);
    expect((await kumimojiFromJSON(JSON.stringify({ ...data, elapsedMs: "long" })))!.elapsedMs).toBe(0);
    expect(await kumimojiFromJSON(JSON.stringify({ ...data, generator: "somebody else" }))).not.toBeNull();
  });
});

describe("a game as text", () => {
  it("is how it was set up, the crossword as it lies, and how it stands", () => {
    expect(kumimojiToText(snowy())).toBe("Kumimoji: English, a hand of 3, seed 44\nS N O W Y\nFinished: every tile laid, every run a word.\nTime: 1:05\n");
    expect(kumimojiToText(snowy(), KUMIMOJI_STRINGS.ja)).toBe("組み文字: 英語、手札3枚、シード 44\nS N O W Y\n完成: すべてのタイルを置き、どの並びも単語になっています。\n時間: 1:05\n");
  });

  it("a game half way shows the hand and what is left in the bag; a wild with no letter is a star", () => {
    const saved = halfWay("english");
    const lines = kumimojiToText(saved).split("\n");
    expect(lines[0]).toBe("Kumimoji: English, a hand of 7, seed 2026");
    expect(lines.at(-4)).toMatch(/^Hand: ([A-Z*] )*[A-Z*]$/);
    expect(lines.at(-3)).toBe(`In the bag: ${saved.play.bag.length + saved.play.returned.length - saved.play.taken}`);
    expect(lines.at(-2)).toBe("Time: 0:12");
    const fresh = { deal: saved.deal, play: deal(saved.deal.givens, 7), elapsedMs: 0 };
    expect(kumimojiToText(fresh).split("\n")[1]).toBe("(no tiles on the table)");
    expect(kumimojiToText({ ...fresh, play: { ...fresh.play, hand: ["*", "a"] } })).toContain("Hand: * A");
  });

  it("kana are written as kana", () => {
    const saved = halfWay("japanese");
    const text = kumimojiToText(saved, KUMIMOJI_STRINGS.ja);
    expect(text.split("\n")[0]).toBe("組み文字: 日本語、手札7枚、シード 2026");
    expect(text).toMatch(/手札: [ぁ-ん*]( [ぁ-ん*])*\n/);
    expect(text).toMatch(/袋の残り: \d+枚\n/);
    expect(text).not.toMatch(/[-]/);
    expect(text).not.toMatch(/\{\w+\}/);
  });
});

describe("a grid as text", () => {
  it("lies as it does on the table, every row as wide as the crossword", () => {
    expect(gridToText(decodeGrid("cat/2o/2w")!)).toBe("C A T\n. . O\n. . W");
    expect(gridToText(new Map())).toBe("");
    expect(gridToText(new Map([[squareAt(-3, 9), "a"]]))).toBe("A");
    // A wild given a letter reads as the letter; one given nothing is a star.
    expect(gridToText(new Map([[squareAt(0, 0), "C"], [squareAt(0, 1), "*"]]))).toBe("C *");
  });

  it("kana stand side by side, with a full-width dot for an empty square", () => {
    const solution = decodeGrid(generateKumimoji(7, "medium", 2026, { language: "japanese" }).solution)!;
    const rows = gridToText(solution, "japanese").split("\n");
    expect(new Set(rows.map((row) => [...row].length)).size).toBe(1);
    expect(rows.join("")).toMatch(/^[ぁ-ん・＊]+$/);
  });
});

describe("the clock", () => {
  it("is minutes and seconds", () => {
    expect(kumimojiClock(0)).toBe("0:00");
    expect(kumimojiClock(65_400)).toBe("1:05");
    expect(kumimojiClock(3_600_000)).toBe("60:00");
    expect(kumimojiClock(-5)).toBe("0:00");
  });
});
