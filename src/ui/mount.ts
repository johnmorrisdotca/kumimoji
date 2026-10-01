import { kumimojiClock, kumimojiFromJSON, kumimojiToJSON, kumimojiToText, type KumimojiSaved } from "../export.ts";
import { generateKumimoji } from "../generate.ts";
import { judgeWithWords } from "../judge.ts";
import type { KumimojiDeal, KumimojiLanguage, KumimojiLength, KumimojiLevel } from "../kumimoji.types.ts";
import { assignHandTile, deal, draw, isFinished, liftAll, liftToHand, mayDraw, mayTrade, moveOnTable, placeFromHand, sortHand, swapWithHand, tilesLeft, trade, type TilePlay } from "../play.ts";
import { kumimojiSay, kumimojiStrings, type KumimojiLocale, type KumimojiStrings } from "../strings.ts";
import { KUMIMOJI_HANDS } from "../tiles.constants.ts";
import { tileFace } from "../tileFace.ts";
import { loadTileWords, type TileWords } from "../tileWords.ts";
import { boardModel } from "./board.ts";
import { KUMIMOJI_STYLE } from "./style.ts";

/** What `mountKumimoji` may be given. Everything is optional: with nothing, it is a short English game from a hand of seven, with some wild tiles. */
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
};

/** The options that make a game, which a new game may change. */
type GameOptions = Pick<KumimojiTableOptions, "language" | "hand" | "level" | "gameLength" | "diagonals" | "seed">;

/** What `mountKumimoji` hands back: the game being played, and the ways to change it from outside. */
export type KumimojiTableHandle = {
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

/** What a wild nobody has given a letter yet shows in the hand. */
const WILD_MARK = "★";

/** What is picked up: a tile in the hand, or one on the table. */
type Held = { from: "hand"; at: number } | { from: "table"; square: string } | null;

function node<K extends keyof HTMLElementTagNameMap>(name: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const made = document.createElement(name);
  if (className !== undefined) made.className = className;
  if (text !== undefined) made.textContent = text;
  return made;
}

function button(text: string, onClick: () => void, primary = false, testId?: string): HTMLButtonElement {
  const made = node("button", primary ? "km-button km-primary" : "km-button", text);
  made.type = "button";
  if (testId !== undefined) made.dataset.testid = testId;
  made.addEventListener("click", onClick);
  return made;
}

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
 */
export function mountKumimoji(target: HTMLElement, options: KumimojiTableOptions = {}): KumimojiTableHandle {
  let settings: GameOptions = { language: options.language, hand: options.hand, level: options.level, gameLength: options.gameLength, diagonals: options.diagonals, seed: options.seed };
  const pageLocale = (): KumimojiLocale => (typeof document !== "undefined" && document.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en");
  let locale: KumimojiLocale = options.locale ?? pageLocale();
  let own = options.strings ?? {};
  let say = kumimojiStrings(locale, own);
  let note = "";
  let words: TileWords | null = null;
  let dealt: KumimojiDeal | null = null;
  let play: TilePlay | null = null;
  let held: Held = null;
  // Where a keyboard is: the square and the hand tile that Tab lands on, and the one the arrow keys move from.
  let onSquare: string | null = null;
  let onHand = 0;
  let started = 0;
  let finishedAt: number | null = null;
  let destroyed = false;
  // Each deal and each game put on the table takes a number; one that is overtaken while its list loads gives way.
  let asked = 0;

  const root = node("div", "km-root");
  root.dataset.testid = "km-root";
  root.dataset.state = "dealing";
  for (const [name, value] of Object.entries(options.theme ?? {})) root.style.setProperty(name, value);
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
  controls.dataset.testid = "km-controls";
  const keep = node("details", "km-keep");
  keep.dataset.testid = "km-keep";
  root.append(style, status, board, notes, picker, hand, controls);
  if (options.keep !== false) root.append(keep);
  target.append(root);

  const savedNow = (): KumimojiSaved | null => (play === null || dealt === null ? null : { deal: dealt, play, elapsedMs: (finishedAt ?? Date.now()) - started });

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
    if (destroyed) return;
    if (loaded === null) {
      note = say.loadBad;
      render();
      return;
    }
    await handle.setGame(loaded);
    note = say.loaded;
    render();
  };
  file.addEventListener("change", () => {
    const chosen = file.files?.[0];
    file.value = "";
    if (chosen === undefined) return;
    void chosen.text().then(read, () => read(""));
  });
  const saveJson = button("", () => {
    const now = savedNow();
    if (now !== null) save(`kumimoji-${now.deal.seed}.json`, "application/json", kumimojiToJSON(now));
  }, false, "km-save-json");
  const saveText = button("", () => {
    const now = savedNow();
    if (now !== null) save(`kumimoji-${now.deal.seed}.txt`, "text/plain", kumimojiToText(now, say));
  }, false, "km-save-text");
  const load = button("", () => file.click(), false, "km-load");
  const keepButtons = node("div", "km-controls");
  keepButtons.append(saveJson, saveText, load);
  keep.append(keepTitle, keepButtons, keepNote, file);

  const tick = setInterval(() => {
    if (play !== null && finishedAt === null) renderStatus();
  }, 1000);

  const verdictOf = (now: TilePlay) => judgeWithWords(now.tiles, words!, { diagonals: settings.diagonals === true });

  const change = (next: TilePlay) => {
    play = next;
    const verdict = verdictOf(next);
    if (finishedAt === null && isFinished(next, verdict)) {
      finishedAt = Date.now();
      options.onFinish?.({ deal: dealt!, play: next, elapsedMs: finishedAt - started });
    }
    note = "";
    const now = savedNow();
    if (now !== null) options.onChange?.(now);
    render();
  };

  const tapSquare = (square: string) => {
    if (play === null || finishedAt !== null) return;
    const there = play.tiles.get(square);
    if (held === null) {
      if (there !== undefined) held = { from: "table", square };
      render();
      return;
    }
    if (held.from === "hand") {
      const at = held.at;
      const tile = play.hand[at];
      if (tile === undefined) return;
      // A wild is given a letter before it is laid.
      if (tile === "*") return;
      held = null;
      change(there === undefined ? placeFromHand(play, at, square) : swapWithHand(play, at, square));
      return;
    }
    const from = held.square;
    held = null;
    change(from === square ? liftToHand(play, square) : moveOnTable(play, from, square));
  };

  const tapHand = (at: number) => {
    if (play === null || finishedAt !== null) return;
    held = held?.from === "hand" && held.at === at ? null : { from: "hand", at };
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
    const step = event.key === "ArrowLeft" ? (at % cols > 0 ? -1 : 0) : event.key === "ArrowRight" ? (at % cols < cols - 1 ? 1 : 0) : event.key === "ArrowUp" ? (at - cols >= 0 ? -cols : 0) : event.key === "ArrowDown" ? (at + cols < cells.length ? cols : 0) : null;
    if (step === null) return;
    event.preventDefault();
    const next = cells[at + step];
    if (step === 0 || next === undefined) return;
    cell.tabIndex = -1;
    next.tabIndex = 0;
    onSquare = next.dataset.square ?? null;
    next.focus();
  });
  board.addEventListener("focusin", (event) => {
    const square = (event.target as Element).closest("[data-square]")?.getAttribute("data-square");
    if (square !== null && square !== undefined) onSquare = square;
  });
  hand.addEventListener("focusin", (event) => {
    const at = (event.target as Element).closest("[data-hand]")?.getAttribute("data-hand");
    if (at !== null && at !== undefined) onHand = Number(at);
  });
  hand.addEventListener("keydown", (event) => {
    const tile = (event.target as Element).closest<HTMLElement>("[data-hand]");
    if (tile === null || event.altKey || event.ctrlKey || event.metaKey) return;
    const tiles = [...hand.querySelectorAll<HTMLElement>("[data-hand]")];
    const at = tiles.indexOf(tile);
    const to = event.key === "ArrowLeft" ? at - 1 : event.key === "ArrowRight" ? at + 1 : event.key === "Home" ? 0 : event.key === "End" ? tiles.length - 1 : null;
    if (to === null) return;
    event.preventDefault();
    const next = tiles[to];
    if (next === undefined) return;
    tile.tabIndex = -1;
    next.tabIndex = 0;
    onHand = to;
    next.focus();
  });
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || held === null) return;
    held = null;
    render();
  });

  function renderStatus() {
    root.dataset.state = play === null ? "dealing" : finishedAt !== null ? "finished" : "playing";
    if (play === null) {
      status.textContent = say.dealing;
      return;
    }
    const left = tilesLeft(play);
    root.dataset.left = String(left);
    const time = kumimojiClock((finishedAt ?? Date.now()) - started);
    status.textContent = finishedAt !== null ? kumimojiSay(say.finished, { time }) : kumimojiSay(left === 1 ? say.leftOne : say.left, { n: left, time });
  }

  function renderBoard(verdict: ReturnType<typeof verdictOf>) {
    const model = boardModel(play!.tiles, play!.tiles.size === 0 ? null : verdict, words!.glyphOf);
    const grid = node("div", "km-grid");
    grid.style.gridTemplateColumns = `repeat(${model.cols}, var(--km-square))`;
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", say.tableLabel);
    grid.setAttribute("aria-description", say.tableKeys);
    grid.dataset.cols = String(model.cols);
    const cells: HTMLButtonElement[] = [];
    for (const square of model.squares) {
      const cell = node("button", "km-square");
      cell.type = "button";
      cell.dataset.square = square.square;
      if (square.tile !== null) {
        cell.classList.add("km-tile");
        if (square.wild) cell.classList.add("km-wild");
        if (square.mark !== null) cell.classList.add(`km-${square.mark}`);
        cell.textContent = square.glyph;
        cell.dataset.tile = square.glyph;
        cell.setAttribute("aria-label", square.wild ? kumimojiSay(say.wildTile, { tile: square.glyph }) : square.glyph);
      } else {
        cell.setAttribute("aria-label", say.emptySquare);
      }
      if (held?.from === "table" && held.square === square.square) cell.classList.add("km-held");
      cell.tabIndex = -1;
      cells.push(cell);
      grid.append(cell);
    }
    // The one Tab lands on: where the keyboard was, else a tile, else the middle.
    const stop = cells.find((cell) => cell.dataset.square === onSquare) ?? cells.find((cell) => cell.classList.contains("km-tile")) ?? cells[Math.floor(cells.length / 2)];
    if (stop !== undefined) {
      stop.tabIndex = 0;
      onSquare = stop.dataset.square ?? null;
    }
    board.replaceChildren(grid);
    notes.textContent = verdict.notWords.length > 0 ? kumimojiSay(say.notWords, { words: verdict.notWords.join(", ") }) : verdict.apart.size > 0 ? say.apart : "";
  }

  function renderHand() {
    hand.replaceChildren();
    hand.setAttribute("aria-label", say.handLabel);
    play!.hand.forEach((tile, at) => {
      const face = tileFace(tile);
      const made = node("button", "km-tile km-in-hand");
      made.type = "button";
      made.dataset.hand = String(at);
      made.textContent = face.blank ? WILD_MARK : words!.glyphOf(tile);
      if (face.wild) made.classList.add("km-wild");
      if (held?.from === "hand" && held.at === at) made.classList.add("km-held");
      made.dataset.tile = face.blank ? "*" : words!.glyphOf(tile);
      made.setAttribute("aria-label", face.blank ? say.wildBlank : face.wild ? kumimojiSay(say.wildTile, { tile: words!.glyphOf(tile) }) : words!.glyphOf(tile));
      made.tabIndex = at === Math.min(onHand, play!.hand.length - 1) ? 0 : -1;
      hand.append(made);
    });
    if (play!.hand.length === 0 && finishedAt === null) hand.append(node("span", "km-empty", say.noTiles));
  }

  function renderPicker() {
    picker.replaceChildren();
    if (held?.from !== "hand" || play === null) return;
    const at = held.at;
    const tile = play.hand[at];
    if (tile === undefined || !tileFace(tile).wild) return;
    picker.append(node("span", "km-picker-title", tile === "*" ? say.giveWild : say.changeWild));
    for (const sound of words!.wildOptions) {
      const code = words!.wildFor(sound);
      if (code === null) continue;
      picker.append(
        button(sound, () => {
          held = { from: "hand", at };
          change(assignHandTile(play!, at, code));
        }),
      );
    }
  }

  function renderControls(verdict: ReturnType<typeof verdictOf>) {
    controls.replaceChildren();
    if (finishedAt !== null) {
      controls.append(button(say.newGame, () => void handle.newGame(), true, "km-new"));
      return;
    }
    const now = play!;
    const drawButton = button(say.draw, () => {
      held = null;
      change(draw(now));
    }, true, "km-draw");
    drawButton.disabled = !mayDraw(now, verdict);
    const tradeButton = button(say.trade, () => {
      if (held?.from !== "hand") return;
      const at = held.at;
      held = null;
      change(trade(now, at));
    }, false, "km-trade");
    tradeButton.disabled = held?.from !== "hand" || !mayTrade(now);
    controls.append(
      drawButton,
      tradeButton,
      button(say.sort, () => change(sortHand(now)), false, "km-sort"),
      button(say.liftAll, () => {
        held = null;
        change(liftAll(now));
      }, false, "km-lift"),
      button(say.newGame, () => void handle.newGame(), false, "km-new"),
    );
  }

  function renderKeep() {
    keepTitle.textContent = say.keep;
    saveJson.textContent = say.saveJson;
    saveText.textContent = say.saveText;
    load.textContent = say.load;
    saveJson.disabled = play === null;
    saveText.disabled = play === null;
    keepNote.textContent = note;
  }

  /** Where the keyboard is, so that it can be put back after everything is drawn again: the zone, and which of it. */
  function keyboardAt(): { zone: "board" | "hand" | "controls" | "picker"; id: string } | null {
    const on = document.activeElement;
    if (on === null || !root.contains(on)) return null;
    const mark = (zone: "board" | "hand" | "controls" | "picker", id: string | undefined) => (id === undefined ? null : { zone, id });
    if (board.contains(on)) return mark("board", (on as HTMLElement).dataset.square);
    if (hand.contains(on)) return mark("hand", (on as HTMLElement).dataset.hand);
    if (controls.contains(on)) return mark("controls", (on as HTMLElement).dataset.testid);
    if (picker.contains(on)) return mark("picker", String([...picker.querySelectorAll("button")].indexOf(on as HTMLButtonElement)));
    return null;
  }

  function keyboardBack(at: ReturnType<typeof keyboardAt>) {
    if (at === null) return;
    const zone = { board, hand, controls, picker }[at.zone];
    const found = at.zone === "board" ? zone.querySelector<HTMLElement>(`[data-square="${at.id}"]`) : at.zone === "hand" ? zone.querySelector<HTMLElement>(`[data-hand="${at.id}"]`) : at.zone === "controls" ? zone.querySelector<HTMLElement>(`[data-testid="${at.id}"]`) : zone.querySelectorAll<HTMLElement>("button")[Number(at.id)];
    // A button that has become disabled cannot hold the focus; the table keeps it rather than dropping it on the page.
    if (found !== undefined && found !== null && !(found as HTMLButtonElement).disabled) found.focus({ preventScroll: true });
  }

  function render() {
    if (destroyed) return;
    const where = keyboardAt();
    root.lang = locale;
    renderStatus();
    renderKeep();
    if (play === null || words === null) return;
    const verdict = verdictOf(play);
    renderBoard(verdict);
    renderPicker();
    renderHand();
    renderControls(verdict);
    keyboardBack(where);
  }

  const handle: KumimojiTableHandle = {
    play: () => play,
    saved: savedNow,
    setGame: async (saved) => {
      const mine = ++asked;
      const language = saved.deal.language;
      settings = { language, hand: saved.deal.size, level: saved.deal.level, gameLength: saved.deal.gameLength, diagonals: saved.deal.diagonals === true, seed: undefined };
      const list = await loadTileWords(language);
      if (destroyed || mine !== asked) return;
      words = list;
      root.classList.toggle("km-japanese", language === "japanese");
      dealt = saved.deal;
      root.dataset.seed = String(saved.deal.seed);
      held = null;
      finishedAt = null;
      started = Date.now() - saved.elapsedMs;
      // A game loaded already finished stays finished, at the time it took, and is not announced again.
      if (isFinished(saved.play, judgeWithWords(saved.play.tiles, words, { diagonals: settings.diagonals === true }))) finishedAt = Date.now();
      play = saved.play;
      note = "";
      options.onChange?.(saved);
      render();
    },
    setLocale: (next, strings) => {
      locale = next;
      if (strings !== undefined) own = strings;
      say = kumimojiStrings(locale, own);
      render();
    },
    newGame: async (changed = {}) => {
      const mine = ++asked;
      settings = { ...settings, ...changed, seed: undefined };
      const language = settings.language ?? "english";
      const size = settings.hand ?? KUMIMOJI_HANDS.quick;
      play = null;
      held = null;
      finishedAt = null;
      note = "";
      render();
      const list = await loadTileWords(language);
      if (destroyed || mine !== asked) return;
      words = list;
      // A seed deals one game: the next is dealt from a new one unless asked for by seed again.
      const seed = changed.seed ?? Math.floor(Math.random() * 2 ** 31);
      root.classList.toggle("km-japanese", language === "japanese");
      root.dataset.seed = String(seed);
      dealt = generateKumimoji(size, settings.level ?? "medium", seed, { language, gameLength: settings.gameLength, diagonals: settings.diagonals });
      started = Date.now();
      change(deal(dealt.givens, size));
    },
    destroy: () => {
      destroyed = true;
      clearInterval(tick);
      root.remove();
    },
  };

  void handle.newGame(settings);
  return handle;
}
