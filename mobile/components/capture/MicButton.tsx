import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onPress: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
}

export function MicButton({ onPress, onStartRecording, onStopRecording, isRecording }: Props) {
  const insets = useSafeAreaInsets();
  const longPressActive = useRef(false);

  const handleLongPress = () => {
    longPressActive.current = true;
    onStartRecording();
  };

  const handlePressOut = () => {
    if (longPressActive.current) {
      longPressActive.current = false;
      onStopRecording();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: insets.bottom + 72 }, isRecording && styles.fabActive]}
      onPress={onPress}
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
      activeOpacity={0.85}
      delayLongPress={400}
    >
      <Text style={styles.icon}>{isRecording ? '●' : '+'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dd725a',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  fabActive: {
    backgroundColor: '#c0432a',
  },
  icon: {
    color: '#560d01',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
    marginTop: -2,
  },
});
