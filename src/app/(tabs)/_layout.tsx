import { Redirect } from 'expo-router';

import { AppTabs } from '@/components/app-tabs';
import { ONBOARDING_VERSION, useVotesStore } from '@/store/votes-store';

export default function TabsLayout() {
  // Jamais vue, ou une version plus ancienne que la présentation actuelle : on la (re)montre.
  const onboardingSeen = useVotesStore((s) => s.onboardingVersion >= ONBOARDING_VERSION);
  if (!onboardingSeen) {
    return <Redirect href="/onboarding" />;
  }
  return <AppTabs />;
}
