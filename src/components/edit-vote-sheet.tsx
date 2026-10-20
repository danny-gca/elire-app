import { StyleSheet, Text } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { LoiVoteScale } from '@/components/loi-vote-scale';
import { Sheet } from '@/components/ui/sheet';
import { VoteScale } from '@/components/vote-scale';
import { Colors, Type } from '@/constants/theme';
import type { VoteValue } from '@/lib/scoring';
import { lois, propositions } from '@/services/dataset';
import { buzz } from '@/lib/sound';
import { celebrate, type CelebrationPoint } from '@/store/celebration-store';
import { useVotesStore } from '@/store/votes-store';

const byId = new Map(propositions.map((p) => [p.id, p]));
const loisById = new Map(lois.map((l) => [l.id, l]));
// Le temps que la petite fête se dessine (la plus longue, l'entouré, finit vers 650ms).
const CLOSE_AFTER_MS = 650;

interface ExampleVote {
  titre: string;
  description: string;
  value?: VoteValue;
  onVote: (value: VoteValue) => void;
}

// Modifier un vote déjà posé, proposition ou scrutin : la même échelle que dans Voter.
// `example` : une proposition fictive (onboarding), sans rien écrire dans vos votes.
export function EditVoteSheet({
  id,
  visible = true,
  onClose,
  example,
}: {
  id: string | null;
  visible?: boolean;
  onClose: () => void;
  example?: ExampleVote;
}) {
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const castVote = useVotesStore((s) => s.castVote);
  const castLoiVote = useVotesStore((s) => s.castLoiVote);
  const proposition = id ? byId.get(id) : undefined;
  const loi = id ? loisById.get(id) : undefined;
  const reducedMotion = useReducedMotion();

  // La fête part du bouton touché, dans la feuille : elle se range dès la fête dessinée, sans attendre qu'elle s'efface.
  const voted = (point?: CelebrationPoint) => {
    celebrate('small', 'sheet', point);
    buzz('light');
    setTimeout(onClose, reducedMotion ? 0 : CLOSE_AFTER_MS);
  };

  return (
    <Sheet visible={visible && !!(proposition || loi || example)} title="Modifier votre vote" onClose={onClose}>
      {example && (
        <>
          <Text style={[Type.bodyStrong, styles.ink]}>{example.titre}</Text>
          <Text style={[Type.body, styles.soft]}>{example.description}</Text>
          <VoteScale
            value={example.value}
            onVote={(value, point) => {
              example.onVote(value);
              voted(point);
            }}
          />
        </>
      )}
      {proposition && (
        <>
          <Text style={[Type.bodyStrong, styles.ink]}>{proposition.titre}</Text>
          <Text style={[Type.body, styles.soft]}>{proposition.description}</Text>
          <VoteScale
            value={votes[proposition.id]}
            onVote={(value, point) => {
              castVote(proposition.id, value);
              voted(point);
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
              voted(point);
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
