import { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import type { Habit } from '@shared/types';

interface Props {
  habit: Habit | null;
  visible: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { title?: string; weeklyTarget?: number }) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HabitDetailSheet({ habit, visible, onClose, onSave, onPause, onResume, onDelete }: Props) {
  const [title, setTitle] = useState(habit?.title ?? '');
  const [target, setTarget] = useState(habit?.weeklyTarget ?? 3);

  if (!habit) return null;

  const handleSave = () => {
    onSave(habit.id, { title, weeklyTarget: target });
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete habit',
      'This will remove the habit and all its history after a short undo window.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { onDelete(habit.id); onClose(); } },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.heading}>Habit</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.save}>Save</Text></TouchableOpacity>
        </View>

        <ScrollView style={styles.body}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Habit title"
            placeholderTextColor="#6B6B6B"
          />

          <Text style={styles.label}>Weekly target</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => setTarget(Math.max(1, target - 1))}>
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepValue}>{target}×</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={() => setTarget(Math.min(7, target + 1))}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.streaks}>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{habit.currentStreak}</Text>
              <Text style={styles.streakLabel}>Current streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{habit.bestEverStreak}</Text>
              <Text style={styles.streakLabel}>Best ever</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                habit.status === 'active' ? onPause(habit.id) : onResume(habit.id);
                onClose();
              }}
            >
              <Text style={styles.actionText}>
                {habit.status === 'active' ? 'Pause habit' : 'Resume habit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete habit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A2A',
  },
  cancel: { color: '#6B6B6B', fontSize: 16 },
  heading: { color: '#F5F0E8', fontSize: 17, fontWeight: '600' },
  save: { color: '#BF5B45', fontSize: 16, fontWeight: '600' },
  body: { flex: 1, padding: 16 },
  titleInput: {
    color: '#F5F0E8', fontSize: 20, fontWeight: '600',
    borderBottomWidth: 1, borderBottomColor: '#2A2A2A',
    paddingBottom: 12, marginBottom: 24,
  },
  label: { color: '#6B6B6B', fontSize: 12, marginBottom: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
  stepBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { color: '#F5F0E8', fontSize: 20, lineHeight: 24 },
  stepValue: { color: '#F5F0E8', fontSize: 24, fontWeight: '600', minWidth: 40, textAlign: 'center' },
  streaks: {
    flexDirection: 'row', backgroundColor: '#1A1A1A',
    borderRadius: 12, padding: 20, marginBottom: 32, alignItems: 'center',
  },
  streakItem: { flex: 1, alignItems: 'center' },
  streakValue: { color: '#F5F0E8', fontSize: 28, fontWeight: '700' },
  streakLabel: { color: '#6B6B6B', fontSize: 12, marginTop: 4 },
  streakDivider: { width: 1, height: 40, backgroundColor: '#2A2A2A' },
  actions: { gap: 12 },
  actionBtn: {
    padding: 14, borderRadius: 8, borderWidth: 1,
    borderColor: '#2A2A2A', alignItems: 'center',
  },
  actionText: { color: '#F5F0E8', fontSize: 15 },
  deleteBtn: { borderColor: '#7A2A1A' },
  deleteText: { color: '#BF5B45', fontSize: 15 },
});
