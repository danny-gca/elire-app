import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, MARKER_IDS, Markers, MinTarget, Radius, Spacing, Type } from '@/constants/theme';
import { useVotesStore } from '@/store/votes-store';

// Les quatre surligneurs du lecteur, en grille 2 × 2 : un trait, son nom. En compact (en-tête de Voter) : les quatre traits seuls.
export function MarkerPicker({ compact = false }: { compact?: boolean }) {
  const marker = useVotesStore((s) => s.marker);
  const setMarker = useVotesStore((s) => s.setMarker);

  if (compact) {
    return (
      <View style={styles.compact} accessibilityRole="radiogroup" accessibilityLabel="Votre surligneur">
        {MARKER_IDS.map((id) => {
          const selected = id === marker;
          return (
            <Pressable
              key={id}
              onPress={() => setMarker(id)}
              accessibilityRole="radio"
              accessibilityLabel={`Surligneur ${Markers[id].label.toLowerCase()}`}
              accessibilityState={{ selected }}
              style={({ pressed }) => [styles.swatch, selected && styles.swatchSelected, pressed && { backgroundColor: Colors.pressed }]}>
              <View style={[styles.compactStroke, { backgroundColor: Markers[id].soft }]} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Votre surligneur">
      {MARKER_IDS.map((id) => {
        const selected = id === marker;
        return (
          <Pressable
            key={id}
            onPress={() => setMarker(id)}
            accessibilityRole="radio"
            accessibilityLabel={`Surligneur ${Markers[id].label.toLowerCase()}`}
            accessibilityState={{ selected }}
            style={({ pressed }) => [styles.option, selected && styles.selected, pressed && { backgroundColor: Colors.pressed }]}>
            <View style={[styles.stroke, { backgroundColor: Markers[id].soft }]} />
            <Text style={[selected ? Type.bodyStrong : Type.body, styles.ink]}>{Markers[id].label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  option: {
    flexBasis: '45%',
    flexGrow: 1,
    minHeight: MinTarget + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Colors.rule,
    backgroundColor: Colors.sheet,
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  // Un trait posé à la main, légèrement de biais.
  stroke: {
    width: 40,
    height: 14,
    borderRadius: 3,
    transform: [{ rotate: '-6deg' }],
  },
  compact: {
    flexDirection: 'row',
    gap: 2,
  },
  swatch: {
    width: 40,
    height: MinTarget,
    borderRadius: Radius.medium,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderColor: Colors.ink,
  },
  compactStroke: {
    width: 24,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: '-6deg' }],
  },
  ink: {
    color: Colors.ink,
  },
});
