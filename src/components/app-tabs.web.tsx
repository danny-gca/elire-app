import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabList, TabSlot, TabTrigger, Tabs, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Colors, MaxContentWidth, Spacing, Type } from '@/constants/theme';

// Barre du bas sur mobile, barre du haut sur grand écran.
const WIDE = 900;

export function AppTabs() {
  const wide = useWindowDimensions().width >= WIDE;
  const list = (
    <TabList asChild>
      <TabBar wide={wide}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon="create-outline" wide={wide}>Voter</TabButton>
        </TabTrigger>
        <TabTrigger name="results" href="/results" asChild>
          <TabButton icon="list-outline" wide={wide}>Classement</TabButton>
        </TabTrigger>
        <TabTrigger name="lois" href="/lois" asChild>
          <TabButton icon={{ mci: 'scale-balance' }} wide={wide}>Lois</TabButton>
        </TabTrigger>
        <TabTrigger name="explore" href="/explore" asChild>
          <TabButton icon="library-outline" wide={wide}>Explorer</TabButton>
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
  /** Ionicons par défaut ; Material Community quand Ionicons n'a pas le pictogramme (balance de justice). */
  icon: keyof typeof Ionicons.glyphMap | { mci: keyof typeof MaterialCommunityIcons.glyphMap };
  wide: boolean;
  children: React.ReactNode;
}

function TabButton({ children, icon, wide, isFocused, ...props }: TabButtonProps) {
  const color = isFocused ? Colors.ink : Colors.graphite;
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      style={({ pressed }) => [wide ? styles.buttonWide : styles.button, pressed && { backgroundColor: Colors.pressed }]}>
      <View style={[wide ? styles.indicatorWide : styles.indicator, isFocused && { backgroundColor: Colors.ink }]} />
      {typeof icon === 'string' ? (
        <Ionicons name={icon} size={wide ? 18 : 22} color={color} />
      ) : (
        <MaterialCommunityIcons name={icon.mci} size={wide ? 18 : 22} color={color} />
      )}
      <Text style={[isFocused ? Type.labelStrong : Type.label, { color }]}>{children}</Text>
    </Pressable>
  );
}

function TabBar({ wide, ...props }: TabListProps & { wide: boolean }) {
  return (
    <View {...props} style={wide ? styles.barWide : styles.bar}>
      <View style={styles.inner}>
        {wide && (
          <View style={styles.brand} accessibilityRole="header">
            <Text style={[Type.bodyStrong, { color: Colors.ink }]}>ÉLIRE</Text>
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
  indicator: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: 'transparent',
  },
  indicatorWide: {
    position: 'absolute',
    bottom: 0,
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: 'transparent',
  },
});
