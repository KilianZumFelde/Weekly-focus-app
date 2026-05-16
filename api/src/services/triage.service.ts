import { eq, and, lt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tasks, habits, habitWeekRecords, weekRecords, userProfiles } from '../db/schema.js';

export async function getTriageData(userId: string) {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);

  const lastWeekStart = profile?.lastWeekStart;

  if (!lastWeekStart) {
    return { needsTriage: false, recap: null, pendingTasks: [] };
  }

  // Open this_week tasks created before the current week start
  const pending = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, 'open'),
        eq(tasks.weekAssignment, 'this_week'),
        lt(tasks.createdAt, new Date(lastWeekStart)),
      ),
    );

  if (pending.length === 0) {
    return { needsTriage: false, recap: null, pendingTasks: [] };
  }

  // Build recap from the completed week (the week before lastWeekStart)
  const completedWeekStart = previousSunday(lastWeekStart);

  const [weekRecord] = await db
    .select()
    .from(weekRecords)
    .where(and(eq(weekRecords.userId, userId), eq(weekRecords.weekStart, completedWeekStart)))
    .limit(1);

  // Task fractions for the completed week
  const weekTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.weekAssignment, 'this_week'),
        lt(tasks.createdAt, new Date(lastWeekStart)),
      ),
    );

  const tasksTotal = weekTasks.length;
  const tasksDone = weekTasks.filter((t) => t.status === 'done' || t.status === 'archived').length;

  // Habit fractions and streak deltas for the completed week
  const activeHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.status, 'active')));

  const habitRecords = await Promise.all(
    activeHabits.map(async (h) => {
      const [rec] = await db
        .select()
        .from(habitWeekRecords)
        .where(
          and(
            eq(habitWeekRecords.habitId, h.id),
            eq(habitWeekRecords.weekStart, completedWeekStart),
          ),
        )
        .limit(1);
      return { habit: h, record: rec ?? null };
    }),
  );

  const habitsTotal = activeHabits.length;
  const habitsOnTarget = habitRecords.filter(
    ({ habit, record }) =>
      record && record.countAchieved >= (record.targetAtTime ?? habit.weeklyTarget),
  ).length;

  const streakDeltas = habitRecords
    .filter(({ record }) => record !== null)
    .map(({ habit, record }) => {
      const streakBefore = record!.streakBefore ?? habit.currentStreak;
      const hitTarget = record!.countAchieved >= (record!.targetAtTime ?? habit.weeklyTarget);
      const newStreak = hitTarget ? streakBefore + 1 : 0;
      if (!hitTarget && streakBefore === 0) return null; // no interesting delta
      return {
        habitTitle: habit.title,
        previousStreak: streakBefore,
        newStreak: hitTarget ? newStreak : 0,
        ...(hitTarget ? { delta: 1 } : { broke: true }),
      };
    })
    .filter(Boolean);

  const recap = weekRecord
    ? {
        weekStart: completedWeekStart,
        tasksDone,
        tasksTotal,
        habitsOnTarget,
        habitsTotal,
        streakDeltas,
        primaryGoalTitle: null,
        tasksTowardPrimaryGoal: 0,
      }
    : null;

  return {
    needsTriage: true,
    recap,
    pendingTasks: pending.map((t) => ({
      id: t.id,
      title: t.title,
      themeId: t.themeId,
      effort: t.effort,
      returnLevel: t.returnLevel,
      goalId: t.goalId,
    })),
  };
}

export async function triageTask(
  userId: string,
  taskId: string,
  action: 'keep' | 'backlog' | 'drop',
) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);

  if (!task) return null;

  // Idempotent: if already acted on, return current remaining count
  if (task.status !== 'open' || task.weekAssignment !== 'this_week') {
    const remaining = await countPendingTriage(userId);
    return { ok: true, remainingCount: remaining };
  }

  if (action === 'keep') {
    // Re-stamp createdAt to now so it's no longer "before current week"
    await db
      .update(tasks)
      .set({ createdAt: new Date() })
      .where(eq(tasks.id, taskId));
  } else if (action === 'backlog') {
    await db
      .update(tasks)
      .set({ weekAssignment: 'backlog', createdAt: new Date() })
      .where(eq(tasks.id, taskId));
  } else {
    // drop
    await db.delete(tasks).where(eq(tasks.id, taskId));
  }

  const remaining = await countPendingTriage(userId);
  return { ok: true, remainingCount: remaining };
}

async function countPendingTriage(userId: string): Promise<number> {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);

  if (!profile?.lastWeekStart) return 0;

  const pending = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, 'open'),
        eq(tasks.weekAssignment, 'this_week'),
        lt(tasks.createdAt, new Date(profile.lastWeekStart)),
      ),
    );

  return pending.length;
}

function previousSunday(sundayStr: string): string {
  const d = new Date(sundayStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString().slice(0, 10);
}
