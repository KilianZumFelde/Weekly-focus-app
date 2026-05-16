// Resolves natural-language time phrases to structured reminder objects.
// All date arithmetic is done in the caller's timezone.

export type ResolvedReminder =
  | { type: 'one_shot'; fireAt: string }
  | { type: 'recurring_until_done'; dailyTime: string };

export function resolveRelativeTime(
  phrase: string,
  now: Date,
  timezone: string,
): ResolvedReminder | null {
  const p = phrase.toLowerCase().trim();

  // Recurring patterns
  if (/every\s+(morning|day)/.test(p)) return { type: 'recurring_until_done', dailyTime: '09:00' };
  if (/every\s+evening/.test(p)) return { type: 'recurring_until_done', dailyTime: '20:00' };

  // "in N hours / minutes" — pure UTC arithmetic, no timezone needed
  const inHoursMatch = p.match(/in\s+(\d+)\s+hours?/);
  if (inHoursMatch?.[1]) {
    const ms = parseInt(inHoursMatch[1]) * 60 * 60 * 1000;
    return { type: 'one_shot', fireAt: new Date(now.getTime() + ms).toISOString() };
  }
  const inMinsMatch = p.match(/in\s+(\d+)\s+minutes?/);
  if (inMinsMatch?.[1]) {
    const ms = parseInt(inMinsMatch[1]) * 60 * 1000;
    return { type: 'one_shot', fireAt: new Date(now.getTime() + ms).toISOString() };
  }

  const local = getLocalParts(now, timezone);

  // "tonight" → today at 20:00 local
  if (/tonight/.test(p)) {
    return { type: 'one_shot', fireAt: localToUtc(local.year, local.month, local.day, 20, 0, timezone).toISOString() };
  }

  // "tomorrow [time-of-day]"
  if (/tomorrow/.test(p)) {
    const { h, m } = parseTimeOfDay(p, 9);
    const tomorrow = addDays(local.year, local.month, local.day, 1);
    return { type: 'one_shot', fireAt: localToUtc(tomorrow.year, tomorrow.month, tomorrow.day, h, m, timezone).toISOString() };
  }

  // "next <weekday> [at time]"
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const nextDayMatch = p.match(/next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
  if (nextDayMatch?.[1]) {
    const targetDow = dayNames.indexOf(nextDayMatch[1]);
    let daysAhead = targetDow - local.weekday;
    if (daysAhead <= 0) daysAhead += 7;
    const { h, m } = parseTimeOfDay(p, 9);
    const target = addDays(local.year, local.month, local.day, daysAhead);
    return { type: 'one_shot', fireAt: localToUtc(target.year, target.month, target.day, h, m, timezone).toISOString() };
  }

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTimeOfDay(phrase: string, defaultHour: number): { h: number; m: number } {
  if (/morning/.test(phrase)) return { h: 9, m: 0 };
  if (/afternoon/.test(phrase)) return { h: 14, m: 0 };
  if (/evening/.test(phrase)) return { h: 20, m: 0 };
  const atMatch = phrase.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (atMatch?.[1]) {
    let h = parseInt(atMatch[1]);
    const m = parseInt(atMatch[2] ?? '0');
    const ampm = atMatch[3];
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return { h, m };
  }
  return { h: defaultHour, m: 0 };
}

function addDays(year: number, month: number, day: number, n: number) {
  // JavaScript Date overflows month/day correctly when day > days-in-month
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function getLocalParts(date: Date, timezone: string) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', weekday: 'long', hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0');
  const weekdayStr = parts.find(p => p.type === 'weekday')?.value?.toLowerCase() ?? '';
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24, // guard against locale returning 24 for midnight
    minute: get('minute'),
    weekday: dayNames.indexOf(weekdayStr),
  };
}

// Converts a local calendar date+time in the given timezone to a UTC Date.
// Uses a single-iteration offset correction — accurate for non-ambiguous times.
function localToUtc(
  year: number, month: number, day: number,
  hour: number, minute: number,
  timezone: string,
): Date {
  const candidate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const localParts = getLocalParts(candidate, timezone);
  const localMs = Date.UTC(localParts.year, localParts.month - 1, localParts.day, localParts.hour, localParts.minute);
  const targetMs = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(candidate.getTime() - (localMs - targetMs));
}
