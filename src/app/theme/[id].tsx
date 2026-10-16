import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DataFooter } from '@/components/data-footer';
import { PropositionDetail } from '@/components/proposition-detail';
import { PropositionRow } from '@/components/proposition-row';
import { Screen } from '@/components/screen';
import { ThemeMark } from '@/components/theme-mark';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Sheet } from '@/components/ui/sheet';
import { Colors, MinTarget, Radius, Spacing, Type } from '@/constants/theme';
import { fisherYates } from '@/lib/shuffle';
import type { Proposition } from '@/schemas/dataset';
import { getCandidat, propositions, thematiques } from '@/services/dataset';
import { useVotesStore } from '@/store/votes-store';

type Filtre = 'toutes' | 'a-voter';

export default function ThemeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const votes = useVotesStore((s) => s.votes);
  const [filtre, setFiltre] = useState<Filtre>('toutes');
  const [selected, setSelected] = useState<Proposition | null>(null);

  const index = thematiques.findIndex((t) => t.id === id);
  const theme = thematiques[index];
  const next = thematiques[(index + 1) % thematiques.length];
  // Ordre tiré au hasard à chaque ouverture du thème : aucun candidat n'est toujours en tête.
  const items = useMemo(() => fisherYates(propositions.filter((p) => p.thematiqueId === id)), [id]);
  const pending = items.filter((p) => votes[p.id] === undefined);
  const shown = filtre === 'a-voter' ? pending : items;

  const back = (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.navigate('/explore'))}
      accessibilityRole="button"
      accessibilityLabel="Retour au sommaire"
      hitSlop={8}
      style={styles.back}>
      <Ionicons name="chevron-back" size={26} color={Colors.ink} />
    </Pressable>
  );

  if (!theme) {
    return (
      <Screen>
        {back}
        <Text style={[Type.bodyStrong, styles.ink]}>Ce thème n’existe pas ou plus dans les données.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      {back}

      <View style={styles.identity}>
        <ThemeMark thematiqueId={theme.id} size={48} />
        <Text style={[Type.display, styles.ink, styles.flex]} accessibilityRole="header">
          {theme.titre}
        </Text>
      </View>
      <Text style={[Type.body, styles.soft]}>{theme.description}.</Text>

      <View style={styles.filter}>
        <SegmentedControl<Filtre>
          accessibilityLabel="Filtrer les propositions"
          value={filtre}
          onChange={setFiltre}
          segments={[
            { value: 'toutes', label: 'Toutes', count: items.length },
            { value: 'a-voter', label: 'Pas encore votées', count: pending.length },
          ]}
        />
      </View>

      {shown.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[Type.bodyStrong, styles.ink]}>Vous avez voté sur toutes les propositions de ce thème.</Text>
          <Button label="Voir toutes les propositions" onPress={() => setFiltre('toutes')} />
        </View>
      ) : (
        <View style={styles.list}>
          {shown.map((p, i) => (
            <View key={p.id} style={i > 0 && styles.separator}>
              <PropositionRow
                proposition={p}
                vote={votes[p.id]}
                author={getCandidat(p.candidatId)?.nom}
                onPress={() => setSelected(p)}
              />
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => router.replace({ pathname: '/theme/[id]', params: { id: next.id } })}
        accessibilityRole="link"
        accessibilityLabel={`Thème suivant : ${next.titre}`}
        style={({ pressed }) => [styles.next, pressed && styles.pressed]}>
        <View style={styles.flex}>
          <Text style={[Type.label, styles.muted]}>Thème suivant</Text>
          <Text style={[Type.bodyStrong, styles.ink]}>{next.titre}</Text>
        </View>
        <ThemeMark thematiqueId={next.id} size={32} />
        <Ionicons name="chevron-forward" size={16} color={Colors.graphite} />
      </Pressable>

      <DataFooter />

      <Sheet visible={!!selected} title={selected?.ref ?? ''} onClose={() => setSelected(null)}>
        {selected && <PropositionDetail proposition={selected} onOpenCandidate={() => setSelected(null)} />}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: MinTarget,
    height: MinTarget,
    marginLeft: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
  },
  filter: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  list: {
    borderRadius: Radius.large,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  empty: {
    gap: Spacing.two,
  },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: Spacing.four,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  pressed: {
    backgroundColor: Colors.pressed,
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
