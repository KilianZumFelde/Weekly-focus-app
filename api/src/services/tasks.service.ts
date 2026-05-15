import { eq, and, isNull, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tasks, reminders } from '../db/schema.js';
import { computePriorityScore } from './priority.js';
import type { CreateTaskBody, PatchTaskBody } from '@shared/types';

function toTaskResponse(row: typeof tasks.$inferSelect) {
  return {
    id: row.id,
    themeId: row.themeId,
    goalId: row.goalId,
    title: row.title,
    effort: row.effort,
    returnLevel: row.returnLevel,
    weekAssignment: row.weekAssignment,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

export async function getWeekTasks(userId: string) {
  const rows = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.weekAssignment, 'this_week'),
        inArray(tasks.status, ['open', 'done']),
      ),
    );

  return rows.map((r) => ({
    ...toTaskResponse(r),
    priorityScore: r.status === 'open'
      ? computePriorityScore(r.effort, r.returnLevel)
      : undefined,
  }));
}

export async function getBacklogTasks(userId: string) {
  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.weekAssignment, 'backlog'), eq(tasks.status, 'open')));

  return rows.map(toTaskResponse);
}

export async function createTask(userId: string, body: CreateTaskBody) {
  const [row] = await db
    .insert(tasks)
    .values({
      userId,
      themeId: body.themeId,
      goalId: body.goalId ?? null,
      title: body.title,
      effort: body.effort,
      returnLevel: body.returnLevel,
      weekAssignment: body.weekAssignment,
    })
    .returning();

  return toTaskResponse(row!);
}

export async function updateTask(userId: string, taskId: string, body: PatchTaskBody) {
  const [row] = await db
    .update(tasks)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.effort !== undefined && { effort: body.effort }),
      ...(body.returnLevel !== undefined && { returnLevel: body.returnLevel }),
      ...(body.themeId !== undefined && { themeId: body.themeId }),
      ...(body.goalId !== undefined && { goalId: body.goalId }),
      ...(body.weekAssignment !== undefined && { weekAssignment: body.weekAssignment }),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!row) return null;
  return toTaskResponse(row);
}

export async function completeTask(userId: string, taskId: string) {
  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);

  if (!existing) return null;
  if (existing.status === 'archived') return { archived: true } as const;

  const [row] = await db
    .update(tasks)
    .set({ status: 'done', completedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  // Cancel pending reminders on task completion
  await db
    .update(reminders)
    .set({ status: 'cancelled' })
    .where(and(eq(reminders.taskId, taskId), eq(reminders.status, 'pending')));

  return { id: row!.id, status: row!.status, completedAt: row!.completedAt?.toISOString() ?? null };
}

export async function uncompleteTask(userId: string, taskId: string) {
  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);

  if (!existing) return null;
  if (existing.status === 'archived') return { archived: true } as const;

  const [row] = await db
    .update(tasks)
    .set({ status: 'open', completedAt: null })
    .where(eq(tasks.id, taskId))
    .returning();

  return { id: row!.id, status: row!.status, completedAt: null };
}

export async function moveTask(userId: string, taskId: string, weekAssignment: 'this_week' | 'backlog') {
  const [row] = await db
    .update(tasks)
    .set({ weekAssignment })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!row) return null;
  return toTaskResponse(row);
}

export async function deleteTask(userId: string, taskId: string) {
  await db
    .update(reminders)
    .set({ status: 'cancelled' })
    .where(and(eq(reminders.taskId, taskId), eq(reminders.status, 'pending')));

  await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
  return { ok: true };
}
