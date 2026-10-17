import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CandidateAvatar } from '@/components/candidate-avatar';
import { RELIABILITY_LABELS, ReliabilityMark } from '@/components/reliability-mark';
import { Colors, Numeric, Spacing, Type } from '@/constants/theme';
import { plural } from '@/lib/format';
import type { CandidateScore } from '@/lib/scoring';
import { useTutoTarget } from '@/store/tuto-store';

interface CandidatePanelProps {
  entry: CandidateScore;
  /** Rang écrit en haut à gauche de la fiche, absent hors classement. */
  rank?: number;
  /** Même score qu'un autre candidat classé. */
  tied?: boolean;
  style?: StyleProp<ViewStyle>;
  /** La fiche que le tuto entoure. */
  tutoTarget?: string;
}

// Ruban adhésif mat, bouts dentelés comme déchirés à la main : le même, au même endroit, sur chaque fiche.
const TAPE_W = 46;
const TAPE_H = 16;
const TEETH = 4;
const TAPE_PATH = (() => {
  const step = TAPE_H / TEETH;
  const right = Array.from({ length: TEETH }, (_, i) => `L${TAPE_W - (i % 2 ? 0 : 2.5)} ${step * (i + 0.5)}L${TAPE_W} ${step * (i + 1)}`).join('');
  const left = Array.from({ length: TEETH }, (_, i) => `L${i % 2 ? 0 : 2.5} ${TAPE_H - step * (i + 0.5)}L0 ${TAPE_H - step * (i + 1)}`).join('');
  return `M0 0H${TAPE_W}${right}H0${left}Z`;
})();

// Une fiche épinglée dans le cahier : le même mobilier pour chaque candidat ; seul l'anneau du portrait prend la couleur du parti, jamais le score.
export function CandidatePanel({ entry, rank, tied = false, style, tutoTarget }: CandidatePanelProps) {
  const router = useRouter();
  const target = useTutoTarget(tutoTarget ?? '');
  const { candidat, score, totalVotes, reliability } = entry;
  const scoreText = score === null ? 'Pas encore évalué' : `${score} %`;
  const basis = totalVotes > 0 ? `sur ${plural(totalVotes, 'vote')}` : 'aucun vote';

  return (
    <Pressable
      {...(tutoTarget ? target : {})}
      onPress={() => router.push(`/candidate/${candidat.id}`)}
      accessibilityRole="link"
      accessibilityLabel={`${rank ? `Rang ${rank}${tied ? ' ex æquo' : ''}, ` : ''}${candidat.nom}, ${candidat.parti}, ${scoreText}, ${basis}${reliability ? `, score ${RELIABILITY_LABELS[reliability]}` : ''}`}
      style={({ pressed }) => [styles.card, style, pressed && { backgroundColor: Colors.pressed }]}>
      <Svg width={TAPE_W} height={TAPE_H} style={styles.tape} pointerEvents="none">
        <Path d={TAPE_PATH} fill={TAPE} />
      </Svg>
      {rank !== undefined && (
        // Le rang noté à l'encre, comme dans la marge, et « ex æquo » à côté s'il est partagé.
        <View style={styles.rank} accessibilityElementsHidden importantForAccessibility="no">
          <Text style={[Type.display, Numeric, styles.rankText]}>{rank}</Text>
          {tied && <Text style={[Type.label, styles.tie]}>ex æquo</Text>}
        </View>
      )}
      <CandidateAvatar candidat={candidat} size={56} ring={candidat.couleurParti} />
      <Text style={[Type.labelStrong, styles.name]} numberOfLines={2}>
        {candidat.nom}
      </Text>
      <Text style={[Type.label, styles.muted]} numberOfLines={1}>
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

// Ruban translucide : le quadrillage se devine à travers, la fiche reste blanche dessous.
const TAPE = 'rgba(176, 184, 192, 0.42)';

const styles = StyleSheet.create({
  card: {
    minWidth: 0,
    backgroundColor: Colors.sheet,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    paddingTop: 36,
    paddingBottom: 12,
    paddingHorizontal: Spacing.one,
    alignItems: 'center',
    gap: Spacing.half,
  },
  tape: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    transform: [{ rotate: '-3deg' }],
  },
  rank: {
    position: 'absolute',
    top: 6,
    left: 9,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  rankText: {
    fontSize: 22,
    lineHeight: 26,
    color: Colors.ink,
  },
  tie: {
    color: Colors.graphite,
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
