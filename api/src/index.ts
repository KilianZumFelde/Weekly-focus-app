import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth.js';
import internal from './routes/internal.js';
import users from './routes/users.js';
import themes from './routes/themes.js';
import tasksRoute from './routes/tasks.js';
import habitsRoute from './routes/habits.js';
import triageRoute from './routes/triage.js';

const app = new Hono().basePath('/v1');

app.use('*', cors());

// Public routes (no auth)
app.route('/internal', internal);

// All routes below require auth
app.use('*', authMiddleware);
app.route('/users', users);
app.route('/themes', themes);
app.route('/tasks', tasksRoute);
app.route('/habits', habitsRoute);
app.route('/tasks', triageRoute);

const port = Number(process.env['PORT'] ?? 3000);
serve({ fetch: app.fetch, port }, () => {
  console.warn(`Weekly Focus API running on port ${port}`);
});

export default app;
