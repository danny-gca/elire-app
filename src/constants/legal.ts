import { REPORT_FORM } from '@/constants/app';

// Mentions légales et politique de correction : même texte sur le site (elire-website/src/data/legal.ts), à relire par un avocat.
export type LegalSection = { titre: string; paragraphes: string[] };

/** Éditeur à titre personnel, et l'adresse qui reçoit corrections et droits de réponse. */
export const EDITEUR = { nom: 'Danny Garcia', contact: 'contact@danny-garcia.fr' };
export const HEBERGEUR = 'GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (GitHub Pages)';
export const CORRECTION_DELAY = '10 jours ouvrés';
export const CONTACT_URL = `mailto:${EDITEUR.contact}?subject=${encodeURIComponent('élire : correction ou droit de réponse')}`;

const contact = `par courriel à ${EDITEUR.contact}`;

export const MENTIONS: LegalSection[] = [
  {
    titre: 'Éditeur',
    paragraphes: [
      `élire est édité à titre personnel et non professionnel par ${EDITEUR.nom}, directeur de la publication. Contact : ${contact}.`,
      "élire n'est lié à aucun parti, à aucun candidat ni à l'État, et ne reçoit aucun financement de leur part.",
    ],
  },
  { titre: 'Hébergement', paragraphes: [`Le site et la version web de l'app sont hébergés par ${HEBERGEUR}.`] },
  {
    titre: 'Données personnelles',
    paragraphes: [
      "Aucun compte, aucun cookie, aucun traceur. Vos votes et vos réglages restent sur votre appareil : ils ne sont jamais envoyés ni à l'éditeur ni à un tiers.",
      "Pour les effacer : « Réinitialiser mes votes » dans l'onglet Cahier, ou supprimez l'app (sur le web, les données du site dans votre navigateur).",
      REPORT_FORM.url
        ? "Signaler une erreur ouvre un formulaire Google, qui applique ses propres conditions. Rien n'est envoyé avant votre clic sur Envoyer, et votre adresse n'est demandée que si vous voulez une réponse."
        : 'Signaler une erreur ouvre GitHub, qui applique ses propres conditions.',
    ],
  },
  {
    titre: 'Propriété',
    paragraphes: [
      'Code sous licence MIT, données sous licence CC BY-SA 4.0.',
      'Les citations des candidats sont courtes, exactes et sourcées, au titre du droit de citation. Portraits, polices et icônes : voir Crédits.',
    ],
  },
];

export const CORRECTIONS: LegalSection[] = [
  {
    titre: 'Ce qui est publié',
    paragraphes: [
      "Un candidat est ajouté quand sa candidature est déclarée ou désignée, avec une source datée. Chacun a le même nombre de propositions, choisies parmi les mesures centrales de son programme.",
      "Chaque proposition est une citation exacte, avec son lien. Chaque scrutin est un vote public dont le résultat par député vient des données ouvertes de l'Assemblée, du Sénat ou du Parlement européen.",
      "Les titres résument la citation sans la déformer. élire ne donne aucune consigne de vote.",
    ],
  },
  {
    titre: 'Corrections',
    paragraphes: [
      `Une erreur signalée est vérifiée contre sa source, puis corrigée ou retirée sous ${CORRECTION_DELAY}.`,
      "Chaque correction est publique et datée dans l'historique du dépôt. Le numéro de la proposition ou du scrutin (P-531, L-28) ne change jamais.",
    ],
  },
  {
    titre: 'Droit de réponse',
    paragraphes: [
      `Un candidat ou un parti peut demander une correction, ou exercer le droit de réponse prévu par la loi, ${contact}. Un ticket « Droit de réponse » sur GitHub est aussi possible, mais il est public.`,
    ],
  },
];
