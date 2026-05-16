import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { Task } from '@shared/types';

interface Props {
  task: Task;
  onComplete: () => void;
  onOpenDetail: () => void;
}

const EFFORT_LABEL: Record<string, string> = { low: 'Low Effort', medium: 'Med Effort', high: 'High Effort' };
const RETURN_LABEL: Record<string, string> = { low: 'Low Return', medium: 'Med Return', high: 'High Return' };

export function TaskCard({ task, onComplete, onOpenDetail }: Props) {
  const done = task.status === 'done';

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={[styles.circle, done && styles.circleDone]}
        onPress={onComplete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />

      <TouchableOpacity style={styles.content} onPress={onOpenDetail} activeOpacity={0.7}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.chips}>
          <View style={styles.chipEffort}>
            <Text style={styles.chipEffortText}>{EFFORT_LABEL[task.effort] ?? task.effort}</Text>
          </View>
          <View style={styles.chipReturn}>
            <Text style={styles.chipReturnText}>{RETURN_LABEL[task.returnLevel] ?? task.returnLevel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1D1B19',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
    marginHorizontal: 24,
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
  title: { color: '#E7E1DE', fontSize: 15, lineHeight: 22, marginBottom: 6 },
  titleDone: { color: '#56423E', textDecorationLine: 'line-through' },
  chips: { flexDirection: 'row', gap: 6 },
  chipEffort: {
    backgroundColor: 'rgba(192,202,172,0.12)',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  chipEffortText: { color: '#C0CAAC', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  chipReturn: {
    backgroundColor: 'rgba(233,193,118,0.12)',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  chipReturnText: { color: '#E9C176', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
});
