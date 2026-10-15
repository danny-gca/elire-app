import '@/global.css';

import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { CelebrationLayer } from '@/components/celebration';
import { FONT_FILES } from '@/constants/fonts';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: Colors.paper, card: Colors.sheet, text: Colors.ink, border: Colors.rule, primary: Colors.ink },
};

export default function RootLayout() {
  // Sans les polices, l'écran de lancement reste affiché ; en cas d'erreur, polices de secours.
  const [loaded, error] = useFonts(FONT_FILES);
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);
  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.paper } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="candidate/[id]" />
        <Stack.Screen name="theme/[id]" />
        <Stack.Screen name="credits" />
        <Stack.Screen name="mentions-legales" />
        <Stack.Screen name="corrections" />
        <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', gestureEnabled: false, animation: 'fade' }} />
      </Stack>
      <CelebrationLayer host="app" />
    </ThemeProvider>
  );
}
