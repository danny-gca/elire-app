import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from 'react-native';

let speak: ((message: string) => void) | null = null;

// Annonce au lecteur d'écran, à la suite de ce qu'il lit déjà ; sur le web, la zone aria-live la lit.
export function announce(message: string) {
  if (Platform.OS !== 'web') {
    AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: true });
    return;
  }
  speak?.(message);
}

// Zone d'annonce masquée du web, montée par l'écran qui annonce.
export function LiveRegion() {
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    // Vider puis écrire : le même message se relit ; une annonce chasse la précédente.
    const own = (m: string) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      setMessage('');
      timer.current = setTimeout(() => setMessage(m), 50);
    };
    speak = own;
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      if (speak === own) {
        speak = null;
      }
    };
  }, []);
  if (Platform.OS !== 'web') {
    return null;
  }
  return (
    <View aria-live="polite" style={styles.hidden}>
      <Text>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
  },
});
