import type { Turn } from "./kumimoji.types.ts";
import type { Area, View } from "./tableView.ts";

/**
 * TURNING THE TABLE, WITH EVERY TILE KEPT UPRIGHT. John, 2026-09-28: "if you
 * rotate the board like flip it 180° for example then all the tiles will flip
 * 180° to right themselves directly just so that they're not backwards for you
 * or upside down."
 *
 * So the turn is a mapping of squares, never a rotation of the picture: the
 * grid (its squares, `encodeGrid`, the kept game, the check) stays where the
 * player built it, and only WHERE each square is drawn is turned — about the
 * middle of square (0, 0), a quarter clockwise per press. A tile drawn at its
 * turned place is drawn as it always is, so its letter reads the right way up
 * whichever way the table faces. A point on the screen means the square drawn
 * there, so a tap or a drop lands where the finger is.
 *
 * Pure, like the rest of the view (`tableView.ts`), which works on the turned
 * squares unchanged: fitting, zooming and panning are all in screen terms.
 */

/** The next turn a press gives: a quarter clockwise, and four presses back to the start.
 *
 * @param turn - The number of quarter turns of the view.
 * @returns The next turn a press gives: a quarter clockwise, and four presses back to the start.
 * @example
 * ```ts
 * import { nextTurn } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(nextTurn(3));
 * ```
 */
export function nextTurn(turn: Turn): Turn {
  return ((turn + 1) % 4) as Turn;
}

/** `0 - n` rather than `-n`, so a square is never named "-0". */
const negate = (n: number) => 0 - n;

/**
 * Where square (row, col) of the grid is drawn with the table turned: a
 * quarter clockwise sends a word running right to one running down, and one
 * running down to one running left. It is linear, so it turns a step (a
 * direction) as well as a square.
 *
 * @param row - The integer row coordinate, which may be negative.
 * @param col - The integer column coordinate, which may be negative.
 * @param turn - The number of quarter turns of the view.
 * @returns Where square (row, col) of the grid is drawn with the table turned: a quarter clockwise sends a word running right to one running down, and one running down to one running left. It is linear, so it turns a step (a direction) as well as a square.
 * @example
 * ```ts
 * import { turnPlace } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(turnPlace(1,2,1));
 * ```
 */
export function turnPlace(row: number, col: number, turn: Turn): { row: number; col: number } {
  switch (turn) {
    case 0:
      return { row, col };
    case 1:
      return { row: col, col: negate(row) };
    case 2:
      return { row: negate(row), col: negate(col) };
    case 3:
      return { row: negate(col), col: row };
  }
}

/** The grid's square drawn at (row, col) of the turned table: `turnPlace` undone.
 *
 * @param row - The integer row coordinate, which may be negative.
 * @param col - The integer column coordinate, which may be negative.
 * @param turn - The number of quarter turns of the view.
 * @returns The grid's square drawn at (row, col) of the turned table: `turnPlace` undone.
 * @example
 * ```ts
 * import { unturnPlace } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(unturnPlace(1,2,1));
 * ```
 */
export function unturnPlace(row: number, col: number, turn: Turn): { row: number; col: number } {
  return turnPlace(row, col, ((4 - turn) % 4) as Turn);
}

/** The squares a turned table shows: the grid's area, turned.
 *
 * @param area - The occupied table bounds.
 * @param turn - The number of quarter turns of the view.
 * @returns The squares a turned table shows: the grid's area, turned.
 * @example
 * ```ts
 * import { turnArea } from "@johnmorrisdotca/kumimoji";
 *
 * const area = {top:0,left:0,rows:1,cols:3};
 * console.log(turnArea(area,1));
 * ```
 */
export function turnArea(area: Area, turn: Turn): Area {
  const a = turnPlace(area.top, area.left, turn);
  const b = turnPlace(area.top + area.rows - 1, area.left + area.cols - 1, turn);
  return { top: Math.min(a.row, b.row), left: Math.min(a.col, b.col), rows: Math.abs(a.row - b.row) + 1, cols: Math.abs(a.col - b.col) + 1 };
}

/**
 * A view the player zoomed or panned, turned a quarter clockwise with the
 * table about the middle of its box: the same zoom, and the spot of the table
 * that was in the middle stays there. (A fitted view simply fits again.)
 *
 * On the screen a square's corner is `x + col * tile`; the turn takes a point
 * (row v, col u) of the table to (row u, col 1 - v), which is a quarter turn
 * about the middle of square (0, 0) — the same turn as `turnPlace`.
 *
 * @param view - The current tile size and pixel translation.
 * @param width - The available viewport width in pixels.
 * @param height - The available viewport height in pixels.
 * @returns A view the player zoomed or panned, turned a quarter clockwise with the table about the middle of its box: the same zoom, and the spot of the table that was in the middle stays there. (A fitted view simply fits again.)
 * @example
 * ```ts
 * import { turnView } from "@johnmorrisdotca/kumimoji";
 *
 * const view = {tile:40,x:100,y:100};
 * console.log(turnView(view,640,480));
 * ```
 */
export function turnView(view: View, width: number, height: number): View {
  const px = width / 2;
  const py = height / 2;
  const u = (px - view.x) / view.tile;
  const v = (py - view.y) / view.tile;
  return { tile: view.tile, x: px - (1 - v) * view.tile, y: py - u * view.tile };
}

/** The screen's four ways, as a step of one square, with the arrow that draws each and its name. */
const WAYS = [
  { row: 0, col: 1, arrow: "→", name: "right" },
  { row: 1, col: 0, arrow: "↓", name: "down" },
  { row: 0, col: -1, arrow: "←", name: "left" },
  { row: -1, col: 0, arrow: "↑", name: "up" },
] as const;

/**
 * Which way typed letters run ON THE SCREEN. Typing lays a word across or
 * down the grid, so that it reads as a word; with the table turned, that is
 * another way on the screen, and the cursor's arrow points it.
 *
 * @param across - Whether to lay or type horizontally rather than vertically.
 * @param turn - The number of quarter turns of the view.
 * @returns Which way typed letters run ON THE SCREEN. Typing lays a word across or down the grid, so that it reads as a word; with the table turned, that is another way on the screen, and the cursor's arrow points it.
 * @example
 * ```ts
 * import { typingWay } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(typingWay(true,1));
 * ```
 */
export function typingWay(across: boolean, turn: Turn): { arrow: string; name: string } {
  const step = turnPlace(across ? 0 : 1, across ? 1 : 0, turn);
  const way = WAYS.find((one) => one.row === step.row && one.col === step.col)!;
  return { arrow: way.arrow, name: way.name };
}

/** The keyboard's arrows, as a step on the screen. */
const ARROW_KEYS: Readonly<Record<string, { row: number; col: number }>> = {
  ArrowRight: { row: 0, col: 1 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowUp: { row: -1, col: 0 },
};

/** The step in the grid an arrow key means: the square that way on the screen, with the table turned. Null for any other key.
 *
 * @param key - The keyboard key identifier.
 * @param turn - The number of quarter turns of the view.
 * @returns The step in the grid an arrow key means: the square that way on the screen, with the table turned. null for any other key.
 * @example
 * ```ts
 * import { arrowStep } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(arrowStep("ArrowRight",1));
 * ```
 */
export function arrowStep(key: string, turn: Turn): { row: number; col: number } | null {
  const step = ARROW_KEYS[key];
  return step === undefined ? null : unturnPlace(step.row, step.col, turn);
}
