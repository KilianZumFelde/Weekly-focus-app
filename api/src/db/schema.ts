import {
  pgTable, uuid, text, integer, boolean,
  timestamp, date, time, pgEnum, unique,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const goalTypeEnum       = pgEnum('goal_type',       ['primary', 'secondary']);
export const goalStatusEnum     = pgEnum('goal_status',     ['active', 'hit', 'missed', 'abandoned']);
export const effortEnum         = pgEnum('effort',          ['low', 'medium', 'high']);
export const returnLevelEnum    = pgEnum('return_level',    ['low', 'medium', 'high']);
export const taskAssignEnum     = pgEnum('task_assignment', ['this_week', 'backlog']);
export const taskStatusEnum     = pgEnum('task_status',     ['open', 'done', 'archived']);
export const habitStatusEnum    = pgEnum('habit_status',    ['active', 'paused', 'archived']);
export const reminderTypeEnum   = pgEnum('reminder_type',   ['one_shot', 'recurring_until_done']);
export const reminderStatusEnum = pgEnum('reminder_status', ['pending', 'fired', 'cancelled']);

// ─── user_profiles ────────────────────────────────────────────────────────────

export const userProfiles = pgTable('user_profiles', {
  id:            uuid('id').primaryKey(),           // FK → auth.users.id
  timezone:      text('timezone').notNull().default('UTC'),
  nudgeEnabled:  boolean('nudge_enabled').notNull().default(true),
  expoPushToken: text('expo_push_token'),
  lastWeekStart: date('last_week_start'),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
});

// ─── themes ───────────────────────────────────────────────────────────────────

export const themes = pgTable('themes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull(),
  name:      text('name').notNull(),
  color:     text('color').notNull().default('#8C967A'),
  icon:      text('icon').notNull().default('circle'),
  sortOrder: integer('sort_order').notNull().default(0),
  isSystem:  boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserName: unique().on(t.userId, t.name),
}));

// ─── goals ────────────────────────────────────────────────────────────────────

export const goals = pgTable('goals', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').notNull(),
  themeId:    uuid('theme_id').notNull(),
  title:      text('title').notNull(),
  type:       goalTypeEnum('type').notNull(),
  status:     goalStatusEnum('status').notNull().default('active'),
  targetDate: date('target_date').notNull(),
  why:        text('why'),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
}, (t) => ({
  uniqueUserTitleTheme: unique().on(t.userId, t.title, t.themeId),
}));

// ─── tasks ────────────────────────────────────────────────────────────────────

export const tasks = pgTable('tasks', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').notNull(),
  themeId:          uuid('theme_id').notNull(),
  goalId:           uuid('goal_id'),
  title:            text('title').notNull(),
  effort:           effortEnum('effort').notNull().default('medium'),
  returnLevel:      returnLevelEnum('return_level').notNull().default('medium'),
  weekAssignment:   taskAssignEnum('week_assignment').notNull().default('this_week'),
  status:           taskStatusEnum('status').notNull().default('open'),
  archivedWeekStart: date('archived_week_start'),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
  completedAt:      timestamp('completed_at'),
});

// ─── habits ───────────────────────────────────────────────────────────────────

export const habits = pgTable('habits', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').notNull(),
  themeId:        uuid('theme_id').notNull(),
  goalId:         uuid('goal_id'),
  title:          text('title').notNull(),
  weeklyTarget:   integer('weekly_target').notNull(),
  status:         habitStatusEnum('status').notNull().default('active'),
  currentStreak:  integer('current_streak').notNull().default(0),
  bestEverStreak: integer('best_ever_streak').notNull().default(0),
  lastNudgedAt:   timestamp('last_nudged_at'),        // for deduplicating nudge pushes
  deletedAt:      timestamp('deleted_at'),            // set on soft-delete
  undoToken:      text('undo_token'),                 // cleared after undo window expires
  createdAt:      timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserTitleTheme: unique().on(t.userId, t.title, t.themeId),
}));

// ─── habit_week_records ───────────────────────────────────────────────────────

export const habitWeekRecords = pgTable('habit_week_records', {
  id:              uuid('id').primaryKey().defaultRandom(),
  habitId:         uuid('habit_id').notNull(),
  weekStart:       date('week_start').notNull(),
  countAchieved:   integer('count_achieved').notNull().default(0),
  targetAtTime:    integer('target_at_time').notNull(),
  streakBefore:    integer('streak_before'),   // set during flip; used by triage recap
  createdAt:       timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueHabitWeek: unique().on(t.habitId, t.weekStart),
}));

// ─── week_records ─────────────────────────────────────────────────────────────

export const weekRecords = pgTable('week_records', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull(),
  weekStart: date('week_start').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserWeek: unique().on(t.userId, t.weekStart),
}));

// ─── reminders ────────────────────────────────────────────────────────────────

export const reminders = pgTable('reminders', {
  id:          uuid('id').primaryKey().defaultRandom(),
  taskId:      uuid('task_id').notNull(),
  userId:      uuid('user_id').notNull(),
  type:        reminderTypeEnum('type').notNull(),
  fireAt:      timestamp('fire_at'),
  dailyTime:   time('daily_time'),
  status:      reminderStatusEnum('status').notNull().default('pending'),
  lastFiredAt: timestamp('last_fired_at'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});
