import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { reminders } from '../db/schema.js';
import type { CreateReminderBody } from '@shared/types';

export async function createReminder(userId: string, taskId: string, body: CreateReminderBody) {
  const [row] = await db
    .insert(reminders)
    .values({
      taskId,
      userId,
      type: body.type,
      fireAt: body.type === 'one_shot' && body.fireAt ? new Date(body.fireAt) : null,
      dailyTime: body.type === 'recurring_until_done' && body.dailyTime ? body.dailyTime : null,
      status: 'pending',
    })
    .returning();
  return toReminderResponse(row!);
}

export async function deleteReminder(userId: string, reminderId: string) {
  await db
    .update(reminders)
    .set({ status: 'cancelled' })
    .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)));
}

export async function deleteAllReminders(userId: string) {
  const result = await db
    .update(reminders)
    .set({ status: 'cancelled' })
    .where(and(eq(reminders.userId, userId), eq(reminders.status, 'pending')))
    .returning();
  return { cancelledCount: result.length };
}

export async function cancelTaskReminders(taskId: string) {
  await db
    .update(reminders)
    .set({ status: 'cancelled' })
    .where(and(eq(reminders.taskId, taskId), eq(reminders.status, 'pending')));
}

function toReminderResponse(row: typeof reminders.$inferSelect) {
  return {
    id: row.id,
    taskId: row.taskId,
    type: row.type,
    status: row.status,
    fireAt: row.fireAt?.toISOString() ?? null,
    dailyTime: row.dailyTime,
    createdAt: row.createdAt.toISOString(),
  };
}
