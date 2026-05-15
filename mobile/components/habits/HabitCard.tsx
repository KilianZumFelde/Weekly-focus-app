import { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import type { Habit } from '@shared/types';

interface Props {
  habit: Habit;
  onIncrement: () => void;
  onOpenDetail: () => void;
  justHitTarget?: boolean; // triggers gold glow
}

export function HabitCard({ habit, onIncrement, onOpenDetail, justHitTarget }: Props) {
  const { countAchieved, targetAtTime } = habit.currentWeekRecord;
  const progress = targetAtTime > 0 ? Math.min(countAchieved / targetAtTime, 1) : 0;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!justHitTarget) return;
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [justHitTarget, glowAnim]);

  const ringColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#BF5B45', '#E9C176'],
  });

  return (
    <View style={styles.card}>
      {/* Progress ring — tap to increment */}
      <TouchableOpacity onPress={onIncrement} style={styles.ringWrapper} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Animated.View style={[styles.ring, { borderColor: ringColor }]}>
          <Text style={styles.ringText}>{countAchieved}/{targetAtTime}</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Text area — tap to open detail */}
      <TouchableOpacity style={styles.content} onPress={onOpenDetail} activeOpacity={0.7}>
        <Text style={styles.title} numberOfLines={2}>{habit.title}</Text>
        <Text style={styles.streak}>🔥 {habit.currentStreak} week streak</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  ringWrapper: { marginRight: 14 },
  ring: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#BF5B45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: { color: '#F5F0E8', fontSize: 11, fontWeight: '600' },
  content: { flex: 1 },
  title: { color: '#F5F0E8', fontSize: 15, lineHeight: 20, marginBottom: 4 },
  streak: { color: '#6B6B6B', fontSize: 12 },
});
