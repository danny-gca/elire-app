import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Marked } from '@/components/marked';
import { VoteTag } from '@/components/vote-tag';
import { Colors, Numeric, Spacing, Type } from '@/constants/theme';
import { UNSURE, type VoteValue } from '@/lib/scoring';
import type { Proposition } from '@/schemas/dataset';
import { useMarkOf } from '@/store/votes-store';

interface PropositionRowProps {
  proposition: Proposition;
  vote?: VoteValue;
  author?: string;
  onPress: () => void;
  /** Libellé d'action pour les lecteurs d'écran. */
  actionHint?: string;
}

// Titre surligné si voté, puis numéro, votre note et l'auteur sur une ligne.
export function PropositionRow({ proposition, vote, author, onPress, actionHint = 'Voir le détail et la source' }: PropositionRowProps) {
  const voted = vote !== undefined;
  const marker = useMarkOf(proposition.id);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint={actionHint}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: Colors.pressed }]}>
      <View style={styles.body}>
        <Marked active={voted && vote !== UNSURE} marker={marker} style={[Type.body, styles.title]}>
          {proposition.titre}
        </Marked>
        <View style={styles.meta}>
          <Text style={[Type.label, Numeric, styles.muted]}>{proposition.ref} ·</Text>
          {voted ? <VoteTag value={vote} /> : <Text style={[Type.label, styles.muted]}>Pas encore voté</Text>}
          {author && <Text style={[Type.label, styles.muted]}>· {author}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.graphite} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: Colors.sheet,
    minHeight: 64,
    paddingVertical: 12,
    paddingLeft: Spacing.two,
    paddingRight: 12,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    color: Colors.ink,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    flexWrap: 'wrap',
  },
  muted: {
    color: Colors.graphite,
  },
});
