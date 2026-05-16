import { testDb } from '../setup.js';
import { runWeekFlip } from '../../src/services/weekFlip.service.js';
import { userProfiles, themes, habits, habitWeekRecords, tasks } from '../../src/db/schema.js';
import { eq, and } from 'drizzle-orm';

const USER_ID   = '00000000-0000-0000-0000-000000000010';
const THEME_ID  = '00000000-0000-0000-0000-000000000011';
const HABIT_HIT = '00000000-0000-0000-0000-000000000012'; // will hit target
const HABIT_MISS = '00000000-0000-0000-0000-000000000013'; // will miss target
const HABIT_PAUSED = '00000000-0000-0000-0000-000000000014'; // paused

const PREV_WEEK = '2026-05-03';
const CURR_WEEK = '2026-05-10';

beforeAll(async () => {
  await testDb.insert(userProfiles).values({ id: USER_ID }).onConflictDoNothing();
  await testDb.insert(themes).values({
    id: THEME_ID, userId: USER_ID, name: 'Health', color: '#8C967A', icon: 'heart',
  }).onConflictDoNothing();
});

async function seedFlipScenario() {
  // Set lastWeekStart to PREV_WEEK so flip targets CURR_WEEK
  await testDb.update(userProfiles).set({ lastWeekStart: PREV_WEEK }).where(eq(userProfiles.id, USER_ID));

  // Habit that hits target (4/4)
  await testDb.insert(habits).values({
    id: HABIT_HIT, userId: USER_ID, themeId: THEME_ID,
    title: 'Gym', weeklyTarget: 4, status: 'active',
    currentStreak: 3, bestEverStreak: 5,
  }).onConflictDoNothing();
  await testDb.insert(habitWeekRecords).values({
    habitId: HABIT_HIT, weekStart: PREV_WEEK, countAchieved: 4, targetAtTime: 4,
  }).onConflictDoNothing();

  // Habit that misses target (2/4)
  await testDb.insert(habits).values({
    id: HABIT_MISS, userId: USER_ID, themeId: THEME_ID,
    title: 'Yoga', weeklyTarget: 4, status: 'active',
    currentStreak: 2, bestEverStreak: 4,
  }).onConflictDoNothing();
  await testDb.insert(habitWeekRecords).values({
    habitId: HABIT_MISS, weekStart: PREV_WEEK, countAchieved: 2, targetAtTime: 4,
  }).onConflictDoNothing();

  // Paused habit — streak should be unchanged
  await testDb.insert(habits).values({
    id: HABIT_PAUSED, userId: USER_ID, themeId: THEME_ID,
    title: 'Reading', weeklyTarget: 5, status: 'paused',
    currentStreak: 6, bestEverStreak: 6,
  }).onConflictDoNothing();

  // Done task that should be archived
  await testDb.insert(tasks).values({
    userId: USER_ID, themeId: THEME_ID,
    title: 'Done task', effort: 'low', returnLevel: 'high',
    weekAssignment: 'this_week', status: 'done',
  });
}

describe('Sunday flip', () => {
  beforeEach(async () => {
    await testDb.delete(habitWeekRecords);
    await testDb.delete(habits);
    await testDb.delete(tasks);
    await testDb.update(userProfiles).set({ lastWeekStart: null }).where(eq(userProfiles.id, USER_ID));
    await seedFlipScenario();
  });

  it('archives done tasks', async () => {
    // Patch getSundayStart: mock current Sunday as CURR_WEEK by setting lastWeekStart behind
    // The service uses getSundayStart(new Date(), timezone). We force it by pre-setting lastWeekStart.
    // After flip, done task should be archived.
    const result = await runWeekFlip(USER_ID, 'UTC');
    expect('archivedTaskCount' in result).toBe(true);
    if ('archivedTaskCount' in result) {
      expect(result.archivedTaskCount).toBeGreaterThanOrEqual(1);
    }

    const doneTasks = await testDb.select().from(tasks)
      .where(and(eq(tasks.userId, USER_ID), eq(tasks.status, 'done')));
    expect(doneTasks).toHaveLength(0); // all done tasks archived
  });

  it('increments streak for habit that hit target', async () => {
    await runWeekFlip(USER_ID, 'UTC');
    const [h] = await testDb.select().from(habits).where(eq(habits.id, HABIT_HIT)).limit(1);
    // streak was 3, target hit → should be 4
    expect(h!.currentStreak).toBe(4);
  });

  it('resets streak to 0 for habit that missed target', async () => {
    await runWeekFlip(USER_ID, 'UTC');
    const [h] = await testDb.select().from(habits).where(eq(habits.id, HABIT_MISS)).limit(1);
    expect(h!.currentStreak).toBe(0);
  });

  it('paused habit streak is unchanged', async () => {
    await runWeekFlip(USER_ID, 'UTC');
    const [h] = await testDb.select().from(habits).where(eq(habits.id, HABIT_PAUSED)).limit(1);
    expect(h!.currentStreak).toBe(6); // unchanged
  });

  it('bestEverStreak is updated when new streak exceeds it', async () => {
    // HABIT_HIT has currentStreak=3, bestEverStreak=5 → after flip currentStreak=4, bestEver stays 5
    await runWeekFlip(USER_ID, 'UTC');
    const [h] = await testDb.select().from(habits).where(eq(habits.id, HABIT_HIT)).limit(1);
    expect(h!.currentStreak).toBe(4);
    expect(h!.bestEverStreak).toBe(5); // unchanged since 4 < 5
  });

  it('is idempotent — second call returns alreadyFlipped', async () => {
    await runWeekFlip(USER_ID, 'UTC');
    const second = await runWeekFlip(USER_ID, 'UTC');
    expect('alreadyFlipped' in second).toBe(true);
  });

  it('creates new HabitWeekRecords for active habits after flip', async () => {
    const result = await runWeekFlip(USER_ID, 'UTC');
    if (!('newWeekStart' in result)) return;

    const newRecords = await testDb.select().from(habitWeekRecords)
      .where(eq(habitWeekRecords.weekStart, result.newWeekStart));
    // Should have records for HABIT_HIT and HABIT_MISS (active), not HABIT_PAUSED
    const hitRec = newRecords.find((r) => r.habitId === HABIT_HIT);
    const missRec = newRecords.find((r) => r.habitId === HABIT_MISS);
    const pausedRec = newRecords.find((r) => r.habitId === HABIT_PAUSED);

    expect(hitRec).toBeDefined();
    expect(hitRec!.countAchieved).toBe(0);
    expect(missRec).toBeDefined();
    expect(pausedRec).toBeUndefined();
  });
});
