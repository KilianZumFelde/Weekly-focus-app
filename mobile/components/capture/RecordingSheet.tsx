import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  state: 'recording' | 'processing';
  transcript: string;
}

const BAR_MAX = 40;
const BAR_MIN = 6;

export function RecordingSheet({ state, transcript }: Props) {
  const insets = useSafeAreaInsets();
  const bar1 = useRef(new Animated.Value(BAR_MIN)).current;
  const bar2 = useRef(new Animated.Value(BAR_MAX * 0.5)).current;
  const bar3 = useRef(new Animated.Value(BAR_MIN + 10)).current;
  const slideY = useRef(new Animated.Value(180)).current;

  useEffect(() => {
    Animated.timing(slideY, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (state !== 'recording') {
      bar1.stopAnimation();
      bar2.stopAnimation();
      bar3.stopAnimation();
      return;
    }

    const pulse = (bar: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, { toValue: BAR_MAX, duration: 380, delay, useNativeDriver: false }),
          Animated.timing(bar, { toValue: BAR_MIN, duration: 380, useNativeDriver: false }),
        ]),
      );

    const a1 = pulse(bar1, 0);
    const a2 = pulse(bar2, 140);
    const a3 = pulse(bar3, 280);
    a1.start();
    a2.start();
    a3.start();

    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [state]);

  return (
    <Animated.View
      style={[styles.sheet, { paddingBottom: insets.bottom + 88, transform: [{ translateY: slideY }] }]}
    >
      <View style={styles.handle} />

      {state === 'recording' ? (
        <>
          <View style={styles.bars}>
            <Animated.View style={[styles.bar, { height: bar1 }]} />
            <Animated.View style={[styles.bar, { height: bar2 }]} />
            <Animated.View style={[styles.bar, { height: bar3 }]} />
            <Animated.View style={[styles.bar, { height: bar2 }]} />
            <Animated.View style={[styles.bar, { height: bar1 }]} />
          </View>
          <Text style={styles.label}>Listening…</Text>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1816',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(164,139,134,0.3)',
    marginBottom: 28,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
    height: BAR_MAX + 4,
    marginBottom: 20,
  },
  bar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: '#dd725a',
  },
  label: {
    color: '#A48B86',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  transcript: {
    color: '#E7E1DE',
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  hint: {
    color: '#56423e',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
});
