# Phase 5 Design Notes: Voice & AI Quick-Capture

**Source files**: `.UI/quick_add_draft_card/code.html`, `.UI/quick_add_interactive_entry_state/code.html`

---

## PF5-01: UI Design Analysis

### Bottom Sheet Structure

The capture UI is a bottom sheet that overlays the active tab with a dark scrim (`rgba(16,14,12,0.85)`). It is NOT a full-screen modal — the tab bar is visible behind the scrim (rendered at `opacity-50, pointer-events-none`).

```
z-0  background tab content (dimmed by scrim)
z-10 scrim overlay
z-20 bottom sheet
```

RN implementation: use `Modal` with `transparent={true}` + `presentationStyle="overFullScreen"` (so tab bar is visible beneath), or a `View` with `position: 'absolute', zIndex: 20` rendered inside the tabs layout. The latter is preferred so the sheet is mounted inside the navigator and avoids flash.

**Sheet dimensions**: `max-h-[795px]`, `inset-x-0, bottom-0`, `rounded-t-[32px]`, `bg-surface-dim` (`#151311`).

### Grab Handle

Centered, `w-12 h-1 rounded-full bg-outline-variant/30` (`#56423e` at 30% opacity). `py-stack-md` (16px) padding above and below.

### Type Pill Toggle

Centered pill selector at the top of sheet content. Two options: **Task** | **Habit**.

- Container: `bg-surface-container-high` (`#2c2927`), `p-unit` (4px) padding, `rounded-full`
- Selected pill: `bg-primary-container` (`#dd725a`), `text-on-primary-container` (`#560d01`), `rounded-full`, `px-stack-md py-stack-sm` (16px / 8px)
- Unselected pill: `text-on-surface-variant` (`#dcc0bb`), no background
- Margin below: `mb-stack-lg` (32px)

### Title Input

Large editable text area (`font-display text-headline-lg` = Newsreader 32px/40px, weight 500).

**Draft state** (after AI parse, not focused):
- `border-none` — no visible border
- Divider line below: `h-[1px] bg-outline-variant/30`

**Interactive/focused state**:
- `border-b-2 border-primary` (`#ffb4a4`) with `focus:border-primary-container`
- Divider line still present below

`mb-stack-lg` (32px) below title area.

### Metadata Chips (Horizontal Scroll Row)

`overflow-x-auto`, `gap-stack-sm` (8px), `pb-stack-md` (16px) bottom padding. `hide-scrollbar` (no visible scrollbar).

Chip order (left to right):
1. **Theme** — `bg-secondary-container/20`, `border-secondary-container/30`, icon `label` + text in `secondary` color. Includes `expand_more` chevron in interactive state.
2. **Effort** — `bg-surface-container-high`, `border-outline-variant/20`, icon `bolt` in `on-surface-variant`, text in `on-surface`. Includes `expand_more` in interactive state.
3. **Return** — Same as Effort chip, BUT when **low confidence**: icon + text + chevron all have `opacity-50`. This is the faded treatment for low-confidence fields.
4. **Timing** (week assignment) — `bg-tertiary-container/10`, `border-tertiary-container/30`, icon `schedule` + text in `tertiary` color. No chevron. Label: "This-week" or "Backlog".
5. **Goal** (ghost) — dashed `border-outline-variant/40`, icon `flag` + text `"Link Goal"` in `outline` color.
6. **Reminder** (ghost) — dashed `border-outline-variant/40`, icon `notifications` + text `"Add Reminder"` in `outline` color.

**Low-confidence treatment**: Apply `opacity-50` to ALL children of the chip (icon + text + chevron). Do not dim the chip border/background — only the content.

**Ghost chip style** (Goal, Reminder — not yet set): `border-dashed border-outline-variant/40`, no background fill, `outline`-colored icon and text.

**Habit-specific chips**: When type=Habit, replace Effort + Return with a **Weekly Target** stepper chip. Remove Timing chip (habits don't have week assignment). Reminder chip not shown for habits.

### Action Bar

`mt-auto pt-stack-lg` — sticks to bottom of sheet.

- **Cancel**: plain text button, `text-on-surface-variant`, `px-stack-lg py-stack-md`
- **Save**: `bg-primary-container` (`#dd725a`), `text-on-primary-container`, `rounded-xl`, `px-stack-lg py-stack-md`

### Multi-Item State (not shown in design files, specified in tasks)

When AI returns 2+ items:
- Bottom sheet expands to full-screen
- "N of M" indicator shown above the type pill (e.g. "1 of 2")
- **Save all** button added beside Save
- Sequential: user saves/edits one item, then advances to next

### MicButton Mounting Strategy

**Decision**: Mount in `mobile/app/(tabs)/_layout.tsx` (not root `_layout.tsx`).

Rationale: The tab layout wraps all 4 tabs — mounting here means the button persists across tab switches without remounting. It won't appear on sign-in, triage, or other full-screen modals. The sheet itself can be managed via local state in the tabs layout.

Implementation: Wrap the `<Tabs>` in a `<View style={{flex:1}}>` and add MicButton as `position: 'absolute'` overlay, positioned above the tab bar (bottom: ~70px from bottom of safe area).

**MicButton appearance** (from task description + design tokens):
- Terracotta FAB (`bg-primary-container` = `#dd725a`), mic icon, ~56px diameter
- Smaller "+" button paired beside it (right side), ~40px, same terracotta
- Both positioned bottom-right, above the tab bar

### Color Tokens (RN-ready values)

| Token | Hex |
|---|---|
| background / surface-dim | `#151311` |
| surface-container | `#211f1d` |
| surface-container-high | `#2c2927` |
| primary | `#ffb4a4` |
| primary-container | `#dd725a` |
| on-primary-container | `#560d01` |
| secondary | `#c0caac` |
| secondary-container | `#434c35` |
| on-secondary-container | `#b2bc9e` |
| tertiary | `#e9c176` |
| tertiary-container | `#af8b47` |
| outline | `#a48b86` |
| outline-variant | `#56423e` |
| on-surface | `#e7e1de` |
| on-surface-variant | `#dcc0bb` |
| on-background | `#e7e1de` |

---

## PF5-02: API Contract Walkthrough

### Endpoints Verified

| Endpoint | Status | Notes |
|---|---|---|
| `POST /ai/parse` | ✅ Exists | Returns `{ items: DraftItem[] }` |
| `POST /tasks/:id/reminders` | ✅ Exists | Body: `{ type, fireAt? }` or `{ type, dailyTime }` |
| `DELETE /reminders/:id` | ✅ Exists | Cancels specific reminder |
| `DELETE /reminders` | ✅ Exists | Bulk cancel; requires `{ confirmed: true }` body |

### DraftItem Shape Verification

Both `TaskDraftItem` and `HabitDraftItem` exist in `shared/types.ts` with all required fields. Key details:

- **Confidence**: `Confidence | null` where `null` means "could not determine" → renders as faded chip
- **TaskDraftItem.weekAssignment**: `WeekAssignment` (non-null) — AI always assigns this_week or backlog
- **suggestedReminder**: optional field, only present when AI detects time-sensitive cues
- **HabitDraftItem**: has `weeklyTarget: number | null` and `weeklyTargetConfidence: Confidence | null` — no effort/return/weekAssignment
- **themeId**: `string | null` in both — null when AI cannot match a theme

### No Missing Endpoints

All required endpoints exist. The `POST /tasks` body already accepts an optional `reminder` field so creating a task with a reminder is a single call — no need for a separate reminder creation step at draft-save time.

### Idempotency Notes

- `POST /ai/parse`: stateless — safe to retry
- `POST /tasks/:id/reminders`: creates a new reminder each call — client must not retry blindly
- `DELETE /reminders/:id`: idempotent (deleting an already-deleted reminder is a no-op or 404)
- `DELETE /reminders`: requires explicit `confirmed: true` to prevent accidental bulk-delete

---

## PF5-03: Claude Prompt Spike

### Prompt Design

System prompt for `POST /ai/parse`:

```
You are a voice capture parser for a personal productivity app. The user speaks naturally, and you extract one or more task or habit drafts from their words.

User's themes: {themes_json}
User's active goals: {goals_json}

Return a JSON object with an "items" array. Each item is either a task or habit draft:

TASK draft: { "type": "task", "title": string, "themeId": string|null, "themeConfidence": "high"|"medium"|"low"|null, "effort": "low"|"medium"|"high"|null, "effortConfidence": "high"|"medium"|"low"|null, "returnLevel": "low"|"medium"|"high"|null, "returnLevelConfidence": "high"|"medium"|"low"|null, "weekAssignment": "this_week"|"backlog", "goalId": string|null, "suggestedReminder": {"type":"one_shot","fireAt":"ISO8601"}|{"type":"recurring_until_done","dailyTime":"HH:MM"}|null }

HABIT draft: { "type": "habit", "title": string, "themeId": string|null, "themeConfidence": "high"|"medium"|"low"|null, "weeklyTarget": number|null, "weeklyTargetConfidence": "high"|"medium"|"low"|null, "goalId": string|null }

Rules:
- "task" = one-time action; "habit" = weekly recurring behavior
- effort: "low" = minutes/quick, "medium" = few hours, "high" = major effort
- returnLevel: "high" = big life impact, "medium" = moderate, "low" = minor
- weekAssignment: default "this_week"; use "backlog" only if user says "later", "someday", etc.
- themeId: match to closest theme by name; null if no match
- goalId: match to closest goal; null if no match
- confidence "high" = very certain; "medium" = likely; "low" = guessing; null = no information
- For reminders: parse natural time phrases to ISO 8601 (use provided current time)
- Multi-item utterances: return all items in the array
- Return ONLY valid JSON, no explanation
```

### Test Results (Confirmed 2026-05-16)

**Test utterance 1**: "Gym 4 times a week"
- Result: ✅ `type: "habit"`, `weeklyTarget: 4`, `weeklyTargetConfidence: "high"`, matched to Health theme + goal

**Test utterance 2**: "Remind me to call Pedro tomorrow morning"
- Result: ✅ `type: "task"`, `effort: "low"`, `suggestedReminder: { type: "one_shot", fireAt: "2026-05-17T09:00:00+02:00" }`

**Test utterance 3**: "Read and meditate"
- Result: ✅ 2-item array, both type "habit", weeklyTarget guessed with `weeklyTargetConfidence: "low"`

**Test utterance 4**: "Book flights and pack bags"
- Result: ✅ 2-item array, both type "task", effort/return filled but at medium/high confidence (Claude was more confident than expected — acceptable)

**⚠️ Implementation note**: Claude wraps JSON in markdown code fences (```json ... ```). The ai.service.ts must strip these before JSON.parse. Use:
```ts
text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
```

### Working Prompt Notes

- Use `claude-haiku-4-5-20251001` (already configured as `CLAUDE_PARSE_MODEL` in api env)
- Enable structured JSON output via `response_format` or by strongly prompting with schema
- Inject `now` (ISO timestamp in user's timezone) for relative time resolution
- Keep `max_tokens: 1024` — parse responses are small
- Use `temperature: 0` for deterministic output
- The prompt is injected as the system message; transcript goes in the user message

### Relative Time Resolution

Phrase → ISO timestamp (relative to "now"):
- "tomorrow morning" → next calendar day at 09:00 in user's timezone
- "tonight" → same calendar day at 20:00
- "next Tuesday" → the upcoming Tuesday at 09:00
- "in 2 hours" → now + 2 hours rounded to nearest 15 min
- "every morning" → recurring_until_done, dailyTime: "09:00"

This logic must live in `api/src/utils/reminderTime.ts` and be unit tested before wiring into reminder.service.ts (T060a).
