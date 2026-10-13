import { Redirect } from 'expo-router';

import { AppTabs } from '@/components/app-tabs';
import { useVotesStore } from '@/store/votes-store';

export default function TabsLayout() {
  const onboardingSeen = useVotesStore((s) => s.onboardingSeen);
  if (!onboardingSeen) {
    return <Redirect href="/onboarding" />;
  }
  return <AppTabs />;
}
