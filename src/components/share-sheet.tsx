import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';
import { scheduleOnRN } from 'react-native-worklets';

import { AllVotedNote } from '@/components/all-voted-note';
import { SHARE_CARD, ShareCard } from '@/components/share-card';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { SITE_URL } from '@/constants/app';
import { Colors, MinTarget, Spacing, Type } from '@/constants/theme';
import type { CandidateScore } from '@/lib/scoring';
import { scrutinsSummary, shareText, type ShareMode } from '@/lib/share';
import { shareImage } from '@/lib/share-image';
import { buzz } from '@/lib/sound';
import { themeAverages } from '@/lib/themes';
import { lois, propositions, thematiques } from '@/services/dataset';
import { celebrate, pointOf, type CelebrationPoint } from '@/store/celebration-store';
import { useVotesStore } from '@/store/votes-store';

const STATUS = {
  shared: '',
  downloaded: 'Image enregistrée : vous pouvez la publier où vous voulez.',
  unavailable: 'Le partage n’est pas disponible sur cet appareil.',
  error: 'L’image n’a pas pu être créée. Réessayez.',
} as const;

const MODES: { mode: ShareMode; label: string }[] = [
  { mode: 'complet', label: 'Mon classement' },
  { mode: 'discret', label: 'Discret, sans nom' },
  { mode: 'themes', label: 'Mes thèmes' },
  { mode: 'scrutins', label: 'Mes scrutins' },
];
// Sur un écran étroit, l'aperçu rapetisse pour laisser dépasser les voisines de PEEK : on voit qu'il y a d'autres images.
const PEEK = 48;
const GAP = 12;
const SIDE_SCALE = 0.94;
// Sur le web, l'aimantation passe par le CSS (scroll-snap) : snapToInterval n'y existe pas.
const WEB_SNAP = (Platform.OS === 'web' ? { scrollSnapType: 'x mandatory' } : {}) as ViewStyle;
const WEB_SNAP_CHILD = (Platform.OS === 'web' ? { scrollSnapAlign: 'center' } : {}) as ViewStyle;

// Partager une image au choix, d'une page à l'autre : le classement, ou sans aucun nom l'avancée, les thèmes ou les scrutins. Rien ne part sans ce bouton.
export function ShareSheet({
  visible,
  onClose,
  scores,
  answered,
  complete = false,
}: {
  visible: boolean;
  onClose: () => void;
  scores: CandidateScore[];
  answered: number;
  /** Toutes les questions répondues : « J'ai voté à tout ! » sur la feuille, l'image et le texte. */
  complete?: boolean;
}) {
  const marker = useVotesStore((s) => s.marker);
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const reducedMotion = useReducedMotion();
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<keyof typeof STATUS>('shared');
  const [tableWidth, setTableWidth] = useState(0);
  const fit = Math.min(1, (tableWidth - 2 * (PEEK + GAP)) / SHARE_CARD.width);
  const step = SHARE_CARD.width * fit + GAP;
  const pager = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const shown = useSharedValue(page);
  const cards = useRef<(View | null)[]>([]);
  const webCard = useRef<View>(null);
  const themes = useMemo(() => themeAverages(thematiques, propositions, votes), [votes]);
  const scrutins = useMemo(() => scrutinsSummary(lois, loiVotes), [loiVotes]);
  const { mode } = MODES[page];
  const empty = (mode === 'themes' && themes.every((t) => t.average === null)) || (mode === 'scrutins' && scrutins.total === 0);
  const captions: Record<ShareMode, string> = {
    complet: `Vos ${complete ? 7 : 8} premiers candidats et leurs scores.`,
    discret: 'Seulement votre nombre de questions et la fiabilité de vos scores : aucun candidat n’apparaît.',
    themes: `Vos ${thematiques.length} thèmes, du plus au moins approuvé, selon la moyenne de vos notes : combien leurs propositions vous ont plu, pas leur importance. Aucun candidat.`,
    scrutins: 'Vos votes Pour ou Contre comparés au sort réel des textes au Parlement. Aucun candidat.',
  };

  const onPage = (i: number) => {
    setPage(i);
    setStatus('shared');
  };
  const goTo = (i: number) => {
    onPage(i);
    pager.current?.scrollTo({ x: i * step, animated: !reducedMotion });
  };
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
    const i = Math.min(MODES.length - 1, Math.max(0, Math.round(e.contentOffset.x / step)));
    if (i !== shown.value) {
      shown.value = i;
      scheduleOnRN(onPage, i);
    }
  });

  const share = async (point?: CelebrationPoint) => {
    setBusy(true);
    setStatus('shared');
    try {
      // Seule l'image affichée part.
      const uri = await captureRef(Platform.OS === 'web' ? webCard.current! : cards.current[page]!, { format: 'png', width: SHARE_CARD.exportWidth, height: SHARE_CARD.exportHeight, result: 'tmpfile' });
      const result = await shareImage(uri, shareText(mode, { answered, complete, scrutins }, SITE_URL));
      setStatus(result);
      if (result === 'shared' || result === 'downloaded') {
        celebrate('small', 'sheet', point);
        buzz('success');
      }
    } catch {
      setStatus('error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible={visible} title="Partager" onClose={onClose}>
      {complete && <AllVotedNote marker={marker} />}
      {/* Les images posées sur la table : des objets, pas un écran de plus. On glisse de l'une à l'autre, les voisines dépassent. */}
      <View style={styles.table} onLayout={(e) => setTableWidth(e.nativeEvent.layout.width)}>
        {/* html2canvas rogne une carte réduite par ses parents : sur le web, on capture cette copie en taille réelle, dans une boîte vide qui la cache. */}
        {Platform.OS === 'web' && (
          <View style={styles.webCapture} aria-hidden pointerEvents="none">
            <ShareCard ref={webCard} mode={mode} scores={scores} answered={answered} marker={marker} complete={complete} themes={themes} scrutins={scrutins} />
          </View>
        )}
        {tableWidth > 0 && (
          <Animated.ScrollView
            ref={pager}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={step}
            decelerationRate="fast"
            disableIntervalMomentum
            onScroll={onScroll}
            scrollEventThrottle={16}
            // La feuille se remonte à chaque ouverture : on revient sur la dernière image vue.
            contentOffset={{ x: page * step, y: 0 }}
            style={[styles.pager, WEB_SNAP]}
            // La première et la dernière image se centrent aussi ; les voisines dépassent sur les côtés.
            contentContainerStyle={[styles.pagerContent, { paddingHorizontal: (tableWidth - SHARE_CARD.width * fit) / 2 }]}>
            {MODES.map((m, i) => (
              <Page key={m.mode} index={i} step={step} fit={fit} scrollX={scrollX} active={i === page} onPress={() => goTo(i)}>
                <View
                  style={styles.preview}
                  accessible
                  accessibilityLabel={`Aperçu de l'image ${i + 1} sur ${MODES.length} : ${m.label}`}
                  aria-hidden={i !== page}>
                  <ShareCard
                    ref={(v) => {
                      cards.current[i] = v;
                    }}
                    mode={m.mode}
                    scores={scores}
                    answered={answered}
                    marker={marker}
                    complete={complete}
                    themes={themes}
                    scrutins={scrutins}
                  />
                </View>
              </Page>
            ))}
          </Animated.ScrollView>
        )}
        <View style={styles.dots}>
          <Arrow icon="chevron-back" label="Image précédente" disabled={page === 0} onPress={() => goTo(page - 1)} />
          {MODES.map((m, i) => (
            <Pressable
              key={m.mode}
              onPress={() => goTo(i)}
              accessibilityRole="button"
              accessibilityLabel={`Image ${i + 1} sur ${MODES.length} : ${m.label}`}
              accessibilityState={{ selected: i === page }}
              hitSlop={4}
              style={styles.dotTarget}>
              <View style={[styles.dot, i === page && styles.dotActive]} />
            </Pressable>
          ))}
          <Arrow icon="chevron-forward" label="Image suivante" disabled={page === MODES.length - 1} onPress={() => goTo(page + 1)} />
        </View>
      </View>
      <View style={styles.caption}>
        <Text style={[Type.labelStrong, styles.ink]}>{MODES[page].label}</Text>
        <Text style={[Type.label, styles.muted]}>{captions[mode]}</Text>
      </View>
      <Button label={busy ? 'Préparation…' : 'Partager l’image'} variant="primary" onPress={(e) => share(pointOf(e))} disabled={busy || empty} />
      {STATUS[status] !== '' && (
        <Text style={[Type.label, styles.muted]} accessibilityLiveRegion="polite">
          {STATUS[status]}
        </Text>
      )}
    </Sheet>
  );
}

// Une image du carrousel, réduite de `fit` (la capture garde la taille réelle) : pâlie et plus petite sur les côtés ; toucher une voisine l'amène au centre.
function Page({
  index,
  step,
  fit,
  scrollX,
  active,
  onPress,
  children,
}: {
  index: number;
  step: number;
  fit: number;
  scrollX: SharedValue<number>;
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const width = SHARE_CARD.width * fit;
  const height = SHARE_CARD.height * fit;
  const style = useAnimatedStyle(() => {
    const range = [(index - 1) * step, index * step, (index + 1) * step];
    return {
      opacity: interpolate(scrollX.value, range, [0.45, 1, 0.45], 'clamp'),
      transform: [{ scale: interpolate(scrollX.value, range, [SIDE_SCALE, 1, SIDE_SCALE], 'clamp') }],
    };
  });
  return (
    <Animated.View style={[{ width, height }, WEB_SNAP_CHILD, style]}>
      <Pressable
        onPress={onPress}
        disabled={active}
        accessible={false}
        style={[
          styles.fitted,
          { left: (width - SHARE_CARD.width) / 2, top: (height - SHARE_CARD.height) / 2, transform: [{ scale: fit }] },
        ]}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

function Arrow({ icon, label, disabled, onPress }: { icon: 'chevron-back' | 'chevron-forward'; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.arrow, pressed && { backgroundColor: Colors.pressed }]}>
      <Ionicons name={icon} size={20} color={disabled ? Colors.rule : Colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // La table va d'un bord à l'autre de la feuille : les images voisines y dépassent.
  table: {
    alignItems: 'center',
    marginHorizontal: -Spacing.two,
    paddingBottom: Spacing.one,
    backgroundColor: Colors.ruleSoft,
  },
  pager: {
    alignSelf: 'stretch',
    flexGrow: 0,
  },
  pagerContent: {
    gap: GAP,
    paddingVertical: Spacing.three,
  },
  webCapture: {
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
  fitted: {
    position: 'absolute',
    width: SHARE_CARD.width,
    height: SHARE_CARD.height,
  },
  dots: {
    marginTop: -Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    width: MinTarget,
    height: MinTarget,
    borderRadius: MinTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotTarget: {
    width: 32,
    height: MinTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.boardEdge,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.ink,
  },
  preview: {
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    overflow: 'hidden',
    boxShadow: '0 6px 18px rgba(28, 30, 33, 0.12)',
  },
  caption: {
    gap: 2,
  },
  ink: {
    color: Colors.ink,
  },
  muted: {
    color: Colors.graphite,
  },
});
