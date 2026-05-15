import { createMiddleware } from 'hono/factory';
import { createClient } from '@supabase/supabase-js';
import { db } from '../db/index.js';
import { userProfiles } from '../db/schema.js';
import { seedDefaultThemes } from '../db/seed.js';
import { eq } from 'drizzle-orm';

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export type AuthVariables = {
  userId: string;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Missing authorization header', code: 'UNAUTHORIZED' }, 401);
    }

    const jwt = authHeader.slice(7);
    const { data, error } = await supabase.auth.getUser(jwt);

    if (error || !data.user) {
      return c.json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' }, 401);
    }

    const userId = data.user.id;
    c.set('userId', userId);

    // Auto-create user profile + seed themes on first authenticated request
    const existing = await db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .where(eq(userProfiles.id, userId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(userProfiles).values({ id: userId }).onConflictDoNothing();
      await seedDefaultThemes(userId);
    }

    await next();
  },
);
