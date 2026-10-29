import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { EnjeuReveal } from '@/components/enjeu-reveal';
import { GlossaryText } from '@/components/glossary-text';
import { LoiDetail } from '@/components/loi-detail';
import { LoiVoteScale } from '@/components/loi-vote-scale';
import { MoreInfo, type InfoTab } from '@/components/more-info';
import { PropositionDetail, SharedQuestion } from '@/components/proposition-detail';
import { Sheet, useSheetReveal } from '@/components/ui/sheet';
import { VoteScale } from '@/components/vote-scale';
import { Colors, Type } from '@/constants/theme';
import { voteTarget } from '@/lib/enjeux';
import { TYPE_SOURCE_LABELS } from '@/lib/format';
import { UNSURE, type VoteValue } from '@/lib/scoring';
import type { Enjeu, Loi, Proposition } from '@/schemas/dataset';
import { getEnjeu, lois, propositions } from '@/services/dataset';
import { buzz } from '@/lib/sound';
import { celebrate, type CelebrationPoint } from '@/store/celebration-store';
import { usePropositionVotes, useVotesStore } from '@/store/votes-store';

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

type Voted = (point?: CelebrationPoint) => void;

// La page de la question derrière la gomme : le texte, votre vote (la même échelle que dans Voter), puis le détail.
// `blind` : ouverte pendant le vote (Voter), aucun nom de candidat ni de parti.
// `example` : une proposition fictive (onboarding), sans rien écrire dans vos votes.
export function EditVoteSheet({
  id,
  visible = true,
  onClose,
  blind,
  example,
}: {
  id: string | null;
  visible?: boolean;
  onClose: () => void;
  blind: boolean;
  example?: ExampleVote;
}) {
  const proposition = id ? byId.get(id) : undefined;
  const enjeu = id ? getEnjeu(id) : undefined;
  const loi = id ? loisById.get(id) : undefined;
  const reducedMotion = useReducedMotion();

  // La fête part du bouton touché, dans la feuille : elle se range dès la fête dessinée, sans attendre qu'elle s'efface.
  const voted: Voted = (point) => {
    celebrate('small', 'sheet', point);
    buzz('light');
    setTimeout(onClose, reducedMotion ? 0 : CLOSE_AFTER_MS);
  };

  return (
    <Sheet
      visible={visible && !!(proposition || loi || enjeu || example)}
      title={example ? 'Modifier votre vote' : 'Votre vote'}
      onClose={onClose}>
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
      {proposition && <PropositionPage key={proposition.id} proposition={proposition} blind={blind} onVoted={voted} onClose={onClose} />}
      {enjeu && <EnjeuPage key={enjeu.id} enjeu={enjeu} blind={blind} onVoted={voted} />}
      {loi && <LoiPage key={loi.id} loi={loi} blind={blind} onVoted={voted} />}
    </Sheet>
  );
}

function PropositionPage({
  proposition,
  blind,
  onVoted,
  onClose,
}: {
  proposition: Proposition;
  blind: boolean;
  onVoted: Voted;
  onClose: () => void;
}) {
  const propositionVotes = usePropositionVotes();
  const castVote = useVotesStore((s) => s.castVote);
  const [tab, setTab] = useState<InfoTab | null>(null);
  const reveal = useSheetReveal();
  const onWord = () => setTab('mots');

  return (
    <>
      <GlossaryText style={[Type.bodyStrong, styles.ink]} onWord={onWord} selectable>
        {proposition.titre}
      </GlossaryText>
      <GlossaryText style={[Type.body, styles.soft]} onWord={onWord} selectable>
        {proposition.description}
      </GlossaryText>
      <VoteScale
        value={propositionVotes[proposition.id]}
        onVote={(value, point) => {
          const { key, sign } = voteTarget(proposition);
          castVote(key, (value * sign) as VoteValue);
          onVoted(point);
        }}
      />
      <PropositionDetail proposition={proposition} anonymous={blind} underVote onOpenCandidate={onClose} />
      {/* Précisions redirait le contexte de la fiche juste au-dessus. */}
      <MoreInfo
        itemId={proposition.id}
        text={proposition.contexte}
        source={TYPE_SOURCE_LABELS[proposition.typeSource]}
        terms={[proposition.titre, proposition.description]}
        tab={tab}
        onTab={setTab}
        onOpen={reveal}
        omit={['mesure']}
      />
    </>
  );
}

function LoiPage({ loi, blind, onVoted }: { loi: Loi; blind: boolean; onVoted: Voted }) {
  const value = useVotesStore((s) => s.loiVotes[loi.id]);
  const castLoiVote = useVotesStore((s) => s.castLoiVote);
  const [tab, setTab] = useState<InfoTab | null>(null);
  const reveal = useSheetReveal();

  return (
    <>
      <GlossaryText style={[Type.bodyStrong, styles.ink]} onWord={() => setTab('mots')} selectable>
        {loi.question}
      </GlossaryText>
      <LoiVoteScale
        value={value}
        onVote={(next, point) => {
          castLoiVote(loi.id, next);
          onVoted(point);
        }}
      />
      <LoiDetail loi={loi} anonymous={blind} underVote />
      <MoreInfo
        itemId={loi.id}
        nature={loi.nature}
        text={loi.enjeu}
        terms={[loi.question, loi.titre, loi.resume]}
        tab={tab}
        onTab={setTab}
        onOpen={reveal}
      />
    </>
  );
}

function EnjeuPage({ enjeu, blind, onVoted }: { enjeu: Enjeu; blind: boolean; onVoted: Voted }) {
  const value = useVotesStore((s) => s.votes[enjeu.id]);
  const castVote = useVotesStore((s) => s.castVote);
  const [tab, setTab] = useState<InfoTab | null>(null);
  const [mesure, setMesure] = useState<Proposition | null>(null);
  const reveal = useSheetReveal();
  const onWord = () => setTab('mots');
  // Les mesures sont déjà listées dessous, sauf après « Je ne sais pas » à l'aveugle : Précisions les garde.
  const listed = !blind || value !== UNSURE;

  return (
    <>
      <GlossaryText style={[Type.bodyStrong, styles.ink]} onWord={onWord} selectable>
        {enjeu.question}
      </GlossaryText>
      <GlossaryText style={[Type.body, styles.soft]} onWord={onWord} selectable>
        {enjeu.enjeu}
      </GlossaryText>
      <VoteScale
        value={value}
        onVote={(next, point) => {
          castVote(enjeu.id, next);
          onVoted(point);
        }}
      />
      {blind ? (
        value !== undefined && <EnjeuReveal enjeu={enjeu} value={value} onOpen={setMesure} />
      ) : (
        <SharedQuestion enjeu={enjeu} withQuestion={false} />
      )}
      <MoreInfo
        itemId={enjeu.id}
        text={enjeu.enjeu}
        terms={[enjeu.question]}
        tab={tab}
        onTab={setTab}
        onOpen={reveal}
        omit={listed ? ['mesure'] : []}
      />
      {/* La fiche d'une mesure, sans son auteur, par-dessus la question. */}
      <Sheet visible={!!mesure} title={mesure?.ref ?? ''} onClose={() => setMesure(null)}>
        {mesure && <PropositionDetail proposition={mesure} anonymous />}
      </Sheet>
    </>
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
