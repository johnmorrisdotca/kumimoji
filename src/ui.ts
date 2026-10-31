/**
 * Kumimoji played in the browser, in plain DOM: a whole game alone
 * (`mountKumimoji`), and the window a board shows the grid through
 * (`boardModel`). Its own entry, so the rules never carry a stylesheet.
 */

export {
  KUMIMOJI_STRINGS,
  type KumimojiLocale,
  type KumimojiStrings,
  kumimojiSay,
  kumimojiStrings,
} from "./strings.ts";
export { BOARD_LEAST, BOARD_MARGIN, type BoardModel, type BoardSquare, boardModel, type TileMark } from "./ui/board.ts";
export { type Cloth, clothVars, isCloth, KUMIMOJI_CLOTHS } from "./ui/cloth.ts";
export { type KumimojiTableHandle, type KumimojiTableOptions, mountKumimoji } from "./ui/mount.ts";
export { KUMIMOJI_STYLE } from "./ui/style.ts";
