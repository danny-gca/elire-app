import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Markers, MinTarget, Numeric, Radius, Type } from '@/constants/theme';
import { useVotesStore } from '@/store/votes-store';

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
  const marker = useVotesStore((s) => s.marker);
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
            <View style={styles.content}>
              <Text style={[selected ? Type.labelStrong : Type.label, styles.label, { color: selected ? Colors.ink : Colors.graphite }]} numberOfLines={1}>
                {s.label}
              </Text>
              {/* Le nombre en pastille, surlignée sur l'onglet actif. */}
              {s.count !== undefined && (
                <View style={[styles.badge, { backgroundColor: selected ? Markers[marker].soft : Colors.sheet }]}>
                  <Text style={[Type.labelStrong, Numeric, styles.badgeText]}>{s.count}</Text>
                </View>
              )}
            </View>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  label: {
    flexShrink: 1,
  },
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.ink,
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
