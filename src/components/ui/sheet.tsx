import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CelebrationLayer } from '@/components/celebration';
import { Colors, MaxContentWidth, MinTarget, Radius, Spacing, Type } from '@/constants/theme';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

// Fait défiler la feuille juste assez pour montrer un élément qui vient de s'ouvrir (une échelle de vote).
const RevealContext = createContext<(target: View | null) => void>(() => {});
export const useSheetReveal = () => useContext(RevealContext);

const OPEN_MS = 260;
const CLOSE_MS = 200;

// Feuille modale : pageSheet natif sur iOS, panneau du bas ailleurs (voile en fondu sur place, seul le panneau glisse).
export function Sheet({ visible, title, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const ios = Platform.OS === 'ios';
  const { height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);
  const [panelHeight, setPanelHeight] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const inner = useRef<View>(null);
  const view = useRef({ offset: 0, height: 0 });
  const reveal = useCallback((target: View | null) => {
    if (!target || !inner.current) {
      return;
    }
    target.measureLayout(inner.current, (_x, y, _w, h) => {
      // Le contenu commence après la marge du haut ; un peu d'air sous l'élément.
      const bottom = Spacing.two + y + h + Spacing.three;
      const { offset, height: seen } = view.current;
      if (bottom > offset + seen) {
        scroll.current?.scrollTo({ y: bottom - seen, animated: true });
      }
    });
  }, []);
  // Glisser l'en-tête vers le bas : au-delà du quart de la feuille ou d'un geste vif, elle se ferme ; sinon elle revient.
  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-20, 20])
    .onUpdate((e) => {
      drag.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > Math.max(80, panelHeight * 0.25) || e.velocityY > 900) {
        scheduleOnRN(onClose);
      } else {
        drag.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });
  if (visible && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (ios) {
      return;
    }
    if (visible) {
      drag.value = 0;
      progress.value = withTiming(1, { duration: reducedMotion ? 0 : OPEN_MS, easing: Easing.out(Easing.exp) });
      return;
    }
    progress.value = withTiming(0, { duration: reducedMotion ? 0 : CLOSE_MS, easing: Easing.in(Easing.quad) });
    const timer = setTimeout(() => setMounted(false), reducedMotion ? 0 : CLOSE_MS);
    return () => clearTimeout(timer);
  }, [visible, ios, reducedMotion, progress, drag]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * height + drag.value }] }));

  const header = (
    <View>
      {/* Poignée : signale qu'on peut glisser la feuille vers le bas pour la fermer. */}
      {!ios && (
        <View style={styles.handleZone}>
          <View style={styles.handle} />
        </View>
      )}
      <View style={styles.header}>
        <Text style={[Type.bodyStrong, styles.title]} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fermer" style={styles.close} hitSlop={8}>
          <Text style={[Type.bodyStrong, { color: Colors.ink }]}>Fermer</Text>
        </Pressable>
      </View>
    </View>
  );

  const content = (
    <ScrollView
      ref={scroll}
      scrollEventThrottle={32}
      onScroll={(e) => {
        view.current.offset = e.nativeEvent.contentOffset.y;
      }}
      onLayout={(e) => {
        view.current.height = e.nativeEvent.layout.height;
      }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.three }]}>
      <View ref={inner} style={styles.inner}>
        <RevealContext.Provider value={reveal}>{children}</RevealContext.Provider>
      </View>
    </ScrollView>
  );

  if (ios) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={styles.iosRoot}>
          {header}
          {content}
          <CelebrationLayer host="sheet" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={mounted} animationType="none" transparent onRequestClose={onClose}>
      {/* Android : une Modal est hors de l'arbre racine, les gestes y demandent leur propre racine. */}
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fermer" />
        </Animated.View>
        <Animated.View style={[styles.panel, { maxHeight: '88%' }, panelStyle]} onLayout={(e) => setPanelHeight(e.nativeEvent.layout.height)}>
          <GestureDetector gesture={pan}>{header}</GestureDetector>
          {content}
        </Animated.View>
        <CelebrationLayer host="sheet" />
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  iosRoot: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(28, 30, 33, 0.32)',
  },
  panel: {
    width: '100%',
    maxWidth: MaxContentWidth,
    backgroundColor: Colors.paper,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
  },
  handleZone: {
    alignItems: 'center',
    paddingTop: Spacing.one,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.rule,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.rule,
  },
  title: {
    flex: 1,
    color: Colors.ink,
  },
  close: {
    minHeight: MinTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  content: {
    padding: Spacing.two,
  },
  inner: {
    gap: Spacing.two,
  },
});
