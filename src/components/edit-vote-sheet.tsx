import { StyleSheet, Text } from 'react-native';

import { LoiVoteScale } from '@/components/loi-vote-scale';
import { Sheet } from '@/components/ui/sheet';
import { VoteScale } from '@/components/vote-scale';
import { Colors, Type } from '@/constants/theme';
import { lois, propositions } from '@/services/dataset';
import { celebrate } from '@/store/celebration-store';
import { useVotesStore } from '@/store/votes-store';

const byId = new Map(propositions.map((p) => [p.id, p]));
const loisById = new Map(lois.map((l) => [l.id, l]));

// Modifier un vote déjà posé, proposition ou scrutin : la même échelle que dans Voter.
export function EditVoteSheet({ id, visible = true, onClose }: { id: string | null; visible?: boolean; onClose: () => void }) {
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const castVote = useVotesStore((s) => s.castVote);
  const castLoiVote = useVotesStore((s) => s.castLoiVote);
  const proposition = id ? byId.get(id) : undefined;
  const loi = id ? loisById.get(id) : undefined;

  return (
    <Sheet visible={visible && !!(proposition || loi)} title="Modifier votre vote" onClose={onClose}>
      {proposition && (
        <>
          <Text style={[Type.bodyStrong, styles.ink]}>{proposition.titre}</Text>
          <Text style={[Type.body, styles.soft]}>{proposition.description}</Text>
          <VoteScale
            value={votes[proposition.id]}
            onVote={(value, point) => {
              castVote(proposition.id, value);
              onClose();
              celebrate('small', 'app', point);
            }}
          />
        </>
      )}
      {loi && (
        <>
          <Text style={[Type.bodyStrong, styles.ink]}>{loi.question}</Text>
          <Text style={[Type.body, styles.soft]}>{loi.enjeu}</Text>
          <LoiVoteScale
            value={loiVotes[loi.id]}
            onVote={(value, point) => {
              castLoiVote(loi.id, value);
              onClose();
              celebrate('small', 'app', point);
            }}
          />
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  ink: {
    color: Colors.ink,
  },
  soft: {
    color: Colors.inkSoft,
  },
});
