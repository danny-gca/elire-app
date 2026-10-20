import { useMemo } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { MyVoteRow } from '@/components/my-vote-row';
import { Button } from '@/components/ui/button';
import { VoteRow } from '@/components/vote-row';
import { reportUrl } from '@/constants/app';
import { Colors, Numeric, Spacing, Type } from '@/constants/theme';
import { CHAMBRE_LABELS, NATURE_LABELS, STATUT_LABELS, formatDate } from '@/lib/format';
import { fisherYates } from '@/lib/shuffle';
import type { Loi, PositionVote } from '@/schemas/dataset';
import { getCandidat } from '@/services/dataset';

const ORDER: Record<PositionVote, number> = { pour: 0, abstention: 1, contre: 2 };

interface LoiDetailProps {
  loi: Loi;
  /** Sur une fiche candidat : sa position d'abord, puis les autres. */
  candidatId?: string;
}

function domainOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, '');
}

// Contenu de la feuille d'un scrutin : le texte, votre vote (modifiable), les positions des candidats, la source.
export function LoiDetail({ loi, candidatId }: LoiDetailProps) {
  const report = reportUrl(loi.ref, loi.titre);
  // Groupés par position ; dans chaque groupe, un ordre tiré au hasard à chaque ouverture : personne n'est toujours en tête.
  const entries = useMemo(
    () =>
      fisherYates(Object.entries(loi.votes)).sort(
        ([a, va], [b, vb]) => Number(b === candidatId) - Number(a === candidatId) || ORDER[va.position] - ORDER[vb.position]
      ),
    [loi, candidatId]
  );

  return (
    <View style={styles.root}>
      <Text style={[Type.bodyStrong, styles.ink]}>{loi.titre}</Text>
      <Text style={[Type.label, Numeric, styles.muted]}>
        {NATURE_LABELS[loi.nature]} · {CHAMBRE_LABELS[loi.chambre]} · {formatDate(loi.dateVote)} · {loi.ref} ·{' '}
        <Text style={[Type.labelStrong, styles.ink]}>{STATUT_LABELS[loi.statut]}</Text>
      </Text>
      <Text style={[Type.body, styles.soft]}>{loi.resume}</Text>

      <View style={styles.block}>
        <Text style={[Type.labelStrong, styles.muted]}>La question posée</Text>
        <Text style={[Type.body, styles.ink]}>{loi.question}</Text>
      </View>

      <View style={styles.block}>
        <Text style={[Type.labelStrong, styles.muted]}>Les votes</Text>
        <MyVoteRow id={loi.id} kind="loi" pendingNote="Pas encore voté : il arrivera dans Voter" />
        {entries.map(([id, v]) => (
          <VoteRow key={id} vote={v} candidat={getCandidat(id)} />
        ))}
      </View>

      <Button
        label={`Ouvrir le scrutin officiel · ${domainOf(loi.sourceOfficielleUrl)}`}
        icon="open-outline"
        onPress={() => Linking.openURL(loi.sourceOfficielleUrl)}
      />
      {report && <Button label="Signaler une erreur" variant="quiet" onPress={() => Linking.openURL(report)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.two,
  },
  block: {
    gap: Spacing.half,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
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
});
