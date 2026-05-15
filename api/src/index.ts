import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import internal from './routes/internal.js';

const app = new Hono().basePath('/v1');

app.use('*', cors());

app.route('/internal', internal);

const port = Number(process.env['PORT'] ?? 3000);
serve({ fetch: app.fetch, port }, () => {
  console.warn(`Weekly Focus API running on port ${port}`);
});

export default app;
