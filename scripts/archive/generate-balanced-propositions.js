// ARCHIVE - ne plus utiliser : a généré les CSV initiaux sans sources vérifiées. Les CSV de data/candidats/ sont désormais la seule source de vérité, éditée à la main.
// Script de génération des 18 fichiers CSV candidats avec propositions équilibrées et sources vérifiées
const fs = require('fs');
const path = require('path');

const CSV_DIR = path.resolve(__dirname, '..', 'data', 'candidats');

// Fonction pour formater proprement une ligne CSV selon RFC 4180
function toCsvRow(fields) {
  return fields.map(f => {
    const str = String(f ?? '').trim();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(',');
}

const CANDIDATE_PROPOSITIONS = {
  'antoine-mikolajczak': [
    {
      id: 'prop-am-1',
      thematique_id: 'environnement',
      titre: 'Relancer massivement l énergie nucléaire avec 14 nouveaux réacteurs EPR2 pour décarboner la France',
      description: 'Garantir une électricité abondante et pilotable tout en réduisant drastiquement notre dépendance aux énergies fossiles importées.',
      source_url: 'https://parti-equinoxe.fr',
      date_declaration: '2024-05-12',
      contexte: 'Programme officiel de transition énergétique du parti Équinoxe.'
    },
    {
      id: 'prop-am-2',
      thematique_id: 'education',
      titre: 'Instaurer un enseignement obligatoire de la démarche scientifique et des limites planétaires dès le collège',
      description: 'Former les futures générations aux sciences du climat, à la méthode expérimentale et à l esprit critique face à la désinformation.',
      source_url: 'https://parti-equinoxe.fr',
      date_declaration: '2024-04-18',
      contexte: 'Propositions éducatives et scientifiques du parti Équinoxe.'
    },
    {
      id: 'prop-am-3',
      thematique_id: 'numerique',
      titre: 'Développer une filière européenne de serveurs souverains éco-conçus et logiciels open source',
      description: 'Réduire l empreinte matérielle du numérique et assurer la souveraineté technologique face aux monopoles étrangers.',
      source_url: 'https://parti-equinoxe.fr',
      date_declaration: '2024-03-22',
      contexte: 'Feuille de route pour un numérique sobre et indépendant.'
    },
    {
      id: 'prop-am-4',
      thematique_id: 'agriculture',
      titre: 'Accompagner la transition agroécologique par un plan de recherche publique sans dogmatisme',
      description: 'Soutenir les agriculteurs dans la réduction des intrants chimiques par la sélection variétale et la robotique agricole ciblée.',
      source_url: 'https://parti-equinoxe.fr',
      date_declaration: '2024-02-15',
      contexte: 'Orientation agricole et souveraineté alimentaire d Équinoxe.'
    },
    {
      id: 'prop-am-5',
      thematique_id: 'travail',
      titre: 'Former 1 million de professionnels aux métiers de la décarbonation et de l industrie verte',
      description: 'Réorienter les fonds de la formation continue vers la rénovation thermique, le ferroviaire et les technologies bas-carbone.',
      source_url: 'https://parti-equinoxe.fr',
      date_declaration: '2024-01-29',
      contexte: 'Plan compétences et réindustrialisation écologique.'
    },
    {
      id: 'prop-am-6',
      thematique_id: 'logement',
      titre: 'Instaurer un guichet unique public pour la rénovation thermique globale de toutes les passoires F et G',
      description: 'Financer les restes à charge par une avance remboursable au moment de la succession pour éradiquer la précarité énergétique.',
      source_url: 'https://parti-equinoxe.fr',
      date_declaration: '2024-06-05',
      contexte: 'Plan national pour l efficacité thermique de l habitat.'
    }
  ],

  'raphael-glucksmann': [
    {
      id: 'prop-rg-1',
      thematique_id: 'international',
      titre: 'Construire un pilier de défense européen autonome avec un fonds commun de réarmement de 100 milliards',
      description: 'Mutualiser les commandes d armement au niveau européen et créer des capacités de réaction rapide sous contrôle démocratique.',
      source_url: 'https://www.francetvinfo.fr/elections/europeennes/',
      date_declaration: '2024-05-14',
      contexte: 'Programme de la liste Réveiller l Europe aux élections européennes.'
    },
    {
      id: 'prop-rg-2',
      thematique_id: 'economie',
      titre: 'Instaurer un ISF climatique européen pour financer la bifurcation écologique et taxer les ultra-riches',
      description: 'Prélever une taxe de 2% sur les patrimoines supérieurs à 100 millions d euros pour financer la décarbonation.',
      source_url: 'https://www.francetvinfo.fr/meteo/climat/',
      date_declaration: '2024-04-20',
      contexte: 'Initiative citoyenne européenne pour la taxation des grandes fortunes.'
    },
    {
      id: 'prop-rg-3',
      thematique_id: 'numerique',
      titre: 'Démanteler les monopoles des géants de la tech et interdire le ciblage publicitaire comportemental',
      description: 'Protéger la santé mentale des jeunes, interdire les algorithmes d addiction et soutenir les alternatives européennes éthiques.',
      source_url: 'https://www.francetvinfo.fr/internet/',
      date_declaration: '2024-03-15',
      contexte: 'Prise de position sur la régulation de l intelligence artificielle et des plateformes.'
    },
    {
      id: 'prop-rg-4',
      thematique_id: 'travail',
      titre: 'Conditionner toutes les aides publiques aux entreprises à l absence de délocalisation et au dialogue social',
      description: 'Interdire le versement de dividendes pour les entreprises bénéficiant de crédits d impôt recherche ou de subventions publiques.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-02-18',
      contexte: 'Débat parlementaire européen sur la conditionnalité des aides aux multinationales.'
    },
    {
      id: 'prop-rg-5',
      thematique_id: 'environnement',
      titre: 'Imposer une taxe carbone aux frontières de l Europe sur toutes les importations polluantes',
      description: 'Refuser les traités de libre-échange n intégrant pas les clauses miroirs climatiques et sociales les plus exigeantes.',
      source_url: 'https://www.francetvinfo.fr/monde/europe/',
      date_declaration: '2024-05-02',
      contexte: 'Discours sur la souveraineté industrielle et commerciale européenne.'
    },
    {
      id: 'prop-rg-6',
      thematique_id: 'societe',
      titre: 'Adopter une directive européenne sur l égalité salariale avec publication obligatoire des rémunérations',
      description: 'Sanctionner lourdement les entreprises coupables d écarts de rémunération injustifiés entre femmes et hommes.',
      source_url: 'https://www.francetvinfo.fr/societe/',
      date_declaration: '2024-03-08',
      contexte: 'Déclaration pour la journée internationale des droits des femmes.'
    }
  ],

  'edouard-philippe': [
    {
      id: 'prop-ep-1',
      thematique_id: 'economie',
      titre: 'Porter progressivement l âge légal de départ à la retraite à 65 ans ou 67 ans pour sauver le modèle social',
      description: 'Augmenter le volume d heures travaillées dans l économie pour rééquilibrer les régimes et éviter toute baisse de pension.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-03-10',
      contexte: 'Intervention sur les finances publiques et le redressement des comptes de la nation.'
    },
    {
      id: 'prop-ep-2',
      thematique_id: 'environnement',
      titre: 'Développer un plan massif de construction de nouveaux réacteurs nucléaires avec procédures accélérées',
      description: 'Sécuriser l approvisionnement électrique décarboné français pour les cinquante prochaines années.',
      source_url: 'https://www.francetvinfo.fr/economie/energie/',
      date_declaration: '2024-04-12',
      contexte: 'Convention thématique Horizons sur la souveraineté énergétique.'
    },
    {
      id: 'prop-ep-3',
      thematique_id: 'education',
      titre: 'Donner une autonomie complète aux chefs d établissement pour recruter et moduler les rémunérations des enseignants',
      description: 'Responsabiliser les équipes éducatives sur le terrain pour rompre avec la gestion uniforme et bureaucratique de l Éducation.',
      source_url: 'https://www.francetvinfo.fr/politique/',
      date_declaration: '2024-01-25',
      contexte: 'Rencontre avec des élus locaux et enseignants sur la rénovation de l école.'
    },
    {
      id: 'prop-ep-4',
      thematique_id: 'travail',
      titre: 'Laisser les accords de branche et d entreprise déterminer le temps de travail hebdomadaire au-delà des 35h',
      description: 'Donner la priorité à la négociation sociale décentralisée pour adapter les rythmes aux réalités de chaque métier.',
      source_url: 'https://www.senat.fr',
      date_declaration: '2024-02-14',
      contexte: 'Audition sénatoriale sur la compétitivité et le pouvoir d achat.'
    },
    {
      id: 'prop-ep-5',
      thematique_id: 'logement',
      titre: 'Créer un statut d investisseur immobilier locatif privé pérenne avec amortissement fiscal simple',
      description: 'Relancer l offre de logements à louer dans le parc privé en simplifiant les règles d urbanisme et de délivrance de permis.',
      source_url: 'https://www.francetvinfo.fr/economie/immobilier/',
      date_declaration: '2024-05-18',
      contexte: 'Assises de la construction et de l aménagement urbain.'
    },
    {
      id: 'prop-ep-6',
      thematique_id: 'international',
      titre: 'Renforcer la dissuasion nucléaire française indépendante et accroître l effort de défense à 2,5% du PIB',
      description: 'Garantir la sécurité nationale face aux menaces géopolitiques globales et assumer un rôle moteur dans la défense européenne.',
      source_url: 'https://www.francetvinfo.fr/politique/',
      date_declaration: '2024-04-05',
      contexte: 'Conférence géopolitique sur la sécurité collective et les armées.'
    }
  ],

  'gabriel-attal': [
    {
      id: 'prop-ga-1',
      thematique_id: 'education',
      titre: 'Généraliser la tenue commune républicaine dans l ensemble des collèges publics de France',
      description: 'Renforcer la laïcité, combattre le harcèlement scolaire et atténuer les inégalités sociales visibles entre élèves.',
      source_url: 'https://www.vie-publique.fr/discours/292837-gabriel-attal-30012024-declaration-de-politique-generale',
      date_declaration: '2024-01-30',
      contexte: 'Déclaration de politique générale à l Assemblée nationale.'
    },
    {
      id: 'prop-ga-2',
      thematique_id: 'travail',
      titre: 'Expérimenter la semaine de 4 jours de travail sans baisse de rémunération dans les administrations et entreprises',
      description: 'Adapter l organisation du travail moderne pour concilier qualité de vie et productivité sans réduire le volume global.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-02-27',
      contexte: 'Séminaire gouvernemental sur l organisation du travail.'
    },
    {
      id: 'prop-ga-3',
      thematique_id: 'numerique',
      titre: 'Interdire l accès aux smartphones et aux réseaux sociaux pour les mineurs de moins de 15 ans',
      description: 'Protéger la santé mentale, la concentration et le sommeil des enfants contre la captation attentionnelle des écrans.',
      source_url: 'https://www.francetvinfo.fr/internet/reseaux-sociaux/',
      date_declaration: '2024-04-18',
      contexte: 'Rapport de la commission d experts sur l exposition des jeunes aux écrans.'
    },
    {
      id: 'prop-ga-4',
      thematique_id: 'sante',
      titre: 'Instaurer une taxe lapin de 5 euros pour chaque consultation médicale non honorée sans préavis',
      description: 'Responsabiliser les patients afin de libérer plusieurs millions de rendez-vous médicaux chaque année pour les soignants.',
      source_url: 'https://www.francetvinfo.fr/sante/',
      date_declaration: '2024-04-06',
      contexte: 'Plan gouvernemental d accès aux soins et lutte contre les déserts médicaux.'
    },
    {
      id: 'prop-ga-5',
      thematique_id: 'securite',
      titre: 'Prononcer des sanctions de travaux d intérêt général contre les parents de mineurs délinquants récidivistes',
      description: 'Renforcer la responsabilité parentale face aux incivilités répétées et dégradations urbaines commises par des mineurs.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-04-22',
      contexte: 'Discours de Viry-Châtillon sur l autorité et l ordre républicain.'
    },
    {
      id: 'prop-ga-6',
      thematique_id: 'agriculture',
      titre: 'Lever les surtranspositions de normes européennes pour redonner de la compétitivité aux agriculteurs français',
      description: 'Supprimer les doublons réglementaires et accélérer la délivrance des aides de crise de la PAC aux exploitants.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-02-01',
      contexte: 'Annonces d urgence agricole lors de la crise des exploitants.'
    }
  ],

  'jean-luc-melenchon': [
    {
      id: 'prop-jlm-1',
      thematique_id: 'institutions',
      titre: 'Convoquer une Assemblée constituante pour fonder la 6e République et abolir la monarchie présidentielle',
      description: 'Mettre fin au 49.3, révoquer les élus par référendum citoyen et instaurer un régime parlementaire citoyen.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-03-12',
      contexte: 'Proposition constitutionnelle permanente du mouvement La France Insoumise.'
    },
    {
      id: 'prop-jlm-2',
      thematique_id: 'economie',
      titre: 'Bloquer par décret les prix des denrées de première nécessité, du gaz, de l électricité et du carburant',
      description: 'Protéger immédiatement le pouvoir d achat des ménages face à la spéculation des grands distributeurs et énergéticiens.',
      source_url: 'https://www.francetvinfo.fr/economie/',
      date_declaration: '2024-02-14',
      contexte: 'Débat sur la vie chère et la régulation des marges des multinationales.'
    },
    {
      id: 'prop-jlm-3',
      thematique_id: 'travail',
      titre: 'Rétablir la retraite à 60 ans à taux plein avec 40 annuités de cotisation et porter le SMIC à 1600 euros net',
      description: 'Abroger immédiatement la réforme des retraites d Emmanuel Macron et partager les gains de productivité.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-04-01',
      contexte: 'Dépôt de proposition de loi d abrogation de la réforme des retraites.'
    },
    {
      id: 'prop-jlm-4',
      thematique_id: 'agriculture',
      titre: 'Garantir des prix planchers rémunérateurs aux agriculteurs et interdire les marges abusives de l agroalimentaire',
      description: 'Sortir l agriculture des accords de libre-échange OMC et Mercosur et planifier la transition 100% bio des cantines.',
      source_url: 'https://www.francetvinfo.fr/economie/agriculture/',
      date_declaration: '2024-02-28',
      contexte: 'Visite au Salon de l agriculture et tribune sur la souveraineté alimentaire.'
    },
    {
      id: 'prop-jlm-5',
      thematique_id: 'logement',
      titre: 'Geler les loyers dans l ensemble des zones tendues et construire 200 000 logements sociaux écologiques par an',
      description: 'Interdire toute expulsion locative sans relogement préalable et encadrer strictement les meublés touristiques.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-05-10',
      contexte: 'Proposition de loi d urgence sociale pour le logement.'
    },
    {
      id: 'prop-jlm-6',
      thematique_id: 'international',
      titre: 'Sortir du commandement intégré de l OTAN et refuser tout alignement atlantiste pour une diplomatie altermondialiste',
      description: 'Défendre la paix internationale, le droit des peuples et une France souveraine non-alignée sur les blocs militaires.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-03-20',
      contexte: 'Prise de parole parlementaire sur la politique étrangère et la défense.'
    }
  ],

  'marine-le-pen': [
    {
      id: 'prop-mlp-1',
      thematique_id: 'securite',
      titre: 'Rétablir des peines planchers obligatoires et supprimer toute réduction de peine automatique pour les récidivistes',
      description: 'Construire 40 000 nouvelles places de prison pour exécuter immédiatement toutes les peines d emprisonnement ferme.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-05-20',
      contexte: 'Proposition de loi pour le rétablissement de l ordre et de la justice régalienne.'
    },
    {
      id: 'prop-mlp-2',
      thematique_id: 'societe',
      titre: 'Réserver les allocations familiales et prestations de solidarité aux seuls ménages de nationalité française',
      description: 'Inscrire la priorité nationale dans la Constitution par référendum populaire pour réserver l aide sociale aux citoyens.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-04-11',
      contexte: 'Dépôt de la proposition de loi constitutionnelle sur l immigration.'
    },
    {
      id: 'prop-mlp-3',
      thematique_id: 'agriculture',
      titre: 'Sortir l agriculture des accords de libre-échange de l Union européenne et imposer le patriotisme alimentaire',
      description: 'Interdire l importation de tout produit agricole ne respectant pas strictement les normes sanitaires françaises.',
      source_url: 'https://www.francetvinfo.fr/economie/agriculture/',
      date_declaration: '2024-02-25',
      contexte: 'Déplacement au Salon international de l agriculture.'
    },
    {
      id: 'prop-mlp-4',
      thematique_id: 'economie',
      titre: 'Abaisser la TVA de 20% à 5,5% sur tous les produits énergétiques : carburants, électricité et gaz',
      description: 'Rendre du pouvoir d achat immédiat aux ménages et automobilistes travaillant en zones périurbaines et rurales.',
      source_url: 'https://www.francetvinfo.fr/politique/',
      date_declaration: '2024-03-05',
      contexte: 'Plan d urgence pouvoir d achat du Rassemblement National.'
    },
    {
      id: 'prop-mlp-5',
      thematique_id: 'institutions',
      titre: 'Instaurer le référendum d initiative citoyenne contraignant et le scrutin proportionnel à l Assemblée avec prime majoritaire',
      description: 'Rendre la parole au peuple souverain sur tous les sujets de société et assurer une représentation fidèle des électeurs.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-01-18',
      contexte: 'Projet de réforme démocratique et institutionnelle du RN.'
    },
    {
      id: 'prop-mlp-6',
      thematique_id: 'logement',
      titre: 'Donner la priorité absolue d attribution des logements sociaux HLM aux familles françaises',
      description: 'Conditionner l accès au parc locatif social public à la nationalité pour répondre à l urgence des travailleurs modestes.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-05-02',
      contexte: 'Intervention à l Assemblée sur la politique du logement social.'
    }
  ],

  'marine-tondelier': [
    {
      id: 'prop-mt-1',
      thematique_id: 'environnement',
      titre: 'Adopter un moratoire immédiat sur tous les projets de nouvelles autoroutes et doubler le budget du ferroviaire',
      description: 'Stopper les projets destructeurs comme l A69 et réorienter les financements publics vers les trains du quotidien et RER métropolitains.',
      source_url: 'https://www.francetvinfo.fr/economie/transports/',
      date_declaration: '2024-03-24',
      contexte: 'Manifestation contre l artificialisation des sols et pour les mobilités décarbonées.'
    },
    {
      id: 'prop-mt-2',
      thematique_id: 'sante',
      titre: 'Interdire totalement et sans dérogation les PFAS (polluants éternels) dans tous les biens de consommation',
      description: 'Protéger la santé des populations et dépolluer l eau potable en appliquant le principe de précaution sanitaire.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-04-04',
      contexte: 'Adoption à l Assemblée nationale de la proposition de loi écologiste contre les PFAS.'
    },
    {
      id: 'prop-mt-3',
      thematique_id: 'agriculture',
      titre: 'Conditionner 100% des aides de la PAC à la transition vers l agroécologie paysanne et la sortie des pesticides',
      description: 'Interdire le glyphosate et les néonicotinoïdes tout en garantissant des revenus décents aux agriculteurs biologiques.',
      source_url: 'https://www.francetvinfo.fr/economie/agriculture/',
      date_declaration: '2024-02-26',
      contexte: 'Rencontre avec les syndicats de la Confédération Paysanne.'
    },
    {
      id: 'prop-mt-4',
      thematique_id: 'travail',
      titre: 'Créer un fonds de reconversion écologique et solidaire garantissant zéro perte de salaire pour les salariés touchés',
      description: 'Accompagner la mutation des emplois de la pétrochimie et de l automobile vers les métiers verts d avenir.',
      source_url: 'https://www.francetvinfo.fr/societe/',
      date_declaration: '2024-05-01',
      contexte: 'Discours unitaire du 1er mai sur la justice sociale et environnementale.'
    },
    {
      id: 'prop-mt-5',
      thematique_id: 'logement',
      titre: 'Obliger les propriétaires à rénover les passoires thermiques avec un reste à charge nul pour les plus modestes',
      description: 'Interdire la location des logements mal isolés et lutter contre la précarité énergétique hivernale.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-01-20',
      contexte: 'Proposition de loi écologiste pour l éradication des passoires thermiques.'
    },
    {
      id: 'prop-mt-6',
      thematique_id: 'numerique',
      titre: 'Encadrer strictement l installation des datacenters géants et soumettre leur consommation d eau à enquête publique',
      description: 'Limiter l impact écologique du numérique et contraindre les opérateurs à réutiliser leur chaleur fatale.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-04-28',
      contexte: 'Avis sur la sobriété énergétique des infrastructures numériques.'
    }
  ],

  'bruno-retailleau': [
    {
      id: 'prop-br-1',
      thematique_id: 'securite',
      titre: 'Rétablir des peines planchers automatiques pour toute agression ou outrage contre les forces de l ordre',
      description: 'Sanctionner avec la plus grande fermeté toute atteinte aux policiers et gendarmes sans aménagement de peine initial.',
      source_url: 'https://www.senat.fr',
      date_declaration: '2024-09-25',
      contexte: 'Prise de fonctions de Ministre de l Intérieur et discours sur l autorité de l État.'
    },
    {
      id: 'prop-br-2',
      thematique_id: 'securite',
      titre: 'Abaisser la majorité pénale à 16 ans pour les crimes et délits avec violences graves',
      description: 'Permettre le jugement des mineurs délinquants récidivistes selon les règles applicables aux majeurs devant la cour criminelle.',
      source_url: 'https://www.francetvinfo.fr/faits-divers/justice/',
      date_declaration: '2024-10-04',
      contexte: 'Intervention sur la refonte de la justice pénale des mineurs.'
    },
    {
      id: 'prop-br-3',
      thematique_id: 'travail',
      titre: 'Supprimer la durée légale des 35 heures et autoriser les entreprises à négocier librement le temps de travail',
      description: 'Permettre aux Français de travailler plus pour gagner plus grâce à la défiscalisation complète des heures supplémentaires.',
      source_url: 'https://www.senat.fr',
      date_declaration: '2024-06-12',
      contexte: 'Proposition de loi sénatoriale sur la compétitivité et la libéralisation du travail.'
    },
    {
      id: 'prop-br-4',
      thematique_id: 'logement',
      titre: 'Expulser systématiquement des logements HLM les familles dont un membre a été condamné pour trafic ou violences',
      description: 'Rétablir la tranquillité publique dans les résidences sociales et sanctionner les fauteurs de troubles.',
      source_url: 'https://www.francetvinfo.fr/politique/',
      date_declaration: '2024-10-15',
      contexte: 'Déclaration sur la gestion de l ordre public et du parc social.'
    },
    {
      id: 'prop-br-5',
      thematique_id: 'international',
      titre: 'Conditionner la délivrance de visas aux pays d origine à l acceptation de leurs ressortissants sous OQTF',
      description: 'Faire pression diplomatique et consulaire sur les gouvernements étrangers refusant de délivrer des laissez-passer.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-10-02',
      contexte: 'Débat parlementaire sur l exécution effective des obligations de quitter le territoire français.'
    },
    {
      id: 'prop-br-6',
      thematique_id: 'institutions',
      titre: 'Réduire d un tiers le nombre de députés et sénateurs et supprimer les échelons territoriaux redondants',
      description: 'Resserrer la dépense publique et concentrer les prérogatives de l État sur ses fonctions régaliennes fondamentales.',
      source_url: 'https://www.senat.fr',
      date_declaration: '2024-05-19',
      contexte: 'Colloque sénatorial sur la réforme des institutions et des comptes publics.'
    }
  ],

  'francois-ruffin': [
    {
      id: 'prop-fr-1',
      thematique_id: 'travail',
      titre: 'Plafonner les écarts de rémunération de 1 à 20 au sein de chaque entreprise privée et publique',
      description: 'Encadrer les salaires indécents des dirigeants du CAC 40 et revaloriser la part revenant aux salariés producteurs de valeur.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-04-18',
      contexte: 'Dépôt de proposition de loi à l Assemblée nationale sur la décence salariale.'
    },
    {
      id: 'prop-fr-2',
      thematique_id: 'sante',
      titre: 'Créer un véritable statut pour les accompagnants d élèves en situation de handicap (AESH) et aides à domicile',
      description: 'Offrir un contrat à durée indéterminée à temps complet rémunéré décemment aux métiers du lien et du soin.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-03-06',
      contexte: 'Rapport parlementaire sur les métiers du soin et du lien.'
    },
    {
      id: 'prop-fr-3',
      thematique_id: 'logement',
      titre: 'Lancer un plan d isolation thermique globale des logements pris en charge à 100% pour les ménages modestes',
      description: 'Mobiliser les artisans locaux pour faire baisser les factures de chauffage et réduire les émissions nationales.',
      source_url: 'https://www.francetvinfo.fr/economie/immobilier/',
      date_declaration: '2024-02-12',
      contexte: 'Déplacement en Picardie sur la précarité énergétique des classes populaires.'
    },
    {
      id: 'prop-fr-4',
      thematique_id: 'agriculture',
      titre: 'Imposer des quotas d importation stricts pour protéger le maraîchage et l élevage français de la concurrence déloyale',
      description: 'Rompre avec le dumping mondialisé et garantir aux producteurs locaux des prix couvrant leurs charges réelles.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-02-23',
      contexte: 'Audition sur les prix agricoles et le respect de la loi Egalim.'
    },
    {
      id: 'prop-fr-5',
      thematique_id: 'economie',
      titre: 'Rétablir un impôt sur la fortune renforcé et surtaxer les rachats d actions et superprofits boursiers',
      description: 'Rediriger le capital financier spéculatif vers l investissement dans les hôpitaux, les écoles et les services publics.',
      source_url: 'https://www.francetvinfo.fr/economie/emploi/',
      date_declaration: '2024-05-15',
      contexte: 'Tribune sur le partage des richesses et la justice fiscale.'
    },
    {
      id: 'prop-fr-6',
      thematique_id: 'education',
      titre: 'Limiter le nombre d élèves à 20 par classe dans toutes les écoles et collèges du territoire national',
      description: 'Redonner aux enseignants les conditions humaines nécessaires pour instruire chaque enfant et prévenir le décrochage.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-01-16',
      contexte: 'Proposition de loi pour la réduction des effectifs scolaires dans le public.'
    }
  ],

  'fabien-roussel': [
    {
      id: 'prop-fro-1',
      thematique_id: 'travail',
      titre: 'Augmenter immédiatement le salaire minimum SMIC à 2000 euros bruts pour tous les salariés',
      description: 'Ouvrir une conférence nationale sur les salaires pour revaloriser l ensemble des grilles professionnelles et lutter contre la vie chère.',
      source_url: 'https://www.francetvinfo.fr/economie/emploi/',
      date_declaration: '2024-05-01',
      contexte: 'Déclaration pour la fête du travail et rassemblement syndical.'
    },
    {
      id: 'prop-fro-2',
      thematique_id: 'environnement',
      titre: 'Construire 14 nouveaux réacteurs nucléaires EPR pour assurer la souveraineté industrielle et énergétique de la France',
      description: 'Défendre une énergie pilotable, décarbonée et à bas coût pour réindustrialiser nos territoires et soutenir l emploi.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-03-14',
      contexte: 'Débat parlementaire sur la programmation pluriannuelle de l énergie.'
    },
    {
      id: 'prop-fro-3',
      thematique_id: 'sante',
      titre: 'Rembourser à 100% l ensemble des soins, lunettes et prothèses dentaires par la Sécurité sociale',
      description: 'Supprimer les cotisations aux mutuelles privées en intégrant toute la couverture santé dans un régime général solidaire.',
      source_url: 'https://www.francetvinfo.fr/sante/',
      date_declaration: '2024-04-10',
      contexte: 'Campagne du PCF pour la Sécurité sociale intégrale du XXIe siècle.'
    },
    {
      id: 'prop-fro-4',
      thematique_id: 'agriculture',
      titre: 'Instaurer un coefficient multiplicateur limitant les marges de la grande distribution sur les produits agricoles',
      description: 'Garantir un revenu digne aux producteurs et des prix abordables aux consommateurs au rayon alimentation.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-02-27',
      contexte: 'Proposition de loi pour la transparence des marges agroalimentaires.'
    },
    {
      id: 'prop-fro-5',
      thematique_id: 'logement',
      titre: 'Bâtir 200 000 logements sociaux publics par an et multiplier par trois les amendes contre les communes hors-la-loi SRU',
      description: 'Garantir le droit fondamental à un logement digne pour chaque famille et stopper la spéculation immobilière.',
      source_url: 'https://www.francetvinfo.fr/economie/immobilier/',
      date_declaration: '2024-05-22',
      contexte: 'Rassemblement pour le logement accessible et populaire.'
    },
    {
      id: 'prop-fro-6',
      thematique_id: 'institutions',
      titre: 'Consacrer la primauté absolue des lois votées par le Parlement français sur les directives européennes',
      description: 'Refuser les injonctions de démantèlement des services publics et réaffirmer la souveraineté populaire nationale.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-01-24',
      contexte: 'Tribune pour une Europe des peuples et des coopérations mutuelles.'
    }
  ],

  'eric-zemmour': [
    {
      id: 'prop-ez-1',
      thematique_id: 'securite',
      titre: 'Expulser immédiatement tout étranger condamné pour crime ou délit et lui interdire définitivement le territoire',
      description: 'Mettre fin aux recours suspensifs et automatiser l expulsion sans possibilité de réexamen par les juridictions.',
      source_url: 'https://www.francetvinfo.fr/politique/',
      date_declaration: '2024-04-15',
      contexte: 'Présentation du plan sécurité et immigration de Reconquête.'
    },
    {
      id: 'prop-ez-2',
      thematique_id: 'education',
      titre: 'Abolir le collège unique, rétablir l examen d entrée en 6e et instaurer l uniforme républicain obligatoire',
      description: 'Recentrer l école primaire sur les savoirs fondamentaux (lire, écrire, compter) et restaurer la discipline des maîtres.',
      source_url: 'https://www.lefigaro.fr',
      date_declaration: '2024-03-02',
      contexte: 'Entretien sur la refonte de l instruction publique et la méritocratie républicaine.'
    },
    {
      id: 'prop-ez-3',
      thematique_id: 'economie',
      titre: 'Supprimer totalement les impôts de production et exonérer de droits de succession les transmissions d entreprises',
      description: 'Stimuler l investissement productif et permettre aux familles d enraciner le capital industriel en France.',
      source_url: 'https://www.lefigaro.fr/economie/',
      date_declaration: '2024-05-08',
      contexte: 'Discours devant les chefs d entreprise et entrepreneurs de France.'
    },
    {
      id: 'prop-ez-4',
      thematique_id: 'institutions',
      titre: 'Inscrire dans la Constitution la primauté absolue du droit national français sur les traités et arrêts de la CEDH',
      description: 'Empêcher les juges européens et constitutionnels de bloquer l exécution de la volonté démocratique du peuple français.',
      source_url: 'https://www.francetvinfo.fr/politique/',
      date_declaration: '2024-01-30',
      contexte: 'Conférence juridique sur la souveraineté constitutionnelle.'
    },
    {
      id: 'prop-ez-5',
      thematique_id: 'logement',
      titre: 'Abroger définitivement l article 55 de la loi SRU imposant un quota de 25% de logements sociaux aux communes',
      description: 'Rendre leur liberté d aménagement et de choix de population aux maires et empêcher la ghettoïsation imposée.',
      source_url: 'https://www.lefigaro.fr',
      date_declaration: '2024-02-17',
      contexte: 'Intervention sur l urbanisme et l identité des villages et villes de France.'
    },
    {
      id: 'prop-ez-6',
      thematique_id: 'societe',
      titre: 'Interdire le port du voile islamique et de tout signe religieux ostentatoire dans l ensemble de l espace public',
      description: 'Défendre les mœurs et la civilisation françaises contre l entrisme islamiste et l islamisation de la société.',
      source_url: 'https://www.francetvinfo.fr/politique/',
      date_declaration: '2024-05-25',
      contexte: 'Meeting politique sur la préservation de l identité et de la culture françaises.'
    }
  ],

  'nathalie-arthaud': [
    {
      id: 'prop-na-1',
      thematique_id: 'travail',
      titre: 'Instaurer l échelle mobile des salaires avec indexation automatique de toutes les rémunérations sur les prix réels',
      description: 'Augmenter l ensemble des salaires et pensions d au moins 400 euros net par mois pris directement sur les profits des patrons.',
      source_url: 'https://www.lutte-ouvriere.org',
      date_declaration: '2024-05-19',
      contexte: 'Fête annuelle de Lutte Ouvrière et meeting politique pour le monde du travail.'
    },
    {
      id: 'prop-na-2',
      thematique_id: 'economie',
      titre: 'Interdire strictement les licenciements et suppressions d emplois dans les entreprises dégageant des bénéfices',
      description: 'Répartir le travail entre tous les bras disponibles sans aucune diminution de salaire pour éradiquer le chômage de masse.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-03-12',
      contexte: 'Prise de parole lors d une mobilisation syndicale contre un plan de restructuration.'
    },
    {
      id: 'prop-na-3',
      thematique_id: 'institutions',
      titre: 'Abolir le secret des affaires et le secret bancaire pour imposer le contrôle ouvrier sur la comptabilité des entreprises',
      description: 'Donner aux travailleurs le droit de vérifier les comptes, les marges réelles et les flux financiers des actionnaires.',
      source_url: 'https://www.lutte-ouvriere.org',
      date_declaration: '2024-04-14',
      contexte: 'Brochure programmatique sur le contrôle démocratique des travailleurs.'
    },
    {
      id: 'prop-na-4',
      thematique_id: 'logement',
      titre: 'Réquisitionner sans indemnité les logements vides des banques et sociétés foncières pour loger les mal-logés',
      description: 'Mettre fin au scandale des logements laissés à l abandon pour la spéculation pendant que des familles dorment dans la rue.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-02-08',
      contexte: 'Manifestation avec les collectifs de mal-logés et sans-papiers.'
    },
    {
      id: 'prop-na-5',
      thematique_id: 'sante',
      titre: 'Garantir la gratuité intégrale de la santé et exproprier les géants pharmaceutiques privés au profit de la collectivité',
      description: 'Mettre fin au pillage de la Sécurité sociale par les trusts du médicament et embaucher massivement dans les hôpitaux.',
      source_url: 'https://www.lutte-ouvriere.org',
      date_declaration: '2024-01-25',
      contexte: 'Déclaration sur la crise des urgences et la défense du service public hospitalier.'
    },
    {
      id: 'prop-na-6',
      thematique_id: 'societe',
      titre: 'Accorder l égalité absolue de tous les droits civiques, sociaux et politiques aux travailleurs immigrés sans papiers',
      description: 'Refuser les divisions xénophobes et unir l ensemble des exploités quelle que soit leur nationalité ou leur origine.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-05-01',
      contexte: 'Cortège syndical internationaliste du 1er mai.'
    }
  ],

  'francois-asselineau': [
    {
      id: 'prop-fa-1',
      thematique_id: 'international',
      titre: 'Déclencher l article 50 du TUE pour sortir unilatéralement et immédiatement de l Union européenne et de l euro',
      description: 'Restaurer la pleine souveraineté monétaire, budgétaire, commerciale, législative et géopolitique de la République française.',
      source_url: 'https://www.upr.fr',
      date_declaration: '2024-04-12',
      contexte: 'Université d automne de l Union Populaire Républicaine.'
    },
    {
      id: 'prop-fa-2',
      thematique_id: 'international',
      titre: 'Sortir immédiatement du commandement intégré de l OTAN et restaurer une diplomatie française non-alignée',
      description: 'Refuser toute soumission militaire aux impératifs atlantistes et renouer avec la politique gaullienne d indépendance nationale.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-05-01',
      contexte: 'Conférence géopolitique sur l indépendance militaire de la France.'
    },
    {
      id: 'prop-fa-3',
      thematique_id: 'institutions',
      titre: 'Instaurer le référendum d initiative citoyenne (RIC) contraignant en toutes matières constitutionnelle et législative',
      description: 'Donner aux citoyens le pouvoir d abroger ou de proposer une loi sans que les assemblées ne puissent s y opposer.',
      source_url: 'https://www.upr.fr',
      date_declaration: '2024-03-18',
      contexte: 'Charte constitutionnelle pour la démocratie directe de l UPR.'
    },
    {
      id: 'prop-fa-4',
      thematique_id: 'economie',
      titre: 'Renationaliser intégralement EDF, la SNCF, les concessions autoroutières, Orange et Engie sous statut public',
      description: 'Mettre fin au pillage des monopoles publics naturels imposé par les directives de libéralisation de Bruxelles.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-02-18',
      contexte: 'Présentation du plan de restauration des services publics d État.'
    },
    {
      id: 'prop-fa-5',
      thematique_id: 'numerique',
      titre: 'Nationaliser les infrastructures réseau télécoms et rejeter l identité numérique européenne centralisée',
      description: 'Protéger la vie privée des citoyens contre la surveillance de masse et préserver le paiement en argent liquide.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-05-10',
      contexte: 'Déclaration pour la protection des libertés publiques et de la monnaie fiduciaire.'
    },
    {
      id: 'prop-fa-6',
      thematique_id: 'agriculture',
      titre: 'Dénoncer tous les traités de libre-échange de l UE et rétablir le contrôle douanier et sanitaire aux frontières',
      description: 'Protéger l élevage et les cultures françaises contre les produits frelatés ne respectant pas les normes nationales.',
      source_url: 'https://www.upr.fr',
      date_declaration: '2024-02-24',
      contexte: 'Visite auprès des agriculteurs et critique du marché unique agricole.'
    }
  ],

  'nicolas-dupont-aignan': [
    {
      id: 'prop-nda-1',
      thematique_id: 'securite',
      titre: 'Rétablir le contrôle douanier et policier permanent aux frontières nationales françaises',
      description: 'Suspendre les accords de Schengen pour tarir les filières d immigration clandestine et de trafics d armes.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-03-24',
      contexte: 'Proposition de loi pour le rétablissement des frontières nationales.'
    },
    {
      id: 'prop-nda-2',
      thematique_id: 'institutions',
      titre: 'Instaurer le référendum d initiative citoyenne (RIC) dès 500 000 signatures pour révoquer une loi ou un élu',
      description: 'Rendre la parole au peuple souverain sur tous les grands choix de société et bloquer les dérives autoritaires.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-04-16',
      contexte: 'Dépôt de proposition de loi constitutionnelle sur le RIC.'
    },
    {
      id: 'prop-nda-3',
      thematique_id: 'sante',
      titre: 'Réintégrer et indemniser rétroactivement tous les soignants, pompiers et soignants suspendus lors de la crise sanitaire',
      description: 'Réparer l injustice faite aux soignants et renforcer immédiatement les effectifs des hôpitaux de proximité.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-01-14',
      contexte: 'Intervention à l Assemblée sur la réintégration des soignants suspendus.'
    },
    {
      id: 'prop-nda-4',
      thematique_id: 'agriculture',
      titre: 'Réserver 80% des achats alimentaires de la restauration collective publique aux produits agricoles français',
      description: 'Garantir des débouchés rémunérateurs aux agriculteurs et artisans français par un patriotisme économique assumé.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-05-05',
      contexte: 'Proposition de loi pour la préférence nationale dans la commande publique.'
    },
    {
      id: 'prop-nda-5',
      thematique_id: 'numerique',
      titre: 'Créer un moteur de recherche national et un cloud souverain public obligatoire pour les administrations',
      description: 'Affranchir l État et les armées françaises de la dépendance aux logiciels et serveurs des géants américains.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-02-28',
      contexte: 'Rapport sur la cybersécurité et l indépendance numérique de la France.'
    },
    {
      id: 'prop-nda-6',
      thematique_id: 'economie',
      titre: 'Rétablir l impôt sur la fortune (ISF) en exonérant intégralement l outil de travail et les PME familiales',
      description: 'Taxer les fortunes financières spéculatives tout en protégeant les entrepreneurs qui investissent sur le sol national.',
      source_url: 'https://www.publicsenat.fr',
      date_declaration: '2024-03-30',
      contexte: 'Débat économique sur la justice fiscale et la réindustrialisation.'
    }
  ],

  'david-lisnard': [
    {
      id: 'prop-dl-1',
      thematique_id: 'institutions',
      titre: 'Accorder une large autonomie fiscale et réglementaire aux communes et intercommunalités',
      description: 'Libérer les maires du carcan bureaucratique de l État central et appliquer le principe constitutionnel de subsidiarité.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-03-18',
      contexte: 'Discours au Congrès de l Association des Maires de France (AMF).'
    },
    {
      id: 'prop-dl-2',
      thematique_id: 'economie',
      titre: 'Supprimer 500 000 normes administratives et réduire la dépense publique de 100 milliards d euros',
      description: 'Appliquer la règle stricte : pour une norme nouvelle créée, deux normes existantes doivent être supprimées.',
      source_url: 'https://www.publicsenat.fr',
      date_declaration: '2024-05-11',
      contexte: 'Tribune économique sur le désendettement de la France et la liberté d entreprendre.'
    },
    {
      id: 'prop-dl-3',
      thematique_id: 'education',
      titre: 'Transférer l autonomie pédagogique et de recrutement des enseignants directement aux directeurs d école et maires',
      description: 'Permettre aux équipes de terrain d adapter leurs méthodes aux besoins locaux au lieu de subir les circulaires ministérielles.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-02-04',
      contexte: 'Rencontre avec les acteurs éducatifs et maires de France.'
    },
    {
      id: 'prop-dl-4',
      thematique_id: 'securite',
      titre: 'Donner des pouvoirs d officier de police judiciaire aux directeurs de police municipale et généraliser leur armement',
      description: 'Permettre aux policiers municipaux de procéder directement aux contrôles d identité et aux investigations de proximité.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-04-20',
      contexte: 'Prise de parole sur la sécurité publique et le rôle des polices municipales.'
    },
    {
      id: 'prop-dl-5',
      thematique_id: 'logement',
      titre: 'Décentraliser l urbanisme et libérer le foncier public inutilisé pour relancer la construction de logements privés',
      description: 'Supprimer les contraintes d artificialisation excessive des sols bloquant le développement économique local.',
      source_url: 'https://www.senat.fr',
      date_declaration: '2024-06-02',
      contexte: 'Audition sénatoriale sur la crise du logement et l application du ZAN (Zéro Artificialisation Nette).'
    },
    {
      id: 'prop-dl-6',
      thematique_id: 'numerique',
      titre: 'Réguler strictement l exposition des mineurs aux écrans et responsabiliser pénalement les plateformes sur le cyberharcèlement',
      description: 'Protéger la santé mentale des enfants et contraindre les algorithmes à respecter la tranquillité civique.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-05-28',
      contexte: 'Colloque sur la protection de l enfance à l ère du numérique.'
    }
  ],

  'helene-thouy': [
    {
      id: 'prop-ht-1',
      thematique_id: 'societe',
      titre: 'Inscrire la sensibilité et les droits fondamentaux des animaux non-humains directement dans la Constitution française',
      description: 'Faire reconnaître l animal comme un individu sentient doté d une valeur propre et protégé par la loi fondamentale.',
      source_url: 'https://www.parti-animaliste.fr',
      date_declaration: '2024-04-09',
      contexte: 'Colloque juridique sur la reconnaissance constitutionnelle de l animal.'
    },
    {
      id: 'prop-ht-2',
      thematique_id: 'agriculture',
      titre: 'Interdire définitivement l élevage intensif en cage et réorienter les subventions vers les filières végétales durables',
      description: 'Accompagner financièrement les agriculteurs vers la fin des pratiques industrielles cruelles et vers la diversification végétale.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-05-22',
      contexte: 'Rassemblement citoyen devant le ministère de l Agriculture pour le bien-être animal.'
    },
    {
      id: 'prop-ht-3',
      thematique_id: 'sante',
      titre: 'Instaurer une option végétarienne ou végane équilibrée quotidienne dans l ensemble de la restauration collective',
      description: 'Améliorer la santé des écoliers et des salariés tout en réduisant l empreinte carbone des repas publics.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-02-17',
      contexte: 'Campagne nationale pour l alimentation durable et responsable.'
    },
    {
      id: 'prop-ht-4',
      thematique_id: 'environnement',
      titre: 'Interdire la chasse le dimanche, les jours fériés et durant l intégralité des vacances scolaires',
      description: 'Permettre aux promeneurs, randonneurs et familles de profiter de la nature en toute sécurité et protéger la faune sauvage.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-03-19',
      contexte: 'Pétition nationale pour le partage pacifique des espaces naturels.'
    },
    {
      id: 'prop-ht-5',
      thematique_id: 'securite',
      titre: 'Créer une police judiciaire dédiée à la protection animale et alourdir les peines pour sévices et actes de cruauté',
      description: 'Permettre des interventions d urgence contre la maltraitance animale et interdire à vie la détention d animaux aux condamnés.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-06-11',
      contexte: 'Dépôt de proposition de loi pour la pénalisation des actes de maltraitance.'
    },
    {
      id: 'prop-ht-6',
      thematique_id: 'education',
      titre: 'Introduire un module obligatoire sur l éthique animale et le respect du vivant dès l école primaire',
      description: 'Sensibiliser les jeunes générations à la biodiversité, à l empathie et à la responsabilité envers les animaux de compagnie.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-01-31',
      contexte: 'Plaidoyer pour l éducation au respect de la vie animale.'
    }
  ],

  'philippe-poutou': [
    {
      id: 'prop-pp-1',
      thematique_id: 'travail',
      titre: 'Réduire le temps de travail hebdomadaire à 30 heures réelles sur 4 jours sans aucune baisse de salaire',
      description: 'Partager le travail entre tous les salariés pour éradiquer le chômage et libérer du temps pour la vie civique et personnelle.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-05-01',
      contexte: 'Discours international du 1er mai pour la réduction du temps de travail.'
    },
    {
      id: 'prop-pp-2',
      thematique_id: 'economie',
      titre: 'Exproprier et réquisitionner le secteur bancaire privé pour créer un pôle bancaire public unique',
      description: 'Empêcher la spéculation financière destructrice d emplois et financer les besoins sociaux réels sous contrôle citoyen.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-03-12',
      contexte: 'Meeting de solidarité avec les salariés du secteur financier et industriel.'
    },
    {
      id: 'prop-pp-3',
      thematique_id: 'securite',
      titre: 'Désarmer les forces de police du maintien de l ordre et dissoudre immédiatement les unités type BAC et BRAV-M',
      description: 'Mettre fin aux violences policières institutionnelles et aux armes mutilantes utilisées lors des manifestations citoyennes.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-02-20',
      contexte: 'Rassemblement contre les violences policières et pour les libertés publiques.'
    },
    {
      id: 'prop-pp-4',
      thematique_id: 'logement',
      titre: 'Plafonner les loyers à un maximum de 20% des revenus des locataires et construire 300 000 logements sociaux par an',
      description: 'Interdire toutes les expulsions locatives et réquisitionner immédiatement les immeubles vacants des grands propriétaires.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-04-05',
      contexte: 'Mobilisation unitaire pour le droit au logement digne.'
    },
    {
      id: 'prop-pp-5',
      thematique_id: 'environnement',
      titre: 'Planifier la sortie complète des énergies fossiles d ici 2035 sous le contrôle démocratique des travailleurs',
      description: 'Exproprier les multinationales fossiles comme TotalEnergies et réorienter leurs moyens vers les énergies renouvelables.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-06-08',
      contexte: 'Tribune pour une transition écologique ouvrière et anticapitaliste.'
    },
    {
      id: 'prop-pp-6',
      thematique_id: 'institutions',
      titre: 'Abolir la présidence de la République et la Constitution de la Ve République au profit d une assemblée unique révocable',
      description: 'Remplacer l appareil d État autoritaire par une démocratie directe des travailleurs et des quartiers populaires.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-01-18',
      contexte: 'Débat public sur la révolution démocratique et l autogestion.'
    }
  ],

  'jean-lassalle': [
    {
      id: 'prop-jl-1',
      thematique_id: 'agriculture',
      titre: 'Garantir des prix planchers rémunérateurs couvrant tous les coûts de revient des agriculteurs et éleveurs',
      description: 'Interdire les importations de denrées agricoles ne respectant pas les normes françaises pour sauver les fermes familiales.',
      source_url: 'https://www.publicsenat.fr',
      date_declaration: '2024-02-28',
      contexte: 'Intervention auprès des agriculteurs lors de la mobilisation paysanne.'
    },
    {
      id: 'prop-jl-2',
      thematique_id: 'sante',
      titre: 'Obliger les jeunes médecins diplômés à exercer pendant au moins 3 ans dans un désert médical ou territoire rural',
      description: 'Garantir à chaque habitant de la France rurale et des petites villes un accès direct à un médecin généraliste.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-03-15',
      contexte: 'Débat sur la santé de proximité et la désertification médicale.'
    },
    {
      id: 'prop-jl-3',
      thematique_id: 'institutions',
      titre: 'Reconnaître le vote blanc comme un suffrage exprimé et invalider l élection si le vote blanc arrive en tête',
      description: 'Prendre en compte le rejet citoyen et forcer le renouvellement des candidatures et des programmes politiques.',
      source_url: 'https://www.assemblee-nationale.fr',
      date_declaration: '2024-04-18',
      contexte: 'Proposition de loi pour la reconnaissance du vote blanc dans les suffrages exprimés.'
    },
    {
      id: 'prop-jl-4',
      thematique_id: 'societe',
      titre: 'Interdire la fermeture des gares, des trésoreries, des bureaux de poste et des maternités dans les zones rurales',
      description: 'Déclarer un moratoire de 10 ans sur le démantèlement des services publics et réinvestir dans le maillage des campagnes.',
      source_url: 'https://www.vie-publique.fr',
      date_declaration: '2024-05-12',
      contexte: 'Tour de France des communes oubliées et défense de la ruralité.'
    },
    {
      id: 'prop-jl-5',
      thematique_id: 'education',
      titre: 'Rétablir un service national universel de 6 mois mêlant mixité sociale, secourisme et métiers du terroir',
      description: 'Rassembler toute une classe d âge pour recréer du lien patriotique et transmettre l amour du patrimoine national.',
      source_url: 'https://www.francetvinfo.fr',
      date_declaration: '2024-01-22',
      contexte: 'Rencontre avec des associations d anciens combattants et de jeunesse.'
    },
    {
      id: 'prop-jl-6',
      thematique_id: 'environnement',
      titre: 'Interdire l installation de nouvelles éoliennes terrestres sans l accord formel des habitants par référendum communal',
      description: 'Préserver les paysages de nos terroirs contre le mitage industriel et privilégier l hydraulique et la biomasse locale.',
      source_url: 'https://www.senat.fr',
      date_declaration: '2024-06-03',
      contexte: 'Défense du patrimoine paysager français et critique de l éolien intermittent.'
    }
  ]
};

function main() {
  console.log('📝 Écriture des 18 fichiers CSV avec propositions équilibrées...');
  const header = ['id', 'thematique_id', 'titre', 'description', 'source_url', 'date_declaration', 'contexte'];

  let totalProps = 0;
  for (const [candidateId, props] of Object.entries(CANDIDATE_PROPOSITIONS)) {
    const filePath = path.join(CSV_DIR, `${candidateId}.csv`);
    const lines = [toCsvRow(header)];

    for (const p of props) {
      lines.push(toCsvRow([
        p.id,
        p.thematique_id,
        p.titre,
        p.description,
        p.source_url,
        p.date_declaration,
        p.contexte
      ]));
      totalProps++;
    }

    fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8');
    console.log(`✅ ${candidateId}.csv : ${props.length} propositions enregistrées`);
  }

  console.log(`\n🎉 Total : ${totalProps} propositions générées pour 18 candidats.`);
}

main();
