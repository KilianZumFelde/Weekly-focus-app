# API Contract: Weekly Focus App

**Base URL**: `https://weekly-focus-api.onrender.com/v1`
**Auth**: All endpoints require `Authorization: Bearer <supabase_jwt>` unless noted.
**Error shape**: `{ "error": "Human-readable message", "code": "SNAKE_CASE_CODE" }`
**Dates**: ISO 8601 strings. Week starts (Sundays) as `YYYY-MM-DD`.

---

## User Profile

### GET /users/me
Returns the authenticated user's profile.

**Response 200**
```json
{
  "id": "uuid",
  "timezone": "Europe/Berlin",
  "nudgeEnabled": true,
  "lastWeekStart": "2026-05-10"
}
```

### PATCH /users/me
Update profile settings.

**Body**
```json
{ "timezone": "America/New_York", "nudgeEnabled": false }
```
**Response 200**: updated profile object.

### POST /users/push-token
Register or update Expo push token.

**Body**: `{ "token": "ExponentPushToken[xxx]" }`
**Response 200**: `{ "ok": true }`

---

## Themes

### GET /themes
**Response 200**
```json
[
  { "id": "uuid", "name": "Health", "color": "#8C967A", "icon": "heart",
    "sortOrder": 0, "isSystem": false }
]
```
Ordered by `sortOrder` ascending. Uncategorized (isSystem=true) always last.

### POST /themes
**Body**: `{ "name": "DJ Career", "color": "#BF5B45", "icon": "music" }`
**Response 201**: created theme object.
**Error 409 THEME_NAME_EXISTS**: case-insensitive duplicate within user.

### PATCH /themes/:id
**Body** (all fields optional): `{ "name": "...", "color": "...", "icon": "...", "sortOrder": 2 }`
**Response 200**: updated theme object.
**Error 400 CANNOT_MODIFY_SYSTEM**: attempt to rename/recolor Uncategorized.

### DELETE /themes/:id
Moves all linked tasks/habits/goals to the Uncategorized theme.
**Response 200**: `{ "movedItemCount": 12 }`
**Error 400 CANNOT_DELETE_SYSTEM**: attempt to delete Uncategorized.

---

## Goals

### GET /goals
Returns all goals (active + graveyard), sorted: primary first, secondaries, then graveyard.

**Response 200**
```json
[
  {
    "id": "uuid", "themeId": "uuid", "title": "Land first paid DJ gig",
    "type": "primary", "status": "active",
    "targetDate": "2026-09-01", "why": "Financial independence through music",
    "createdAt": "2026-05-15T10:00:00Z", "resolvedAt": null
  }
]
```

### POST /goals
Creates a goal. Enforces 1 primary + 2 secondary cap.

**Body**
```json
{
  "themeId": "uuid", "title": "Land first paid DJ gig",
  "type": "primary", "targetDate": "2026-09-01", "why": "..."
}
```
**Response 201**: created goal object.
**Error 409 GOAL_CAP_EXCEEDED**: `{ "error": "...", "code": "GOAL_CAP_EXCEEDED", "capScenario": "second_primary" | "third_secondary" | "demote_primary_with_two_secondaries", "conflictingGoals": [...] }`
Client must resolve conflict and retry with `forceAction`.

### POST /goals (with forceAction)
Re-submit after cap conflict with a resolution.

**Body** (add `forceAction` field)
```json
{
  "themeId": "uuid", "title": "...", "type": "primary", "targetDate": "...",
  "forceAction": {
    "action": "demote_existing" | "abandon_existing",
    "targetGoalId": "uuid"
  }
}
```
**Response 201**: created goal object.

### PATCH /goals/:id
Update title, targetDate, type, why, or themeId. Cap enforced on type change.

**Body** (all optional): `{ "title": "...", "targetDate": "...", "type": "secondary", "why": "..." }`
**Response 200**: updated goal object.

### POST /goals/:id/hit
Mark goal as hit (moved to graveyard). Unlinks from tasks/habits.
**Response 200**: `{ "id": "uuid", "status": "hit", "resolvedAt": "..." }`

### POST /goals/:id/abandon
Abandon goal (moved to graveyard). Unlinks from tasks/habits.
**Response 200**: `{ "id": "uuid", "status": "abandoned", "resolvedAt": "..." }`

---

## Tasks

### GET /tasks/week
Returns all tasks for the current week (open + done), plus the current week_start date.

**Response 200**
```json
{
  "weekStart": "2026-05-10",
  "tasks": [
    {
      "id": "uuid", "themeId": "uuid", "goalId": "uuid",
      "title": "Call Pedro about the gig",
      "effort": "low", "returnLevel": "high",
      "weekAssignment": "this_week", "status": "open",
      "createdAt": "2026-05-13T09:00:00Z", "completedAt": null,
      "priorityScore": "top"
    }
  ]
}
```
`priorityScore` is one of `"top" | "high" | "medium" | "low" | "lowest"` — computed server-side.

### GET /tasks/backlog
Returns all backlog tasks (open, weekAssignment=backlog).

**Response 200**: `{ "tasks": [...] }` (same task shape, no priorityScore).

### POST /tasks
Create a task.

**Body**
```json
{
  "themeId": "uuid", "title": "Call Pedro",
  "effort": "low", "returnLevel": "high",
  "weekAssignment": "this_week",
  "goalId": "uuid",
  "reminder": {
    "type": "one_shot",
    "fireAt": "2026-05-16T09:00:00Z"
  }
}
```
`reminder` is optional. `goalId` is optional.
**Response 201**: created task object (with reminder if provided).

### PATCH /tasks/:id
Update any task field.
**Body** (all optional): `{ "title": "...", "effort": "high", "returnLevel": "low", "themeId": "...", "goalId": "..." }`
**Response 200**: updated task object.

### POST /tasks/:id/complete
Mark task done.
**Response 200**: `{ "id": "uuid", "status": "done", "completedAt": "..." }`
**Error 400 TASK_ARCHIVED**: task is from a past week and cannot be reopened.

### POST /tasks/:id/uncomplete
Reopen a done task (same week only).
**Response 200**: `{ "id": "uuid", "status": "open", "completedAt": null }`
**Error 400 TASK_ARCHIVED**: task is from a past week.

### POST /tasks/:id/move
Move task between this_week and backlog.
**Body**: `{ "weekAssignment": "backlog" | "this_week" }`
**Response 200**: updated task object.

### DELETE /tasks/:id
Hard-delete task and cancel all associated reminders.
**Response 200**: `{ "ok": true }`

---

## Habits

### GET /habits
Returns all active and paused habits with their current week's HabitWeekRecord.

**Response 200**
```json
[
  {
    "id": "uuid", "themeId": "uuid", "goalId": null,
    "title": "Gym", "weeklyTarget": 4, "status": "active",
    "currentStreak": 8, "bestEverStreak": 12,
    "currentWeekRecord": {
      "weekStart": "2026-05-10",
      "countAchieved": 2,
      "targetAtTime": 4
    }
  }
]
```

### POST /habits
Create a habit.
**Body**: `{ "themeId": "uuid", "title": "Gym", "weeklyTarget": 4, "goalId": "uuid" }`
**Response 201**: created habit object (with empty currentWeekRecord).
**Error 409 HABIT_EXISTS**: (title + theme) already exists for this user.

### PATCH /habits/:id
Update title, themeId, goalId, or weeklyTarget.
**Response 200**: updated habit object.

### POST /habits/:id/increment
Increment current week count by 1.
**Response 200**: `{ "habitId": "uuid", "countAchieved": 3, "targetAtTime": 4, "targetHit": false }`
When `targetHit: true`, client shows the gold glow animation.

### POST /habits/:id/pause
Pause habit (freezes streak, stops generating week records).
**Response 200**: `{ "id": "uuid", "status": "paused" }`

### POST /habits/:id/resume
Resume habit.
**Response 200**: `{ "id": "uuid", "status": "active" }`

### DELETE /habits/:id
Soft-delete habit. Records wiped after undo window (30 seconds server-side delay).
**Body**: `{ "confirmed": true }` — must be explicit.
**Response 200**: `{ "ok": true, "undoToken": "uuid", "recordWipeAt": "2026-05-15T10:00:30Z" }`

### POST /habits/:id/undo-delete
Cancel a pending habit delete within the undo window.
**Body**: `{ "undoToken": "uuid" }`
**Response 200**: `{ "id": "uuid", "status": "active" }` — habit fully restored.

---

## Reminders

### POST /tasks/:id/reminders
Add a reminder to a task.
**Body**
```json
{
  "type": "one_shot",
  "fireAt": "2026-05-16T09:00:00Z"
}
```
or
```json
{
  "type": "recurring_until_done",
  "dailyTime": "09:00"
}
```
**Response 201**: created reminder object.

### DELETE /reminders/:id
Cancel a specific reminder.
**Response 200**: `{ "ok": true }`

### DELETE /reminders
Cancel ALL pending reminders for the user.
**Body**: `{ "confirmed": true }`
**Response 200**: `{ "cancelledCount": 5 }`

---

## Stats

### GET /stats/current
Current week summary.

**Response 200**
```json
{
  "weekStart": "2026-05-10",
  "tasksDone": 11, "tasksTotal": 14,
  "habitsOnTarget": 2, "habitsTotal": 3,
  "streaks": [
    { "habitId": "uuid", "title": "Gym", "currentStreak": 8, "bestEverStreak": 12 }
  ]
}
```

### GET /stats/weeks
Past completed weeks (most recent first).

**Response 200**
```json
[
  {
    "weekStart": "2026-05-03",
    "tasksDone": 9, "tasksTotal": 12,
    "habitsOnTarget": 3, "habitsTotal": 3,
    "tasks": [
      { "id": "uuid", "title": "Call Pedro", "themeId": "uuid", "completedAt": "..." }
    ],
    "habitRecords": [
      { "habitId": "uuid", "title": "Gym", "countAchieved": 4, "targetAtTime": 4 }
    ]
  }
]
```

---

## AI

### POST /ai/parse
Parse transcribed voice text into a task or habit draft.

**Body**
```json
{
  "transcript": "Gym 4 times a week",
  "context": {
    "themes": [{ "id": "uuid", "name": "Health" }],
    "activeGoals": [{ "id": "uuid", "title": "Get fit", "themeId": "uuid" }]
  }
}
```

**Response 200** (Task draft)
```json
{
  "items": [
    {
      "type": "task",
      "title": "Call Pedro about the gig",
      "themeId": "uuid", "themeConfidence": "high",
      "effort": "low", "effortConfidence": "high",
      "returnLevel": "high", "returnLevelConfidence": "medium",
      "weekAssignment": "this_week",
      "goalId": "uuid",
      "suggestedReminder": { "type": "one_shot", "fireAt": "2026-05-16T09:00:00Z" }
    }
  ]
}
```

**Response 200** (Habit draft)
```json
{
  "items": [
    {
      "type": "habit",
      "title": "Gym",
      "themeId": "uuid", "themeConfidence": "high",
      "weeklyTarget": 4, "weeklyTargetConfidence": "high",
      "goalId": "uuid"
    }
  ]
}
```
Multiple items are returned in `items` array for multi-item utterances.
`null` confidence fields indicate low confidence (shown as faded on draft card).
`suggestedReminder` is omitted if no time-sensitive cues detected.

### POST /ai/coach
Goal Coach — streaming SSE response.

**Body**
```json
{
  "messages": [
    { "role": "user", "content": "I want to become a DJ" }
  ],
  "context": {
    "activeGoals": [...],
    "themes": [...]
  }
}
```

**Response**: `Content-Type: text/event-stream`
```
data: {"type":"delta","content":"Let's think about what that actually means"}
data: {"type":"delta","content":" for your timeline..."}
data: {"type":"done","summary":"You want to land your first paid gig by September 2026...","proposedGoal":{"title":"Land first paid DJ gig","targetDate":"2026-09-01","type":"primary","themeId":"uuid","why":"..."}}
```
When `type=done`, the `proposedGoal` object pre-fills the Add Goal form.

---

## Week Flip (Internal)

### POST /internal/week-flip
Triggered by the mobile app on first open after Sunday 00:00 local time.
**Header**: `X-User-Timezone: Europe/Berlin` (user's local timezone)
**Auth**: Standard user JWT (not an internal secret — authenticated as the user).

**Effect**:
1. Creates a WeekRecord for the just-completed week.
2. Archives all done tasks (status → archived, archivedWeekStart set).
3. Sets unfinished this-week tasks' carry-over flag (stored as `needsTriage: true` on the session, not in DB — the GET /tasks/week response includes `pendingTriage: true` when there are untriaged open tasks from before the flip).
4. Resets HabitWeekRecord counts to 0 for the new week (by creating new records).
5. Updates streaks: active habits that hit target → streak++; missed → streak=0.
6. Updates `lastWeekStart` on user profile.

**Response 200**: `{ "newWeekStart": "2026-05-17", "archivedTaskCount": 9, "streaksUpdated": 3 }`
**Response 200** (idempotent — flip already done): `{ "alreadyFlipped": true, "currentWeekStart": "2026-05-17" }`

---

## Carry-Over Triage

### GET /tasks/triage
Returns open tasks from before the current week (needing triage), plus last week's recap.

**Response 200**
```json
{
  "needsTriage": true,
  "recap": {
    "weekStart": "2026-05-10",
    "tasksDone": 11, "tasksTotal": 14,
    "habitsOnTarget": 2, "habitsTotal": 3,
    "streakDeltas": [
      { "habitTitle": "Gym", "previousStreak": 7, "newStreak": 8, "delta": 1 },
      { "habitTitle": "Bachata", "previousStreak": 3, "newStreak": 0, "broke": true }
    ],
    "primaryGoalTitle": "Land first paid DJ gig",
    "tasksTowardPrimaryGoal": 5
  },
  "pendingTasks": [
    { "id": "uuid", "title": "...", "themeId": "uuid", "effort": "low", "returnLevel": "high", "goalId": "uuid" }
  ]
}
```

### POST /tasks/:id/triage
Triage a single carry-over task.
**Body**: `{ "action": "keep" | "backlog" | "drop" }`
**Response 200**: `{ "ok": true, "remainingCount": 2 }`
