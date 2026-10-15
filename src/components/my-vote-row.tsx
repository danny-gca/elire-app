import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EraserIcon } from '@/components/eraser-icon';
import { LoiVoteScale } from '@/components/loi-vote-scale';
import { VOTE_ROW_INDENT } from '@/components/vote-row';
import { VoteScale } from '@/components/vote-scale';
import { LoiVoteTag, VoteTag } from '@/components/vote-tag';
import { Colors, Markers, Radius, Spacing, Type } from '@/constants/theme';
import { celebrate } from '@/store/celebration-store';
import { useMarkOf, useVotesStore } from '@/store/votes-store';

// « Moi », présenté comme un candidat : votre vote à côté des leurs, modifiable à la gomme.
export function MyVoteRow({ id, kind, pendingNote }: { id: string; kind: 'proposition' | 'loi'; pendingNote: string }) {
  const vote = useVotesStore((s) => s.votes[id]);
  const loiVote = useVotesStore((s) => s.loiVotes[id]);
  const castVote = useVotesStore((s) => s.castVote);
  const castLoiVote = useVotesStore((s) => s.castLoiVote);
  const marker = useMarkOf(id);
  const [editing, setEditing] = useState(false);
  const voted = kind === 'loi' ? loiVote !== undefined : vote !== undefined;

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <View style={[styles.avatar, { backgroundColor: Markers[marker].soft }]} accessibilityElementsHidden importantForAccessibility="no">
          <Ionicons name="person" size={18} color={Colors.ink} />
        </View>
        <View style={styles.who}>
          <Text style={[Type.bodyStrong, styles.ink]}>Moi</Text>
          <Text style={[Type.label, styles.muted]}>{voted ? 'Votre vote' : pendingNote}</Text>
        </View>
        {voted && (
          <View style={[styles.band, { backgroundColor: Markers[marker].soft }]}>
            {kind === 'loi' ? <LoiVoteTag value={loiVote!} /> : <VoteTag value={vote!} />}
          </View>
        )}
      </View>
      {voted && (
        <Pressable
          onPress={() => setEditing((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: editing }}
          hitSlop={8}
          style={({ pressed }) => [styles.erase, pressed && { opacity: 0.6 }]}>
          <EraserIcon size={16} color={Colors.graphite} />
          <Text style={[Type.label, styles.muted, styles.underline]}>{editing ? 'Garder ce vote' : 'Modifier mon vote'}</Text>
        </Pressable>
      )}
      {voted && editing && kind === 'proposition' && (
        <VoteScale
          value={vote}
          onVote={(value, point) => {
            castVote(id, value);
            setEditing(false);
            celebrate('small', 'sheet', point);
          }}
        />
      )}
      {voted && editing && kind === 'loi' && (
        <LoiVoteScale
          value={loiVote}
          onVote={(value, point) => {
            castLoiVote(id, value);
            setEditing(false);
            celebrate('small', 'sheet', point);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.one,
    paddingVertical: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  who: {
    flex: 1,
  },
  // Mêmes dimensions que l'étiquette des candidats, sur la couleur du surligneur.
  band: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.small,
  },
  erase: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: 32,
    marginLeft: VOTE_ROW_INDENT,
  },
  underline: {
    textDecorationLine: 'underline',
    textDecorationColor: Colors.graphite,
  },
  ink: {
    color: Colors.ink,
  },
  muted: {
    color: Colors.graphite,
  },
});
