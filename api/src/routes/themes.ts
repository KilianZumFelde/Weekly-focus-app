import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as svc from '../services/themes.service.js';
import type { AuthVariables } from '../middleware/auth.js';

const themes = new Hono<{ Variables: AuthVariables }>();

themes.get('/', async (c) => {
  return c.json(await svc.getThemes(c.get('userId')));
});

themes.post(
  '/',
  zValidator('json', z.object({
    name: z.string().min(1),
    color: z.string().min(1),
    icon: z.string().min(1),
  })),
  async (c) => {
    try {
      const theme = await svc.createTheme(c.get('userId'), c.req.valid('json'));
      return c.json(theme, 201);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'THEME_NAME_EXISTS') {
        return c.json({ error: 'Theme name already exists', code: 'THEME_NAME_EXISTS' }, 409);
      }
      throw err;
    }
  },
);

themes.patch(
  '/:id',
  zValidator('json', z.object({
    name: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    sortOrder: z.number().int().min(0).optional(),
  })),
  async (c) => {
    try {
      const theme = await svc.updateTheme(c.get('userId'), c.req.param('id'), c.req.valid('json'));
      if (!theme) return c.json({ error: 'Theme not found', code: 'NOT_FOUND' }, 404);
      return c.json(theme);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CANNOT_MODIFY_SYSTEM') {
        return c.json({ error: 'Cannot modify system theme', code: 'CANNOT_MODIFY_SYSTEM' }, 400);
      }
      if (err instanceof Error && err.name === 'THEME_NAME_EXISTS') {
        return c.json({ error: 'Theme name already exists', code: 'THEME_NAME_EXISTS' }, 409);
      }
      throw err;
    }
  },
);

themes.delete('/:id', async (c) => {
  try {
    const result = await svc.deleteTheme(c.get('userId'), c.req.param('id'));
    if (!result) return c.json({ error: 'Theme not found', code: 'NOT_FOUND' }, 404);
    return c.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'CANNOT_DELETE_SYSTEM') {
      return c.json({ error: 'Cannot delete system theme', code: 'CANNOT_DELETE_SYSTEM' }, 400);
    }
    throw err;
  }
});

export default themes;
