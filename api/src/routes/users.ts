import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../db/index.js';
import { userProfiles } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { AuthVariables } from '../middleware/auth.js';

const users = new Hono<{ Variables: AuthVariables }>();

users.get('/me', async (c) => {
  const userId = c.get('userId');
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);

  if (!profile) {
    return c.json({ error: 'Profile not found', code: 'NOT_FOUND' }, 404);
  }

  return c.json({
    id: profile.id,
    timezone: profile.timezone,
    nudgeEnabled: profile.nudgeEnabled,
    lastWeekStart: profile.lastWeekStart,
  });
});

users.patch(
  '/me',
  zValidator(
    'json',
    z.object({
      timezone: z.string().optional(),
      nudgeEnabled: z.boolean().optional(),
    }),
  ),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const [updated] = await db
      .update(userProfiles)
      .set({ ...body })
      .where(eq(userProfiles.id, userId))
      .returning();

    return c.json({
      id: updated!.id,
      timezone: updated!.timezone,
      nudgeEnabled: updated!.nudgeEnabled,
      lastWeekStart: updated!.lastWeekStart,
    });
  },
);

users.post(
  '/push-token',
  zValidator('json', z.object({ token: z.string().min(1) })),
  async (c) => {
    const userId = c.get('userId');
    const { token } = c.req.valid('json');

    await db
      .update(userProfiles)
      .set({ expoPushToken: token })
      .where(eq(userProfiles.id, userId));

    return c.json({ ok: true });
  },
);

export default users;
