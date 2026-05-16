import {
  View, Text, Modal, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useState } from 'react';
import type { DraftItem, TaskDraftItem, HabitDraftItem, Theme } from '@shared/types';

interface Props {
  items: DraftItem[];
  themes: Theme[];
  onSave: (item: DraftItem) => void;
  onSaveAll: (items: DraftItem[]) => void;
  onCancel: () => void;
}

const EFFORT_CYCLE: Array<TaskDraftItem['effort']> = ['low', 'medium', 'high', null];
const RETURN_CYCLE: Array<TaskDraftItem['returnLevel']> = ['low', 'medium', 'high', null];
const TARGET_CYCLE = [1, 2, 3, 4, 5, 7];

export function DraftCard({ items, themes, onSave, onSaveAll, onCancel }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drafts, setDrafts] = useState<DraftItem[]>(items);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const current = drafts[currentIndex];
  if (!current) return null;

  const isMulti = drafts.length > 1;

  const setCurrentDraft = (next: DraftItem) => {
    setDrafts(prev => prev.map((d, i) => (i === currentIndex ? next : d)));
  };

  const toggleType = () => {
    if (current.type === 'task') {
      setCurrentDraft({
        type: 'habit',
        title: current.title,
        themeId: current.themeId,
        themeConfidence: current.themeConfidence,
        weeklyTarget: 3,
        weeklyTargetConfidence: null,
        goalId: current.goalId,
      });
    } else {
      setCurrentDraft({
        type: 'task',
        title: current.title,
        themeId: current.themeId,
        themeConfidence: current.themeConfidence,
        effort: null,
        effortConfidence: null,
        returnLevel: null,
        returnLevelConfidence: null,
        weekAssignment: 'this_week',
        goalId: current.goalId,
      });
    }
  };

  const handleSave = () => {
    if (isMulti && currentIndex < drafts.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      onSave(current);
    }
  };

  const isLow = (conf: string | null | undefined) => conf === 'low' || conf === null;

  const selectTheme = (id: string) => {
    setCurrentDraft({ ...current, themeId: id, themeConfidence: 'high' });
    setShowThemePicker(false);
  };

  const themeName = current.themeId
    ? (themes.find(t => t.id === current.themeId)?.name ?? 'Theme')
    : 'No theme';

  return (
    <Modal transparent animationType="fade" statusBarTranslucent>
      <View style={styles.scrim} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.content}>
            {isMulti && (
              <Text style={styles.multiIndicator}>
                {currentIndex + 1} of {drafts.length}
              </Text>
            )}

            {/* Type pill */}
            <View style={styles.pillRow}>
              <View style={styles.pillTrack}>
                <TouchableOpacity
                  style={[styles.pill, current.type === 'task' && styles.pillActive]}
                  onPress={() => current.type !== 'task' && toggleType()}
                >
                  <Text style={[styles.pillText, current.type === 'task' && styles.pillActiveText]}>
                    Task
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pill, current.type === 'habit' && styles.pillActive]}
                  onPress={() => current.type !== 'habit' && toggleType()}
                >
                  <Text style={[styles.pillText, current.type === 'habit' && styles.pillActiveText]}>
                    Habit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleWrap}>
              <TextInput
                style={styles.titleInput}
                value={current.title}
                onChangeText={text => setCurrentDraft({ ...current, title: text })}
                placeholder="What do you want to do?"
                placeholderTextColor="#56423e"
                multiline
                autoFocus
              />
              <View style={styles.titleDivider} />
            </View>

            {/* Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {/* Theme */}
              <TouchableOpacity style={styles.chipTheme} onPress={() => setShowThemePicker(v => !v)}>
                <Text style={styles.chipThemeText}>🏷  {themeName}</Text>
              </TouchableOpacity>

              {current.type === 'task' && <TaskChips item={current} setDraft={setCurrentDraft} isLow={isLow} />}
              {current.type === 'habit' && <HabitChips item={current} setDraft={setCurrentDraft} isLow={isLow} />}

              {/* Goal (ghost) */}
              <TouchableOpacity style={styles.chipGhost}>
                <Text style={styles.chipGhostText}>🎯  Link Goal</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Inline theme picker */}
            {showThemePicker && (
              <View style={styles.themePicker}>
                {themes.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.themeOption, t.id === current.themeId && styles.themeOptionActive]}
                    onPress={() => selectTheme(t.id)}
                  >
                    <View style={[styles.themeColor, { backgroundColor: t.color }]} />
                    <Text style={[styles.themeOptionText, t.id === current.themeId && { color: t.color }]}>
                      {t.name}
                    </Text>
                    {t.id === current.themeId && (
                      <Text style={[styles.themeCheck, { color: t.color }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.actionRight}>
                {isMulti && currentIndex === drafts.length - 1 && (
                  <TouchableOpacity style={styles.saveAllBtn} onPress={() => onSaveAll(drafts)}>
                    <Text style={styles.cancelText}>Save all</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveText}>
                    {isMulti && currentIndex < drafts.length - 1 ? 'Next →' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Sub-components for task/habit-specific chips ────────────────────────────

interface TaskChipsProps {
  item: TaskDraftItem;
  setDraft: (d: DraftItem) => void;
  isLow: (c: string | null | undefined) => boolean;
}

function TaskChips({ item, setDraft, isLow }: TaskChipsProps) {
  const cycleEffort = () => {
    const i = EFFORT_CYCLE.indexOf(item.effort);
    setDraft({ ...item, effort: EFFORT_CYCLE[(i + 1) % EFFORT_CYCLE.length] ?? null, effortConfidence: 'high' });
  };
  const cycleReturn = () => {
    const i = RETURN_CYCLE.indexOf(item.returnLevel);
    setDraft({ ...item, returnLevel: RETURN_CYCLE[(i + 1) % RETURN_CYCLE.length] ?? null, returnLevelConfidence: 'high' });
  };
  const cycleAssignment = () => {
    setDraft({ ...item, weekAssignment: item.weekAssignment === 'this_week' ? 'backlog' : 'this_week' });
  };

  return (
    <>
      <TouchableOpacity style={styles.chipDefault} onPress={cycleEffort}>
        <Text style={[styles.chipText, isLow(item.effortConfidence) && styles.faded]}>
          ⚡  {item.effort ? cap(item.effort) : 'Effort'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.chipDefault} onPress={cycleReturn}>
        <Text style={[styles.chipText, isLow(item.returnLevelConfidence) && styles.faded]}>
          📈  {item.returnLevel ? cap(item.returnLevel) : 'Return'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.chipTiming} onPress={cycleAssignment}>
        <Text style={styles.chipTimingText}>
          🗓  {item.weekAssignment === 'this_week' ? 'This week' : 'Backlog'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.chipGhost}>
        <Text style={styles.chipGhostText}>🔔  Add Reminder</Text>
      </TouchableOpacity>
    </>
  );
}

interface HabitChipsProps {
  item: HabitDraftItem;
  setDraft: (d: DraftItem) => void;
  isLow: (c: string | null | undefined) => boolean;
}

function HabitChips({ item, setDraft, isLow }: HabitChipsProps) {
  const cycleTarget = () => {
    const i = TARGET_CYCLE.indexOf(item.weeklyTarget ?? 3);
    setDraft({ ...item, weeklyTarget: TARGET_CYCLE[(i + 1) % TARGET_CYCLE.length] ?? null, weeklyTargetConfidence: 'high' });
  };
  return (
    <TouchableOpacity style={styles.chipDefault} onPress={cycleTarget}>
      <Text style={[styles.chipText, isLow(item.weeklyTargetConfidence) && styles.faded]}>
        🔁  {item.weeklyTarget != null ? `${item.weeklyTarget}×/week` : 'How often?'}
      </Text>
    </TouchableOpacity>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const C = {
  surfaceDim: '#151311',
  surfaceContainerHigh: '#2c2927',
  primaryContainer: '#dd725a',
  onPrimaryContainer: '#560d01',
  secondary: '#c0caac',
  secondaryContainer: '#434c35',
  tertiary: '#e9c176',
  tertiaryContainer: '#af8b47',
  outline: '#a48b86',
  outlineVariant: '#56423e',
  onSurface: '#e7e1de',
  onSurfaceVariant: '#dcc0bb',
  onBackground: '#e7e1de',
};

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16,14,12,0.85)',
  },
  keyboardView: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.surfaceDim,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  handleContainer: { alignItems: 'center', paddingVertical: 16 },
  handle: { width: 48, height: 4, borderRadius: 2, backgroundColor: '#56423e4d' },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  multiIndicator: { textAlign: 'center', color: C.onSurfaceVariant, fontSize: 13, fontWeight: '500', marginBottom: 8 },
  pillRow: { alignItems: 'center', marginBottom: 32 },
  pillTrack: { flexDirection: 'row', backgroundColor: C.surfaceContainerHigh, borderRadius: 999, padding: 4 },
  pill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999 },
  pillActive: { backgroundColor: C.primaryContainer },
  pillText: { color: C.onSurfaceVariant, fontSize: 14, fontWeight: '500' },
  pillActiveText: { color: C.onPrimaryContainer },
  titleWrap: { marginBottom: 32 },
  titleInput: { color: C.onBackground, fontSize: 28, fontWeight: '500', lineHeight: 36, padding: 0, minHeight: 36 },
  titleDivider: { height: 1, backgroundColor: '#56423e4d', marginTop: 8 },
  chips: { gap: 8, paddingBottom: 16 },
  chipTheme: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#434c3533', borderRadius: 999,
    borderWidth: 1, borderColor: '#434c354d',
  },
  chipThemeText: { color: C.secondary, fontSize: 14, fontWeight: '500' },
  chipDefault: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: C.surfaceContainerHigh, borderRadius: 999,
    borderWidth: 1, borderColor: '#56423e33',
  },
  chipText: { color: C.onSurface, fontSize: 14, fontWeight: '500' },
  chipTiming: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#af8b471a', borderRadius: 999,
    borderWidth: 1, borderColor: '#af8b474d',
  },
  chipTimingText: { color: C.tertiary, fontSize: 14, fontWeight: '500' },
  chipGhost: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: '#a48b8666',
    borderStyle: 'dashed',
  },
  chipGhostText: { color: C.outline, fontSize: 14, fontWeight: '500' },
  faded: { opacity: 0.5 },
  themePicker: {
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
  actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  cancelBtn: { paddingHorizontal: 24, paddingVertical: 14 },
  cancelText: { color: C.onSurfaceVariant, fontSize: 14, fontWeight: '500' },
  actionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveAllBtn: { paddingHorizontal: 16, paddingVertical: 14 },
  saveBtn: { paddingHorizontal: 24, paddingVertical: 14, backgroundColor: C.primaryContainer, borderRadius: 12 },
  saveText: { color: C.onPrimaryContainer, fontSize: 14, fontWeight: '500' },
});
