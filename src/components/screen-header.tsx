import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Type } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  /** Une ligne d'explication sous le titre. */
  note?: string;
  accessory?: React.ReactNode;
}

export function ScreenHeader({ title, note, accessory }: ScreenHeaderProps) {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={[Type.screenTitle, styles.title]} accessibilityRole="header">
          {title}
        </Text>
        {accessory}
      </View>
      {note && <Text style={[Type.label, styles.note]}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
    gap: Spacing.half,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    color: Colors.ink,
    flexShrink: 1,
  },
  note: {
    color: Colors.graphite,
  },
});
