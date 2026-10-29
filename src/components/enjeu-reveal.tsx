import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { PageVeil } from '@/components/page-veil';
import { PositionMark } from '@/components/your-vote-mark';
import { Colors, MinTarget, Radius, Spacing, Type } from '@/constants/theme';
import { enjeuTally, tallyText } from '@/lib/enjeux';
import { TYPE_SOURCE_LABELS } from '@/lib/format';
import { UNSURE, type VoteValue } from '@/lib/scoring';
import type { Enjeu, Proposition } from '@/schemas/dataset';
import { propositions } from '@/services/dataset';

const byId = new Map(propositions.map((p) => [p.id, p]));
const refNumber = (ref: string) => Number(ref.replace(/\D/g, ''));

// Après le vote d'une question commune : qui pense comme vous, puis chaque mesure, sans nom ni parti (le vote reste à l'aveugle).
// `onOpen` : chaque mesure se touche pour ouvrir sa fiche (feuille de la gomme).
export function EnjeuReveal({
  enjeu,
  value,
  veil,
  bound = false,
  onOpen,
}: {
  enjeu: Enjeu;
  value: VoteValue;
  veil?: SharedValue<number>;
  bound?: boolean;
  onOpen?: (proposition: Proposition) => void;
}) {
  if (value === UNSURE) {
    return (
      <View style={[styles.root, bound && styles.bound]}>
        <Text style={[Type.body, styles.soft]}>Je ne sais pas : cette question ne change aucun score.</Text>
        <PageVeil turn={veil} bound={bound} />
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
    <View style={[styles.root, bound && styles.bound]}>
      <Text style={[Type.bodyStrong, styles.ink]} accessibilityRole="header">
        {tallyText(enjeuTally(enjeu, value))}
      </Text>
      {rows.map(({ p, agree }) => {
        const mark = agree ? 'comme vous' : 'à l’inverse';
        // La marque sur la ligne du type de source : le titre garde toute la largeur.
        const content = (
          <View style={styles.text}>
            <View style={styles.head}>
              <Text style={[Type.label, styles.muted, styles.flex]}>Une mesure · {TYPE_SOURCE_LABELS[p.typeSource]}</Text>
              <PositionMark label={mark} />
            </View>
            <View style={styles.head}>
              <Text style={[Type.body, styles.ink, styles.flex]}>{p.titre}</Text>
              {onOpen && <Ionicons name="chevron-forward" size={16} color={Colors.graphite} />}
            </View>
          </View>
        );
        return onOpen ? (
          <Pressable
            key={p.id}
            onPress={() => onOpen(p)}
            accessibilityRole="button"
            accessibilityLabel={`${p.titre}, ${mark}`}
            accessibilityHint="Ouvre la fiche de la mesure, sans son auteur"
            style={({ pressed }) => [styles.row, styles.openable, pressed && styles.pressed]}>
            {content}
          </Pressable>
        ) : (
          <View key={p.id} style={styles.row}>
            {content}
          </View>
        );
      })}
      <PageVeil turn={veil} bound={bound} />
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
  // Pendant le tour : coins carrés côté reliure.
  bound: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  // Ligne touchable : 44 pt au moins, un peu d'air sous le fond pressé.
  openable: {
    minHeight: MinTarget,
    paddingBottom: Spacing.one,
  },
  pressed: {
    backgroundColor: Colors.pressed,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  flex: {
    flex: 1,
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
