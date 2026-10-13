import { Link } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { CandidateAvatar } from '@/components/candidate-avatar';
import { Badge } from '@/components/ui/badge';
import { Colors, Spacing, Type } from '@/constants/theme';
import { POSITION_LABELS } from '@/lib/format';
import type { Candidat, VoteCandidatLoi } from '@/schemas/dataset';

interface VoteRowProps {
  vote: VoteCandidatLoi;
  /** Absent sur la fiche candidat, où le candidat est déjà connu. */
  candidat?: Candidat;
}

// Position d'un candidat sur un scrutin, en distinguant vote personnel et position de son groupe.
export function VoteRow({ vote, candidat }: VoteRowProps) {
  const groupe = vote.typeVote === 'groupe_parti';
  const typeLabel = groupe ? `Position du groupe ${vote.groupe ?? candidat?.parti ?? ''}, pas un vote personnel` : 'Vote personnel';

  return (
    <View style={styles.row}>
      <View style={styles.head}>
        {candidat && (
          <Link href={`/candidate/${candidat.id}`} asChild>
            <Pressable style={styles.who} accessibilityRole="link" accessibilityLabel={`${candidat.nom}, ${candidat.parti}`}>
              <CandidateAvatar candidat={candidat} size={36} />
              <View style={styles.whoText}>
                <Text style={[Type.bodyStrong, styles.ink]}>{candidat.nom}</Text>
                <Text style={[Type.label, styles.muted]}>{candidat.parti}</Text>
              </View>
            </Pressable>
          </Link>
        )}
        {/* Position neutre : les couleurs d'échelle sont réservées aux votes de l'utilisateur. */}
        <Badge label={POSITION_LABELS[vote.position]} color={{ fg: Colors.ink, bg: Colors.ruleSoft }} style={styles.badge} />
      </View>
      <Text style={[Type.labelStrong, { color: groupe ? Colors.graphite : Colors.ink }]}>{typeLabel}</Text>
      {vote.explication && <Text style={[Type.body, styles.soft]}>{vote.explication}</Text>}
      <Pressable onPress={() => Linking.openURL(vote.sourceUrl)} accessibilityRole="link" hitSlop={8} style={styles.link}>
        <Text style={[Type.labelStrong, styles.ink, styles.underline]}>Voir le scrutin officiel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.half,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
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
  badge: {
    alignSelf: 'center',
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
