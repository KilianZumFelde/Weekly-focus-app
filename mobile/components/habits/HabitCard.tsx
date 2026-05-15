import { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { Habit, Theme } from '@shared/types';

interface Props {
  habit: Habit;
  theme?: Theme;
  onIncrement: () => void;
  onOpenDetail: () => void;
  justHitTarget?: boolean;
}

const RING_SIZE = 52;
const STROKE = 3;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressRing({ count, target, color, trackColor }: {
  count: number;
  target: number;
  color: string;
  trackColor: string;
}) {
  const progress = target > 0 ? Math.min(count / target, 1) : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE }}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={trackColor}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress arc — starts at top (rotate -90deg) */}
        {progress > 0 && (
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        )}
      </Svg>

      {/* Count text centred over ring */}
      <View style={styles.ringCenter}>
        <Text style={styles.ringText}>{count}/{target}</Text>
      </View>
    </View>
  );
}

export function HabitCard({ habit, theme, onIncrement, onOpenDetail, justHitTarget }: Props) {
  const { countAchieved, targetAtTime } = habit.currentWeekRecord;
  const isComplete = targetAtTime > 0 && countAchieved >= targetAtTime;

  const glowing = useRef(false);
  const glowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!justHitTarget) return;
    glowing.current = true;
    if (glowTimer.current) clearTimeout(glowTimer.current);
    glowTimer.current = setTimeout(() => {
      glowing.current = false;
    }, 1200);
  }, [justHitTarget]);

  const ringColor = glowing.current || isComplete ? '#E9C176'
    : countAchieved > 0 ? '#BF5B45'
    : '#3A3230';

  const themeColor = theme?.color ?? '#6B6B6B';

  const isPaused = habit.status === 'paused';

  return (
    <View style={[styles.card, isPaused && styles.cardPaused]}>
      <TouchableOpacity
        onPress={onIncrement}
        activeOpacity={0.7}
        style={styles.ringSection}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <ProgressRing
          count={countAchieved}
          target={targetAtTime}
          color={ringColor}
          trackColor="#2A2826"
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onOpenDetail} activeOpacity={0.8} style={styles.textSection}>
        <Text style={styles.title} numberOfLines={2}>{habit.title}</Text>
        {theme && (
          <Text style={[styles.themeLabel, { color: themeColor }]} numberOfLines={1}>
            {theme.name.toUpperCase()}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 112,
    backgroundColor: '#211F1D',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardPaused: { opacity: 0.4 },
  ringSection: { alignItems: 'center' },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: { color: '#E7E1DE', fontSize: 12, fontWeight: '600' },
  textSection: { alignItems: 'center', width: '100%' },
  title: {
    color: '#E7E1DE',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  themeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
