import { resolveRelativeTime, type ResolvedReminder } from '../../src/utils/reminderTime.js';

// Fixed reference: 2026-05-16 (Saturday) 10:00 UTC = 12:00 Europe/Berlin (UTC+2, CEST)
const NOW = new Date('2026-05-16T10:00:00Z');
const TZ = 'Europe/Berlin';

function assertOneShot(result: ResolvedReminder | null): asserts result is { type: 'one_shot'; fireAt: string } {
  expect(result).not.toBeNull();
  expect(result!.type).toBe('one_shot');
}

describe('resolveRelativeTime', () => {
  describe('"tomorrow morning"', () => {
    it('returns one_shot reminder at 09:00 next day in timezone', () => {
      const result = resolveRelativeTime('tomorrow morning', NOW, TZ);
      assertOneShot(result);
      // 2026-05-17 09:00 CEST (UTC+2) = 2026-05-17T07:00:00.000Z
      expect(result.fireAt).toBe('2026-05-17T07:00:00.000Z');
    });
  });

  describe('"in 2 hours"', () => {
    it('adds 2 hours to now in UTC', () => {
      const result = resolveRelativeTime('in 2 hours', NOW, TZ);
      assertOneShot(result);
      expect(result.fireAt).toBe('2026-05-16T12:00:00.000Z');
    });
  });

  describe('"next Tuesday at 3pm"', () => {
    it('resolves to upcoming Tuesday 15:00 in timezone', () => {
      // now is Saturday 2026-05-16 → next Tuesday is 2026-05-19
      const result = resolveRelativeTime('next Tuesday at 3pm', NOW, TZ);
      assertOneShot(result);
      // 2026-05-19 15:00 CEST (UTC+2) = 2026-05-19T13:00:00.000Z
      expect(result.fireAt).toBe('2026-05-19T13:00:00.000Z');
    });
  });

  describe('"tonight"', () => {
    it('returns today at 20:00 in timezone', () => {
      const result = resolveRelativeTime('tonight', NOW, TZ);
      assertOneShot(result);
      // 2026-05-16 20:00 CEST = 2026-05-16T18:00:00.000Z
      expect(result.fireAt).toBe('2026-05-16T18:00:00.000Z');
    });
  });

  describe('"in 30 minutes"', () => {
    it('adds 30 minutes to now', () => {
      const result = resolveRelativeTime('in 30 minutes', NOW, TZ);
      assertOneShot(result);
      expect(result.fireAt).toBe('2026-05-16T10:30:00.000Z');
    });
  });

  describe('"every morning"', () => {
    it('returns recurring reminder at 09:00', () => {
      const result = resolveRelativeTime('every morning', NOW, TZ);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('recurring_until_done');
      if (result !== null && result.type === 'recurring_until_done') {
        expect(result.dailyTime).toBe('09:00');
      }
    });
  });

  describe('timezone edge cases', () => {
    it('US Eastern DST: "tomorrow morning" crosses timezone boundary', () => {
      // 2026-05-16 00:00 UTC = 2026-05-15 20:00 EDT (UTC-4)
      // So "tomorrow" in Eastern time is 2026-05-16
      const nowEt = new Date('2026-05-16T00:00:00Z');
      const result = resolveRelativeTime('tomorrow morning', nowEt, 'America/New_York');
      assertOneShot(result);
      // 2026-05-16 09:00 EDT (UTC-4) = 2026-05-16T13:00:00.000Z
      expect(result.fireAt).toBe('2026-05-16T13:00:00.000Z');
    });

    it('Asia/Tokyo: "tomorrow afternoon" uses UTC+9', () => {
      // 2026-05-16 10:00 UTC = 2026-05-16 19:00 JST → "tomorrow" in Tokyo = 2026-05-17
      const result = resolveRelativeTime('tomorrow afternoon', NOW, 'Asia/Tokyo');
      assertOneShot(result);
      // 2026-05-17 14:00 JST (UTC+9) = 2026-05-17T05:00:00.000Z
      expect(result.fireAt).toBe('2026-05-17T05:00:00.000Z');
    });

    it('"next Monday" when today is Sunday wraps correctly', () => {
      // 2026-05-17 is a Sunday; next Monday should be 2026-05-18
      const nowSunday = new Date('2026-05-17T10:00:00Z'); // Berlin = 12:00, still Sunday
      const result = resolveRelativeTime('next Monday', nowSunday, TZ);
      assertOneShot(result);
      // 2026-05-18 09:00 CEST = 2026-05-18T07:00:00.000Z
      expect(result.fireAt).toBe('2026-05-18T07:00:00.000Z');
    });
  });

  describe('unrecognized phrase', () => {
    it('returns null', () => {
      expect(resolveRelativeTime('xyzzy', NOW, TZ)).toBeNull();
      expect(resolveRelativeTime('', NOW, TZ)).toBeNull();
    });
  });
});
