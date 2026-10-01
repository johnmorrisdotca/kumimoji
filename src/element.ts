import { kumimojiDailySeed } from "./daily.ts";
import type { KumimojiLanguage, KumimojiLength, KumimojiLevel } from "./kumimoji.types.ts";
import { KUMIMOJI_HANDS } from "./tiles.constants.ts";
import { mountKumimoji, type KumimojiTableHandle } from "./ui/mount.ts";
import type { KumimojiSaved } from "./export.ts";

const ElementBase: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined => (allowed.includes(value as T) ? (value as T) : undefined);
const isOn = (value: string | null): boolean => value !== null && ["true", "on", "1", "yes"].includes(value.toLowerCase());
const HANDS: readonly number[] = Object.values(KUMIMOJI_HANDS);

/**
 * THE `<kumimoji-table>` ELEMENT: a game of Kumimoji alone in a tag, with no
 * framework. `@johnmorrisdotca/kumimoji/element/define` defines it; this entry
 * holds the class alone, to extend or to define under another name. Safe to
 * import on a server, where there is no page: the class then extends nothing.
 *
 * ```html
 * <kumimoji-table language="english" hand="7" seed="2026"></kumimoji-table>
 * <kumimoji-table language="japanese" level="easy" seed="daily"></kumimoji-table>
 * ```
 *
 * Attributes (each is read again when it changes; a change to any but `lang`
 * deals a new game):
 *  - `language`: the tiles, `english` (default) or `japanese` kana.
 *  - `hand`: the opening hand, 3, 7 (default) or 11.
 *  - `level`: how many tiles are wild, `easy` (most), `medium` (default) or `hard` (none).
 *  - `length`: how much of the set the bag holds, `short` (default), `medium` or `full`.
 *  - `diagonals`: `on` to read every diagonal run of three or more too.
 *  - `seed`: a whole number to deal from, or `daily` for the day's seed (`kumimojiDailySeed`); a new one if left out.
 *  - `lang`: the language of the table's words, `en` or `ja`, or the page's. `keep`: `off` to leave saving and loading out.
 *
 * It fires `kumimoji-change` after every change to the game, with the game as it would
 * be saved as `event.detail.saved`, and `kumimoji-finish` when the last tile is laid and every run
 * is a word, with `event.detail` the deal, the play and the time it took. It has the methods
 * `newGame()` and `setGame()`. A table the rules do not offer (a hand of 5, say) draws nothing.
 */
export class KumimojiTable extends ElementBase {
  static observedAttributes = ["language", "hand", "level", "length", "diagonals", "seed", "lang", "keep"];

  #table: KumimojiTableHandle | null = null;
  #key = "";
  #queued = false;
  #seed: number | null = null;

  connectedCallback(): void {
    this.#refresh();
  }

  disconnectedCallback(): void {
    this.#table?.destroy();
    this.#table = null;
    this.#key = "";
  }

  attributeChangedCallback(): void {
    if (!this.isConnected || this.#queued) return;
    this.#queued = true;
    queueMicrotask(() => {
      this.#queued = false;
      this.#refresh();
    });
  }

  /** The mounted table's handle (`mountKumimoji`), or null while the attributes name no table the rules offer. */
  get table(): KumimojiTableHandle | null {
    return this.#table;
  }

  /** The game as it would be saved, or null while there is none (or it is still being dealt). */
  get saved(): KumimojiSaved | null {
    return this.#table?.saved() ?? null;
  }

  /** A new game at the same table: see `KumimojiTableHandle.newGame`. */
  newGame(options?: Parameters<KumimojiTableHandle["newGame"]>[0]): Promise<void> {
    return this.#table?.newGame(options) ?? Promise.resolve();
  }

  /** Put a game on the table: see `KumimojiTableHandle.setGame`. */
  setGame(saved: KumimojiSaved): Promise<void> {
    return this.#table?.setGame(saved) ?? Promise.resolve();
  }

  #refresh(): void {
    const language: KumimojiLanguage | undefined = oneOf(this.getAttribute("language"), ["english", "japanese"] as const);
    const handAttribute = this.getAttribute("hand");
    const hand = handAttribute === null ? undefined : Number(handAttribute);
    const level: KumimojiLevel | undefined = oneOf(this.getAttribute("level"), ["easy", "medium", "hard"] as const);
    const gameLength: KumimojiLength | undefined = oneOf(this.getAttribute("length"), ["short", "medium", "full"] as const);
    const diagonals = isOn(this.getAttribute("diagonals"));
    const seedAttribute = this.getAttribute("seed");
    const asked = Number(seedAttribute);
    const seed =
      seedAttribute === "daily"
        ? kumimojiDailySeed(new Date())
        : seedAttribute !== null && Number.isInteger(asked) && asked >= 0 && asked <= 0xffffffff
          ? asked
          : (this.#seed ??= Math.floor(Math.random() * 2 ** 31));
    const lang = this.getAttribute("lang");
    const locale = lang === "en" || lang === "ja" ? lang : undefined;
    const keep = !["false", "off", "0", "no"].includes((this.getAttribute("keep") ?? "").toLowerCase());
    const key = JSON.stringify([language, hand, level, gameLength, diagonals, seed, keep]);
    if (key === this.#key && this.#table !== null) {
      this.#table.setLocale(locale ?? (document.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en"));
      return;
    }
    this.#table?.destroy();
    this.#table = null;
    this.#key = key;
    if (hand !== undefined && !HANDS.includes(hand)) return;
    this.#table = mountKumimoji(this, {
      language,
      hand,
      level,
      gameLength,
      diagonals,
      seed,
      locale,
      keep,
      onChange: (saved) => this.dispatchEvent(new CustomEvent("kumimoji-change", { detail: { saved }, bubbles: true })),
      onFinish: (result) => this.dispatchEvent(new CustomEvent("kumimoji-finish", { detail: result, bubbles: true })),
    });
  }
}
