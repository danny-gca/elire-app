import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, MARKER_IDS, Markers, MinTarget, Radius, Spacing, Type } from '@/constants/theme';
import { useVotesStore } from '@/store/votes-store';

// Les quatre surligneurs du lecteur, en grille 2 × 2 : un trait, son nom.
export function MarkerPicker() {
  const marker = useVotesStore((s) => s.marker);
  const setMarker = useVotesStore((s) => s.setMarker);

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
  ink: {
    color: Colors.ink,
  },
});
