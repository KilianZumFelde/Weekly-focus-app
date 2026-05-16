import { db } from './index.js';
import { tasks } from './schema.js';

const USER_ID     = '4634b7ba-7600-4429-85c5-24af012ef5d3';
const CAREER      = '344b51cb-8a09-4106-9f9a-e540db3a5c3d';
const PERSONAL    = '13be3f77-29ce-4c61-a4e6-ea5fe60828d5';
const LAST_WEEK   = new Date('2026-05-05T10:00:00Z');

async function seed() {
  const inserted = await db.insert(tasks).values([
    {
      userId: USER_ID, themeId: CAREER,
      title: 'Update DJ press kit',
      effort: 'medium', returnLevel: 'medium',
      weekAssignment: 'this_week', status: 'open',
      createdAt: LAST_WEEK,
    },
    {
      userId: USER_ID, themeId: CAREER,
      title: 'Reply to booking inquiry',
      effort: 'low', returnLevel: 'high',
      weekAssignment: 'this_week', status: 'open',
      createdAt: LAST_WEEK,
    },
    {
      userId: USER_ID, themeId: PERSONAL,
      title: 'Review festival schedule',
      effort: 'low', returnLevel: 'medium',
      weekAssignment: 'this_week', status: 'open',
      createdAt: LAST_WEEK,
    },
  ]).returning({ id: tasks.id, title: tasks.title });

  for (const row of inserted) {
    console.log(`Seeded: ${row.id}  ${row.title}`);
  }
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
