import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as svc from '../services/tasks.service.js';
import type { AuthVariables } from '../middleware/auth.js';

const tasks = new Hono<{ Variables: AuthVariables }>();

const effortSchema = z.enum(['low', 'medium', 'high']);
const returnSchema = z.enum(['low', 'medium', 'high']);
const assignSchema = z.enum(['this_week', 'backlog']);

tasks.get('/week', async (c) => {
  const userId = c.get('userId');
  const rows = await svc.getWeekTasks(userId);
  // Use current week start (Sunday)
  const now = new Date();
  const day = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - day);
  const weekStart = sunday.toISOString().slice(0, 10);
  return c.json({ weekStart, tasks: rows });
});

tasks.get('/backlog', async (c) => {
  const userId = c.get('userId');
  const rows = await svc.getBacklogTasks(userId);
  return c.json({ tasks: rows });
});

tasks.post(
  '/',
  zValidator('json', z.object({
    themeId: z.string().uuid(),
    title: z.string().min(1),
    effort: effortSchema,
    returnLevel: returnSchema,
    weekAssignment: assignSchema,
    goalId: z.string().uuid().optional(),
  })),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const task = await svc.createTask(userId, body);
    return c.json(task, 201);
  },
);

tasks.patch(
  '/:id',
  zValidator('json', z.object({
    title: z.string().min(1).optional(),
    effort: effortSchema.optional(),
    returnLevel: returnSchema.optional(),
    themeId: z.string().uuid().optional(),
    goalId: z.string().uuid().nullable().optional(),
    weekAssignment: assignSchema.optional(),
  })),
  async (c) => {
    const userId = c.get('userId');
    const taskId = c.req.param('id');
    const body = c.req.valid('json');
    const task = await svc.updateTask(userId, taskId, body);
    if (!task) return c.json({ error: 'Task not found', code: 'NOT_FOUND' }, 404);
    return c.json(task);
  },
);

tasks.post('/:id/complete', async (c) => {
  const userId = c.get('userId');
  const result = await svc.completeTask(userId, c.req.param('id'));
  if (!result) return c.json({ error: 'Task not found', code: 'NOT_FOUND' }, 404);
  if ('archived' in result) return c.json({ error: 'Task is archived', code: 'TASK_ARCHIVED' }, 400);
  return c.json(result);
});

tasks.post('/:id/uncomplete', async (c) => {
  const userId = c.get('userId');
  const result = await svc.uncompleteTask(userId, c.req.param('id'));
  if (!result) return c.json({ error: 'Task not found', code: 'NOT_FOUND' }, 404);
  if ('archived' in result) return c.json({ error: 'Task is archived', code: 'TASK_ARCHIVED' }, 400);
  return c.json(result);
});

tasks.post(
  '/:id/move',
  zValidator('json', z.object({ weekAssignment: assignSchema })),
  async (c) => {
    const userId = c.get('userId');
    const { weekAssignment } = c.req.valid('json');
    const task = await svc.moveTask(userId, c.req.param('id'), weekAssignment);
    if (!task) return c.json({ error: 'Task not found', code: 'NOT_FOUND' }, 404);
    return c.json(task);
  },
);

tasks.delete('/:id', async (c) => {
  const userId = c.get('userId');
  await svc.deleteTask(userId, c.req.param('id'));
  return c.json({ ok: true });
});

export default tasks;
