/**
 * A seeded random, so that one seed deals one game in every browser: two
 * players racing the same bag, or one game opened again tomorrow. mulberry32
 * is small, fast and good enough for shuffling tiles; nothing here is a
 * credential.
 */

/** A number in [0, 1), like `Math.random`, from a stream a seed fixes.
 *
 * @example
 * ```ts
 * import type { Random } from "@johnmorrisdotca/kumimoji";
 * import { seededRandom } from "@johnmorrisdotca/kumimoji";
 *
 * const value: Random = seededRandom(42);
 * console.log(value);
 * ```
 */
export type Random = () => number;

/** A stream of numbers in [0, 1) that the seed fixes: mulberry32.
 *
 * @param seed - The numeric seed for deterministic deals or random draws.
 * @returns A stream of numbers in [0, 1) that the seed fixes: mulberry32.
 * @example
 * ```ts
 * import { seededRandom } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(seededRandom(42)());
 * ```
 */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A copy of the list in a random order (Fisher–Yates).
 *
 * @param items - The items to copy and shuffle.
 * @param random - A reproducible random function returning values in [0,1).
 * @returns A copy of the list in a random order (Fisher–Yates).
 * @example
 * ```ts
 * import { seededRandom, shuffled } from "@johnmorrisdotca/kumimoji";
 *
 * console.log(shuffled(["c","a","t"],seededRandom(42)));
 * ```
 */
export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
