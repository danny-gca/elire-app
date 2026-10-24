import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Marked } from '@/components/marked';
import { YourVoteMark } from '@/components/your-vote-mark';
import { Colors, Numeric, Spacing, Type, type MarkerId } from '@/constants/theme';
import { voteTarget } from '@/lib/enjeux';
import { UNSURE, type VoteValue } from '@/lib/scoring';
import type { Proposition } from '@/schemas/dataset';
import { getEnjeu } from '@/services/dataset';
import { useMarkOf } from '@/store/votes-store';

interface PropositionRowProps {
  proposition: Proposition;
  vote?: VoteValue;
  author?: string;
  onPress: () => void;
  /** Libellé d'action pour les lecteurs d'écran. */
  actionHint?: string;
  /** Surligneur imposé (exemples de l'onboarding) ; sinon celui du vote. */
  marker?: MarkerId;
}

// Titre surligné si voté, numéro et auteur dessous ; votre note dans l'angle, au surligneur.
export function PropositionRow({ proposition, vote, author, onPress, actionHint = 'Voir le détail et la source', marker: forced }: PropositionRowProps) {
  const voted = vote !== undefined;
  const own = useMarkOf(voteTarget(proposition).key);
  const marker = forced ?? own;
  const shared = proposition.enjeuId ? (getEnjeu(proposition.enjeuId)?.positions.length ?? 1) - 1 : 0;
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
        <Text style={[Type.label, Numeric, styles.muted]}>
          {proposition.ref}
          {voted ? '' : ' · Pas encore voté'}
          {author ? ` · ${author}` : ''}
          {shared > 0 ? ` · Question partagée avec ${shared} ${shared > 1 ? 'candidats' : 'candidat'}` : ''}
        </Text>
      </View>
      <View style={[styles.side, voted && styles.sideVoted]}>
        {voted && <YourVoteMark id={proposition.id} vote={vote} marker={marker} />}
        <Ionicons name="chevron-forward" size={16} color={Colors.graphite} />
      </View>
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
  // Colonne de droite : votre vote dans l'angle haut, le chevron en bas.
  side: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  sideVoted: {
    justifyContent: 'space-between',
  },
  muted: {
    color: Colors.graphite,
  },
});
