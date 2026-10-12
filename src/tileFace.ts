import { BASE_KANA, CORNER_FORMS } from "./kana.ts";

/**
 * WHAT A TILE CODE SHOWS, without the word list. A bag, a kept game and a
 * finished grid hold one character a tile: an English letter as itself (a wild
 * given a letter is that letter in capitals, a wild with none is `*`), and a
 * Japanese kana as a private-use character, its place in `BASE_KANA` above
 * `KANA_TILE_START`, or above `KANA_WILD_START` for a wild given that kana.
 * So the set-up's preview and a finished game's page draw Japanese tiles
 * without fetching the dictionary, and `tileWords` reads the same codes.
 *
 * @example
 * ```ts
 * import { KANA_TILE_START } from "@johnmorrisdotca/kumimoji";
 * console.log(KANA_TILE_START);
 * ```
 */
export const KANA_TILE_START = 0xe000;
/** Where the codes of wild tiles given a kana begin: the kana's place in `BASE_KANA` above this.
 *
 * @example
 * ```ts
 * import { KANA_WILD_START } from "@johnmorrisdotca/kumimoji";
 * console.log(KANA_WILD_START);
 * ```
 */
export const KANA_WILD_START = 0xf000;

const KANA = [...BASE_KANA];

/** The code of a base kana's tile, or of a wild given that kana.
 *
 * @param kana - The hiragana reading to map to a base tile.
 * @param wild - Whether to encode the assigned face as a wild tile.
 * @returns The internal tile code, or null when the kana has no supported base tile.
 * @example
 * ```ts
 * import { kanaTileCode } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(kanaTileCode("は"));
 * ```
 */
export function kanaTileCode(kana: string, wild = false): string | null {
  const at = KANA.indexOf(kana);
  return at === -1 ? null : String.fromCodePoint((wild ? KANA_WILD_START : KANA_TILE_START) + at);
}

/** What a tile shows: what `tileFace` answers.
 *
 * @example
 * ```ts
 * import type { TileFaceOf } from "@johnmorrisdotca/kumimoji";
 * import { tileFace } from "@johnmorrisdotca/kumimoji";
 *
 * const value: TileFaceOf = tileFace("A");
 * console.log(value);
 * ```
 */
export type TileFaceOf = {
  /** The letter or kana printed on it: 五 on a wild nobody has given one. */
  glyph: string;
  /** The other forms it plays as, small in its corner (`CORNER_FORMS`). */
  forms: string;
  /** Whether it is a wild tile, given a letter or not. */
  wild: boolean;
  /** A wild with no letter yet. */
  blank: boolean;
};

/** What a tile code shows, read without the word list: its letter or kana, its corner forms, and whether it is a wild.
 *
 * @param tile - The internal tile code to describe.
 * @returns What a tile code shows, read without the word list: its letter or kana, its corner forms, and whether it is a wild.
 * @example
 * ```ts
 * import { tileFace } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(tileFace("A"));
 * ```
 */
export function tileFace(tile: string): TileFaceOf {
  if (tile === "*") return { glyph: "五", forms: "", wild: true, blank: true };
  if (/^[A-Z]$/.test(tile)) return { glyph: tile.toLowerCase(), forms: "", wild: true, blank: false };
  const point = tile.length === 1 ? tile.codePointAt(0)! : -1;
  const kana = KANA[point - KANA_TILE_START];
  if (kana !== undefined) return { glyph: kana, forms: CORNER_FORMS[kana] ?? "", wild: false, blank: false };
  const wildKana = KANA[point - KANA_WILD_START];
  if (wildKana !== undefined) return { glyph: wildKana, forms: "", wild: true, blank: false };
  return { glyph: tile, forms: "", wild: false, blank: false };
}

/** What a screen reader says for a tile: its letter, or that it is a wild and what it stands for.
 *
 * @param tile - The internal tile code to describe.
 * @returns What a screen reader says for a tile: its letter, or that it is a wild and what it stands for.
 * @example
 * ```ts
 * import { tileDescription } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(tileDescription("A"));
 * ```
 */
export function tileDescription(tile: string): string {
  const face = tileFace(tile);
  if (face.wild) return `Wild, ${face.blank ? "unassigned" : face.glyph}`;
  return face.glyph.toUpperCase();
}
