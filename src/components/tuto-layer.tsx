import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, BackHandler, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { Tip } from '@/components/ui/tip';
import { Colors, Markers, Radius, Spacing } from '@/constants/theme';
import { loopPath, type Box } from '@/lib/stroke';
import { playSound } from '@/lib/sound';
import { measureTarget, tutoStep, useTutoStore } from '@/store/tuto-store';
import { useVotesStore } from '@/store/votes-store';

// Le temps que l'écran se pose (feuille qui arrive, défilement) avant de mesurer l'élément.
const SETTLE_MS = 450;
// Le trait sort du message une fois le gribouillis presque tracé.
const LOOP_DELAY = 220 + 900;
const LOOP_MS = 650;
const LOOP_WIDTH = 6;
const HOLE_PAD = 8;
const HOLE_RADIUS = 14;
const VEIL = 'rgba(28, 30, 33, 0.32)';
const CARD_MAX = 560;

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Le tuto, au-dessus de toute l'app : un message, et le surligneur qui en sort pour entourer ce dont il parle.
export function TutoLayer() {
  const id = useTutoStore((s) => s.queue[0]);
  const skip = useTutoStore((s) => s.skip);
  const { width, height } = useWindowDimensions();
  const [found, setFound] = useState<{ id: string; box: Box } | null>(null);

  useEffect(() => {
    const step = id ? tutoStep(id) : undefined;
    if (!id || !step) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const box = await measureTarget(step.cible);
      if (cancelled) {
        return;
      }
      if (!box || box.y + box.height < 0 || box.y > height) {
        skip(id);
        return;
      }
      setFound({ id, box });
    }, SETTLE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, width, height, skip]);

  // Android : le retour ne ferme pas une étape, seul « Compris » le fait.
  useEffect(() => {
    if (!id) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [id]);

  if (!id) {
    return null;
  }
  // Pendant la mesure, l'app est déjà en pause : rien ne se touche.
  if (found?.id !== id) {
    return <View style={StyleSheet.absoluteFill} />;
  }
  return <TutoStepView key={id} id={id} box={found.box} width={width} height={height} />;
}

function TutoStepView({ id, box, width, height }: { id: string; box: Box; width: number; height: number }) {
  const step = tutoStep(id)!;
  const done = useTutoStore((s) => s.done);
  const marker = useVotesStore((s) => s.marker);
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [cardHeight, setCardHeight] = useState(0);
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  const cardWidth = Math.min(width - Spacing.two * 2, CARD_MAX);
  const left = (width - cardWidth) / 2;
  // Le message en haut ; en bas quand l'élément entouré est lui-même en haut.
  const atTop = box.y + box.height / 2 > height * 0.42;
  const top = atTop ? insets.top + 12 : height - insets.bottom - 12 - cardHeight;
  const loop = useMemo(() => {
    if (!cardHeight) {
      return null;
    }
    const from: [number, number] = [left + cardWidth * 0.78, atTop ? top + cardHeight - 10 : top + 10];
    return loopPath(from, box, { width, height });
  }, [cardHeight, left, cardWidth, atTop, top, box, width, height]);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(step.lignes.join(' '));
  }, [step]);
  useEffect(() => {
    if (!loop) {
      return;
    }
    if (!reducedMotion) {
      progress.value = withDelay(LOOP_DELAY, withTiming(1, { duration: LOOP_MS, easing: Easing.inOut(Easing.quad) }));
    }
    const timer = setTimeout(() => playSound('trait'), reducedMotion ? 0 : LOOP_DELAY);
    return () => clearTimeout(timer);
  }, [loop, reducedMotion, progress]);
  const length = loop?.length ?? 0;
  const loopProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value) }));

  const hole = {
    x: box.x - HOLE_PAD,
    y: box.y - HOLE_PAD,
    w: box.width + HOLE_PAD * 2,
    h: box.height + HOLE_PAD * 2,
  };
  const r = Math.min(HOLE_RADIUS, hole.h / 2);
  // Le voile de l'app, percé autour de l'élément : il reste net, le reste attend.
  const veil =
    `M0 0H${width}V${height}H0Z ` +
    `M${hole.x + r} ${hole.y}H${hole.x + hole.w - r}A${r} ${r} 0 0 1 ${hole.x + hole.w} ${hole.y + r}` +
    `V${hole.y + hole.h - r}A${r} ${r} 0 0 1 ${hole.x + hole.w - r} ${hole.y + hole.h}` +
    `H${hole.x + r}A${r} ${r} 0 0 1 ${hole.x} ${hole.y + hole.h - r}V${hole.y + r}A${r} ${r} 0 0 1 ${hole.x + r} ${hole.y}Z`;

  return (
    <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(220)} style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Path d={veil} fill={VEIL} fillRule="evenodd" />
        {loop && (
          <AnimatedPath
            d={loop.d}
            stroke={Markers[marker].solid}
            strokeWidth={LOOP_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={[length, length]}
            animatedProps={loopProps}
          />
        )}
      </Svg>
      <View
        style={[styles.card, { left, width: cardWidth, top }, !cardHeight && styles.measuring]}
        onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}>
        <Tip lines={step.lignes} marker={marker} />
        <Button label="Compris" variant="primary" onPress={() => done(id)} style={styles.ok} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    paddingBottom: 12,
  },
  // Première mise en page hors de la vue, le temps de connaître sa hauteur.
  measuring: {
    opacity: 0,
  },
  ok: {
    marginHorizontal: 12,
  },
});
