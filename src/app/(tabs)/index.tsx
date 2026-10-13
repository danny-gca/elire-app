import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PropositionDetail } from '@/components/proposition-detail';
import { PropositionRow } from '@/components/proposition-row';
import { PropositionSheet } from '@/components/proposition-sheet';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { ProgressCounter } from '@/components/ui/progress-counter';
import { Sheet } from '@/components/ui/sheet';
import { VoteScale } from '@/components/vote-scale';
import { VoteTag } from '@/components/vote-tag';
import { Colors, Radius, Spacing, Type } from '@/constants/theme';
import type { VoteValue } from '@/lib/scoring';
import type { Proposition } from '@/schemas/dataset';
import { getThematique, propositions } from '@/services/dataset';
import { selectNextPropositionId, useVotesStore } from '@/store/votes-store';

const byId = new Map(propositions.map((p) => [p.id, p]));

export default function VoterScreen() {
  const router = useRouter();
  const votes = useVotesStore((s) => s.votes);
  const order = useVotesStore((s) => s.order);
  const castVote = useVotesStore((s) => s.castVote);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Proposition | null>(null);

  const nextId = selectNextPropositionId({ votes, order });
  const current = nextId ? byId.get(nextId) : undefined;
  const votedCount = Object.keys(votes).length;
  const total = propositions.length;
  const last = lastId ? byId.get(lastId) : undefined;

  const handleVote = (value: VoteValue) => {
    if (!current) {
      return;
    }
    castVote(current.id, value);
    setLastId(current.id);
    setSourceOpen(false);
  };

  const counter = <ProgressCounter value={votedCount} total={total} unit="propositions" />;

  if (!current) {
    return (
      <>
        <FinishedView onEdit={setEditing} onSeeRanking={() => router.navigate('/results')} counter={counter} />
        <EditVoteSheet proposition={editing} onClose={() => setEditing(null)} />
      </>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Voter" accessory={counter} />
      <ProgressTrack ratio={votedCount / total} />

      {last && votes[last.id] !== undefined && (
        <LastVote key={last.id} proposition={last} value={votes[last.id]} onPress={() => setEditing(last)} />
      )}

      <Animated.View key={current.id} entering={FadeIn.duration(220)} style={styles.sheetWrap}>
        <PropositionSheet proposition={current} thematique={getThematique(current.thematiqueId)}>
          <Pressable
            onPress={() => setSourceOpen(true)}
            accessibilityRole="button"
            accessibilityHint="Ouvre la description complète, le contexte et la source"
            style={styles.sourceLink}>
            <Text style={[Type.labelStrong, styles.underline]}>Voir la source et le contexte</Text>
          </Pressable>
        </PropositionSheet>
      </Animated.View>

      <View style={styles.avis}>
        <Text style={[Type.bodyStrong, styles.ink]} accessibilityRole="header">
          Votre avis
        </Text>
        <Text style={[Type.label, styles.muted]}>L’auteur reste masqué : vous jugez la mesure, pas la personne.</Text>
        <VoteScale onVote={handleVote} />
      </View>

      <Sheet visible={sourceOpen} title="Source et contexte" onClose={() => setSourceOpen(false)}>
        <PropositionDetail proposition={current} anonymous />
      </Sheet>
      <EditVoteSheet proposition={editing} onClose={() => setEditing(null)} />
    </Screen>
  );
}

function ProgressTrack({ ratio }: { ratio: number }) {
  return (
    <View style={styles.track} importantForAccessibility="no-hide-descendants">
      <View style={[styles.trackFill, { width: `${Math.min(1, ratio) * 100}%` }]} />
    </View>
  );
}

// Signature : le trait de surligneur balaie le dernier titre voté de gauche à droite.
function LastVote({ proposition, value, onPress }: { proposition: Proposition; value: VoteValue; onPress: () => void }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 220 });
  }, [progress]);
  const stroke = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Dernier vote : ${proposition.titre}`}
      accessibilityHint="Modifier ce vote"
      style={styles.last}>
      <VoteTag value={value} />
      <View style={styles.lastTitle}>
        <Animated.View style={[styles.stroke, stroke]} />
        <Text style={[Type.label, styles.ink]} numberOfLines={1}>
          {proposition.titre}
        </Text>
      </View>
      <Text style={[Type.label, styles.muted]}>Modifier</Text>
    </Pressable>
  );
}

function FinishedView({
  onEdit,
  onSeeRanking,
  counter,
}: {
  onEdit: (p: Proposition) => void;
  onSeeRanking: () => void;
  counter: React.ReactNode;
}) {
  const votes = useVotesStore((s) => s.votes);
  const order = useVotesStore((s) => s.order);
  const ordered = useMemo(() => order.map((id) => byId.get(id)).filter((p): p is Proposition => !!p), [order]);

  return (
    <Screen>
      <ScreenHeader title="Voter" accessory={counter} />
      <View style={styles.finished}>
        <Text style={[Type.display, styles.ink]}>Vous avez donné votre avis sur toutes les propositions.</Text>
        <Text style={[Type.body, styles.soft]}>
          Relisez vos notes ci-dessous : touchez une proposition pour changer votre vote.
        </Text>
        <Button label="Voir le classement" variant="primary" onPress={onSeeRanking} />
      </View>
      <View style={styles.list}>
        {ordered.map((p, i) => (
          <View key={p.id} style={i > 0 && styles.separator}>
            <PropositionRow proposition={p} vote={votes[p.id]} onPress={() => onEdit(p)} actionHint="Modifier votre vote" />
          </View>
        ))}
      </View>
    </Screen>
  );
}

function EditVoteSheet({ proposition, onClose }: { proposition: Proposition | null; onClose: () => void }) {
  const votes = useVotesStore((s) => s.votes);
  const castVote = useVotesStore((s) => s.castVote);

  return (
    <Sheet visible={!!proposition} title="Modifier votre vote" onClose={onClose}>
      {proposition && (
        <>
          <Text style={[Type.bodyStrong, styles.ink]}>{proposition.titre}</Text>
          <Text style={[Type.body, styles.soft]}>{proposition.description}</Text>
          <VoteScale
            value={votes[proposition.id]}
            onVote={(value) => {
              castVote(proposition.id, value);
              onClose();
            }}
          />
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 2,
    backgroundColor: Colors.rule,
  },
  trackFill: {
    height: 2,
    backgroundColor: Colors.ink,
  },
  last: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 44,
    marginTop: Spacing.one,
  },
  lastTitle: {
    flex: 1,
    justifyContent: 'center',
  },
  stroke: {
    position: 'absolute',
    left: -2,
    right: 0,
    top: 2,
    bottom: 1,
    backgroundColor: Colors.markSoft,
    borderRadius: 3,
    transformOrigin: 'left',
  },
  sheetWrap: {
    marginTop: Spacing.one,
  },
  sourceLink: {
    minHeight: 44,
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  avis: {
    marginTop: Spacing.three,
    gap: Spacing.one,
  },
  finished: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  list: {
    marginTop: Spacing.two,
    borderRadius: Radius.large,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  separator: {
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
  underline: {
    color: Colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.graphite,
  },
});
