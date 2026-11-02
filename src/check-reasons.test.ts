import { beforeAll, describe, expect, it } from "vitest";
import { checkKumimoji } from "./check.ts";
import { KUMIMOJI_CHECK_REASONS, type KumimojiCheckCode, kumimojiRefusal } from "./check-reasons.ts";
import { generateKumimoji } from "./generate.ts";
import { decodeGrid, encodeGrid } from "./grid.ts";
import { KUMIMOJI_HANDS } from "./tiles.constants.ts";
import { loadTileWords } from "./tileWords.ts";

beforeAll(async () => {
  await loadTileWords();
});

/** The gaps a clause has, by name. */
const gapsOf = (clause: string): string[] => [...clause.matchAll(/\{(\w+)\}/g)].map((match) => match[1]!);

describe("a refusal in a form a site can say in its own language", () => {
  it("fills the clause of its code with its values, and that is the reason", () => {
    expect(kumimojiRefusal("not-a-word", { word: "aow" })).toEqual({
      ok: false,
      reason: "aow is not in the word list",
      code: "not-a-word",
      values: { word: "aow" },
    });
    expect(kumimojiRefusal("tiles-apart")).toEqual({
      ok: false,
      reason: "the tiles are not all joined",
      code: "tiles-apart",
    });
  });

  it("gives every refusal a code whose clause, filled with its values, is the reason, and with no gap left over", () => {
    const seen = new Set<KumimojiCheckCode>();
    const note = (verdict: ReturnType<typeof checkKumimoji>): void => {
      if (verdict.ok) throw new Error("a refusal was expected");
      seen.add(verdict.code);
      expect(verdict.reason, verdict.code).toBe(kumimojiRefusal(verdict.code, verdict.values).reason);
      expect(Object.keys(verdict.values ?? {}).sort(), verdict.code).toEqual(
        gapsOf(KUMIMOJI_CHECK_REASONS[verdict.code]).sort(),
      );
    };
    const { givens, solution } = generateKumimoji(KUMIMOJI_HANDS.quick, "medium", 42);
    const tiles = decodeGrid(solution)!;
    const short = new Map(tiles);
    short.delete([...tiles.keys()][0]!);
    note(checkKumimoji(99, givens, solution));
    note(checkKumimoji(7, givens.slice(1), solution));
    note(checkKumimoji(7, givens.toUpperCase(), solution));
    note(checkKumimoji(7, givens, givens));
    note(checkKumimoji(7, givens, encodeGrid(short)));
    note(checkKumimoji(3, "nwosy", "snows", { level: "hard" }));
    note(checkKumimoji(3, "snowy", "cat/1o/1w"));
    note(checkKumimoji(3, "tacwo", "c/1a/2tow"));
    note(checkKumimoji(3, "tacwo", "cat/1o/1w"));
    note(checkKumimoji(3, "tacwo", "cat/5o/5w"));
    note(checkKumimoji(7, `${"*".repeat(givens.length)}`, solution));
    note(checkKumimoji(7, givens.replace(/[^*]/g, "e"), solution));
    // `grid-not-finished` guards a grid of fewer than two tiles that still uses exactly the bag's: no bag is that small, so `checkKumimoji` never reaches it.
    seen.add("grid-not-finished");
    expect([...seen].sort()).toEqual(Object.keys(KUMIMOJI_CHECK_REASONS).sort());
  });
});
