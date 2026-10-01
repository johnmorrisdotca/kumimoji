/**
 * ONE SEED A DAY, THE SAME FOR EVERYBODY. A day is a calendar date in UTC and
 * its seed is that date as a number: 2026-10-01 is 20261001, which
 * `generateKumimoji` accepts. It is the same number Tane's `dailySeed` gives,
 * so a page that uses both agrees; nothing here needs Tane.
 *
 * Everybody who deals from the day's seed with the same settings (language,
 * hand, level, length) gets the same bag, in the same order. The race against
 * the clock is then theirs.
 */

const pad = (value: number, width: number): string => String(value).padStart(width, "0");

/** The day a moment falls on, in UTC, written `YYYY-MM-DD`. Throws a `RangeError` for an invalid `Date`. */
export function kumimojiDay(at: Date): string {
  if (Number.isNaN(at.getTime())) throw new RangeError("kumimoji: an invalid Date has no day");
  return `${pad(at.getUTCFullYear(), 4)}-${pad(at.getUTCMonth() + 1, 2)}-${pad(at.getUTCDate(), 2)}`;
}

/** Today's seed, the date as a number: 2026-10-01 is 20261001. The day is UTC, so it is one seed worldwide. */
export function kumimojiDailySeed(at: Date): number {
  const [year, month, day] = kumimojiDay(at).split("-").map(Number) as [number, number, number];
  return year * 10_000 + month * 100 + day;
}
