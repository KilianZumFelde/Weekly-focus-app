import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triageService } from '../services/triage.service';
import { tasksService } from '../services/tasks.service';
import type { GetTriageResponse, TriagePendingTask, Task } from '@shared/types';

type Frame = 'recap' | 'triage' | 'backlog' | 'done';

const EFFORT_LABEL: Record<string, string> = { low: 'Low Effort', medium: 'Med Effort', high: 'High Effort' };
const RETURN_LABEL: Record<string, string> = { low: 'Low Return', medium: 'Med Return', high: 'High Return' };

export default function TriageScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GetTriageResponse | null>(null);
  const [frame, setFrame] = useState<Frame>('recap');
  const [taskIndex, setTaskIndex] = useState(0);
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
  const [addedToWeek, setAddedToWeek] = useState<Set<string>>(new Set());
  const pendingRef = useRef<TriagePendingTask[]>([]);

  useEffect(() => {
    void load();
  }, []);

  // Block hardware back on all frames except done
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (frame === 'done') return false; // allow dismiss after completion
      return true; // block
    });
    return () => handler.remove();
  }, [frame]);

  const load = async () => {
    setLoading(true);
    try {
      const d = await triageService.getTriage();
      setData(d);
      pendingRef.current = d.pendingTasks;
      if (!d.needsTriage || d.pendingTasks.length === 0) {
        // Nothing to triage — close immediately
        router.back();
        return;
      }
      // Load backlog for step 3
      const bl = await tasksService.getBacklogTasks();
      setBacklogTasks(bl.tasks);
    } finally {
      setLoading(false);
    }
  };

  const currentTask = pendingRef.current[taskIndex] ?? null;

  const handleTriageAction = async (action: 'keep' | 'backlog' | 'drop') => {
    if (!currentTask) return;
    await triageService.triageTask(currentTask.id, action);

    const next = taskIndex + 1;
    if (next < pendingRef.current.length) {
      setTaskIndex(next);
    } else {
      setFrame('backlog');
    }
  };

  const handleAddToWeek = async (taskId: string) => {
    if (addedToWeek.has(taskId)) return;
    setAddedToWeek((prev) => new Set([...prev, taskId]));
    await tasksService.moveTask(taskId, { weekAssignment: 'this_week' });
  };

  const handleStartWeek = () => {
    setFrame('done');
  };

  const handleReturnToFocus = () => {
    router.dismissAll();
  };

  if (loading || !data) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#ffb4a4" />
      </View>
    );
  }

  // ─── Frame 1: Recap ────────────────────────────────────────────────────────
  if (frame === 'recap') {
    const recap = data.recap;
    return (
      <View style={[styles.container, styles.center, { paddingHorizontal: 24 }]}>
        <View style={styles.recapContent}>
          <Text style={styles.recapTitle}>Last week</Text>

          <View style={styles.statsSection}>
            <View style={styles.statRow}>
              <Text style={styles.displayText}>
                {recap ? `${recap.tasksDone}/${recap.tasksTotal} tasks · ${recap.habitsOnTarget}/${recap.habitsTotal} habits` : '— tasks · — habits'}
              </Text>
            </View>

            {recap?.streakDeltas && recap.streakDeltas.length > 0 && (
              <View style={styles.statRow}>
                {recap.streakDeltas.map((delta, i) => (
                  <Text key={i} style={styles.streakLine}>
                    {delta.broke
                      ? `${delta.habitTitle} streak reset`
                      : `${delta.habitTitle} streak ↑ ${delta.newStreak} week${delta.newStreak !== 1 ? 's' : ''}`}
                  </Text>
                ))}
              </View>
            )}

            {recap?.primaryGoalTitle && (
              <View style={[styles.goalBlock, styles.borderTop]}>
                <Text style={styles.stillWorkingLabel}>Still working toward:</Text>
                <Text style={styles.goalTitle}>{recap.primaryGoalTitle}</Text>
                {recap.tasksTowardPrimaryGoal > 0 && (
                  <View style={styles.goalProgress}>
                    <View style={styles.dot} />
                    <Text style={styles.goalProgressText}>
                      {recap.tasksTowardPrimaryGoal} task{recap.tasksTowardPrimaryGoal !== 1 ? 's' : ''} done toward it
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setFrame('triage')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Review leftovers →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Frame 2: Per-task triage ───────────────────────────────────────────────
  if (frame === 'triage' && currentTask) {
    const total = pendingRef.current.length;
    const current = taskIndex + 1;

    return (
      <View style={[styles.container, { paddingHorizontal: 24 }]}>
        {/* Backdrop blurs — decorative only */}

        {/* Header */}
        <View style={[styles.triageHeader, { paddingTop: insets.top + 32 }]}>
          <Text style={styles.triageSubtitle}>Last week's leftovers</Text>
          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>{current} of {total}</Text>
          </View>
        </View>

        {/* Task card + buttons */}
        <View style={styles.triageMain}>
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{currentTask.title}</Text>
            <View style={styles.chipsRow}>
              <View style={[styles.chip, styles.chipTheme]}>
                <Text style={[styles.chipText, styles.chipThemeText]}>
                  {/* Theme name not in pendingTask — show effort/return only */}
                  {EFFORT_LABEL[currentTask.effort]}
                </Text>
              </View>
              <View style={[styles.chip, styles.chipReturn]}>
                <Text style={[styles.chipText, styles.chipReturnText]}>
                  {RETURN_LABEL[currentTask.returnLevel]}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionStack}>
            <TouchableOpacity
              style={styles.keepButton}
              onPress={() => void handleTriageAction('keep')}
              activeOpacity={0.9}
            >
              <Text style={styles.keepButtonText}>Keep for this week</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backlogButton}
              onPress={() => void handleTriageAction('backlog')}
              activeOpacity={0.9}
            >
              <Text style={styles.backlogButtonText}>Send to backlog</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropButton}
              onPress={() => void handleTriageAction('drop')}
              activeOpacity={0.9}
            >
              <Text style={styles.dropButtonText}>Drop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ─── Frame 3: Pull from backlog ─────────────────────────────────────────────
  if (frame === 'backlog') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.backlogHeader}>
          <Text style={styles.backlogTitle}>Stock this week</Text>
          <TouchableOpacity onPress={handleStartWeek} hitSlop={8}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.backlogInstruction}>
          Select items from your backlog to focus on this week.
        </Text>

        <ScrollView
          style={styles.backlogList}
          contentContainerStyle={{ paddingBottom: 128 }}
          showsVerticalScrollIndicator={false}
        >
          {backlogTasks.length === 0 && (
            <Text style={styles.emptyBacklog}>Your backlog is empty.</Text>
          )}
          {backlogTasks.map((task) => {
            const added = addedToWeek.has(task.id);
            return (
              <View key={task.id} style={[styles.backlogCard, added && styles.backlogCardAdded]}>
                <View style={{ flex: 1, opacity: added ? 0.6 : 1 }}>
                  <Text style={styles.backlogTaskTitle}>{task.title}</Text>
                  <Text style={styles.backlogTaskMeta}>
                    {EFFORT_LABEL[task.effort]} / {RETURN_LABEL[task.returnLevel]}
                  </Text>
                </View>
                {added ? (
                  <View style={styles.addedBadge}>
                    <Text style={styles.addedText}>Added ✓</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => void handleAddToWeek(task.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.backlogFooter, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartWeek}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Start week →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Frame 4: Completion confirmation ─────────────────────────────────────
  return (
    <View style={[styles.container, styles.center, { padding: 24 }]}>
      <Text style={styles.doneIcon}>✓</Text>
      <Text style={styles.doneTitle}>Ready for the new week.</Text>
      <Text style={styles.doneSubtitle}>
        Your ritual is complete. Your focus for the upcoming days has been anchored.
      </Text>
      <TouchableOpacity
        style={styles.returnButton}
        onPress={handleReturnToFocus}
        activeOpacity={0.7}
      >
        <Text style={styles.returnButtonText}>Return to Focus →</Text>
      </TouchableOpacity>
    </View>
  );
}

const C = {
  bg: '#151311',
  surface: '#211f1d',
  surfaceHigh: '#2c2927',
  primary: '#ffb4a4',
  primaryContainer: '#dd725a',
  onPrimaryContainer: '#560d01',
  onSurface: '#e7e1de',
  onSurfaceVariant: '#dcc0bb',
  outlineVariant: '#56423e',
  secondary: '#c0caac',
  tertiary: '#e9c176',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Recap ──
  recapContent: {
    width: '100%',
    maxWidth: 448,
    alignItems: 'center',
  },
  recapTitle: {
    fontFamily: 'serif',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '500',
    color: C.primary,
    marginBottom: 32,
    textAlign: 'center',
  },
  statsSection: {
    width: '100%',
    gap: 0,
  },
  statRow: {
    paddingVertical: 8,
  },
  displayText: {
    fontFamily: 'serif',
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '600',
    color: C.onSurface,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  streakLine: {
    fontSize: 18,
    lineHeight: 28,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(86,66,62,0.3)',
    marginTop: 16,
    paddingTop: 16,
  },
  goalBlock: {
    alignItems: 'center',
    gap: 4,
  },
  stillWorkingLabel: {
    fontSize: 16,
    color: 'rgba(220,192,187,0.8)',
    fontStyle: 'italic',
  },
  goalTitle: {
    fontFamily: 'serif',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    color: C.onSurface,
    textAlign: 'center',
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
  },
  goalProgressText: {
    fontSize: 14,
    color: C.primary,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: C.bg,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: C.primaryContainer,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onPrimaryContainer,
    letterSpacing: 0.1,
  },

  // ── Per-task triage ──
  triageHeader: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  triageSubtitle: {
    fontFamily: 'serif',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    color: 'rgba(220,192,187,0.8)',
    textAlign: 'center',
  },
  progressPill: {
    backgroundColor: 'rgba(255,180,164,0.1)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  progressPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.primary,
    letterSpacing: 0.1,
  },
  triageMain: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  taskCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 32,
    gap: 16,
  },
  taskTitle: {
    fontFamily: 'serif',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '500',
    color: C.onSurface,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  chipTheme: { backgroundColor: 'rgba(192,202,172,0.1)' },
  chipThemeText: { color: C.secondary },
  chipReturn: { backgroundColor: 'rgba(233,193,118,0.1)' },
  chipReturnText: { color: C.tertiary },
  actionStack: {
    gap: 16,
  },
  keepButton: {
    backgroundColor: C.primaryContainer,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onPrimaryContainer,
    letterSpacing: 0.1,
  },
  backlogButton: {
    borderWidth: 1,
    borderColor: C.outlineVariant,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backlogButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onSurfaceVariant,
    letterSpacing: 0.1,
  },
  dropButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  dropButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.onSurfaceVariant,
    letterSpacing: 0.1,
  },

  // ── Backlog pull ──
  backlogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 64,
    paddingTop: 16,
  },
  backlogTitle: {
    fontFamily: 'serif',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    color: C.onSurface,
  },
  closeIcon: {
    fontSize: 18,
    color: C.onSurfaceVariant,
  },
  backlogInstruction: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    fontSize: 16,
    lineHeight: 24,
    color: C.onSurfaceVariant,
    maxWidth: 280,
  },
  backlogList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyBacklog: {
    fontSize: 16,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 32,
  },
  backlogCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backlogCardAdded: {
    backgroundColor: 'rgba(44,41,39,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(192,202,172,0.1)',
  },
  backlogTaskTitle: {
    fontSize: 18,
    lineHeight: 28,
    color: C.onSurface,
    marginBottom: 4,
  },
  backlogTaskMeta: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    fontWeight: '500',
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addedText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.secondary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(164,139,134,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: C.primary,
    lineHeight: 24,
  },
  backlogFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: C.bg,
  },

  // ── Done ──
  doneIcon: {
    fontSize: 48,
    color: C.primary,
    opacity: 0.4,
    marginBottom: 32,
  },
  doneTitle: {
    fontFamily: 'serif',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '500',
    color: C.onSurface,
    textAlign: 'center',
    marginBottom: 12,
  },
  doneSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 48,
  },
  returnButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  returnButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.primary,
    opacity: 0.6,
  },
});
