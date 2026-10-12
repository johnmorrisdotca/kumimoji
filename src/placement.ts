/**
 * WHERE A WORD CAN CROSS A CROSSWORD WITHOUT SPOILING IT: the one rule the
 * generator lays its bags by (`generate.ts`) and the computer player lays its
 * own table by (`computerPlay.ts`), written once.
 *
 * A word laid across or down through a tile already down, with nothing at
 * either end of it and no new tile touching anything at its sides, makes one
 * new run — the word itself — and leaves every other run as it was. So on a
 * grid that was sound, the grid after it is sound too: that is what lets the
 * generator promise every bag can be finished, and what keeps the computer
 * from ever leaving a misspelt table.
 *
 * With DIAGONALS (`diagonalWord`), a new tile may also make or lengthen a
 * diagonal run of three or more (`DIAGONAL_RUN_LEAST`), which is then read
 * too; a word is laid only where each such run is a word, so a sound grid
 * stays sound under that rule as well.
 *
 * Pure, and blind to what the squares are kept in: the caller answers what
 * letter stands at a square (`""` for none) and whether a square may be used
 * at all, so the generator's fixed laying square and the computer's table
 * with no edges ask the same question.
 */
import { DIAGONAL_RUN_LEAST } from "./grid.ts";

/** A square by its row and column.
 *
 * @example
 * ```ts
 * import type { Square } from "@johnmorrisdotca/kumimoji";
 *
 * const value: Square = {row:0,col:0};
 * console.log(value);
 * ```
 */
export type Square = { row: number; col: number };

/** A word's place: its first square, and the squares it lays a new tile on, in the word's order.
 *
 * @example
 * ```ts
 * import type { CrossingFit } from "@johnmorrisdotca/kumimoji";
 *
 * const value: CrossingFit = {first:{row:0,col:0},fresh:[{row:0,col:1},{row:0,col:2}]};
 * console.log(value);
 * ```
 */
export type CrossingFit = { first: Square; fresh: Square[] };

/**
 * Where `word` stands with its letter `at` on the tile at `anchor`, running
 * across or down, or null where it cannot: a square outside what may be used,
 * a tile at either end, a different letter in its way, a new tile with a
 * neighbour at its side, or no new tile at all — and, given `diagonalWord`
 * (a game with Diagonals), a new tile standing in a diagonal run of three or
 * more that `diagonalWord` does not take (`diagonalsRead`).
 *
 * @param letterAt - The tile at a coordinate, or an empty string for no tile.
 * @param inside - Whether a coordinate is within the caller’s working grid.
 * @param word - The encoded word to lay or spell.
 * @param anchor - The existing tile that the word crosses.
 * @param at - The word offset, seat index or date specified by this signature.
 * @param across - Whether to lay or type horizontally rather than vertically.
 * @param diagonalWord - Optional diagonal-word predicate; null disables diagonal checking.
 * @returns Where `word` stands with its letter `at` on the tile at `anchor`, running across or down, or null where it cannot: a square outside what may be used, a tile at either end, a different letter in its way, a new tile with a neighbour at its side, or no new tile at all — and, given `diagonalWord` (a game with Diagonals), a new tile standing in a diagonal run of three or more that `diagonalWord` does not take (`diagonalsRead`).
 * @example
 * ```ts
 * import { crossingFit } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(crossingFit((r,c)=>r===0&&c===0?"c":"",()=>true,"cat",{row:0,col:0},0,true));
 * ```
 */
export function crossingFit(
  letterAt: (row: number, col: number) => string,
  inside: (row: number, col: number) => boolean,
  word: string,
  anchor: Square,
  at: number,
  across: boolean,
  diagonalWord: ((run: string) => boolean) | null = null,
): CrossingFit | null {
  const dr = across ? 0 : 1;
  const dc = across ? 1 : 0;
  const row = anchor.row - at * dr;
  const col = anchor.col - at * dc;
  const length = word.length;
  if (!inside(row, col) || !inside(row + (length - 1) * dr, col + (length - 1) * dc)) return null;
  const taken = (r: number, c: number) => inside(r, c) && letterAt(r, c) !== "";
  if (taken(row - dr, col - dc) || taken(row + length * dr, col + length * dc)) return null;
  const fresh: Square[] = [];
  for (let k = 0; k < length; k += 1) {
    const r = row + k * dr;
    const c = col + k * dc;
    const there = letterAt(r, c);
    if (there !== "") {
      if (there !== word[k]) return null;
      continue;
    }
    // Its sides: above and below a word across, left and right of one down.
    if (taken(r - dc, c - dr) || taken(r + dc, c + dr)) return null;
    fresh.push({ row: r, col: c });
  }
  if (fresh.length === 0) return null;
  if (diagonalWord !== null && !diagonalsRead(letterAt, inside, word, { first: { row, col }, fresh }, diagonalWord)) return null;
  return { first: { row, col }, fresh };
}

/**
 * Whether every diagonal run a laying's new tiles would stand in is taken by
 * `isWord`: each walked from its top end down, with the word's own letters on
 * its new squares. Only a run through a new tile can change, and two new
 * tiles of one word never share a diagonal (they share a row or a column), so
 * each is read on its own. A run of two, a corner touch, is never read.
 *
 * @param letterAt - The tile at a coordinate, or an empty string for no tile.
 * @param inside - Whether a coordinate is within the caller’s working grid.
 * @param word - The encoded word to lay or spell.
 * @param fit - The first coordinate and fresh tile coordinates of the proposed laying.
 * @param isWord - The predicate that accepts a readable word.
 * @returns Whether every diagonal run a laying's new tiles would stand in is taken by `isWord`: each walked from its top end down, with the word's own letters on its new squares. Only a run through a new tile can change, and two new tiles of one word never share a diagonal (they share a row or a column), so each is read on its own. A run of two, a corner touch, is never read.
 * @example
 * ```ts
 * import { loadTileWordsFromModule } from "@johnmorrisdotca/kumimoji/words";
 * import { diagonalsRead } from "@johnmorrisdotca/kumimoji";
 *
 * const words = await loadTileWordsFromModule("english");
 * console.log(diagonalsRead(()=>"",()=>true,"cat",{first:{row:0,col:0},fresh:[{row:0,col:0},{row:0,col:1},{row:0,col:2}]},word=>words.allowed.has(word)));
 * ```
 */
export function diagonalsRead(
  letterAt: (row: number, col: number) => string,
  inside: (row: number, col: number) => boolean,
  word: string,
  fit: CrossingFit,
  isWord: (run: string) => boolean,
): boolean {
  const freshAt = new Map(fit.fresh.map((square) => [`${square.row},${square.col}`, word[(square.row - fit.first.row) + (square.col - fit.first.col)]!]));
  const at = (row: number, col: number): string => (inside(row, col) ? letterAt(row, col) || (freshAt.get(`${row},${col}`) ?? "") : "");
  for (const { row, col } of fit.fresh) {
    for (const lean of [1, -1]) {
      let top = 0;
      while (at(row - top - 1, col - (top + 1) * lean) !== "") top += 1;
      let run = "";
      for (let step = -top; at(row + step, col + step * lean) !== ""; step += 1) run += at(row + step, col + step * lean);
      if (run.length >= DIAGONAL_RUN_LEAST && !isWord(run)) return false;
    }
  }
  return true;
}
