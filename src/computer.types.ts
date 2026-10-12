import type { PartyGame } from "./party.types.ts";

/** What a computer did in one step of its turn, for the line over its table.
 *
 * @example
 * ```ts
 * import type { ComputerSaid } from "@johnmorrisdotca/kumimoji";
 *
 * const value: ComputerSaid = {kind:"drew"};
 * console.log(value);
 * ```
 */
export type ComputerSaid =
  | { kind: "rebuilt" }
  | { kind: "laid"; word: string }
  | { kind: "drew" }
  | { kind: "traded"; tile: string }
  | { kind: "done"; out: boolean }
  | { kind: "resigned" };

/** One step of a computer's turn: the game after it, and what it did. The last step's game is the one kept.
 *
 * @example
 * ```ts
 * import { startParty } from "@johnmorrisdotca/kumimoji";
 * import type { ComputerStep } from "@johnmorrisdotca/kumimoji";
 *
 * const settings = {size:3,level:"hard",seed:44,gameLength:"short",language:"english",doubleSet:false,diagonals:false,hints:false} as const;
 * const bag = "catdogsun";
 * const game = startParty(settings,bag,["Seat 1","Seat 2"]);
 * const value: ComputerStep = {game,said:{kind:"drew"}};
 * console.log(value);
 * ```
 */
export type ComputerStep = { game: PartyGame; said: ComputerSaid };
