import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { CandidatePanel } from '@/components/candidate-panel';
import { DataFooter } from '@/components/data-footer';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { ProgressCounter } from '@/components/ui/progress-counter';
import { ResetButton } from '@/components/ui/reset-button';
import { Colors, MaxContentWidth, Radius, Spacing, Type } from '@/constants/theme';
import { plural } from '@/lib/format';
import { competitionRanks, computeScores, MIN_VOTES_PER_CANDIDAT, type CandidateScore } from '@/lib/scoring';
import { fisherYates } from '@/lib/shuffle';
import { candidats, propositions } from '@/services/dataset';
import { useVotesStore } from '@/store/votes-store';

const MIN_VOTES_REQUIRED = 10;
// Départage des égalités tiré au hasard à chaque lancement : aucun candidat n'est favorisé par son nom.
const TIE_ORDER = new Map(fisherYates(candidats).map((c, i) => [c.id, i]));
const GAP = 8;

export default function ClassementScreen() {
  const router = useRouter();
  const votes = useVotesStore((s) => s.votes);
  const resetVotes = useVotesStore((s) => s.resetVotes);
  const { width } = useWindowDimensions();

  const votedCount = Object.keys(votes).length;
  const scores = useMemo(() => computeScores(candidats, propositions, votes, TIE_ORDER), [votes]);
  const ranked = scores.filter((s) => s.ranked);
  const others = scores.filter((s) => !s.ranked);
  const columns = Math.min(width, MaxContentWidth) < 560 ? 3 : 4;

  return (
    <Screen>
      <ScreenHeader title="Classement" note="Proximité entre vos votes et les propositions de chaque candidat." />

      {votedCount < MIN_VOTES_REQUIRED ? (
        <View style={styles.locked}>
          <Text style={[Type.bodyStrong, styles.ink]}>
            Le classement s’ouvre après {MIN_VOTES_REQUIRED} votes.
          </Text>
          <Text style={[Type.body, styles.soft]}>
            En dessous, quelques notes suffiraient à placer un candidat en tête par hasard.
          </Text>
          <ProgressCounter value={votedCount} total={MIN_VOTES_REQUIRED} unit="votes" track />
          <Button label="Continuer à voter" variant="primary" onPress={() => router.navigate('/')} />
        </View>
      ) : (
        <>
          <Text style={[Type.bodyStrong, styles.ink, styles.heading]} accessibilityRole="header">
            Candidats les plus proches de vos votes
          </Text>
          <Text style={[Type.label, styles.muted]}>
            Basé sur {plural(votedCount, 'vote')}. Un candidat est classé à partir de {MIN_VOTES_PER_CANDIDAT} de ses
            propositions votées. À égalité, même rang, dans un ordre tiré au hasard.
          </Text>
          {ranked.length > 0 ? (
            <Board entries={ranked} columns={columns} ranked />
          ) : (
            <View style={styles.emptyBoard}>
              <Text style={[Type.body, styles.soft]}>
                Aucun candidat n’a encore {MIN_VOTES_PER_CANDIDAT} propositions votées. Continuez : l’ordre mélangé les fera
                revenir.
              </Text>
              <Button label="Continuer à voter" onPress={() => router.navigate('/')} />
            </View>
          )}

          {others.length > 0 && (
            <>
              <Text style={[Type.bodyStrong, styles.ink, styles.heading]} accessibilityRole="header">
                Pas encore classés
              </Text>
              <Text style={[Type.label, styles.muted]}>Trop peu de leurs propositions ont été votées pour comparer.</Text>
              <Board entries={others} columns={columns} />
            </>
          )}
        </>
      )}

      <View style={styles.reset}>
        <ResetButton count={votedCount} onConfirm={resetVotes} />
      </View>
      <DataFooter />
    </Screen>
  );
}

// Le panneau d'affichage : une tôle, des emplacements identiques.
function Board({ entries, columns, ranked = false }: { entries: CandidateScore[]; columns: number; ranked?: boolean }) {
  const [inner, setInner] = useState(0);
  const slot = inner > 0 ? { width: (inner - GAP * (columns - 1)) / columns } : { flex: 1 };
  const ranks = competitionRanks(entries);
  const tied = (i: number) => ranks.filter((r) => r === ranks[i]).length > 1;
  const rows: CandidateScore[][] = [];
  for (let i = 0; i < entries.length; i += columns) {
    rows.push(entries.slice(i, i + columns));
  }

  return (
    <View style={styles.board} onLayout={(e) => setInner(e.nativeEvent.layout.width - GAP * 2)}>
      {rows.map((row, r) => (
        <View key={r} style={styles.boardRow}>
          {row.map((entry, c) => (
            <CandidatePanel
              key={entry.candidat.id}
              style={slot}
              entry={entry}
              rank={ranked ? ranks[r * columns + c] : undefined}
              tied={ranked && tied(r * columns + c)}
            />
          ))}
          {Array.from({ length: columns - row.length }, (_, k) => (
            <View key={`empty-${k}`} style={slot} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  locked: {
    gap: Spacing.two,
    padding: Spacing.two,
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  emptyBoard: {
    marginTop: Spacing.two,
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.boardEdge,
  },
  heading: {
    marginTop: Spacing.three,
    marginBottom: Spacing.half,
  },
  board: {
    marginTop: Spacing.two,
    padding: GAP,
    gap: GAP,
    backgroundColor: Colors.rule,
    borderRadius: 6,
    borderBottomWidth: 5,
    borderBottomColor: Colors.boardEdge,
  },
  boardRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  reset: {
    marginTop: Spacing.four,
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
