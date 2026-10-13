import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, MinTarget, Numeric, Radius, Type } from '@/constants/theme';

export interface Segment<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.track} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {segments.map((s) => {
        const selected = s.value === value;
        return (
          <Pressable
            key={s.value}
            onPress={() => onChange(s.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={s.count === undefined ? s.label : `${s.label}, ${s.count}`}
            style={[styles.segment, selected && styles.selected]}>
            <Text style={[selected ? Type.labelStrong : Type.label, Numeric, { color: selected ? Colors.ink : Colors.graphite }]} numberOfLines={1}>
              {s.label}
              {s.count !== undefined && ` ${s.count}`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.ruleSoft,
    borderRadius: Radius.medium,
    padding: 3,
    minHeight: MinTarget,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium - 3,
    paddingHorizontal: 6,
  },
  selected: {
    backgroundColor: Colors.sheet,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
