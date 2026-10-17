import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DataFooter } from '@/components/data-footer';
import { PropositionDetail } from '@/components/proposition-detail';
import { PropositionRow } from '@/components/proposition-row';
import { screenStyles } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemeIndex } from '@/components/theme-index';
import { ThemeMark } from '@/components/theme-mark';
import { Button } from '@/components/ui/button';
import { SearchField } from '@/components/ui/search-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Sheet } from '@/components/ui/sheet';
import { Colors, Numeric, Radius, Spacing, Type } from '@/constants/theme';
import { normalize } from '@/lib/format';
import { fisherYates } from '@/lib/shuffle';
import type { Proposition } from '@/schemas/dataset';
import { getCandidat, propositions, thematiques } from '@/services/dataset';
import { useTuto, useTutoTarget } from '@/store/tuto-store';
import { useVotesStore } from '@/store/votes-store';

type Filtre = 'toutes' | 'a-voter';

const searchIndex = new Map(
  propositions.map((p) => [p.id, normalize(`${p.titre} ${p.description} ${getCandidat(p.candidatId)?.nom ?? ''} ${p.ref}`)])
);

export default function ExplorerScreen() {
  const votes = useVotesStore((s) => s.votes);
  const [query, setQuery] = useState('');
  const [filtre, setFiltre] = useState<Filtre>('toutes');
  useTuto('explorer', true);
  const searchTarget = useTutoTarget('recherche');
  const [selected, setSelected] = useState<Proposition | null>(null);
  const q = normalize(query.trim());

  // Ordre tiré au hasard à l'ouverture d'Explorer, stable pendant la saisie : aucun candidat n'est toujours en tête.
  const [order, setOrder] = useState(() => fisherYates(propositions));
  // En quittant l'onglet, la recherche repart de zéro.
  useFocusEffect(
    useCallback(
      () => () => {
        setQuery('');
        setFiltre('toutes');
        setOrder(fisherYates(propositions));
      },
      []
    )
  );
  const matches = useMemo(() => (q ? order.filter((p) => searchIndex.get(p.id)!.includes(q)) : []), [q, order]);
  const pending = matches.filter((p) => votes[p.id] === undefined);
  const shown = filtre === 'a-voter' ? pending : matches;
  const sections = thematiques
    .map((t) => ({ theme: t, data: shown.filter((p) => p.thematiqueId === t.id) }))
    .filter((s) => s.data.length > 0);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <SectionList
        sections={sections}
        keyExtractor={(p) => p.id}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={screenStyles.listContent}
        ListHeaderComponent={
          <View style={[screenStyles.column, styles.top]}>
            <ScreenHeader title="Explorer" note="Toutes les propositions par thème, auteurs visibles." />
            <View {...searchTarget}>
              <SearchField value={query} onChangeText={setQuery} placeholder="Rechercher une mesure, un candidat" />
            </View>
            {q ? (
              <SegmentedControl<Filtre>
                accessibilityLabel="Filtrer les résultats"
                value={filtre}
                onChange={setFiltre}
                segments={[
                  { value: 'toutes', label: 'Toutes', count: matches.length },
                  { value: 'a-voter', label: 'Pas encore votées', count: pending.length },
                ]}
              />
            ) : (
              <ThemeIndex votes={votes} />
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={[screenStyles.column, styles.sectionInner]}>
              <ThemeMark thematiqueId={section.theme.id} size={28} />
              <Text style={[Type.bodyStrong, styles.ink, styles.flex]} accessibilityRole="header" numberOfLines={1}>
                {section.theme.titre}
              </Text>
              <Text style={[Type.label, Numeric, styles.muted]}>{section.data.length}</Text>
            </View>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View style={screenStyles.column}>
            <View style={[styles.rowWrap, index === 0 && styles.first, index === section.data.length - 1 && styles.last]}>
              <PropositionRow
                proposition={item}
                vote={votes[item.id]}
                author={getCandidat(item.candidatId)?.nom}
                onPress={() => setSelected(item)}
              />
            </View>
          </View>
        )}
        renderSectionFooter={() => <View style={styles.sectionGap} />}
        ListEmptyComponent={
          q ? (
            <View style={[screenStyles.column, styles.empty]}>
              <Text style={[Type.bodyStrong, styles.ink]}>
                {matches.length > 0 ? 'Vous avez déjà voté sur tous ces résultats.' : 'Aucune proposition ne correspond.'}
              </Text>
              <Button
                label={matches.length > 0 ? 'Voir tous les résultats' : 'Effacer la recherche'}
                onPress={() => (matches.length > 0 ? setFiltre('toutes') : setQuery(''))}
              />
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={screenStyles.column}>
            <DataFooter />
          </View>
        }
      />
      <Sheet visible={!!selected} title={selected?.ref ?? ''} onClose={() => setSelected(null)}>
        {selected && <PropositionDetail proposition={selected} onOpenCandidate={() => setSelected(null)} />}
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  top: {
    gap: 12,
    paddingBottom: Spacing.two,
  },
  sectionHeader: {
    backgroundColor: Colors.paper,
    paddingVertical: Spacing.one,
  },
  sectionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowWrap: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    overflow: 'hidden',
  },
  first: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
  },
  last: {
    borderBottomLeftRadius: Radius.large,
    borderBottomRightRadius: Radius.large,
  },
  sectionGap: {
    height: Spacing.three,
  },
  empty: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  flex: {
    flex: 1,
  },
  ink: {
    color: Colors.ink,
  },
  muted: {
    color: Colors.graphite,
  },
});
