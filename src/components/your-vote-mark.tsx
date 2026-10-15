import { StyleSheet, Text, View } from 'react-native';

import { LoiVoteTag, VoteTag } from '@/components/vote-tag';
import { Colors, Markers, Type } from '@/constants/theme';
import { loiChoice, voteChoice } from '@/constants/votes';
import type { LoiVoteValue, VoteValue } from '@/lib/scoring';
import { useMarkOf } from '@/store/votes-store';

type YourVoteMarkProps = { id: string } & ({ vote: VoteValue; loiVote?: never } | { loiVote: LoiVoteValue; vote?: never });

// Votre vote dans l'angle d'une ligne : la valeur passée au surligneur, comme un mot marqué à la main.
export function YourVoteMark({ id, vote, loiVote }: YourVoteMarkProps) {
  const marker = useMarkOf(id);
  const label = loiVote !== undefined ? loiChoice(loiVote)?.label : voteChoice(vote!)?.label;
  return (
    <View style={styles.root} accessible accessibilityLabel={`Votre vote : ${label ?? ''}`}>
      <View style={[styles.band, { backgroundColor: Markers[marker].soft }]}>
        {loiVote !== undefined ? <LoiVoteTag value={loiVote} style={Type.bodyStrong} /> : <VoteTag value={vote!} style={Type.bodyStrong} />}
      </View>
    </View>
  );
}

// La position d'un candidat, marquée comme la vôtre mais en neutre : les couleurs d'échelle sont réservées à vos votes.
export function PositionMark({ label }: { label: string }) {
  return (
    <View style={styles.root}>
      <View style={[styles.band, styles.neutral]}>
        <Text style={[Type.bodyStrong, styles.ink]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-end',
  },
  band: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 4,
    transform: [{ rotate: '-1.5deg' }],
  },
  neutral: {
    backgroundColor: Colors.ruleSoft,
  },
  ink: {
    color: Colors.ink,
  },
});
