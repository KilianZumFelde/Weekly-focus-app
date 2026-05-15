# Stitch Prompt Pack: Weekly Focus — Tasks, Habits, Goals

## How to use

1. **Generate the DESIGN SYSTEM PROMPT first.** Paste it into a fresh Stitch project and save the result as your project theme. This sets *how the app looks*. Do not generate any screen until the theme looks right.
2. **Then paste the SHARED APP CONTEXT once, in the same project.** This sets *what the app is and how it's structured* (4-tab nav, persistent FAB, entity vocabulary) so navigation chrome and naming stay consistent across every screen. Use it once at setup — do NOT repeat it per screen.
3. **Then generate screens one prompt at a time.** Never paste multiple screen prompts together — Stitch will collapse them. Each screen prompt already carries a short style reminder, so you don't re-paste the design system or shared context.
4. **Variants (empty / loading / error) are separate generations.** Run the main screen prompt, then re-prompt for a variant only if you need it.
5. **Expect minor drift.** The per-screen style reminder fights it. If a screen strays off-brand, just re-run that one prompt.
6. **Flows produce multi-frame sequences.** Use the FLOW PROMPTS for the conversational/stepped experiences, not single-screen prompts.
7. Source inventory = 13 screens → **11 screen prompts + 2 flow prompts** (AI Coach, Carry-Over Triage are the sequential ones and become flows). First-Launch Onboarding was removed from scope (2026-05-15) — first-run is just the This Week empty state. Full coverage, no merges.

> Mental model: **Design System = how it looks. Shared App Context = what it is.** Both set once, up front. The per-screen style reminder is just drift insurance after that.

---

## DESIGN SYSTEM PROMPT

Design a mobile design system for a calm, warm, quietly-serious personal productivity app — it should feel like a thoughtful paper notebook, not a project-management dashboard. Explicitly anti-gamification: no confetti, no badges, no loud color.

Dark mode is the default; also produce a light mode. Dark: background deep warm charcoal with a brown undertone (~#1a1816, not pure black), cards one step lighter as a soft warm gray. Light: warm off-white cream background (~#faf8f5), softly-tinted white cards. Primary accent: muted terracotta / burnt sienna (warm rust). Secondary accent: sage / muted olive green, used for done states and completion. Warm gold used sparingly, only for streak callouts and hit-target moments. A muted brick red for "missed" indicators — honest, not alarming.

Typography: characterful but restrained serif for headings (Source Serif Pro or Newsreader); humanist sans for body (Inter or Geist); tabular figures for numeric counts. Generous heading sizes, comfortable thumb-distance body text, strong vertical rhythm.

Spacious density — lots of whitespace, content breathes. Components: 8–12px rounded corners (not pill, not sharp), soft barely-perceptible shadows, tonal separation instead of borders, line-style icons (Phosphor/Lucide), subtle buttons (solid accent primary, ghost secondary, text tertiary). Floating translucent-blur bottom tab bar. Persistent terracotta floating mic button bottom-right.

---

## SHARED APP CONTEXT

A single-user mobile app that keeps long-term goals tied to weekly action. Life is organized into **themes** (e.g., DJ career, fitness, job change). Inside themes: **tasks** (one-shot, with low/medium/high effort and return chips) and **habits** (weekly-recurring with a count target like gym 4×/week, tracking a streak). Above them: **goals** — one primary milestone + up to two secondary, each with a target date. A **stats** layer shows the week's raw counts (tasks done and habits that hit their target), streaks, and past-week history — focused on goal progress, not theme optimization.

Navigation: a 4-tab bottom bar — This Week (home), Backlog, Goals, Stats. A gear icon top-right opens Settings. A persistent terracotta mic FAB (with a smaller "+" beside it) sits bottom-right on every primary tab for voice/manual capture. Quick edits use bottom sheets; complex flows use full-screen modals. A transient **Undo snackbar** briefly appears bottom-center after any state-changing action (complete a task, increment a habit, drop/delete) — one tap reverts; it auto-dismisses.

---

## SCREEN PROMPTS

### Screen: This Week (home)

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, 8–12px rounded corners, soft shadows, line icons, calm and anti-gamification.

The default landing screen. Top: a hero milestone card with a soft terracotta-tinted gradient — single line "Land first paid gig at a Madrid venue", a small date badge "by Sept 2026", and a subtle badge "5 tasks this week". Below it, a Habits section: compact cards each with title, small theme chip, a circular progress ring and count text ("Gym 2/4", "Bachata 1/2", "CVs 0/3"); the ring reads as the obviously-tappable increment control while the card's text area is a separate tap-target for detail — no kebab or extra icons on the card. Then a Tasks section grouped under collapsible theme headers; each task is a row with a clearly tappable completion circle on the left and the title body as a separate tap-target, a small theme chip, and two small chips for effort and return. A segmented sort toggle sits above the tasks: Recommended / By theme / Added. At the bottom, a collapsed "Done (4)" section header. Persistent terracotta mic FAB plus a smaller "+" bottom-right, floating translucent bottom tab bar, gear icon top-right. Visual emphasis: the milestone hero first, then today's habit rings.
Variants to generate separately: empty (first-launch, calm illustration + two CTAs), empty (goals but no tasks), loading (calm card skeletons), error (inline retry).

### Screen: Backlog

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

The "for later" task store, reached from the second bottom tab. Top: a segmented sort toggle — By theme (default) / By priority / Recently added. Body: task cards identical in style to the This Week task rows (tap-circle, title, theme chip, effort + return chips), grouped under collapsible theme section headers when sorted by theme. Each card reveals a subtle "Pull to this week" action on swipe or long-press. Generous spacing between sections; the screen should feel like a calm, scannable inbox, not a dense list. Persistent terracotta mic FAB + "+" bottom-right (adds directly to backlog here), floating bottom tab bar. Visual emphasis: theme section headers as quiet anchors so a long backlog stays scannable.
Variants to generate separately: empty ("Your backlog is empty" + prominent mic/+), loading (card skeletons), error (inline retry).

### Screen: Goals

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

Reached from the third bottom tab. Top: a large primary-goal hero card with a soft terracotta gradient — title, target date, a short italic "why" excerpt, and a small "5 tasks · 2 habits" link count. Below: up to two medium secondary-goal cards, visibly smaller and flatter than the primary. Then two buttons: a ghost "+ Add Goal" and a solid terracotta "Coach me on a goal" with a small wand icon. At the bottom, a collapsed "Past goals (3)" graveyard section header; expanded rows show title, date, and a small muted state tag (hit / missed / abandoned). Spacious, reverent layout — the primary goal should feel like the single most important thing on screen. Floating bottom tab bar, gear icon top-right.
Variants to generate separately: empty (no goals — calm hero + big "Start with AI Coach"), no-primary (prompt to promote one), cap reached (demotion-choice state), loading, error.

### Screen: Stats

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

Reached from the fourth bottom tab. Top summary band: a large calm raw-count line "This week — 12/15 tasks · 2/3 habits" (plain fractions, absolutely NO percentages) with a small gold best-streak callout beside it. Below: a Habit streaks panel — small cards each showing habit name, current streak ("Gym — 8 weeks") and a quiet "Best: 12" in gold. Then a Past weeks browser: a scrollable list of small cards, each showing a date range and the same two fractions ("May 4–10 · 11/14 tasks · 3/3 habits"), tappable to expand into that week's completed tasks and habit results. No per-theme breakdown — Stats is about goal progress, not theme optimization. Restraint is key: gold only on hit streaks, no charts, no progress bars, no generated insight or summary sentences, no invented week titles — each history card is the date range plus the two fractions only. Floating bottom tab bar. Visual emphasis: the tasks/habits fractions first, streaks second.
Variants to generate separately: empty (no history yet), no-habits (habit fraction shows "—", streak panel hidden), loading, error.

### Screen: Quick-Add Draft Card (bottom sheet)

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

A bottom sheet that slides up over This Week after voice or "+" capture. Top: a small pill toggle showing "Task / Habit" (current state highlighted in terracotta, one tap flips it). Below: a large editable title field pre-filled from speech ("Contact Pedro about Sala Caracol gig"). Then a row of tappable chips, each editable: Theme ("DJ career"), Effort ("Low"), Return ("High"), a This-week/Backlog toggle, an optional Goal-link chip, an optional Reminder chip. Low-confidence AI-inferred chips render with slightly faded text to signal "check me". Bottom action bar: a ghost "Cancel" and a solid terracotta "Save". The sheet has a grab handle and a soft scrim behind it. Calm, fast, single-glance editable. Visual emphasis: the title field and the chip row.
Variants to generate separately: parsing-in-progress (subtle inline "Listening…" line), multi-item ("1 of 2" indicator + "Save all" button), save error (inline message, data preserved).

### Screen: Add Goal Form (full-screen modal)

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

A full-screen modal with a close X top-left and title "New Goal". This is the single place goals are created — reached either directly from the Goals tab (empty fields) or from the Goal Coach's "Create this goal" button (every field pre-filled from the conversation, user just reviews and saves). Generous vertical spacing between fields. A large title text field. A required Target date field rendered as a row of quick-select chips ("3 months", "6 months", "1 year", "Custom") above a calm inline date picker. A Primary / Secondary segmented radio. A Theme dropdown with an AI-suggested value pre-filled. A smaller multi-line "Why does this matter? (optional)" textarea, visually de-emphasized. Bottom bar: ghost "Cancel" and solid terracotta "Save" — Save is visibly disabled (lower opacity) until title and target date are filled. The form should feel unhurried and deliberate, not like a data-entry chore. Visual emphasis: the title field and the required date chips.
Variants to generate separately: cap-exceeded modal ("You already have a primary goal" with three choice buttons), required-field-missing (disabled save + subtle hint), saving/error.

### Screen: Task Detail / Edit (bottom sheet)

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

A bottom sheet opened by tapping a task's title body. Grab handle at top. A large inline-editable title. A row of tappable chips matching the draft card: Theme, Effort, Return, Week-assignment, Goal-link, Reminder (tapping Reminder opens a small voice/text input inline). Below a thin divider, a quiet action row of tertiary text buttons: "Move to backlog", "Delete" (Delete in muted brick red). No separate "Drop" — "Drop" is only the gentle word used inside the carry-over triage; here the same remove-the-task operation is just called "Delete". Everything editable in place — no nested screens, no save button (changes commit live). Soft scrim behind. The sheet should feel like flipping a card over, calm and immediate. Visual emphasis: the title and chip row; actions are deliberately recessive.
Variants to generate separately: none (single state).

### Screen: Habit Detail / Edit (bottom sheet)

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

A bottom sheet opened by tapping a habit card's text area (the progress ring increments instead and never opens this). Grab handle. Inline-editable title ("Gym"). A theme chip. A weekly-count-target row with a calm number stepper ("4 per week"). An optional goal-link chip. A prominent streak block: current streak in regular text ("Streak: 8 weeks") and best-ever beside it in gold ("Best: 12"). Below a divider, an action row: a Pause/Resume toggle and a "Delete" in muted brick red. The streak block is the emotional centre of this sheet — give it presence without celebration graphics. Soft scrim behind. Visual emphasis: the streak block.
Variants to generate separately: paused state (button reads "Resume", streak shows "Streak: 4 (paused)" in muted grey), confirm-delete inline alert.

### Screen: Settings (full-screen)

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

A full-screen settings view opened from the gear icon, slides up. iOS-style grouped list rows on the calm charcoal background, with quiet section labels. Groups: Themes ("Manage themes" row with a disclosure arrow) · Reminders ("Reminders" row, disclosure arrow) · Notifications ("Habit nudges" row with a toggle switch, on by default) · Appearance ("Theme" row with Light / Dark / System segmented control) · About (version row). Generous row height, hairline tonal separators, terracotta only on the active toggle/segmented states. Restrained and ordinary in the best way — settings should feel quiet. Visual emphasis: clear group separation, nothing competes.
Variants to generate separately: none.

### Screen: Themes Management (within Settings)

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

A sub-screen of Settings with a back chevron and title "Themes". A reorderable list: each row shows a small colored circular icon (theme color), the theme name, a trailing drag handle, and a kebab/swipe for edit/delete. Themes listed: Health, Career, Personal, Learning, plus user-added ones like "DJ career". A solid terracotta "+ Add theme" button pinned at the bottom. Tapping a row opens a small inline edit sheet (rename field + a color/icon swatch picker). Calm, lightly tactile (drag affordances visible but soft). Visual emphasis: the colored theme dots as the scannable anchor.
Variants to generate separately: empty (rare — "No themes yet" message), delete-with-linked-items confirm dialog ("This theme has N tasks/habits/goals. They'll move to Uncategorized.").

### Screen: Reminders (within Settings)

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

A quiet sub-screen of Settings with a back chevron and title "Reminders". An optional simple list of currently scheduled reminders — each row showing the parent task title, next fire time ("Thu 9:00"), and a small recurrence tag if any ("daily until done"). Below the list, a single prominent "Delete all configured reminders" button — caution-styled with a soft outline, not aggressive red. The whole screen is deliberately sparse: this is the only place reminders are visible in the app, by design. Lots of whitespace. Visual emphasis: the delete-all action, since management here is the screen's sole purpose.
Variants to generate separately: empty ("No reminders scheduled."), delete-all confirm dialog ("Delete all N reminders? Tasks themselves will remain.").

---

## FLOW PROMPTS

### Flow: AI Coach Conversation (full-screen modal)

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

Generate a 3–4 frame conversational flow for an AI goal coach. The coach is purely advisory — it never creates or edits a goal inline; it ends by handing off to the Add Goal screen. Frame 1: opening — full-screen modal, close X top-left, title "Goal Coach", a single warm AI message bubble (left-aligned, soft-rounded, charcoal-surface) reading "Let's figure out what you actually want to work toward.", and a bottom input bar with a text field plus a prominent terracotta mic button. Frame 2: mid-conversation — alternating bubbles, AI on the left (charcoal surface), user on the right (subtle terracotta-tinted), several exchanges visible, calm spacing, a 3-dot typing indicator under the latest AI turn. Frame 3: conclusion — a final AI text bubble that summarises the recommended goal in plain prose ("Here's what I'd commit to: land a paid gig at a Madrid venue by Sept 30 — primary, under DJ career."), followed by a single solid terracotta "Create this goal" button beneath the thread. No inline editable card, no "Accept" — the button opens the standard Add Goal screen with every field pre-filled from the conversation. Frame 4 (review-mode variant): same layout but opens with "Let's check in on your current goals." and shows existing goals as small context cards pinned above the thread. Keep bubbles airy and unhurried; this should feel like a thoughtful conversation, not a chatbot. Also note an offline state: a calm "Coach is offline — you can still add a goal directly" with a fallback button.

### Flow: Carry-Over Triage (full-screen modal)

Style: warm minimalist productivity app, dark mode default — deep warm charcoal bg, muted terracotta accent, sage for done, gold sparingly. Serif headings, humanist sans body, spacious, rounded corners, soft shadows, line icons, calm.

Generate a multi-frame Sunday ritual flow (recap → mandatory per-task triage → optional backlog-pull → done) shown on the first app open after the Sunday week flip. The triage portion is a blocking ritual — there is NO skip, no dismiss, no escape link in the recap or triage frames; the user clears it by triaging every leftover task, and it re-appears on every app open until fully cleared. The backlog-pull step that follows triage is optional and non-blocking. Frame 0 — Last-week recap: a full-screen modal, calm centered layout, header "Last week". A large plain raw-count line "11/14 tasks · 3/3 habits" (fractions, no percentages), a quiet line of streak deltas ("Gym streak → 9 weeks · Bachata streak reset"), and one forward-looking line "Still working toward: Land first paid gig — 5 tasks done toward it". A single solid terracotta "Review leftovers →" button. Honest, gentle, wins-first — never opens on failure. Frames 1–N — per-task triage: each a full-screen modal, quiet header "Last week's leftovers", small progress indicator ("2 of 7" or a row of dots). Centre: one large focal task card — title, theme chip, effort and return chips, optional small goal-link badge — calm, isolated, generous whitespace. Below the card, exactly three stacked buttons: solid terracotta "Keep for this week", ghost "Send to backlog", recessive tertiary "Drop" (muted, deliberately not red — no shaming). No fourth option, no skip. Frame 1: first task, progress "1 of 7". Frame 2: a later task, progress advanced. Penultimate frame — optional "Pull from backlog?": full-screen modal, header "Stock this week", a calm scrollable list of backlog task cards (title, theme chip, effort/return chips) each with a single tap-to-add affordance; tapped items get a sage check and a quiet "Added" state. This step is NOT blocking — a solid terracotta "Start week" button is always enabled even if nothing is pulled (pulling is additive, never leaves anything in limbo, so unlike triage it is optional). Final frame — completion: a calm confirmation ("Ready for the new week.") that auto-dismisses into This Week. Emotional tone: honest but gentle — confronting what didn't get done without guilt, after first showing what went well, then a light forward-looking "what do I want this week" moment.

### Flow: First-Launch Onboarding — DEFERRED, do not generate

Removed from scope (decision 2026-05-15) — too much for v1. No onboarding prompt. First-run experience is simply the **This Week empty state** (see that screen prompt's "empty (first-launch, calm illustration + two CTAs)" variant): a brand-new user lands directly there with "Set my first goal (with AI Coach)" / "Add a task" CTAs. Do not generate an onboarding flow in Stitch.
