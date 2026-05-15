import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type SortOption = 'recommended' | 'by-theme' | 'added-order';

interface Props {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

const OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'by-theme',    label: 'By theme' },
  { key: 'added-order', label: 'Added order' },
];

export function SortToggle({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[styles.option, value === opt.key && styles.optionActive]}
          onPress={() => onChange(opt.key)}
        >
          <Text style={[styles.label, value === opt.key && styles.labelActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 3,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  option: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
  optionActive: { backgroundColor: '#2A2A2A' },
  label: { color: '#6B6B6B', fontSize: 12, fontWeight: '500' },
  labelActive: { color: '#F5F0E8' },
});
