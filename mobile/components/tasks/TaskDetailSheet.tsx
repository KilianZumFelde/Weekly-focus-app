import { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import type { Task, Effort, ReturnLevel, WeekAssignment, Theme } from '@shared/types';

interface Props {
  task: Task | null;
  visible: boolean;
  themes: Theme[];
  onClose: () => void;
  onSave: (id: string, updates: { title?: string; effort?: Effort; returnLevel?: ReturnLevel; themeId?: string; weekAssignment?: WeekAssignment }) => void;
  onDelete: (id: string) => void;
}

const EFFORT_OPTIONS: Effort[] = ['low', 'medium', 'high'];
const RETURN_OPTIONS: ReturnLevel[] = ['low', 'medium', 'high'];

export function TaskDetailSheet({ task, visible, themes, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [effort, setEffort] = useState<Effort>('medium');
  const [returnLevel, setReturnLevel] = useState<ReturnLevel>('medium');
  const [themeId, setThemeId] = useState('');
  const [weekAssignment, setWeekAssignment] = useState<WeekAssignment>('this_week');
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setEffort(task.effort);
      setReturnLevel(task.returnLevel);
      setThemeId(task.themeId);
      setWeekAssignment(task.weekAssignment);
      setShowThemePicker(false);
    }
  }, [task?.id]);

  if (!task) return null;

  const currentTheme = themes.find((t) => t.id === themeId);

  const cycleEffort = () => {
    const idx = EFFORT_OPTIONS.indexOf(effort);
    setEffort(EFFORT_OPTIONS[(idx + 1) % EFFORT_OPTIONS.length] ?? 'medium');
  };

  const cycleReturn = () => {
    const idx = RETURN_OPTIONS.indexOf(returnLevel);
    setReturnLevel(RETURN_OPTIONS[(idx + 1) % RETURN_OPTIONS.length] ?? 'medium');
  };

  const toggleWeekAssignment = () => {
    setWeekAssignment((prev) => prev === 'this_week' ? 'backlog' : 'this_week');
  };

  const handleSave = () => {
    onSave(task.id, { title, effort, returnLevel, themeId, weekAssignment });
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('Delete task', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { onDelete(task.id); onClose(); } },
    ]);
  };

  const effortLabel: Record<Effort, string> = { low: 'Low Effort', medium: 'Med Effort', high: 'High Effort' };
  const returnLabel: Record<ReturnLevel, string> = { low: 'Low Return', medium: 'Med Return', high: 'High Return' };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.scrim} onPress={handleSave} activeOpacity={1} />

        <View style={styles.sheet}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            placeholderTextColor="#56423E"
            multiline
          />

          {/* Chip row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <TouchableOpacity
              style={[styles.pill, styles.pillTheme]}
              onPress={() => setShowThemePicker((v) => !v)}
            >
              <Text style={styles.pillThemeText}>⊞  {currentTheme?.name ?? 'Theme'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.pill, styles.pillEffort]} onPress={cycleEffort}>
              <Text style={styles.pillEffortText}>⚡  {effortLabel[effort]}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.pill, styles.pillReturn]} onPress={cycleReturn}>
              <Text style={styles.pillReturnText}>↑  {returnLabel[returnLevel]}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.pill, styles.pillWeek]} onPress={toggleWeekAssignment}>
              <Text style={styles.pillWeekText}>
                📅  {weekAssignment === 'this_week' ? 'This Week' : 'Backlog'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Inline theme picker */}
          {showThemePicker && (
            <View style={styles.themePicker}>
              {themes.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.themeOption, t.id === themeId && styles.themeOptionActive]}
                  onPress={() => { setThemeId(t.id); setShowThemePicker(false); }}
                >
                  <View style={[styles.themeColor, { backgroundColor: t.color }]} />
                  <Text style={[styles.themeOptionText, t.id === themeId && { color: t.color }]}>
                    {t.name}
                  </Text>
                  {t.id === themeId && <Text style={[styles.themeCheck, { color: t.color }]}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionLink} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
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
    backgroundColor: '#211F1D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  handleWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 20 },
  handle: { width: 40, height: 4, backgroundColor: 'rgba(164,139,134,0.3)', borderRadius: 2 },
  titleInput: {
    color: '#E7E1DE',
    fontSize: 22,
    fontWeight: '600',
    paddingHorizontal: 24,
    paddingBottom: 16,
    minHeight: 40,
  },
  chipRow: { paddingHorizontal: 24, gap: 10, paddingBottom: 20 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillTheme: { backgroundColor: 'rgba(192,202,172,0.12)' },
  pillThemeText: { color: '#C0CAAC', fontSize: 13, fontWeight: '500' },
  pillEffort: { backgroundColor: 'rgba(233,193,118,0.12)' },
  pillEffortText: { color: '#E9C176', fontSize: 13, fontWeight: '500' },
  pillReturn: { backgroundColor: 'rgba(191,91,69,0.15)' },
  pillReturnText: { color: '#BF5B45', fontSize: 13, fontWeight: '500' },
  pillWeek: { backgroundColor: '#2C2927' },
  pillWeekText: { color: '#A48B86', fontSize: 13, fontWeight: '500' },
  themePicker: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#1A1816',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(164,139,134,0.1)',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(164,139,134,0.08)',
  },
  themeOptionActive: { backgroundColor: 'rgba(255,255,255,0.03)' },
  themeColor: { width: 10, height: 10, borderRadius: 5 },
  themeOptionText: { flex: 1, color: '#A48B86', fontSize: 14, fontWeight: '500' },
  themeCheck: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(164,139,134,0.15)', marginBottom: 4 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  actionLink: { paddingVertical: 8, paddingHorizontal: 4 },
  saveBtn: {
    backgroundColor: '#BF5B45',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 999,
  },
  saveBtnText: { color: '#3D0500', fontSize: 14, fontWeight: '700' },
  deleteText: { color: '#BF5B45', fontSize: 14 },
});
