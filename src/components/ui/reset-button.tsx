import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { Button } from '@/components/ui/button';
import { plural } from '@/lib/format';

interface ResetButtonProps {
  count: number;
  onConfirm: () => void;
  /** Piloté de l'extérieur (démonstration de l'onboarding) ; sinon, par les appuis. */
  armed?: boolean;
  onArmedChange?: (armed: boolean) => void;
}

const CONFIRM_DELAY_MS = 4000;

// Confirmation en deux appuis, sans modale : le second appui efface.
export function ResetButton({ count, onConfirm, armed: controlled, onArmedChange }: ResetButtonProps) {
  const [own, setOwn] = useState(false);
  const armed = controlled ?? own;
  const setArmed = (next: boolean) => (onArmedChange ? onArmedChange(next) : setOwn(next));

  useEffect(() => {
    if (!armed) {
      return;
    }
    AccessibilityInfo.announceForAccessibility('Appuyez de nouveau pour confirmer.');
    const timer = setTimeout(() => (onArmedChange ? onArmedChange(false) : setOwn(false)), CONFIRM_DELAY_MS);
    return () => clearTimeout(timer);
  }, [armed, onArmedChange]);

  const handlePress = () => {
    if (armed) {
      setArmed(false);
      onConfirm();
    } else {
      setArmed(true);
    }
  };

  return (
    <Button
      label={armed ? `Confirmer : effacer ${plural(count, 'vote')}` : 'Réinitialiser mes votes'}
      icon={armed ? 'trash-outline' : 'refresh-outline'}
      variant={armed ? 'danger' : 'secondary'}
      disabled={count === 0}
      onPress={handlePress}
      accessibilityHint="Efface tous vos votes enregistrés sur cet appareil"
    />
  );
}
