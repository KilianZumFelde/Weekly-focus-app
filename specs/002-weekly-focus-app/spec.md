# Feature Specification: Weekly Focus App — Tasks, Habits & Goals

**Feature Branch**: `002-weekly-focus-app`
**Created**: 2026-05-15
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Daily Task & Habit Tracking (Priority: P1)

The user opens the app on their phone and immediately sees their active week: the primary milestone header, all habits with their weekly progress rings, and this week's tasks grouped by theme with effort/return chips. They can mark a task done with one tap, increment a habit's count by tapping its progress ring, or move/drop a task via a one-tap menu. Done items strike through and collapse to a "Done (N)" section at the bottom. Any accidental action is reverted via an app-wide Undo snackbar that appears briefly after every state-changing tap.

**Why this priority**: This is the core daily loop. Every other feature exists to support or enrich this view. Without it, the app has no value.

**Independent Test**: A user with pre-seeded themes, one habit (Gym, 4x/week), and two tasks can open the app, see "This Week", mark a task done, increment the Gym habit, and undo an accidental increment — all without leaving the screen.

**Acceptance Scenarios**:

1. **Given** the app is open on This Week, **When** the user taps a task's circle, **Then** the task immediately strikes through and moves to the collapsed "Done (N)" section at the bottom — no confirmation dialog shown.
2. **Given** a habit card is visible, **When** the user taps its progress ring, **Then** the count increments by 1 and an Undo snackbar appears; tapping Undo reverts the increment.
3. **Given** the habit target is reached (e.g., 4/4 Gym), **When** the count hits the target, **Then** a brief gold glow animation plays on the habit card — no confetti, no modal, no motivational quote.
4. **Given** a done task exists in the "Done (N)" section, **When** the user taps it again before the Sunday flip, **Then** the task is restored to open status in the week view.
5. **Given** a task card is visible, **When** the user taps its title text (not the circle), **Then** the Task Detail bottom sheet opens with all fields editable inline.
6. **Given** a task is open, **When** the user chooses "Move to backlog" from the task detail, **Then** the task disappears from This Week and appears in the Backlog tab.

---

### User Story 2 — Weekly Carry-Over Ritual (Priority: P1)

On Sunday, the user opens the app and is immediately presented with the mandatory weekly carry-over ritual. The first frame shows last week's raw counts (tasks done / total, habits on target / total), streak deltas, and a forward line toward the primary goal — always wins-first, never opening on failure. The user then triages each unfinished task one-by-one using exactly three options: Keep for this week / Send to backlog / Drop. After all tasks are triaged, an optional pull-from-backlog step lets the user stock the new week from saved items before tapping "Start week." The ritual reappears on every app open until fully completed — there is no skip or dismiss.

**Why this priority**: This is the weekly rhythm that prevents drift. Without it, tasks silently accumulate or vanish. The explicit triage is a core design principle.

**Independent Test**: A user with 3 unfinished tasks from last week can open the app on Sunday, see the recap, triage all 3 tasks, optionally pull backlog items, and reach "Start week" — without ever seeing a skip button or being able to dismiss the flow early.

**Acceptance Scenarios**:

1. **Given** the week has flipped (Sunday 00:00 local), **When** the user opens the app, **Then** the carry-over ritual launches immediately — This Week is not accessible until the ritual completes.
2. **Given** the ritual is active with 7 unfinished tasks, **When** the user triages 3 and closes the app, **Then** on next open the ritual resumes at task 4 — the recap step is not reshown, but triage continues from where it left off.
3. **Given** a task is shown during triage, **When** the user taps "Drop", **Then** the task is permanently deleted (same as Delete elsewhere); no new "Dropped" state is created.
4. **Given** all tasks have been triaged, **When** the user reaches the pull-from-backlog step, **Then** "Start week" is enabled immediately — they can tap it without pulling anything from the backlog.
5. **Given** no unfinished tasks existed last week, **When** the user opens the app on Sunday, **Then** the wins-first recap still shows, then the pull-from-backlog step is shown directly (triage step is skipped).

---

### User Story 3 — Voice & AI Quick-Capture (Priority: P1)

The user taps the persistent mic button (visible on every tab), speaks naturally — e.g., "Add gym 4 times a week" or "Remind me to call Pedro tomorrow morning" — and the AI parses the utterance into a draft card. The draft shows all inferred fields as tappable chips (type, theme, effort, return, week/backlog, goal link, reminder). Low-confidence fields are visually marked. The user confirms or edits inline and saves with one tap. The AI never auto-saves — confirmation is always required.

**Why this priority**: Voice capture is the primary input method. Reducing friction here is what makes the app sustainable for daily use.

**Independent Test**: A user can tap the mic on any tab, speak a task and a habit in one utterance, see two sequential draft cards with AI-inferred fields, correct a wrong theme on one card, and save both — without navigating to a separate screen.

**Acceptance Scenarios**:

1. **Given** the mic button is tapped on the Backlog tab, **When** the user speaks "Gym 4 times a week", **Then** a Habit draft card appears with type=Habit, weekly target=4, and the closest matching theme pre-selected.
2. **Given** a voice utterance contains two items, **When** AI parsing completes, **Then** two draft cards are shown in sequence with a "1 of 2" indicator and a "Save all" option.
3. **Given** the AI infers an uncertain theme, **When** the draft card appears, **Then** the theme chip is displayed with a visual low-confidence marker (faded text); the user can tap to change it.
4. **Given** the user speaks "cancel" or "scratch that" during recording, **When** the voice undo phrase is detected, **Then** the draft is dismissed with no item saved.
5. **Given** a capture sounds time-sensitive ("remind me to send the invoice tomorrow"), **When** the draft card appears, **Then** a reminder chip is pre-populated with a suggested time (default 09:00 local) — user can remove or change it before saving.
6. **Given** AI cannot determine the habit count target from speech, **When** the draft card appears, **Then** the count field is left blank with an inline prompt — it is not auto-guessed.

---

### User Story 4 — Goal Setting with AI Coach (Priority: P2)

The user taps "Coach me on a goal" from the Goals tab and enters an adaptive AI conversation. The coach — guided by principles (force the when, distinguish milestones from continuous directions, spot low-effort/high-return candidates, push back on vagueness) — helps the user define or review goals via conversation, with voice supported throughout. The coach never creates a goal inline; it concludes with a plain-prose summary and a single "Create this goal" button that opens the Add Goal form pre-filled. The user reviews and saves there. The 1 primary + 2 secondary cap is enforced at the Add Goal form on save — not inside the coach chat.

**Why this priority**: Goal definition is a known pain point for the user. Without structured support, goals remain vague and undated. This is v1 scope but builds on P1 screens.

**Independent Test**: A user with no existing goals can open the AI Coach, have a short conversation about what they want to achieve, receive a plain-prose summary with a recommended goal, tap "Create this goal", see the Add Goal form pre-filled, and save — without the coach ever creating the goal directly.

**Acceptance Scenarios**:

1. **Given** the user has no active goals, **When** they open the AI Coach, **Then** the coach opens in creation mode with the prompt "Let's figure out what you actually want to work toward."
2. **Given** the user has 2 existing goals, **When** they open the AI Coach, **Then** the coach opens in review mode showing current goals as context and asking about progress/priorities.
3. **Given** the conversation has concluded, **When** the coach posts its final message, **Then** it contains a plain-prose recommendation plus exactly one "Create this goal" button — no inline editable card, no in-chat accept.
4. **Given** the user taps "Create this goal", **When** the Add Goal form opens, **Then** the title, target date, type, theme, and optional "why" are pre-filled from the conversation.
5. **Given** the user already has 1 primary + 2 secondary goals active, **When** they save a new goal on the Add Goal form, **Then** a demotion/drop/cancel choice modal appears — the coach itself showed no enforcement UI.

---

### User Story 5 — Habits Management with Streaks (Priority: P2)

The user creates, edits, pauses, and resumes habits. Each habit tracks a weekly count target and maintains a current streak (consecutive weeks hitting the target) and a best-ever streak. Pausing a habit freezes the streak without breaking it. Deleting a habit shows a confirmation dialog and wipes all its weekly history after the Undo window closes.

**Why this priority**: Habits are the recurring discipline mechanism. They're central to the product promise but depend on the P1 daily tracking and week-flip infrastructure.

**Independent Test**: A user can create a "Gym 4x/week" habit, complete it over 3 weeks (streak=3), pause it, see the streak frozen at 3, resume it, miss a week (streak resets to 0), and see "Best ever: 3" remain displayed.

**Acceptance Scenarios**:

1. **Given** a habit hits its weekly target on Sunday flip, **When** the week archives, **Then** the habit's current streak increments by 1.
2. **Given** a habit is paused, **When** the Sunday flip occurs, **Then** no HabitWeekRecord is created for that habit and the streak value is unchanged.
3. **Given** an active habit does not hit its weekly target on Sunday flip, **When** the week archives, **Then** the current streak resets to 0; best-ever streak is unchanged.
4. **Given** the user exceeds the target (e.g., 5/4 Gym), **When** the count is shown, **Then** "5/4" is displayed; the streak still increments normally on flip.
5. **Given** the user taps "Delete" on a habit, **When** the confirmation dialog is accepted, **Then** an Undo snackbar appears; if dismissed without undo, all associated weekly history is permanently wiped.

---

### User Story 6 — Backlog Management (Priority: P2)

The user browses all "for later" tasks in the Backlog tab. Tasks can be added directly to the backlog from the mic/+ button when on this tab. Any backlog task can be promoted to "this week" via a single swipe or tap. This promotion is also surfaced during the optional pull-from-backlog step of the Sunday ritual.

**Why this priority**: The backlog prevents the "this week vs. later" distinction from collapsing into noise, but it is secondary to the primary daily loop and weekly ritual.

**Independent Test**: A user can add a task directly to the backlog, navigate to This Week and confirm it's not there, then return to Backlog and promote it to this week — and see it appear in This Week.

**Acceptance Scenarios**:

1. **Given** the user is on the Backlog tab, **When** they tap the mic or + button and capture a task, **Then** the task is saved directly to the backlog (no week assignment prompt needed — location is inferred from the active tab).
2. **Given** a backlog task is visible, **When** the user swipes it or uses the tap menu to promote it, **Then** it immediately appears in This Week and disappears from Backlog.
3. **Given** a backlog task has effort/return chips, **When** it is promoted to this week, **Then** all its attributes (theme, effort, return, goal link) are preserved unchanged.

---

### User Story 7 — Statistics & Progress Review (Priority: P3)

The Stats tab shows the user's current week's raw counts (tasks done / total · habits on target / total — as fractions, never percentages), active habit streaks (current + best ever), and a browseable history of past weeks. Tapping a past week expands it to show that week's completed tasks and habit results.

**Why this priority**: Stats provide the sense of "being on track" that defines quarterly success. They depend on archived WeekRecords accumulated over time — valuable only after weeks of use.

**Independent Test**: A user who has completed 3 prior weeks can open Stats and see: this week's fraction summary, streak counts for each habit, and 3 past-week cards they can expand to see completed tasks and habit results.

**Acceptance Scenarios**:

1. **Given** the user has completed tasks and habits this week, **When** they open Stats, **Then** fractions are shown as e.g., "12/15 tasks · 2/3 habits" — never as percentages.
2. **Given** a past week card is tapped, **When** it expands, **Then** all tasks completed that week and each habit's count vs. target are shown.
3. **Given** the user has no habits, **When** the Stats screen loads, **Then** the habit fraction in the summary shows "—" and the streak panel is hidden entirely.

---

### Edge Cases

- What happens when the week flips at Sunday 00:00 while the user has the app open? The flip event triggers the carry-over prompt on the next user interaction; active draft cards are preserved and not lost.
- What happens when the AI Coach is unreachable? An inline message "Coach is offline right now. You can still add a goal directly." appears with a button to open the Add Goal form directly.
- What happens when a goal's target date passes? The user is prompted: "Did you hit this? Extend? Drop?" — the goal is never silently deleted or moved to graveyard without user action.
- What happens when a theme is deleted that has linked tasks/habits/goals? A confirmation dialog warns the user; linked items are moved to an "Uncategorized" fallback theme on confirm.
- What happens when a reminder fires for a task already marked done? The reminder is silently cancelled — no notification fires.
- What happens when a user tries to add a 2nd primary goal? On save, the Add Goal form shows a force-choice modal: demote current primary to secondary / archive current primary / cancel.
- What happens when a user tries to add a 3rd secondary goal? On save, the force-choice modal offers: replace a specific existing secondary / promote the new goal to primary (demoting the current primary) / cancel.
- What happens when the user tries to demote the current primary goal while already having 2 secondary goals? The system requires dropping one secondary first before the demotion can proceed — it cannot silently create 3 secondaries.
- What happens if a voice utterance produces no parseable item? The draft card defaults to a Task type with the raw transcription as the title; all other fields default to Medium/this-week — the AI never refuses to produce a draft.

---

## Requirements *(mandatory)*

### Functional Requirements

**Week & Time**

- **FR-001**: The system MUST flip the active week at Sunday 00:00 local device time, automatically archiving done tasks, resetting habit counts, and updating streaks.
- **FR-002**: The system MUST present a mandatory, blocking carry-over ritual on the first app open after a week flip; this ritual MUST re-appear on every subsequent app open until every unfinished task has been triaged.
- **FR-003**: The carry-over ritual MUST present a wins-first recap (last week's task fraction, habit fraction, streak deltas, and a forward line toward the primary goal) before any triage step. The recap MUST NOT include a "goals completed" counter — goals rarely complete within a single week; the forward line toward the primary goal carries that dimension.
- **FR-004**: The triage step MUST offer exactly three options per unfinished task: Keep for this week / Send to backlog / Drop (= delete). No fourth option, no skip affordance.
- **FR-005**: After triage is complete, the ritual MUST present an optional, non-blocking pull-from-backlog step; the "Start week" button MUST be enabled even if no items are pulled.

**Tasks**

- **FR-006**: Tasks MUST NOT require a date or time field; date/time is optional and only relevant for reminders.
- **FR-007**: Every task MUST belong to exactly one theme and have an Effort value (Low/Medium/High, default Medium) and a Return value (Low/Medium/High, default Medium).
- **FR-008**: A task's week assignment MUST be either "this week" or "backlog"; no other states exist during the task's open lifecycle.
- **FR-009**: Marking a task done MUST be reversible (via Undo snackbar or by tapping the done task again) at any point within the same week; it MUST NOT be reversible after the Sunday flip.
- **FR-010**: A task MUST be deletable at any time without a confirmation dialog; the general Undo snackbar is the sole safety net.
- **FR-046**: This Week tasks MUST support a sort toggle with three modes: *Recommended* (default), *By theme*, and *Added order*. The Recommended sort MUST rank tasks by priority score using the following matrix: High return + Low effort = highest priority; High return + Medium effort, High return + High effort, and Medium return + Low effort = high priority; Medium return + Medium effort = medium priority; all other combinations (Medium return + High effort, Low return + any effort) = low or lowest priority. Ties within the same priority band MUST be broken by added-order oldest-first.
- **FR-047**: Only the primary goal MUST appear as the milestone header on This Week; secondary goals MUST NOT be shown on This Week — they are visible only on the Goals tab.

**Habits**

- **FR-011**: Every habit MUST have a weekly count target (positive integer, required — the AI must ask on the draft card if it cannot parse a target from the utterance).
- **FR-012**: A habit's progress ring MUST increment the count by 1 on tap; the habit's text area MUST open the Habit Detail/Edit sheet — these MUST be two distinct hit-targets on the same card.
- **FR-013**: The system MUST update a habit's streak on the Sunday flip: increment if the weekly target was met (or exceeded), reset to 0 otherwise. Paused habits MUST NOT have their streak changed on flip.
- **FR-014**: The system MUST retain best-ever streak independently from current streak; best-ever MUST NOT decrease under any circumstances.
- **FR-015**: Deleting a habit MUST show a confirmation dialog and MUST wipe all associated HabitWeekRecords after the Undo snackbar window closes (soft-delete window before permanent purge).
- **FR-048**: Habits MUST NOT expose Effort or Return fields — these are task-only attributes. A habit's only quantitative field is its weekly count target.
- **FR-049**: The Habit Detail/Edit sheet MUST display both the current streak and the best-ever streak side by side so the user can see their historical peak at all times.

**Goals**

- **FR-016**: The system MUST enforce a hard cap of at most 1 primary goal and at most 2 secondary goals active simultaneously; this cap MUST be enforced at the Add Goal screen on save — it is the single enforcement point.
- **FR-017**: A goal MUST require a title and a target date (future date); a "why" field is optional. Quick-select chips for 3 months / 6 months / 1 year / Custom MUST be offered.
- **FR-018**: When a goal's target date passes, the system MUST prompt the user: "Did you hit this? Extend? Drop?" — the goal MUST NOT be silently deleted or auto-archived.
- **FR-019**: Deleting a goal MUST move it to the graveyard (hit/missed/abandoned state) — goals are NEVER hard-erased in v1. When a goal is graveyard'd, its linked tasks and habits lose the goal link; theme links are preserved.
- **FR-020**: A graveyard goal MUST be reactivatable by editing it to set a future target date (subject to the 1+2 cap on save).
- **FR-050**: An active goal MUST be manually markable as "hit" at any time via a goal action drawer (accessible by tapping any active goal card) — this path coexists with and is independent of the target-date-passed prompt in FR-018.
- **FR-051**: When the goal cap is exceeded on save at the Add Goal screen, the system MUST present a force-choice modal with options specific to the scenario: (a) adding a 2nd primary goal — choices: demote current primary to secondary / archive current primary / cancel; (b) adding a 3rd secondary goal — choices: replace a specific existing secondary / promote the new goal to primary (demoting the current primary) / cancel; (c) demoting the current primary when 2 secondary goals already exist — the system MUST require the user to drop one secondary before the demotion can proceed; no silent overflow is permitted in any case.

**Voice & AI Capture**

- **FR-021**: A persistent mic button MUST be accessible on every primary tab; tapping it opens voice capture regardless of which tab is active.
- **FR-022**: The AI MUST parse the utterance and produce a draft card without refusing — if confidence is low on a field, that field MUST be visually marked; the AI MUST NOT auto-save any capture.
- **FR-023**: The AI MUST infer item type from recurrence cues: "X times a week / every / regularly" → Habit; otherwise → Task. The user MUST be able to flip the type with one tap on the draft card.
- **FR-024**: If an utterance contains multiple items, the AI MUST produce N draft cards shown in sequence with a "Save all" option.
- **FR-025**: Voice undo phrases ("scratch that", "start over", "cancel") MUST dismiss the current draft without saving.
- **FR-026**: The AI MUST NOT auto-guess a habit's weekly count target if it cannot parse one; it MUST prompt on the draft card instead.
- **FR-027**: The AI MUST suggest a reminder on the draft card when the utterance sounds time-sensitive; default reminder time when unspecified MUST be 09:00 local.
- **FR-052**: When a task is captured for a theme that has an active primary milestone, the system MUST auto-link the task to that milestone. If the theme has both a primary and a secondary active goal, the system MUST default the link to the primary goal; the user MUST be able to switch the link to the secondary goal with one tap on the draft card. If the theme has no active milestone, the task links to nothing.
- **FR-053**: The default week assignment for a captured task MUST be "this week". If the utterance contains the phrases "for later", "sometime", "no rush", or "in the future", the default MUST switch to "backlog". If voice or manual capture is initiated from the Backlog tab, the item MUST be assigned to backlog regardless of utterance content — no inference needed.
- **FR-054**: When the AI cannot match the captured item to any existing user theme, it MUST assign an "Uncategorized" pseudo-theme and MUST visually flag the theme chip on the draft card to prompt the user to review and correct it before saving.

**Reminders**

- **FR-028**: Per-task reminders MUST support at minimum: one-shot at a specific time, relative one-shot ("tomorrow morning"), and recurring daily until the task is done.
- **FR-029**: If a task is marked done before its reminder fires, the reminder MUST be silently cancelled.
- **FR-030**: Reminders MUST persist across Sunday flips.
- **FR-031**: Reminders MUST be invisible during normal use (no bell icon on tasks, no in-app reminder list on the main views); reminder management lives in Settings → Reminders only.
- **FR-032**: Settings → Reminders MUST provide at minimum a "Delete all configured reminders" action (with confirmation).
- **FR-055**: Tapping a push notification MUST open the app directly to the relevant item; no snooze action is offered in v1.

**Habit Danger-Zone Nudge**

- **FR-033**: The system MUST evaluate each active habit daily at 09:00 local time using the formula: fire if `count_remaining + 1 ≥ days_left`; each habit MUST NOT be nudged more than once per week.
- **FR-034**: The habit nudge MUST be globally toggleable in Settings (default on).

**Navigation & Undo**

- **FR-035**: The app MUST provide a 4-tab bottom navigation: This Week (default), Backlog, Goals, Stats.
- **FR-036**: Every state-changing action (task complete, task drop, habit increment, entity delete) MUST emit a transient Undo snackbar; one tap MUST revert the last action. This is the sole undo mechanism — no bespoke per-entity controls.
- **FR-056**: The Backlog tab MUST offer a sort toggle with three modes: *By theme* (default, with collapsible theme section headers) / *By priority* / *Recently added*.

**AI Goal Coach**

- **FR-037**: The AI Coach MUST be an adaptive conversation, not a fixed wizard; it MUST be guided by principles (force the when, distinguish milestones from continuous directions, spot compounding opportunities, advise on prioritization, push back on vagueness).
- **FR-038**: The AI Coach MUST support voice input throughout the conversation.
- **FR-039**: The coach MUST conclude with a plain-prose summary + a single "Create this goal" button that opens the Add Goal form pre-filled — the coach MUST NOT create or edit a goal inline or enforce the 1+2 cap directly.

**Settings & Theme Management**

- **FR-057**: Settings MUST provide a Theme management screen where the user can create, rename, delete, reorder, and assign a color/icon to each theme. Deleting a theme that has linked tasks, habits, or goals MUST show a confirmation dialog and MUST move all linked items to the "Uncategorized" pseudo-theme on confirm.

**Hard Constraints (Must NOT)**

- **FR-040**: The system MUST NOT require a date or time on any task.
- **FR-041**: The system MUST NOT auto-carry-over unfinished tasks without explicit user triage.
- **FR-042**: The system MUST NOT allow more than 1 primary or more than 2 secondary goals active simultaneously.
- **FR-043**: The system MUST NOT show motivational quotes, confetti, gamification badges, or Duolingo-style celebration UI.
- **FR-044**: The system MUST NOT auto-save any voice capture — user confirmation is always required.
- **FR-045**: The system MUST NOT allow a completed task to be re-opened after the Sunday flip.
- **FR-058**: The system MUST NOT apply Effort or Return fields to habits — these are task-only attributes.
- **FR-059**: The AI Goal Coach MUST be scoped to goal definition and review only in v1; it MUST NOT assist with task creation or management.

### Key Entities

- **Theme**: A user-defined category (e.g., DJ career, fitness). Every task, habit, and goal belongs to one theme. Name is unique per user (case-insensitive). Pre-seeded with 3–4 generic defaults on first launch. An "Uncategorized" pseudo-theme always exists as the AI fallback and the destination for items when their original theme is deleted.
- **Goal**: A milestone with a required future target date, a type (primary or secondary), an optional "why", and a lifecycle: active → hit | missed | abandoned. Goals are never hard-deleted; all terminal states move to a graveyard. The combination of (title + theme) must be unique per user — prevents accidental duplicate goals within the same theme.
- **Task**: A one-shot action with a theme, effort, return, week assignment (this week or backlog), optional goal link, and optional reminders. No date/time required.
- **Habit**: A weekly-recurring action with a theme, a count target, optional goal link, and lifecycle: active ⇄ paused → archived. Tracks current streak and best-ever streak. The combination of (title + theme) must be unique per user — no two habits with the same name in the same theme.
- **HabitWeekRecord**: The count achieved vs. target for one habit in one specific week. One record per habit per active week; archives on Sunday flip.
- **WeekRecord**: The archived container for a completed week — references done tasks and HabitWeekRecords for that week. Browseable in Stats.
- **Reminder**: A scheduled notification attached to a task. Supports one-shot and recurring-until-done patterns. Cancelled when the parent task is completed or hard-deleted.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After 3 months of use, the user can immediately name their primary milestone and the next 3 actions toward it — measured by self-report during a weekly review.
- **SC-002**: The user completes the daily check-in (opening This Week, marking at least one item) in under 60 seconds on a typical day.
- **SC-003**: The weekly carry-over ritual is completed within 5 minutes every Sunday, including triage of all unfinished tasks and optional backlog pull.
- **SC-004**: Voice capture to confirmed saved item takes under 15 seconds for a typical utterance (excluding speaking time).
- **SC-005**: The user reports no feeling of "drifting" after 3 months — they have a clear sense of what they're working toward and why (measured by self-report).
- **SC-006**: At least 70% of weeks, the user completes at least one habit target — indicating the habit system is driving sustainable recurring action.
- **SC-007**: The user does not abandon the app within the first 4 weeks — the friction of daily use is low enough to sustain the habit of using the habit-tracking system.
- **SC-008**: High-effort/low-return tasks are deprioritized — the "Recommended" sort surfaces low-effort/high-return items at the top and the user acts on them first at least 50% of the time.

---

## Assumptions

- The app is a mobile-first Expo (React Native) app backed by a REST API (hosted on Render.com) and a cloud database (Supabase / PostgreSQL). All data is stored server-side; the mobile app is a client, not a local-only store.
- An internet connection is required to use the app in v1; there is no offline mode or local cache.
- Authentication is handled by Supabase Auth; the app targets a single named user in v1 — no public registration, no sharing, no multi-user support.
- The device's local timezone is the authoritative time source for all week-flip and reminder logic; the timezone is sent with API requests; no multi-timezone complexity is needed.
- Push notification scheduling is handled via the backend; the mobile app receives and displays OS-level notifications delivered by the platform.
- Voice parsing and the AI Goal Coach are powered by the Claude API (Anthropic), called from the backend only — the mobile app never holds the API key.
- Themes are pre-seeded with 3–4 generic defaults (e.g., Health, Career, Personal, Learning) to reduce empty-state friction; the user can rename or delete all of them.
- Dark mode is the default appearance; light mode and system-follow are available in Settings.
- There is no onboarding flow in v1; a new user lands directly on the empty-state This Week screen with two CTAs: "Set my first goal (with AI Coach)" and "Add a task."
- AI Coach sessions are ephemeral — no conversation transcripts are persisted beyond the current session; only the resulting goal (if saved) is stored.
- No data export or backup UI is in scope for v1, though the underlying data model must not prevent it in future.
