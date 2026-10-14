import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { TAB_ICONS } from '@/constants/tab-icons';
import { Colors } from '@/constants/theme';

export function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Colors.sheet}
      tintColor={Colors.ink}
      iconColor={Colors.graphite}
      indicatorColor={Colors.ruleSoft}
      labelStyle={{ default: { color: Colors.graphite }, selected: { color: Colors.ink } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Voter</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={TAB_ICONS.index} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="results">
        <NativeTabs.Trigger.Label>Classement</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={TAB_ICONS.results} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="lois">
        <NativeTabs.Trigger.Label>Lois</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={TAB_ICONS.lois} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explorer</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={TAB_ICONS.explore} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default AppTabs;
