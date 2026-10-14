import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DataFooter } from '@/components/data-footer';
import { LoiCard } from '@/components/loi-card';
import { screenStyles } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { SearchField } from '@/components/ui/search-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Colors, Numeric, Spacing, Type } from '@/constants/theme';
import { normalize, plural } from '@/lib/format';
import type { Loi, StatutLoi } from '@/schemas/dataset';
import { lois } from '@/services/dataset';
import { useVotesStore } from '@/store/votes-store';

type Filtre = 'tous' | StatutLoi;

const count = (statut: StatutLoi) => lois.filter((l) => l.statut === statut).length;

export default function LoisScreen() {
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const [query, setQuery] = useState('');
  const [filtre, setFiltre] = useState<Filtre>('tous');

  const sections = useMemo(() => {
    const q = normalize(query.trim());
    const filtered = lois.filter(
      (l) =>
        (filtre === 'tous' || l.statut === filtre) &&
        (!q || normalize(`${l.titre} ${l.resume} ${l.ref}`).includes(q))
    );
    const byYear = new Map<string, Loi[]>();
    for (const loi of filtered) {
      const year = loi.dateVote.slice(0, 4);
      byYear.set(year, [...(byYear.get(year) ?? []), loi]);
    }
    return [...byYear.entries()].map(([title, data]) => ({ title, data }));
  }, [query, filtre]);

  const resultCount = sections.reduce((n, s) => n + s.data.length, 0);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <SectionList
        sections={sections}
        keyExtractor={(loi) => loi.id}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={screenStyles.listContent}
        ListHeaderComponent={
          <View style={[screenStyles.column, styles.top]}>
            <ScreenHeader title="Lois" note="Votes réels au Parlement des candidats et de leurs groupes." />
            <SearchField value={query} onChangeText={setQuery} placeholder="Rechercher une loi, un numéro" />
            <SegmentedControl<Filtre>
              accessibilityLabel="Filtrer par résultat"
              value={filtre}
              onChange={setFiltre}
              segments={[
                { value: 'tous', label: 'Toutes', count: lois.length },
                { value: 'adoptee', label: 'Adoptées', count: count('adoptee') },
                { value: 'rejetee', label: 'Rejetées', count: count('rejetee') },
              ]}
            />
            <Text style={[Type.label, Numeric, styles.muted]} accessibilityLiveRegion="polite">
              {plural(resultCount, 'scrutin')}
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[Type.caps, Numeric, styles.muted, screenStyles.column]} accessibilityRole="header">
              {section.title} · {plural(section.data.length, 'scrutin')}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[screenStyles.column, styles.item]}>
            <LoiCard loi={item} userVote={loiVotes[item.id]} />
          </View>
        )}
        ListEmptyComponent={
          <View style={[screenStyles.column, styles.empty]}>
            <Text style={[Type.bodyStrong, styles.ink]}>Aucun scrutin ne correspond.</Text>
            <Button
              label="Effacer la recherche et le filtre"
              onPress={() => {
                setQuery('');
                setFiltre('tous');
              }}
            />
          </View>
        }
        ListFooterComponent={
          <View style={screenStyles.column}>
            <DataFooter />
          </View>
        }
      />
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
    paddingBottom: Spacing.one,
  },
  sectionHeader: {
    backgroundColor: Colors.paper,
    paddingVertical: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.rule,
  },
  item: {
    paddingTop: 12,
  },
  empty: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  ink: {
    color: Colors.ink,
  },
  muted: {
    color: Colors.graphite,
  },
});
