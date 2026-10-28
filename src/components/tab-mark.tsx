import { StyleSheet, View } from 'react-native';

import { Markers, type MarkerId } from '@/constants/theme';

// L'onglet actif : son libellé est surligné de biais avec le feutre du lecteur (barre du bas, onglets des feuilles).
export function TabMark({ marker }: { marker: MarkerId }) {
  return <View style={[styles.mark, { backgroundColor: Markers[marker].soft }]} />;
}

const styles = StyleSheet.create({
  mark: {
    position: 'absolute',
    top: 6,
    bottom: -1,
    left: -5,
    right: -5,
    borderRadius: 3,
    transform: [{ rotate: '-3deg' }],
  },
});
