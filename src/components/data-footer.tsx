import { Link } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { reportIssueUrl } from '@/constants/app';
import { Colors, Numeric, Spacing, Type } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import { metadata } from '@/services/dataset';

// Traçabilité : date des données et signalement d'erreur.
export function DataFooter() {
  const report = reportIssueUrl();
  return (
    <View style={styles.root}>
      <Text style={[Type.label, Numeric, styles.muted]}>
        Données du {formatDate(metadata.generatedAt.slice(0, 10))} · {metadata.propositionsCount} propositions ·{' '}
        {metadata.loisCount} scrutins. Tout reste sur votre appareil.
      </Text>
      {report && (
        <Pressable onPress={() => Linking.openURL(report)} accessibilityRole="link" hitSlop={8}>
          <Text style={[Type.labelStrong, styles.link]}>Signaler une erreur</Text>
        </Pressable>
      )}
      <Link href="/corrections" asChild>
        <Pressable accessibilityRole="link" hitSlop={8}>
          <Text style={[Type.labelStrong, styles.link]}>Méthode et corrections</Text>
        </Pressable>
      </Link>
      <Link href="/mentions-legales" asChild>
        <Pressable accessibilityRole="link" hitSlop={8}>
          <Text style={[Type.labelStrong, styles.link]}>Mentions légales</Text>
        </Pressable>
      </Link>
      <Link href="/credits" asChild>
        <Pressable accessibilityRole="link" hitSlop={8}>
          <Text style={[Type.labelStrong, styles.link]}>Crédits</Text>
        </Pressable>
      </Link>
      <Link href="/onboarding" asChild>
        <Pressable accessibilityRole="link" hitSlop={8}>
          <Text style={[Type.labelStrong, styles.link]}>Revoir la présentation</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.one,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  muted: {
    color: Colors.graphite,
  },
  link: {
    color: Colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.graphite,
  },
});
