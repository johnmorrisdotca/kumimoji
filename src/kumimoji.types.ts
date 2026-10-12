/** How much of the set a game's bag holds: a short game, half the set, or all of it.
 *
 * @example
 * ```ts
 * import type { KumimojiLength } from "@johnmorrisdotca/kumimoji";
 *
 * const value: KumimojiLength = "short";
 * console.log(value);
 * ```
 */
export type KumimojiLength = "short" | "medium" | "full";
/** How many of the bag's tiles are wild: easy the most, hard none (`KUMIMOJI_WILDS`).
 *
 * @example
 * ```ts
 * import type { KumimojiLevel } from "@johnmorrisdotca/kumimoji";
 *
 * const value: KumimojiLevel = "hard";
 * console.log(value);
 * ```
 */
export type KumimojiLevel = "easy" | "medium" | "hard";
/** The language of the tiles and of the word list they are judged by.
 *
 * @example
 * ```ts
 * import type { KumimojiLanguage } from "@johnmorrisdotca/kumimoji";
 *
 * const value: KumimojiLanguage = "japanese";
 * console.log(value);
 * ```
 */
export type KumimojiLanguage = "english" | "japanese";

/** How far the player has turned the table to look at it: quarter turns clockwise, 0 to 3. The view alone; the grid never turns.
 *
 * @example
 * ```ts
 * import type { Turn } from "@johnmorrisdotca/kumimoji";
 *
 * const value: Turn = 1;
 * console.log(value);
 * ```
 */
export type Turn = 0 | 1 | 2 | 3;

/**
 * WHAT A KUMIMOJI WAS SET UP AS, beyond its hand and level: the choices that
 * make one game a different game from another at the same seed, carried
 * together wherever a game is made, checked, kept or raced. Each is optional,
 * and its absence is the default: Short, English, one set, no diagonals.
 *
 * @example
 * ```ts
 * import type { KumimojiOptions } from "@johnmorrisdotca/kumimoji";
 *
 * const value: KumimojiOptions = {language:"english",diagonals:false};
 * console.log(value);
 * ```
 */
export type KumimojiOptions = {
  gameLength?: KumimojiLength;
  doubleSet?: boolean;
  language?: KumimojiLanguage;
  /**
   * Diagonals (John, 2026-09-28: "we could allow people to play diagonally…
   * An option at startup is the right choice"): every diagonal run of three
   * or more tiles, read top to bottom, must be a word too, and joins its
   * tiles as a word across or down does (`judgeGrid`). Off by default.
   */
  diagonals?: boolean;
};

/** The answer to "does this grid finish the game?": yes, or no and why.
 *
 * @example
 * ```ts
 * import type { KumimojiCheck } from "@johnmorrisdotca/kumimoji";
 *
 * const value: KumimojiCheck = {ok:false,reason:"Not a finished grid"};
 * console.log(value);
 * ```
 */
export type KumimojiCheck = { ok: true } | { ok: false; reason: string };

/**
 * A GAME DEALT (`generateKumimoji`): the bag, in the order its tiles come out,
 * as one string of tile codes (`*` a wild), and one finished grid of those
 * tiles that proves the bag can be finished, never shown to the player.
 *
 * @example
 * ```ts
 * import { generateKumimoji } from "@johnmorrisdotca/kumimoji";
 * import type { KumimojiDeal } from "@johnmorrisdotca/kumimoji";
 * import { loadTileWordsFromModule } from "@johnmorrisdotca/kumimoji/words";
 *
 * await loadTileWordsFromModule("english");
 * const dealt = generateKumimoji(3,"hard",44);
 * const value: KumimojiDeal = dealt;
 * console.log(value);
 * ```
 */
export type KumimojiDeal = {
  kind: "kumimoji";
  /** The opening hand: 3, 7 or 11 tiles (`KUMIMOJI_HANDS`). */
  size: number;
  level: KumimojiLevel;
  seed: number;
  givens: string;
  solution: string;
  gameLength: KumimojiLength;
  doubleSet: boolean;
  language: KumimojiLanguage;
  diagonals?: boolean;
};
