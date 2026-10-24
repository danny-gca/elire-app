import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import type { LegalSection } from '@/constants/legal';
import { Colors, MinTarget, Spacing, Type } from '@/constants/theme';

// Page de texte à sections (mentions légales, corrections), avec retour.
export function LegalPage({
  title,
  note,
  sections,
  action,
}: {
  title: string;
  note: string;
  sections: LegalSection[];
  action?: { label: string; url: string };
}) {
  const router = useRouter();
  return (
    <Screen>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.ink} />
      </Pressable>
      <ScreenHeader title={title} note={note} />
      {sections.map((section) => (
        <View key={section.titre} style={styles.section}>
          <Text style={[Type.bodyStrong, styles.ink]} accessibilityRole="header">
            {section.titre}
          </Text>
          {section.paragraphes.map((p) => (
            <Text key={p} style={[Type.body, styles.ink]} selectable>
              {p}
            </Text>
          ))}
        </View>
      ))}
      {action && (
        <Pressable onPress={() => Linking.openURL(action.url)} accessibilityRole="link" hitSlop={8} style={styles.action}>
          <Text style={[Type.labelStrong, styles.link]}>{action.label}</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: MinTarget,
    height: MinTarget,
    marginLeft: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    gap: Spacing.one,
    marginTop: Spacing.three,
    maxWidth: 640,
  },
  action: {
    marginTop: Spacing.three,
  },
  ink: {
    color: Colors.ink,
  },
  link: {
    color: Colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.graphite,
  },
});
