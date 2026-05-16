import { Hono } from 'hono';
import { runWeekFlip } from '../services/weekFlip.service.js';
import { parseTranscript } from '../services/ai.service.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthVariables } from '../middleware/auth.js';

const internal = new Hono();

internal.get('/health', (c) => {
  return c.json({ ok: true });
});

internal.get('/ai-test', async (c) => {
  try {
    const result = await parseTranscript({
      transcript: 'send an email to John high effort',
      context: { themes: [], activeGoals: [] },
    });
    return c.json({ ok: true, result });
  } catch (err) {
    return c.json({ ok: false, error: String(err) }, 500);
  }
});

// week-flip requires user auth
internal.post('/week-flip', authMiddleware, async (c) => {
  const ctx = c as typeof c & { var: AuthVariables };
  const userId = ctx.get('userId');
  const timezone = c.req.header('X-User-Timezone') ?? 'UTC';

  try {
    const result = await runWeekFlip(userId, timezone);
    return c.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return c.json({ error: message, code: 'FLIP_FAILED' }, 500);
  }
});

export default internal;
