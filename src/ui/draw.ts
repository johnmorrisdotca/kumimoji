import { kumimojiClock } from "../export.ts";
import type { GridVerdict } from "../grid.ts";
import {
  assignHandTile,
  draw,
  liftAll,
  mayDraw,
  mayTrade,
  sortHand,
  type TilePlay,
  tilesLeft,
  trade,
} from "../play.ts";
import { type KumimojiLocale, type KumimojiStrings, kumimojiSay } from "../strings.ts";
import { tileFace } from "../tileFace.ts";
import type { TileWords } from "../tileWords.ts";
import { boardModel } from "./board.ts";

/** What is picked up: a tile in the hand, or one on the table. */
export type Held = { from: "hand"; at: number } | { from: "table"; square: string } | null;

/** What a wild nobody has given a letter yet shows in the hand. */
const WILD_MARK = "★";

export function node<K extends keyof HTMLElementTagNameMap>(
  name: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const made = document.createElement(name);
  if (className !== undefined) made.className = className;
  if (text !== undefined) made.textContent = text;
  return made;
}

export function button(text: string, onClick: () => void, primary = false, testId?: string): HTMLButtonElement {
  const made = node("button", primary ? "km-button km-primary" : "km-button", text);
  made.type = "button";
  if (testId !== undefined) made.dataset.testid = testId;
  made.addEventListener("click", onClick);
  return made;
}

/** The game as the drawing reads it, shared with the mount so a move and a redraw see the same table. */
export type TableSession = {
  play: TilePlay | null;
  finishedAt: number | null;
  started: number;
  words: TileWords | null;
  held: Held;
  onSquare: string | null;
  onHand: number;
  say: KumimojiStrings;
  locale: KumimojiLocale;
  note: string;
  destroyed: boolean;
};

/** The elements the mount built once; a redraw fills them and never replaces them. */
export type TableParts = {
  root: HTMLElement;
  status: HTMLElement;
  board: HTMLElement;
  notes: HTMLElement;
  hand: HTMLElement;
  picker: HTMLElement;
  controls: HTMLElement;
  keepTitle: HTMLElement;
  saveJson: HTMLButtonElement;
  saveText: HTMLButtonElement;
  load: HTMLButtonElement;
  keepNote: HTMLElement;
};

/** What a button does to the game. The mount owns the rules; the drawing only asks. */
export type TableActions = {
  verdictOf: (now: TilePlay) => GridVerdict;
  change: (next: TilePlay) => void;
  newGame: () => void;
};

/**
 * Draw the table from the session and the elements the mount built: the status
 * line, the board, the hand, the wild-tile picker, the play buttons and the
 * save labels, then put the keyboard focus back on the control it was on.
 * @param session - The game, the words and what is held, shared with the mount.
 * @param parts - The elements the drawing fills.
 * @param actions - How a button changes the game or starts another.
 * @returns The redraw, and the status line alone for the clock.
 */
export function tableDrawing(
  session: TableSession,
  parts: TableParts,
  actions: TableActions,
): {
  render: () => void;
  renderStatus: () => void;
} {
  function renderStatus() {
    const now = session.play;
    parts.root.dataset.state = now === null ? "dealing" : session.finishedAt !== null ? "finished" : "playing";
    if (now === null) {
      parts.status.textContent = session.say.dealing;
      return;
    }
    const left = tilesLeft(now);
    parts.root.dataset.left = String(left);
    const time = kumimojiClock((session.finishedAt ?? Date.now()) - session.started);
    parts.status.textContent =
      session.finishedAt !== null
        ? kumimojiSay(session.say.finished, { time })
        : kumimojiSay(left === 1 ? session.say.leftOne : session.say.left, { n: left, time });
  }

  function renderBoard(verdict: GridVerdict) {
    const playing = session.play!;
    const words = session.words!;
    const model = boardModel(playing.tiles, playing.tiles.size === 0 ? null : verdict, words.glyphOf);
    const grid = node("div", "km-grid");
    grid.style.gridTemplateColumns = `repeat(${model.cols}, var(--km-square))`;
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", session.say.tableLabel);
    grid.setAttribute("aria-description", session.say.tableKeys);
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
        cell.setAttribute(
          "aria-label",
          square.wild ? kumimojiSay(session.say.wildTile, { tile: square.glyph }) : square.glyph,
        );
      } else {
        cell.setAttribute("aria-label", session.say.emptySquare);
      }
      if (session.held?.from === "table" && session.held.square === square.square) cell.classList.add("km-held");
      cell.tabIndex = -1;
      cells.push(cell);
      grid.append(cell);
    }
    // The one Tab lands on: where the keyboard was, else a tile, else the middle.
    const stop =
      cells.find((cell) => cell.dataset.square === session.onSquare) ??
      cells.find((cell) => cell.classList.contains("km-tile")) ??
      cells[Math.floor(cells.length / 2)];
    if (stop !== undefined) {
      stop.tabIndex = 0;
      session.onSquare = stop.dataset.square ?? null;
    }
    parts.board.replaceChildren(grid);
    parts.notes.textContent =
      verdict.notWords.length > 0
        ? kumimojiSay(session.say.notWords, { words: verdict.notWords.join(", ") })
        : verdict.apart.size > 0
          ? session.say.apart
          : "";
  }

  function renderHand() {
    const playing = session.play!;
    const words = session.words!;
    parts.hand.replaceChildren();
    parts.hand.setAttribute("aria-label", session.say.handLabel);
    playing.hand.forEach((tile, at) => {
      const face = tileFace(tile);
      const made = node("button", "km-tile km-in-hand");
      made.type = "button";
      made.dataset.hand = String(at);
      made.textContent = face.blank ? WILD_MARK : words.glyphOf(tile);
      if (face.wild) made.classList.add("km-wild");
      if (session.held?.from === "hand" && session.held.at === at) made.classList.add("km-held");
      made.dataset.tile = face.blank ? "*" : words.glyphOf(tile);
      made.setAttribute(
        "aria-label",
        face.blank
          ? session.say.wildBlank
          : face.wild
            ? kumimojiSay(session.say.wildTile, { tile: words.glyphOf(tile) })
            : words.glyphOf(tile),
      );
      made.tabIndex = at === Math.min(session.onHand, playing.hand.length - 1) ? 0 : -1;
      parts.hand.append(made);
    });
    if (playing.hand.length === 0 && session.finishedAt === null)
      parts.hand.append(node("span", "km-empty", session.say.noTiles));
  }

  function renderPicker() {
    parts.picker.replaceChildren();
    if (session.held?.from !== "hand" || session.play === null) return;
    const at = session.held.at;
    const tile = session.play.hand[at];
    if (tile === undefined || !tileFace(tile).wild) return;
    parts.picker.append(node("span", "km-picker-title", tile === "*" ? session.say.giveWild : session.say.changeWild));
    const words = session.words!;
    for (const sound of words.wildOptions) {
      const code = words.wildFor(sound);
      if (code === null) continue;
      parts.picker.append(
        button(sound, () => {
          session.held = { from: "hand", at };
          actions.change(assignHandTile(session.play!, at, code));
        }),
      );
    }
  }

  function renderControls(verdict: GridVerdict) {
    parts.controls.replaceChildren();
    if (session.finishedAt !== null) {
      parts.controls.append(button(session.say.newGame, () => actions.newGame(), true, "km-new"));
      return;
    }
    const now = session.play!;
    const drawButton = button(
      session.say.draw,
      () => {
        session.held = null;
        actions.change(draw(now));
      },
      true,
      "km-draw",
    );
    drawButton.disabled = !mayDraw(now, verdict);
    const tradeButton = button(
      session.say.trade,
      () => {
        if (session.held?.from !== "hand") return;
        const at = session.held.at;
        session.held = null;
        actions.change(trade(now, at));
      },
      false,
      "km-trade",
    );
    tradeButton.disabled = session.held?.from !== "hand" || !mayTrade(now);
    parts.controls.append(
      drawButton,
      tradeButton,
      button(session.say.sort, () => actions.change(sortHand(now)), false, "km-sort"),
      button(
        session.say.liftAll,
        () => {
          session.held = null;
          actions.change(liftAll(now));
        },
        false,
        "km-lift",
      ),
      button(session.say.newGame, () => actions.newGame(), false, "km-new"),
    );
  }

  function renderKeep() {
    parts.keepTitle.textContent = session.say.keep;
    parts.saveJson.textContent = session.say.saveJson;
    parts.saveText.textContent = session.say.saveText;
    parts.load.textContent = session.say.load;
    parts.saveJson.disabled = session.play === null;
    parts.saveText.disabled = session.play === null;
    parts.keepNote.textContent = session.note;
  }

  /** Where the keyboard is, so that it can be put back after everything is drawn again: the zone, and which of it. */
  function keyboardAt(): { zone: "board" | "hand" | "controls" | "picker"; id: string } | null {
    const on = document.activeElement;
    if (on === null || !parts.root.contains(on)) return null;
    const mark = (zone: "board" | "hand" | "controls" | "picker", id: string | undefined) =>
      id === undefined ? null : { zone, id };
    if (parts.board.contains(on)) return mark("board", (on as HTMLElement).dataset.square);
    if (parts.hand.contains(on)) return mark("hand", (on as HTMLElement).dataset.hand);
    if (parts.controls.contains(on)) return mark("controls", (on as HTMLElement).dataset.testid);
    if (parts.picker.contains(on))
      return mark("picker", String([...parts.picker.querySelectorAll("button")].indexOf(on as HTMLButtonElement)));
    return null;
  }

  function keyboardBack(at: ReturnType<typeof keyboardAt>) {
    if (at === null) return;
    const zone = { board: parts.board, hand: parts.hand, controls: parts.controls, picker: parts.picker }[at.zone];
    const found =
      at.zone === "board"
        ? zone.querySelector<HTMLElement>(`[data-square="${at.id}"]`)
        : at.zone === "hand"
          ? zone.querySelector<HTMLElement>(`[data-hand="${at.id}"]`)
          : at.zone === "controls"
            ? zone.querySelector<HTMLElement>(`[data-testid="${at.id}"]`)
            : zone.querySelectorAll<HTMLElement>("button")[Number(at.id)];
    // A button that has become disabled cannot hold the focus; the table keeps it rather than dropping it on the page.
    if (found !== undefined && found !== null && !(found as HTMLButtonElement).disabled)
      found.focus({ preventScroll: true });
  }

  function render() {
    if (session.destroyed) return;
    const where = keyboardAt();
    parts.root.lang = session.locale;
    renderStatus();
    renderKeep();
    const now = session.play;
    if (now === null || session.words === null) return;
    const verdict = actions.verdictOf(now);
    renderBoard(verdict);
    renderPicker();
    renderHand();
    renderControls(verdict);
    keyboardBack(where);
  }

  return { render, renderStatus };
}
