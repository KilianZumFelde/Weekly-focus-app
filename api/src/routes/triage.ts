import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getTriageData, triageTask } from '../services/triage.service.js';
import type { AuthVariables } from '../middleware/auth.js';

const triage = new Hono<{ Variables: AuthVariables }>();

triage.get('/triage', async (c) => {
  const userId = c.get('userId');
  const data = await getTriageData(userId);
  return c.json(data);
});

triage.post(
  '/:id/triage',
  zValidator('json', z.object({ action: z.enum(['keep', 'backlog', 'drop']) })),
  async (c) => {
    const userId = c.get('userId');
    const taskId = c.req.param('id');
    const { action } = c.req.valid('json');

    const result = await triageTask(userId, taskId, action);
    if (!result) {
      return c.json({ error: 'Task not found', code: 'NOT_FOUND' }, 404);
    }

    return c.json(result);
  },
);

export default triage;
