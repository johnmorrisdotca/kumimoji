import { boundsOf, placeOf, type Tiles } from "./grid.ts";

/**
 * HOW THE TABLE IS LOOKED AT: which squares are shown, how big a tile is
 * drawn and where. Pure, and apart from the game (`play.ts`): the tiles are
 * where the player put them whatever the view, and a view is a function of
 * the tiles, the screen and the player's own zooming and panning.
 *
 * John, 2026-09-26: no board — "literally there is no board in the real world
 * game." The table shown is the tiles' own extent plus a margin all round, so
 * there is always room to build outward, and it zooms to fit the crossword:
 * big tiles for a first word, smaller as the grid spreads, never smaller than
 * a thumb can press (`TABLE.tileLeast`). Past that the table pans instead.
 *
 * @example
 * ```ts
 * import { TABLE } from "@johnmorrisdotca/kumimoji";
 * console.log(TABLE);
 * ```
 */
export const TABLE = {
  /** Empty squares shown beyond the tiles on every side. */
  margin: 2,
  /** The smallest a tile is drawn, in CSS pixels: a comfortable thumb. */
  tileLeast: 32,
  /**
   * The smallest a player may zoom a tile to by hand, to see a big crossword
   * whole: too small to press, and not meant to be (John, 2026-09-28: "I would
   * like to zoom out even further"). Fit never goes below `tileLeast`.
   */
  zoomLeast: 12,
  /** The largest a fitted tile is drawn: a first word does not fill a desk. */
  tileMost: 56,
  /**
   * The shorter side of a table past which `tileMost` grows with it (`fittedMost`):
   * the Regular desk table's height, 34rem. No phone's or tablet's table is taller
   * or wider across its shorter side, so none changes; only a table the player made
   * bigger with the board size chooser (`BoardScale`) grows its squares, in
   * proportion to the table everybody had.
   */
  growsFrom: 544,
  /** The largest a player may zoom a tile to by hand. */
  zoomMost: 88,
  /** How near an edge of the table a dragged tile starts it panning, and how fast, in pixels a frame. */
  edge: 36,
  edgeStep: 8,
  /** How long a dragged tile must stay near an edge before the table pans: crossing an edge on the way in is not asking to pan. */
  edgeDwellMs: 350,
} as const;

/** The squares shown: from `top`/`left`, `rows` by `cols`.
 *
 * @example
 * ```ts
 * import type { Area } from "@johnmorrisdotca/kumimoji";
 *
 * const area = {top:0,left:0,rows:1,cols:3};
 * const value: Area = area;
 * console.log(value);
 * ```
 */
export type Area = { top: number; left: number; rows: number; cols: number };

/** A view: a tile's side in pixels, and where the corner of square (0, 0) is drawn.
 *
 * @example
 * ```ts
 * import type { View } from "@johnmorrisdotca/kumimoji";
 *
 * const view = {tile:40,x:100,y:100};
 * const value: View = view;
 * console.log(value);
 * ```
 */
export type View = { tile: number; x: number; y: number };

/** The squares to show: the tiles' extent and the margin, or the margin round square (0, 0) on an empty table. Extra squares (the one a typed letter goes to) are kept in.
 *
 * @param tiles - The map from row,column square names to internal tile codes.
 * @param also - Additional square names to include in the table bounds.
 * @returns The squares to show: the tiles' extent and the margin, or the margin round square (0, 0) on an empty table. Extra squares (the one a typed letter goes to) are kept in.
 * @example
 * ```ts
 * import { tableArea } from "@johnmorrisdotca/kumimoji";
 *
 * const tiles = new Map([["0,0","c"],["0,1","a"],["0,2","t"]]);
 * console.log(tableArea(tiles));
 * ```
 */
export function tableArea(tiles: Tiles, also: readonly string[] = []): Area {
  const bounds = boundsOf(tiles) ?? { top: 0, left: 0, bottom: 0, right: 0 };
  let { top, left, bottom, right } = bounds;
  for (const square of also) {
    const { row, col } = placeOf(square);
    top = Math.min(top, row);
    left = Math.min(left, col);
    bottom = Math.max(bottom, row);
    right = Math.max(right, col);
  }
  const m = TABLE.margin;
  return { top: top - m, left: left - m, rows: bottom - top + 1 + 2 * m, cols: right - left + 1 + 2 * m };
}

/**
 * The largest a fitted tile is drawn in a table this big. `tileMost` in any
 * table up to `growsFrom` across its shorter side, which is every phone's and
 * the Regular desk table; past that, in proportion, so a table the player asked
 * to be Large or Full (`BoardScale`) draws bigger squares rather than only more
 * of them — never past what a hand may zoom to.
 *
 * @param width - The available viewport width in pixels.
 * @param height - The available viewport height in pixels.
 * @returns The largest a fitted tile is drawn in a table this big. `tileMost` in any table up to `growsFrom` across its shorter side, which is every phone's and the Regular desk table; past that, in proportion, so a table the player asked to be Large or Full (`BoardScale`) draws bigger squares rather than only more of them — never past what a hand may zoom to.
 * @example
 * ```ts
 * import { fittedMost } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(fittedMost(640,480));
 * ```
 */
export function fittedMost(width: number, height: number): number {
  const side = Math.min(width, height);
  if (!(side > TABLE.growsFrom)) return TABLE.tileMost;
  return Math.min(TABLE.zoomMost, Math.floor((TABLE.tileMost * side) / TABLE.growsFrom));
}

/**
 * The view that shows the whole area, centred, its tiles as big as fit between
 * the least and the most. A picture nobody presses (a finished grid, the
 * set-up preview) passes a smaller least, so a whole grid fits its box.
 *
 * @param area - The occupied table bounds.
 * @param width - The available viewport width in pixels.
 * @param height - The available viewport height in pixels.
 * @param least - The minimum permitted tile size.
 * @returns The view that shows the whole area, centred, its tiles as big as fit between the least and the most. A picture nobody presses (a finished grid, the set-up preview) passes a smaller least, so a whole grid fits its box.
 * @example
 * ```ts
 * import { fitView } from "@johnmorrisdotca/kumimoji";
 *
 * const area = {top:0,left:0,rows:1,cols:3};
 * console.log(fitView(area,640,480));
 * ```
 */
export function fitView(area: Area, width: number, height: number, least: number = TABLE.tileLeast): View {
  const fits = Math.min(width / area.cols, height / area.rows);
  const tile = Math.max(least, Math.min(fittedMost(width, height), Math.floor(fits)));
  return {
    tile,
    x: Math.round((width - area.cols * tile) / 2 - area.left * tile),
    y: Math.round((height - area.rows * tile) / 2 - area.top * tile),
  };
}

/** Whether the area, at this view's size, is bigger than the screen: then the table pans.
 *
 * @param area - The occupied table bounds.
 * @param view - The current tile size and pixel translation.
 * @param width - The available viewport width in pixels.
 * @param height - The available viewport height in pixels.
 * @returns Whether the area, at this view's size, is bigger than the screen: then the table pans.
 * @example
 * ```ts
 * import { overflows } from "@johnmorrisdotca/kumimoji";
 *
 * const area = {top:0,left:0,rows:1,cols:3};
 * const view = {tile:40,x:100,y:100};
 * console.log(overflows(area,view,640,480));
 * ```
 */
export function overflows(area: Area, view: View, width: number, height: number): boolean {
  return area.cols * view.tile > width + 0.5 || area.rows * view.tile > height + 0.5;
}

/** Zoomed by `factor` about the point (px, py) on the screen, which stays over the same spot of the table.
 *
 * @param view - The current tile size and pixel translation.
 * @param factor - The positive scale factor for zooming.
 * @param px - The horizontal pointer position in pixels.
 * @param py - The vertical pointer position in pixels.
 * @returns Zoomed by `factor` about the point (px, py) on the screen, which stays over the same spot of the table.
 * @example
 * ```ts
 * import { zoomView } from "@johnmorrisdotca/kumimoji";
 *
 * const view = {tile:40,x:100,y:100};
 * console.log(zoomView(view,1.2,320,240));
 * ```
 */
export function zoomView(view: View, factor: number, px: number, py: number): View {
  const tile = Math.max(TABLE.zoomLeast, Math.min(TABLE.zoomMost, view.tile * factor));
  const scale = tile / view.tile;
  return { tile, x: px - (px - view.x) * scale, y: py - (py - view.y) * scale };
}

/** The view moved by `dx` and `dy` screen pixels.
 *
 * @param view - The current tile size and pixel translation.
 * @param dx - The horizontal pixel movement.
 * @param dy - The vertical pixel movement.
 * @returns The view moved by `dx` and `dy` screen pixels.
 * @example
 * ```ts
 * import { panView } from "@johnmorrisdotca/kumimoji";
 *
 * const view = {tile:40,x:100,y:100};
 * console.log(panView(view,20,10));
 * ```
 */
export function panView(view: View, dx: number, dy: number): View {
  return { ...view, x: view.x + dx, y: view.y + dy };
}

/**
 * Kept within reach: some of the area always on the screen, so a pan can
 * never lose the crossword. A quarter of the screen or two tiles, whichever
 * is less, stays in view on every side.
 *
 * @param view - The current tile size and pixel translation.
 * @param area - The occupied table bounds.
 * @param width - The available viewport width in pixels.
 * @param height - The available viewport height in pixels.
 * @returns Kept within reach: some of the area always on the screen, so a pan can never lose the crossword. A quarter of the screen or two tiles, whichever is less, stays in view on every side.
 * @example
 * ```ts
 * import { keepInReach } from "@johnmorrisdotca/kumimoji";
 *
 * const area = {top:0,left:0,rows:1,cols:3};
 * const view = {tile:40,x:100,y:100};
 * console.log(keepInReach(view,area,640,480));
 * ```
 */
export function keepInReach(view: View, area: Area, width: number, height: number): View {
  const hold = (span: number) => Math.min(span / 4, view.tile * 2);
  const left = view.x + area.left * view.tile;
  const top = view.y + area.top * view.tile;
  const right = left + area.cols * view.tile;
  const bottom = top + area.rows * view.tile;
  let { x, y } = view;
  if (right < hold(width)) x += hold(width) - right;
  if (left > width - hold(width)) x -= left - (width - hold(width));
  if (bottom < hold(height)) y += hold(height) - bottom;
  if (top > height - hold(height)) y -= top - (height - hold(height));
  return { ...view, x, y };
}

/** The square under a point on the screen.
 *
 * @param view - The current tile size and pixel translation.
 * @param px - The horizontal pointer position in pixels.
 * @param py - The vertical pointer position in pixels.
 * @returns The square under a point on the screen.
 * @example
 * ```ts
 * import { squareUnder } from "@johnmorrisdotca/kumimoji";
 *
 * const view = {tile:40,x:100,y:100};
 * console.log(squareUnder(view,100,100));
 * ```
 */
export function squareUnder(view: View, px: number, py: number): { row: number; col: number } {
  return { row: Math.floor((py - view.y) / view.tile), col: Math.floor((px - view.x) / view.tile) };
}

/** Which way, and how far, the table pans this frame for a tile dragged to (px, py): toward the edge it is near.
 *
 * @param px - The horizontal pointer position in pixels.
 * @param py - The vertical pointer position in pixels.
 * @param width - The available viewport width in pixels.
 * @param height - The available viewport height in pixels.
 * @returns Which way, and how far, the table pans this frame for a tile dragged to (px, py): toward the edge it is near.
 * @example
 * ```ts
 * import { edgePan } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(edgePan(5,240,640,480));
 * ```
 */
export function edgePan(px: number, py: number, width: number, height: number): { dx: number; dy: number } {
  const step = (near: number) => (near < TABLE.edge ? TABLE.edgeStep * (1 - Math.max(0, near) / TABLE.edge) : 0);
  return { dx: step(px) - step(width - px), dy: step(py) - step(height - py) };
}
