import { Hono } from 'hono';

const internal = new Hono();

internal.get('/health', (c) => {
  return c.json({ ok: true });
});

export default internal;
