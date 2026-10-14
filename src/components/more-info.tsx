import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Colors, Radius, Spacing, Type } from '@/constants/theme';
import { acronymsIn } from '@/lib/glossary';
import { glossaire } from '@/services/dataset';

const bySigle = new Map(glossaire.map((g) => [g.sigle, g]));

interface MoreInfoProps {
  /** Contexte de la proposition ou enjeu du scrutin, caché par défaut. */
  text: string;
  /** Textes affichés sur la feuille : leurs sigles passent au glossaire. */
  terms: string[];
}

// « En savoir plus » : le glossaire des sigles de la feuille, puis le contexte. Aucune source : elle trahirait l'auteur.
export function MoreInfo({ text, terms }: MoreInfoProps) {
  const [open, setOpen] = useState(false);
  const entries = acronymsIn(...terms).flatMap((s) => bySigle.get(s) ?? []);
  return (
    <View style={styles.root}>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityHint={entries.length > 0 ? 'Affiche les sigles expliqués et le contexte' : 'Affiche le contexte'}
        style={styles.toggle}>
        <Text style={[Type.labelStrong, styles.underline]}>En savoir plus</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.graphite} />
      </Pressable>
      {open && (
        <Animated.View entering={FadeIn.duration(180)} style={styles.body}>
          {entries.length > 0 && (
            <View style={styles.glossary}>
              <Text style={[Type.labelStrong, styles.muted]} accessibilityRole="header">
                Glossaire
              </Text>
              {entries.map((g) => (
                <Text key={g.sigle} style={[Type.label, styles.soft]}>
                  <Text style={[Type.labelStrong, styles.ink]}>{g.sigle}</Text> : {g.forme}
                  {g.definition ? `. ${g.definition}` : '.'}
                </Text>
              ))}
            </View>
          )}
          <Text style={[Type.body, styles.soft]}>{text}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  toggle: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  body: {
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  glossary: {
    gap: Spacing.half,
    padding: 12,
    borderRadius: Radius.medium,
    backgroundColor: Colors.paper,
  },
  ink: {
    color: Colors.ink,
  },
  soft: {
    color: Colors.inkSoft,
  },
  muted: {
    color: Colors.graphite,
  },
  underline: {
    color: Colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.graphite,
  },
});
