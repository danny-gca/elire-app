import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { themeIcon } from '@/constants/thematiques';
import { Radius, themeAccent } from '@/constants/theme';

// Pictogramme de thématique (marge de la feuille, en-têtes de section).
export function ThemeMark({ thematiqueId, size = 32 }: { thematiqueId: string; size?: number }) {
  const c = themeAccent(thematiqueId);
  return (
    <View style={[styles.box, { width: size, height: size, backgroundColor: c.tint }]} importantForAccessibility="no-hide-descendants">
      <Ionicons name={themeIcon(thematiqueId)} size={size * 0.56} color={c.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: Radius.small + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
