import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { Task } from '@shared/types';

interface Props {
  task: Task;
  onComplete: () => void;
  onOpenDetail: () => void;
}

const EFFORT_LABEL: Record<string, string> = { low: 'Low', medium: 'Med', high: 'High' };
const RETURN_LABEL: Record<string, string> = { low: 'Low', medium: 'Med', high: 'High' };

export function TaskCard({ task, onComplete, onOpenDetail }: Props) {
  const done = task.status === 'done';

  return (
    <View style={styles.card}>
      {/* Checkbox circle */}
      <TouchableOpacity
        style={[styles.circle, done && styles.circleDone]}
        onPress={onComplete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />

      {/* Title area — tap to open detail */}
      <TouchableOpacity style={styles.content} onPress={onOpenDetail} activeOpacity={0.7}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.chips}>
          <Chip label={EFFORT_LABEL[task.effort] ?? task.effort} />
          <Chip label={`↑ ${RETURN_LABEL[task.returnLevel] ?? task.returnLevel}`} accent />
        </View>
      </TouchableOpacity>
    </View>
  );
}

function Chip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[styles.chip, accent && styles.chipAccent]}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#BF5B45',
    marginRight: 12,
    marginTop: 2,
  },
  circleDone: { backgroundColor: '#BF5B45' },
  content: { flex: 1 },
  title: { color: '#F5F0E8', fontSize: 15, lineHeight: 20, marginBottom: 6 },
  titleDone: { color: '#6B6B6B', textDecorationLine: 'line-through' },
  chips: { flexDirection: 'row', gap: 6 },
  chip: {
    backgroundColor: '#2A2A2A', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  chipAccent: { backgroundColor: '#3A2A20' },
  chipText: { color: '#9A9A9A', fontSize: 11 },
});
