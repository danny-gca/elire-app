import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';

// Fond papier, colonne centrée, gouttière de 16 pt.
export function Screen({
  children,
  scroll = true,
  scrollRef,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  scrollRef?: React.Ref<ScrollView>;
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {scroll ? (
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.column, styles.fill]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export const screenStyles = StyleSheet.create({
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.two,
  },
  listContent: {
    paddingTop: Platform.OS === 'web' ? Spacing.three : 0,
    paddingBottom: BottomTabInset + Spacing.four,
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scroll: {
    paddingTop: Platform.OS === 'web' ? Spacing.three : 0,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  column: screenStyles.column,
  fill: {
    flex: 1,
  },
});
