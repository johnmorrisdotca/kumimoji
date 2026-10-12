import { judgeGrid, type GridRules, type GridVerdict, type Tiles } from "./grid.ts";
import type { TileWords } from "./tileWords.ts";
import { readWilds } from "./wilds.ts";

/**
 * A GRID JUDGED AGAINST ITS LANGUAGE'S LIST, the one way the solo game, each
 * seat of a pass-and-play game and the server's check all ask it: a run is a
 * word when its tiles spell one the list holds (`wordOf`, so a wild reads as
 * the letter or kana it was given), and a run that is not is named as it
 * reads. A wild given no letter reads as whichever letter makes every run
 * through it a word (`readWilds`); where none does, the grid is judged as
 * laid and the run is named with its `*`. `rules` says whether the diagonals
 * are read (`GridRules`).
 *
 * @param tiles - The map from row,column square names to internal tile codes.
 * @param words - The loaded native language word list and tile mappings.
 * @param rules - Whether diagonal runs are also judged.
 * @returns A GRID JUDGED AGAINST ITS LANGUAGE'S LIST, the one way the solo game, each seat of a pass-and-play game and the server's check all ask it: a run is a word when its tiles spell one the list holds (`wordOf`, so a wild reads as the letter or kana it was given), and a run that is not is named as it reads. A wild given no letter reads as whichever letter makes every run through it a word (`readWilds`); where none does, the grid is judged as laid and the run is named with its `*`. `rules` says whether the diagonals are read (`GridRules`).
 * @example
 * ```ts
 * import { loadTileWordsFromModule } from "@johnmorrisdotca/kumimoji/words";
 * import { judgeWithWords } from "@johnmorrisdotca/kumimoji";
 *
 * const words = await loadTileWordsFromModule("english");
 * const tiles = new Map([["0,0","c"],["0,1","a"],["0,2","t"]]);
 * console.log(judgeWithWords(tiles,words));
 * ```
 */
export function judgeWithWords(tiles: Tiles, words: TileWords, rules: GridRules = {}): GridVerdict {
  const read = readWilds(tiles, words, rules) ?? tiles;
  return judgeGrid(
    read,
    (codes) => {
      const word = words.wordOf(codes);
      return word !== null && words.allowed.has(word);
    },
    (codes) => words.wordOf(codes) ?? codes,
    rules,
  );
}
