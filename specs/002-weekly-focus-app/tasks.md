# Tasks: Weekly Focus App

**Input**: Design documents from `specs/002-weekly-focus-app/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/api.md ✅

**Tags**:
- `[P]` — can run in parallel (different files, no conflicts)
- `[USN]` — belongs to User Story N
- `[USER]` — requires a manual action from you; Claude stops and waits for confirmation before continuing

**Tests**: Constitution-mandated integration tests are included for 4 behaviors (Sunday flip, goal cap, habit delete, reminder cancel) and unit tests for 3 pure functions (priority score, streak logic, danger-zone formula). No other tests are generated.

---

## Phase 1: Setup

**Purpose**: Create the monorepo skeleton and configure tooling. Nothing runs yet.

- [x] T001 Create top-level monorepo structure: `mobile/`, `api/`, `shared/` directories with a root `package.json` defining npm workspaces
- [x] T002 [P] Initialise `api/` as a Node 20 TypeScript project: `package.json`, `tsconfig.json` (strict), Hono, Drizzle ORM, Zod, `@anthropic-ai/sdk`, `@supabase/supabase-js`
- [x] T003 [P] Initialise `mobile/` as an Expo project with Expo Router, `@supabase/supabase-js`, `@react-native-voice/voice`, `expo-notifications`
- [x] T004 [P] Configure ESLint + Prettier in `api/` with a shared `.eslintrc` and `.prettierrc`
- [x] T005 [P] Configure ESLint + Prettier in `mobile/` with a shared `.eslintrc` and `.prettierrc`
- [x] T006 Create `shared/types.ts` with stub TypeScript types for all API request/response shapes (matching `contracts/api.md`); configure path alias `@shared` in both `api/tsconfig.json` and `mobile/tsconfig.json`
- [x] T007 Create `api/.env.example` and `mobile/.env.example` with all required variable names and placeholder values (no real credentials)
- [x] T008 [USER] Create a Supabase project at supabase.com. Copy the **Database URL** (Session mode, port 5432), **Project URL**, **anon public key**, and **service role key** into `api/.env` and `mobile/.env` (using `.env.example` as the guide). Then confirm here.
- [x] T009 [USER] Confirm your Anthropic API key is set as `ANTHROPIC_API_KEY` in `api/.env`. Then confirm here.
- [x] T010 [USER] Create a Render.com **Web Service** pointing at the `api/` directory. Set the build command (`npm install && npm run build`) and start command (`npm run start`). Add the `api/.env` variables in the Render dashboard. Then confirm here.
- [x] T011 Create `api/src/routes/internal.ts` with a `GET /v1/health` endpoint that returns `{ "ok": true }` — used by UptimeRobot

**Checkpoint**: Repo structure exists, tooling configured, credentials in place, Render service created.

---

## Phase 2: Foundational

**Purpose**: Core infrastructure that MUST be complete before any user story can be implemented. No user story work begins until this phase is fully done.

- [x] T012 Create Drizzle DB connection in `api/src/db/index.ts` using `DATABASE_URL` from env
- [x] T013 Write the complete Drizzle schema in `api/src/db/schema.ts` — all 7 entities (userProfiles, themes, goals, tasks, habits, habitWeekRecords, weekRecords, reminders) exactly as specified in `data-model.md`
- [x] T014 Generate and run the initial Drizzle migration: `api/src/db/migrations/` — creates all tables in Supabase
- [x] T015 [P] Create seed script `api/src/db/seed.ts` that inserts the 5 default themes (Health, Career, Personal, Learning, Uncategorized) for the user. **Use the placeholder theme names listed here — do not use any personal theme names without asking first.**
- [x] T016 [P] Implement Supabase Auth JWT verification middleware in `api/src/middleware/auth.ts` — verifies `Authorization: Bearer <jwt>` on all protected routes; attaches `userId` to context
- [x] T017 Create Hono app entry point `api/src/index.ts`: register all route modules, apply auth middleware globally, configure CORS for the mobile app
- [x] T018 Implement user profile auto-creation in `api/src/middleware/auth.ts`: on first authenticated request, create a `user_profiles` row if one does not exist (inserts with timezone defaulting to `'UTC'` until updated by the app)
- [x] T019 Implement `GET /users/me` and `PATCH /users/me` in `api/src/routes/users.ts` and `POST /users/push-token`
- [x] T020 [P] Set up Supabase Auth in the mobile app: `mobile/services/auth.ts` — sign in with email/password, persist session, expose current session token
- [x] T021 [P] Create base API fetch wrapper `mobile/services/api.ts` — attaches `Authorization` header from current Supabase session, handles 401 (re-auth), standard error shape parsing
- [x] T022 Set up Expo Router tab bar layout: `mobile/app/_layout.tsx` (auth gate — redirect to sign-in if no session) and `mobile/app/(tabs)/_layout.tsx` (4-tab bottom bar: This Week, Backlog, Goals, Stats) per `.UI/DESIGN.md`
- [x] T023 Create `mobile/components/shared/UndoSnackbar.tsx` — transient snackbar that appears after any state-changing action; one tap calls the provided `onUndo` callback; auto-dismisses after 4 seconds
- [x] T024 Create `mobile/hooks/useUndo.ts` — app-wide undo state manager; exposes `showUndo(label, onUndo)` and dismisses any existing snackbar before showing a new one
- [x] T025 [P] Set up integration test environment in `api/tests/setup.ts` — connects to a separate Supabase **test project** (uses `TEST_DATABASE_URL` env var); truncates all tables before each test
- [x] T026 [P] Set up unit test runner in `api/tests/unit/` — Jest config, no DB connection needed

**Checkpoint**: API boots, JWT auth works, DB tables exist, mobile app opens and shows the tab bar.

---

## Phase 3: User Story 1 — Daily Task & Habit Tracking (Priority: P1) 🎯 MVP

**Goal**: User can open the app, see This Week with habits and tasks, mark items done, increment habits, undo mistakes, and edit items inline.

**Independent Test**: Open the app with pre-seeded fictional tasks and habits, complete a task, increment a habit to its target (gold glow appears), accidentally increment again (Undo snackbar appears), tap Undo (count reverts), tap a task title (TaskDetailSheet opens with editable fields).

**UI references**: `.UI/this_week/screen.png`, `.UI/task_detail_edit_cleaned/screen.png`, `.UI/habit_detail_edit/screen.png`

### API — Tasks & Habits

- [x] T027 [P] [US1] Implement tasks service `api/src/services/tasks.service.ts`: getWeekTasks (with priorityScore), getBacklogTasks, createTask, updateTask, completeTask, uncompleteTask (blocks after flip), moveTask, deleteTask (cancels reminders)
- [x] T028 [P] [US1] Implement `api/src/routes/tasks.ts`: `GET /tasks/week`, `GET /tasks/backlog`, `POST /tasks`, `PATCH /tasks/:id`, `POST /tasks/:id/complete`, `POST /tasks/:id/uncomplete`, `POST /tasks/:id/move`, `DELETE /tasks/:id`
- [x] T029 [P] [US1] Implement habits service `api/src/services/habits.service.ts`: getHabits (with current week record), createHabit, updateHabit, incrementCount (returns targetHit flag), pauseHabit, resumeHabit
- [x] T030 [P] [US1] Implement `api/src/routes/habits.ts`: `GET /habits`, `POST /habits`, `PATCH /habits/:id`, `POST /habits/:id/increment`, `POST /habits/:id/pause`, `POST /habits/:id/resume`
- [x] T031 [P] [US1] Implement themes service + routes `api/src/services/themes.service.ts` + `api/src/routes/themes.ts`: full CRUD; DELETE moves linked items to Uncategorized; case-insensitive name uniqueness enforced

### Mobile — Service Clients

- [x] T032 [P] [US1] Create `mobile/services/tasks.service.ts` — typed wrappers for all tasks API endpoints
- [x] T033 [P] [US1] Create `mobile/services/habits.service.ts` — typed wrappers for all habits API endpoints
- [x] T034 [P] [US1] Create `mobile/services/themes.service.ts` — typed wrappers for themes endpoints

### Mobile — Components

- [x] T035 [P] [US1] Create `mobile/components/tasks/TaskCard.tsx`: checkbox circle (tap = complete), title area (tap = open detail sheet), theme chip, effort chip, return chip; struck-through style when done
- [x] T036 [P] [US1] Create `mobile/components/habits/HabitCard.tsx`: two distinct hit-targets — progress ring (tap = increment) and text area (tap = open detail sheet); circular progress indicator; brief gold glow animation when target hit; no confetti
- [x] T037 [P] [US1] Create `mobile/components/shared/SortToggle.tsx`: segmented control with three options (Recommended / By theme / Added order)
- [x] T038 [US1] Create `mobile/components/tasks/TaskDetailSheet.tsx`: bottom sheet; editable title, theme chip, effort chip, return chip, week assignment toggle, goal link chip; "Move to backlog" and "Delete" actions; no "Drop" label here — that label is triage-only
- [x] T039 [US1] Create `mobile/components/habits/HabitDetailSheet.tsx`: bottom sheet; editable title, theme chip, weekly count target stepper, goal link chip; current streak + best-ever streak side by side; Pause/Resume toggle; Delete button (triggers confirmation dialog)

### Mobile — This Week Screen

- [x] T040 [US1] Implement `mobile/app/(tabs)/index.tsx` (This Week): primary milestone hero card at top; habits section; tasks section grouped by theme with SortToggle; "Done (N)" collapsible section (collapsed by default); fetches from tasks and habits services; wires task complete/incomplete to UndoSnackbar; wires habit increment to UndoSnackbar

### Tests (Constitution-mandated)

- [x] T041 [P] [US1] Unit test: priority score matrix in `api/tests/unit/priorityScore.test.ts` — verify all 9 effort×return combinations produce the correct `priorityScore` value
- [x] T042 [P] [US1] Integration test: task complete/uncomplete in `api/tests/integration/taskLifecycle.test.ts` — complete a task, verify status=done; uncomplete it, verify status=open; complete it again and simulate flip, verify uncomplete is rejected with TASK_ARCHIVED

**Checkpoint**: This Week screen works end-to-end. Tasks complete, habits increment, undo works, detail sheets open and save.

### Post-Phase 3 Bug Fixes & UI Polish

- [x] BF01 Fix progress ring: replaced CSS rotation technique (broken — rotating a symmetric circle produces no visible change) with `react-native-svg` `strokeDashoffset` — ring now correctly fills clockwise; added `react-native-svg ~15.11.2` to `mobile/package.json`
- [x] BF02 Add `decrementCount` to `api/src/services/habits.service.ts` + `POST /habits/:id/decrement` route — enables real server-side undo for habit increments
- [x] BF03 Fix undo handler in `index.tsx`: calls real `decrementCount` endpoint instead of optimistic revert (eliminated count-skipping bug where undo → next tap jumped 2 counts)
- [x] BF04 Fix pause toggle in `HabitDetailSheet.tsx`: add local `isPaused` state updated optimistically on toggle press (previously only reflected after parent reload)
- [x] BF05 Fix `getHabits` to include paused habits — changed `eq(habits.status, 'active')` to `inArray(habits.status, ['active', 'paused'])` so paused habits remain visible and resumable
- [x] BF06 Fix `updateHabit` to sync `targetAtTime` on the current week record when `weeklyTarget` changes — ring denominator now updates immediately after closing detail sheet
- [x] BF07 Move theme section chevron from right to left (matching design): reorder `themeHeader` children in `index.tsx`
- [x] BF08 Align horizontal margins to 24px gutter: `themeHeader.paddingHorizontal`, `doneSection.marginHorizontal` in `index.tsx`, `card.marginHorizontal` in `TaskCard.tsx` (previously 16px, misaligned with "Habits"/"Tasks" labels)

---

## Phase 4: User Story 2 — Weekly Carry-Over Ritual (Priority: P1)

**Goal**: Sunday flip happens automatically on first app open. The ritual shows a wins-first recap, triages unfinished tasks one-by-one (3 buttons, no skip), then offers optional backlog pull. Ritual re-appears every open until all tasks are triaged.

**Independent Test**: With 3 fictional unfinished tasks from "last week", open the app — ritual launches immediately, This Week is blocked. Triage 2 tasks, close the app, reopen — ritual resumes at task 3. Complete triage, reach pull-from-backlog step, tap "Start week" without pulling anything — ritual completes, This Week loads.

**UI references**: `.UI/triage_last_week_recap/screen.png`, `.UI/triage_task_1_of_3/screen.png`, `.UI/triage_stock_this_week/screen.png`, `.UI/triage_completion_confirmation/screen.png`

### API — Week Flip & Triage

- [ ] T043 [US2] Implement week flip service `api/src/services/weekFlip.service.ts`: create WeekRecord for completed week; archive done tasks (status→archived, archivedWeekStart set); update habit streaks (increment if target met, reset to 0 if missed, skip if paused); create new HabitWeekRecords for active habits; update `lastWeekStart` on user profile; idempotent (safe to call twice)
- [ ] T044 [US2] Implement `POST /v1/internal/week-flip` in `api/src/routes/internal.ts`; reads user timezone from `X-User-Timezone` header; validates that a flip is actually due before executing
- [ ] T045 [US2] Implement triage service + routes: `GET /tasks/triage` (returns recap + pendingTasks); `POST /tasks/:id/triage` with `action: keep | backlog | drop` in `api/src/routes/triage.ts`

### Mobile — Week Flip Hook & Triage Screen

- [ ] T046 [US2] Create `mobile/hooks/useWeekFlip.ts`: on app foreground, compare current local Sunday to `lastWeekStart` from user profile; if a new Sunday has passed, call `POST /internal/week-flip` with `X-User-Timezone` header
- [ ] T047 [US2] Implement `mobile/app/triage.tsx` (full-screen modal, 4 steps in sequence):
  1. Recap frame: last week's task fraction, habit fraction, streak deltas, forward goal line — **no "goals completed" counter**; single "Review leftovers →" button
  2. Per-task triage: progress indicator ("N of M"); large task card; exactly 3 buttons (Keep / Send to backlog / Drop); no skip affordance anywhere
  3. Pull-from-backlog: scrollable backlog list; tap to add; "Start week" always enabled
  4. Completion confirmation toast then close
- [ ] T048 [US2] Wire triage modal to block This Week: in `mobile/app/_layout.tsx`, after week flip check, call `GET /tasks/triage`; if `needsTriage: true`, show triage modal before rendering tabs

### Tests (Constitution-mandated)

- [ ] T049 [P] [US2] Integration test: Sunday flip in `api/tests/integration/weekFlip.test.ts` — create habit with target 4, set count to 4, trigger flip: verify streak increments; create second habit with count 2 (missed), trigger flip: verify streak resets to 0; verify done tasks archive; verify paused habit streak unchanged
- [ ] T050 [P] [US2] Unit test: streak logic in `api/tests/unit/streakLogic.test.ts` — target met → increment; target missed → reset; over-target → increment; paused → unchanged
- [ ] T051 [P] [US2] Unit test: week boundary date arithmetic in `api/tests/unit/dateArithmetic.test.ts` — given a timestamp in various timezones, verify the correct Sunday start date is computed

**Checkpoint**: Sunday ritual works end-to-end. Flip archives tasks, updates streaks. Triage blocks the app until complete. Pull-from-backlog is optional.

---

## Phase 5: User Story 3 — Voice & AI Quick-Capture (Priority: P1)

**Goal**: Mic button is always visible. User speaks, device STT transcribes, Claude parses into a draft card with all fields as tappable chips. Low-confidence fields are visually marked. User confirms or edits and saves. Multi-item utterances show sequential draft cards.

**Independent Test**: Tap mic on any tab, say "Gym 4 times a week" — Habit draft appears with target=4 and closest theme pre-selected. Then say "Remind me to call Pedro tomorrow morning" — Task draft appears with a reminder chip pre-set to next-day 09:00. Edit the theme chip, save — item appears in This Week.

**UI references**: `.UI/quick_add_draft_card/screen.png`, `.UI/quick_add_interactive_entry_state/screen.png`

### API — AI Parse & Reminders

- [ ] T052 [P] [US3] Implement AI parse function in `api/src/services/ai.service.ts`: call Claude with the transcribed text + user's themes/goals context; return structured draft JSON matching the `POST /ai/parse` response shape in `contracts/api.md`; handle multi-item utterances (return array); mark low-confidence fields as `null`
- [ ] T053 [P] [US3] Implement `POST /v1/ai/parse` in `api/src/routes/ai.ts`
- [ ] T054 [P] [US3] Implement reminders service `api/src/services/reminder.service.ts`: createReminder, deleteReminder, deleteAllReminders, cancelTaskReminders (called on task complete/delete)
- [ ] T055 [P] [US3] Implement `api/src/routes/reminders.ts`: `POST /tasks/:id/reminders`, `DELETE /reminders/:id`, `DELETE /reminders` (delete-all with `confirmed: true` body)

### Mobile — Mic, STT, Draft Card

- [ ] T056 [P] [US3] Create `mobile/components/capture/MicButton.tsx`: persistent terracotta FAB + smaller "+" button paired beside it; positioned above the tab bar; visible on all tabs; tap mic → start recording, tap again or silence → stop; tap "+" → open empty draft card
- [ ] T057 [US3] Integrate `@react-native-voice/voice` in MicButton: request microphone permission on first use; detect voice undo phrases ("scratch that", "start over", "cancel") → dismiss without saving
- [ ] T058 [US3] Create `mobile/components/capture/DraftCard.tsx`: bottom sheet (expands to full-screen on multi-item); type pill (Task/Habit, tappable to flip); large editable title; tappable chips for all fields (theme, effort, return, week assignment, goal link, reminder); low-confidence fields shown with faded text; Cancel / Save buttons; "N of M" indicator + "Save all" for multi-item
- [ ] T059 [US3] Create `mobile/services/ai.service.ts`: call `POST /ai/parse` with transcript + context; return typed draft array; handle API error (fall back to empty draft card with raw transcript as title)
- [ ] T060 [US3] Wire the full capture flow in `mobile/app/_layout.tsx`: MicButton tap → record → stop → send to ai.service → receive draft array → show DraftCard(s) in sequence → on Save call tasks.service.createTask or habits.service.createHabit → UndoSnackbar

**Checkpoint**: Voice capture works end-to-end. Mic button visible everywhere. Draft card appears with correct inferred fields. Save creates the item. Multi-item utterances work.

---

## Phase 6: User Story 4 — Goal Setting with AI Coach (Priority: P2)

**Goal**: User can add goals directly or via the AI Coach. Coach is advisory-only, concludes with a "Create this goal" button that pre-fills the Add Goal form. Cap (1 primary + 2 secondary) is enforced at the Add Goal form on save. Goal lifecycle transitions (mark hit, abandon) work from the goal action drawer.

**Independent Test**: Open Coach with no existing goals — creation mode opens. Have a short conversation. Coach concludes with plain-prose summary and "Create this goal" button. Tap it — Add Goal form opens pre-filled. Save — goal appears on Goals screen. Tap goal card → action drawer opens with "Mark as hit / Delete / Edit".

**UI references**: `.UI/goals/screen.png`, `.UI/add_goal_form/screen.png`, `.UI/goal_coach_minimal_input_layout/screen.png`, `.UI/goal_coach_text_summary_proposal/screen.png`

### API — Goals & Coach

- [ ] T061 [P] [US4] Implement goals service `api/src/services/goals.service.ts`: getGoals (active + graveyard), createGoal (cap enforcement with GOAL_CAP_EXCEEDED error + capScenario), createGoalWithForce, updateGoal, markHit, abandonGoal; goal deletion unlinks tasks/habits (clears goalId, keeps themeId)
- [ ] T062 [P] [US4] Implement `api/src/routes/goals.ts`: all goals endpoints per `contracts/api.md`
- [ ] T063 [P] [US4] Implement AI Coach function in `api/src/services/ai.service.ts`: SSE streaming response; system prompt encodes the coach principles (force the when, distinguish milestones from habits, spot compounding opportunities, push back on vagueness, advise on 1+2 cap without enforcing it); detects conversation conclusion and emits `proposedGoal` in the `done` event
- [ ] T064 [P] [US4] Implement `POST /v1/ai/coach` SSE streaming endpoint in `api/src/routes/ai.ts`

### Mobile — Goals Screen, Forms, Coach

- [ ] T065 [P] [US4] Create `mobile/services/goals.service.ts` — typed wrappers for all goals endpoints
- [ ] T066 [US4] Create `mobile/app/(tabs)/goals.tsx` (Goals screen): primary goal hero card; secondary goal cards (up to 2); "Add Goal" and "Coach me on a goal" CTAs; collapsed graveyard section; empty state: "You haven't set a goal yet" with single big Coach button
- [ ] T067 [US4] Create `mobile/components/goals/GoalCard.tsx` and `mobile/components/goals/GoalActionDrawer.tsx`: active goals → drawer with Mark as hit / Delete / Edit; graveyard goals → drawer with Edit only (reactivate by setting future date)
- [ ] T068 [US4] Create `mobile/app/goal-form.tsx` (Add/Edit Goal full-screen modal): large title field; target date with quick-select chips (3 months / 6 months / 1 year / Custom); Primary/Secondary radio; theme dropdown with AI suggestion; optional "why" textarea; Save disabled until title + date filled; on cap exceeded → show force-choice modal with scenario-specific options (per FR-051)
- [ ] T069 [US4] Create `mobile/app/coach.tsx` (AI Coach full-screen modal): chat-style thread; SSE streaming renders tokens in real-time; voice input supported throughout; creation mode vs. review mode based on existing goals; final AI message + "Create this goal" button → opens goal-form.tsx pre-filled; "Restart conversation" secondary action; offline fallback message

### Tests (Constitution-mandated)

- [ ] T070 [P] [US4] Integration test: goal cap enforcement in `api/tests/integration/goalCap.test.ts` — scenario (a): add 2nd primary → GOAL_CAP_EXCEEDED with capScenario=second_primary; retry with forceAction=demote_existing → succeeds; scenario (b): add 3rd secondary → GOAL_CAP_EXCEEDED; scenario (c): demote primary with 2 existing secondaries → GOAL_CAP_EXCEEDED

**Checkpoint**: Goals screen shows active + graveyard. Add Goal form enforces cap. Coach streams and concludes with pre-filled form. Goal lifecycle transitions (hit, abandon, reactivate) work.

---

## Phase 7: User Story 5 — Habits with Streaks (Priority: P2)

**Goal**: Habit delete shows confirmation and wipes history after the undo window. Pausing freezes the streak. Best-ever streak is always visible in the detail sheet.

**Note**: Habit CRUD, increment, pause, and resume were implemented in Phase 3. This phase adds the delete+wipe flow and its mandatory integration test.

**Independent Test**: Create a fictional habit, complete it for 3 weeks (streak=3), delete it — confirmation dialog appears; accept — Undo snackbar appears; wait for snackbar to dismiss — re-open Stats, verify no habit week records remain for that habit.

- [ ] T071 [US5] Implement habit soft-delete with deferred record wipe in `api/src/services/habits.service.ts`: mark habit as soft-deleted, generate `undoToken`, schedule record wipe 30 seconds later; implement `POST /habits/:id/undo-delete` to cancel wipe within the window
- [ ] T072 [US5] Add `DELETE /habits/:id` and `POST /habits/:id/undo-delete` routes to `api/src/routes/habits.ts`
- [ ] T073 [US5] Add delete confirmation dialog and undo-delete call to `mobile/components/habits/HabitDetailSheet.tsx`: on delete confirm → call DELETE endpoint → show UndoSnackbar with onUndo calling undo-delete endpoint

### Tests (Constitution-mandated)

- [ ] T074 [P] [US5] Integration test: habit delete with record wipe in `api/tests/integration/habitDelete.test.ts` — create habit, add 3 HabitWeekRecords; call DELETE; call undo-delete → verify records still exist; call DELETE again, wait 31 seconds → verify all HabitWeekRecords are gone and habit is removed
- [ ] T075 [P] [US5] Unit test: danger-zone formula in `api/tests/unit/dangerZone.test.ts` — verify `(weeklyTarget - countAchieved) + 1 >= daysLeft` produces correct true/false for various combinations

**Checkpoint**: Habit delete works with confirmation + undo + deferred record wipe. Best-ever streak visible in detail sheet.

---

## Phase 8: User Story 6 — Backlog Management (Priority: P2)

**Goal**: Backlog tab shows all "for later" tasks with sort options. Mic/+ on Backlog tab defaults to backlog assignment. Tasks promote to this week with one tap.

**Independent Test**: Add a fictional task from the Backlog tab (confirm it goes to backlog, not this week). Navigate to This Week — task is not there. Return to Backlog, swipe to promote — task appears in This Week.

**UI reference**: `.UI/backlog/screen.png`

- [ ] T076 [US6] Add `sort` query param to `GET /tasks/backlog` in `api/src/routes/tasks.ts`: `by-theme` (default) / `by-priority` / `recently-added`; implement sort logic in `api/src/services/tasks.service.ts`
- [ ] T077 [US6] Implement `mobile/app/(tabs)/backlog.tsx` (Backlog screen): SortToggle (By theme / By priority / Recently added); collapsible theme sections when sorted by theme; task cards with swipe-to-promote or tap-menu promote action; empty state message; mic/+ buttons always visible
- [ ] T078 [US6] Wire tab-context backlog default in `mobile/app/(tabs)/backlog.tsx`: when capture is initiated from this tab, set `weekAssignment: 'backlog'` regardless of utterance content

**Checkpoint**: Backlog tab fully functional. Capture from backlog tab defaults to backlog. Promote to this week works.

---

## Phase 9: User Story 7 — Statistics & Progress Review (Priority: P3)

**Goal**: Stats tab shows current week fractions (never percentages), habit streaks (current + best ever), and a browseable past-weeks list that expands to show completed tasks and habit results.

**Independent Test**: With 2 completed weeks of fictional data, open Stats — see "X/Y tasks · A/B habits" for the current week; see 2 past-week cards; expand one — completed task titles and habit count vs. target are shown.

**UI reference**: `.UI/stats/screen.png`

- [ ] T079 [P] [US7] Implement stats service `api/src/services/stats.service.ts`: getCurrentWeekStats (tasks fraction, habits fraction, streaks); getPastWeeks (WeekRecords with expanded tasks and habit records)
- [ ] T080 [P] [US7] Implement `api/src/routes/stats.ts`: `GET /stats/current`, `GET /stats/weeks`
- [ ] T081 [P] [US7] Create `mobile/services/stats.service.ts` — typed wrappers for stats endpoints
- [ ] T082 [US7] Implement `mobile/app/(tabs)/stats.tsx` (Stats screen): large raw-count summary line (fractions, NOT percentages); habit streaks panel (current + best-ever per habit, hidden entirely if no habits); past-weeks scrollable list; expandable week cards showing completed tasks + habit counts; empty state for first week

**Checkpoint**: Stats tab shows accurate current-week fractions, streaks, and past-weeks history.

---

## Phase 10: Push Notifications & Cron

**Purpose**: Habit nudges and task reminders delivered as push notifications. 15-minute cron fires reminders and evaluates danger zones.

- [ ] T083 [P] Request push notification permissions in `mobile/app/_layout.tsx` on first launch; send the Expo push token to `POST /users/push-token`
- [ ] T084 [P] Implement `mobile/services/push.ts`: register for push token using `expo-notifications`
- [ ] T085 [P] Implement push service `api/src/services/push.service.ts`: send a notification to a stored `expo_push_token` via the Expo Push API (`https://exp.host/--/api/v2/push/send`)
- [ ] T086 [P] Implement nudge service `api/src/services/nudge.service.ts`: query all active habits for the user; evaluate danger-zone formula (`(weeklyTarget - countAchieved) + 1 >= daysLeftInWeek`); skip habits already nudged this week (`lastNudgedAt` field); send push notification for matching habits; notification copy: "Gym 1/4 this week — 3 days left to hit your target." (no emojis, no motivational language)
- [ ] T087 Implement reminder firing in `api/src/services/reminder.service.ts`: query `reminders` where `status=pending` and `fireAt <= now`; send push notification; mark one-shot reminders as `fired`; update `lastFiredAt` on recurring reminders; cancel recurring reminders where parent task is done
- [ ] T088 Create cron job entry point `api/src/jobs/run.ts`: call reminder firing service + nudge service; designed to be called by Render cron every 15 minutes
- [ ] T089 [USER] Create a Firebase project at console.firebase.google.com, enable Cloud Messaging, and download `google-services.json`. Add it to `mobile/android/app/google-services.json`. Then confirm here.
- [ ] T090 [USER] Create a Render.com **Cron Job** service pointing at the `api/` directory. Command: `npm run jobs:run`. Schedule: `*/15 * * * *`. Add the same env vars as the web service. Then confirm here.
- [ ] T091 [USER] Create a free UptimeRobot monitor: type HTTP, URL = your Render API health endpoint (`https://your-api.onrender.com/v1/health`), interval = 5 minutes. Then confirm here.

### Tests (Constitution-mandated)

- [ ] T092 [P] Integration test: reminder auto-cancel in `api/tests/integration/reminderCancel.test.ts` — create a fictional task with a `one_shot` reminder; complete the task; verify the reminder status is `cancelled` and no push is sent

**Checkpoint**: Push token registered. Nudges fire for habits in danger zone. Task reminders fire at scheduled times and auto-cancel on task completion. Cron runs every 15 minutes on Render.

---

## Phase 11: Settings

**Purpose**: Theme management, reminder cleanup, nudge toggle, appearance. No UI design files exist — implemented from spec only.

- [ ] T093 [P] Create `mobile/app/settings.tsx` (full-screen, via gear icon on This Week): grouped list — Themes row → navigate to themes-management; Reminders row → navigate to reminders; Habit nudges toggle (on by default, calls `PATCH /users/me`); Appearance toggle (Light / Dark / System)
- [ ] T094 [P] Create `mobile/app/themes-management.tsx` (Themes Management sub-screen): reorderable list of theme rows (drag handle + color swatch + name + edit/delete); "+ Add theme" button; edit → inline sheet (rename, change color/icon); delete with linked-items confirmation dialog
- [ ] T095 [P] Create `mobile/app/reminders.tsx` (Reminders sub-screen): optional list of pending reminder rows (parent task title + next fire time + recurrence); "Delete all configured reminders" button with confirmation (calls `DELETE /reminders` with `confirmed: true`)

**Checkpoint**: Settings screen navigates to all sub-screens. Theme management works. Reminder bulk-delete works. Nudge toggle persists.

---

## Phase 12: Polish & Distribution

**Purpose**: Error states, loading states, appearance, and getting the APK onto your phone.

- [ ] T096 [P] Add connection-loss error state to all 4 tab screens: inline message with retry button (no offline cache)
- [ ] T097 [P] Add loading skeleton card placeholders (same card dimensions, no shimmer) to This Week, Backlog, Goals, Stats
- [ ] T098 Implement Light / Dark / System appearance toggle: persist selection in user profile; apply via `useColorScheme` + Expo's theme system using the Analog Digital color tokens from `.UI/DESIGN.md`
- [ ] T099 [USER] Run `eas build --platform android --profile preview` to build the Android APK. Download the APK from the EAS dashboard. Then confirm here.
- [ ] T100 [USER] Install the APK on your Android device: enable "Install from unknown sources" in Android settings if needed, then install the downloaded APK. Then confirm here.
- [ ] T101 Run the quickstart.md validation checklist end-to-end: verify all 6 checklist items pass on the installed APK

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phases 3–9 (User Stories)**: All depend on Phase 2 completion; stories can run in priority order (P1 → P2 → P3) — each is independently testable before the next begins
- **Phase 10 (Notifications/Cron)**: Can begin after Phase 3 (tasks service exists); [USER] steps can be done in parallel with coding
- **Phase 11 (Settings)**: Can begin after Phase 2; independent of all user story phases
- **Phase 12 (Polish)**: Begins after all desired user stories are complete

### User Story Dependencies

- **US1 (P1)**: First after Foundational — no story dependencies
- **US2 (P1)**: Depends on US1 (week flip archives tasks; This Week must exist)
- **US3 (P1)**: Depends on US1 (creates tasks/habits; draft card saves to existing services)
- **US4 (P2)**: Depends on US1 (goals link to themes/tasks already in DB)
- **US5 (P2)**: Depends on US1 (habit delete extends Phase 3 habit service)
- **US6 (P2)**: Depends on US1 (backlog is part of tasks service)
- **US7 (P3)**: Depends on US2 (Stats reads WeekRecords created by the flip)

### Parallel Opportunities Within Each Story

Most `[P]`-tagged tasks within a phase can be started simultaneously: API routes/services are separate files from mobile components, and service clients are separate from screens.

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup
2. Phase 2: Foundational — **required before any story**
3. Phase 3: User Story 1
4. **STOP and validate**: open the app, complete a task, increment a habit, verify Undo works
5. You have a working app at this point

### Incremental Delivery

Each phase adds one independently testable capability:

| After phase | What you can do |
|-------------|----------------|
| Phase 3 (US1) | See and interact with this week's tasks and habits |
| Phase 4 (US2) | Sunday ritual — triage, flip, streaks update |
| Phase 5 (US3) | Voice capture → draft → save |
| Phase 6 (US4) | Set goals, use AI Coach |
| Phase 7 (US5) | Full habit lifecycle (delete + history wipe) |
| Phase 8 (US6) | Backlog tab fully works |
| Phase 9 (US7) | Stats tab with history |
| Phase 10 | Push nudges and reminders fire |
| Phase 11 | Settings, theme management, reminder cleanup |
| Phase 12 | APK on your phone, polished |

---

## Summary

| Phase | Tasks | [USER] stops |
|-------|-------|--------------|
| Phase 1: Setup | T001–T011 | T008, T009, T010 |
| Phase 2: Foundational | T012–T026 | — |
| Phase 3: US1 Daily tracking | T027–T042 | — |
| Phase 4: US2 Carry-over ritual | T043–T051 | — |
| Phase 5: US3 Voice capture | T052–T060 | — |
| Phase 6: US4 Goal Coach | T061–T070 | — |
| Phase 7: US5 Habit streaks | T071–T075 | — |
| Phase 8: US6 Backlog | T076–T078 | — |
| Phase 9: US7 Stats | T079–T082 | — |
| Phase 10: Notifications | T083–T092 | T089, T090, T091 |
| Phase 11: Settings | T093–T095 | — |
| Phase 12: Polish & APK | T096–T101 | T099, T100 |
| **Total** | **101 tasks** | **8 [USER] stops** |
