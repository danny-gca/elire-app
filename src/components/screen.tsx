import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';

// Fond papier, colonne centrée, gouttière de 16 pt.
export function Screen({
  children,
  scroll = true,
  scrollRef,
  backdrop,
  footer,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  scrollRef?: React.Ref<ScrollView>;
  /** Décor fixe derrière le contenu (ne défile pas). */
  backdrop?: React.ReactNode;
  /** Bandeau fixe en bas, au-dessus de la barre d'onglets (le contenu défile au-dessus). */
  footer?: React.ReactNode;
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {backdrop}
      {scroll ? (
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.scroll, footer ? styles.scrollDocked : null]} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.column, styles.fill]}>{children}</View>
      )}
      {footer && (
        <View style={styles.footer}>
          <View style={styles.column}>{footer}</View>
        </View>
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
  // Le bandeau prend la place de la barre d'onglets en bas du défilement.
  scrollDocked: {
    paddingBottom: Spacing.three,
  },
  // Android et le web posent l'écran au-dessus des onglets ; sur iOS, ils le recouvrent.
  footer: {
    backgroundColor: Colors.paper,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.one + (Platform.OS === 'ios' ? BottomTabInset : 0),
  },
  column: screenStyles.column,
  fill: {
    flex: 1,
  },
});
