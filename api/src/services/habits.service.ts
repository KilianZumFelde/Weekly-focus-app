import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { habits, habitWeekRecords } from '../db/schema.js';
import type { CreateHabitBody, PatchHabitBody } from '@shared/types';

function currentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - day);
  return sunday.toISOString().slice(0, 10);
}

function toHabitResponse(
  row: typeof habits.$inferSelect,
  weekRecord: typeof habitWeekRecords.$inferSelect | null,
) {
  return {
    id: row.id,
    themeId: row.themeId,
    goalId: row.goalId,
    title: row.title,
    weeklyTarget: row.weeklyTarget,
    status: row.status,
    currentStreak: row.currentStreak,
    bestEverStreak: row.bestEverStreak,
    currentWeekRecord: weekRecord
      ? {
          weekStart: weekRecord.weekStart,
          countAchieved: weekRecord.countAchieved,
          targetAtTime: weekRecord.targetAtTime,
        }
      : { weekStart: currentWeekStart(), countAchieved: 0, targetAtTime: row.weeklyTarget },
  };
}

export async function getHabits(userId: string) {
  const weekStart = currentWeekStart();
  const rows = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), inArray(habits.status, ['active', 'paused'])));

  const results = await Promise.all(
    rows.map(async (habit) => {
      const [record] = await db
        .select()
        .from(habitWeekRecords)
        .where(and(eq(habitWeekRecords.habitId, habit.id), eq(habitWeekRecords.weekStart, weekStart)))
        .limit(1);
      return toHabitResponse(habit, record ?? null);
    }),
  );
  return results;
}

export async function createHabit(userId: string, body: CreateHabitBody) {
  const [row] = await db
    .insert(habits)
    .values({
      userId,
      themeId: body.themeId,
      goalId: body.goalId ?? null,
      title: body.title,
      weeklyTarget: body.weeklyTarget,
    })
    .returning();

  return toHabitResponse(row!, null);
}

export async function updateHabit(userId: string, habitId: string, body: PatchHabitBody) {
  const [row] = await db
    .update(habits)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.themeId !== undefined && { themeId: body.themeId }),
      ...(body.goalId !== undefined && { goalId: body.goalId }),
      ...(body.weeklyTarget !== undefined && { weeklyTarget: body.weeklyTarget }),
    })
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .returning();

  if (!row) return null;
  const weekStart = currentWeekStart();
  const [record] = await db
    .select()
    .from(habitWeekRecords)
    .where(and(eq(habitWeekRecords.habitId, habitId), eq(habitWeekRecords.weekStart, weekStart)))
    .limit(1);

  // Keep targetAtTime in sync when weeklyTarget changes
  if (body.weeklyTarget !== undefined && record) {
    await db
      .update(habitWeekRecords)
      .set({ targetAtTime: body.weeklyTarget })
      .where(eq(habitWeekRecords.id, record.id));
    return toHabitResponse(row, { ...record, targetAtTime: body.weeklyTarget });
  }

  return toHabitResponse(row, record ?? null);
}

export async function incrementCount(userId: string, habitId: string) {
  const weekStart = currentWeekStart();

  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);

  if (!habit) return null;

  // Upsert week record
  const existing = await db
    .select()
    .from(habitWeekRecords)
    .where(and(eq(habitWeekRecords.habitId, habitId), eq(habitWeekRecords.weekStart, weekStart)))
    .limit(1);

  let countAchieved: number;

  if (existing.length === 0) {
    const [rec] = await db
      .insert(habitWeekRecords)
      .values({ habitId, weekStart, countAchieved: 1, targetAtTime: habit.weeklyTarget })
      .returning();
    countAchieved = rec!.countAchieved;
  } else {
    const [rec] = await db
      .update(habitWeekRecords)
      .set({ countAchieved: existing[0]!.countAchieved + 1 })
      .where(eq(habitWeekRecords.id, existing[0]!.id))
      .returning();
    countAchieved = rec!.countAchieved;
  }

  const targetHit = countAchieved === habit.weeklyTarget;

  return { habitId, countAchieved, targetAtTime: habit.weeklyTarget, targetHit };
}

export async function decrementCount(userId: string, habitId: string) {
  const weekStart = currentWeekStart();

  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);

  if (!habit) return null;

  const [existing] = await db
    .select()
    .from(habitWeekRecords)
    .where(and(eq(habitWeekRecords.habitId, habitId), eq(habitWeekRecords.weekStart, weekStart)))
    .limit(1);

  if (!existing || existing.countAchieved <= 0) {
    return { habitId, countAchieved: 0, targetAtTime: habit.weeklyTarget };
  }

  const [rec] = await db
    .update(habitWeekRecords)
    .set({ countAchieved: existing.countAchieved - 1 })
    .where(eq(habitWeekRecords.id, existing.id))
    .returning();

  return { habitId, countAchieved: rec!.countAchieved, targetAtTime: habit.weeklyTarget };
}

export async function pauseHabit(userId: string, habitId: string) {
  const [row] = await db
    .update(habits)
    .set({ status: 'paused' })
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .returning();
  if (!row) return null;
  return { id: row.id, status: row.status };
}

export async function resumeHabit(userId: string, habitId: string) {
  const [row] = await db
    .update(habits)
    .set({ status: 'active' })
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .returning();
  if (!row) return null;
  return { id: row.id, status: row.status };
}
