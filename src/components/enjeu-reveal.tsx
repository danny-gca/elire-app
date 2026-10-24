import { StyleSheet, Text, View } from 'react-native';

import { PositionMark } from '@/components/your-vote-mark';
import { Colors, Radius, Spacing, Type } from '@/constants/theme';
import { enjeuTally, tallyText } from '@/lib/enjeux';
import { TYPE_SOURCE_LABELS } from '@/lib/format';
import { UNSURE, type VoteValue } from '@/lib/scoring';
import type { Enjeu } from '@/schemas/dataset';
import { propositions } from '@/services/dataset';

const byId = new Map(propositions.map((p) => [p.id, p]));
const refNumber = (ref: string) => Number(ref.replace(/\D/g, ''));

// Après le vote d'une question commune : qui pense comme vous, puis chaque mesure, sans nom ni parti (le vote reste à l'aveugle).
export function EnjeuReveal({ enjeu, value }: { enjeu: Enjeu; value: VoteValue }) {
  if (value === UNSURE) {
    return (
      <View style={styles.root}>
        <Text style={[Type.body, styles.soft]}>Je ne sais pas : cette question ne change aucun score.</Text>
      </View>
    );
  }
  const rows = enjeu.positions
    .flatMap((pos) => {
      const p = byId.get(pos.propositionId);
      return p ? [{ p, agree: (pos.sens === 'pour') === value > 0 }] : [];
    })
    // Comme vous d'abord, puis par numéro de proposition : un ordre qui ne dit rien de l'auteur.
    .sort((a, b) => Number(b.agree) - Number(a.agree) || refNumber(a.p.ref) - refNumber(b.p.ref));
  return (
    <View style={styles.root}>
      <Text style={[Type.bodyStrong, styles.ink]} accessibilityRole="header">
        {tallyText(enjeuTally(enjeu, value))}
      </Text>
      {rows.map(({ p, agree }) => (
        <View key={p.id} style={styles.row}>
          <View style={styles.text}>
            <Text style={[Type.label, styles.muted]}>Une mesure · {TYPE_SOURCE_LABELS[p.typeSource]}</Text>
            <Text style={[Type.body, styles.ink]}>{p.titre}</Text>
          </View>
          <PositionMark label={agree ? 'comme vous' : 'à l’inverse'} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    backgroundColor: Colors.sheet,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  text: {
    flex: 1,
    gap: 2,
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
