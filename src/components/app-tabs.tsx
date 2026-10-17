import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

import { TAB_ICONS, TAB_ICONS_IOS } from '@/constants/tab-icons';
import { Colors, Markers, type MarkerId } from '@/constants/theme';
import { useVotesStore } from '@/store/votes-store';

type TabName = keyof typeof TAB_ICONS;

// L'onglet actif prend le surligneur du lecteur : icône dédiée sur iOS, pastille Material (indicatorColor) sur Android.
function TabIcon({ name, marker }: { name: TabName; marker: MarkerId }) {
  if (Platform.OS === 'ios') {
    return <NativeTabs.Trigger.Icon src={{ default: TAB_ICONS_IOS[name].off, selected: TAB_ICONS_IOS[name][marker] }} renderingMode="original" />;
  }
  return <NativeTabs.Trigger.Icon src={TAB_ICONS[name]} />;
}

export function AppTabs() {
  const marker = useVotesStore((s) => s.marker);
  return (
    <NativeTabs
      backgroundColor={Colors.sheet}
      tintColor={Colors.ink}
      iconColor={Colors.graphite}
      indicatorColor={Markers[marker].solid}
      labelStyle={{ default: { color: Colors.graphite }, selected: { color: Colors.ink } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Voter</NativeTabs.Trigger.Label>
        <TabIcon name="index" marker={marker} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cahier">
        <NativeTabs.Trigger.Label>Cahier</NativeTabs.Trigger.Label>
        <TabIcon name="cahier" marker={marker} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="lois">
        <NativeTabs.Trigger.Label>Lois</NativeTabs.Trigger.Label>
        <TabIcon name="lois" marker={marker} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explorer</NativeTabs.Trigger.Label>
        <TabIcon name="explore" marker={marker} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default AppTabs;
