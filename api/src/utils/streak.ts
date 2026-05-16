import type { habitStatusEnum } from '../db/schema.js';

type HabitStatus = (typeof habitStatusEnum.enumValues)[number];

export function computeNewStreak(
  currentStreak: number,
  countAchieved: number,
  targetAtTime: number,
  status: HabitStatus,
): number {
  if (status === 'paused') return currentStreak;
  return countAchieved >= targetAtTime ? currentStreak + 1 : 0;
}
