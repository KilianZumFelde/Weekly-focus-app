import { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
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
import type { Task, Habit, Effort, ReturnLevel, WeekAssignment } from '@shared/types';
import type { SortOption } from '../../components/shared/SortToggle';

export default function ThisWeekScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortOption>('recommended');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [lastHitHabitId, setLastHitHabitId] = useState<string | null>(null);
  const { undoState, showUndo, dismiss } = useUndo();

  const load = useCallback(async () => {
    const [weekData, habitData] = await Promise.all([
      tasksService.getWeekTasks(),
      habitsService.getHabits(),
    ]);
    setTasks(weekData.tasks);
    setHabits(habitData);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleComplete = async (task: Task) => {
    const wasDone = task.status === 'done';
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: wasDone ? 'open' : 'done' } : t));

    if (!wasDone) {
      await tasksService.completeTask(task.id);
      showUndo(`"${task.title}" done`, async () => {
        await tasksService.uncompleteTask(task.id);
        void load();
      });
    } else {
      await tasksService.uncompleteTask(task.id);
    }
  };

  const handleIncrement = async (habit: Habit) => {
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
      // No decrement endpoint; just reload to sync true state
      void load();
    });
  };

  const handleSaveTask = async (id: string, updates: { title?: string; effort?: Effort; returnLevel?: ReturnLevel; weekAssignment?: WeekAssignment }) => {
    await tasksService.updateTask(id, updates);
    void load();
  };

  const handleDeleteTask = async (id: string) => {
    await tasksService.deleteTask(id);
    void load();
  };

  const handleMoveToBacklog = async (id: string) => {
    await tasksService.moveTask(id, { weekAssignment: 'backlog' });
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

  const openTasks = tasks.filter((t) => t.status === 'open');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const sortedTasks = [...openTasks].sort((a, b) => {
    if (sort === 'recommended') {
      const order = { top: 0, high: 1, medium: 2, low: 3, lowest: 4 };
      return (order[a.priorityScore ?? 'medium'] ?? 2) - (order[b.priorityScore ?? 'medium'] ?? 2);
    }
    return 0;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#BF5B45" />}
      >
        <Text style={styles.heading}>This Week</Text>

        {habits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habits</Text>
            {habits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                onIncrement={() => void handleIncrement(h)}
                onOpenDetail={() => setSelectedHabit(h)}
                justHitTarget={lastHitHabitId === h.id}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <SortToggle value={sort} onChange={setSort} />
          {sortedTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onComplete={() => void handleComplete(t)}
              onOpenDetail={() => setSelectedTask(t)}
            />
          ))}
          {doneTasks.length > 0 && (
            <Text style={styles.doneLabel}>Done ({doneTasks.length})</Text>
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
        onClose={() => setSelectedTask(null)}
        onSave={(id, updates) => void handleSaveTask(id, updates)}
        onDelete={(id) => void handleDeleteTask(id)}
        onMoveToBacklog={(id) => void handleMoveToBacklog(id)}
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
  container: { flex: 1, backgroundColor: '#121212' },
  heading: { color: '#F5F0E8', fontSize: 28, fontWeight: '700', padding: 16, paddingTop: 56 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#6B6B6B', fontSize: 13, fontWeight: '600', paddingHorizontal: 16, paddingBottom: 4 },
  doneLabel: { color: '#6B6B6B', fontSize: 13, paddingHorizontal: 16, paddingVertical: 8 },
});
