import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Marked } from '@/components/marked';
import { PositionMark, YourVoteMark } from '@/components/your-vote-mark';
import { Colors, Numeric, Radius, Spacing, Type } from '@/constants/theme';
import { POSITION_LABELS, STATUT_LABELS, formatDate } from '@/lib/format';
import type { LoiVoteValue } from '@/lib/scoring';
import type { Loi } from '@/schemas/dataset';
import { getCandidat } from '@/services/dataset';
import { useMarkOf } from '@/store/votes-store';

interface LoiCardProps {
  loi: Loi;
  /** Sur une fiche candidat : sa position, en une étiquette courte. */
  candidatId?: string;
  /** Vote de l'utilisateur sur ce scrutin. */
  userVote?: LoiVoteValue;
  /** Ouvre la feuille du scrutin (positions, source, modification du vote). */
  onPress: () => void;
}

// Carte de liste allégée : le détail s'ouvre dans une feuille, comme une proposition.
export function LoiCard({ loi, candidatId, userVote, onPress }: LoiCardProps) {
  const marker = useMarkOf(loi.id);
  const focusVote = candidatId ? loi.votes[candidatId] : undefined;
  const voters = Object.keys(loi.votes).length;

  const candidat = candidatId ? getCandidat(candidatId) : undefined;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint="Voir les positions, votre vote et la source"
      style={({ pressed }) => [styles.card, pressed && { backgroundColor: Colors.pressed }]}>
      {/* Titre, et votre vote dans l'angle. */}
      <View style={styles.line}>
        <Marked active={!!userVote} marker={marker} style={[Type.bodyStrong, styles.ink, styles.grow]} numberOfLines={3}>
          {loi.titre}
        </Marked>
        {userVote && <YourVoteMark id={loi.id} loiVote={userVote} />}
      </View>
      {/* Sur une fiche : le candidat, comment il a voté, et sa position marquée comme la vôtre (en neutre). */}
      {focusVote ? (
        <View style={styles.line}>
          <View style={[styles.focus, styles.grow]}>
            <Ionicons name={focusVote.typeVote === 'groupe_parti' ? 'people' : 'person'} size={14} color={Colors.ink} />
            <Text style={[Type.labelStrong, styles.ink, styles.grow]} numberOfLines={2}>
              {candidat?.nom ?? ''} · <Text style={styles.muted}>{focusVote.typeVote === 'groupe_parti' ? 'vote de son groupe' : 'vote personnel'}</Text>
            </Text>
          </View>
          <PositionMark label={POSITION_LABELS[focusVote.position]} />
        </View>
      ) : (
        <Text style={[Type.label, Numeric, styles.muted]}>{voters > 1 ? `${voters} candidats ont voté` : 'Un candidat a voté'}</Text>
      )}
      <View style={styles.line}>
        <Text style={[Type.label, Numeric, styles.muted, styles.grow]}>
          {loi.ref} · <Text style={[Type.labelStrong, styles.ink]}>{STATUT_LABELS[loi.statut]}</Text> · {formatDate(loi.dateVote)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.graphite} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    paddingVertical: 12,
    paddingLeft: Spacing.two,
    paddingRight: 12,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
  },
  focus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ink: {
    color: Colors.ink,
  },
  muted: {
    color: Colors.graphite,
  },
});
