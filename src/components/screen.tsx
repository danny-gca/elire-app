import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';

// Fond papier, colonne centrée, gouttière de 16 pt.
export function Screen({
  children,
  scroll = true,
  scrollRef,
  backdrop,
  header,
  overlay,
  footer,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  scrollRef?: React.Ref<ScrollView>;
  /** Décor fixe derrière le contenu (ne défile pas). */
  backdrop?: React.ReactNode;
  /** Barre fixe en haut : le contenu défile dessous. */
  header?: React.ReactNode;
  /** Posé en bas, juste au-dessus du bandeau, par-dessus le contenu : il apparaît et disparaît sans rien déplacer. */
  overlay?: React.ReactNode;
  /** Bandeau fixe en bas, au-dessus de la barre d'onglets (le contenu défile au-dessus). */
  footer?: React.ReactNode;
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {backdrop}
      <View style={styles.fill}>
        {header && (
          <View style={styles.header}>
            <View style={styles.column}>{header}</View>
          </View>
        )}
        {scroll ? (
          <ScrollView ref={scrollRef} contentContainerStyle={[styles.scroll, footer ? styles.scrollDocked : null, overlay !== undefined ? styles.scrollUnderOverlay : null]} keyboardShouldPersistTaps="handled">
            <View style={[styles.column, footer ? styles.fill : null]}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[styles.column, styles.fill]}>{children}</View>
        )}
        {overlay && (
          <View pointerEvents="box-none" style={styles.overlay}>
            <View style={styles.column}>{overlay}</View>
          </View>
        )}
      </View>
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
  // Avec un bandeau, la colonne prend toute la hauteur libre : l'écran peut y centrer son contenu.
  scrollDocked: {
    flexGrow: 1,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  // Barre et bandeau sans fond ni filet : le décor de l'écran (la salle d'un scrutin) passe derrière.
  // Toujours la même réserve en bas (affiché ou non) : la fin du texte ne passe pas sous l'avis flottant, et rien ne bouge.
  scrollUnderOverlay: {
    paddingBottom: 64,
  },
  header: {
    paddingTop: Platform.OS === 'web' ? Spacing.two : Spacing.one,
    paddingBottom: Spacing.one,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.one,
  },
  // Android et le web posent l'écran au-dessus des onglets ; sur iOS, ils le recouvrent.
  footer: {
    paddingTop: Spacing.one,
    paddingBottom: Spacing.one + (Platform.OS === 'ios' ? BottomTabInset : 0),
  },
  column: screenStyles.column,
  fill: {
    flex: 1,
  },
});
