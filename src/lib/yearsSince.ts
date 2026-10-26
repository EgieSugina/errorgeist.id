/** First day of Egie's professional career (local time). */
export const CAREER_START = new Date(2016, 7, 1);

/** Whole completed years between `start` and `now`; never negative. */
export function yearsSince(start: Date, now: Date): number {
  let years = now.getFullYear() - start.getFullYear();
  const beforeAnniversary =
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate());
  if (beforeAnniversary) years -= 1;
  return Math.max(0, years);
}
