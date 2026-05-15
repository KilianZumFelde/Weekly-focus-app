import { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  Switch, StyleSheet, Alert,
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
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(3);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setTarget(habit.weeklyTarget);
    }
  }, [habit?.id]);

  if (!habit) return null;

  const isPaused = habit.status === 'paused';

  const handleClose = () => {
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

  const togglePause = () => {
    if (isPaused) {
      onResume(habit.id);
    } else {
      onPause(habit.id);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.scrim} onPress={handleClose} activeOpacity={1} />

        <View style={styles.sheet}>
          {/* Grab handle */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {/* Editable title */}
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Habit title"
            placeholderTextColor="#56423E"
            multiline
          />

          {/* Target stepper row */}
          <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>{target} per week</Text>
            <View style={styles.stepperControl}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setTarget((v) => Math.max(1, v - 1))}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepCount}>{target}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setTarget((v) => Math.min(7, v + 1))}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Streak — visual centerpiece */}
          <View style={styles.streakBlock}>
            <View style={styles.streakMain}>
              <Text style={styles.streakNumber}>{habit.currentStreak}</Text>
              <Text style={styles.streakWeeks}>weeks</Text>
            </View>
            <View style={styles.streakMeta}>
              <Text style={styles.streakMetaText}>Current Streak</Text>
              <View style={styles.streakDot} />
              <Text style={styles.streakBest}>Best: {habit.bestEverStreak}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Action row */}
          <View style={styles.actionsRow}>
            <View style={styles.pauseRow}>
              <Text style={styles.pauseLabel}>Pause Habit</Text>
              <Switch
                value={isPaused}
                onValueChange={togglePause}
                trackColor={{ false: '#373432', true: '#BF5B45' }}
                thumbColor={isPaused ? '#E7E1DE' : '#A48B86'}
              />
            </View>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(21,19,17,0.7)' },
  sheet: {
    backgroundColor: '#1D1B19',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  handleWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 24 },
  handle: { width: 40, height: 4, backgroundColor: 'rgba(164,139,134,0.3)', borderRadius: 2 },
  titleInput: {
    color: '#E7E1DE',
    fontSize: 26,
    fontWeight: '600',
    paddingHorizontal: 24,
    paddingBottom: 8,
    minHeight: 40,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  stepperLabel: { color: '#A48B86', fontSize: 16 },
  stepperControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2927',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: '#A48B86', fontSize: 20, lineHeight: 24 },
  stepCount: { color: '#E7E1DE', fontSize: 16, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  streakBlock: {
    marginHorizontal: 24,
    marginVertical: 8,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(55,52,50,0.3)',
    alignItems: 'center',
    gap: 8,
  },
  streakMain: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  streakNumber: { color: '#BF5B45', fontSize: 56, fontWeight: '600', lineHeight: 64 },
  streakWeeks: { color: '#A48B86', fontSize: 22, fontWeight: '500' },
  streakMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakMetaText: { color: '#A48B86', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1 },
  streakDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#56423E' },
  streakBest: { color: '#E9C176', fontSize: 12, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(164,139,134,0.15)', marginHorizontal: 24, marginVertical: 20 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  pauseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pauseLabel: { color: '#A48B86', fontSize: 14 },
  deleteText: { color: '#BF5B45', fontSize: 14 },
});
