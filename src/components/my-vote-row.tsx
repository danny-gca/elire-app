import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EraserIcon } from '@/components/eraser-icon';
import { LoiVoteScale } from '@/components/loi-vote-scale';
import { useSheetReveal } from '@/components/ui/sheet';
import { VoteScale } from '@/components/vote-scale';
import { LoiVoteTag, VoteTag } from '@/components/vote-tag';
import { Colors, Markers, Radius, Spacing, Type } from '@/constants/theme';
import { loiChoice, voteChoice } from '@/constants/votes';
import { buzz } from '@/lib/sound';
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
  const label = kind === 'loi' ? loiChoice(loiVote)?.label : voteChoice(vote)?.label;
  const reveal = useSheetReveal();
  const scale = useRef<View>(null);

  return (
    <View style={styles.root}>
      {/* Toute la ligne se touche pour corriger le vote, comme « A voté ! ». */}
      <Pressable
        disabled={!voted}
        onPress={() => setEditing((v) => !v)}
        accessibilityRole={voted ? 'button' : undefined}
        accessibilityLabel={voted ? `Votre vote : ${label}. ${editing ? 'Garder ce vote' : 'Modifier mon vote'}` : undefined}
        accessibilityState={voted ? { expanded: editing } : undefined}
        style={({ pressed }) => [styles.head, pressed && { backgroundColor: Colors.pressed }]}>
        <View style={[styles.avatar, { backgroundColor: Markers[marker].soft }]} accessibilityElementsHidden importantForAccessibility="no">
          <Ionicons name="person" size={18} color={Colors.ink} />
        </View>
        <View style={styles.who}>
          <Text style={[Type.bodyStrong, styles.ink]}>Moi</Text>
          <Text style={[Type.label, styles.muted]}>{voted ? 'Votre vote' : pendingNote}</Text>
        </View>
        {/* Gomme à gauche : le vote reste aligné sur ceux des candidats. */}
        {voted && (
          <View style={styles.vote}>
            {editing ? <Ionicons name="close" size={18} color={Colors.ink} /> : <EraserIcon size={18} color={Colors.ink} />}
            <View style={[styles.band, { backgroundColor: Markers[marker].soft }]}>
              {kind === 'loi' ? <LoiVoteTag value={loiVote!} /> : <VoteTag value={vote!} />}
            </View>
          </View>
        )}
      </Pressable>
      {/* L'échelle s'ouvre sous la ligne : la feuille défile pour la montrer. */}
      {voted && editing && (
        <View ref={scale} onLayout={() => reveal(scale.current)}>
          {kind === 'proposition' ? (
            <VoteScale
              value={vote}
              onVote={(value, point) => {
                castVote(id, value);
                setEditing(false);
                celebrate('small', 'sheet', point);
                buzz('light');
              }}
            />
          ) : (
            <LoiVoteScale
              value={loiVote}
              onVote={(value, point) => {
                castLoiVote(id, value);
                setEditing(false);
                celebrate('small', 'sheet', point);
                buzz('light');
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.one,
    // La ligne touchable a sa propre marge de 8 : même hauteur qu'avant.
    paddingVertical: 4,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: -Spacing.one,
    padding: Spacing.one,
    borderRadius: Radius.small,
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
  vote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ink: {
    color: Colors.ink,
  },
  muted: {
    color: Colors.graphite,
  },
});
