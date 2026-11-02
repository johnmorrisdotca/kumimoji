import type { KumimojiCheck } from "./kumimoji.types.ts";

/**
 * Why `checkKumimoji` will not take a grid, as a stable code and the English clause it says: `{name}` is a gap the
 * check's `values` fill. The clause is what `reason` has always said, word for word; a site that speaks another
 * language says the code in its own words and puts the values in the gaps.
 *
 * | Code | Values |
 * | --- | --- |
 * | `no-hand` | `size`: the hand that has no game |
 * | `not-a-word` | `word`: the first word that is not in the word list |
 * | `givens-not-bag`, `wild-count-wrong`, `bag-exceeds-set`, `answer-not-grid`, `grid-not-the-bag`, `tiles-apart`, `grid-not-finished` | none |
 *
 * @example
 * ```ts
 * import { KUMIMOJI_CHECK_REASONS } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(KUMIMOJI_CHECK_REASONS["not-a-word"]);
 * ```
 */
export const KUMIMOJI_CHECK_REASONS = {
  "no-hand": "no Kumimoji with a hand of {size}",
  "givens-not-bag": "the givens are not a bag of tiles",
  "wild-count-wrong": "the bag has the wrong number of wild tiles",
  "bag-exceeds-set": "the bag exceeds the tile set",
  "answer-not-grid": "the answer is not a grid",
  "grid-not-the-bag": "the grid does not use exactly the tiles of the bag",
  "tiles-apart": "the tiles are not all joined",
  "not-a-word": "{word} is not in the word list",
  "grid-not-finished": "the grid is not finished",
} as const;

/**
 * A reason `checkKumimoji` can give, by its stable code.
 *
 * @example
 * ```ts
 * import type { KumimojiCheckCode } from "@johnmorrisdotca/kumimoji";
 *
 * const code: KumimojiCheckCode = "tiles-apart";
 * console.log(code);
 * ```
 */
export type KumimojiCheckCode = keyof typeof KUMIMOJI_CHECK_REASONS;

/**
 * The numbers and words that fill a reason's gaps, by the gap's name (see `KUMIMOJI_CHECK_REASONS` for each code's).
 *
 * @example
 * ```ts
 * import type { KumimojiCheckValues } from "@johnmorrisdotca/kumimoji";
 *
 * const values: KumimojiCheckValues = { word: "aow" };
 * console.log(values);
 * ```
 */
export type KumimojiCheckValues = Readonly<Record<string, string | number>>;

/**
 * A refusal: `{ ok: false }`, the English `reason` (the clause of the code with the values in its gaps), the code
 * and the values.
 *
 * @param code - Why the grid is not taken.
 * @param values - What fills the clause's gaps, where it has any.
 * @returns The refusal `checkKumimoji` gives.
 * @example
 * ```ts
 * import { kumimojiRefusal } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(kumimojiRefusal("not-a-word", { word: "aow" }));
 * ```
 */
export function kumimojiRefusal(
  code: KumimojiCheckCode,
  values?: KumimojiCheckValues,
): Extract<KumimojiCheck, { ok: false }> {
  const reason = KUMIMOJI_CHECK_REASONS[code].replace(/\{(\w+)\}/g, (_gap, name: string) => String(values?.[name]));
  return values === undefined ? { ok: false, reason, code } : { ok: false, reason, code, values };
}
