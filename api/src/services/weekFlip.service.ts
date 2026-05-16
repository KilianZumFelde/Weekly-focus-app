import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tasks, habits, habitWeekRecords, weekRecords, userProfiles } from '../db/schema.js';
import { getSundayStart } from '../utils/dateArithmetic.js';
import { computeNewStreak } from '../utils/streak.js';

function previousSunday(sundayStr: string): string {
  const d = new Date(sundayStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString().slice(0, 10);
}

export async function runWeekFlip(userId: string, timezone: string) {
  const currentSunday = getSundayStart(new Date(), timezone);

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);

  if (!profile) throw new Error('User profile not found');

  // Idempotency: flip already done for this week
  if (profile.lastWeekStart === currentSunday) {
    return { alreadyFlipped: true as const, currentWeekStart: currentSunday };
  }

  const completedWeekStart = profile.lastWeekStart ?? previousSunday(currentSunday);

  // 1. Create WeekRecord for the completed week
  await db
    .insert(weekRecords)
    .values({ userId, weekStart: completedWeekStart })
    .onConflictDoNothing();

  // 2. Archive done tasks
  const archivedTasks = await db
    .update(tasks)
    .set({ status: 'archived', archivedWeekStart: completedWeekStart })
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, 'done'),
        eq(tasks.weekAssignment, 'this_week'),
      ),
    )
    .returning({ id: tasks.id });

  // 3. Update habit streaks and create new week records
  const activeHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), inArray(habits.status, ['active', 'paused'])));

  let streaksUpdated = 0;

  for (const habit of activeHabits) {
    const [lastRecord] = await db
      .select()
      .from(habitWeekRecords)
      .where(
        and(
          eq(habitWeekRecords.habitId, habit.id),
          eq(habitWeekRecords.weekStart, completedWeekStart),
        ),
      )
      .limit(1);

    const countAchieved = lastRecord?.countAchieved ?? 0;
    const targetAtTime = lastRecord?.targetAtTime ?? habit.weeklyTarget;
    const streakBefore = habit.currentStreak;

    const newStreak = computeNewStreak(streakBefore, countAchieved, targetAtTime, habit.status);
    const newBestEver = Math.max(habit.bestEverStreak, newStreak);

    await db
      .update(habits)
      .set({ currentStreak: newStreak, bestEverStreak: newBestEver })
      .where(eq(habits.id, habit.id));

    // Store streakBefore on the completed week record (for triage recap)
    if (lastRecord) {
      await db
        .update(habitWeekRecords)
        .set({ streakBefore })
        .where(eq(habitWeekRecords.id, lastRecord.id));
    } else {
      // No record existed — create one capturing streakBefore for the recap
      await db
        .insert(habitWeekRecords)
        .values({ habitId: habit.id, weekStart: completedWeekStart, countAchieved: 0, targetAtTime, streakBefore })
        .onConflictDoNothing();
    }

    if (habit.status !== 'paused') streaksUpdated++;

    // Create new HabitWeekRecord for the new week (active habits only)
    if (habit.status === 'active') {
      await db
        .insert(habitWeekRecords)
        .values({
          habitId: habit.id,
          weekStart: currentSunday,
          countAchieved: 0,
          targetAtTime: habit.weeklyTarget,
        })
        .onConflictDoNothing();
    }
  }

  // 4. Update lastWeekStart to the new week
  await db
    .update(userProfiles)
    .set({ lastWeekStart: currentSunday })
    .where(eq(userProfiles.id, userId));

  return {
    newWeekStart: currentSunday,
    archivedTaskCount: archivedTasks.length,
    streaksUpdated,
  };
}
