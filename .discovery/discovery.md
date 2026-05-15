# Discovery: Weekly Focus — Tasks, Habits, Goals

**Date**: 2026-05-14
**Original description**: I want to create an app where basically i can create tasks to complete in a given week, also habits (habits the difference is that they have like a count to match, like go 4/4 to the gym), these tasks and habits should belong to different themes, the themes should be configureable. And above that, there should also be statistics that basically tell me what tasks I completed in a given week, and also the streaks that are ongoing for always having completed my habits. And on top of that, and this is important, I would like something to set like a goal or milestone somehow in the future. So that I can then focus on thinking about what tasks I want to prioritize based on that milestone and not lose track of the main goal. Maybe there could also be secondary goals. O and maybe the tasks could also have some kind of Effort/return (for instance, for my dj career contact person X, the mere contacting is low effort, but it could have a high Return becasue then things start rolling...and if I wait weeks and weeks, i am waiting and losing a lot of time, and I could have simply started it by a little mesage)

---

## Product & Business

### Product Lens Summary

- **Problem**: Long-term goals slip out of focus because weekly noise dominates day-to-day decisions; high-leverage / low-effort actions get procrastinated indefinitely; the user "drifts" — months pass without measurable progress. Two dimensions: (a) long-term anchoring (keep goals tethered to weekly action), and (b) recurring discipline (habits force ongoing work on areas the user wants to change — gym, bachata, CV-writing, etc.).
- **Primary user**: Solo personal use — the app's author. Mobile-first (uses phone, not desktop). Currently no structured system; tried paper (good visibility, breaks down with scale), Trello (desktop friction stopped daily use), most apps (too noisy, force date/time discipline).
- **Secondary users**: None — this is a single-user personal app.
- **Current workaround**: Makeshift PWA with voice → speech-to-text → AI-parsed task creation. Captures well but lacks structure (themes, goals, statistics, streaks, effort/return).
- **Success looks like (~3 months in)**:
  1. Can name top milestone + next 3 actions toward it without thinking.
  2. No longer feels "drifting" — clear sense of what they're working toward and why.
  3. Doing more high-return / low-effort tasks instead of letting them rot.
  4. Feeling of being "on track" — steadily doing the things tied to the goal.
- **In scope for v1**: Tasks (weekly + backlog), habits (weekly recurring with count target), configurable themes, statistics (weekly completion + streaks + theme history), goals (primary + max 2 secondary, all with mandatory target dates), effort/return on tasks, reminders (user-configured per-task via AI-natural-language + system habit-nudges), voice + AI-parsed capture, past-week browsing, explicit carry-over of unfinished tasks, AI Coach for goal definition and review.
- **Out of scope for v1**: Cross-device sync, calendar integration, sharing / accountability partner, sub-tasks, time tracking, backup/export UI.
- **Cross-lens flags**: Mobile-first → UI; No date/time on tasks → Requirements; Habits weekly-recurring → Domain; Right-there-in-my-face default → UX; Anti-Jira / anti-noise → UI + UX; Lightweight goal↔task linkage → UX; Voice + AI input → UX + Requirements; Backlog state → Domain; AI-configured reminders → Requirements + UX; Max 1 primary + 2 secondary → Requirements; Habit nudges only in danger zone → Requirements.

**Q&A:**
- Q: What's the *real* pain behind this idea? → A: Confirmed: "I suddenly find myself looking back that another 3 months passed, and I am not nearer to my goal. I don't tend to take my time to actually define where I would like to be when. So it feels that I am roaming a bit aimlessly. And the habits is also nice because it forces me to keep working on certain things that I want to change."
- Q: What are you using today + where does it break down? → A: Nothing structured. Most apps too noisy and force date/time. Trello — desktop friction too high (mobile-first user). Paper — liked the visibility but broke down on change/space. Currently has a makeshift PWA with voice + AI-parsed task creation.
- Q: What does success look like 3 months in? → A: Picked #1 (name milestone + 3 actions), #2 (no drifting), #3 (doing high-return/low-effort), and added #4 ("actually on track and doing the things I need to do"). Critical constraint added: "I don't want to have a configuration/planning nightmare. It must be easy, simple. I don't want a freaking Jira."
- Q: Scope boundaries for v1 — flip anything in/out? → A: Flipped reminders to IN (with AI-natural-language config). Made clear: backlog with "this week vs. later" split is essential; voice + AI input from existing PWA must carry forward; ease of use + edits "right then and there" is paramount.

---

## UX & Interaction

### UX Lens Summary

**Primary journey (any random weekday):**
1. User opens the app on phone → **This Week** loads immediately (zero taps).
2. Sees, top-down: primary milestone (one-line header), habits with current progress (e.g., *Gym 2/4*), tasks for this week grouped by theme with effort/return chips, collapsible Done section.
3. Taps a habit's progress ring → count increments (taps the card text → habit detail). Taps a task's circle → strikes through, fades to Done section (taps the title → task detail).
4. Captures new items via the persistent mic button (terracotta FAB, bottom-right). Speaks naturally → AI parses → draft card → user confirms or edits inline.

**Weekly planning ritual (Sunday — single moment):**
1. Sunday: user opens the app.
2. Habits carry over identically (no setup).
3. **Mandatory carry-over ritual** (blocking, no skip): opens with a wins-first recap (last week `X/N tasks · Y/Z habits`, streak deltas, "still working toward [primary goal]"), then unfinished tasks one-by-one with *Keep for this week / Send to backlog / Drop*. Re-appears every app open until fully triaged.
4. Pull-from-backlog (optional, non-blocking — the final step of the ritual flow, after triage is cleared): "Stock this week" list of backlog items, one-tap to add; "Start week" always enabled even if nothing pulled. Also available anytime from the Backlog tab.
5. (Last week's stats are shown in the recap step above — not a separate step.)
6. + Add new via voice or manual. Total: 2–5 minutes.

**Entry points**: Mobile app launch → always lands on This Week. Bottom tab bar (This Week / Backlog / Goals / Stats). Settings behind gear icon (top-right).

**Prerequisites**: At least one theme (3–4 pre-seeded). Goals optional; tasks/habits can exist without goal linkage.

**User expectations at key moments**:
- Tap task → strike + fade, no confirm modal
- Tap habit progress ring → count increments; tap habit card text → opens detail; subtle gold/green when target hit; no confetti; accidental increment reverted via general Undo
- Mic button anywhere → record → AI parses → draft appears
- All fields inline-editable on the draft and on existing items
- Mid-week task change: one tap into menu → *Move to backlog / Delete*; habits → *Pause*. (No "move to next week" — no next-week state exists; backlog + Sunday pull is the only forward-staging mechanism.)
- "Drop" and "Delete" are the **same operation: remove the task.** "Drop" is used ONLY as the gentle label inside the carry-over triage (where "Delete" would feel harsh while confronting leftovers). Everywhere else — Task Detail, mid-week menu — the word is "Delete". Task Detail action row is therefore *Move to backlog / Delete* (no separate Drop). The general Undo snackbar makes any removal instantly reversible, so there is no need for two tiers of removal.
- Streak broken: resets to 0; "Best ever" stays visible
- Habit danger-zone: smart push notification fires once per habit per week
- **Reminders visibility (revised)**: invisible during normal use — no bell on tasks, no inline next-fire time. Managed in Settings → Reminders sub-page

**Branching**:
- Item type during capture: AI infers Task vs. Habit from recurrence cues
- Capture destination: default this-week; cues "for later/sometime/no rush" → backlog
- Goal linkage: auto-link to theme's primary milestone if exists; user can switch to secondary or unlink
- Multi-item utterance: N draft cards in sequence

**Goal-setting sub-journey**:
- **+ Add Goal** (direct form): title, target date (required), type (primary/secondary), theme, optional "why"
- **🪄 Coach me on a goal**: adaptive AI conversation guided by **principles, not a fixed wizard** — force the "when"; distinguish one-time vs. continuous; identify compounding/low-hanging opportunities; advise on prioritization within the 1+2 focus; push back on vagueness. **Purely advisory**: ends with a prose summary + a single "Create this goal" button that opens the Add Goal screen pre-filled. No inline editable card, no in-chat accept, no cap enforcement in chat. Voice supported.
- Coach mode: no active goals → creation; existing goals → review/prune
- Hard cap (1 primary + 2 secondary) forces explicit demotion/drop before exceeding

**Success moment**: subtle and satisfying — strike-through + fade for tasks; brief glow when habit target hit. No confetti, no quotes, no popups. Per-week success felt at Sunday review.

**Edge journeys**: explicit carry-over triage, mid-week re-prioritization via one-tap menu, missed habit days shown in muted red on next week's review (no guilt), streak resets hard with best-ever retained, goal target date passed → review prompt (never silent deletion), pause-habit freezes the streak (does NOT break it).

**Navigation**: 4-tab bottom bar (This Week / Backlog / Goals / Stats). Settings + theme management + reminder bulk-delete behind gear icon. Persistent mic FAB across all tabs.

**Cross-lens flags raised**: No date/time on tasks → Requirements; AI parsing rules → Requirements; Backlog state → Domain; Habit lifecycle → Domain; Streak reset rules → Requirements; Best-ever streak retained → Domain; Smart nudge formula → Requirements; Goal cap enforcement → Requirements; Goal type (milestone vs. compounding) → Domain; Target-date-passed prompt → Requirements + Domain; Done tasks archive into Stats → Domain; Multi-item parsing → Requirements.

**Q&A:**
- Q: Default landing view? → A: Agreed with "This Week" as default — milestone header, habits with weekly counts, tasks grouped by theme with effort/return chips, persistent mic + quick-add.
- Q: Weekly planning ritual? → A: Accepted. Sub-answers: (a) Week starts **Sunday** (not Monday) — single ritual avoids confusion; (b) Explicit carry-over (triage per task); (c) Show last week's habit results during planning.
- Q: Quick-capture flow (voice + AI)? → A: Accepted: lightweight, easy edits "right then and there". (a) AI always guesses and lets user correct; (b) voice-add works anywhere; (c) multi-item parsing supported.
- Q: Task vs. habit field differences? → A: Confirmed. **Habit reminders rejected** as user-configured; instead smart nudge fires only when in "dangerous territory" (count remaining behind pace).
- Q: Goal ↔ task linkage? → A: Accepted: theme-driven auto-linkage, theme without milestone → task links to nothing, primary preferred over secondary when both on same theme, This Week header shows primary only.
- Q: Goal-setting flow? → A: Form fine, but bigger problem first: user needs **help defining the right goal**. (a) Only one primary at a time; (b) target-date-passed → review prompt; (c) goals stay flat (no sub-milestones). Added: **max 2 secondary** goals (hard cap = 1 + 2 total).
- Q: AI Coach design? → A: Accepted with refinement: coach is an **adaptive AI conversation guided by principles, not a fixed wizard** (user's wording: "the prompt can be more having values and concepts, and not static questions"). (a) Coach helps create when no goals + review/prune when goals exist; (b) voice supported; (c) goals only in v1.
- Q: Success moment + edge journeys? → A: All recommendations accepted.
- Q: Navigation + backlog/done accessibility? → A: 4-tab bottom bar accepted. Backlog is its own tab, always accessible. Done items fade into collapsible "Done" on This Week during active week; after Sunday flip, archive into Stats. Done section collapsed by default. **Backlog ordering: grouped by theme by default** (same pattern as This Week), with sort toggle for by-priority and by-added-date.

---

## Requirements

### Requirements Lens Summary

**Business rules:**
- Week flips at **Sunday 00:00 local time** (week = Sunday → Saturday). On flip: habit counts → 0; streaks update (increment or reset); last week archives; unfinished tasks flagged for carry-over; done tasks archive.
- Carry-over is a mandatory blocking ritual: appears on the first app open after the flip and re-appears on every app open until every leftover task is triaged. No skip/dismiss/defer. (Replaces the earlier contradictory "fires once then dismisses" rule.)
- **Habit streak rules**: increments when last week's target was hit; resets to 0 immediately at Sunday flip if target wasn't hit (no grace). Best-ever streak retained separately. Over-target (5/4) is allowed and shown; doesn't break anything.
- **Paused habits freeze the streak — do NOT break it.** No HabitWeekRecord generated while paused. On resume, streak continues from where it was.
- **Habit danger-zone nudge formula**: fires when `count_remaining + 1 ≥ days_left`, evaluated at 09:00 local daily. Max once per habit per week. Notification copy: short, concrete, no fluff (*"Gym 1/4 this week — 3 days left."*). Global on/off toggle in Settings.
- **Task reminders**: user-configured per-task at capture time via AI-natural-language. Optional. Default time when not specified = 09:00 local. AI suggests reminder when capture sounds time-sensitive (shown on draft). Reminder fires once at set time; cancelled silently if task completed first. Persists across week flips. "Recurring until done" supported (fires daily, auto-cancels on completion). Tapping notification → opens app (no snooze in v1).
- **Reminder capability matrix the AI must support**: one-shot at specific time, relative one-shot, recurring-until-completed (all required); recurring-on-schedule, conditional (optional).
- **AI parsing at capture**: extracts type, title, theme, effort, return, week-vs-backlog, count target (habit), goal link, reminder spec. Always produces a draft (never refuses). Never auto-saves. Multi-item utterances → N draft cards. Habit count target unparseable → AI asks back (exception to "always guess"). Voice undo phrases: "scratch that" / "start over" / "cancel".
- **Effort/Return priority scoring**: Low-effort × High-return = top priority. Recommended sort uses priority score, ties broken by added-order (oldest first). Effort/Return values: {Low, Medium, High}; required; default Medium.
- **Goal cap enforcement (max 1 primary + max 2 secondary)** — enforced at a **single point: the Add Goal screen, on save** (the Coach only advises, never enforces): adding new primary when one exists → force choice (demote, archive, cancel). Adding 3rd secondary → force replace, promote, or cancel. Demoting primary with 2 secondaries → force drop of one secondary first. Goal target date passed → prompt: hit/extend/drop, never silent delete. Hard delete → linked tasks lose goal link silently (theme link remains).
- **Definition of done**: Task done = explicit user tap, no confirm modal, reversible within same week (Undo), **not reversible after Sunday flip**. Habit complete-this-week = count meets target. Week complete = Sunday flip (clock-driven, no "finalize" button).

**Hard constraints (Must NOT):**
- Must NOT require date/time on tasks.
- Must NOT auto-carry-over unfinished tasks silently (explicit triage only).
- Must NOT allow >1 primary goal active.
- Must NOT allow >2 secondary goals active.
- Must NOT show motivational quotes, gamified badges, or Duolingo-style noise (only the streak counter and target-hit color is allowed).
- Must NOT delete user data silently (goals archived not deleted; weeks archived not purged).
- Must NOT auto-save voice captures.
- Must NOT send notifications other than (a) per-task user-set reminders and (b) per-habit weekly danger-zone nudge.
- Must NOT allow re-opening a completed task after the Sunday flip.

**Triggers/events**: Sunday 00:00 flip → cascade behaviors; app open while carry-over flag set → mandatory blocking carry-over ritual (recap + per-task triage), persists until cleared; 09:00 daily check → habit danger nudge if formula matches; task completed before reminder → silent cancel; voice utterance → AI parse → draft(s); user confirms → save; goal target date passes → review prompt; user exceeds goal cap → force-choice modal; recurring-until-done reminder → fires daily until done.

**Validation rules**: Goal target date required + future-only; habit count target required positive integer; task title required non-empty; theme required (defaults to "Uncategorized" pseudo-theme if AI can't match); effort/return required for tasks (default Medium).

**Concurrency**: Not relevant in v1 — single-user, single-device.

**Cross-lens flags raised**: Task / habit / goal lifecycle states → Domain; streak as derived vs. stored → Domain; theme uniqueness → Domain; reminder management screen → UI; effort/return chip styling → UI; no bell on tasks → UX (revision captured).

**Q&A:**
- Q: Sunday flip rules — sub-questions on flip moment, mid-week prompt visibility, streak break timing? → A: All recommendations accepted — Sunday 00:00 flip, mid-week first-open still fires prompt, streak breaks immediately.
- Q: Habit danger-zone nudge formula + time + edge cases? → A: Formula accepted. **User caught** the wording confusion ("tasks remaining" should be "count remaining") and identified that mathematically-impossible cases don't need a separate path under the once-per-week rule — dropped that branch. Confirmed two distinct notification mechanisms (system habit nudges vs. user-configured task reminders).
- Q: Task reminder rules + capability scope? → A: Accepted. **User added critical refinement**: push notification service choice is implementation-phase, but the **capability matrix** is Requirements. Explicitly requested "remind me every day until achieved" as supported pattern → included as required. (a) 9am default; (b) AI suggests on draft; (c) no snooze in v1.
- Q: Where do ongoing reminders surface in the app? → A: **User rejected bell icons.** Reminders invisible during normal use; managed only in Settings → Reminders (at minimum "Delete all" action). Revision captured back to UX lens.
- Q: AI parsing rules at capture? → A: All accepted. Visual cue only for low confidence (no audible/haptic). Voice-undo phrases supported.
- Q: Effort/return as ranking signal? → A: Accepted. **User pointed out** chip visualization belongs to UI, not Requirements. Drift acknowledged.
- Q: Goal cap edge cases, definition of done, exclusions? → A: All accepted; nothing to add to Must-Not list.

---

## Domain & Data

### Domain Lens Summary

**Core entities**:
- **Theme** — configurable category (DJ career, fitness, etc.); name + color/icon + created date.
- **Goal** — future milestone with target date; title + target_date + type(primary/secondary) + theme + optional why + status.
- **Task** — discrete one-shot action; title + theme + effort + return + week_assignment(this-week/backlog) + optional goal + optional reminders + status.
- **Habit** — recurring weekly action with count target; title + theme + weekly_count_target + optional goal + status + current_streak + best_ever_streak.
- **HabitWeekRecord** — one per habit per active week; habit + week_start_date + count_achieved + target_at_time.
- **WeekRecord** — completed-week archive container; week_start_date + refs to completed tasks + refs to HabitWeekRecords.
- **Reminder** — scheduled notification on a task; task + schedule_spec + status.

**Non-entities**: AI Coach sessions are ephemeral (no transcripts stored). Output = saved Goal(s), conversation = process not data.

**Pre-seed**: 3–4 generic placeholder themes (Health, Career, Personal, Learning) — user can delete/rename freely.

**Key relationships**:
- Theme 1:N Task / Habit / Goal (every Task/Habit/Goal belongs to exactly one Theme)
- Goal 1:N Task / Habit (optional — a Task/Habit may or may not link to a Goal)
- Habit 1:N HabitWeekRecord (one per active week)
- WeekRecord 1:N Task (snapshot refs) and 1:N HabitWeekRecord
- Task 1:N Reminder (zero or more)

**Lifecycles**:
- **Task**: `open → done` within week (reversible via Undo); after Sunday flip `done → archived-done` (immutable); after flip `open → carry-over triage` → kept-this-week / backlog / deleted. Hard delete allowed.
- **Habit**: `active ⇄ paused → archived (terminal)`. Pause freezes streak (no record generated, no break). Streak resets to 0 at Sunday flip if active & target missed; increments if hit. Hard delete wipes all HabitWeekRecords.
- **Goal**: `active → hit | missed | abandoned` (all terminal — graveyard view). No separate "archived" state. Hard delete leaves linked tasks orphaned (lose goal link, theme link remains).
- **Reminder**: `pending → fired` (one-shot) or `pending → fired-cycle (repeats) → cancelled`. Cascades on task delete.

**Identity rules**:
- Theme: name unique per user (case-insensitive)
- Goal: (title, theme) unique
- Task: no business uniqueness (internal ID only)
- Habit: (title, theme) unique
- HabitWeekRecord: (habit, week_start_date) unique
- WeekRecord: week_start_date unique

**Derived vs. stored**:
- **Stored**: current streak (updated at Sunday flip), best-ever streak, habit current-week count
- **Derived**: in-danger-zone status, priority score, tasks-this-week-toward-goal count, on-track signal, week tasks fraction (done/total tasks), week habits fraction (habits-hit-target/total-active-habits)

**Existing entities to account for**: None — new system.

**Cross-lens flags raised**: Habit hard-delete wipes records → Requirements (negative requirement); pause-freezes-streak rule → Requirements (Sunday flip behavior); Theme pre-seed → UI (initial state design).

**Q&A:**
- Q: Are seven entities complete? AI Coach as entity? Theme pre-seed strategy? → A: User agreed with seven entities. **Asked thoughtful follow-up about AI Coach** — leaning intuitively "no", asked for thoughts. Confirmed ephemeral. Pre-seed (3–4 themes) accepted. **User then raised deletion-policy question** — triggered refinement: dropped "archived" as Goal state (graveyard = UI grouping for hit/missed/abandoned); defined hard-delete rules per entity with confirmation copy.
- Q: Habit delete — wipe or preserve weekly records? → A: Wipe — orphaned records clutter Stats; preserve-everything is for compliance contexts.
- Q: Relationships, lifecycles, identity, derived/stored? → A: Accepted. (a) Paused freezes streak — accepted (user noted ambiguity from earlier lenses; now locked). (b) Nothing in the model contradicts intent.

---

## Security & Privacy

**Skipped** — single-user personal app, mobile-only for v1, no auth, no shared data, no third-party integrations, no regulated data. Reassess when sync / multi-device / cloud backup is added in a future version.

---

## UI & Visual Design

### UI Lens Summary

- **Vibe and mood**: Calm, focused, deliberate. Warm minimalism. Quietly serious — not corporate-serious, not Duolingo-playful. Soft-modern: rounded but not pill-shaped, generous whitespace, gentle tonal separation. Feels like a thoughtful paper notebook.
- **Visual references (emulate)**: Bear (warm minimalism, beautiful typography), Things 3 (clean hierarchy), Day One (calm warmth, dark mode), Stoic (quiet, focused, no gamification).
- **Visual references (avoid)**: Notion (dense, configurable, work-coded), Todoist (cluttered, mildly gamified), Duolingo/Habitica (gamified noise), Asana/Jira (forms-heavy, project-coded).
- **Color palette**: Dark mode default + light mode parallel. Background = deep warm charcoal with brown undertone (~`#1a1816`) for dark, warm off-white cream (~`#faf8f5`) for light. Primary accent = muted terracotta / burnt sienna. Secondary = sage / muted olive (done states, habit completion). Streak/best-ever = warm gold, sparingly used. Red (missed habit on review) = muted brick red, not alarming.
- **Typography**: Headings = characterful serif (Source Serif Pro or Newsreader) for the thoughtful-notebook feel. Body = humanist sans (Inter or Geist). Numbers = tabular figures.
- **Visual density**: Spacious. Generous whitespace. Calm even with 15 items on screen.
- **Component style**: Medium-rounded corners (8–12px). Soft barely-perceptible shadows; tonal separation over borders. Borders rarely used. Gradients only on milestone hero + habit-target-hit celebration. Line-style icons (Phosphor/Lucide). Subtle buttons. Floating-translucent bottom tab bar. Terracotta mic FAB persistent across all primary tabs.
- **Navigation pattern**: Bottom tab bar with 4 tabs (This Week / Backlog / Goals / Stats). Settings behind gear icon. Persistent mic + "+" FAB. Bottom sheets for quick edits, full-screen modals for complex flows (Coach, Add Goal, carry-over triage).
- **Screen inventory** (13 screens): This Week (home), Backlog, Goals, Stats, Quick-add draft card (sheet), AI Coach conversation (modal), Add Goal form (modal), Carry-over triage (modal), Task detail/edit (sheet), Habit detail/edit (sheet), Settings (full-screen), Themes management (within Settings), Reminders sub-page (within Settings). **First-launch onboarding REMOVED from scope (2026-05-15)** — first-run is the This Week empty state, not a swipe tour. (Goal Detail/Edit screen also still deferred — separate parked item.)
- **Per-screen details**: Captured fully in [.discovery/ui-brief.md](ui-brief.md).
- **Cross-lens flags raised**: None back-flagged; gaps filled via direct synthesis.

**Q&A:**
- Q: Vibe and mood — calm, warm, quietly-serious, soft-modern minimalism? → A: Accepted.
- Q: Color palette + typography + visual density + component style bundle? → A: Accepted.
- Q: Screen inventory — derived from UX, with optional first-launch onboarding? → A: Accepted. User asked clarifying question about **backlog and themes** — confirmed: themes managed in Settings, used as organizing principle on This Week / Backlog / Stats. Backlog grouped by theme by default with sort toggle. *(POST-DISCOVERY 2026-05-15: first-launch onboarding subsequently removed from scope — see Key Decisions. First-run is now the This Week empty state.)*

---

## Cross-Lens Notes

- **Reminder visibility (Q15 → UX revision)**: Requirements lens raised the "where do ongoing reminders surface" question. User rejected the earlier UX recommendation (bell icon on tasks). Revised decision: reminders invisible during normal use; managed only in Settings → Reminders sub-page (Delete-all action). [.discovery/ux-lens.md](ux-lens.md) was updated to reflect the revision before final compilation.
- **Pause-freezes-streak (Q20 → cross-checks UX/Requirements)**: Domain lens locked this explicitly. Earlier lenses mentioned "pause habit" but never explicitly defined whether pausing breaks or freezes the streak. Now resolved: freezes.
- **Push notification service capability matrix (Q15)**: User correctly flagged that service choice is implementation/plan-phase, not Requirements. But the **AI capability matrix** (one-shot, relative, recurring-until-done required; recurring-scheduled and conditional optional) is Requirements scope and is captured.
- **Effort/return chip styling drift (Q17)**: Requirements lens drifted into visualization. User redirected; chip design is UI scope. Requirements only owns values, validation, and the priority matrix.
- **AI Coach as ephemeral (Q19)**: Domain question raised across boundaries — affects Product (scope: do we save coach history?), UX (no past-coach-conversations browser), Domain (not an entity). Resolved: ephemeral in v1, can be revisited.
- **Hard-delete vs. archive (Q19 follow-up)**: User question prompted explicit modeling. Domain dropped "archived" Goal state in favor of {hit, missed, abandoned} terminals + graveyard UI grouping; hard-delete allowed across all entities with appropriate confirmation copy.

---

## Key Decisions

- Single-user, mobile-first, personal productivity app — no auth, no sync, no shared data in v1.
- Mobile-only platform target for v1 (PWA or native — to be decided in plan phase).
- Voice + AI-parsed input via persistent mic FAB is a first-class capture mechanism.
- AI must never auto-save; every voice capture produces a draft requiring user confirmation.
- AI must never refuse to create a draft — produces best-effort draft with low-confidence fields marked.
- AI must parse multi-item utterances into N sequential draft cards.
- AI exception: habit count target is asked back inline if unparseable (too critical to guess).
- Voice undo phrases: "scratch that" / "start over" / "cancel".
- Themes are the universal organizing principle — managed in Settings, used as grouping on This Week / Backlog / Stats.
- 3–4 pre-seeded placeholder themes at first launch.
- Themes have name (case-insensitively unique per user), color/icon.
- Tasks: title + theme + effort + return + week_assignment + optional goal + optional reminders + status. No mandatory date/time field.
- Effort and Return: {Low, Medium, High}, required, default Medium.
- Effort × Return priority matrix used for the Recommended sort on This Week (low-effort × high-return = top).
- Habits: title + theme + weekly_count_target + optional goal + status + current_streak + best_ever_streak.
- Habits do NOT carry effort/return signals (recurring, signal is constant).
- Habit weekly count target may exceed (5/4 is fine — recognized, doesn't break anything).
- Habit lifecycle: active ⇄ paused → archived terminal. Hard delete also allowed.
- Paused habits FREEZE the streak — do NOT break it. No HabitWeekRecord generated while paused.
- Hard-deleting a habit also wipes all its HabitWeekRecords (anti-clutter on Stats). Habit delete gets a confirm dialog (destroys streak history); the wipe is deferred until the general-Undo window closes (soft-delete window, restorable until then). Task delete, by contrast, is low-stakes: no confirm dialog, general Undo is the only safety net.
- Goals: title + target_date (REQUIRED, future-only) + type (primary or secondary) + theme + optional why + status.
- Goal cap: max 1 primary + max 2 secondary active. Enforced at a single point — the Add Goal screen, on save — with an explicit demote/drop/cancel choice. The Coach never enforces it (advisory only).
- Goal lifecycle: active → hit | missed | abandoned (all terminal; graveyard UI grouping). No separate "archived" state.
- Goal target date passing fires review prompt: hit / extend / drop. Never silent deletion.
- Hard-deleting a goal leaves linked tasks orphaned (lose goal link silently; theme link remains).
- Goals stay flat — no sub-milestones or hierarchy ("no Jira").
- Task-to-goal linkage: theme-driven by default (task auto-links to theme's active primary milestone on creation). Manual override always available.
- This Week header shows primary milestone only; secondaries visible only on the Goals tab.
- Themes without milestones: tasks link to nothing (maintenance themes don't need goals).
- AI Coach for goal definition and review — adaptive AI conversation guided by **principles, not a fixed wizard**: force the "when", distinguish one-time vs. continuous, identify compounding/low-hanging opportunities, push back on vagueness, advise on prioritization within the 1+2 focus, distinguish "truly important" goals from "no-brainer compounding bet" goals.
- **Coach is purely advisory (post-discovery simplification, 2026-05-15).** It never creates or edits a goal inline and never enforces the cap. It concludes with a plain-prose summary + a single "Create this goal" button that opens the standard Add Goal screen pre-filled from the conversation; the user reviews and saves there. This replaces the earlier "inline editable proposed-goal card + in-chat Accept" design. Rationale: removes the most complex UI in the coach flow, eliminates redundant goal-entry, consolidates cap enforcement to one point, and keeps the coach a pure thinking aid.
- Goal creation has a single screen and single cap-enforcement point: the Add Goal screen. Reachable directly (empty) or from the Coach (pre-filled). The cap-exceeded demote/drop/cancel modal triggers only there, on save.
- Coach mode auto-selected: no active goals → creation; existing goals → review/prune.
- Coach voice-supported throughout.
- Coach for goals only in v1; not for tasks.
- Coach sessions are ephemeral — no transcripts saved as entities.
- Week boundary: Sunday 00:00 local time (week = Sunday → Saturday).
- Single Sunday ritual combines week reset + planning (not separate moments).
- On Sunday flip: habit counts reset to 0; streaks update; last week archives; carry-over flag set; done tasks archive.
- Carry-over triage is explicit per-task: Keep for this week / Send to backlog / Drop. Exactly three options — no fourth, no skip. Never silent auto-move.
- Carry-over is a mandatory blocking ritual: re-appears on every app open until fully triaged. No skip/dismiss/defer anywhere (pure mandatory triage — an escape hatch would leave tasks in silent limbo, violating the explicit-triage hard constraint).
- The carry-over ritual opens with a wins-first **recap step (Frame 0)**: last week `X/N tasks · Y/Z habits` (fractions, no %), streak deltas (kept/broken), and one forward line "still working toward [primary goal] — N tasks done toward it". No "goals completed" counter (goals rarely complete weekly; the forward line carries the goal dimension). The recap reuses the Stats metric model for consistency. Last week's habit/task results live in this recap — not a separate planning step.
- The carry-over ritual ends with an **optional, non-blocking "Pull from backlog" step** (header "Stock this week"): a list of backlog tasks, one-tap to add to the week, with a "Start week" button always enabled even if nothing is pulled. This is the concrete home for Sunday-ritual step 4, which was previously decided but had no screen (orphaned). It is optional because pulling is additive and never leaves anything in limbo — distinct from triage, which is mandatory. The same backlog→week promotion is also always available from the Backlog tab; the ritual step is just a guided surfacing.
- The full Sunday ritual flow is therefore: **Frame 0 recap → mandatory per-task triage → optional pull-from-backlog → "Ready for the new week"**.
- **Post-discovery decision (2026-05-15):** (a) "Skip" removed from carry-over; pure mandatory triage chosen; Frame 0 recap added; the contradictory "fires once then dismisses for the week" rule replaced with "persists every app open until fully triaged". (b) "Drop" and "Delete" unified into one remove-the-task operation — "Drop" kept only as the gentle triage label, "Delete" used everywhere else; Task Detail action row simplified to *Move to backlog / Delete* (no separate Drop). (c) Optional pull-from-backlog step added as the final ritual step, giving the orphaned ritual step 4 a screen. Rationale: Skip was UI-synthesis-only and violated the explicit-triage constraint + created silent limbo; Drop vs Delete had no defined difference and the general Undo removes any need for two removal tiers; the pull step completes the ritual's stated purpose (stock the new week, not just clear the old one).
- Streaks reset hard at Sunday flip if target not hit (no grace period, no "actually I did it" toggle).
- Best-ever streak retained alongside current.
- Habit danger-zone nudge: fires when `count_remaining + 1 ≥ days_left`, evaluated at 09:00 local daily. Max once per habit per week. Globally toggleable in Settings.
- Habit nudge notification copy: short, concrete, no fluff, no emojis by default.
- Task reminders are user-configurable per-task at capture via AI-natural-language. Optional.
- Reminder capability matrix the AI MUST support: one-shot specific time, relative one-shot, recurring-until-completed.
- Reminder capability matrix the AI MAY support (optional): recurring-on-schedule, conditional.
- Default reminder time when not specified ("remind me tomorrow") = 09:00 local.
- AI suggests reminder when task sounds time-sensitive; suggestion visible on draft.
- Reminders fire once, do not re-nudge. Recurring-until-done auto-cancels on completion.
- Reminders persist across week flips.
- Tapping a reminder notification opens the app. No snooze in v1.
- Reminders are INVISIBLE during normal use — no bell icon on tasks, no inline next-fire time, no in-app reminder list view.
- Reminder management lives only in Settings → Reminders sub-page, with at minimum a "Delete all configured reminders" action.
- Task done state: explicit user tap, no confirm modal. Reversible within same week via Undo. NOT reversible after Sunday flip (history integrity).
- Task interaction model: tap the **completion circle** → complete; tap the **title body** → open Task Detail/Edit sheet. Two distinct hit-targets on the row.
- Habit interaction model: tap the **progress ring** → increment count; tap the **card's text area (name/theme)** → open Habit Detail/Edit sheet. Two hit-targets on the small card with NO added chrome (no kebab/chevron) — chosen because the rendered cards are deliberately minimal and a secondary icon would add anti-noise clutter. The ring must read as obviously interactive.
- Goal interaction model: a goal card has only ONE tap-target (opens detail) — no one-tap action; "completing" a goal is a deliberate in-detail action. (Goal Detail/Edit screen itself is still deferred — parked, not designed yet.)
- **General Undo (app-wide pattern).** Any state-changing action — task completed, task dropped, habit incremented, deletes (and, when goals are designed, mark-hit / abandon / demote) — surfaces a brief Undo snackbar; one tap reverts the last action. This is the single universal safety net and **replaces all bespoke per-entity undo/decrement mechanisms** (no separate habit decrement control is needed). It coexists with the separate rule that a done task can still be re-opened by tapping it again any time before the Sunday flip: the Undo snackbar is the immediate reversal; tapping a done task again is the deliberate same-week reversal.
- Done-this-week tasks: collapsible "Done (N)" section at bottom of This Week, collapsed by default.
- A task has exactly TWO week states: **this-week** or **backlog**. There is no "next-week" state. Forward-staging is achieved only via backlog + the Sunday pull-from-backlog ritual. No UI action anywhere offers "move to next week" (removed as an inconsistency — it conflicted with the deliberately minimal two-state model).
- Backlog is its own top-level tab, always accessible.
- Backlog ordering: grouped by theme by default; sort toggle for by-priority and recently-added.
- Quick-add directly to backlog supported (via mic/+ while on Backlog tab).
- 4-tab bottom navigation: This Week / Backlog / Goals / Stats.
- Settings + theme management + reminder bulk-delete + habit nudge toggle behind a gear icon on the This Week screen.
- Stats tab shows: this-week raw counts as plain fractions — `X/N tasks · Y/Z habits` (NO percentages anywhere), current + best-ever streaks per habit, and a browseable past-week archive where each WeekRecord card shows date range + the same two fractions. NO per-theme breakdown on Stats.
- Stats metric definitions: tasks fraction = done tasks / total tasks for the week; habits fraction = habits that hit their weekly target / total active habits that week. Habits and tasks are never blended into one number (a habit is not binary day-to-day; only binary at week granularity).
- Design principle: the app is goal-centric, not theme-performance-centric. Themes are an organizing tool, never a thing the user optimizes or measures. No theme leaderboards, no per-theme performance scoring — anywhere.
- Stats must show no generated insight/summary sentences and no invented week titles — history rows are date range + the two fractions only (extends the anti-narrative / anti-noise hard constraint).
- First-launch onboarding: **DEFERRED — removed from v1 scope (2026-05-15)** as too much. No swipe tour. First-run experience = the This Week empty state (calm hero + "Set my first goal (with AI Coach)" / "Add a task" CTAs); orientation happens by doing. Parked, not lost — can be revisited later.
- Visual identity: dark mode default + light mode; calm, warm, quietly-serious, soft-modern minimalism.
- Color palette: warm charcoal background dark / warm cream background light; muted terracotta primary accent; sage green secondary; warm gold for streaks (sparingly).
- Typography: characterful serif for headings (Source Serif Pro or Newsreader); humanist sans for body (Inter or Geist); tabular figures for counts.
- Component style: 8–12px rounded corners, soft shadows, line-style icons (Phosphor/Lucide), terracotta mic FAB persistent across all tabs.
- Spacious visual density — generous whitespace; calm even at high item counts.
- Anti-Jira AND anti-Duolingo: no motivational quotes, no confetti, no badge inflation, no gamified streak-rescue mechanics. Only the streak counter and target-hit color earn their place.
- Single-device, single-user — no concurrency handling needed in v1.
- All deletions of user data require explicit user action with appropriate confirmation; no silent auto-purge.
