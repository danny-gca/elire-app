import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { CandidateAvatar } from '@/components/candidate-avatar';
import { RELIABILITY_LABELS, ReliabilityMark } from '@/components/reliability-mark';
import { Colors, Numeric, Spacing, Type } from '@/constants/theme';
import { plural } from '@/lib/format';
import type { CandidateScore } from '@/lib/scoring';

interface CandidatePanelProps {
  entry: CandidateScore;
  /** Rang affiché dans le carré noir, absent hors classement. */
  rank?: number;
  /** Même score qu'un autre candidat classé. */
  tied?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Panneau électoral : le même mobilier pour chaque candidat, seul le score change.
export function CandidatePanel({ entry, rank, tied = false, style }: CandidatePanelProps) {
  const router = useRouter();
  const { candidat, score, totalVotes, reliability } = entry;
  const scoreText = score === null ? 'Pas encore évalué' : `${score} %`;
  const basis = `${tied ? 'ex æquo, ' : ''}${totalVotes > 0 ? `sur ${plural(totalVotes, 'vote')}` : 'aucun vote'}`;

  return (
    <Pressable
        onPress={() => router.push(`/candidate/${candidat.id}`)}
        accessibilityRole="link"
        accessibilityLabel={`${rank ? `Rang ${rank}, ` : ''}${candidat.nom}, ${candidat.parti}, ${scoreText}, ${basis}${reliability ? `, score ${RELIABILITY_LABELS[reliability]}` : ''}`}
        style={({ pressed }) => [styles.panel, style, pressed && { backgroundColor: Colors.pressed }]}>
        <View style={[styles.number, !rank && styles.numberEmpty]}>
          <Text style={[Type.labelStrong, Numeric, { color: rank ? Colors.sheet : Colors.graphite }]}>{rank ?? '–'}</Text>
        </View>
        <CandidateAvatar candidat={candidat} size={56} />
        <Text style={[Type.labelStrong, styles.name]}>
          {candidat.nom}
        </Text>
        <Text style={[Type.label, styles.muted]}>
          {candidat.parti}
        </Text>
        <View style={styles.scoreBlock}>
          <Text style={[score === null ? Type.label : Type.bodyStrong, Numeric, styles.center, { color: score === null ? Colors.graphite : Colors.ink }]}>
            {scoreText}
          </Text>
          {score !== null && <Text style={[Type.label, Numeric, styles.muted]}>{basis}</Text>}
          {reliability && <ReliabilityMark level={reliability} />}
        </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    minWidth: 0,
    backgroundColor: Colors.sheet,
    borderRadius: 2,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
    alignItems: 'center',
    gap: Spacing.half,
    minHeight: 196,
  },
  number: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 28,
    height: 28,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberEmpty: {
    backgroundColor: Colors.ruleSoft,
  },
  name: {
    color: Colors.ink,
    textAlign: 'center',
    marginTop: Spacing.half,
  },
  muted: {
    color: Colors.graphite,
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
  scoreBlock: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: Spacing.half,
    paddingTop: Spacing.one,
  },
});
