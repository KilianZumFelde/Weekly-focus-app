import { computeNewStreak } from '../../src/utils/streak.js';

describe('computeNewStreak', () => {
  it('target met exactly → increments streak', () => {
    expect(computeNewStreak(3, 4, 4, 'active')).toBe(4);
  });

  it('target missed → resets streak to 0', () => {
    expect(computeNewStreak(5, 2, 4, 'active')).toBe(0);
  });

  it('over-target → increments streak', () => {
    expect(computeNewStreak(2, 6, 4, 'active')).toBe(3);
  });

  it('paused habit → streak unchanged regardless of count', () => {
    expect(computeNewStreak(7, 0, 4, 'paused')).toBe(7);
  });

  it('paused habit with full count → streak still unchanged', () => {
    expect(computeNewStreak(7, 4, 4, 'paused')).toBe(7);
  });

  it('streak starting at 0, target met → becomes 1', () => {
    expect(computeNewStreak(0, 3, 3, 'active')).toBe(1);
  });

  it('count 0 → resets streak', () => {
    expect(computeNewStreak(10, 0, 4, 'active')).toBe(0);
  });
});
