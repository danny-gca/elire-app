import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { Button } from '@/components/ui/button';
import { plural } from '@/lib/format';

interface ResetButtonProps {
  count: number;
  onConfirm: () => void;
}

const CONFIRM_DELAY_MS = 4000;

// Confirmation en deux appuis, sans modale : le second appui efface.
export function ResetButton({ count, onConfirm }: ResetButtonProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) {
      return;
    }
    AccessibilityInfo.announceForAccessibility('Appuyez de nouveau pour confirmer.');
    const timer = setTimeout(() => setArmed(false), CONFIRM_DELAY_MS);
    return () => clearTimeout(timer);
  }, [armed]);

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
