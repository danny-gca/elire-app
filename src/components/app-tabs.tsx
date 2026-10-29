import { TabList, TabSlot, TabTrigger, Tabs, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/components/brand';
import { BottomBarContext } from '@/components/screen';
import { TabMark } from '@/components/tab-mark';
import { TAB_ICONS } from '@/constants/tab-icons';
import { Colors, MaxContentWidth, Spacing, Type } from '@/constants/theme';
import { buzz } from '@/lib/sound';
import { useVotesStore } from '@/store/votes-store';

// Barre du bas sur mobile, barre du haut sur grand écran (tablette paysage / desktop).
const WIDE = 900;

export function AppTabs() {
  const wide = useWindowDimensions().width >= WIDE;
  const insets = useSafeAreaInsets();

  const list = (
    <TabList asChild>
      <TabBar wide={wide} bottomInset={insets.bottom}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon={TAB_ICONS.index} wide={wide}>Voter</TabButton>
        </TabTrigger>
        <TabTrigger name="cahier" href="/cahier" asChild>
          <TabButton icon={TAB_ICONS.cahier} wide={wide}>Cahier</TabButton>
        </TabTrigger>
        <TabTrigger name="lois" href="/lois" asChild>
          <TabButton icon={TAB_ICONS.lois} wide={wide}>Lois</TabButton>
        </TabTrigger>
        <TabTrigger name="explore" href="/explore" asChild>
          <TabButton icon={TAB_ICONS.explore} wide={wide}>Explorer</TabButton>
        </TabTrigger>
      </TabBar>
    </TabList>
  );

  return (
    <Tabs style={styles.root}>
      {wide && list}
      <BottomBarContext.Provider value={!wide}>
        <TabSlot style={styles.slot} />
      </BottomBarContext.Provider>
      {!wide && list}
    </Tabs>
  );
}

export default AppTabs;

interface TabButtonProps extends TabTriggerSlotProps {
  /** Icône PNG nette du jeu commun, teintée selon l'état. */
  icon: number;
  wide: boolean;
  children: React.ReactNode;
}

function TabButton({ children, icon, wide, isFocused, onPress, ...props }: TabButtonProps) {
  const marker = useVotesStore((s) => s.marker);
  const color = isFocused ? Colors.ink : Colors.graphite;
  const size = wide ? 18 : 22;

  return (
    <Pressable
      {...props}
      onPress={(e) => {
        // Un changement d'onglet se sent ; retoucher l'onglet actif, non.
        if (!isFocused) {
          buzz('selection');
        }
        onPress?.(e);
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      style={({ pressed }) => [
        wide ? styles.buttonWide : styles.button,
        pressed && { backgroundColor: Colors.pressed },
      ]}>
      <Image
        source={icon}
        style={{ width: size, height: size, tintColor: color }}
        accessibilityIgnoresInvertColors
      />
      <View>
        {isFocused && <TabMark marker={marker} />}
        <Text style={[isFocused ? Type.labelStrong : Type.label, { color }]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

function TabBar({
  wide,
  bottomInset,
  ...props
}: TabListProps & { wide: boolean; bottomInset: number }) {
  return (
    <View
      {...props}
      style={[
        wide ? styles.barWide : styles.bar,
        !wide && { paddingBottom: Math.max(bottomInset, 8) },
      ]}>
      <View style={styles.inner}>
        {wide && (
          <View style={styles.brand}>
            <Brand height={26} />
          </View>
        )}
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  bar: {
    width: '100%',
    backgroundColor: Colors.sheet,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
    alignItems: 'center',
  },
  barWide: {
    width: '100%',
    backgroundColor: Colors.sheet,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.rule,
    alignItems: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginRight: 'auto',
    paddingHorizontal: Spacing.two,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 8,
    paddingBottom: 6,
    minHeight: 54,
  },
  buttonWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 56,
  },
});
