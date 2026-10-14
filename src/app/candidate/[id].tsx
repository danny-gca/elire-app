import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { CandidateAvatar } from '@/components/candidate-avatar';
import { DataFooter } from '@/components/data-footer';
import { LoiCard } from '@/components/loi-card';
import { PropositionDetail } from '@/components/proposition-detail';
import { PropositionRow } from '@/components/proposition-row';
import { Screen } from '@/components/screen';
import { ThemeMark } from '@/components/theme-mark';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Sheet } from '@/components/ui/sheet';
import { ReliabilityMark, reliabilityHint } from '@/components/reliability-mark';
import { Colors, MinTarget, Numeric, Radius, Spacing, Type } from '@/constants/theme';
import { candidatureText, plural } from '@/lib/format';
import { MIN_VOTES_PER_CANDIDAT, scoreCandidat } from '@/lib/scoring';
import type { Proposition } from '@/schemas/dataset';
import { getCandidat, getLoisByCandidat, getPropositionsByCandidat, lois, partis, propositions, thematiques } from '@/services/dataset';
import { useVotesStore } from '@/store/votes-store';

type Onglet = 'programme' | 'lois';

export default function CandidateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const [onglet, setOnglet] = useState<Onglet>('programme');
  const [selected, setSelected] = useState<Proposition | null>(null);

  const candidat = getCandidat(id);
  const parti = partis.find((p) => p.id === candidat?.partiId);
  const props = useMemo(() => getPropositionsByCandidat(id), [id]);
  const loisVotes = useMemo(() => getLoisByCandidat(id), [id]);
  const groups = useMemo(
    () => thematiques.map((t) => ({ theme: t, items: props.filter((p) => p.thematiqueId === t.id) })).filter((g) => g.items.length > 0),
    [props]
  );

  const back = (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.navigate('/results'))}
      accessibilityRole="button"
      accessibilityLabel="Retour"
      hitSlop={8}
      style={styles.back}>
      <Ionicons name="chevron-back" size={26} color={Colors.ink} />
    </Pressable>
  );

  if (!candidat) {
    return (
      <Screen>
        {back}
        <Text style={[Type.bodyStrong, styles.ink]}>Ce candidat n’existe pas ou plus dans les données.</Text>
      </Screen>
    );
  }

  const score = scoreCandidat(candidat, propositions, votes, { lois, votes: loiVotes });

  return (
    <Screen>
      {back}

      <View style={styles.identity}>
        <CandidateAvatar candidat={candidat} size={72} />
        <View style={styles.flex}>
          <Text style={[Type.display, styles.ink]} accessibilityRole="header">
            {candidat.nom}
          </Text>
          <Text style={[Type.label, styles.muted]}>
            {candidat.parti}
            {parti ? ` · ${parti.nuance}` : ''}
          </Text>
        </View>
      </View>

      <Text style={[Type.body, styles.soft]}>{candidat.biographie}</Text>
      <Pressable
        onPress={() => Linking.openURL(candidat.candidature.sourceUrl)}
        accessibilityRole="link"
        accessibilityHint="Ouvre la source de la candidature"
        hitSlop={8}
        style={styles.link}>
        <Text style={[Type.labelStrong, styles.underline]}>{candidatureText(candidat.candidature)}</Text>
      </Pressable>
      {parti && (
        <Pressable onPress={() => Linking.openURL(parti.siteWeb)} accessibilityRole="link" hitSlop={8} style={styles.link}>
          <Text style={[Type.labelStrong, styles.underline]}>Site du parti · {new URL(parti.siteWeb).hostname.replace(/^www\./, '')}</Text>
        </Pressable>
      )}

      <View style={styles.accord} accessible accessibilityLabel={score.score === null ? 'Accord : pas encore évalué' : `Accord avec vos votes : ${score.score} %, sur ${plural(score.totalVotes, 'vote')}`}>
        <Text style={[Type.label, styles.muted]}>Accord avec vos votes</Text>
        {score.score === null ? (
          <Text style={[Type.bodyStrong, styles.ink]}>Pas encore évalué : votez sur ses propositions à l’aveugle.</Text>
        ) : (
          <>
            <Text style={[Type.bodyStrong, Numeric, styles.ink]}>{score.score} %</Text>
            <Text style={[Type.label, Numeric, styles.muted]}>
              Programme :{' '}
              {score.programme.score === null
                ? 'aucune proposition votée'
                : `${score.programme.score} % (${score.programme.count} sur ${plural(props.length, 'proposition')})`}
            </Text>
            <Text style={[Type.label, Numeric, styles.muted]}>
              Votes au Parlement :{' '}
              {!score.seated
                ? 'n’a pas siégé, score calculé sur le programme seul'
                : score.parlement.score === null
                  ? 'aucun de ses scrutins voté'
                  : `${score.parlement.score} % (${plural(score.parlement.count, 'scrutin')}${
                      score.parlement.groupCount > 0 ? `, dont ${score.parlement.groupCount} de groupe, comptés à moitié` : ''
                    })`}
            </Text>
            {score.reliability ? (
              <View style={styles.reliability}>
                <ReliabilityMark level={score.reliability} />
                <Text style={[Type.label, Numeric, styles.muted]}>
                  sur {plural(score.programme.count, 'proposition')}
                  {score.parlement.count > 0 ? ` et ${plural(score.parlement.count, 'scrutin')}` : ''} : {reliabilityHint(score.reliability)}.
                </Text>
              </View>
            ) : (
              <Text style={[Type.label, styles.muted]}>Score indicatif : il faut {MIN_VOTES_PER_CANDIDAT} votes pour le classer.</Text>
            )}
          </>
        )}
      </View>

      <SegmentedControl<Onglet>
        accessibilityLabel="Contenu de la fiche"
        value={onglet}
        onChange={setOnglet}
        segments={[
          { value: 'programme', label: 'Programme 2027', count: props.length },
          { value: 'lois', label: 'Votes au Parlement', count: loisVotes.length },
        ]}
      />

      {onglet === 'programme' ? (
        <View style={styles.section}>
          {groups.map((g) => (
            <View key={g.theme.id} style={styles.group}>
              <View style={styles.groupHeader}>
                <ThemeMark thematiqueId={g.theme.id} size={28} />
                <Text style={[Type.bodyStrong, styles.ink]} accessibilityRole="header">
                  {g.theme.titre}
                </Text>
              </View>
              <View style={styles.list}>
                {g.items.map((p, i) => (
                  <View key={p.id} style={i > 0 && styles.separator}>
                    <PropositionRow proposition={p} vote={votes[p.id]} onPress={() => setSelected(p)} />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : loisVotes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[Type.bodyStrong, styles.ink]}>N’a pas siégé sur ces scrutins.</Text>
          <Text style={[Type.body, styles.soft]}>
            Aucun des {plural(lois.length, 'texte')} suivis n’a été voté par ce candidat ou son groupe : seuls les élus siégeant au
            Parlement ont des votes.
          </Text>
          <Button label="Voir tous les scrutins" onPress={() => router.navigate('/lois')} />
        </View>
      ) : (
        <View style={styles.section}>
          {loisVotes.map(({ loi }) => (
            <LoiCard key={loi.id} loi={loi} candidatId={candidat.id} userVote={loiVotes[loi.id]} />
          ))}
        </View>
      )}

      <DataFooter />

      <Sheet visible={!!selected} title={selected?.ref ?? ''} onClose={() => setSelected(null)}>
        {selected && <PropositionDetail proposition={selected} anonymous={false} />}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: MinTarget,
    height: MinTarget,
    marginLeft: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  link: {
    marginTop: Spacing.one,
    minHeight: 32,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  reliability: {
    gap: Spacing.half,
  },
  accord: {
    marginVertical: Spacing.three,
    paddingVertical: 12,
    paddingHorizontal: Spacing.two,
    backgroundColor: Colors.sheet,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    gap: 2,
  },
  section: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  group: {
    gap: Spacing.one,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  list: {
    borderRadius: Radius.large,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  empty: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
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
