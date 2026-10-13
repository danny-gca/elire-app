import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { VoteRow } from '@/components/vote-row';
import { reportIssueUrl } from '@/constants/app';
import { Colors, Numeric, Radius, Spacing, Type } from '@/constants/theme';
import { CHAMBRE_LABELS, NATURE_LABELS, POSITION_LABELS, STATUT_LABELS, formatDate } from '@/lib/format';
import type { Loi, PositionVote } from '@/schemas/dataset';
import { getCandidat, getThematique } from '@/services/dataset';

const ORDER: Record<PositionVote, number> = { pour: 0, abstention: 1, contre: 2 };

interface LoiCardProps {
  loi: Loi;
  /** Sur une fiche candidat : n'affiche que sa position, toujours visible. */
  candidatId?: string;
}

export function LoiCard({ loi, candidatId }: LoiCardProps) {
  const [open, setOpen] = useState(false);
  const theme = getThematique(loi.thematiqueId);

  const entries = Object.entries(loi.votes).sort(([, a], [, b]) => ORDER[a.position] - ORDER[b.position]);
  const counts = (['pour', 'contre', 'abstention'] as const)
    .map((p) => ({ p, n: entries.filter(([, v]) => v.position === p).length }))
    .filter((c) => c.n > 0)
    .map((c) => `${c.n} ${POSITION_LABELS[c.p].toLowerCase()}`)
    .join(' · ');
  const focusVote = candidatId ? loi.votes[candidatId] : undefined;
  const report = reportIssueUrl(loi.ref, loi.titre);

  return (
    <View style={styles.card}>
      <Text style={[Type.bodyStrong, styles.ink]} accessibilityRole="header">
        {loi.titre}
      </Text>
      <Text style={[Type.label, Numeric, styles.muted]}>
        {loi.ref} · <Text style={[Type.labelStrong, styles.ink]}>{STATUT_LABELS[loi.statut]}</Text>
        {theme ? ` · ${theme.titre}` : ''}
      </Text>
      <Text style={[Type.label, Numeric, styles.muted]}>
        {NATURE_LABELS[loi.nature]} · {CHAMBRE_LABELS[loi.chambre]} · {formatDate(loi.dateVote)}
      </Text>
      <Text style={[Type.body, styles.soft]} numberOfLines={open ? undefined : 2}>
        {loi.resume}
      </Text>

      {focusVote && <VoteRow vote={focusVote} />}

      {!candidatId && (
        <Pressable
          onPress={() => setOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${open ? 'Masquer' : 'Afficher'} les positions des candidats : ${counts}`}
          style={({ pressed }) => [styles.toggle, pressed && { backgroundColor: Colors.pressed }]}>
          <Text style={[Type.labelStrong, Numeric, styles.ink]}>{counts}</Text>
          <View style={styles.toggleRight}>
            <Text style={[Type.label, styles.muted]}>{open ? 'Masquer' : 'Positions'}</Text>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.graphite} />
          </View>
        </Pressable>
      )}

      {open && !candidatId && (
        <View>
          {entries.map(([id, vote]) => (
            <VoteRow key={id} vote={vote} candidat={getCandidat(id)} />
          ))}
        </View>
      )}

      {(open || candidatId) && (
        <View style={styles.links}>
          <Pressable onPress={() => Linking.openURL(loi.sourceOfficielleUrl)} accessibilityRole="link" hitSlop={8}>
            <Text style={[Type.labelStrong, styles.ink, styles.underline]}>Dossier officiel</Text>
          </Pressable>
          {report && (
            <Pressable onPress={() => Linking.openURL(report)} accessibilityRole="link" hitSlop={8}>
              <Text style={[Type.label, styles.muted, styles.underline]}>Signaler une erreur</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    padding: Spacing.two,
    gap: Spacing.half,
  },
  toggle: {
    marginTop: Spacing.one,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.one,
    paddingHorizontal: 12,
    borderRadius: Radius.medium,
    backgroundColor: Colors.paper,
  },
  toggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    paddingTop: Spacing.one,
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
  underline: {
    textDecorationLine: 'underline',
    textDecorationColor: Colors.graphite,
  },
});
