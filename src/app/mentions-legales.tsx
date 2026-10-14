import { LegalPage } from '@/components/legal-page';
import { MENTIONS } from '@/constants/legal';

export default function MentionsScreen() {
  return <LegalPage title="Mentions légales" note="Qui publie ÉLIRE, où, et ce qui arrive à vos données." sections={MENTIONS} />;
}
