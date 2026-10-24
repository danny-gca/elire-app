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
  /** Ouverture pilotée par la feuille (qui déplie alors la citation). */
  open?: boolean;
  onToggle?: (open: boolean) => void;
  /** Le texte vient de s'afficher (mis en page) : l'écran peut défiler jusqu'à lui. */
  onOpen?: () => void;
  /** Type de source (« Programme 2027 »...), au-dessus du contexte : il ne trahit pas l'auteur. */
  source?: string;
}

// « En savoir plus » : le glossaire des sigles de la feuille, puis le contexte. Aucune source : elle trahirait l'auteur.
export function MoreInfo({ text, terms, open: controlled, onToggle, onOpen, source }: MoreInfoProps) {
  const [own, setOwn] = useState(false);
  const open = controlled ?? own;
  const setOpen = (next: boolean) => (onToggle ? onToggle(next) : setOwn(next));
  const entries = acronymsIn(...terms).flatMap((s) => bySigle.get(s) ?? []);
  return (
    <View style={styles.root}>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityHint={`${onToggle ? 'Déplie la citation, affiche ' : 'Affiche '}${entries.length > 0 ? 'les sigles expliqués et le contexte' : 'le contexte'}`}
        style={styles.toggle}>
        <Text style={[Type.labelStrong, styles.underline]}>En savoir plus</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.graphite} />
      </Pressable>
      {open && (
        <Animated.View entering={FadeIn.duration(180)} style={styles.body} onLayout={onOpen}>
          {entries.length > 0 && (
            <View style={styles.glossary}>
              <Text style={[Type.labelStrong, styles.muted]} accessibilityRole="header">
                Glossaire
              </Text>
              {entries.map((g) => (
                <Text key={g.sigle} style={[Type.label, styles.soft]} selectable>
                  <Text style={[Type.labelStrong, styles.ink]}>{g.sigle}</Text> : {g.forme}
                  {g.definition ? `. ${g.definition}` : '.'}
                </Text>
              ))}
            </View>
          )}
          {source && <Text style={[Type.labelStrong, styles.muted]}>{source}</Text>}
          <Text style={[Type.body, styles.soft]} selectable>
            {text}
          </Text>
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
