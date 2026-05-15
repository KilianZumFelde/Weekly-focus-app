# Data Model: Weekly Focus App

**Branch**: `002-weekly-focus-app` | **Date**: 2026-05-15
**Storage**: Supabase (PostgreSQL) via Drizzle ORM
**Schema file**: `api/src/db/schema.ts`

---

## Entity Relationship Overview

```
user_profiles (1) ──── (N) themes
themes (1) ──────────── (N) goals
themes (1) ──────────── (N) tasks
themes (1) ──────────── (N) habits

goals (1) ───────────── (N) tasks        [optional link]
goals (1) ───────────── (N) habits       [optional link]

habits (1) ──────────── (N) habit_week_records

week_records (1) ──────── (N) tasks      [archived tasks reference week]
week_records (1) ──────── (N) habit_week_records

tasks (1) ───────────── (N) reminders
```

---

## Drizzle Schema

```typescript
// api/src/db/schema.ts

import {
  pgTable, uuid, text, integer, boolean,
  timestamp, date, time, pgEnum, unique
} from 'drizzle-orm/pg-core'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const goalTypeEnum     = pgEnum('goal_type',     ['primary', 'secondary'])
export const goalStatusEnum   = pgEnum('goal_status',   ['active', 'hit', 'missed', 'abandoned'])
export const effortEnum       = pgEnum('effort',        ['low', 'medium', 'high'])
export const returnLevelEnum  = pgEnum('return_level',  ['low', 'medium', 'high'])
export const taskAssignEnum   = pgEnum('task_assignment', ['this_week', 'backlog'])
export const taskStatusEnum   = pgEnum('task_status',   ['open', 'done', 'archived'])
export const habitStatusEnum  = pgEnum('habit_status',  ['active', 'paused', 'archived'])
export const reminderTypeEnum = pgEnum('reminder_type', ['one_shot', 'recurring_until_done'])
export const reminderStatusEnum = pgEnum('reminder_status', ['pending', 'fired', 'cancelled'])

// ─── user_profiles ────────────────────────────────────────────────────────────
// Extends Supabase auth.users. Created automatically on first sign-in.

export const userProfiles = pgTable('user_profiles', {
  id:             uuid('id').primaryKey(),            // FK → auth.users.id
  timezone:       text('timezone').notNull(),          // e.g. 'Europe/Berlin'
  nudgeEnabled:   boolean('nudge_enabled').notNull().default(true),
  expoPushToken:  text('expo_push_token'),            // registered from mobile
  lastWeekStart:  date('last_week_start'),            // Sunday of the last completed flip
  createdAt:      timestamp('created_at').defaultNow().notNull(),
})

// ─── themes ───────────────────────────────────────────────────────────────────

export const themes = pgTable('themes', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').notNull(),              // FK → user_profiles.id
  name:       text('name').notNull(),
  color:      text('color').notNull().default('#8C967A'),
  icon:       text('icon').notNull().default('circle'),
  sortOrder:  integer('sort_order').notNull().default(0),
  isSystem:   boolean('is_system').notNull().default(false), // true = Uncategorized
  createdAt:  timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserName: unique().on(t.userId, t.name),     // case-insensitive enforced in service
}))

// ─── goals ────────────────────────────────────────────────────────────────────

export const goals = pgTable('goals', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').notNull(),
  themeId:      uuid('theme_id').notNull(),           // FK → themes.id
  title:        text('title').notNull(),
  type:         goalTypeEnum('type').notNull(),
  status:       goalStatusEnum('status').notNull().default('active'),
  targetDate:   date('target_date').notNull(),
  why:          text('why'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  resolvedAt:   timestamp('resolved_at'),             // set on hit/missed/abandoned
}, (t) => ({
  uniqueUserTitleTheme: unique().on(t.userId, t.title, t.themeId),
}))

// ─── tasks ────────────────────────────────────────────────────────────────────

export const tasks = pgTable('tasks', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').notNull(),
  themeId:        uuid('theme_id').notNull(),         // FK → themes.id
  goalId:         uuid('goal_id'),                    // FK → goals.id (nullable)
  title:          text('title').notNull(),
  effort:         effortEnum('effort').notNull().default('medium'),
  returnLevel:    returnLevelEnum('return_level').notNull().default('medium'),
  weekAssignment: taskAssignEnum('week_assignment').notNull().default('this_week'),
  status:         taskStatusEnum('status').notNull().default('open'),
  archivedWeekStart: date('archived_week_start'),     // set on archive (Sunday date)
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  completedAt:    timestamp('completed_at'),
})

// ─── habits ───────────────────────────────────────────────────────────────────

export const habits = pgTable('habits', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull(),
  themeId:         uuid('theme_id').notNull(),        // FK → themes.id
  goalId:          uuid('goal_id'),                   // FK → goals.id (nullable)
  title:           text('title').notNull(),
  weeklyTarget:    integer('weekly_target').notNull(),
  status:          habitStatusEnum('status').notNull().default('active'),
  currentStreak:   integer('current_streak').notNull().default(0),
  bestEverStreak:  integer('best_ever_streak').notNull().default(0),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserTitleTheme: unique().on(t.userId, t.title, t.themeId),
}))

// ─── habit_week_records ───────────────────────────────────────────────────────

export const habitWeekRecords = pgTable('habit_week_records', {
  id:             uuid('id').primaryKey().defaultRandom(),
  habitId:        uuid('habit_id').notNull(),         // FK → habits.id
  weekStart:      date('week_start').notNull(),       // Sunday date
  countAchieved:  integer('count_achieved').notNull().default(0),
  targetAtTime:   integer('target_at_time').notNull(), // snapshot of target when record created
  createdAt:      timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueHabitWeek: unique().on(t.habitId, t.weekStart),
}))

// ─── week_records ─────────────────────────────────────────────────────────────

export const weekRecords = pgTable('week_records', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').notNull(),
  weekStart:  date('week_start').notNull(),           // Sunday date
  createdAt:  timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserWeek: unique().on(t.userId, t.weekStart),
}))

// ─── reminders ────────────────────────────────────────────────────────────────

export const reminders = pgTable('reminders', {
  id:              uuid('id').primaryKey().defaultRandom(),
  taskId:          uuid('task_id').notNull(),         // FK → tasks.id (cascades on delete)
  userId:          uuid('user_id').notNull(),
  type:            reminderTypeEnum('type').notNull(),
  fireAt:          timestamp('fire_at'),              // for one_shot — UTC
  dailyTime:       time('daily_time'),                // for recurring_until_done (e.g. 09:00)
  status:          reminderStatusEnum('status').notNull().default('pending'),
  lastFiredAt:     timestamp('last_fired_at'),        // for recurring: tracks last fire
  createdAt:       timestamp('created_at').defaultNow().notNull(),
})
```

---

## State Transitions

### Task lifecycle
```
open (this_week) ──[complete]──→ done (this_week)
done             ──[uncomplete]──→ open  (same week only; blocked after Sunday flip)
open (this_week) ──[move]──────→ open (backlog)
open (backlog)   ──[promote]───→ open (this_week)
open             ──[delete]────→ (removed)
done             ──[Sunday flip]→ archived  (immutable)
open             ──[Sunday flip]→ carry-over triage:
                                    Keep → open (this_week, new week)
                                    Backlog → open (backlog)
                                    Drop → (removed)
```

### Habit lifecycle
```
active ──[pause]────→ paused   (streak frozen)
paused ──[resume]───→ active   (streak continues)
active ──[delete]───→ (soft-delete + wipe records after undo window)
paused ──[delete]───→ (same)
active ──[Sunday flip, target met]────→ active (currentStreak++)
active ──[Sunday flip, target missed]─→ active (currentStreak = 0)
paused ──[Sunday flip]──────────────→ paused  (streak unchanged, no record created)
```

### Goal lifecycle
```
active ──[mark hit]────→ hit       (terminal; moves to graveyard)
active ──[target date passed + "missed"]──→ missed  (terminal)
active ──[delete/abandon]──→ abandoned  (terminal; moves to graveyard)
graveyard ──[edit + set future date]──→ active  (reactivated; cap enforced on save)
```

### Reminder lifecycle
```
pending ──[fire_at reached]────→ fired  (one_shot terminal)
pending ──[task completed]─────→ cancelled
pending ──[task deleted]───────→ cancelled
pending ──[recurring, daily fire]──→ pending (lastFiredAt updated, repeats)
pending ──[recurring + task done]──→ cancelled
```

---

## Derived Values (not stored)

| Value | How derived |
|-------|-------------|
| Priority score | `effort × returnLevel` matrix; computed in service layer |
| "In danger zone" | `(weeklyTarget - countAchieved) + 1 ≥ daysLeftInWeek`; computed in cron |
| This week task fraction | `COUNT(status='done') / COUNT(all)` for current week_start |
| This week habit fraction | `COUNT(records where countAchieved ≥ targetAtTime) / COUNT(active habits)` |
| Tasks toward goal X | `COUNT(tasks where goalId=X AND weekAssignment='this_week')` |

---

## Seed Data (on user creation)

```typescript
// Themes pre-seeded for every new user
const defaultThemes = [
  { name: 'Health',   color: '#8C967A', icon: 'heart',    isSystem: false },
  { name: 'Career',   color: '#BF5B45', icon: 'briefcase', isSystem: false },
  { name: 'Personal', color: '#E9C176', icon: 'user',     isSystem: false },
  { name: 'Learning', color: '#7B9CB5', icon: 'book',     isSystem: false },
  { name: 'Uncategorized', color: '#6B6B6B', icon: 'circle', isSystem: true },
]
```
