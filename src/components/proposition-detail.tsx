import { Link } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { CandidateAvatar } from '@/components/candidate-avatar';
import { MyVoteRow } from '@/components/my-vote-row';
import { Button } from '@/components/ui/button';
import { PositionMark } from '@/components/your-vote-mark';
import { reportUrl } from '@/constants/app';
import { Colors, Numeric, Spacing, Type } from '@/constants/theme';
import { formatDate, TYPE_SOURCE_LABELS } from '@/lib/format';
import type { Enjeu, Proposition } from '@/schemas/dataset';
import { getCandidat, getEnjeu, propositions } from '@/services/dataset';

const byId = new Map(propositions.map((p) => [p.id, p]));

interface PropositionDetailProps {
  proposition: Proposition;
  /** Masque l'auteur (vote à l'aveugle). */
  anonymous?: boolean;
  onOpenCandidate?: () => void;
}

function domainOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, '');
}

// Contenu de la feuille « source et contexte ».
export function PropositionDetail({ proposition, anonymous = false, onOpenCandidate }: PropositionDetailProps) {
  const auteur = anonymous ? undefined : getCandidat(proposition.candidatId);
  const enjeu = proposition.enjeuId ? getEnjeu(proposition.enjeuId) : undefined;
  // Un seul signalement : il cite aussi la question commune, qui peut être la source de l'erreur.
  const report = reportUrl(enjeu ? `${proposition.ref}, ${enjeu.ref}` : proposition.ref, proposition.titre);

  return (
    <View style={styles.root}>
      <Text style={[Type.bodyStrong, styles.title]} selectable>
        {proposition.titre}
      </Text>
      <Text style={[Type.body, styles.text]} selectable>
        {proposition.description}
      </Text>

      <View style={styles.block}>
        <Text style={[Type.labelStrong, styles.muted]}>Contexte</Text>
        <Text style={[Type.body, styles.text]} selectable>
          {proposition.contexte}
        </Text>
        <Text style={[Type.label, Numeric, styles.muted]} selectable>
          {TYPE_SOURCE_LABELS[proposition.typeSource]} ·{' '}
          {proposition.dateDeclaration ? `Déclaré le ${formatDate(proposition.dateDeclaration)} · ` : ''}
          {proposition.ref}
        </Text>
      </View>

      {auteur && (
        <Link href={`/candidate/${auteur.id}`} asChild>
          <Pressable style={styles.author} accessibilityRole="link" onPress={onOpenCandidate}>
            <CandidateAvatar candidat={auteur} size={36} />
            <View style={styles.authorText}>
              <Text style={[Type.bodyStrong, styles.title]}>{auteur.nom}</Text>
              <Text style={[Type.label, styles.muted]}>{auteur.parti}</Text>
            </View>
          </Pressable>
        </Link>
      )}

      {!anonymous && <MyVoteRow id={proposition.id} kind="proposition" pendingNote="Pas encore voté : elle arrivera dans Voter" />}
      {!anonymous && <SharedQuestion enjeu={enjeu} />}

      {anonymous && (
        <Text style={[Type.label, styles.muted]}>L’auteur reste masqué tant que vous votez.</Text>
      )}

      <Button
        label={`Ouvrir la source · ${domainOf(proposition.sourceUrl)}`}
        icon="open-outline"
        onPress={() => Linking.openURL(proposition.sourceUrl)}
      />
      {report && <Button label="Signaler une erreur" variant="quiet" onPress={() => Linking.openURL(report)} />}
    </View>
  );
}

// La question commune et la position de chaque candidat, avec son nom : hors vote à l'aveugle seulement.
function SharedQuestion({ enjeu }: { enjeu?: Enjeu }) {
  if (!enjeu) {
    return null;
  }
  return (
    <View style={styles.block}>
      <Text style={[Type.labelStrong, styles.muted]}>Question commune {enjeu.ref}</Text>
      <Text style={[Type.bodyStrong, styles.title]} selectable>
        {enjeu.question}
      </Text>
      {enjeu.positions.map((pos) => {
        const p = byId.get(pos.propositionId);
        const candidat = p && getCandidat(p.candidatId);
        return (
          p &&
          candidat && (
            <View key={p.id} style={styles.position}>
              <View style={styles.authorText}>
                <Text style={[Type.bodyStrong, styles.title]} selectable>
                  {candidat.nom}
                </Text>
                <Text style={[Type.label, styles.text]} selectable>
                  {p.titre}
                </Text>
              </View>
              <PositionMark label={pos.sens === 'pour' ? 'Pour' : 'Contre'} />
            </View>
          )
        );
      })}
      <Text style={[Type.label, styles.muted]}>Votre note sur la question compte pour chacun : à l’inverse pour qui est contre.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.two,
  },
  position: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  block: {
    gap: Spacing.half,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  title: {
    color: Colors.ink,
  },
  text: {
    color: Colors.inkSoft,
  },
  muted: {
    color: Colors.graphite,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: Spacing.one,
  },
  authorText: {
    flex: 1,
  },
});
