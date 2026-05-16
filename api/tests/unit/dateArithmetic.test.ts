import { getSundayStart, isNewWeekDue } from '../../src/utils/dateArithmetic.js';

describe('getSundayStart', () => {
  // 2026-05-10 is a Sunday
  // 2026-05-16 is a Saturday
  // 2026-05-17 is a Sunday

  it('Saturday in UTC → returns previous Sunday', () => {
    const ts = new Date('2026-05-16T12:00:00Z');
    expect(getSundayStart(ts, 'UTC')).toBe('2026-05-10');
  });

  it('Sunday in UTC → returns that same Sunday', () => {
    const ts = new Date('2026-05-17T12:00:00Z');
    expect(getSundayStart(ts, 'UTC')).toBe('2026-05-17');
  });

  it('Saturday UTC crosses into Sunday in Europe/Berlin (UTC+2)', () => {
    // 2026-05-16T23:00:00Z → 2026-05-17T01:00:00 Berlin (Sunday)
    const ts = new Date('2026-05-16T23:00:00Z');
    expect(getSundayStart(ts, 'Europe/Berlin')).toBe('2026-05-17');
  });

  it('Saturday evening in Europe/Berlin is still Saturday locally', () => {
    // 2026-05-16T12:00:00Z → 2026-05-16T14:00:00 Berlin (Saturday)
    const ts = new Date('2026-05-16T12:00:00Z');
    expect(getSundayStart(ts, 'Europe/Berlin')).toBe('2026-05-10');
  });

  it('Sunday UTC is still Saturday in America/New_York (UTC-4)', () => {
    // 2026-05-17T03:00:00Z → 2026-05-16T23:00:00 New York (Saturday)
    const ts = new Date('2026-05-17T03:00:00Z');
    expect(getSundayStart(ts, 'America/New_York')).toBe('2026-05-10');
  });

  it('Sunday morning in America/New_York → returns that Sunday', () => {
    // 2026-05-17T10:00:00Z → 2026-05-17T06:00:00 New York (Sunday)
    const ts = new Date('2026-05-17T10:00:00Z');
    expect(getSundayStart(ts, 'America/New_York')).toBe('2026-05-17');
  });

  it('midweek Wednesday UTC → returns the preceding Sunday', () => {
    // 2026-05-13 is a Wednesday
    const ts = new Date('2026-05-13T12:00:00Z');
    expect(getSundayStart(ts, 'UTC')).toBe('2026-05-10');
  });
});

describe('isNewWeekDue', () => {
  it('returns true when lastWeekStart is null', () => {
    expect(isNewWeekDue(null, 'UTC')).toBe(true);
  });

  it('returns false when lastWeekStart equals current Sunday', () => {
    const currentSunday = getSundayStart(new Date(), 'UTC');
    expect(isNewWeekDue(currentSunday, 'UTC')).toBe(false);
  });

  it('returns true when lastWeekStart is an older Sunday', () => {
    expect(isNewWeekDue('2020-01-05', 'UTC')).toBe(true);
  });
});
