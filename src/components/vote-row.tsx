import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { CandidateAvatar } from '@/components/candidate-avatar';
import { Badge } from '@/components/ui/badge';
import { Colors, Spacing, Type } from '@/constants/theme';
import { POSITION_LABELS } from '@/lib/format';
import type { Candidat, VoteCandidatLoi } from '@/schemas/dataset';

/** Avatar 36 + écart 12 : les détails s'alignent sous le nom. */
export const VOTE_ROW_INDENT = 48;

interface VoteRowProps {
  vote: VoteCandidatLoi;
  /** Absent sur la fiche candidat, où le candidat est déjà connu. */
  candidat?: Candidat;
}

// Position d'un candidat sur un scrutin, en distinguant vote personnel et position de son groupe.
// « A voté pour. » redit l'étiquette à droite : seule une explication qui apporte quelque chose s'affiche.
const REPEATS_TAG = /^(a voté (pour|contre)( au congrès)?|s'est abstenue?)\.?$/i;

export function VoteRow({ vote, candidat }: VoteRowProps) {
  const groupe = vote.typeVote === 'groupe_parti';
  const typeLabel = groupe ? `Vote de son groupe${vote.groupe ? ` ${vote.groupe}` : ''}` : 'Vote personnel';
  // Position neutre : les couleurs d'échelle sont réservées aux votes de l'utilisateur.
  const badge = <Badge label={POSITION_LABELS[vote.position]} color={{ fg: Colors.ink, bg: Colors.ruleSoft }} />;

  return (
    <View style={styles.row}>
      {candidat ? (
        <View style={styles.head}>
          <Link href={`/candidate/${candidat.id}`} asChild>
            <Pressable style={styles.who} accessibilityRole="link" accessibilityLabel={`${candidat.nom}, ${candidat.parti}`}>
              <CandidateAvatar candidat={candidat} size={36} />
              <View style={styles.whoText}>
                <Text style={[Type.bodyStrong, styles.ink]}>{candidat.nom}</Text>
                <Text style={[Type.label, styles.muted]}>{candidat.parti}</Text>
              </View>
            </Pressable>
          </Link>
          {badge}
        </View>
      ) : (
        badge
      )}
      <View style={[styles.details, candidat && styles.indent]}>
        <View style={styles.type}>
          <Ionicons name={groupe ? 'people' : 'person'} size={14} color={Colors.ink} />
          <Text style={[Type.labelStrong, styles.ink]}>{typeLabel}</Text>
        </View>
        {vote.explication && !REPEATS_TAG.test(vote.explication) && (
          <Text style={[Type.label, styles.soft]} selectable>
            {vote.explication}
          </Text>
        )}
        <Pressable onPress={() => Linking.openURL(vote.sourceUrl)} accessibilityRole="link" hitSlop={8} style={styles.link}>
          <Text style={[Type.label, styles.muted, styles.underline]}>Voir le scrutin officiel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.one,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  who: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  whoText: {
    flex: 1,
  },
  details: {
    gap: 2,
  },
  indent: {
    paddingLeft: VOTE_ROW_INDENT,
  },
  type: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  link: {
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
    textDecorationColor: Colors.graphite,
  },
});
