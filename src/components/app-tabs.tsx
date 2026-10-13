import { NativeTabs } from 'expo-router/unstable-native-tabs';

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
        <NativeTabs.Trigger.Icon sf="square.and.pencil" md="edit_note" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="results">
        <NativeTabs.Trigger.Label>Classement</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.number" md="format_list_numbered" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="lois">
        <NativeTabs.Trigger.Label>Lois</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="scalemass" md="scale" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explorer</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="books.vertical" md="library_books" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default AppTabs;
