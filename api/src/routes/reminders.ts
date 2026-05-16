import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  createReminder,
  deleteReminder,
  deleteAllReminders,
} from '../services/reminder.service.js';

type Env = { Variables: { userId: string } };

// Mounted under /tasks — handles POST /tasks/:id/reminders
export const taskRemindersRoute = new Hono<Env>();

const createReminderSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('one_shot'), fireAt: z.string().datetime() }),
  z.object({ type: z.literal('recurring_until_done'), dailyTime: z.string().regex(/^\d{2}:\d{2}$/) }),
]);

taskRemindersRoute.post('/:id/reminders', zValidator('json', createReminderSchema), async (c) => {
  const userId = c.get('userId');
  const taskId = c.req.param('id');
  const body = c.req.valid('json');
  const reminder = await createReminder(userId, taskId, body);
  return c.json(reminder, 201);
});

// Mounted under /reminders — handles DELETE /reminders/:id and DELETE /reminders
export const remindersRoute = new Hono<Env>();

remindersRoute.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const reminderId = c.req.param('id');
  await deleteReminder(userId, reminderId);
  return c.json({ ok: true });
});

remindersRoute.delete('/', zValidator('json', z.object({ confirmed: z.literal(true) })), async (c) => {
  const userId = c.get('userId');
  const result = await deleteAllReminders(userId);
  return c.json(result);
});
