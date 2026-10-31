import { type KumimojiSaved, kumimojiFromJSON, kumimojiToJSON, kumimojiToText } from "../export.ts";
import { generateKumimoji } from "../generate.ts";
import { judgeWithWords } from "../judge.ts";
import type { KumimojiDeal, KumimojiLanguage, KumimojiLength, KumimojiLevel } from "../kumimoji.types.ts";
import { deal, isFinished, liftToHand, moveOnTable, placeFromHand, swapWithHand, type TilePlay } from "../play.ts";
import { type KumimojiLocale, type KumimojiStrings, kumimojiStrings } from "../strings.ts";
import { KUMIMOJI_HANDS } from "../tiles.constants.ts";
import { loadTileWords } from "../tileWords.ts";
import { button, type Held, node, type TableSession, tableDrawing } from "./draw.ts";
import { KUMIMOJI_STYLE } from "./style.ts";

/**
 * Optional initial game, presentation, readiness and callback choices.
 * With nothing, it is a short English game from a hand of seven, with some wild tiles.
 * @example
 * ```ts
 * import type { KumimojiTableOptions } from "@johnmorrisdotca/kumimoji/ui";
 * const options: KumimojiTableOptions = { hand: 7, keep: false, controls: true };
 * console.log(options.hand);
 * ```
 */
export type KumimojiTableOptions = {
  /** The language of the tiles: `"english"` or `"japanese"` kana. English by default. */
  language?: KumimojiLanguage;
  /** The opening hand: 3, 7 or 11 tiles. */
  hand?: number;
  /** How many of the tiles are wild: `"easy"` the most, `"medium"` some, `"hard"` none. */
  level?: KumimojiLevel;
  /** How much of the set the bag holds: `"short"`, `"medium"`, or `"full"`, all 144 tiles. */
  gameLength?: KumimojiLength;
  /** Every diagonal run of three or more must be a word too. */
  diagonals?: boolean;
  /** The seed the bag is dealt from; a new one each game when absent. */
  seed?: number;
  /** Told when the last tile is laid and every run is a word, with the time it took. */
  onFinish?: (result: { deal: KumimojiDeal; play: TilePlay; elapsedMs: number }) => void;
  /** Told after every change to the game, with the game as it would be saved. */
  onChange?: (saved: KumimojiSaved) => void;
  /** The language of the table's words, which is not the language of the tiles: `"en"` or `"ja"`. By default the page's own (`<html lang>`), and English for any other. */
  locale?: KumimojiLocale;
  /** Words of your own, laid over the locale's: any of `KumimojiStrings`. */
  strings?: Partial<KumimojiStrings>;
  /** CSS variables set on the table itself, which win in light and dark alike: `{ "--km-felt": "#23405a" }`. */
  theme?: Readonly<Record<string, string>>;
  /** Whether the table offers saving and loading. True by default. */
  keep?: boolean;
  /** Show native play-action buttons; a host hiding them supplies its own actions. */
  controls?: boolean;
  /** A validated saved game to restore initially instead of dealing a new one. */
  saved?: KumimojiSaved;
  /** Called after a word-list load or initial restoration fails. */
  onError?: (error: Error) => void;
};

/** The options that make a game, which a new game may change. */
type GameOptions = Pick<KumimojiTableOptions, "language" | "hand" | "level" | "gameLength" | "diagonals" | "seed">;

/**
 * Readiness, structured play and presentation/game controls for a mounted table.
 * @example
 * ```ts
 * import type { KumimojiTableHandle } from "@johnmorrisdotca/kumimoji/ui";
 * const setJapanese = (table: KumimojiTableHandle): void => table.set({ locale: "ja" });
 * console.log(typeof setJapanese);
 * ```
 */
export type KumimojiTableHandle = {
  /** Settles once the initial deal or restored game is ready. */
  readonly ready: Promise<void>;
  /** Change presentation and controls without redealing. */
  set: (options: Pick<KumimojiTableOptions, "locale" | "strings" | "theme" | "keep" | "controls">) => void;
  /** The game as it stands, or null while it is being dealt. */
  play: () => TilePlay | null;
  /** The game as it would be saved (`kumimojiToJSON`), or null while it is being dealt. */
  saved: () => KumimojiSaved | null;
  /** A new game at the same table, with any options changed. Resolves when it is dealt. */
  newGame: (options?: GameOptions) => Promise<void>;
  /** Put a game on the table: one read back by `kumimojiFromJSON`. Its clock goes on from the time already spent. */
  setGame: (saved: KumimojiSaved) => Promise<void>;
  /** Change the language of the table's words, and with it any words of your own. */
  setLocale: (locale: KumimojiLocale, strings?: Partial<KumimojiStrings>) => void;
  /** Take the table off the page and stop its clock. */
  destroy: () => void;
};

/** Hand a string to the person as a file of that name. */
function save(name: string, type: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = node("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * A GAME OF KUMIMOJI ALONE, IN PLAIN DOM: the bag dealt from a seed, your
 * hand, and a table to build your crossword on, every run judged as you lay
 * it. Tap a tile in your hand and then a square to lay it; tap a tile on the
 * table and then a square to move it, or tap it again to take it back. When
 * the hand is empty and every run is a word, Draw brings the next tile; a
 * tile you cannot use can be traded for three. Use every tile in the bag to
 * finish. Under the buttons, the game saves as JSON or as text, and a saved
 * game loads back.
 *
 * The word list is fetched the first time a game in its language is dealt.
 * @param target - The host element for this table.
 * @param options - Initial deal or saved state, presentation and callbacks.
 * @returns The native handle, including ready and presentation updates without redealing.
 * @example
 * ```ts
 * import { mountKumimoji } from "@johnmorrisdotca/kumimoji/ui";
 * if (typeof document !== "undefined") {
 *   const table = mountKumimoji(document.createElement("div"), { keep: false });
 *   void table.ready.then(() => table.destroy());
 * }
 * console.log(typeof mountKumimoji);
 * ```
 */
export function mountKumimoji(target: HTMLElement, options: KumimojiTableOptions = {}): KumimojiTableHandle {
  let current = options;
  let settings: GameOptions = {
    language: current.language,
    hand: current.hand,
    level: current.level,
    gameLength: current.gameLength,
    diagonals: current.diagonals,
    seed: current.seed,
  };
  const pageLocale = (): KumimojiLocale =>
    typeof document !== "undefined" && document.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en";
  let own = current.strings ?? {};
  const openingLocale = current.locale ?? pageLocale();
  // Where a keyboard is: the square and the hand tile that Tab lands on, and the one the arrow keys move from.
  const session: TableSession = {
    play: null,
    finishedAt: null,
    started: 0,
    words: null,
    held: null,
    onSquare: null,
    onHand: 0,
    say: kumimojiStrings(openingLocale, own),
    locale: openingLocale,
    note: "",
    destroyed: false,
  };
  let dealt: KumimojiDeal | null = null;
  // Each deal and each game put on the table takes a number; one that is overtaken while its list loads gives way.
  let asked = 0;
  // The drawing is built once the elements exist. Until then nothing calls these.
  const bridge: { render: () => void; renderStatus: () => void; newGame: () => void } = {
    render: () => {},
    renderStatus: () => {},
    newGame: () => {},
  };
  const render = (): void => bridge.render();

  const root = node("div", "km-root");
  root.dataset.testid = "km-root";
  root.dataset.state = "dealing";
  for (const [name, value] of Object.entries(current.theme ?? {})) root.style.setProperty(name, value);
  const style = node("style");
  style.textContent = KUMIMOJI_STYLE;
  const status = node("p", "km-status");
  status.dataset.testid = "km-status";
  status.setAttribute("aria-live", "polite");
  const board = node("div", "km-board");
  board.dataset.testid = "km-board";
  const notes = node("p", "km-notes");
  notes.dataset.testid = "km-notes";
  notes.setAttribute("aria-live", "polite");
  const hand = node("div", "km-hand");
  hand.dataset.testid = "km-hand";
  hand.setAttribute("role", "group");
  const picker = node("div", "km-picker");
  picker.dataset.testid = "km-picker";
  const controls = node("div", "km-controls");
  controls.hidden = current.controls === false;
  controls.dataset.testid = "km-controls";
  const keep = node("details", "km-keep");
  keep.dataset.testid = "km-keep";
  root.append(style, status, board, notes, picker, hand, controls);
  if (current.keep !== false) root.append(keep);
  target.append(root);

  const savedNow = (): KumimojiSaved | null => {
    const now = session.play;
    if (now === null || dealt === null) return null;
    return { deal: dealt, play: now, elapsedMs: (session.finishedAt ?? Date.now()) - session.started };
  };

  // The saving and loading are made once, so the fold stays open or shut as the person left it; only their words change.
  const keepTitle = node("summary", "km-keep-title");
  const keepNote = node("p", "km-note");
  keepNote.dataset.testid = "km-note";
  keepNote.setAttribute("aria-live", "polite");
  const file = node("input");
  file.type = "file";
  file.accept = ".json,application/json";
  file.hidden = true;
  file.dataset.testid = "km-file";
  const read = async (text: string) => {
    const loaded = await kumimojiFromJSON(text).catch(() => null);
    if (session.destroyed) return;
    if (loaded === null) {
      session.note = session.say.loadBad;
      render();
      return;
    }
    await handle.setGame(loaded);
    session.note = session.say.loaded;
    render();
  };
  file.addEventListener("change", () => {
    const chosen = file.files?.[0];
    file.value = "";
    if (chosen === undefined) return;
    void chosen.text().then(read, () => read(""));
  });
  const saveJson = button(
    "",
    () => {
      const now = savedNow();
      if (now !== null) save(`kumimoji-${now.deal.seed}.json`, "application/json", kumimojiToJSON(now));
    },
    false,
    "km-save-json",
  );
  const saveText = button(
    "",
    () => {
      const now = savedNow();
      if (now !== null) save(`kumimoji-${now.deal.seed}.txt`, "text/plain", kumimojiToText(now, session.say));
    },
    false,
    "km-save-text",
  );
  const load = button("", () => file.click(), false, "km-load");
  const keepButtons = node("div", "km-controls");
  keepButtons.append(saveJson, saveText, load);
  keep.append(keepTitle, keepButtons, keepNote, file);

  const verdictOf = (now: TilePlay) =>
    judgeWithWords(now.tiles, session.words!, { diagonals: settings.diagonals === true });

  const change = (next: TilePlay) => {
    session.play = next;
    const verdict = verdictOf(next);
    if (session.finishedAt === null && isFinished(next, verdict)) {
      session.finishedAt = Date.now();
      current.onFinish?.({ deal: dealt!, play: next, elapsedMs: session.finishedAt - session.started });
    }
    session.note = "";
    const now = savedNow();
    if (now !== null) current.onChange?.(now);
    render();
  };

  const tapSquare = (square: string) => {
    const now = session.play;
    if (now === null || session.finishedAt !== null) return;
    const there = now.tiles.get(square);
    const held: Held = session.held;
    if (held === null) {
      if (there !== undefined) session.held = { from: "table", square };
      render();
      return;
    }
    if (held.from === "hand") {
      const at = held.at;
      const tile = now.hand[at];
      if (tile === undefined) return;
      // A wild is given a letter before it is laid.
      if (tile === "*") return;
      session.held = null;
      change(there === undefined ? placeFromHand(now, at, square) : swapWithHand(now, at, square));
      return;
    }
    const from = held.square;
    session.held = null;
    change(from === square ? liftToHand(now, square) : moveOnTable(now, from, square));
  };

  const tapHand = (at: number) => {
    if (session.play === null || session.finishedAt !== null) return;
    const held = session.held;
    session.held = held?.from === "hand" && held.at === at ? null : { from: "hand", at };
    render();
  };

  board.addEventListener("click", (event) => {
    const square = (event.target as Element).closest("[data-square]")?.getAttribute("data-square");
    if (square !== null && square !== undefined) tapSquare(square);
  });
  hand.addEventListener("click", (event) => {
    const at = (event.target as Element).closest("[data-hand]")?.getAttribute("data-hand");
    if (at !== null && at !== undefined) tapHand(Number(at));
  });

  // Keyboard play. The squares and the hand's tiles are buttons, so Enter and Space tap them; each is one stop for
  // Tab, and the arrow keys move between squares (by the grid) and between the hand's tiles. Escape puts a held tile down.
  board.addEventListener("keydown", (event) => {
    const cell = (event.target as Element).closest<HTMLElement>("[data-square]");
    const grid = board.querySelector<HTMLElement>(".km-grid");
    if (cell === null || grid === null || event.altKey || event.ctrlKey || event.metaKey) return;
    const cells = [...grid.children] as HTMLElement[];
    const cols = Number(grid.dataset.cols);
    const at = cells.indexOf(cell);
    const step =
      event.key === "ArrowLeft"
        ? at % cols > 0
          ? -1
          : 0
        : event.key === "ArrowRight"
          ? at % cols < cols - 1
            ? 1
            : 0
          : event.key === "ArrowUp"
            ? at - cols >= 0
              ? -cols
              : 0
            : event.key === "ArrowDown"
              ? at + cols < cells.length
                ? cols
                : 0
              : null;
    if (step === null) return;
    event.preventDefault();
    const next = cells[at + step];
    if (step === 0 || next === undefined) return;
    cell.tabIndex = -1;
    next.tabIndex = 0;
    session.onSquare = next.dataset.square ?? null;
    next.focus();
  });
  board.addEventListener("focusin", (event) => {
    const square = (event.target as Element).closest("[data-square]")?.getAttribute("data-square");
    if (square !== null && square !== undefined) session.onSquare = square;
  });
  hand.addEventListener("focusin", (event) => {
    const at = (event.target as Element).closest("[data-hand]")?.getAttribute("data-hand");
    if (at !== null && at !== undefined) session.onHand = Number(at);
  });
  hand.addEventListener("keydown", (event) => {
    const tile = (event.target as Element).closest<HTMLElement>("[data-hand]");
    if (tile === null || event.altKey || event.ctrlKey || event.metaKey) return;
    const tiles = [...hand.querySelectorAll<HTMLElement>("[data-hand]")];
    const at = tiles.indexOf(tile);
    const to =
      event.key === "ArrowLeft"
        ? at - 1
        : event.key === "ArrowRight"
          ? at + 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tiles.length - 1
              : null;
    if (to === null) return;
    event.preventDefault();
    const next = tiles[to];
    if (next === undefined) return;
    tile.tabIndex = -1;
    next.tabIndex = 0;
    session.onHand = to;
    next.focus();
  });
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || session.held === null) return;
    session.held = null;
    render();
  });

  const drawing = tableDrawing(
    session,
    { root, status, board, notes, hand, picker, controls, keepTitle, saveJson, saveText, load, keepNote },
    { verdictOf, change, newGame: () => bridge.newGame() },
  );
  bridge.render = () => drawing.render();
  bridge.renderStatus = () => drawing.renderStatus();

  const tick = setInterval(() => {
    if (session.play !== null && session.finishedAt === null) bridge.renderStatus();
  }, 1000);

  let initialReady: Promise<void> = Promise.resolve();
  const handle: KumimojiTableHandle = {
    get ready() {
      return initialReady;
    },
    set: (changes) => {
      for (const name of Object.keys(current.theme ?? {}))
        if (changes.theme !== undefined && !(name in changes.theme)) root.style.removeProperty(name);
      if (changes.theme !== undefined)
        for (const [name, value] of Object.entries(changes.theme)) root.style.setProperty(name, value);
      current = { ...current, ...changes };
      if (changes.locale !== undefined) session.locale = changes.locale;
      if (changes.strings !== undefined) own = changes.strings;
      session.say = kumimojiStrings(session.locale, own);
      if (current.keep === false) keep.remove();
      else if (keep.parentNode !== root) root.append(keep);
      controls.hidden = current.controls === false;
      render();
    },
    play: () => session.play,
    saved: savedNow,
    setGame: async (saved) => {
      const mine = ++asked;
      const language = saved.deal.language;
      settings = {
        language,
        hand: saved.deal.size,
        level: saved.deal.level,
        gameLength: saved.deal.gameLength,
        diagonals: saved.deal.diagonals === true,
        seed: undefined,
      };
      const list = await loadTileWords(language);
      if (session.destroyed || mine !== asked) return;
      session.words = list;
      root.classList.toggle("km-japanese", language === "japanese");
      dealt = saved.deal;
      root.dataset.seed = String(saved.deal.seed);
      session.held = null;
      session.finishedAt = null;
      session.started = Date.now() - saved.elapsedMs;
      // A game loaded already finished stays finished, at the time it took, and is not announced again.
      if (isFinished(saved.play, judgeWithWords(saved.play.tiles, list, { diagonals: settings.diagonals === true })))
        session.finishedAt = Date.now();
      session.play = saved.play;
      session.note = "";
      current.onChange?.(saved);
      render();
    },
    setLocale: (next, strings) => {
      session.locale = next;
      if (strings !== undefined) own = strings;
      session.say = kumimojiStrings(session.locale, own);
      render();
    },
    newGame: async (changed = {}) => {
      const mine = ++asked;
      settings = { ...settings, ...changed, seed: undefined };
      const language = settings.language ?? "english";
      const size = settings.hand ?? KUMIMOJI_HANDS.quick;
      session.play = null;
      session.held = null;
      session.finishedAt = null;
      session.note = "";
      render();
      const list = await loadTileWords(language);
      if (session.destroyed || mine !== asked) return;
      session.words = list;
      // A seed deals one game: the next is dealt from a new one unless asked for by seed again.
      const seed = changed.seed ?? Math.floor(Math.random() * 2 ** 31);
      root.classList.toggle("km-japanese", language === "japanese");
      root.dataset.seed = String(seed);
      dealt = generateKumimoji(size, settings.level ?? "medium", seed, {
        language,
        gameLength: settings.gameLength,
        diagonals: settings.diagonals,
      });
      session.started = Date.now();
      change(deal(dealt.givens, size));
    },
    destroy: () => {
      session.destroyed = true;
      clearInterval(tick);
      root.remove();
    },
  };
  bridge.newGame = () => {
    void handle.newGame();
  };

  initialReady = current.saved === undefined ? handle.newGame(settings) : handle.setGame(current.saved);
  void initialReady.catch((error: unknown) => {
    if (session.destroyed) return;
    const problem = error instanceof Error ? error : new Error(String(error));
    status.textContent = session.say.loadError;
    current.onError?.(problem);
  });
  return handle;
}
