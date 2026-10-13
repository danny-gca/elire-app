import { Link } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { CandidateAvatar } from '@/components/candidate-avatar';
import { Button } from '@/components/ui/button';
import { reportIssueUrl } from '@/constants/app';
import { Colors, Numeric, Spacing, Type } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import type { Proposition } from '@/schemas/dataset';
import { getCandidat } from '@/services/dataset';

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
  const report = reportIssueUrl(proposition.ref, proposition.titre);

  return (
    <View style={styles.root}>
      <Text style={[Type.bodyStrong, styles.title]}>{proposition.titre}</Text>
      <Text style={[Type.body, styles.text]}>{proposition.description}</Text>

      <View style={styles.block}>
        <Text style={[Type.labelStrong, styles.muted]}>Contexte</Text>
        <Text style={[Type.body, styles.text]}>{proposition.contexte}</Text>
        <Text style={[Type.label, Numeric, styles.muted]}>
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

const styles = StyleSheet.create({
  root: {
    gap: Spacing.two,
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
