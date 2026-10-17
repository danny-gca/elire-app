import { TabList, TabSlot, TabTrigger, Tabs, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Brand } from '@/components/brand';
import { Colors, Markers, MaxContentWidth, Spacing, Type } from '@/constants/theme';
import { useVotesStore } from '@/store/votes-store';

// Sur le web, les sources SVG du jeu commun : nettes à toute densité d'écran.
const TAB_ICONS = {
  index: require('@/assets/icons/tabs/voter.svg'),
  cahier: require('@/assets/icons/tabs/cahier.svg'),
  lois: require('@/assets/icons/tabs/lois.svg'),
  explore: require('@/assets/icons/tabs/explorer.svg'),
};

// Barre du bas sur mobile, barre du haut sur grand écran.
const WIDE = 900;

export function AppTabs() {
  const wide = useWindowDimensions().width >= WIDE;
  const list = (
    <TabList asChild>
      <TabBar wide={wide}>
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
      <TabSlot style={styles.slot} />
      {!wide && list}
    </Tabs>
  );
}

export default AppTabs;

interface TabButtonProps extends TabTriggerSlotProps {
  /** Icône du jeu commun (PNG teinté selon l'état). */
  icon: number;
  wide: boolean;
  children: React.ReactNode;
}

function TabButton({ children, icon, wide, isFocused, ...props }: TabButtonProps) {
  const marker = useVotesStore((s) => s.marker);
  const color = isFocused ? Colors.ink : Colors.graphite;
  const size = wide ? 18 : 22;
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      style={({ pressed }) => [wide ? styles.buttonWide : styles.button, pressed && { backgroundColor: Colors.pressed }]}>
      <Image source={icon} style={{ width: size, height: size, tintColor: color }} accessibilityIgnoresInvertColors />
      <View>
        {/* L'onglet actif : son libellé surligné de biais, au surligneur du lecteur. */}
        {isFocused && <View style={[styles.mark, { backgroundColor: Markers[marker].soft }]} />}
        <Text style={[isFocused ? Type.labelStrong : Type.label, { color }]}>{children}</Text>
      </View>
    </Pressable>
  );
}

function TabBar({ wide, ...props }: TabListProps & { wide: boolean }) {
  return (
    <View {...props} style={wide ? styles.barWide : styles.bar}>
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
    gap: 2,
    paddingTop: 8,
    paddingBottom: 10,
    minHeight: 56,
  },
  buttonWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  mark: {
    position: 'absolute',
    top: 7,
    bottom: -1,
    left: -5,
    right: -5,
    borderRadius: 3,
    transform: [{ rotate: '-3deg' }],
  },
});
