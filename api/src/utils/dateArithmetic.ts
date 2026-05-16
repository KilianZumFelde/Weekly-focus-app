/**
 * Returns the ISO date string (YYYY-MM-DD) of the Sunday that starts
 * the week containing `timestamp`, evaluated in the given IANA timezone.
 */
export function getSundayStart(timestamp: Date, timezone: string): string {
  const localDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(timestamp);

  const weekdayStr = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, weekday: 'short',
  }).format(timestamp);

  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const dayOfWeek = dayMap[weekdayStr] ?? 0;

  const parts = localDateStr.split('-');
  const year  = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10);
  const day   = parseInt(parts[2]!, 10);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - dayOfWeek);

  return d.toISOString().slice(0, 10);
}

/**
 * Returns true if a new week has started since `lastWeekStart`.
 * Uses the user's timezone to determine the current Sunday.
 */
export function isNewWeekDue(lastWeekStart: string | null, timezone: string): boolean {
  const currentSunday = getSundayStart(new Date(), timezone);
  if (!lastWeekStart) return true;
  return currentSunday > lastWeekStart;
}
