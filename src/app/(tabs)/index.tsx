import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { BUTTON_STROKE_MS } from '@/components/button-stroke';
import { Hemicycle } from '@/components/hemicycle';
import { LoiVoteScale } from '@/components/loi-vote-scale';
import { Marked } from '@/components/marked';
import { MoreInfo } from '@/components/more-info';
import { PropositionRow } from '@/components/proposition-row';
import { PropositionSheet } from '@/components/proposition-sheet';
import { SWEEP_MS } from '@/components/sweep-text';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { ProgressCounter } from '@/components/ui/progress-counter';
import { Sheet } from '@/components/ui/sheet';
import { VoteScale } from '@/components/vote-scale';
import { LoiVoteTag, VoteTag } from '@/components/vote-tag';
import { Colors, Markers, Numeric, Radius, Spacing, Type } from '@/constants/theme';
import { loiChoice, voteChoice } from '@/constants/votes';
import { CHAMBRE_LABELS, STATUT_LABELS, formatDate } from '@/lib/format';
import { averageText, CLASSEMENT_THRESHOLD, isPause, nextMilestone, opinionCount, rankedCount, type Milestone } from '@/lib/progress';
import { scoreCandidat, UNSURE, type LoiVoteValue, type VoteValue } from '@/lib/scoring';
import type { Loi } from '@/schemas/dataset';
import { candidats, getThematique, lois, propositions } from '@/services/dataset';
import { selectNextId, useMarkOf, useVotesStore } from '@/store/votes-store';

const byId = new Map(propositions.map((p) => [p.id, p]));
const loisById = new Map(lois.map((l) => [l.id, l]));
const TOTAL = propositions.length + lois.length;
// La feuille votée remonte se ranger en « Dernier vote ».
const LEAVE_MS = 320;
// Après un scrutin, le temps de lire l'hémicycle et le résultat, puis la suite part seule comme pour une proposition.
const AUTO_NEXT_MS = 5000;

type Phase = 'button' | 'title' | 'leaving';

export default function VoterScreen() {
  const router = useRouter();
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const order = useVotesStore((s) => s.order);
  const castVote = useVotesStore((s) => s.castVote);
  const castLoiVote = useVotesStore((s) => s.castLoiVote);

  const [lastId, setLastId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  // Scrutin tout juste voté : reste affiché le temps de lire l'hémicycle.
  const [revealId, setRevealId] = useState<string | null>(null);
  // Geste du vote sur une proposition : trait sur le bouton, trait sur le titre, puis la feuille remonte.
  const [hold, setHold] = useState<{ id: string; value: VoteValue; phase: Phase } | null>(null);
  const [loiLeaving, setLoiLeaving] = useState(false);
  // Pause passée par « 10 questions de plus » : elle ne revient qu'à la dizaine suivante.
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const marker = useVotesStore((s) => s.marker);
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!hold) {
      return;
    }
    // « Je ne sais pas » : pas de trait sur le titre, aucun avis n'est posé.
    const next = hold.phase === 'button' ? (hold.value === UNSURE ? 'leaving' : 'title') : hold.phase === 'title' ? 'leaving' : null;
    const delay = hold.phase === 'button' ? BUTTON_STROKE_MS : hold.phase === 'title' ? SWEEP_MS : LEAVE_MS;
    const timer = setTimeout(() => {
      if (next) {
        setHold({ ...hold, phase: next });
      } else {
        setLastId(hold.id);
        setHold(null);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [hold]);

  // Après l'hémicycle, la question suivante repart du haut de l'écran.
  useEffect(() => {
    if (!revealId) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [revealId]);

  const currentId = revealId ?? hold?.id ?? selectNextId({ votes, loiVotes, order });
  const current = currentId ? byId.get(currentId) : undefined;
  const currentLoi = currentId ? loisById.get(currentId) : undefined;
  const votedCount = Object.keys(votes).length + Object.keys(loiVotes).length;
  const opinions = opinionCount(votes, loiVotes);
  const ranked = rankedCount(propositions, votes);
  const milestone = nextMilestone(opinions, ranked, candidats.length);
  const pause = !hold && !revealId && isPause(opinions) && pausedAt !== opinions;

  const handleVote = (value: VoteValue) => {
    if (!current) {
      return;
    }
    castVote(current.id, value);
    AccessibilityInfo.announceForAccessibility(`Vote enregistré : ${voteChoice(value)?.label ?? ''}`);
    if (reducedMotion) {
      setLastId(current.id);
    } else {
      setHold({ id: current.id, value, phase: 'button' });
    }
  };

  const handleLoiVote = (value: LoiVoteValue) => {
    if (!currentLoi) {
      return;
    }
    castLoiVote(currentLoi.id, value);
    setRevealId(currentLoi.id);
    AccessibilityInfo.announceForAccessibility(`Vote enregistré : ${loiChoice(value)?.label ?? ''}`);
  };

  const handleNext = () => {
    const done = () => {
      setLoiLeaving(false);
      setLastId(revealId);
      setRevealId(null);
    };
    if (reducedMotion) {
      done();
      return;
    }
    setLoiLeaving(true);
    setTimeout(done, LEAVE_MS);
  };

  const counter = <ProgressCounter value={votedCount} total={TOTAL} unit="votes" />;

  if (!current && !currentLoi) {
    return (
      <>
        <FinishedView onEdit={setEditing} onSeeRanking={() => router.navigate('/results')} counter={counter} />
        <EditVoteSheet id={editing} onClose={() => setEditing(null)} />
      </>
    );
  }

  return (
    <Screen scrollRef={scrollRef}>
      <ScreenHeader title="Voter" />
      <MilestoneLine milestone={milestone} />

      {votedCount === 0 && (
        <Text style={[Type.label, styles.soft, styles.intro]}>
          Comptez environ 20 secondes par question : votre Classement s’ouvre après {CLASSEMENT_THRESHOLD} votes, soit 3 à 5
          minutes. Arrêtez quand vous voulez, vos votes restent sur votre appareil.
        </Text>
      )}

      {lastId && !revealId && <LastVote key={lastId} id={lastId} onPress={() => setEditing(lastId)} />}

      {pause ? (
        <PauseCard opinions={opinions} ranked={ranked} onSeeRanking={() => router.navigate('/results')} onContinue={() => setPausedAt(opinions)} />
      ) : currentLoi ? (
        <LoiBallot
          key={currentLoi.id}
          loi={currentLoi}
          value={loiVotes[currentLoi.id]}
          revealed={revealId === currentLoi.id}
          leaving={loiLeaving}
          animate={!reducedMotion}
          onVote={handleLoiVote}
          onNext={handleNext}
          onRevealLayout={() => scrollRef.current?.scrollToEnd({ animated: true })}
        />
      ) : (
        current && (
          <>
            <Leaving key={current.id} leaving={hold?.phase === 'leaving'} style={styles.sheetWrap}>
              <PropositionSheet
                proposition={current}
                sweep={hold && hold.phase !== 'button' && hold.value !== UNSURE ? marker : undefined}
                thematique={getThematique(current.thematiqueId)}>
                <MoreInfo text={current.contexte} terms={[current.titre, current.description, current.contexte]} />
              </PropositionSheet>
            </Leaving>

            <View style={styles.avis}>
              <Text style={[Type.note, styles.ink]} accessibilityRole="header">
                Votre avis
              </Text>
              <Text style={[Type.label, styles.muted]}>L’auteur reste masqué : vous jugez la mesure, pas la personne.</Text>
              <VoteScale
                value={hold?.value}
                onVote={handleVote}
                disabled={!!hold}
                stroke={hold ? { value: hold.value, color: Markers[marker].soft } : undefined}
              />
            </View>
          </>
        )
      )}

      <EditVoteSheet id={editing} onClose={() => setEditing(null)} />
    </Screen>
  );
}

// Entre en fondu ; quand le vote est posé, remonte vers « Dernier vote » en s'effaçant.
function Leaving({ leaving, style, children }: { leaving: boolean; style?: object; children: React.ReactNode }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (leaving) {
      progress.value = withTiming(1, { duration: LEAVE_MS, easing: Easing.in(Easing.quad) });
    }
  }, [leaving, progress]);
  const animated = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: -56 * progress.value }, { scale: 1 - 0.06 * progress.value }],
  }));
  return (
    <Animated.View entering={FadeIn.duration(220)} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}

// Un scrutin réel : la question anonyme, trois choix, puis l'hémicycle de ceux qui l'ont voté.
function LoiBallot({
  loi,
  value,
  revealed,
  leaving,
  animate,
  onVote,
  onNext,
  onRevealLayout,
}: {
  loi: Loi;
  value?: LoiVoteValue;
  revealed: boolean;
  leaving: boolean;
  /** Faux si « Réduire les animations » : l'hémicycle apparaît tout de suite. */
  animate: boolean;
  onVote: (value: LoiVoteValue) => void;
  onNext: () => void;
  /** L'hémicycle s'ouvre sous la rangée de vote : l'écran défile jusqu'à lui une fois posé. */
  onRevealLayout: () => void;
}) {
  const voters = Object.keys(loi.votes).length;
  const marker = useMarkOf(loi.id);
  // Après le vote : trait sur le bouton, puis sur la question, puis l'hémicycle.
  const [step, setStep] = useState<'button' | 'title' | 'hemicycle'>(animate ? 'button' : 'hemicycle');
  const screenReader = useScreenReader();
  const autoNext = revealed && step === 'hemicycle' && !leaving && !screenReader;
  const countdown = useSharedValue(0);
  const nextRef = useRef(onNext);
  useEffect(() => {
    nextRef.current = onNext;
  });
  useEffect(() => {
    if (!autoNext) {
      return;
    }
    countdown.value = 0;
    countdown.value = withTiming(1, { duration: AUTO_NEXT_MS, easing: Easing.linear });
    const timer = setTimeout(() => nextRef.current(), AUTO_NEXT_MS);
    return () => clearTimeout(timer);
  }, [autoNext, countdown]);
  const countdownStyle = useAnimatedStyle(() => ({ width: `${countdown.value * 100}%` }));
  useEffect(() => {
    if (!revealed || step === 'hemicycle') {
      return;
    }
    const timer = setTimeout(() => setStep(step === 'button' ? 'title' : 'hemicycle'), step === 'button' ? BUTTON_STROKE_MS : SWEEP_MS);
    return () => clearTimeout(timer);
  }, [revealed, step]);

  return (
    <Leaving leaving={leaving}>
      <View style={styles.sheetWrap}>
        <PropositionSheet
          kind="Scrutin"
          sweep={revealed && step !== 'button' ? marker : undefined}
          proposition={{ ref: loi.ref, thematiqueId: loi.thematiqueId, titre: loi.question }}
          thematique={getThematique(loi.thematiqueId)}>
          <Text style={[Type.label, Numeric, styles.muted]}>
            Scrutin réel · {CHAMBRE_LABELS[loi.chambre]} · {loi.dateVote.slice(0, 4)}
          </Text>
          <MoreInfo text={loi.enjeu} terms={[loi.question, loi.enjeu]} />
        </PropositionSheet>
      </View>

      <View style={styles.avis}>
        <Text style={[Type.note, styles.ink]} accessibilityRole="header">
          Votre vote
        </Text>
        <Text style={[Type.label, styles.muted]}>
          {voters > 1 ? `${voters} candidats ont voté ce texte` : 'Un candidat a voté ce texte'} : votre choix les rapproche ou
          les éloigne de vous.
        </Text>
        <LoiVoteScale
          value={value}
          onVote={onVote}
          disabled={revealed}
          stroke={revealed && value ? { value, color: Markers[marker].soft } : undefined}
        />
      </View>

      {revealed && value && step === 'hemicycle' && (
        <View style={styles.reveal} onLayout={onRevealLayout}>
          <Hemicycle loi={loi} user={value} markColor={Markers[marker].solid} />
          <View style={styles.outcome}>
            <Text style={[Type.bodyStrong, styles.ink]}>{loi.titre}</Text>
            <Text style={[Type.label, Numeric, styles.muted]}>
              {loi.ref} · <Text style={[Type.labelStrong, styles.ink]}>{STATUT_LABELS[loi.statut]}</Text> ·{' '}
              {formatDate(loi.dateVote)}
            </Text>
          </View>
          <View style={styles.next}>
            <Button label="Question suivante" variant="primary" onPress={onNext} disabled={leaving} />
            {/* Sans lecteur d'écran, la suite part seule : le filet montre le temps restant. */}
            {!screenReader && (
              <View style={styles.track} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <Animated.View style={[styles.trackFill, countdownStyle]} />
              </View>
            )}
          </View>
        </View>
      )}
    </Leaving>
  );
}

// Avec un lecteur d'écran, rien ne part seul : la personne avance à son rythme (non détectable sur le web, qui répond toujours oui).
function useScreenReader() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    AccessibilityInfo.isScreenReaderEnabled().then(setEnabled);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => sub.remove();
  }, []);
  return enabled;
}

// Le prochain palier, pas le total : « 4 votes avant votre Classement », puis « 9 candidats classés sur 17 ».
function MilestoneLine({ milestone }: { milestone: Milestone }) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${milestone.value} ${milestone.text}`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(milestone.ratio * 100) }}
      style={styles.milestone}>
      <Text style={[Type.label, Numeric, styles.muted]}>
        <Text style={[Type.labelStrong, Numeric, styles.ink]}>{milestone.value}</Text> {milestone.text}
      </Text>
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${Math.min(1, milestone.ratio) * 100}%` }]} />
      </View>
    </View>
  );
}

// Remplissage d'un panneau du bilan : aucune note, une seule, puis la fiabilité du score classé.
const FILL = { none: 0, note: 1 / 3, fragile: 1 / 3, moyen: 2 / 3, fiable: 1 } as const;
type Fill = keyof typeof FILL;
const FILL_ORDER: Fill[] = ['fiable', 'moyen', 'fragile', 'note', 'none'];

function PauseCard({
  opinions,
  ranked,
  onSeeRanking,
  onContinue,
}: {
  opinions: number;
  ranked: number;
  onSeeRanking: () => void;
  onContinue: () => void;
}) {
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const scores = candidats.map((c) => scoreCandidat(c, propositions, votes, { lois, votes: loiVotes }));
  const average = averageText(scores.map((s) => s.programme.count));
  const fills = scores
    .map((s): Fill => s.reliability ?? (s.programme.count > 0 ? 'note' : 'none'))
    .sort((a, b) => FILL_ORDER.indexOf(a) - FILL_ORDER.indexOf(b));
  const reliable = fills.filter((f) => f === 'fiable').length;
  const all = ranked >= candidats.length;
  const title = all
    ? `${opinions} votes : les ${candidats.length} candidats sont classés.`
    : opinions === CLASSEMENT_THRESHOLD
      ? 'Votre Classement est ouvert, mais encore fragile.'
      : `${opinions} votes : votre Classement s’affine.`;
  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.pause}>
      <Text style={[Type.display, styles.ink]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[Type.body, styles.soft]}>
        En moyenne <Text style={[Type.bodyStrong, Numeric, styles.ink]}>{average}</Text> proposition
        {Number(average.replace(',', '.')) >= 2 ? 's notées' : ' notée'} par candidat ; il en faut 2 pour le classer, et 5 éléments pour un score fiable.
      </Text>
      <View accessible accessibilityLabel={`${ranked} candidats classés sur ${candidats.length}`} style={styles.panels}>
        {fills.map((f, i) => (
          <View key={i} style={styles.panel}>
            <View style={[styles.panelFill, { height: `${FILL[f] * 100}%` }, f === 'note' && styles.panelNote]} />
          </View>
        ))}
      </View>
      <Text style={[Type.label, Numeric, styles.muted]}>
        {ranked} {ranked > 1 ? 'candidats classés' : 'candidat classé'} sur {candidats.length} · {reliable}{' '}
        {reliable > 1 ? 'scores fiables' : 'score fiable'}
      </Text>
      <Text style={[Type.body, styles.soft]}>
        {reliable >= candidats.length
          ? 'Tous les scores sont fiables : chaque question de plus les précise encore.'
          : 'Dix questions de plus, environ 3 minutes, et votre score devient plus fiable.'}
      </Text>
      <Button label="10 questions de plus" variant="primary" onPress={onContinue} />
      <Button label="Voir le Classement" onPress={onSeeRanking} />
      <Text style={[Type.label, styles.muted]}>Arrêtez quand vous voulez, vos votes restent sur votre appareil.</Text>
    </Animated.View>
  );
}

// Signature : le trait de surligneur balaie le dernier titre voté de gauche à droite.
function LastVote({ id, onPress }: { id: string; onPress: () => void }) {
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 220 });
  }, [progress]);
  const stroke = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  const marker = useMarkOf(id);

  const loi = loisById.get(id);
  const title = loi ? loi.question : byId.get(id)?.titre;
  const tag = loi ? (
    loiVotes[id] && <LoiVoteTag value={loiVotes[id]} />
  ) : (
    votes[id] !== undefined && <VoteTag value={votes[id]} />
  );
  if (!title || !tag) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Dernier vote : ${title}`}
      accessibilityHint="Modifier ce vote"
      style={styles.last}>
      <Text style={[Type.note, styles.ink]}>Dernier vote</Text>
      <View style={styles.lastRow}>
        {tag}
        <View style={styles.lastTitle}>
          {!(votes[id] === UNSURE && !loi) && <Animated.View style={[styles.stroke, { backgroundColor: Markers[marker].soft }, stroke]} />}
          <Text style={[Type.label, styles.ink]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Text style={[Type.label, styles.muted]}>Modifier</Text>
      </View>
    </Pressable>
  );
}

function FinishedView({
  onEdit,
  onSeeRanking,
  counter,
}: {
  onEdit: (id: string) => void;
  onSeeRanking: () => void;
  counter: React.ReactNode;
}) {
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const order = useVotesStore((s) => s.order);

  return (
    <Screen>
      <ScreenHeader title="Voter" accessory={counter} />
      <View style={styles.finished}>
        <Text style={[Type.display, styles.ink]}>Vous avez donné votre avis sur toutes les propositions et tous les scrutins.</Text>
        <Text style={[Type.body, styles.soft]}>Relisez vos votes ci-dessous : touchez une ligne pour le changer.</Text>
        <Button label="Voir le classement" variant="primary" onPress={onSeeRanking} />
      </View>
      <View style={styles.list}>
        {order.map((id, i) => {
          const p = byId.get(id);
          const loi = loisById.get(id);
          return (
            <View key={id} style={i > 0 && styles.separator}>
              {p && <PropositionRow proposition={p} vote={votes[p.id]} onPress={() => onEdit(id)} actionHint="Modifier votre vote" />}
              {loi && <LoiRow loi={loi} vote={loiVotes[loi.id]} onPress={() => onEdit(id)} />}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function LoiRow({ loi, vote, onPress }: { loi: Loi; vote?: LoiVoteValue; onPress: () => void }) {
  const marker = useMarkOf(loi.id);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint="Modifier votre vote"
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: Colors.pressed }]}>
      <View style={styles.rowBody}>
        <Marked active={vote !== undefined} marker={marker} style={[Type.body, styles.ink]}>
          {loi.question}
        </Marked>
        <View style={styles.rowMeta}>
          <Text style={[Type.label, Numeric, styles.muted]}>{loi.ref} · Scrutin ·</Text>
          {vote ? <LoiVoteTag value={vote} /> : <Text style={[Type.label, styles.muted]}>Pas encore voté</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.graphite} />
    </Pressable>
  );
}

function EditVoteSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const castVote = useVotesStore((s) => s.castVote);
  const castLoiVote = useVotesStore((s) => s.castLoiVote);
  const proposition = id ? byId.get(id) : undefined;
  const loi = id ? loisById.get(id) : undefined;

  return (
    <Sheet visible={!!(proposition || loi)} title="Modifier votre vote" onClose={onClose}>
      {proposition && (
        <>
          <Text style={[Type.bodyStrong, styles.ink]}>{proposition.titre}</Text>
          <Text style={[Type.body, styles.soft]}>{proposition.description}</Text>
          <VoteScale
            value={votes[proposition.id]}
            onVote={(value) => {
              castVote(proposition.id, value);
              onClose();
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
            onVote={(value) => {
              castLoiVote(loi.id, value);
              onClose();
            }}
          />
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 2,
    backgroundColor: Colors.rule,
  },
  trackFill: {
    height: 2,
    backgroundColor: Colors.ink,
  },
  last: {
    marginTop: Spacing.one,
  },
  lastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 44,
  },
  lastTitle: {
    flex: 1,
    justifyContent: 'center',
  },
  stroke: {
    position: 'absolute',
    left: -2,
    right: 0,
    top: 2,
    bottom: 1,
    borderRadius: 3,
    transformOrigin: 'left',
  },
  sheetWrap: {
    marginTop: Spacing.one,
  },
  milestone: {
    gap: Spacing.half,
  },
  intro: {
    marginTop: Spacing.two,
  },
  panels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  panel: {
    width: 16,
    height: 22,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.graphite,
    backgroundColor: Colors.sheet,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  panelFill: {
    backgroundColor: Colors.ink,
  },
  panelNote: {
    backgroundColor: Colors.rule,
  },
  pause: {
    marginTop: Spacing.two,
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  avis: {
    marginTop: Spacing.three,
    gap: Spacing.one,
  },
  reveal: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  next: {
    gap: Spacing.one,
  },
  outcome: {
    gap: Spacing.half,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: Colors.sheet,
    minHeight: 64,
    paddingVertical: 12,
    paddingLeft: Spacing.two,
    paddingRight: 12,
  },
  rowBody: {
    flex: 1,
    gap: Spacing.half,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    flexWrap: 'wrap',
  },
  finished: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  list: {
    marginTop: Spacing.two,
    borderRadius: Radius.large,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
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
