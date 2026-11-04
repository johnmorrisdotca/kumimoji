import { beforeAll, describe, expect, it } from "vitest";

import { tileKana } from "./kana.ts";
import { loadTileWordsFromModule } from "./tileWordsModule.ts";

/**
 * CHILDREN PLAY THIS GAME, so the Japanese list leaves out the readings that are not for them. Kotoba writes the list
 * (scripts/word-lists-ja.mjs) with its one children bar (scripts/children-bar.mjs): a reading is out when every
 * JMdict entry that spells it is vulgar, X-rated, sensitive or derogatory on its first sense, or its first sense names
 * a sex act, a sex organ or the sex trade, or it is on the short list of readings obscene in themselves. A word that
 * only mentions sex (性別, 異性, 共学) is never out. The tiles fold ば and ぱ onto は and ゃ onto や, so a word is looked up as the line it plays.
 */
let allowed: ReadonlySet<string>;

beforeAll(async () => {
  allowed = (await loadTileWordsFromModule("japanese")).allowed;
});

/** A reading as the tiles play it. */
const played = (reading: string) => [...reading].map((kana) => tileKana(kana)).join("");

describe("the Japanese word list and the bar on what is not for children", () => {
  it.each([
    "せっくす",
    "ばいしゅん",
    "ぽるの",
    "えろい",
    "おなに",
    "ちくび",
    "ふぇらちお",
    "せいどれい",
    "いんらん",
    "ちんぽ",
    "まんこ",
    "うんこ",
    "おっぱい",
    "ちんこ",
    "らぶほてる",
    "ほもび",
  ])("holds %s out", (reading) => {
    expect(allowed.has(played(reading)), reading).toBe(false);
  });

  it("keeps ordinary words, among them those that only look like a barred one", () => {
    for (const reading of ["いぬ", "さくら", "おんな", "がっこう", "ばか", "ぱんつ", "せいし"])
      expect(allowed.has(played(reading)), reading).toBe(true);
  });

  it("keeps the ordinary words that only mention sex, a building or a mixture", () => {
    for (const reading of [
      "せいべつ",
      "いせい",
      "どうせい",
      "きょうがく",
      "せいきょういく",
      "こんりゅう",
      "まぜもの",
      "そうにゅう",
      "ふじゅん",
      "あいじん",
      "なのはな",
      "ばんこ",
    ])
      expect(allowed.has(played(reading)), reading).toBe(true);
  });

  it("holds out a line an ordinary word also spells when its reading is obscene: れいぷ plays the tiles of れいふ, 霊符 (a charm)", () => {
    expect(played("れいぷ")).toBe(played("れいふ"));
    expect(allowed.has(played("れいふ"))).toBe(false);
    expect(allowed.has(played("まんこ"))).toBe(false);
  });
});
