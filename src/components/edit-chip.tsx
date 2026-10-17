import { StyleSheet, View } from 'react-native';

import { EraserIcon } from '@/components/eraser-icon';
import { Colors, Radius, Spacing } from '@/constants/theme';

// Le vote et la gomme sur une pastille blanche : lisibles sur le surligneur, et signe qu'on peut corriger.
export function EditChip({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.chip}>
      {children}
      <EraserIcon size={18} color={Colors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 28,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.small,
    backgroundColor: Colors.sheet,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
});
