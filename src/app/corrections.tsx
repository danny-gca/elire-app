import { LegalPage } from '@/components/legal-page';
import { CONTACT_URL, CORRECTIONS } from '@/constants/legal';

export default function CorrectionsScreen() {
  return (
    <LegalPage
      title="Méthode et corrections"
      note="Comment les données sont choisies, vérifiées et corrigées."
      sections={CORRECTIONS}
      action={{ label: 'Écrire à contact@danny-garcia.fr', url: CONTACT_URL }}
    />
  );
}
