import { testDb } from '../setup.js';
import * as tasksService from '../../src/services/tasks.service.js';
import { userProfiles, themes } from '../../src/db/schema.js';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const TEST_THEME_ID = '00000000-0000-0000-0000-000000000002';

beforeAll(async () => {
  await testDb.insert(userProfiles).values({ id: TEST_USER_ID }).onConflictDoNothing();
  await testDb.insert(themes).values({
    id: TEST_THEME_ID, userId: TEST_USER_ID,
    name: 'Test Theme', color: '#000', icon: 'circle',
  }).onConflictDoNothing();
});

describe('task lifecycle', () => {
  it('complete → uncomplete → re-complete works', async () => {
    const task = await tasksService.createTask(TEST_USER_ID, {
      themeId: TEST_THEME_ID, title: 'Buy milk',
      effort: 'low', returnLevel: 'medium', weekAssignment: 'this_week',
    });

    const completed = await tasksService.completeTask(TEST_USER_ID, task.id);
    expect(completed).not.toBeNull();
    expect((completed as { status: string }).status).toBe('done');

    const reopened = await tasksService.uncompleteTask(TEST_USER_ID, task.id);
    expect((reopened as { status: string }).status).toBe('open');

    const reCompleted = await tasksService.completeTask(TEST_USER_ID, task.id);
    expect((reCompleted as { status: string }).status).toBe('done');
  });

  it('archived task cannot be uncompleted', async () => {
    const task = await tasksService.createTask(TEST_USER_ID, {
      themeId: TEST_THEME_ID, title: 'Guitar practice',
      effort: 'medium', returnLevel: 'high', weekAssignment: 'this_week',
    });

    // Force archive it directly
    const { tasks } = await import('../../src/db/schema.js');
    const { eq } = await import('drizzle-orm');
    await testDb.update(tasks).set({ status: 'archived' }).where(eq(tasks.id, task.id));

    const result = await tasksService.uncompleteTask(TEST_USER_ID, task.id);
    expect(result).toEqual({ archived: true });
  });
});
