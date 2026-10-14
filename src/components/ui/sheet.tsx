import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, MinTarget, Radius, Spacing, Type } from '@/constants/theme';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

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
  if (visible && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (ios) {
      return;
    }
    if (visible) {
      progress.value = withTiming(1, { duration: reducedMotion ? 0 : OPEN_MS, easing: Easing.out(Easing.exp) });
      return;
    }
    progress.value = withTiming(0, { duration: reducedMotion ? 0 : CLOSE_MS, easing: Easing.in(Easing.quad) });
    const timer = setTimeout(() => setMounted(false), reducedMotion ? 0 : CLOSE_MS);
    return () => clearTimeout(timer);
  }, [visible, ios, reducedMotion, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * height }] }));

  const header = (
    <View style={styles.header}>
      <Text style={[Type.bodyStrong, styles.title]} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fermer" style={styles.close} hitSlop={8}>
        <Text style={[Type.bodyStrong, { color: Colors.ink }]}>Fermer</Text>
      </Pressable>
    </View>
  );

  const content = (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.three }]}>
      {children}
    </ScrollView>
  );

  if (ios) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={styles.iosRoot}>
          {header}
          {content}
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={mounted} animationType="none" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fermer" />
        </Animated.View>
        <Animated.View style={[styles.panel, { maxHeight: '88%' }, panelStyle]}>
          {header}
          {content}
        </Animated.View>
      </View>
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
    gap: Spacing.two,
  },
});
