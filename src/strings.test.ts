import { describe, expect, it } from "vitest";

import { KUMIMOJI_STRINGS, kumimojiSay, kumimojiStrings } from "./strings.ts";

const braces = (line: string) => [...line.matchAll(/\{(\w+)\}/g)].map((found) => found[1]).sort();

describe("the words, in English and Japanese", () => {
  it("both languages have every string, and none is empty", () => {
    expect(Object.keys(KUMIMOJI_STRINGS.ja)).toEqual(Object.keys(KUMIMOJI_STRINGS.en));
    for (const table of [KUMIMOJI_STRINGS.en, KUMIMOJI_STRINGS.ja]) {
      for (const [name, line] of Object.entries(table)) expect(line.trim(), name).not.toBe("");
    }
  });

  it("a Japanese line fills the same braces as its English", () => {
    for (const name of Object.keys(KUMIMOJI_STRINGS.en) as (keyof typeof KUMIMOJI_STRINGS.en)[]) expect(braces(KUMIMOJI_STRINGS.ja[name]), name).toEqual(braces(KUMIMOJI_STRINGS.en[name]));
  });

  it("braces are filled in, and one with no value is left", () => {
    expect(kumimojiSay(KUMIMOJI_STRINGS.en.left, { n: 12, time: "1:05" })).toBe("12 tiles left in the bag · 1:05");
    expect(kumimojiSay(KUMIMOJI_STRINGS.ja.left, { n: 12, time: "1:05" })).toBe("袋の残り12枚 · 1:05");
    expect(kumimojiSay("{a} and {b}", { a: 1 })).toBe("1 and {b}");
  });

  it("a locale picks its table, a page's own words lie over it, and anything else is English", () => {
    expect(kumimojiStrings("ja").draw).toBe(KUMIMOJI_STRINGS.ja.draw);
    expect(kumimojiStrings("ja-JP").draw).toBe(KUMIMOJI_STRINGS.ja.draw);
    expect(kumimojiStrings("fr").draw).toBe("Draw");
    expect(kumimojiStrings(undefined).draw).toBe("Draw");
    expect(kumimojiStrings("en", { draw: "Robar" }).draw).toBe("Robar");
    expect(kumimojiStrings("en", { draw: "Robar" }).sort).toBe("Sort");
  });
});
