import { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import type { Task, Effort, ReturnLevel, WeekAssignment } from '@shared/types';

interface Props {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { title?: string; effort?: Effort; returnLevel?: ReturnLevel; weekAssignment?: WeekAssignment }) => void;
  onDelete: (id: string) => void;
  onMoveToBacklog: (id: string) => void;
}

const EFFORT_OPTIONS: Effort[] = ['low', 'medium', 'high'];
const RETURN_OPTIONS: ReturnLevel[] = ['low', 'medium', 'high'];

export function TaskDetailSheet({ task, visible, onClose, onSave, onDelete, onMoveToBacklog }: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [effort, setEffort] = useState<Effort>(task?.effort ?? 'medium');
  const [returnLevel, setReturnLevel] = useState<ReturnLevel>(task?.returnLevel ?? 'medium');

  if (!task) return null;

  const handleSave = () => {
    onSave(task.id, { title, effort, returnLevel });
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('Delete task', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { onDelete(task.id); onClose(); } },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.heading}>Task</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.save}>Save</Text></TouchableOpacity>
        </View>

        <ScrollView style={styles.body}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            placeholderTextColor="#6B6B6B"
            multiline
          />

          <Text style={styles.label}>Effort</Text>
          <View style={styles.chips}>
            {EFFORT_OPTIONS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.chip, effort === e && styles.chipActive]}
                onPress={() => setEffort(e)}
              >
                <Text style={[styles.chipText, effort === e && styles.chipTextActive]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Return</Text>
          <View style={styles.chips}>
            {RETURN_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, returnLevel === r && styles.chipActive]}
                onPress={() => setReturnLevel(r)}
              >
                <Text style={[styles.chipText, returnLevel === r && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            {task.weekAssignment === 'this_week' && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => { onMoveToBacklog(task.id); onClose(); }}>
                <Text style={styles.actionText}>Move to backlog</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete task</Text>
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
  label: { color: '#6B6B6B', fontSize: 12, marginBottom: 8, marginTop: 16 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 6,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  chipActive: { borderColor: '#BF5B45', backgroundColor: '#3A2A20' },
  chipText: { color: '#6B6B6B', fontSize: 14 },
  chipTextActive: { color: '#BF5B45' },
  actions: { marginTop: 40, gap: 12 },
  actionBtn: {
    padding: 14, borderRadius: 8, borderWidth: 1,
    borderColor: '#2A2A2A', alignItems: 'center',
  },
  actionText: { color: '#F5F0E8', fontSize: 15 },
  deleteBtn: { borderColor: '#7A2A1A' },
  deleteText: { color: '#BF5B45', fontSize: 15 },
});
