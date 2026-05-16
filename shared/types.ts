// Shared TypeScript types for Weekly Focus API request/response shapes.
// Imported by both `api/` and `mobile/` — no runtime code here.

// ─── Enums ────────────────────────────────────────────────────────────────────

export type GoalType = 'primary' | 'secondary';
export type GoalStatus = 'active' | 'hit' | 'abandoned';

export type Effort = 'low' | 'medium' | 'high';
export type ReturnLevel = 'low' | 'medium' | 'high';
export type PriorityScore = 'top' | 'high' | 'medium' | 'low' | 'lowest';

export type WeekAssignment = 'this_week' | 'backlog';
export type TaskStatus = 'open' | 'done' | 'archived';

export type HabitStatus = 'active' | 'paused';

export type ReminderType = 'one_shot' | 'recurring_until_done';
export type ReminderStatus = 'pending' | 'fired' | 'cancelled';

export type Confidence = 'high' | 'medium' | 'low';

export type TriageAction = 'keep' | 'backlog' | 'drop';

export type GoalCapScenario =
  | 'second_primary'
  | 'third_secondary'
  | 'demote_primary_with_two_secondaries';

export type GoalForceAction =
  | { action: 'demote_existing'; targetGoalId: string }
  | { action: 'abandon_existing'; targetGoalId: string };

export type BacklogSort = 'by-theme' | 'by-priority' | 'recently-added';

// ─── Common ───────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code: string;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  timezone: string;
  nudgeEnabled: boolean;
  lastWeekStart: string; // YYYY-MM-DD
}

export interface PatchUserProfileBody {
  timezone?: string;
  nudgeEnabled?: boolean;
}

export interface RegisterPushTokenBody {
  token: string;
}

// ─── Themes ───────────────────────────────────────────────────────────────────

export interface Theme {
  id: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  isSystem: boolean;
}

export interface CreateThemeBody {
  name: string;
  color: string;
  icon: string;
}

export interface PatchThemeBody {
  name?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}

export interface DeleteThemeResponse {
  movedItemCount: number;
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export interface Goal {
  id: string;
  themeId: string;
  title: string;
  type: GoalType;
  status: GoalStatus;
  targetDate: string; // YYYY-MM-DD
  why: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface CreateGoalBody {
  themeId: string;
  title: string;
  type: GoalType;
  targetDate: string;
  why?: string;
  forceAction?: GoalForceAction;
}

export interface PatchGoalBody {
  title?: string;
  targetDate?: string;
  type?: GoalType;
  why?: string;
  themeId?: string;
}

export interface GoalCapExceededError extends ApiError {
  code: 'GOAL_CAP_EXCEEDED';
  capScenario: GoalCapScenario;
  conflictingGoals: Goal[];
}

export interface GoalResolutionResponse {
  id: string;
  status: GoalStatus;
  resolvedAt: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  themeId: string;
  goalId: string | null;
  title: string;
  effort: Effort;
  returnLevel: ReturnLevel;
  weekAssignment: WeekAssignment;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
  priorityScore?: PriorityScore; // present on week tasks, absent on backlog
}

export interface GetWeekTasksResponse {
  weekStart: string;
  tasks: Task[];
}

export interface GetBacklogTasksResponse {
  tasks: Task[];
}

export interface ReminderInput {
  type: 'one_shot';
  fireAt: string;
}

export interface RecurringReminderInput {
  type: 'recurring_until_done';
  dailyTime: string; // "HH:MM"
}

export interface CreateTaskBody {
  themeId: string;
  title: string;
  effort: Effort;
  returnLevel: ReturnLevel;
  weekAssignment: WeekAssignment;
  goalId?: string;
  reminder?: ReminderInput | RecurringReminderInput;
}

export interface PatchTaskBody {
  title?: string;
  effort?: Effort;
  returnLevel?: ReturnLevel;
  themeId?: string;
  goalId?: string | null;
  weekAssignment?: WeekAssignment;
}

export interface MoveTaskBody {
  weekAssignment: WeekAssignment;
}

export interface TaskStatusResponse {
  id: string;
  status: TaskStatus;
  completedAt: string | null;
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export interface HabitWeekRecord {
  weekStart: string;
  countAchieved: number;
  targetAtTime: number;
}

export interface Habit {
  id: string;
  themeId: string;
  goalId: string | null;
  title: string;
  weeklyTarget: number;
  status: HabitStatus;
  currentStreak: number;
  bestEverStreak: number;
  currentWeekRecord: HabitWeekRecord;
}

export interface CreateHabitBody {
  themeId: string;
  title: string;
  weeklyTarget: number;
  goalId?: string;
}

export interface PatchHabitBody {
  title?: string;
  themeId?: string;
  goalId?: string | null;
  weeklyTarget?: number;
}

export interface IncrementHabitResponse {
  habitId: string;
  countAchieved: number;
  targetAtTime: number;
  targetHit: boolean;
}

export interface HabitStatusResponse {
  id: string;
  status: HabitStatus;
}

export interface DeleteHabitBody {
  confirmed: true;
}

export interface DeleteHabitResponse {
  ok: true;
  undoToken: string;
  recordWipeAt: string;
}

export interface UndoDeleteHabitBody {
  undoToken: string;
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export interface Reminder {
  id: string;
  taskId: string;
  type: ReminderType;
  status: ReminderStatus;
  fireAt: string | null;
  dailyTime: string | null;
  createdAt: string;
}

export interface CreateReminderBody {
  type: ReminderType;
  fireAt?: string;
  dailyTime?: string;
}

export interface CancelAllRemindersBody {
  confirmed: true;
}

export interface CancelAllRemindersResponse {
  cancelledCount: number;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface StreakSummary {
  habitId: string;
  title: string;
  currentStreak: number;
  bestEverStreak: number;
}

export interface CurrentWeekStats {
  weekStart: string;
  tasksDone: number;
  tasksTotal: number;
  habitsOnTarget: number;
  habitsTotal: number;
  streaks: StreakSummary[];
}

export interface PastWeekTask {
  id: string;
  title: string;
  themeId: string;
  completedAt: string;
}

export interface PastWeekHabitRecord {
  habitId: string;
  title: string;
  countAchieved: number;
  targetAtTime: number;
}

export interface PastWeek {
  weekStart: string;
  tasksDone: number;
  tasksTotal: number;
  habitsOnTarget: number;
  habitsTotal: number;
  tasks: PastWeekTask[];
  habitRecords: PastWeekHabitRecord[];
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AiParseContext {
  themes: { id: string; name: string }[];
  activeGoals: { id: string; title: string; themeId: string }[];
}

export interface AiParseBody {
  transcript: string;
  context: AiParseContext;
}

export interface TaskDraftItem {
  type: 'task';
  title: string;
  themeId: string | null;
  themeConfidence: Confidence | null;
  effort: Effort | null;
  effortConfidence: Confidence | null;
  returnLevel: ReturnLevel | null;
  returnLevelConfidence: Confidence | null;
  weekAssignment: WeekAssignment;
  goalId: string | null;
  suggestedReminder?: ReminderInput | RecurringReminderInput;
}

export interface HabitDraftItem {
  type: 'habit';
  title: string;
  themeId: string | null;
  themeConfidence: Confidence | null;
  weeklyTarget: number | null;
  weeklyTargetConfidence: Confidence | null;
  goalId: string | null;
}

export type DraftItem = TaskDraftItem | HabitDraftItem;

export interface AiParseResponse {
  items: DraftItem[];
}

export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProposedGoal {
  title: string;
  targetDate: string;
  type: GoalType;
  themeId: string;
  why?: string;
}

export interface AiCoachBody {
  messages: CoachMessage[];
  context: {
    activeGoals: Goal[];
    themes: Theme[];
  };
}

export interface CoachDeltaEvent {
  type: 'delta';
  content: string;
}

export interface CoachDoneEvent {
  type: 'done';
  summary: string;
  proposedGoal: ProposedGoal;
}

export type CoachSseEvent = CoachDeltaEvent | CoachDoneEvent;

// ─── Week Flip ────────────────────────────────────────────────────────────────

export interface WeekFlipResponse {
  newWeekStart: string;
  archivedTaskCount: number;
  streaksUpdated: number;
}

export interface WeekFlipAlreadyDoneResponse {
  alreadyFlipped: true;
  currentWeekStart: string;
}

// ─── Triage ───────────────────────────────────────────────────────────────────

export interface StreakDelta {
  habitTitle: string;
  previousStreak: number;
  newStreak: number;
  delta: number;
  broke?: boolean;
}

export interface TriageRecap {
  weekStart: string;
  tasksDone: number;
  tasksTotal: number;
  habitsOnTarget: number;
  habitsTotal: number;
  streakDeltas: StreakDelta[];
  primaryGoalTitle: string | null;
  tasksTowardPrimaryGoal: number;
}

export interface TriagePendingTask {
  id: string;
  title: string;
  themeId: string;
  themeName: string;
  effort: Effort;
  returnLevel: ReturnLevel;
  goalId: string | null;
}

export interface GetTriageResponse {
  needsTriage: boolean;
  recap: TriageRecap | null;
  pendingTasks: TriagePendingTask[];
}

export interface TriageTaskBody {
  action: TriageAction;
}

export interface TriageTaskResponse {
  ok: true;
  remainingCount: number;
}
