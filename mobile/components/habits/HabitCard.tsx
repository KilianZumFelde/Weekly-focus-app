import { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
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
const HALF = RING_SIZE / 2;

function ProgressRing({ count, target, color, trackColor }: {
  count: number;
  target: number;
  color: string;
  trackColor: string;
}) {
  const progress = target > 0 ? Math.min(count / target, 1) : 0;

  // Right half fills during 0–50%, left half fills during 50–100%
  const rightAngle = Math.min(progress, 0.5) * 360 - 180;
  const leftAngle  = Math.max(progress - 0.5, 0) * 360 - 180;
  const showLeft   = progress > 0.5;

  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE }}>
      {/* Track */}
      <View style={[styles.ringBase, { borderColor: trackColor }]} />

      {/* Right filler (0–50%) */}
      {progress > 0 && (
        <View style={styles.clipRight}>
          <View style={[styles.ringBase, { borderColor: color, right: 0, transform: [{ rotate: `${rightAngle}deg` }] }]} />
        </View>
      )}

      {/* Left filler (50–100%) */}
      {showLeft && (
        <View style={styles.clipLeft}>
          <View style={[styles.ringBase, { borderColor: color, left: 0, transform: [{ rotate: `${leftAngle}deg` }] }]} />
        </View>
      )}

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
  const [, forceUpdate] = useRef([0]).current;
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
  ringBase: {
    position: 'absolute',
    top: 0,
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: HALF,
    borderWidth: STROKE,
  },
  clipRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: HALF,
    height: RING_SIZE,
    overflow: 'hidden',
  },
  clipLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: HALF,
    height: RING_SIZE,
    overflow: 'hidden',
  },
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
