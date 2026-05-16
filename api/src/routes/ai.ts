import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { parseTranscript } from '../services/ai.service.js';

const ai = new Hono<{ Variables: { userId: string } }>();

const parseBodySchema = z.object({
  transcript: z.string().min(1),
  context: z.object({
    themes: z.array(z.object({ id: z.string(), name: z.string() })),
    activeGoals: z.array(z.object({ id: z.string(), title: z.string(), themeId: z.string() })),
  }),
});

ai.post('/parse', zValidator('json', parseBodySchema), async (c) => {
  const body = c.req.valid('json');
  const result = await parseTranscript(body);
  return c.json(result);
});

export default ai;
