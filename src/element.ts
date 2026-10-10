import { embedDay } from "./embed-day.ts";
import { KUMIMOJI_STYLE } from "./ui/style.ts";
import { kumimojiDailySeed } from "./daily.ts";
import type { KumimojiLanguage, KumimojiLength, KumimojiLevel } from "./kumimoji.types.ts";
import { KUMIMOJI_HANDS } from "./tiles.constants.ts";
import { mountKumimoji, type KumimojiTableHandle, type KumimojiTableOptions } from "./ui/mount.ts";
import type { KumimojiSaved } from "./export.ts";

const ElementBase: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined => (allowed.includes(value as T) ? (value as T) : undefined);
const isOn = (value: string | null, fallback = false): boolean => value === null ? fallback : !["false", "off", "no", "0"].includes(value.trim().toLowerCase());
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
 * Attributes configure the starting game; display, language and control changes preserve play:
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
 * `newGame()` and `setGame()`. Invalid input shows a status and a plain error event.
 */
/**
 * Native table options, checked alongside builder coverage.
 * @example
 * ```ts
 * import { KUMIMOJI_EMBED_OPTION_KEYS } from "@johnmorrisdotca/kumimoji/element";
 * console.log(KUMIMOJI_EMBED_OPTION_KEYS.includes("saved"));
 * ```
 */
export const KUMIMOJI_EMBED_OPTION_KEYS = Object.keys({ language: true, hand: true, level: true, gameLength: true, diagonals: true, seed: true, onFinish: true, onChange: true, locale: true, strings: true, theme: true, keep: true, controls: true, saved: true, onError: true } satisfies Record<keyof KumimojiTableOptions, boolean>);
/**
 * Full native host options, including saved state, private words and callbacks.
 * @example
 * ```ts
 * import type { KumimojiElementOptions } from "@johnmorrisdotca/kumimoji/element";
 * const options: KumimojiElementOptions = { keep: false, locale: "ja" };
 * console.log(options.locale);
 * ```
 */
export type KumimojiElementOptions = KumimojiTableOptions;
/**
 * A reflected crossword table with the native table handle and saved-state getter.
 * @example
 * ```ts
 * import { KumimojiTable } from "@johnmorrisdotca/kumimoji/element";
 * console.log(KumimojiTable.observedAttributes.includes("daily"));
 * ```
 */
export class KumimojiTable extends ElementBase {
  static observedAttributes = ["language", "hand", "level", "length", "diagonals", "seed", "lang", "keep", "daily", "controls", "theme", "size", "width", "label"];

  #table: KumimojiTableHandle | null = null;
  #key = "";
  #queued = false;
  #seed: number | null = null;
  #options: KumimojiElementOptions = {};
  #revision = 0;
  #widthBefore: string | null = null;
  #widthOwned = false;
  #labelBefore: { role: string | null; label: string | null } | null = null;
  /** Native host options. Callback/presentation changes preserve the current game. */
  get options(): KumimojiElementOptions { return this.#options; }
  set options(value: KumimojiElementOptions) { this.#options = value ?? {}; if (this.isConnected) this.#refresh(); }
  #write(name: string, value: unknown): void { if (value === null || value === undefined) this.removeAttribute(name); else this.setAttribute(name, String(value)); }


  connectedCallback(): void {
    this.#refresh();
  }

  disconnectedCallback(): void {
    ++this.#revision; this.#table?.destroy();
    this.#table = null;
    this.#key = "";
  }

  attributeChangedCallback(): void {
    if (!this.isConnected || this.#queued) return;
    this.#queued = true;
    queueMicrotask(() => {
      this.#queued = false;
      if (this.isConnected) this.#refresh();
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

  /** The `language` attribute, reflected. */
  get language(): string | null { return this.getAttribute("language"); }
  set language(value: string | number | boolean | null | undefined) { this.#write("language", value); }
  /** The `hand` attribute, reflected. */
  get hand(): string | null { return this.getAttribute("hand"); }
  set hand(value: string | number | boolean | null | undefined) { this.#write("hand", value); }
  /** The `level` attribute, reflected. */
  get level(): string | null { return this.getAttribute("level"); }
  set level(value: string | number | boolean | null | undefined) { this.#write("level", value); }
  /** The `length` attribute, reflected. */
  get length(): string | null { return this.getAttribute("length"); }
  set length(value: string | number | boolean | null | undefined) { this.#write("length", value); }
  /** The `diagonals` attribute, reflected. */
  get diagonals(): string | null { return this.getAttribute("diagonals"); }
  set diagonals(value: string | number | boolean | null | undefined) { this.#write("diagonals", value); }
  /** The `seed` attribute, reflected. */
  get seed(): string | null { return this.getAttribute("seed"); }
  set seed(value: string | number | boolean | null | undefined) { this.#write("seed", value); }
  /** The `keep` attribute, reflected. */
  get keep(): string | null { return this.getAttribute("keep"); }
  set keep(value: string | number | boolean | null | undefined) { this.#write("keep", value); }
  /** The `daily` attribute, reflected. */
  get daily(): string | null { return this.getAttribute("daily"); }
  set daily(value: string | number | boolean | null | undefined) { this.#write("daily", value); }
  /** The `controls` attribute, reflected. */
  get controls(): string | null { return this.getAttribute("controls"); }
  set controls(value: string | number | boolean | null | undefined) { this.#write("controls", value); }
  /** The `theme` attribute, reflected. */
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | number | boolean | null | undefined) { this.#write("theme", value); }
  /** The `size` attribute, reflected. */
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | number | boolean | null | undefined) { this.#write("size", value); }
  /** The `width` attribute, reflected. */
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | boolean | null | undefined) { this.#write("width", value); }
  /** The `label` attribute, reflected. */
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | number | boolean | null | undefined) { this.#write("label", value); }
  #frame(): void {
    this.style.display = "block"; this.style.maxWidth = "100%";
    const width = Number(this.getAttribute("width")), size = this.getAttribute("size");
    const pixels = this.hasAttribute("width") && width > 0 && Number.isFinite(width) ? Math.min(width, 2000) : size === "small" ? 320 : size === "medium" ? 480 : size === "large" ? 640 : null;
    if (pixels !== null) { if (!this.#widthOwned) this.#widthBefore = this.style.width; this.#widthOwned = true; this.style.width = `${pixels}px`; }
    else if (this.#widthOwned) { this.style.width = this.#widthBefore ?? ""; this.#widthOwned = false; }
    const theme = this.getAttribute("theme"); this.style.colorScheme = theme === "light" || theme === "dark" ? theme : "light dark";
    this.setAttribute("data-kumimoji-embed", "");
    const root = this.getRootNode(), target: ParentNode = typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : this.ownerDocument.head;
    if (target.querySelector("style[data-kumimoji-embed-style]") === null) {
      const style = this.ownerDocument.createElement("style"); style.setAttribute("data-kumimoji-embed-style", "");
      const light = KUMIMOJI_STYLE.match(/\.km-root \{([^}]+)\}/)?.[1] ?? "";
      const dark = KUMIMOJI_STYLE.match(/@media \(prefers-color-scheme: dark\) \{\s*\.km-root \{([^}]+)\}/)?.[1] ?? "";
      style.textContent = `[data-kumimoji-embed][theme="light"] .km-root{${light}}[data-kumimoji-embed][theme="dark"] .km-root{${dark}}[data-kumimoji-embed]>.km-root{background:var(--km-panel);padding:12px;border-radius:12px}[data-kumimoji-embed] .km-controls[hidden]{display:none}`;
 target.append(style);
    }
    if (this.hasAttribute("label")) { this.#labelBefore ??= { role: this.getAttribute("role"), label: this.getAttribute("aria-label") }; this.setAttribute("role", "group"); this.setAttribute("aria-label", this.getAttribute("label")!); }
    else if (this.#labelBefore !== null) { for (const [name, value] of [["role", this.#labelBefore.role], ["aria-label", this.#labelBefore.label]]) { if (value === null) this.removeAttribute(name!); else this.setAttribute(name!, value!); } this.#labelBefore = null; }
  }
  #refresh(): void {
    this.#frame();
    try {
      const language: KumimojiLanguage | undefined = oneOf(this.getAttribute("language"), ["english", "japanese"] as const) ?? this.#options.language;
      const hand = this.hasAttribute("hand") ? Number(this.getAttribute("hand")) : this.#options.hand;
      const level: KumimojiLevel | undefined = oneOf(this.getAttribute("level"), ["easy", "medium", "hard"] as const) ?? this.#options.level;
      const gameLength: KumimojiLength | undefined = oneOf(this.getAttribute("length"), ["short", "medium", "full"] as const) ?? this.#options.gameLength;
      const diagonals = isOn(this.getAttribute("diagonals"), this.#options.diagonals ?? false);
      const seedAttribute = this.getAttribute("seed"), asked = Number(seedAttribute);
      const day = embedDay(this.hasAttribute("daily") ? this.getAttribute("daily") : seedAttribute === "daily" ? "today" : null);
      const seed = day !== null ? kumimojiDailySeed(new Date(`${day}T00:00:00Z`)) : seedAttribute !== null && Number.isInteger(asked) && asked >= 0 && asked <= 0xffffffff ? asked : this.#options.seed ?? (this.#seed ??= Math.floor(Math.random() * 2 ** 31));
      const lang = this.getAttribute("lang"), locale = lang === "en" || lang === "ja" ? lang : this.#options.locale ?? (this.ownerDocument.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en");
      const keep = isOn(this.getAttribute("keep"), this.#options.keep ?? true), controls = isOn(this.getAttribute("controls"), this.#options.controls ?? true);
      const key = JSON.stringify([language, hand, level, gameLength, diagonals, seed, day, this.#options.saved]);
      if (key === this.#key && this.#table !== null) { this.#table.set({ locale, strings: this.#options.strings, theme: this.#options.theme ?? {}, keep, controls }); return; }
      if (hand !== undefined && !HANDS.includes(hand)) throw new RangeError("Choose a hand of 3, 7 or 11 tiles.");
      this.#table?.destroy(); this.#table = null; this.#key = ""; this.replaceChildren(); const revision = ++this.#revision;
      const table = mountKumimoji(this, { ...this.#options, language, hand, level, gameLength, diagonals, seed, locale, keep, controls, onChange: saved => { this.dispatchEvent(new CustomEvent("kumimoji-change", { detail: JSON.parse(JSON.stringify({ saved })), bubbles: true, composed: true })); this.#options.onChange?.(saved); }, onFinish: result => { this.dispatchEvent(new CustomEvent("kumimoji-finish", { detail: JSON.parse(JSON.stringify(result)), bubbles: true, composed: true })); this.#options.onFinish?.(result); }, onError: error => { this.dispatchEvent(new CustomEvent("kumimoji-error", { detail: { message: error.message }, bubbles: true, composed: true })); this.#options.onError?.(error); } });
      this.#table = table; this.#key = key;
      void table.ready.then(() => { if (this.isConnected && revision === this.#revision && table.saved() !== null) this.dispatchEvent(new CustomEvent("kumimoji-load", { bubbles: true, composed: true, detail: { seed: table.saved()!.deal.seed, day } })); }).catch(() => { /* The native ready error handler reports the load failure. */ });
    } catch (error) {
      this.#table?.destroy(); this.#table = null; this.#key = "";
      const message = error instanceof Error ? error.message : String(error), status = this.ownerDocument.createElement("p"); status.setAttribute("role", "status"); status.textContent = message; this.replaceChildren(status); this.dispatchEvent(new CustomEvent("kumimoji-error", { detail: { message }, bubbles: true, composed: true }));
    }
  }
}
/**
 * Defines the table or a subclass under a custom tag. Server-safe and idempotent.
 * @param tagName - The tag name; kumimoji-table by default.
 * @param registry - The page registry, or undefined on a server.
 * @returns Nothing; existing definitions are left alone.
 * @example
 * ```ts
 * import { defineTable } from "@johnmorrisdotca/kumimoji/element";
 * defineTable();
 * console.log(typeof defineTable);
 * ```
 */
export function defineTable(tagName = "kumimoji-table", registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void { if (registry !== undefined && registry.get(tagName) === undefined) registry.define(tagName, tagName === "kumimoji-table" ? KumimojiTable : class extends KumimojiTable {}); }
