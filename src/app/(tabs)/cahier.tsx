import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CandidateAvatar } from '@/components/candidate-avatar';
import { CandidatePanel } from '@/components/candidate-panel';
import { DataFooter } from '@/components/data-footer';
import { Screen } from '@/components/screen';
import { ShareSheet } from '@/components/share-sheet';
import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { ProgressCounter } from '@/components/ui/progress-counter';
import { ReliabilityMark } from '@/components/reliability-mark';
import { VoteTag } from '@/components/vote-tag';
import { Colors, MaxContentWidth, MinTarget, Numeric, Radius, Spacing, Type, VoteColors } from '@/constants/theme';
import { VOTE_CHOICES } from '@/constants/votes';
import { plural } from '@/lib/format';
import { CLASSEMENT_THRESHOLD, opinionCount } from '@/lib/progress';
import { competitionRanks, computeScores, GROUP_VOTE_WEIGHT, MIN_VOTES_PER_CANDIDAT, RELIABILITY_FROM, type CandidateScore, type Reliability } from '@/lib/scoring';
import { fisherYates } from '@/lib/shuffle';
import { candidats, lois, propositions } from '@/services/dataset';
import { useTuto, useTutoTarget } from '@/store/tuto-store';
import { useVotesStore } from '@/store/votes-store';

const MIN_VOTES_REQUIRED = CLASSEMENT_THRESHOLD;
// Départage des égalités tiré au hasard à chaque visite du Cahier : aucun candidat n'est favorisé par son nom.
const shuffleTies = () => new Map(fisherYates(candidats).map((c, i) => [c.id, i]));
const GAP = 8;
// Seyès : un trait fin tous les 8, un trait plus marqué tous les 32, en lignes et en colonnes.
const SEYES_MINOR = 8;
const SEYES_MAJOR = 32;
// Place du ruban qui dépasse au-dessus de chaque fiche.
const TAPE_ROOM = 10;

// Le cahier du lecteur : son Classement, et ses réglages à un toucher de l'en-tête.
export default function CahierScreen() {
  const router = useRouter();
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const { width } = useWindowDimensions();
  const [sharing, setSharing] = useState(false);
  const [tieOrder, setTieOrder] = useState(shuffleTies);
  useFocusEffect(useCallback(() => () => setTieOrder(shuffleTies()), []));

  // « Je ne sais pas » n'ouvre pas le classement : seuls les avis comptent.
  const votedCount = opinionCount(votes, loiVotes);
  const loiCount = Object.keys(loiVotes).length;
  const scores = useMemo(
    () => computeScores(candidats, propositions, votes, tieOrder, { lois, votes: loiVotes }),
    [votes, loiVotes, tieOrder]
  );
  const ranked = scores.filter((s) => s.ranked);
  // Non classés dans l'ordre tiré au hasard seul : un score partiel ne doit pas les départager.
  const others = scores.filter((s) => !s.ranked).sort((a, b) => tieOrder.get(a.candidat.id)! - tieOrder.get(b.candidat.id)!);
  const columns = Math.min(width, MaxContentWidth) < 560 ? 3 : 4;
  useTuto('classement', votedCount >= MIN_VOTES_REQUIRED && ranked.length > 0);
  const settingsTarget = useTutoTarget('reglages');

  return (
    <Screen>
      <ScreenHeader
        title="Cahier"
        note="Votre Classement et vos réglages. Tout reste sur votre appareil."
        accessory={
          <Pressable
            {...settingsTarget}
            onPress={() => router.navigate('/reglages')}
            accessibilityRole="button"
            accessibilityLabel="Réglages"
            style={({ pressed }) => [styles.settings, pressed && { backgroundColor: Colors.pressed }]}>
            <Ionicons name="settings-outline" size={20} color={Colors.ink} />
            <Text style={[Type.labelStrong, styles.ink]}>Réglages</Text>
          </Pressable>
        }
      />

      <Section title="Classement" />
      <Text style={[Type.label, styles.muted]}>Vos votes comparés au programme et aux votes au Parlement de chaque candidat.</Text>

      {votedCount < MIN_VOTES_REQUIRED ? (
        <View style={styles.locked}>
          <Text style={[Type.bodyStrong, styles.ink]}>
            Le classement s’ouvre après {MIN_VOTES_REQUIRED} votes.
          </Text>
          <Text style={[Type.body, styles.soft]}>
            En dessous, quelques notes suffiraient à placer un candidat en tête par hasard.
          </Text>
          <ProgressCounter value={votedCount} total={MIN_VOTES_REQUIRED} unit="votes" track />
          <Button label="Continuer à voter" variant="primary" onPress={() => router.navigate('/')} />
        </View>
      ) : (
        <>
          <Text style={[Type.bodyStrong, styles.ink, styles.heading]} accessibilityRole="header">
            Candidats les plus proches de vos votes
          </Text>
          <Text style={[Type.label, styles.muted]}>
            Sur {plural(votedCount, 'vote')}.
          </Text>
          <HowItWorks showLois={loiCount > 0} />
          {ranked.length > 0 ? (
            <>
              <Board entries={ranked} columns={columns} ranked />
              <Button label="Partager mon classement" icon="share-outline" variant="primary" onPress={() => setSharing(true)} style={styles.share} />
            </>
          ) : (
            <View style={styles.emptyBoard}>
              <Text style={[Type.body, styles.soft]}>
                Aucun candidat n’a encore assez de votes pour être classé : il faut noter au moins {MIN_VOTES_PER_CANDIDAT} de
                ses propositions. Continuez à voter.
              </Text>
              <Button label="Continuer à voter" onPress={() => router.navigate('/')} />
            </View>
          )}

          {others.length > 0 && (
            <>
              <Text style={[Type.bodyStrong, styles.ink, styles.heading]} accessibilityRole="header">
                Pas encore classés
              </Text>
              <Text style={[Type.label, styles.muted]}>Trop peu de leurs propositions ont été votées pour comparer.</Text>
              <OthersList entries={others} />
            </>
          )}
        </>
      )}

      <DataFooter />
      <ShareSheet visible={sharing} onClose={() => setSharing(false)} scores={scores} answered={votedCount} />
    </Screen>
  );
}

// En-tête de partie du cahier, en capitales graphite comme les sections de Lois.
function Section({ title }: { title: string }) {
  return (
    <Text style={[Type.caps, styles.muted, styles.section]} accessibilityRole="header">
      {title}
    </Text>
  );
}

// Paliers de la jauge, en votes qui comptent pour ce candidat.
const RELIABILITY_LEVELS: { level: Reliability; range: string }[] = [
  { level: 'fragile', range: `${MIN_VOTES_PER_CANDIDAT} votes` },
  { level: 'moyen', range: `${RELIABILITY_FROM.moyen} à ${RELIABILITY_FROM.fiable - 1} votes` },
  { level: 'fiable', range: `${RELIABILITY_FROM.fiable} votes et plus` },
];

const LOI_POINTS = [
  { label: 'À l’inverse de vous', sign: '−2', color: VoteColors['-2'] },
  { label: 'Abstention', sign: '0', color: VoteColors['0'] },
  { label: 'Comme vous', sign: '+2', color: VoteColors['2'] },
];

// Le calcul en quatre questions simples, replié pour laisser le Classement en premier.
function HowItWorks({ showLois }: { showLois: boolean }) {
  const [open, setOpen] = useState(false);
  const half = GROUP_VOTE_WEIGHT === 0.5 ? 'moitié' : `${GROUP_VOTE_WEIGHT * 100} %`;
  return (
    <View style={styles.how}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.howToggle, pressed && { backgroundColor: Colors.pressed }]}>
        <Ionicons name="help-circle-outline" size={20} color={Colors.ink} />
        <Text style={[Type.bodyStrong, styles.ink, styles.grow]}>Comment le score est calculé</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.graphite} />
      </Pressable>
      {open && (
        <View style={styles.howBody}>
          <HowStep n={1} title="Vos notes sur son programme">
            <View style={styles.scale}>
              {VOTE_CHOICES.map((c) => (
                <VoteTag key={c.value} value={c.value} />
              ))}
            </View>
            <Text style={[Type.label, styles.soft]}>
              Le score est la moyenne de vos notes sur ses propositions, de 0 à 100 % : que des « Parfait », 100 % ; que des
              « Impossible », 0 %. « Je ne sais pas » ne compte pas.
            </Text>
          </HowStep>
          {showLois && (
            <HowStep n={2} title="Ses votes au Parlement">
              {/* Même lecture que l'échelle des notes : chaque scrutin rapporte +2, 0 ou −2. */}
              <View style={styles.scale}>
                {LOI_POINTS.map((p) => (
                  <Text key={p.label} style={[Type.labelStrong, Numeric, { color: p.color }]}>
                    {p.label} {p.sign}
                  </Text>
                ))}
              </View>
              <Text style={[Type.label, styles.soft]}>
                Pour chaque scrutin auquel vous avez répondu, votre choix est comparé au vote du candidat, s’il était député,
                sénateur ou eurodéputé à ce moment-là. Sinon, on prend le vote de son groupe, qui compte {half}. Un candidat qui
                n’a jamais siégé n’a ni bonus ni malus : son score repose sur son programme seul. Les scrutins ne font jamais plus
                de la moitié du score : le programme reste la base, pour tous.
              </Text>
            </HowStep>
          )}
          <HowStep n={showLois ? 3 : 2} title="Quand il entre au classement">
            <Text style={[Type.label, Numeric, styles.soft]}>
              Il faut avoir noté au moins {MIN_VOTES_PER_CANDIDAT} de ses propositions. Avant, il reste dans « Pas encore classés ».
              Ensuite, la jauge dit sur combien de vos votes repose son score :
            </Text>
            <View style={styles.levels}>
              {RELIABILITY_LEVELS.map((l) => (
                <View key={l.level} style={styles.level}>
                  <ReliabilityMark level={l.level} />
                  <Text style={[Type.label, Numeric, styles.soft]}>{l.range}</Text>
                </View>
              ))}
            </View>
            {showLois && <Text style={[Type.label, styles.soft]}>Un vote de groupe compte pour ½.</Text>}
          </HowStep>
          <HowStep n={showLois ? 4 : 3} title="En cas d’égalité">
            <Text style={[Type.label, styles.soft]}>
              Même score, même rang (« ex æquo »), dans un ordre tiré au hasard à chaque ouverture : ni par nom, ni par nombre de
              votes.
            </Text>
          </HowStep>
        </View>
      )}
    </View>
  );
}

function HowStep({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNumber}>
        <Text style={[Type.labelStrong, Numeric, styles.ink]}>{n}</Text>
      </View>
      <View style={[styles.grow, styles.stepText]}>
        <Text style={[Type.labelStrong, styles.ink]}>{title}</Text>
        {children}
      </View>
    </View>
  );
}

// Les candidats pas encore classés : une liste simple, pour ne pas les confondre avec le panneau du Classement.
function OthersList({ entries }: { entries: CandidateScore[] }) {
  const router = useRouter();
  return (
    <View style={styles.others}>
      {entries.map(({ candidat, programme }, i) => {
        // Il est classé à partir de MIN_VOTES_PER_CANDIDAT propositions notées : on montre où il en est.
        const noted = `${programme.count} / ${MIN_VOTES_PER_CANDIDAT} notées`;
        const label = `${programme.count} proposition${programme.count > 1 ? 's' : ''} notée${programme.count > 1 ? 's' : ''} sur ${MIN_VOTES_PER_CANDIDAT} nécessaires`;
        return (
          <Pressable
            key={candidat.id}
            onPress={() => router.push(`/candidate/${candidat.id}`)}
            accessibilityRole="link"
            accessibilityLabel={`${candidat.nom}, ${candidat.parti}, pas encore classé, ${label}`}
            style={({ pressed }) => [styles.otherRow, i > 0 && styles.otherSeparator, pressed && { backgroundColor: Colors.pressed }]}>
            <CandidateAvatar candidat={candidat} size={36} ring={candidat.couleurParti} />
            <View style={styles.grow}>
              <Text style={[Type.bodyStrong, styles.ink]} numberOfLines={1}>
                {candidat.nom}
              </Text>
              <Text style={[Type.label, styles.muted]} numberOfLines={1}>
                {candidat.parti}
              </Text>
            </View>
            <Text style={[Type.label, Numeric, styles.muted]}>{noted}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.graphite} />
          </Pressable>
        );
      })}
    </View>
  );
}

// La page quadrillée du cahier, au filet : le fond sur lequel les fiches sont collées.
function SeyesGrid({ width, height }: { width: number; height: number }) {
  if (!width || !height) {
    return null;
  }
  let minor = '';
  let major = '';
  for (let y = SEYES_MINOR; y < height; y += SEYES_MINOR) {
    if (y % SEYES_MAJOR === 0) {
      major += `M0 ${y}H${width}`;
    } else {
      minor += `M0 ${y}H${width}`;
    }
  }
  for (let x = SEYES_MAJOR; x < width; x += SEYES_MAJOR) {
    major += `M${x} 0V${height}`;
  }
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d={minor} stroke={Colors.ruleSoft} strokeWidth={1} />
      <Path d={major} stroke={Colors.rule} strokeWidth={1} />
    </Svg>
  );
}

// Le Classement : des fiches identiques, collées au ruban sur la page quadrillée.
function Board({ entries, columns, ranked = false }: { entries: CandidateScore[]; columns: number; ranked?: boolean }) {
  const [inner, setInner] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const slot = inner > 0 ? { width: (inner - GAP * (columns - 1)) / columns } : { flex: 1 };
  const ranks = competitionRanks(entries);
  const tied = (i: number) => ranks.filter((r) => r === ranks[i]).length > 1;
  const rows: CandidateScore[][] = [];
  for (let i = 0; i < entries.length; i += columns) {
    rows.push(entries.slice(i, i + columns));
  }

  return (
    <View
      style={styles.board}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setInner(width - GAP * 2);
        setSize({ width, height });
      }}>
      <SeyesGrid width={size.width} height={size.height} />
      {rows.map((row, r) => (
        <View key={r} style={styles.boardRow}>
          {row.map((entry, c) => (
            <CandidatePanel
              key={entry.candidat.id}
              style={slot}
              entry={entry}
              rank={ranked ? ranks[r * columns + c] : undefined}
              tied={ranked && tied(r * columns + c)}
              tutoTarget={ranked && r === 0 && c === 0 ? 'panneau' : undefined}
            />
          ))}
          {Array.from({ length: columns - row.length }, (_, k) => (
            <View key={`empty-${k}`} style={slot} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  how: {
    marginTop: Spacing.one,
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    overflow: 'hidden',
  },
  howToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 52,
    paddingHorizontal: Spacing.two,
  },
  howBody: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingTop: 12,
    paddingBottom: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ruleSoft,
  },
  stepText: {
    gap: 4,
  },
  levels: {
    gap: 4,
  },
  level: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scale: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 2,
  },
  grow: {
    flex: 1,
  },
  locked: {
    marginTop: Spacing.two,
    gap: Spacing.two,
    padding: Spacing.two,
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  share: {
    marginTop: Spacing.two,
  },
  emptyBoard: {
    marginTop: Spacing.two,
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.rule,
  },
  heading: {
    marginTop: Spacing.three,
    marginBottom: Spacing.half,
  },
  board: {
    marginTop: Spacing.two,
    paddingHorizontal: GAP,
    paddingTop: GAP + TAPE_ROOM,
    paddingBottom: GAP,
    gap: GAP + TAPE_ROOM,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    overflow: 'hidden',
  },
  others: {
    marginTop: Spacing.two,
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    overflow: 'hidden',
  },
  otherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  otherSeparator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  boardRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  section: {
    marginBottom: Spacing.half,
  },
  settings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: MinTarget,
    paddingHorizontal: 12,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    backgroundColor: Colors.sheet,
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
});
