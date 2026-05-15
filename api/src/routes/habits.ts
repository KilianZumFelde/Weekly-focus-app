import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as svc from '../services/habits.service.js';
import type { AuthVariables } from '../middleware/auth.js';

const habits = new Hono<{ Variables: AuthVariables }>();

habits.get('/', async (c) => {
  const userId = c.get('userId');
  return c.json(await svc.getHabits(userId));
});

habits.post(
  '/',
  zValidator('json', z.object({
    themeId: z.string().uuid(),
    title: z.string().min(1),
    weeklyTarget: z.number().int().min(1).max(7),
    goalId: z.string().uuid().optional(),
  })),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    try {
      const habit = await svc.createHabit(userId, body);
      return c.json(habit, 201);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('unique')) {
        return c.json({ error: 'Habit already exists', code: 'HABIT_EXISTS' }, 409);
      }
      throw err;
    }
  },
);

habits.patch(
  '/:id',
  zValidator('json', z.object({
    title: z.string().min(1).optional(),
    themeId: z.string().uuid().optional(),
    goalId: z.string().uuid().nullable().optional(),
    weeklyTarget: z.number().int().min(1).max(7).optional(),
  })),
  async (c) => {
    const userId = c.get('userId');
    const habit = await svc.updateHabit(userId, c.req.param('id'), c.req.valid('json'));
    if (!habit) return c.json({ error: 'Habit not found', code: 'NOT_FOUND' }, 404);
    return c.json(habit);
  },
);

habits.post('/:id/increment', async (c) => {
  const userId = c.get('userId');
  const result = await svc.incrementCount(userId, c.req.param('id'));
  if (!result) return c.json({ error: 'Habit not found', code: 'NOT_FOUND' }, 404);
  return c.json(result);
});

habits.post('/:id/decrement', async (c) => {
  const userId = c.get('userId');
  const result = await svc.decrementCount(userId, c.req.param('id'));
  if (!result) return c.json({ error: 'Habit not found', code: 'NOT_FOUND' }, 404);
  return c.json(result);
});

habits.post('/:id/pause', async (c) => {
  const userId = c.get('userId');
  const result = await svc.pauseHabit(userId, c.req.param('id'));
  if (!result) return c.json({ error: 'Habit not found', code: 'NOT_FOUND' }, 404);
  return c.json(result);
});

habits.post('/:id/resume', async (c) => {
  const userId = c.get('userId');
  const result = await svc.resumeHabit(userId, c.req.param('id'));
  if (!result) return c.json({ error: 'Habit not found', code: 'NOT_FOUND' }, 404);
  return c.json(result);
});

export default habits;
