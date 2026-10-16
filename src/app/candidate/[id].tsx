import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { CandidateAvatar } from '@/components/candidate-avatar';
import { DataFooter } from '@/components/data-footer';
import { LoiCard } from '@/components/loi-card';
import { LoiDetail } from '@/components/loi-detail';
import { PropositionDetail } from '@/components/proposition-detail';
import { PropositionRow } from '@/components/proposition-row';
import { Screen } from '@/components/screen';
import { ThemeMark } from '@/components/theme-mark';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Sheet } from '@/components/ui/sheet';
import { ReliabilityMark, reliabilityHint } from '@/components/reliability-mark';
import { ScoreCalcul } from '@/components/score-calcul';
import { Colors, MinTarget, Numeric, Radius, Spacing, Type } from '@/constants/theme';
import { readableOn } from '@/lib/color';
import { candidatureText, plural } from '@/lib/format';
import { MIN_VOTES_PER_CANDIDAT, scoreCandidat, scoreDetail } from '@/lib/scoring';
import type { Loi, Proposition } from '@/schemas/dataset';
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
  const [selectedLoi, setSelectedLoi] = useState<Loi | null>(null);
  const [calcul, setCalcul] = useState(false);

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

      {/* L'affiche du candidat : bandeau, anneau et sigle aux couleurs de son parti, comme sur son panneau du Classement. */}
      <View style={[styles.band, { backgroundColor: candidat.couleurParti }]} />
      <View style={styles.identity}>
        <CandidateAvatar candidat={candidat} size={72} ring={candidat.couleurParti} />
        <View style={[styles.flex, styles.identityText]}>
          <Text style={[Type.display, styles.ink]} accessibilityRole="header">
            {candidat.nom}
          </Text>
          {/* Le nom du parti dans sa couleur, foncée si besoin pour rester lisible. */}
          <Text style={[Type.labelStrong, { color: readableOn(candidat.couleurParti, Colors.paper) }]}>{candidat.parti}</Text>
          {/* Le classement du ministère, sourcé ; jamais le nôtre. */}
          {parti?.nuanceOfficielle ? (
            <Pressable onPress={() => Linking.openURL(parti.nuanceOfficielle!.sourceUrl)} accessibilityRole="link" hitSlop={4}>
              <Text style={[Type.label, styles.muted]}>
                Nuance du ministère de l’Intérieur ({parti.nuanceOfficielle.election}) :{' '}
                <Text style={[Type.labelStrong, styles.ink, styles.underline]}>{parti.nuanceOfficielle.libelle}</Text>
              </Text>
            </Pressable>
          ) : (
            <Text style={[Type.label, styles.muted]}>Pas de nuance du ministère de l’Intérieur : le parti n’a pas été classé.</Text>
          )}
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

      {/* Touchée, la carte pose le calcul : de quoi vérifier le pourcentage à la main. */}
      <Pressable
        disabled={score.score === null}
        onPress={() => setCalcul(true)}
        accessibilityRole={score.score === null ? undefined : 'button'}
        accessibilityHint="Montre le détail du calcul"
        accessibilityLabel={score.score === null ? 'Accord : pas encore évalué' : `Accord avec vos votes : ${score.score} %, sur ${plural(score.totalVotes, 'vote')}`}
        style={({ pressed }) => [styles.accord, pressed && { backgroundColor: Colors.pressed }]}>
        {/* En-tête : le score en grand à gauche, sa fiabilité dans l'angle. */}
        <View style={styles.accordHead}>
          <View style={styles.accordScore}>
            <Text style={[Type.label, styles.muted]}>Accord avec vos votes</Text>
            {score.score === null ? (
              <Text style={[Type.bodyStrong, styles.ink]}>Pas encore évalué : votez sur ses propositions à l’aveugle.</Text>
            ) : (
              <Text style={[Type.screenTitle, Numeric, styles.ink]}>{score.score} %</Text>
            )}
          </View>
          {score.score !== null && score.reliability && <ReliabilityMark level={score.reliability} />}
        </View>
        {score.score !== null && (
          <>
            {/* Les deux sources du score, côte à côte. */}
            <View style={styles.accordCols}>
              <View style={styles.accordCol}>
                <Text style={[Type.label, styles.muted]}>Programme</Text>
                <Text style={[Type.bodyStrong, Numeric, styles.ink]}>{score.programme.score === null ? '-' : `${score.programme.score} %`}</Text>
                <Text style={[Type.label, Numeric, styles.muted]}>
                  {score.programme.score === null ? 'aucune proposition votée' : `${score.programme.count} sur ${plural(props.length, 'proposition')}`}
                </Text>
              </View>
              <View style={[styles.accordCol, styles.accordColRule]}>
                <Text style={[Type.label, styles.muted]}>Votes au Parlement</Text>
                <Text style={[Type.bodyStrong, Numeric, styles.ink]}>
                  {!score.seated || score.parlement.score === null ? '-' : `${score.parlement.score} %`}
                </Text>
                <Text style={[Type.label, Numeric, styles.muted]}>
                  {!score.seated
                    ? 'n’a pas siégé : programme seul'
                    : score.parlement.score === null
                      ? 'aucun de ses scrutins voté'
                      : `${plural(score.parlement.count, 'scrutin')}${score.parlement.groupCount > 0 ? `, dont ${score.parlement.groupCount} de groupe (½)` : ''}`}
                </Text>
              </View>
            </View>
            <Text style={[Type.label, Numeric, styles.muted, styles.accordFoot]}>
              {score.reliability
                ? `Sur ${plural(score.programme.count, 'proposition')}${score.parlement.count > 0 ? ` et ${plural(score.parlement.count, 'scrutin')}` : ''} : ${reliabilityHint(score.reliability)}.`
                : `Score indicatif : il faut ${MIN_VOTES_PER_CANDIDAT} votes pour le classer.`}
            </Text>
            <View style={styles.accordLink}>
              <Text style={[Type.labelStrong, styles.underline]}>Voir le calcul</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.ink} />
            </View>
          </>
        )}
      </Pressable>

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
            <LoiCard key={loi.id} loi={loi} candidatId={candidat.id} userVote={loiVotes[loi.id]} onPress={() => setSelectedLoi(loi)} />
          ))}
        </View>
      )}

      <DataFooter />

      <Sheet visible={!!selected} title={selected?.ref ?? ''} onClose={() => setSelected(null)}>
        {selected && <PropositionDetail proposition={selected} anonymous={false} />}
      </Sheet>
      <Sheet visible={calcul} title="Le calcul" onClose={() => setCalcul(false)}>
        {calcul && <ScoreCalcul detail={scoreDetail(candidat, propositions, votes, { lois, votes: loiVotes })} />}
      </Sheet>
      <Sheet visible={!!selectedLoi} title={selectedLoi?.ref ?? ''} onClose={() => setSelectedLoi(null)}>
        {selectedLoi && <LoiDetail loi={selectedLoi} candidatId={candidat.id} />}
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
  // Pleine largeur : déborde de la gouttière de la colonne.
  band: {
    height: 6,
    marginHorizontal: -Spacing.two,
    marginTop: Spacing.one,
  },
  identityText: {
    gap: 4,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  link: {
    marginTop: Spacing.one,
    minHeight: 32,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  accordHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  accordScore: {
    flex: 1,
  },
  accordCols: {
    flexDirection: 'row',
    marginTop: Spacing.two,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  accordCol: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
  // Filet entre les deux colonnes.
  accordColRule: {
    paddingLeft: 12,
    paddingRight: 0,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.rule,
  },
  accordFoot: {
    marginTop: 12,
  },
  accordLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: Spacing.one,
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
