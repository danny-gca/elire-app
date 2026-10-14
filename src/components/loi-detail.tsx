import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { reportIssueUrl } from '@/constants/app';
import { Colors, Numeric, Spacing, Type } from '@/constants/theme';
import { CHAMBRE_LABELS, NATURE_LABELS, STATUT_LABELS, formatDate } from '@/lib/format';
import type { Loi } from '@/schemas/dataset';

interface LoiDetailProps {
  loi: Loi;
  /** Avant le vote : ni titre officiel ni résultat. */
  anonymous?: boolean;
}

function domainOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, '');
}

// Contenu de la feuille « texte et source » d'un scrutin.
export function LoiDetail({ loi, anonymous = false }: LoiDetailProps) {
  const report = reportIssueUrl(loi.ref, anonymous ? loi.question : loi.titre);

  return (
    <View style={styles.root}>
      <Text style={[Type.bodyStrong, styles.ink]}>{loi.question}</Text>
      <Text style={[Type.body, styles.soft]}>{loi.enjeu}</Text>

      <View style={styles.block}>
        <Text style={[Type.labelStrong, styles.muted]}>Le texte voté</Text>
        {!anonymous && <Text style={[Type.body, styles.soft]}>{loi.titre}</Text>}
        <Text style={[Type.label, Numeric, styles.muted]}>
          {NATURE_LABELS[loi.nature]} · {CHAMBRE_LABELS[loi.chambre]} · {formatDate(loi.dateVote)} · {loi.ref}
          {anonymous ? '' : ` · ${STATUT_LABELS[loi.statut]}`}
        </Text>
      </View>

      {anonymous && (
        <Text style={[Type.label, styles.muted]}>
          Le résultat et les votes des candidats s’affichent après votre vote. La page officielle les montre déjà.
        </Text>
      )}

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
