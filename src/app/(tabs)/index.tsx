import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, BackHandler, findNodeHandle, Platform, Pressable, ScrollView, StyleSheet, Text, View, type AccessibilityProps, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, Easing, FadeIn, FadeOut, Keyframe, ReduceMotion, useAnimatedStyle, useDerivedValue, useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { BUTTON_STROKE_MS } from '@/components/button-stroke';
import { CountdownFill } from '@/components/countdown-fill';
import { CrowdBackdrop } from '@/components/crowd-backdrop';
import { EditChip } from '@/components/edit-chip';
import { EditVoteSheet } from '@/components/edit-vote-sheet';
import { EnjeuFrame, FRAME_DRAW_MS } from '@/components/enjeu-frame';
import { EnjeuReveal } from '@/components/enjeu-reveal';
import { Hemicycle } from '@/components/hemicycle';
import { LoiDetail } from '@/components/loi-detail';
import { LoiVoteScale } from '@/components/loi-vote-scale';
import { Marked } from '@/components/marked';
import { announce, LiveRegion } from '@/components/live-region';
import { MoreInfo, type InfoTab } from '@/components/more-info';
import { PageVeil } from '@/components/page-veil';
import { PropositionRow } from '@/components/proposition-row';
import { PropositionSheet } from '@/components/proposition-sheet';
import { ScrutinStamp } from '@/components/scrutin-stamp';
import { SWEEP_MS } from '@/components/sweep-text';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { ProgressCounter } from '@/components/ui/progress-counter';
import { VoteScale } from '@/components/vote-scale';
import { LoiVoteTag, VoteTag } from '@/components/vote-tag';
import { Colors, Markers, Numeric, Radius, Spacing, Type } from '@/constants/theme';
import { loiChoice, voteChoice } from '@/constants/votes';
import { CHAMBRE_LABELS, STATUT_LABELS, TYPE_SOURCE_LABELS, formatDate } from '@/lib/format';
import { hardwareBack, pageTurnSettles, previousQuestion } from '@/lib/page-turn';
import { CLASSEMENT_THRESHOLD, isPause, nextMilestone, opinionCount, rankedCount, type Milestone } from '@/lib/progress';
import { MIN_VOTES_PER_CANDIDAT, RELIABILITY_FROM, scoreCandidat, UNSURE, type LoiVoteValue, type VoteValue } from '@/lib/scoring';
import { buzz, playSound } from '@/lib/sound';
import type { Enjeu, Loi } from '@/schemas/dataset';
import { candidats, getCandidat, getEnjeu, getThematique, lois, propositions, questions } from '@/services/dataset';
import { celebrate, celebrateSeries } from '@/store/celebration-store';
import { useTuto, useTutoActive, useTutoTarget } from '@/store/tuto-store';
import { selectNextId, useMarkOf, usePropositionVotes, useVotesStore } from '@/store/votes-store';

const byId = new Map(propositions.map((p) => [p.id, p]));
const loisById = new Map(lois.map((l) => [l.id, l]));
const TOTAL = questions.length + lois.length;
// La feuille votée remonte se ranger en « A voté ! ».
const LEAVE_MS = 320;
// « A voté ! » reste le temps de corriger d'un geste, puis s'efface (la gomme reste partout ailleurs).
const LAST_VOTE_MS = 10000;
// Après un scrutin, le temps de lire l'hémicycle et le résultat, puis la suite part seule comme pour une proposition.
const AUTO_NEXT_MS = 5000;
// Essai : la page du cahier se tourne à chaque vote ; faux, la feuille remonte vers « A voté ! » comme avant.
const PAGE_TURN = true;
// La page se soulève doucement puis retombe de l'autre côté de la reliure.
const TURN_MS = 420;
const TURN_EASING = Easing.bezier(0.45, 0, 0.2, 1);
// Perspective lointaine : la page se soulève vers le lecteur sans grossir au point de sortir de l'écran.
const PERSPECTIVE = 2000;
// Doigt lâché : la page finit son chemin, plus vite qu'un tour entier.
const SETTLE_MS = 240;
// Marge avant de finir le tour sans l'animation, si ses images n'arrivent pas.
const SAFETY_MS = 200;
// Rien ne démarre à moins de 24 pt du bord de l'écran : le retour système d'Android y vit (la colonne a déjà 16 pt de gouttière).
const EDGE_SLOP = 8;

type Phase = 'button' | 'title' | 'leaving';
// Page posée par-dessus la question en cours : celle qui tourne après un vote, ou la précédente ramenée d'un geste.
type Over = { id: string; mode: 'turn' | 'peek' | 'back'; top: number; revealed?: boolean };
type Role = 'flow' | 'over';
type TitleActions = Pick<AccessibilityProps, 'accessibilityActions' | 'onAccessibilityAction'>;

export default function VoterScreen() {
  const router = useRouter();
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const order = useVotesStore((s) => s.order);
  const castVote = useVotesStore((s) => s.castVote);
  const castLoiVote = useVotesStore((s) => s.castLoiVote);
  const propositionVotes = usePropositionVotes();

  const [lastId, setLastId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  // Onglet d'explications ouvert sur cette proposition : la citation se déplie aussi.
  const [info, setInfo] = useState<{ id: string; tab: InfoTab } | null>(null);
  // Scrutin tout juste voté : reste affiché le temps de lire l'hémicycle.
  const [revealId, setRevealId] = useState<string | null>(null);
  // Geste du vote sur une proposition : trait sur le bouton, trait sur le titre, puis la feuille remonte.
  const [hold, setHold] = useState<{ id: string; value: VoteValue; phase: Phase } | null>(null);
  const [loiLeaving, setLoiLeaving] = useState(false);
  // Pause passée par « 10 questions de plus » : elle ne revient qu'à la dizaine suivante.
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const marker = useVotesStore((s) => s.marker);
  const marks = useVotesStore((s) => s.marks);
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const [over, setOver] = useState<Over | null>(null);
  // 0 : la page posée est à plat ; 1 : elle a tourné vers la gauche, hors de vue.
  const turn = useSharedValue(0);
  // Haut de la page du flux : la page posée par-dessus s'y aligne.
  const [flowTop, setFlowTop] = useState(0);
  const [overSize, setOverSize] = useState({ id: '', height: 0 });
  const [stageWidth, setStageWidth] = useState(0);
  const tutoActive = useTutoActive();
  const [flowTitle, setFlowTitle] = useState<Text | null>(null);
  const [overTitle, setOverTitle] = useState<Text | null>(null);
  // Lecteur d'écran : après un départ ou un geste annulé, le focus revient au titre de la question en cours.
  const focusTitle = (delay = 0) => {
    setTimeout(() => focusOn(flowTitle), delay + 50);
  };

  const endTurn = (id: string) => setOver((o) => (o?.id === id && o.mode === 'turn' ? null : o));
  // La page votée (ou ramenée) tourne autour de sa reliure et laisse voir la question suivante, déjà dessous.
  const turnAway = (id: string, revealed = false) => {
    if (reducedMotion) {
      turn.set(0);
      setOver(null);
      return;
    }
    setOver((o) => ({ id, mode: 'turn', top: o?.id === id ? o.top : flowTop, revealed }));
    turn.set(0);
    turn.set(withTiming(1, { duration: TURN_MS, easing: TURN_EASING }, (done) => {
      if (done) {
        scheduleOnRN(endTurn, id);
      }
    }));
    // Onglet en arrière-plan, images gelées : la page part quand même, le vote suivant n'attend pas l'animation.
    setTimeout(() => endTurn(id), TURN_MS + SAFETY_MS);
  };
  const turnAwayRef = useRef(turnAway);
  useEffect(() => {
    turnAwayRef.current = turnAway;
  });

  useEffect(() => {
    if (!hold) {
      return;
    }
    // « Je ne sais pas » : pas de trait sur le titre, aucun avis n'est posé.
    const next = hold.phase === 'button' ? (hold.value === UNSURE ? 'leaving' : 'title') : hold.phase === 'title' ? 'leaving' : null;
    const delay = hold.phase === 'button' ? BUTTON_STROKE_MS : hold.phase === 'title' ? SWEEP_MS : LEAVE_MS;
    const timer = setTimeout(() => {
      if (next) {
        if (next === 'leaving') {
          playSound('feuille');
          if (PAGE_TURN) {
            turnAwayRef.current(hold.id);
            setLastId(hold.id);
            setHold(null);
            return;
          }
        }
        setHold({ ...hold, phase: next });
      } else {
        setLastId(hold.id);
        setHold(null);
        setOver((o) => (o?.id === hold.id ? null : o));
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

  const nextId = selectNextId({ votes, loiVotes, order });
  // Question ramenée d'un geste : c'est elle qu'on vote, la question en cours attend dessous.
  const back = over?.mode === 'back' ? over.id : null;
  const currentId = back ?? revealId ?? hold?.id ?? nextId;
  const flowId = back ? nextId : currentId;
  // La page ramenée repart vers la question en cours : même réponse, glissé inverse ou flèche droite.
  const canForward = !!back && !hold && !revealId && !tutoActive && !editing;
  const goForward = () => {
    if (back && canForward) {
      playSound('feuille');
      turnAway(back);
      focusTitle(reducedMotion ? 0 : TURN_MS);
    }
  };
  const current = currentId ? byId.get(currentId) : undefined;
  const currentLoi = currentId ? loisById.get(currentId) : undefined;
  const currentEnjeu = currentId ? getEnjeu(currentId) : undefined;
  const votedCount = Object.keys(votes).length + Object.keys(loiVotes).length;
  const opinions = opinionCount(votes, loiVotes);
  const ranked = rankedCount(propositions, propositionVotes);
  const milestone = nextMilestone(opinions, ranked, candidats.length);
  const pause = !hold && !revealId && isPause(opinions) && pausedAt !== opinions;
  const finished = !current && !currentLoi && !currentEnjeu;
  // Un bilan qui s'ouvre : une fête ; la dernière question : une série. Une fois, au moment où ça arrive.
  const reached = useRef({ pause, finished });
  useEffect(() => {
    let cancel: (() => void) | undefined;
    if (finished && !reached.current.finished) {
      // Sans animation, une seule fête : un seul son.
      cancel = celebrateSeries('big', reducedMotion ? 1 : 3);
      buzz('success');
    } else if (pause && !reached.current.pause) {
      celebrate('big');
      buzz('success');
    }
    reached.current = { pause, finished };
    return cancel;
  }, [pause, finished, reducedMotion]);

  const handleVote = (value: VoteValue) => {
    if (!current || (over && over.mode !== 'back')) {
      return;
    }
    // Question ramenée, même réponse : la page repart sans rien changer.
    if (back === current.id && votes[current.id] === value) {
      goForward();
      return;
    }
    castVote(current.id, value);
    playSound('trait');
    buzz('light');
    announce(`Vote enregistré : ${voteChoice(value)?.label ?? ''}`);
    if (reducedMotion) {
      setLastId(current.id);
      setOver(null);
    } else {
      setHold({ id: current.id, value, phase: 'button' });
    }
  };

  const handleLoiVote = (value: LoiVoteValue) => {
    if (!currentLoi || (over && over.mode !== 'back')) {
      return;
    }
    if (back === currentLoi.id && loiVotes[currentLoi.id] === value) {
      goForward();
      return;
    }
    castLoiVote(currentLoi.id, value);
    playSound('trait');
    setRevealId(currentLoi.id);
    announce(`Vote enregistré : ${loiChoice(value)?.label ?? ''}`);
  };

  // Question commune : même échelle qu'une proposition, puis l'écran sans nom, comme après un scrutin.
  const handleEnjeuVote = (value: VoteValue) => {
    if (!currentEnjeu || (over && over.mode !== 'back')) {
      return;
    }
    if (back === currentEnjeu.id && votes[currentEnjeu.id] === value) {
      goForward();
      return;
    }
    castVote(currentEnjeu.id, value);
    playSound('trait');
    buzz('light');
    setRevealId(currentEnjeu.id);
    announce(`Vote enregistré : ${voteChoice(value)?.label ?? ''}`);
  };

  const handleNext = () => {
    if (PAGE_TURN && revealId) {
      turnAway(revealId, true);
      setLastId(revealId);
      setRevealId(null);
      return;
    }
    const done = () => {
      setLoiLeaving(false);
      setLastId(revealId);
      setRevealId(null);
      setOver(null);
    };
    if (reducedMotion) {
      done();
      return;
    }
    setLoiLeaving(true);
    setTimeout(done, LEAVE_MS);
  };

  const loiRevealed = !!currentLoi && revealId === currentLoi.id;
  const enjeuRevealed = !!currentEnjeu && revealId === currentEnjeu.id;
  const loiFlow = useLoiFlow({
    id: currentLoi?.id ?? currentEnjeu?.id,
    revealed: loiRevealed || enjeuRevealed,
    leaving: loiLeaving,
    animate: !reducedMotion,
    paused: tutoActive,
    onNext: handleNext,
  });
  const enjeuMarker = useMarkOf(currentEnjeu?.id ?? '');
  const enjeuValue = currentEnjeu ? votes[currentEnjeu.id] : undefined;
  const loiMarker = useMarkOf(currentLoi?.id ?? '');
  const loiValue = currentLoi ? loiVotes[currentLoi.id] : undefined;

  // Les boutons restent au bas de l'écran, au-dessus des onglets : on vote sans faire défiler.
  const nextStep = (loiRevealed || enjeuRevealed) && loiFlow.step === 'hemicycle';
  const dock = pause ? null : currentEnjeu ? (
    nextStep ? (
      <Button
        label="Question suivante"
        variant="primary"
        onPress={handleNext}
        disabled={loiLeaving}
        countdown={loiFlow.autoNext ? loiFlow.remaining : undefined}
      />
    ) : (
      <VoteScale
        value={enjeuValue}
        onVote={handleEnjeuVote}
        disabled={enjeuRevealed}
        stroke={(enjeuRevealed || back === currentEnjeu.id) && enjeuValue !== undefined ? { value: enjeuValue, color: Markers[enjeuMarker].soft } : undefined}
      />
    )
  ) : currentLoi ? (
    nextStep ? (
      <Button
        label="Question suivante"
        variant="primary"
        onPress={handleNext}
        disabled={loiLeaving}
        countdown={loiFlow.autoNext ? loiFlow.remaining : undefined}
      />
    ) : (
      <LoiVoteScale
        value={loiValue}
        onVote={handleLoiVote}
        disabled={loiRevealed}
        stroke={(loiRevealed || back === currentLoi.id) && loiValue ? { value: loiValue, color: Markers[loiMarker].soft } : undefined}
      />
    )
  ) : current ? (
    <VoteScale
      value={hold?.value ?? (back === current.id ? votes[current.id] : undefined)}
      onVote={handleVote}
      disabled={!!hold}
      stroke={
        hold
          ? { value: hold.value, color: Markers[marker].soft }
          : back === current.id && votes[current.id] !== undefined
            ? { value: votes[current.id], color: Markers[marks[current.id] ?? marker].soft }
            : undefined
      }
    />
  ) : null;

  // Onglet ouvert : la rangée d'onglets remonte en haut de l'écran, son contenu juste dessous.
  const showInfo = (target: View | null) => {
    const scroll = scrollRef.current;
    if (!scroll || !target) {
      scroll?.scrollToEnd({ animated: !reducedMotion });
      return;
    }
    const relativeTo = (scroll as unknown as { getScrollResponder?: () => { getInnerViewNode?: () => unknown } }).getScrollResponder?.()?.getInnerViewNode?.() ?? scroll;
    try {
      target.measureLayout(
        relativeTo as View,
        (_x, y) => scroll.scrollTo({ y: Math.max(0, y - Spacing.five), animated: !reducedMotion }),
        () => scroll.scrollToEnd({ animated: !reducedMotion })
      );
    } catch {
      scroll.scrollToEnd({ animated: !reducedMotion });
    }
  };

  const counter = <ProgressCounter value={votedCount} total={TOTAL} unit="votes" />;

  // Le tuto des premières fois (src/constants/tutos.json) : chaque étape une seule fois, l'app en pause.
  const calm = !pause && !hold && !loiLeaving && !over;
  useTuto('arrivee', calm && (!!current || !!currentEnjeu) && votedCount === 0);
  // Pas sur la toute première question : les astuces d'arrivée passent d'abord, sans en enchaîner trois.
  useTuto('enjeu', calm && !!currentEnjeu && !enjeuRevealed && votedCount > 0);
  useTuto('premier-vote', calm && !!lastId && !revealId);
  useTuto('scrutin', calm && !!currentLoi && !loiRevealed);
  useTuto('scrutin-vote', calm && loiRevealed && loiFlow.step === 'hemicycle');
  useTuto('vote-3', calm && !revealId && opinions >= 3);
  const voteTarget = useTutoTarget('vote-boutons');
  const infoTarget = useTutoTarget('en-savoir-plus');

  // Retour d'un cran, sans bouton ni astuce : un geste de page, la flèche gauche sur le web, une action pour le lecteur d'écran.
  const backTarget = previousQuestion({
    lastId,
    shownId: currentId,
    revisiting: !!over,
    busy: pause || finished || !!hold || !!revealId || loiLeaving || tutoActive || !!editing,
  });
  // Question ramenée posée, par l'animation, le minuteur de secours ou d'un coup : une fois, page à plat, son de page.
  useEffect(() => {
    if (!back) {
      return;
    }
    turn.set(0);
    playSound('feuille');
    buzz('light');
  }, [back, turn]);
  // Le focus va à son titre une fois monté, puis l'annonce suit (VoiceOver couperait une annonce partie avant le focus).
  useEffect(() => {
    if (!back || hold || revealId || !overTitle) {
      return;
    }
    // En mode réduit, après le fondu : une page encore en train d'apparaître ne prend pas le focus sur le web.
    const timer = setTimeout(() => {
      focusOn(overTitle);
      announce('Question précédente');
    }, reducedMotion ? 160 : 0);
    return () => clearTimeout(timer);
  }, [back, hold, revealId, overTitle, reducedMotion]);
  // Réduire les animations : la question en cours reste visible le temps que la page ramenée finisse son fondu.
  const [coverReady, setCoverReady] = useState<Over | null>(null);
  useEffect(() => {
    if (!back || !reducedMotion) {
      return;
    }
    const timer = setTimeout(() => setCoverReady(over), 150);
    return () => clearTimeout(timer);
  }, [back, over, reducedMotion]);
  const peek = (id: string) => setOver({ id, mode: 'peek', top: flowTop });
  const dropOver = (id: string) => {
    setOver((o) => (o?.id === id ? null : o));
    focusTitle();
  };
  // Geste annulé : seule une page en train de revenir s'en va, jamais une page déjà posée.
  const dropPeek = (id: string) => setOver((o) => (o?.id === id && o.mode === 'peek' ? null : o));
  const settleBack = (id: string) => setOver((o) => (o?.id === id ? { ...o, mode: 'back' } : o));
  const goBack = () => {
    const id = backTarget;
    if (!id) {
      return;
    }
    if (reducedMotion) {
      turn.set(0);
      setOver({ id, mode: 'back', top: flowTop });
      return;
    }
    peek(id);
    turn.set(1);
    turn.set(withTiming(0, { duration: TURN_MS, easing: TURN_EASING }, (done) => {
      if (done) {
        scheduleOnRN(settleBack, id);
      }
    }));
    // Même filet de sécurité : la page ramenée se pose, sans rester bloquée en route.
    setTimeout(() => setOver((o) => (o?.id === id && o.mode === 'peek' ? { ...o, mode: 'back' } : o)), TURN_MS + SAFETY_MS);
  };
  // Retour Android déjà servi à repartir depuis ce vote : le suivant n'est plus intercepté.
  const [spentFor, setSpentFor] = useState<string | null>(null);
  const onHardwareBack = () => {
    const moving = (!!over && over.mode !== 'back') || !!hold || (!!back && !!revealId);
    const action = hardwareBack({ canBack: !!backTarget, canForward, spent: spentFor === lastId, moving });
    if (action === 'forward') {
      setSpentFor(lastId);
      goForward();
    } else if (action === 'back') {
      goBack();
    }
    return action !== null;
  };
  const keysRef = useRef({ goBack, goForward, onHardwareBack });
  useEffect(() => {
    keysRef.current = { goBack, goForward, onHardwareBack };
  });
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        // Retour système : un cran en arrière, puis repartir, sinon le comportement habituel.
        const sub = BackHandler.addEventListener('hardwareBackPress', () => keysRef.current.onHardwareBack());
        return () => sub.remove();
      }
      if (Platform.OS !== 'web') {
        return;
      }
      const onKey = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement | null;
        // Les flèches gardent leur rôle dans un champ ; sur l'échelle de vote, elles tournent la page aussi.
        if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented || target?.closest?.('input, textarea, [contenteditable]')) {
          return;
        }
        if (e.key === 'ArrowLeft') {
          keysRef.current.goBack();
        } else if (e.key === 'ArrowRight') {
          keysRef.current.goForward();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, []),
  );

  // Doigt de gauche à droite : la page précédente revient par-dessus en suivant le doigt ; à l'envers, la page ramenée repart.
  // Web : pas de glissé à la souris (il sélectionnerait le texte), la flèche gauche le remplace.
  const forward = canForward;
  // La page en route garde son id : poser `over` ne doit pas couper le geste en cours.
  const dragId = (over?.mode === 'peek' ? over.id : forward ? back : backTarget) ?? '';
  const width = Math.max(stageWidth, 1);
  const reduced = reducedMotion;
  const pan = Gesture.Pan()
    .enabled(Platform.OS !== 'web' && !!dragId)
    .activeOffsetX(forward ? -24 : 24)
    .failOffsetY([-16, 16])
    .hitSlop({ left: -EDGE_SLOP })
    .onStart(() => {
      if (!forward && !reduced) {
        turn.set(1);
        scheduleOnRN(peek, dragId);
      }
    })
    .onUpdate((e) => {
      if (reduced) {
        return;
      }
      // Le bord de la page reste sous le doigt : l'angle suit la distance parcourue.
      const travel = Math.min(1, Math.max(0, (forward ? -e.translationX : e.translationX) / width));
      const angle = (Math.acos(forward ? 1 - travel : travel) * 2) / Math.PI;
      turn.set(angle);
    })
    .onEnd((e, success) => {
      const settled = success && pageTurnSettles(forward ? -e.translationX : e.translationX, width, forward ? -e.velocityX : e.velocityX);
      // Réduire les animations : la page change d'un coup, sans suivre le doigt.
      if (reduced) {
        if (settled) {
          scheduleOnRN(forward ? goForward : goBack);
        }
        return;
      }
      const target = forward === settled ? 1 : 0;
      turn.set(withTiming(target, { duration: SETTLE_MS, easing: Easing.out(Easing.cubic) }, (done) => {
        if (!done) {
          return;
        }
        if (!forward) {
          scheduleOnRN(settled ? settleBack : dropPeek, dragId);
        } else if (settled) {
          scheduleOnRN(dropOver, dragId);
          scheduleOnRN(playSound, 'feuille');
        }
      }));
    })
    .onFinalize((_, success) => {
      if (!success && !forward) {
        scheduleOnRN(dropPeek, dragId);
      }
    });
  const titleActions = (role: Role): TitleActions | undefined =>
    role === 'flow' && backTarget
      ? { accessibilityActions: [{ name: 'back', label: 'Revenir à la question précédente' }], onAccessibilityAction: goBack }
      : role === 'over' && canForward
        ? { accessibilityActions: [{ name: 'forward', label: 'Revenir à la question en cours' }], onAccessibilityAction: goForward }
        : undefined;

  // Le titre d'une page votée garde son trait ; pendant le geste du vote, le surligneur le balaie.
  const sweepOf = (id: string) => {
    if (hold?.id === id) {
      return hold.phase !== 'button' && hold.value !== UNSURE ? marker : undefined;
    }
    return id !== nextId && votes[id] !== undefined && votes[id] !== UNSURE ? (marks[id] ?? marker) : undefined;
  };

  const revealLayout = () => scrollRef.current?.scrollToEnd({ animated: true });
  // Le contenu d'une page, dans le flux ou posée par-dessus : même composant, la page garde son état en changeant de place.
  const pageFor = (id: string, role: Role) => {
    const frozen = role === 'over' && over?.mode === 'turn';
    const bound = role === 'over' && over?.mode !== 'back';
    const active = id === currentId;
    const enjeu = getEnjeu(id);
    if (enjeu) {
      return (
        <EnjeuBallot
          enjeu={enjeu}
          value={votes[id]}
          revealed={frozen ? !!over?.revealed : revealId === id || (role === 'over' && back === id)}
          leaving={PAGE_TURN ? false : loiLeaving}
          step={active && revealId === id ? loiFlow.step : 'hemicycle'}
          holdProps={active ? loiFlow.holdProps : {}}
          onInfoOpen={showInfo}
          onRevealLayout={revealLayout}
          titleActions={titleActions(role)}
          titleRef={role === 'flow' ? setFlowTitle : setOverTitle}
          veil={role === 'over' ? turn : undefined}
          bound={bound}
        />
      );
    }
    const loi = loisById.get(id);
    if (loi) {
      return (
        <LoiBallot
          loi={loi}
          value={loiVotes[id]}
          revealed={frozen ? !!over?.revealed : revealId === id || (role === 'over' && back === id)}
          leaving={PAGE_TURN ? false : loiLeaving}
          step={active && revealId === id ? loiFlow.step : 'hemicycle'}
          holdProps={active ? loiFlow.holdProps : {}}
          onInfoOpen={showInfo}
          onRevealLayout={revealLayout}
          titleActions={titleActions(role)}
          titleRef={role === 'flow' ? setFlowTitle : setOverTitle}
          veil={role === 'over' ? turn : undefined}
          bound={bound}
        />
      );
    }
    const p = byId.get(id);
    if (!p) {
      return null;
    }
    return (
      <Leaving leaving={!PAGE_TURN && hold?.id === id && hold.phase === 'leaving'} style={styles.sheetWrap}>
        <PropositionSheet
          proposition={p}
          quoteOpen={info?.id === p.id}
          sweep={sweepOf(p.id)}
          thematique={getThematique(p.thematiqueId)}
          onWord={() => setInfo({ id: p.id, tab: 'mots' })}
          titleActions={titleActions(role)}
          titleRef={role === 'flow' ? setFlowTitle : setOverTitle}
          veil={role === 'over' ? turn : undefined}
          bound={bound}
          footer={
            <View {...(role === 'flow' ? infoTarget : null)}>
              <MoreInfo
                itemId={p.id}
                text={p.contexte}
                source={TYPE_SOURCE_LABELS[p.typeSource]}
                terms={[p.titre, p.description]}
                tab={info?.id === p.id ? info.tab : null}
                onTab={(tab) => setInfo(tab ? { id: p.id, tab } : null)}
                onOpen={showInfo}
              />
            </View>
          }
        />
      </Leaving>
    );
  };

  if (finished) {
    return (
      <>
        <FinishedView
          onEdit={setEditing}
          onSeeRanking={() => router.navigate('/cahier')}
          // Le partage vit dans le Cahier (scores et ex æquo y sont calculés) : on l'y ouvre directement.
          onShare={opinions >= CLASSEMENT_THRESHOLD && ranked > 0 ? () => router.navigate({ pathname: '/cahier', params: { partager: '1' } }) : undefined}
          counter={counter}
        />
        {/* Écran de fin : les noms sont déjà là, la gomme les montre aussi. */}
        <EditVoteSheet id={editing} blind={false} onClose={() => setEditing(null)} />
      </>
    );
  }

  return (
    <Screen
      scrollRef={scrollRef}
      backdrop={currentLoi && !pause ? <CrowdBackdrop quiet={revealId === currentLoi.id || back === currentLoi.id} /> : null}
      header={
        // Barre fixe : le palier à gauche, les candidats classés à droite, sur une seule piste de progression.
        <View style={styles.bar}>
          <MilestoneLine milestone={milestone} />
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${Math.min(1, milestone.ratio) * 100}%` }]} />
          </View>
        </View>
      }
      // « A voté ! » flotte au-dessus des boutons, là où on vient de voter : son départ ne fait rien bouger.
      overlay={
        lastId && !revealId ? (
          <>
            <LastVote key={lastId} id={lastId} hidden={!!back} paused={editing === lastId || tutoActive || !!back} onPress={() => setEditing(lastId)} />
            {back && <BackStatus onForward={goForward} disabled={!canForward} />}
          </>
        ) : null
      }
      footer={
        dock && (
          <View {...voteTarget} style={!nextStep && styles.dock}>
            {dock}
          </View>
        )
      }>

      {/* La feuille au milieu de l'espace libre : une question courte reste près des boutons. */}
      <GestureHandlerRootView style={styles.stageRoot}>
        <GestureDetector gesture={pan}>
          <View
            // Page posée plus haute que la question dessous : la zone garde sa hauteur, rien ne saute pendant le tour.
            style={[styles.stage, over && overSize.id === over.id && { minHeight: over.top + overSize.height }]}
            onLayout={(e) => setStageWidth(e.nativeEvent.layout.width)}>
            {pause ? (
              <PauseCard key="pause" opinions={opinions} ranked={ranked} onSeeRanking={() => router.navigate('/cahier')} onContinue={() => setPausedAt(opinions)} />
            ) : (
              flowId && (
                <Page
                  key={flowId}
                  turn={turn}
                  fade={reducedMotion}
                  covered={!!over && (!reducedMotion || coverReady === over)}
                  interactive={!back}
                  onLayout={(e: LayoutChangeEvent) => setFlowTop(e.nativeEvent.layout.y)}>
                  {pageFor(flowId, 'flow')}
                </Page>
              )
            )}
            {over && (
              <Page
                key={over.id}
                turn={turn}
                fade={reducedMotion}
                over
                top={over.top}
                interactive={over.mode === 'back'}
                onLayout={(e: LayoutChangeEvent) => setOverSize({ id: over.id, height: e.nativeEvent.layout.height })}>
                {pageFor(over.id, 'over')}
              </Page>
            )}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>

      {/* Pendant le vote : la page de la question, sans aucun nom. */}
      <EditVoteSheet id={editing} blind onClose={() => setEditing(null)} />
      <LiveRegion />
    </Screen>
  );
}

// Entre en fondu ; quand le vote est posé, remonte vers « A voté ! » en s'effaçant.
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
    <Animated.View entering={PAGE_TURN ? undefined : FadeIn.duration(220)} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}

// L'opacité reste permise quand les animations sont réduites : un fondu court, sans mouvement.
const FADE_IN = FadeIn.duration(150).reduceMotion(ReduceMotion.Never);
const FADE_OUT = FadeOut.duration(150).reduceMotion(ReduceMotion.Never);

// Une page du cahier : à plat dans le flux, ou posée par-dessus et tournée autour de sa reliure, le bord gauche.
function Page({
  turn,
  fade = false,
  over = false,
  top = 0,
  covered = false,
  interactive,
  onLayout,
  children,
}: {
  turn: SharedValue<number>;
  /** Réduire les animations : la question change en fondu de 150 ms, sans rotation. */
  fade?: boolean;
  over?: boolean;
  top?: number;
  /** Une page est posée par-dessus : à plat, elle cache celle-ci. */
  covered?: boolean;
  interactive: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() =>
    over
      ? { opacity: turn.get() > 0.97 ? 0 : 1, transform: [{ perspective: PERSPECTIVE }, { rotateY: `${-90 * turn.get()}deg` }] }
      : { opacity: covered && turn.get() < 0.04 ? 0 : 1, transform: [{ perspective: PERSPECTIVE }, { rotateY: '0deg' }] },
  );
  return (
    <Animated.View
      entering={fade ? FADE_IN : undefined}
      exiting={fade ? FADE_OUT : undefined}
      onLayout={onLayout}
      pointerEvents={interactive ? 'auto' : 'none'}
      accessibilityElementsHidden={!interactive}
      importantForAccessibility={interactive ? 'auto' : 'no-hide-descendants'}
      aria-hidden={!interactive}
      style={[over && [styles.over, { top }], style]}>
      {children}
    </Animated.View>
  );
}

type LoiStep = 'button' | 'title' | 'hemicycle';

// Après le vote d'un scrutin : trait sur le bouton, puis sur la question, puis l'hémicycle ; la suite part seule si personne ne lit.
function useLoiFlow({
  id,
  revealed,
  leaving,
  animate,
  paused,
  onNext,
}: {
  id?: string;
  revealed: boolean;
  leaving: boolean;
  /** Faux si « Réduire les animations » : l'hémicycle apparaît tout de suite. */
  animate: boolean;
  /** Tuto à l'écran : la suite attend. */
  paused: boolean;
  onNext: () => void;
}) {
  const initial: LoiStep = animate ? 'button' : 'hemicycle';
  const [state, setState] = useState<{ id?: string; step: LoiStep; held: boolean }>({ id, step: initial, held: false });
  // Nouveau scrutin : on repart du début.
  if (state.id !== id) {
    setState({ id, step: initial, held: false });
  }
  const { step, held } = state.id === id ? state : { step: initial, held: false };
  const screenReader = useScreenReader();
  const autoNext = !!id && revealed && step === 'hemicycle' && !leaving && !screenReader && !held && !paused;
  // Un toucher, un clic ou un défilement : la personne lit, la suite ne part plus seule.
  const hold = () => autoNext && setState((s) => ({ ...s, held: true }));
  const remaining = useSharedValue(1);
  const nextRef = useRef(onNext);
  useEffect(() => {
    nextRef.current = onNext;
  });
  useEffect(() => {
    if (!autoNext) {
      return;
    }
    remaining.value = 1;
    remaining.value = withTiming(0, { duration: AUTO_NEXT_MS, easing: Easing.linear });
    const timer = setTimeout(() => nextRef.current(), AUTO_NEXT_MS);
    return () => clearTimeout(timer);
  }, [autoNext, remaining]);
  useEffect(() => {
    if (!revealed || step === 'hemicycle') {
      return;
    }
    const timer = setTimeout(
      () => setState((s) => ({ ...s, step: step === 'button' ? 'title' : 'hemicycle' })),
      step === 'button' ? BUTTON_STROKE_MS : SWEEP_MS,
    );
    return () => clearTimeout(timer);
  }, [revealed, step]);
  return { step, autoNext, remaining, holdProps: { onTouchStart: hold, onPointerDown: hold, onWheel: hold } as object };
}

// Un scrutin réel : la question anonyme, puis l'hémicycle de ceux qui l'ont voté (les trois choix sont dans le bandeau du bas).
function LoiBallot({
  loi,
  value,
  revealed,
  leaving,
  step,
  holdProps,
  onInfoOpen,
  onRevealLayout,
  titleActions,
  titleRef,
  veil,
  bound = false,
}: {
  loi: Loi;
  value?: LoiVoteValue;
  revealed: boolean;
  leaving: boolean;
  step: LoiStep;
  holdProps: object;
  onInfoOpen: (target: View | null) => void;
  /** L'hémicycle s'ouvre sous la question : l'écran défile jusqu'à lui une fois posé. */
  onRevealLayout: () => void;
  titleActions?: TitleActions;
  titleRef?: React.Ref<Text>;
  /** Page qui tourne : ses feuilles prennent un voile d'encre. */
  veil?: SharedValue<number>;
  bound?: boolean;
}) {
  const marker = useMarkOf(loi.id);
  const [detail, setDetail] = useState(false);
  const [tab, setTab] = useState<InfoTab | null>(null);
  const hemicycleTarget = useTutoTarget('hemicycle');
  // Lecteur d'écran : le coup de tampon se dit, après l'annonce du vote précédent.
  useEffect(() => {
    const timer = setTimeout(() => announce('Scrutin réel du Parlement'), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Leaving leaving={leaving}>
      <View {...holdProps}>
        <View style={styles.sheetWrap}>
          {/* Le coup de tampon : l'en-tête noir est son empreinte. */}
          {!revealed && <ScrutinStamp left={64} />}
          <PropositionSheet
            kind="Scrutin"
            stamp={!revealed}
            banner={`${CHAMBRE_LABELS[loi.chambre]} · ${loi.dateVote.slice(0, 4)}`}
            sweep={revealed && step !== 'button' ? marker : undefined}
            proposition={{ ref: loi.ref, thematiqueId: loi.thematiqueId, titre: loi.question }}
            thematique={getThematique(loi.thematiqueId)}
            onWord={() => setTab('mots')}
            titleActions={titleActions}
            titleRef={titleRef}
            veil={veil}
            bound={bound}
            footer={
              <MoreInfo
                itemId={loi.id}
                nature={loi.nature}
                text={loi.enjeu}
                terms={[loi.question, loi.titre]}
                tab={tab}
                onTab={setTab}
                onOpen={onInfoOpen}
              />
            }
          />
        </View>

        {revealed && value && step === 'hemicycle' && (
          <View {...hemicycleTarget} style={styles.reveal} onLayout={onRevealLayout}>
            {/* Le résultat sur sa feuille : rien ne flotte sur la salle ; la toucher ouvre la fiche du scrutin. */}
            <Pressable
              onPress={() => setDetail(true)}
              accessibilityRole="button"
              accessibilityLabel={`${loi.titre}, ${loi.ref}`}
              accessibilityHint="Ouvre le détail du scrutin"
              style={({ pressed }) => [styles.result, bound && styles.bound, pressed && { backgroundColor: Colors.pressed }]}>
              <Hemicycle loi={loi} user={value} markColor={Markers[marker].solid} />
              <View style={styles.outcome}>
                <View style={styles.outcomeText}>
                  <Text style={[Type.bodyStrong, styles.ink]}>{loi.titre}</Text>
                  <Text style={[Type.label, Numeric, styles.muted]}>
                    {loi.ref} · <Text style={[Type.labelStrong, styles.ink]}>{STATUT_LABELS[loi.statut]}</Text> ·{' '}
                    {formatDate(loi.dateVote)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.graphite} />
              </View>
              <PageVeil turn={veil} bound={bound} />
            </Pressable>
          </View>
        )}
      </View>
      <Sheet visible={detail} title={loi.ref} onClose={() => setDetail(false)}>
        {detail && <LoiDetail loi={loi} anonymous />}
      </Sheet>
    </Leaving>
  );
}

// Une question commune : la feuille encadrée aux quatre surligneurs, puis, une fois votée, chaque mesure sans nom.
function EnjeuBallot({
  enjeu,
  value,
  revealed,
  leaving,
  step,
  holdProps,
  onInfoOpen,
  onRevealLayout,
  titleActions,
  titleRef,
  veil,
  bound = false,
}: {
  enjeu: Enjeu;
  value?: VoteValue;
  revealed: boolean;
  leaving: boolean;
  step: LoiStep;
  holdProps: object;
  onInfoOpen: (target: View | null) => void;
  onRevealLayout: () => void;
  titleActions?: TitleActions;
  titleRef?: React.Ref<Text>;
  /** Page qui tourne : ses feuilles prennent un voile d'encre. */
  veil?: SharedValue<number>;
  bound?: boolean;
}) {
  const marker = useMarkOf(enjeu.id);
  const reducedMotion = useReducedMotion();
  const frameTarget = useTutoTarget('enjeu-cadre');
  // Première question commune : l'astuce d'arrivée montre ses onglets.
  const infoTarget = useTutoTarget('en-savoir-plus');
  const [tab, setTab] = useState<InfoTab | null>(null);
  return (
    <Leaving leaving={leaving}>
      <View {...holdProps}>
        <View {...frameTarget} style={styles.sheetWrap}>
          <EnjeuFrame animate={!reducedMotion}>
            <PropositionSheet
              kind="Question commune"
              sweep={revealed && step !== 'button' && value !== UNSURE ? marker : undefined}
              proposition={{ ref: enjeu.ref, thematiqueId: enjeu.thematiqueId, titre: enjeu.question }}
              thematique={getThematique(enjeu.thematiqueId)}
              onWord={() => setTab('mots')}
              titleActions={titleActions}
              titleRef={titleRef}
              veil={veil}
              bound={bound}
              footer={
                <View {...infoTarget}>
                  <MoreInfo
                    itemId={enjeu.id}
                    text={enjeu.enjeu}
                    terms={[enjeu.question]}
                    tab={tab}
                    onTab={setTab}
                    onOpen={onInfoOpen}
                  />
                </View>
              }
            />
          </EnjeuFrame>
        </View>
        {revealed && value !== undefined && step === 'hemicycle' && (
          <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(FRAME_DRAW_MS / 2)} style={styles.reveal} onLayout={onRevealLayout}>
            <EnjeuReveal enjeu={enjeu} value={value} veil={veil} bound={bound} />
          </Animated.View>
        )}
      </View>
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

// Le prochain palier, pas le total : « Classement dans 4 votes », puis « Bilan dans 7 votes » et les candidats classés.
function MilestoneLine({ milestone }: { milestone: Milestone }) {
  const target = useTutoTarget('palier');
  return (
    <View
      {...target}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${milestone.lead} ${milestone.value} ${milestone.text}, ${milestone.sideLabel}`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(milestone.ratio * 100) }}
      style={styles.milestone}>
      <Text style={[Type.label, Numeric, styles.muted]} numberOfLines={1}>
        {milestone.lead} <Text style={[Type.labelStrong, Numeric, styles.ink]}>{milestone.value}</Text> {milestone.text}
      </Text>
      <Text style={[Type.label, Numeric, styles.muted]} numberOfLines={1}>
        <Text style={[Type.labelStrong, Numeric, styles.ink]}>{milestone.ranked}</Text> / {milestone.candidats} classés
      </Text>
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
  const votes = usePropositionVotes();
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const scores = candidats.map((c) => scoreCandidat(c, propositions, votes, { lois, votes: loiVotes }));
  const noted = scores.filter((s) => s.programme.count > 0).length;
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
        <Text style={[Type.bodyStrong, Numeric, styles.ink]}>{noted}</Text> {noted > 1 ? 'candidats notés' : 'candidat noté'}. Un candidat est
        classé dès {MIN_VOTES_PER_CANDIDAT} notes, fiable dès {RELIABILITY_FROM.fiable}.
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

// « A voté ! » monte de la rangée de vote, là où on vient d'appuyer.
const LAST_VOTE_ENTER = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 16 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: Easing.out(Easing.exp) },
}).duration(320);

// Pose le focus du lecteur d'écran sur un titre ; sur le web, le focus du clavier (titre en tabIndex -1).
function focusOn(title: Text | null) {
  if (!title) {
    return;
  }
  if (Platform.OS === 'web') {
    (title as unknown as HTMLElement).focus?.();
    return;
  }
  const node = findNodeHandle(title);
  if (node) {
    AccessibilityInfo.setAccessibilityFocus(node);
  }
}

// Sur la question ramenée : où l'on est, et la sortie. Un état affiché, pas une astuce : le geste n'est annoncé nulle part.
function BackStatus({ onForward, disabled }: { onForward: () => void; disabled: boolean }) {
  const reducedMotion = useReducedMotion();
  return (
    <Animated.View entering={reducedMotion ? FADE_IN : LAST_VOTE_ENTER} style={[styles.last, styles.backRow]}>
      <Text style={[Type.label, styles.muted, styles.backLabel]}>Question précédente</Text>
      <Pressable
        onPress={onForward}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Revenir à la question en cours"
        hitSlop={{ top: 0, bottom: 0, left: Spacing.one, right: Spacing.one }}
        style={({ pressed }) => [styles.backLink, pressed && { backgroundColor: Colors.pressed }]}>
        <Text style={[Type.labelStrong, styles.link]}>Revenir à la question en cours</Text>
      </Pressable>
    </Animated.View>
  );
}

// Signature : le surligneur remplit la ligne de gauche à droite, puis se retire avec le temps qui reste pour corriger.
function LastVote({ id, paused, hidden = false, onPress }: { id: string; paused: boolean; hidden?: boolean; onPress: () => void }) {
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(true);
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const remaining = useSharedValue(1);
  const fill = useDerivedValue(() => progress.value * remaining.value);
  useEffect(() => {
    if (!reducedMotion) {
      progress.value = withTiming(1, { duration: 220 });
    }
  }, [progress, reducedMotion]);
  // Pendant la modification, le filet reste plein ; feuille fermée, 10 s de plus avec le vote corrigé.
  useEffect(() => {
    cancelAnimation(remaining);
    remaining.value = 1;
    if (paused) {
      return;
    }
    remaining.value = withTiming(0, { duration: LAST_VOTE_MS, easing: Easing.linear });
    const timer = setTimeout(() => setShown(false), LAST_VOTE_MS);
    return () => clearTimeout(timer);
  }, [paused, remaining]);
  const marker = useMarkOf(id);
  const target = useTutoTarget('a-vote');

  const loi = loisById.get(id);
  const title = loi ? loi.question : (getEnjeu(id)?.question ?? byId.get(id)?.titre);
  const tag = loi ? (
    loiVotes[id] && <LoiVoteTag value={loiVotes[id]} />
  ) : (
    votes[id] !== undefined && <VoteTag value={votes[id]} />
  );
  if (!title || !tag || !shown) {
    return null;
  }

  return (
    <Animated.View
      entering={reducedMotion ? undefined : LAST_VOTE_ENTER}
      exiting={reducedMotion ? undefined : FadeOut.duration(220)}
      // Question ramenée : « A voté ! » s'efface sans se démonter, il ne rejoue pas son entrée au retour.
      pointerEvents={hidden ? 'none' : 'auto'}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
      aria-hidden={hidden}
      style={[styles.last, hidden && styles.hidden]}>
      <Pressable
        {...target}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`A voté : ${title}`}
        accessibilityHint="Modifier ce vote"
        style={({ pressed }) => [styles.lastRow, pressed && { backgroundColor: Colors.pressed }]}>
        {/* « Je ne sais pas » n'est pas une marque : fond neutre. */}
        <CountdownFill remaining={fill} color={votes[id] === UNSURE && !loi ? Colors.ruleSoft : Markers[marker].solid} />
        {/* Le « ! » penché de Caveat déborde de sa chasse et le natif le rogne : insécables avant et après lui. */}
        <Text style={[Type.note, styles.lastNote, styles.ink]} numberOfLines={1}>
          A voté{'\u00A0'}!{'\u00A0'}
        </Text>
        <Text style={[Type.label, styles.ink, styles.lastTitle]} numberOfLines={1}>
          {title}
        </Text>
        <EditChip>{tag}</EditChip>
      </Pressable>
    </Animated.View>
  );
}

function FinishedView({
  onEdit,
  onSeeRanking,
  onShare,
  counter,
}: {
  onEdit: (id: string) => void;
  onSeeRanking: () => void;
  /** Absent tant qu'aucun candidat n'est classé : il n'y a rien à partager. */
  onShare?: () => void;
  counter: React.ReactNode;
}) {
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const order = useVotesStore((s) => s.order);

  return (
    <Screen>
      <ScreenHeader title="Voter" accessory={counter} />
      <View style={styles.finished}>
        <Text style={[Type.display, styles.ink]}>
          {onShare ? 'Vous avez rempli tous les votes, partagez votre classement !' : 'Vous avez donné votre avis sur toutes les propositions et tous les scrutins.'}
        </Text>
        <Text style={[Type.body, styles.soft]}>Relisez vos votes ci-dessous : touchez une ligne pour le changer.</Text>
        {onShare && <Button label="Partager mon classement" icon="share-outline" variant="primary" onPress={onShare} />}
        <Button label="Voir le classement" variant={onShare ? 'secondary' : 'primary'} onPress={onSeeRanking} />
      </View>
      <View style={styles.list}>
        {order.map((id, i) => {
          const p = byId.get(id);
          const loi = loisById.get(id);
          const enjeu = getEnjeu(id);
          return (
            <View key={id} style={i > 0 && styles.separator}>
              {p && <PropositionRow proposition={p} vote={votes[p.id]} onPress={() => onEdit(id)} actionHint="Modifier votre vote" />}
              {loi && <LoiRow loi={loi} vote={loiVotes[loi.id]} onPress={() => onEdit(id)} />}
              {enjeu && <EnjeuRow enjeu={enjeu} vote={votes[enjeu.id]} onPress={() => onEdit(id)} />}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

// Le récapitulatif de fin : la question commune et, enfin, les noms des candidats pour et contre.
function EnjeuRow({ enjeu, vote, onPress }: { enjeu: Enjeu; vote?: VoteValue; onPress: () => void }) {
  const marker = useMarkOf(enjeu.id);
  const names = (sens: 'pour' | 'contre') =>
    enjeu.positions
      .filter((p) => p.sens === sens)
      .map((p) => getCandidat(byId.get(p.propositionId)?.candidatId ?? '')?.nom)
      .filter(Boolean)
      .join(', ');
  const pour = names('pour');
  const contre = names('contre');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint="Modifier votre vote"
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: Colors.pressed }]}>
      <View style={styles.rowBody}>
        <Marked active={vote !== undefined && vote !== UNSURE} marker={marker} style={[Type.body, styles.ink]}>
          {enjeu.question}
        </Marked>
        <Text style={[Type.label, styles.muted]}>
          Pour : {pour}
          {contre ? ` · Contre : ${contre}` : ''}
        </Text>
        <View style={styles.rowMeta}>
          <Text style={[Type.label, Numeric, styles.muted]}>{enjeu.ref} · Question commune ·</Text>
          {vote !== undefined ? <VoteTag value={vote} /> : <Text style={[Type.label, styles.muted]}>Pas encore voté</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.graphite} />
    </Pressable>
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

const styles = StyleSheet.create({
  track: {
    height: 2,
    backgroundColor: Colors.rule,
  },
  trackFill: {
    height: 2,
    backgroundColor: Colors.ink,
  },
  // Scrutins à la hauteur des propositions (2 rangées) : « A voté ! » et les boutons ne bougent pas ; « Question suivante » rend la place.
  dock: {
    minHeight: 60 + Spacing.one + 44,
  },
  // Posé sur la feuille : papier presque opaque, filet, et ce qui est dessous transparaît.
  last: {
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    backgroundColor: `${Colors.paper}EB`,
  },
  lastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 44,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  lastNote: {
    fontSize: 20,
    lineHeight: 24,
    flexShrink: 0,
  },
  lastTitle: {
    flex: 1,
  },
  sheetWrap: {
    marginTop: Spacing.one,
  },
  // Le palier sur deux lignes à gauche, les surligneurs à droite.
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    minHeight: 32,
  },
  bar: {
    gap: Spacing.half,
  },
  stageRoot: {
    flexGrow: 1,
  },
  stage: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  // La page posée tourne autour de son bord gauche, comme la reliure d'un cahier.
  over: {
    position: 'absolute',
    left: 0,
    right: 0,
    transformOrigin: 'left center',
    backfaceVisibility: 'hidden',
  },
  // Caché sans se démonter : sort du flux, la ligne d'état prend sa place.
  hidden: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0,
  },
  // Une ligne dès 375 pt ; police agrandie, la sortie passe dessous plutôt que d'être coupée.
  backRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: Spacing.half,
    minHeight: 44,
    paddingLeft: 12,
  },
  backLabel: {
    paddingVertical: Spacing.half,
  },
  backLink: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.medium,
  },
  link: {
    color: Colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.graphite,
  },
  // Pendant le tour : coins carrés côté reliure.
  bound: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  // Les candidats classés, sur une pastille neutre : un autre chiffre que le palier.
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
  reveal: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  result: {
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    padding: Spacing.two,
  },
  outcome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  outcomeText: {
    flex: 1,
    gap: Spacing.half,
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
