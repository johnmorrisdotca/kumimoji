import { boundsOf, squareAt, type Tiles } from "./grid.ts";
import { generateKumimoji } from "./generate.ts";
import { judgeWithWords } from "./judge.ts";
import type { KumimojiDeal, KumimojiLanguage, KumimojiLength, KumimojiLevel } from "./kumimoji.types.ts";
import { decodeTileProgress, encodeTileProgress, isFinished, tilesLeft, type TilePlay } from "./play.ts";
import { KUMIMOJI_STRINGS, kumimojiSay, type KumimojiStrings } from "./strings.ts";
import { tileFace } from "./tileFace.ts";
import { KUMIMOJI_BAG } from "./tiles.constants.ts";
import { loadTileWords, tileWords } from "./tileWords.ts";
import { KUMIMOJI_VERSION } from "./version.ts";

/**
 * A GAME WRITTEN OUT for other programs and for people: JSON that reads back
 * in, and plain text for a chat or a note. Both pure: a game in, a string
 * out. What is done with the string (a file, a clipboard, a server) is the
 * caller's.
 *
 * What is written is how the game was set up, its seed, and where the player
 * has got to; never the bag, which the seed deals again. So `kumimojiFromJSON`
 * trusts nothing in a file: it deals the bag from the seed itself, and opens
 * the game only if every tile in the hand and on the table is one that came
 * out of that bag and was not given back.
 */

/** The shape of the JSON this package writes. It goes up only when a reader of the old shape would be wrong about the new one. */
export const KUMIMOJI_EXPORT_FORMAT = 1;

/** A game alone as it is kept: the deal, where the player has got to, and the time spent so far. */
export type KumimojiSaved = {
  /** The game as dealt: `generateKumimoji`'s. */
  deal: KumimojiDeal;
  /** Where the player has got to. */
  play: TilePlay;
  /** Milliseconds spent on it so far. */
  elapsedMs: number;
};

/** A whole JSON export of one game: what `kumimojiToJSON` writes and `kumimojiFromJSON` reads. */
export type KumimojiExported = {
  /** The shape's number: `KUMIMOJI_EXPORT_FORMAT`. */
  format: typeof KUMIMOJI_EXPORT_FORMAT;
  /** Always `"kumimoji"`, so a file of this shape is not mistaken for another game's. */
  game: "kumimoji";
  /** The package and version that wrote it, such as `"kumimoji 1.1.0"`. For people; never read back. */
  generator: string;
  /** The opening hand: 3, 7 or 11. */
  size: number;
  /** How many of the tiles are wild. */
  level: KumimojiLevel;
  /** The seed the bag is dealt from. */
  seed: number;
  /** The language of the tiles. */
  language: KumimojiLanguage;
  /** How much of the set the bag holds. */
  gameLength: KumimojiLength;
  /** Two English sets at once. */
  doubleSet: boolean;
  /** Whether diagonal runs of three or more must be words too. */
  diagonals: boolean;
  /** Where the player has got to, as `encodeTileProgress` writes it: tiles taken, tiles traded back, the hand, the grid. */
  progress: string;
  /** Milliseconds spent so far. */
  elapsedMs: number;
};

/** A game as the JSON export's object. */
export function kumimojiExported(saved: KumimojiSaved): KumimojiExported {
  const { deal, play } = saved;
  return {
    format: KUMIMOJI_EXPORT_FORMAT,
    game: "kumimoji",
    generator: `kumimoji ${KUMIMOJI_VERSION}`,
    size: deal.size,
    level: deal.level,
    seed: deal.seed,
    language: deal.language,
    gameLength: deal.gameLength,
    doubleSet: deal.doubleSet,
    diagonals: deal.diagonals === true,
    progress: encodeTileProgress(play),
    elapsedMs: Math.max(0, Math.round(saved.elapsedMs)),
  };
}

/** A game as JSON, two spaces deep, with the format's number first. `kumimojiFromJSON` reads it back. */
export function kumimojiToJSON(saved: KumimojiSaved): string {
  return `${JSON.stringify(kumimojiExported(saved), null, 2)}\n`;
}

const LEVELS: readonly string[] = ["easy", "medium", "hard"];
const LENGTHS_KEPT: readonly string[] = ["short", "medium", "full"];
/** The longest progress a game of two full sets could write, with room to spare: anything longer is not read. */
const PROGRESS_MOST = 4000;

/**
 * A game from JSON that `kumimojiToJSON` wrote. Nothing in it is trusted: the
 * bag is dealt again from the seed, and the game opens only if every tile held
 * is one that came out of that bag. Resolves to null when the text is not
 * JSON, is of a later format than this version reads, is another game's, or
 * holds a hand or a grid that this bag never dealt.
 *
 * The word list of the game's language is loaded first, since dealing needs
 * it; where there is no browser, import `@johnmorrisdotca/kumimoji/words`
 * once, or the promise is rejected as `loadTileWords` rejects it.
 */
export async function kumimojiFromJSON(text: string): Promise<KumimojiSaved | null> {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
  const { format, game, size, level, seed, language, gameLength, doubleSet, diagonals, progress, elapsedMs } = data as Record<string, unknown>;
  if (typeof format !== "number" || !Number.isInteger(format) || format < 1 || format > KUMIMOJI_EXPORT_FORMAT) return null;
  if (game !== "kumimoji") return null;
  if (typeof size !== "number" || KUMIMOJI_BAG[size] === undefined) return null;
  if (typeof level !== "string" || !LEVELS.includes(level)) return null;
  if (typeof seed !== "number" || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) return null;
  if (language !== "english" && language !== "japanese") return null;
  if (typeof gameLength !== "string" || !LENGTHS_KEPT.includes(gameLength)) return null;
  if (typeof doubleSet !== "boolean" || typeof diagonals !== "boolean") return null;
  // Two sets are English's alone: the Japanese set is dealt once.
  if (doubleSet && language !== "english") return null;
  if (typeof progress !== "string" || progress.length > PROGRESS_MOST) return null;
  const spent = typeof elapsedMs === "number" && Number.isFinite(elapsedMs) && elapsedMs >= 0 ? elapsedMs : 0;
  await loadTileWords(language);
  let deal: KumimojiDeal;
  try {
    deal = generateKumimoji(size, level as KumimojiLevel, seed, { language, gameLength: gameLength as KumimojiLength, doubleSet, diagonals });
  } catch {
    return null;
  }
  const play = decodeTileProgress(progress, deal.givens, language);
  return play === null ? null : { deal, play, elapsedMs: spent };
}

/** A time as minutes and seconds: `1:05`. */
export function kumimojiClock(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * A grid as lines of text, the way it lies on the table: English letters in
 * capitals with a space between squares and a dot for an empty one, kana side
 * by side with a full-width dot for an empty one, so that either lines up in a
 * fixed-width face, every row as wide as the crossword. A wild that has been given nothing is `*`. No tiles is "".
 */
export function gridToText(tiles: Tiles, language: KumimojiLanguage = "english"): string {
  const bounds = boundsOf(tiles);
  if (bounds === null) return "";
  const kana = language === "japanese";
  const rows: string[] = [];
  for (let row = bounds.top; row <= bounds.bottom; row += 1) {
    const cells: string[] = [];
    for (let col = bounds.left; col <= bounds.right; col += 1) {
      const tile = tiles.get(squareAt(row, col));
      if (tile === undefined) cells.push(kana ? "・" : ".");
      else {
        const face = tileFace(tile);
        cells.push(face.blank ? (kana ? "＊" : "*") : kana ? face.glyph : face.glyph.toUpperCase());
      }
    }
    rows.push(cells.join(kana ? "" : " "));
  }
  return rows.join("\n");
}

/**
 * A game as plain text, for a chat or a note: how it was set up, the
 * crossword as it lies, the hand, how many tiles are left, and the time. In
 * English unless given another table of strings (`KUMIMOJI_STRINGS.ja`). The
 * word list of the game's language must have been loaded, as for any judging.
 * Lines end with a line feed.
 */
export function kumimojiToText(saved: KumimojiSaved, strings: KumimojiStrings = KUMIMOJI_STRINGS.en): string {
  const { deal, play } = saved;
  const words = tileWords(deal.language);
  const face = (tile: string) => (tileFace(tile).blank ? "*" : deal.language === "japanese" ? words.glyphOf(tile) : words.glyphOf(tile).toUpperCase());
  const lines = [kumimojiSay(strings.textTitle, { language: deal.language === "japanese" ? strings.japanese : strings.english, hand: deal.size, seed: deal.seed })];
  lines.push(play.tiles.size === 0 ? strings.textEmpty : gridToText(play.tiles, deal.language));
  if (isFinished(play, judgeWithWords(play.tiles, words, { diagonals: deal.diagonals === true }))) lines.push(strings.textFinished);
  else {
    lines.push(play.hand.length === 0 ? strings.textHandEmpty : kumimojiSay(strings.textHand, { tiles: play.hand.map(face).join(" ") }));
    lines.push(kumimojiSay(strings.textLeft, { n: tilesLeft(play) }));
  }
  lines.push(kumimojiSay(strings.textTime, { time: kumimojiClock(saved.elapsedMs) }));
  return `${lines.join("\n")}\n`;
}
