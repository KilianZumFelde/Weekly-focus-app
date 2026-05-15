import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { TaskCard } from '../../components/tasks/TaskCard';
import { HabitCard } from '../../components/habits/HabitCard';
import { TaskDetailSheet } from '../../components/tasks/TaskDetailSheet';
import { HabitDetailSheet } from '../../components/habits/HabitDetailSheet';
import { SortToggle } from '../../components/shared/SortToggle';
import { UndoSnackbar } from '../../components/shared/UndoSnackbar';
import { useUndo } from '../../hooks/useUndo';
import { tasksService } from '../../services/tasks.service';
import { habitsService } from '../../services/habits.service';
import { themesService } from '../../services/themes.service';
import type { Task, Habit, Theme, Effort, ReturnLevel, WeekAssignment } from '@shared/types';
import type { SortOption } from '../../components/shared/SortToggle';

const SCORE_ORDER: Record<string, number> = { top: 0, high: 1, medium: 2, low: 3, lowest: 4 };

export default function ThisWeekScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortOption>('recommended');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [lastHitHabitId, setLastHitHabitId] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const { undoState, showUndo, dismiss } = useUndo();

  const load = useCallback(async () => {
    const [weekData, habitData, themeData] = await Promise.all([
      tasksService.getWeekTasks(),
      habitsService.getHabits(),
      themesService.getThemes(),
    ]);
    setTasks(weekData.tasks);
    setHabits(habitData);
    setThemes(themeData);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleComplete = async (task: Task) => {
    const wasDone = task.status === 'done';
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: wasDone ? 'open' : 'done' } : t));
    if (!wasDone) {
      await tasksService.completeTask(task.id);
      showUndo(`"${task.title}" marked done`, async () => {
        await tasksService.uncompleteTask(task.id);
        void load();
      });
    } else {
      await tasksService.uncompleteTask(task.id);
    }
  };

  const handleIncrement = async (habit: Habit) => {
    const previousCount = habit.currentWeekRecord.countAchieved;
    const result = await habitsService.incrementCount(habit.id);
    if (result.targetHit) setLastHitHabitId(habit.id);
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? { ...h, currentWeekRecord: { ...h.currentWeekRecord, countAchieved: result.countAchieved } }
          : h,
      ),
    );
    showUndo(`${habit.title} incremented`, async () => {
      // Optimistic revert — no server decrement endpoint exists yet
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habit.id
            ? { ...h, currentWeekRecord: { ...h.currentWeekRecord, countAchieved: previousCount } }
            : h,
        ),
      );
    });
  };

  const handleSaveTask = async (id: string, updates: { title?: string; effort?: Effort; returnLevel?: ReturnLevel; themeId?: string; weekAssignment?: WeekAssignment }) => {
    await tasksService.updateTask(id, updates);
    void load();
  };

  const handleDeleteTask = async (id: string) => {
    await tasksService.deleteTask(id);
    void load();
  };

  const handleSaveHabit = async (id: string, updates: { title?: string; weeklyTarget?: number }) => {
    await habitsService.updateHabit(id, updates);
    void load();
  };

  const handleDeleteHabit = async (id: string) => {
    const result = await habitsService.deleteHabit(id, { confirmed: true });
    showUndo('Habit deleted', async () => {
      await habitsService.undoDelete(id, { undoToken: result.undoToken });
      void load();
    });
    void load();
  };

  const toggleSection = (themeId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [themeId]: !prev[themeId] }));
  };

  const themeMap = useMemo(
    () => Object.fromEntries(themes.map((t) => [t.id, t])),
    [themes],
  );

  const openTasks = tasks.filter((t) => t.status === 'open');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    for (const task of openTasks) {
      if (!groups[task.themeId]) groups[task.themeId] = [];
      groups[task.themeId].push(task);
    }
    for (const tid in groups) {
      groups[tid].sort((a, b) =>
        (SCORE_ORDER[a.priorityScore ?? 'medium'] ?? 2) - (SCORE_ORDER[b.priorityScore ?? 'medium'] ?? 2),
      );
    }
    const entries = Object.entries(groups);
    if (sort === 'recommended') {
      entries.sort(([, a], [, b]) => {
        const bestA = Math.min(...a.map((t) => SCORE_ORDER[t.priorityScore ?? 'medium'] ?? 2));
        const bestB = Math.min(...b.map((t) => SCORE_ORDER[t.priorityScore ?? 'medium'] ?? 2));
        return bestA - bestB;
      });
    } else if (sort === 'by-theme') {
      entries.sort(([a], [b]) => (themeMap[a]?.name ?? '').localeCompare(themeMap[b]?.name ?? ''));
    } else {
      entries.sort(([, a], [, b]) => {
        const oldestA = Math.min(...a.map((t) => new Date(t.createdAt).getTime()));
        const oldestB = Math.min(...b.map((t) => new Date(t.createdAt).getTime()));
        return oldestA - oldestB;
      });
    }
    return entries;
  }, [openTasks, sort, themeMap]);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#BF5B45" />}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>This Week</Text>

        {/* Habits — horizontal scroll */}
        {habits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habits</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.habitsRow}
            >
              {habits.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  theme={themeMap[h.themeId]}
                  onIncrement={() => void handleIncrement(h)}
                  onOpenDetail={() => setSelectedHabit(h)}
                  justHitTarget={lastHitHabitId === h.id}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tasks — grouped by theme, collapsible */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <SortToggle value={sort} onChange={setSort} />

          {groupedTasks.map(([themeId, taskGroup]) => {
            const theme = themeMap[themeId];
            const isCollapsed = collapsedSections[themeId] ?? false;
            return (
              <View key={themeId} style={styles.themeGroup}>
                <TouchableOpacity style={styles.themeHeader} onPress={() => toggleSection(themeId)}>
                  <Text style={[styles.themeName, { color: theme?.color ?? '#A48B86' }]}>
                    {theme?.name?.toUpperCase() ?? 'TASKS'}
                  </Text>
                  <View style={styles.themeLine} />
                  <Text style={[styles.themeChevron, { color: theme?.color ?? '#A48B86' }]}>
                    {isCollapsed ? '›' : '⌄'}
                  </Text>
                </TouchableOpacity>

                {!isCollapsed && taskGroup.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onComplete={() => void handleComplete(t)}
                    onOpenDetail={() => setSelectedTask(t)}
                  />
                ))}
              </View>
            );
          })}

          {/* Done — collapsible */}
          {doneTasks.length > 0 && (
            <View style={styles.doneSection}>
              <TouchableOpacity style={styles.doneHeader} onPress={() => setShowDone((v) => !v)}>
                <Text style={styles.doneLabel}>✓  Done ({doneTasks.length})</Text>
                <Text style={styles.doneChevron}>{showDone ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showDone && doneTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onComplete={() => void handleComplete(t)}
                  onOpenDetail={() => setSelectedTask(t)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <UndoSnackbar
        visible={undoState.visible}
        label={undoState.label}
        onUndo={undoState.onUndo}
        onDismiss={dismiss}
      />

      <TaskDetailSheet
        task={selectedTask}
        visible={!!selectedTask}
        themes={themes}
        onClose={() => setSelectedTask(null)}
        onSave={(id, updates) => void handleSaveTask(id, updates)}
        onDelete={(id) => void handleDeleteTask(id)}
      />

      <HabitDetailSheet
        habit={selectedHabit}
        visible={!!selectedHabit}
        onClose={() => setSelectedHabit(null)}
        onSave={(id, updates) => void handleSaveHabit(id, updates)}
        onPause={(id) => { void habitsService.pauseHabit(id); void load(); }}
        onResume={(id) => { void habitsService.resumeHabit(id); void load(); }}
        onDelete={(id) => void handleDeleteHabit(id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#151311' },
  content: { paddingBottom: 120 },
  heading: { color: '#E7E1DE', fontSize: 32, fontWeight: '600', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8 },
  section: { marginBottom: 8 },
  sectionTitle: { color: '#A48B86', fontSize: 13, fontWeight: '600', paddingHorizontal: 24, paddingBottom: 12, paddingTop: 8 },
  habitsRow: { paddingHorizontal: 24, gap: 12, paddingBottom: 4 },
  themeGroup: { marginBottom: 4 },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 10,
  },
  themeName: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  themeLine: { flex: 1, height: 1, backgroundColor: 'rgba(164,139,134,0.2)' },
  themeChevron: { fontSize: 16, fontWeight: '300' },
  doneSection: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#1D1B19',
    borderRadius: 12,
    overflow: 'hidden',
  },
  doneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  doneLabel: { color: '#A48B86', fontSize: 13, fontWeight: '500' },
  doneChevron: { color: '#A48B86', fontSize: 11 },
});
