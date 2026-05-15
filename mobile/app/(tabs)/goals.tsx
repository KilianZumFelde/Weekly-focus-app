import { View, Text, StyleSheet } from 'react-native';

export default function GoalsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Goals</Text>
      <Text style={styles.sub}>Coming in Phase 6</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#151311', paddingTop: 60, paddingHorizontal: 24 },
  heading: { color: '#E7E1DE', fontSize: 32, fontWeight: '600', marginBottom: 8 },
  sub: { color: '#56423E', fontSize: 15 },
});
