import { describe, expect, it } from "vitest";

import { kumimojiDailySeed, kumimojiDay } from "./daily.ts";
import { generateKumimoji } from "./generate.ts";
import { loadTileWords } from "./tileWords.ts";

describe("the day's seed", () => {
  it("is the date as a number, in UTC", () => {
    expect(kumimojiDay(new Date("2026-10-01T12:00:00Z"))).toBe("2026-10-01");
    expect(kumimojiDailySeed(new Date("2026-10-01T12:00:00Z"))).toBe(20261001);
    expect(kumimojiDailySeed(new Date("2026-09-30T00:00:00Z"))).toBe(20260930);
  });

  it("turns at midnight UTC and not a moment before", () => {
    expect(kumimojiDailySeed(new Date("2026-12-31T23:59:59.999Z"))).toBe(20261231);
    expect(kumimojiDailySeed(new Date("2027-01-01T00:00:00.000Z"))).toBe(20270101);
  });

  it("deals the same bag to everybody on the same day, and another bag the next", async () => {
    await loadTileWords("english");
    const morning = generateKumimoji(7, "medium", kumimojiDailySeed(new Date("2026-10-01T08:00:00Z")));
    const evening = generateKumimoji(7, "medium", kumimojiDailySeed(new Date("2026-10-01T23:00:00Z")));
    const tomorrow = generateKumimoji(7, "medium", kumimojiDailySeed(new Date("2026-10-02T08:00:00Z")));
    expect(evening.givens).toBe(morning.givens);
    expect(tomorrow.givens).not.toBe(morning.givens);
  });

  it("refuses a moment that is not one", () => {
    expect(() => kumimojiDay(new Date("nonsense"))).toThrow(RangeError);
  });
});
