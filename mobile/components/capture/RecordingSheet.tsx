import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface Props {
  state: 'recording' | 'processing';
  transcript: string;
  speechDetected: boolean;
}

const BAR_MAX = 32;
const BAR_MIN = 6;

export function RecordingSheet({ state, transcript, speechDetected }: Props) {
  const bar1 = useRef(new Animated.Value(BAR_MIN)).current;
  const bar2 = useRef(new Animated.Value(BAR_MAX * 0.5)).current;
  const bar3 = useRef(new Animated.Value(BAR_MIN + 8)).current;
  const bar4 = useRef(new Animated.Value(BAR_MAX * 0.5)).current;
  const bar5 = useRef(new Animated.Value(BAR_MIN)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dot = useRef(new Animated.Value(0.3)).current;

  // Fade in on mount
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, []);

  // Pulsing dot when waiting for speech
  useEffect(() => {
    if (speechDetected || state !== 'recording') {
      dot.stopAnimation();
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(dot, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(dot, { toValue: 0.3, duration: 600, useNativeDriver: false }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [speechDetected, state]);

  // Equalizer bars when speech detected
  useEffect(() => {
    if (!speechDetected || state !== 'recording') {
      [bar1, bar2, bar3, bar4, bar5].forEach(b => b.stopAnimation());
      return;
    }
    const pulse = (bar: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, { toValue: BAR_MAX, duration: 300, delay, useNativeDriver: false }),
          Animated.timing(bar, { toValue: BAR_MIN, duration: 300, useNativeDriver: false }),
        ]),
      );
    const anims = [
      pulse(bar1, 0), pulse(bar2, 100), pulse(bar3, 200), pulse(bar4, 100), pulse(bar5, 0),
    ];
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, [speechDetected, state]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <View style={styles.card}>
        {state === 'recording' ? (
          <>
            {speechDetected ? (
              <View style={styles.bars}>
                <Animated.View style={[styles.bar, { height: bar1 }]} />
                <Animated.View style={[styles.bar, { height: bar2 }]} />
                <Animated.View style={[styles.bar, { height: bar3 }]} />
                <Animated.View style={[styles.bar, { height: bar4 }]} />
                <Animated.View style={[styles.bar, { height: bar5 }]} />
              </View>
            ) : (
              <Animated.View style={[styles.dot, { opacity: dot }]} />
            )}
            <Text style={styles.label}>
              {speechDetected ? 'Listening…' : 'Waiting for speech…'}
            </Text>
            {!!transcript && (
              <Text style={styles.transcript} numberOfLines={3}>{transcript}</Text>
            )}
            <Text style={styles.hint}>Release to send</Text>
          </>
        ) : (
          <View style={styles.processingRow}>
            <ActivityIndicator color="#dd725a" size="small" />
            <Text style={styles.label}>Processing…</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  card: {
    backgroundColor: '#1E1C1A',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: 'center',
    minWidth: 220,
    maxWidth: 300,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(164,139,134,0.12)',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: BAR_MAX + 4,
    marginBottom: 16,
  },
  bar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: '#dd725a',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dd725a',
    marginBottom: 16,
  },
  label: {
    color: '#A48B86',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  transcript: {
    color: '#E7E1DE',
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  hint: {
    color: '#56423e',
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
