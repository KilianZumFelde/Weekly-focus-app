import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema.js';
import {
  userProfiles, themes, goals, tasks, habits,
  habitWeekRecords, weekRecords, reminders,
} from '../src/db/schema.js';

const url = process.env['TEST_DATABASE_URL'];
if (!url) throw new Error('TEST_DATABASE_URL is not set — point to a separate Supabase test project');

const client = postgres(url);
export const testDb = drizzle(client, { schema });

// Truncate all tables before each test (order respects FK constraints)
beforeEach(async () => {
  await testDb.delete(reminders);
  await testDb.delete(habitWeekRecords);
  await testDb.delete(weekRecords);
  await testDb.delete(tasks);
  await testDb.delete(habits);
  await testDb.delete(goals);
  await testDb.delete(themes);
  await testDb.delete(userProfiles);
});

afterAll(async () => {
  await client.end();
});
