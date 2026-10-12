import { decodeGrid, encodeGrid, lettersOf, sameLetters, type GridVerdict, type Tiles } from "./grid.ts";
import { tileFace } from "./tileFace.ts";
import { KUMIMOJI_DRAW, KUMIMOJI_TRADE } from "./tiles.constants.ts";
import { tileWords } from "./tileWords.ts";

/**
 * A KUMIMOJI BEING PLAYED: the bag, the tiles traded back into it, how many
 * have been taken out, the tiles on the table and the hand. Every move is a
 * function that returns a new state and leaves the one it was given alone,
 * the way the engine's moves are. Nothing here knows how the table is being
 * looked at — zoom and pan are the view's (`tableView.ts`), never the game's.
 *
 * THE BAG IS A LINE, not a heap. Its tiles come out in the order the seed dealt
 * them (`givens`), and a tile traded back joins the END of the line, so the
 * tiles still to come are always `bag + returned` from `taken` on. That keeps
 * a game the same for everybody at a seed, trades and all, and lets a kept
 * game be checked: what is held — hand and table — is exactly what was taken,
 * less what was given back.
 *
 * @example
 * ```ts
 * import { deal } from "@johnmorrisdotca/kumimoji";
 * import type { TilePlay } from "@johnmorrisdotca/kumimoji";
 *
 * const play = deal("catdog",3);
 * const value: TilePlay = play;
 * console.log(value);
 * ```
 */
export type TilePlay = {
  /** The tiles in the order they come out: the puzzle's givens. */
  bag: string;
  /** Tiles traded back, in order; they come out after the bag. */
  returned: string;
  /** How many tiles have been taken from `bag + returned`. */
  taken: number;
  /** The tiles on the table, by square ("row,col"). */
  tiles: Tiles;
  /** The hand, in the order the player keeps it. */
  hand: readonly string[];
};

/** The opening hand: the first `handSize` tiles of the bag, and an empty table.
 *
 * @param bag - The original bag in draw order.
 * @param handSize - The initial number of tiles to draw.
 * @returns The opening hand: the first `handSize` tiles of the bag, and an empty table.
 * @example
 * ```ts
 * import { deal } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(deal("catdog",3));
 * ```
 */
export function deal(bag: string, handSize: number): TilePlay {
  const taken = Math.min(handSize, bag.length);
  return { bag, returned: "", taken, tiles: new Map(), hand: [...bag.slice(0, taken)] };
}

/** How many tiles are still in the bag.
 *
 * @param play - The current immutable solo-game progress.
 * @returns How many tiles are still in the bag.
 * @example
 * ```ts
 * import { deal, tilesLeft } from "@johnmorrisdotca/kumimoji";
 *
 * const play = deal("catdog",3);
 * console.log(tilesLeft(play));
 * ```
 */
export function tilesLeft(play: TilePlay): number {
  return play.bag.length + play.returned.length - play.taken;
}

function withTiles(play: TilePlay, change: (tiles: Map<string, string>) => void): Map<string, string> {
  const tiles = new Map(play.tiles);
  change(tiles);
  return tiles;
}

/** A tile from the hand onto an empty square.
 *
 * @param play - The current immutable solo-game progress.
 * @param handAt - The zero-based index of a tile in hand.
 * @param square - The row,column square name.
 * @returns A tile from the hand onto an empty square.
 * @example
 * ```ts
 * import { deal, placeFromHand } from "@johnmorrisdotca/kumimoji";
 *
 * const tiles = new Map([["0,0","c"],["0,1","a"],["0,2","t"]]);
 * const play = deal("catdog",3);
 * console.log(placeFromHand(play,0,"0,0").tiles.size);
 * ```
 */
export function placeFromHand(play: TilePlay, handAt: number, square: string): TilePlay {
  const letter = play.hand[handAt];
  if (letter === undefined || play.tiles.has(square)) return play;
  return { ...play, tiles: withTiles(play, (tiles) => tiles.set(square, letter)), hand: play.hand.filter((_, at) => at !== handAt) };
}

/** Give a hand tile its chosen reading, without changing which physical tile it is.
 *
 * @param play - The current immutable solo-game progress.
 * @param handAt - The zero-based index of a tile in hand.
 * @param face - The visible reading to assign to a wild tile.
 * @returns Give a hand tile its chosen reading, without changing which physical tile it is.
 * @example
 * ```ts
 * import { assignHandTile, deal } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(assignHandTile(deal("*atdog",3),0,"c").hand);
 * ```
 */
export function assignHandTile(play: TilePlay, handAt: number, face: string): TilePlay {
  if (play.hand[handAt] === undefined || face.length !== 1) return play;
  const hand = [...play.hand];
  hand[handAt] = face;
  return { ...play, hand };
}

/** Give a tile on the table its chosen reading, without changing its square.
 *
 * @param play - The current immutable solo-game progress.
 * @param square - The row,column square name.
 * @param face - The visible reading to assign to a wild tile.
 * @returns Give a tile on the table its chosen reading, without changing its square.
 * @example
 * ```ts
 * import { assignTableTile, deal, placeFromHand } from "@johnmorrisdotca/kumimoji";
 *
 * const tiles = new Map([["0,0","c"],["0,1","a"],["0,2","t"]]);
 * console.log(assignTableTile(placeFromHand(deal("*atdog",3),0,"0,0"),"0,0","c").tiles);
 * ```
 */
export function assignTableTile(play: TilePlay, square: string, face: string): TilePlay {
  if (!play.tiles.has(square) || face.length !== 1) return play;
  return { ...play, tiles: withTiles(play, (tiles) => tiles.set(square, face)) };
}

/** A tile on the table to another square: to an empty one it moves, onto a tile the two change places.
 *
 * @param play - The current immutable solo-game progress.
 * @param from - The source square or seat index.
 * @param to - The destination square.
 * @returns A tile on the table to another square: to an empty one it moves, onto a tile the two change places.
 * @example
 * ```ts
 * import { deal, moveOnTable, placeFromHand } from "@johnmorrisdotca/kumimoji";
 *
 * const tiles = new Map([["0,0","c"],["0,1","a"],["0,2","t"]]);
 * const laid = placeFromHand(deal("catdog",3),0,"0,0");
 * console.log(moveOnTable(laid,"0,0","1,0").tiles);
 * ```
 */
export function moveOnTable(play: TilePlay, from: string, to: string): TilePlay {
  const moving = play.tiles.get(from);
  if (from === to || moving === undefined) return play;
  const there = play.tiles.get(to);
  return {
    ...play,
    tiles: withTiles(play, (tiles) => {
      tiles.delete(from);
      if (there !== undefined) tiles.set(from, there);
      tiles.set(to, moving);
    }),
  };
}

/** A tile from the hand onto a square that holds one: they change places, the table's tile going to the hand where the other was.
 *
 * @param play - The current immutable solo-game progress.
 * @param handAt - The zero-based index of a tile in hand.
 * @param square - The row,column square name.
 * @returns A tile from the hand onto a square that holds one: they change places, the table's tile going to the hand where the other was.
 * @example
 * ```ts
 * import { deal, placeFromHand, swapWithHand } from "@johnmorrisdotca/kumimoji";
 *
 * const laid = placeFromHand(deal("catdog",3),0,"0,0");
 * console.log(swapWithHand(laid,0,"0,0").hand);
 * ```
 */
export function swapWithHand(play: TilePlay, handAt: number, square: string): TilePlay {
  const letter = play.hand[handAt];
  const lifted = play.tiles.get(square);
  if (letter === undefined || lifted === undefined) return play;
  const hand = [...play.hand];
  hand[handAt] = lifted;
  return { ...play, tiles: withTiles(play, (tiles) => tiles.set(square, letter)), hand };
}

/** A tile on the table back to the end of the hand.
 *
 * @param play - The current immutable solo-game progress.
 * @param square - The row,column square name.
 * @returns A tile on the table back to the end of the hand.
 * @example
 * ```ts
 * import { deal, liftToHand, placeFromHand } from "@johnmorrisdotca/kumimoji";
 *
 * const laid = placeFromHand(deal("catdog",3),0,"0,0");
 * console.log(liftToHand(laid,"0,0").hand);
 * ```
 */
export function liftToHand(play: TilePlay, square: string): TilePlay {
  const letter = play.tiles.get(square);
  if (letter === undefined) return play;
  return { ...play, tiles: withTiles(play, (tiles) => tiles.delete(square)), hand: [...play.hand, letter] };
}

/** Every tile on the table back to the hand.
 *
 * @param play - The current immutable solo-game progress.
 * @returns Every tile on the table back to the hand.
 * @example
 * ```ts
 * import { deal, liftAll, placeFromHand } from "@johnmorrisdotca/kumimoji";
 *
 * const laid = placeFromHand(deal("catdog",3),0,"0,0");
 * console.log(liftAll(laid).hand);
 * ```
 */
export function liftAll(play: TilePlay): TilePlay {
  return { ...play, tiles: new Map(), hand: [...play.hand, ...play.tiles.values()] };
}

/**
 * The hand in order (John, 2026-09-28: "it gets sorted for letters
 * alphabetically"): English A to Z, Japanese あいうえお, which is the order
 * of the kana's tile codes, and the wilds last as they came.
 *
 * @param play - The current immutable solo-game progress.
 * @returns The hand in order (John, 2026-09-28: "it gets sorted for letters alphabetically"): English A to Z, Japanese あいうえお, which is the order of the kana's tile codes, and the wilds last as they came.
 * @example
 * ```ts
 * import { deal, sortHand } from "@johnmorrisdotca/kumimoji";
 *
 * const play = deal("catdog",3);
 * console.log(sortHand(play).hand);
 * ```
 */
export function sortHand(play: TilePlay): TilePlay {
  const hand = [...play.hand].sort((a, b) => Number(tileFace(a).wild) - Number(tileFace(b).wild) || (tileFace(a).wild ? 0 : a < b ? -1 : a > b ? 1 : 0));
  return { ...play, hand };
}

/** Whether Draw may be pressed: the hand used, the grid sound, and a tile left to draw.
 *
 * @param play - The current immutable solo-game progress.
 * @param verdict - The native word and connectivity verdict for this grid.
 * @returns Whether Draw may be pressed: the hand used, the grid sound, and a tile left to draw.
 * @example
 * ```ts
 * import { loadTileWordsFromModule } from "@johnmorrisdotca/kumimoji/words";
 * import { deal, judgeWithWords, mayDraw } from "@johnmorrisdotca/kumimoji";
 *
 * const words = await loadTileWordsFromModule("english");
 * const play = deal("catdog",3);
 * const verdict = judgeWithWords(new Map([["0,0","c"],["0,1","a"],["0,2","t"]]),words);
 * console.log(mayDraw(play,verdict));
 * ```
 */
export function mayDraw(play: TilePlay, verdict: GridVerdict): boolean {
  return play.hand.length === 0 && verdict.sound && tilesLeft(play) > 0;
}

/** The next tile or tiles out of the bag into the hand.
 *
 * @param play - The current immutable solo-game progress.
 * @param count - The number of tiles to draw.
 * @returns The next tile or tiles out of the bag into the hand.
 * @example
 * ```ts
 * import { deal, draw } from "@johnmorrisdotca/kumimoji";
 *
 * const play = deal("catdog",3);
 * console.log(draw(play,1).hand);
 * ```
 */
export function draw(play: TilePlay, count: number = KUMIMOJI_DRAW): TilePlay {
  const coming = (play.bag + play.returned).slice(play.taken, play.taken + count);
  if (coming.length === 0) return play;
  return { ...play, taken: play.taken + coming.length, hand: [...play.hand, ...coming] };
}

/** Whether a trade may be made: the bag holds as many as a trade takes.
 *
 * @param play - The current immutable solo-game progress.
 * @returns Whether a trade may be made: the bag holds as many as a trade takes.
 * @example
 * ```ts
 * import { deal, mayTrade } from "@johnmorrisdotca/kumimoji";
 *
 * const play = deal("catdog",3);
 * console.log(mayTrade(play));
 * ```
 */
export function mayTrade(play: TilePlay): boolean {
  return tilesLeft(play) >= KUMIMOJI_TRADE.take;
}

/** One tile from the hand to the bottom of the bag, and the next three out of it.
 *
 * @param play - The current immutable solo-game progress.
 * @param handAt - The zero-based index of a tile in hand.
 * @returns One tile from the hand to the bottom of the bag, and the next three out of it.
 * @example
 * ```ts
 * import { deal, trade } from "@johnmorrisdotca/kumimoji";
 *
 * const play = deal("catdog",3);
 * console.log(trade(play,0).hand);
 * ```
 */
export function trade(play: TilePlay, handAt: number): TilePlay {
  const letter = play.hand[handAt];
  if (letter === undefined || !mayTrade(play)) return play;
  const returned = play.returned + letter;
  const coming = (play.bag + returned).slice(play.taken, play.taken + KUMIMOJI_TRADE.take);
  return { ...play, returned, taken: play.taken + coming.length, hand: [...play.hand.filter((_, at) => at !== handAt), ...coming] };
}

/** Whether the game is over: the bag empty, the hand used, and the grid sound.
 *
 * @param play - The current immutable solo-game progress.
 * @param verdict - The native word and connectivity verdict for this grid.
 * @returns Whether the game is over: the bag empty, the hand used, and the grid sound.
 * @example
 * ```ts
 * import { loadTileWordsFromModule } from "@johnmorrisdotca/kumimoji/words";
 * import { deal, isFinished, judgeWithWords } from "@johnmorrisdotca/kumimoji";
 *
 * const words = await loadTileWordsFromModule("english");
 * const play = deal("catdog",3);
 * const verdict = judgeWithWords(new Map([["0,0","c"],["0,1","a"],["0,2","t"]]),words);
 * console.log(isFinished(play,verdict));
 * ```
 */
export function isFinished(play: TilePlay, verdict: GridVerdict): boolean {
  return play.hand.length === 0 && tilesLeft(play) === 0 && verdict.sound;
}

/**
 * A GAME KEPT half way, as one string (`PuzzleRun.progress`): how many tiles
 * were taken, the tiles traded back, the hand in its order and the grid
 * (`encodeGrid`), as `12:q:ae:cat/2o/2w`. The bag is the puzzle's own, from
 * its seed, so it is not written again, and where on the table the grid stood
 * is the view's and not kept.
 *
 * @param play - The current immutable solo-game progress.
 * @returns A GAME KEPT half way, as one string (`PuzzleRun.progress`): how many tiles were taken, the tiles traded back, the hand in its order and the grid (`encodeGrid`), as `12:q:ae:cat/2o/2w`. The bag is the puzzle's own, from its seed, so it is not written again, and where on the table the grid stood is the view's and not kept.
 * @example
 * ```ts
 * import { deal, encodeTileProgress } from "@johnmorrisdotca/kumimoji";
 *
 * const play = deal("catdog",3);
 * console.log(encodeTileProgress(play));
 * ```
 */
export function encodeTileProgress(play: TilePlay): string {
  return `${play.taken}:${play.returned}:${play.hand.join("")}:${encodeGrid(play.tiles)}`;
}

/** The parts of a kept game, or null for a string that is not one: its shape only, with no bag to check it against.
 *
 * @param code - The encoded grid or progress text.
 * @returns The parts of a kept game, or null for a string that is not one: its shape only, with no bag to check it against.
 * @example
 * ```ts
 * import { deal, encodeTileProgress, readTileProgress } from "@johnmorrisdotca/kumimoji";
 *
 * const play = deal("catdog",3);
 * console.log(readTileProgress(encodeTileProgress(play)));
 * ```
 */
export function readTileProgress(code: string): { taken: number; returned: string; hand: string[]; tiles: Map<string, string> } | null {
  const parts = code.split(":");
  if (parts.length !== 4) return null;
  const [takenText, returned, hand, grid] = parts as [string, string, string, string];
  if (!/^\d{1,3}$/.test(takenText) || !/^[a-zA-Z*\uE000-\uF8FF]*$/.test(returned) || !/^[a-zA-Z*\uE000-\uF8FF]*$/.test(hand)) return null;
  const tiles = decodeGrid(grid);
  if (tiles === null) return null;
  return { taken: Number(takenText), returned, hand: [...hand], tiles };
}

/**
 * A kept game opened again on its own bag, or null where it does not belong
 * to it: every tile held — hand and table — must be one taken from the bag
 * and not given back. Null opens the game fresh rather than on a grid that
 * never came out of this bag.
 *
 * @param code - The encoded grid or progress text.
 * @param bag - The original bag in draw order.
 * @param language - The English or Japanese tile language.
 * @returns A kept game opened again on its own bag, or null where it does not belong to it: every tile held — hand and table — must be one taken from the bag and not given back. Null opens the game fresh rather than on a grid that never came out of this bag.
 * @example
 * ```ts
 * import { deal, decodeTileProgress, encodeTileProgress } from "@johnmorrisdotca/kumimoji";
 * import { loadTileWordsFromModule } from "@johnmorrisdotca/kumimoji/words";
 *
 * await loadTileWordsFromModule("english");
 * const play = deal("catdog",3);
 * const bag = "catdogsun";
 * console.log(decodeTileProgress(encodeTileProgress(play),play.bag));
 * ```
 */
export function decodeTileProgress(code: string, bag: string, language: "english" | "japanese" = "english"): TilePlay | null {
  const read = readTileProgress(code);
  if (read === null) return null;
  const words = tileWords(language);
  const line = bag + read.returned;
  if (read.taken > line.length) return null;
  const held = lettersOf([...line.slice(0, read.taken)].map(words.familyKey).filter((tile): tile is string => tile !== null));
  for (const tile of read.returned) {
    const identity = words.familyKey(tile);
    if (identity === null) return null;
    held.set(identity, (held.get(identity) ?? 0) - 1);
  }
  for (const [tile, count] of held) if (count === 0) held.delete(tile);
  const played = [...read.hand, ...read.tiles.values()].map(words.familyKey);
  if (played.some((tile) => tile === null) || !sameLetters(held, lettersOf(played as string[]))) return null;
  return { bag, returned: read.returned, taken: read.taken, tiles: read.tiles, hand: read.hand };
}
