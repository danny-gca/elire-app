# Fonctionnalités d'élire et ce qui les vérifie

Tout ce que l'app fait aujourd'hui et qui doit continuer de marcher, écran par écran. Source : les docs de lots (`docs/feature-*.md`, état « Fait »), relues le 2026-11-13, et le code. Les comportements abandonnés sont listés à la fin pour ne pas les tester.

**Vérifié par** :

- `M:fichier` : parcours Maestro sur Android, `npm run test:e2e` (dossier `.maestro/`, ordre dans `config.yaml`).
- `PA:scénario` : `npm run perf:android` (`scripts/perf-android.mjs`) ; vérifications et mesures par geste.
- `PW:scénario` : `npm run perf:web` (`scripts/perf-web.mjs`), sur le web exporté.
- `U:fichier` : test unitaire (`npm test`, dans `src/**/__tests__/`).
- `Manuel` : rien d'automatique encore ; à vérifier à la main avant une release. **(à faire)** = un test automatique est possible et manque.

Lancer tout ce qui est automatique : `npm run check` (données, types, lint, tests unitaires), puis, émulateur allumé et APK release installé, `npm run test:e2e` et `npm run perf:android` ; `npm run perf:web` ; `npm run simulations` (score et neutralité, `docs/simulations`).

## Présentation

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| PRES-1 | Au premier lancement, la présentation s'ouvre (8 pages, « Page 1 sur 8 »), « Commencer à voter » mène à Voter | `M:presentation` |
| PRES-2 | Toucher à droite : page suivante ; à gauche : précédente ; un trait du haut y ramène ; glisser change aussi de page | `M:presentation` (droite seulement) ; reste **(à faire)** |
| PRES-3 | Lecture automatique toutes les 15 s ; après un essai, la page tourne seule (1,2 s, gomme 0,6 s, source 1,8 s) | Manuel |
| PRES-4 | Rien ne tourne seul avec un lecteur d'écran | Manuel |
| PRES-5 | Page surligneur : 4 pastilles (Jaune, Rose, Vert, Bleu), aucune présélectionnée ; le titre se balaie au choix | Manuel **(à faire)** |
| PRES-6 | Un seul vote fictif suit la présentation (« Ouvrir les bibliothèques… le dimanche ») ; aucun vrai vote enregistré | `M:presentation` (Voter démarre à « Classement dans 10 votes ») |
| PRES-7 | « Changer d'avis » : la ligne « A voté ! » fictive ouvre « Modifier votre vote » ; « Transparence » : la source fictive n'ouvre aucun lien | Manuel **(à faire)** |
| PRES-8 | Fin : grande fête, son palier, vibration | Manuel |
| PRES-9 | La présentation revient une fois quand `ONBOARDING_VERSION` monte ; « Revoir la présentation » dans le pied de page | `U:votes-store` (version) ; lien : Manuel |
| PRES-10 | Titres Literata non rognés (g, p) sur Android et iOS | Manuel (capture `perf-android` le 2026-11-12) |

## Voter : la feuille et le vote

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| VOT-1 | Barre du haut : « Classement dans N votes » puis « Bilan dans N votes », « N / 27 classés », piste de progression | `M:presentation`, `M:votes` ; `U:progress` |
| VOT-2 | Proposition : Jamais, Contre, Pour, Parfait, et « Je ne sais pas » (ne compte ni pour le score ni pour être classé) | `M:votes` ; `U:progress`, `U:scoring` |
| VOT-3 | Marge : référence (P-, L-, E-) et thème ; rien qui trahisse l'auteur (nom, parti, couleur) | `M:votes` (marge « Proposition P-… ») ; neutralité : Manuel |
| VOT-4 | La citation est toujours entière | Manuel (capture du 2026-11-12) **(à faire)** |
| VOT-5 | Aucun lien de source ni nom de site dans Voter | Manuel **(à faire)** |
| VOT-6 | Mots du glossaire soulignés ; toucher un mot ouvre « Glossaire » sur son entrée | `U:glossary` (repérage) ; toucher : Manuel **(à faire)** |
| VOT-7 | Vote : trait sur le bouton, titre surligné, page qui tourne ; vote enregistré dès le toucher | `M:votes` ; `PA:votes` (mesures par geste) |
| VOT-8 | Votes enchaînés vite jamais avalés (le second toucher pendant le tour compte) | `PA:rapide`, `PW:rapide` ; `U:page-turn` (`voteBlocked`) |
| VOT-9 | 20 votes de suite sans blocage, scrutins, questions communes et bilan compris | `PA:votes`, `PW:votes` ; `M:votes` (8) |
| VOT-10 | « A voté ! » : monte, se remplit du surligneur, se vide en 10 s ; titre, pastille du vote et gomme | `M:votes` (présence) ; reste Manuel |
| VOT-11 | Une seule ligne « A voté ! », à 17 px du bandeau, sans copie restée au-dessus | `PW:votes`, `PW:retour` (`ecartAVoteMax`) |
| VOT-12 | « Réduire les animations » : fondu de 150 ms entre deux questions ; « A voté ! » garde son surligneur | `PW --reduced-motion`, `PA --reduced-motion` (sans assertion dédiée) ; Manuel |
| VOT-13 | Annonce « Vote enregistré : … » au lecteur d'écran | Manuel |
| VOT-14 | Sons de trait et de feuille, vibration légère ; un seul son à la fois | Manuel |
| VOT-15 | Ordre de passage : jamais deux scrutins ni deux questions communes de suite, ni un scrutin collé à une question commune ; une proposition rattachée n'apparaît jamais seule | `U:shuffle`, `U:votes-store`, `U:enjeux-check` |
| VOT-16 | Sur téléphone, appui long sur une question : pas de sélection ; sur le web, sélection possible | `M:selection`, `PA:selection` ; web : Manuel |

## Voter : tiroirs « En savoir plus »

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| TIR-1 | Contexte, Précisions, Glossaire, Liens et sources ; un tiroir vide n'apparaît pas | `M:tiroirs` ; `U:contexte`, `U:sujets-check` |
| TIR-2 | Un seul tiroir ouvert ; le retoucher le ferme ; tout se referme à la feuille suivante | `M:tiroirs` |
| TIR-3 | Ouvrir fait défiler jusqu'au tiroir ; refermer remonte en haut de la feuille | `M:tiroirs` (question visible après fermeture) ; `PA:tiroirs` |
| TIR-4 | Contexte : « Aujourd'hui », « En débat » ; Précisions : type de source au-dessus ; liens qui trahissent masqués | `M:tiroirs` |
| TIR-5 | Intitulés surlignés d'une autre couleur que celle du lecteur, stable, jamais deux voisins pareils | `U:color` ; rendu : Manuel |

## Voter : scrutin réel

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| SCR-1 | Arrivée : en-tête « Scrutin réel », tampon, contour, salle qui se remplit et brouhaha | `M:scrutin` (en-tête) ; animation et son : Manuel |
| SCR-2 | Contre, Pour, et Abstention dessous ; une abstention ne compte pour personne | `M:scrutin` ; `U:scoring` |
| SCR-3 | Résultat caché avant le vote ; après : hémicycle anonyme, légende, titre officiel et statut (Adoptée, Rejetée, En cours) | `PA:votes` (résultat affiché après chaque scrutin voté, `scrutinsAvecResultat`) ; statut : `M:scrutin` quand l'astuce de l'hémicycle le met en pause |
| SCR-4 | « Question suivante » avec un fond qui se retire en 5 s, puis la suite part seule ; un toucher l'arrête | `M:scrutin` (avance seule, vote compté) ; un toucher l'arrête : Manuel (5 s trop courtes pour Maestro sur l'émulateur) |
| SCR-5 | Toucher le résultat ouvre la fiche du scrutin, anonyme | Manuel **(à faire)** |
| SCR-6 | Contour du scrutin entier, bord du bas compris | Manuel (bug signalé le 2026-11-12, `docs/feature-20261111-perf-voter.md` § 13) |

## Voter : question commune

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| COM-1 | Marge « Question commune », cadre aux 4 surligneurs, même échelle | `M:question-commune` |
| COM-2 | Après le vote : « N pensent comme vous, N à l'inverse », chaque mesure sans nom avec son type de source, puis « Question suivante » | `M:question-commune` (vote compté, suite automatique ; mesures lues si leur astuce met en pause) ; `U:enjeux` (`tallyText`) ; mesures à l'écran : Manuel |
| COM-3 | « Je ne sais pas » : « cette question ne change aucun score » | `U:enjeux` ; écran : Manuel |
| COM-4 | La note compte pour le « pour » et à l'inverse pour le « contre » | `U:enjeux`, `U:scoring` |

## Voter : retour à la question précédente

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| RET-1 | Glisser vers la droite ramène la dernière question votée, avec son vote ; une seule fois par vote | `M:retour`, `PA:retour` ; `U:page-turn` |
| RET-2 | « Question précédente » et « Revenir à la question en cours » remplacent « A voté ! » | `M:retour` |
| RET-3 | Repartir : le bouton, le glissé inverse, ou la même réponse ; une autre réponse remplace le vote | `M:retour` (bouton, glissé) ; réponse : Manuel **(à faire)** |
| RET-4 | Retour Android : un cran en arrière, puis repartir, sans boucle ; consommé pendant une animation | `M:retour` ; `U:page-turn` (`hardwareBack`) |
| RET-5 | Web : flèche gauche, flèche droite ; pas de glissé à la souris | `PW:retour` |
| RET-6 | Bloqué sur l'écran de fin, pendant le vote, une révélation, une astuce, la gomme | `U:page-turn` (`previousQuestion`) |
| RET-7 | Depuis le bilan : la question précédente revient par-dessus, puis le bilan | `M:bilan`, `PA:bilan`, `PW:bilan` |
| RET-8 | Actions d'accessibilité et annonce « Question précédente » | Manuel |

## Gomme

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| GOM-1 | Toucher « A voté ! » ouvre « Votre vote » : la question entière, sans nom, et l'échelle | `PA:gomme` (Maestro ne lit pas l'écran pendant le compte à rebours) |
| GOM-2 | Changer de vote l'enregistre ; petite fête ; la feuille se ferme | `PA:gomme` (Pour → Contre, feuille fermée, 3 fois) ; fête : Manuel |
| GOM-3 | Scrutin et question commune : leur détail anonyme ; chaque mesure ouvre sa fiche anonyme | Manuel **(à faire)** |
| GOM-4 | Depuis l'écran de fin, la gomme montre les noms | `PW:fin` (feuille ouverte, nom d'un candidat présent, vote changé, retour à l'écran de fin) |

## Bilan et fin

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| BIL-1 | Tous les 10 avis : bilan, titre selon le moment, panneaux de fiabilité, « 10 questions de plus », « Voir le Classement » | `M:bilan`, `PA:bilan`, `PW:bilan` ; `U:progress` |
| BIL-2 | Après « 10 questions de plus », le bilan ne revient qu'à la dizaine suivante | `M:bilan` (passé) ; `PA:votes` |
| BIL-3 | Grande fête, son palier, vibration | Manuel |
| FIN-1 | Tout voté : 3 grandes fêtes (une en mode réduit), texte, « Partager mon classement », récapitulatif touchable | `PW:fin` (226 votes préremplis, le dernier voté : texte, « Partager mon classement », « Voir le classement », 227 lignes) ; `U:votes-store`, `U:progress` ; fêtes : Manuel ; Android : Manuel |
| FIN-2 | Message unique après la migration v4 | `U:votes-store` |

## Cahier et fiche candidat

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| CAH-1 | Avant 10 votes : « Le classement s'ouvre après 10 votes. » et « Continuer à voter » | Manuel **(à faire)** |
| CAH-2 | Classement : fiches sur page Seyès, rang, « ex æquo », anneau du parti seul en couleur | `M:cahier` (« Rang 1 ») ; rendu : Manuel |
| CAH-3 | Égalité : le plus fiable devant, puis le hasard, rang partagé | `U:scoring` |
| CAH-4 | Jauge « fragile », « assez sûr », « fiable » ; non classés en liste « N / 2 notées » | `U:scoring`, `U:progress` |
| CAH-5 | Toucher un panneau ouvre la fiche ; « Retour » revient | `M:cahier`, `PA:visites` |
| CAH-6 | Fiche : bandeau du parti, nuance officielle, candidature et programme 2027 avec liens | Manuel **(à faire)** |
| CAH-7 | « Accord avec vos votes » et « Le calcul » posé comme une addition | `M:cahier` (accord) ; calcul : Manuel |
| CAH-8 | Programme 2027 et votes au Parlement (« comme vous », « Vote personnel » ou « de son groupe ») | `M:cahier` (« Son programme ») ; `U:scoring` |
| CAH-9 | `/cahier?partager=1` ouvre le partage une fois ; anciens liens `/results` valides | Manuel **(à faire)** |

## Partage

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| PAR-1 | « Partager mon classement » ouvre un carrousel de 5 images ; flèches et points | `M:partage` |
| PAR-2 | Aucun nom de candidat ni de parti, sauf sur « Mon classement » | `U:share` ; images : Manuel |
| PAR-3 | « Mes thèmes », « Mes scrutins », « Mes enjeux » : chiffres justes | `U:share`, `U:themes` |
| PAR-4 | « Partager l'image » : feuille de partage du système (natif), fichier ou téléchargement (web) | Manuel |

## Lois et fiche scrutin

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| LOI-1 | Liste des scrutins : numéro, statut, question, votre vote | `M:lois`, `PA:visites` |
| LOI-2 | Recherche « Rechercher une loi, un numéro » ; filtre par résultat ; tout repart de zéro en quittant l'onglet | `M:lois` (recherche, effacer) ; filtre : **(à faire)** |
| LOI-3 | Fiche : candidats groupés Pour, Abstention, Contre ; ligne « Moi » corrigeable ; source officielle | `M:lois` (ouverture) ; ligne « Moi » : `M:modifier-vote` (scrutin voté dans Voter, retrouvé par son numéro, Pour → Contre) ; reste : Manuel |

## Explorer et thème

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| EXP-1 | Recherche « Rechercher une mesure, un candidat » ; filtre « Pas encore votées » | `M:explorer` (recherche) ; filtre : **(à faire)** |
| EXP-2 | Un thème ouvre ses propositions avec auteur ; « Thème suivant » ; « Retour au sommaire » | `M:explorer`, `PA:visites` |
| EXP-3 | Détail d'une proposition : type de source, date, « Ouvrir la source », bloc « Question commune » | Manuel **(à faire)** |
| EXP-4 | Détail d'une proposition votée : la ligne « Moi » ouvre l'échelle, un autre choix remplace le vote | `M:modifier-vote` (mesure votée dans Voter, retrouvée par son numéro, Pour → Contre) |

## Réglages et pages légales

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| REG-1 | « Réglages » depuis le Cahier, et par le lien `elire://reglages` | `M:reglages`, `PA` (remise à zéro de chaque passage) |
| REG-2 | Choix du surligneur : les anciennes notes gardent leur couleur | Manuel **(à faire)** |
| REG-3 | « Sons et vibrations », activé par défaut, gardé après effacement | `M:reglages` (bascule) |
| REG-4 | Effacer en deux appuis (« Réinitialiser mes votes », « Confirmer : effacer N votes ») ; astuces vues gardées | `M:reglages`, `PA` (chaque passage) |
| REG-5 | « Revoir les astuces » | `M:reglages` |
| REG-6 | Pied de page : Méthode et corrections, Mentions légales, Crédits, Revoir la présentation, Signaler une erreur | `M:reglages` (les trois pages) ; Signaler : Manuel |
| REG-7 | Crédits : portraits dans un ordre tiré à chaque ouverture (neutralité) | `U:shuffle` (`fisherYates`) ; ordre à l'écran : Manuel |

## Astuces, global, plateformes

| Id | Comportement | Vérifié par |
| --- | --- | --- |
| AST-1 | Chaque astuce une fois ; voile, seul « Compris » ferme, décomptes suspendus | `M:*` (fermées au passage) ; règles : Manuel |
| AST-2 | Aucune astuce ne parle du geste de retour | Manuel (`src/constants/tutos.json`) |
| GLO-1 | Onglets Voter, Cahier, Lois, Explorer ; vibration au changement ; en haut dès 900 px | `M:*`, `PA:visites` ; grand écran : Manuel |
| GLO-2 | Feuilles : poignée, glisser l'en-tête pour fermer (Android, web) ; feuille native sur iOS | Manuel **(à faire)** |
| GLO-3 | Tout reste sur l'appareil ; aucune requête tierce | Manuel (revue de code) |
| GLO-4 | Démarrage à froid rapide | `PA:demarrage` (mesure, pas de seuil) |
| GLO-5 | Défilement fluide des longues listes (Explorer, Lois, Cahier) | `PA:defilement` (mesure) |
| GLO-6 | Données valides et sourcées (schéma, sigles, mots, doublons, propositions par candidat) | `npm run check` (`U:dataset`, `U:validation`, `U:doublons`, …) |
| GLO-7 | Score neutre et équitable entre candidats | `npm run simulations` (`docs/simulations`) |

## Abandonné ou remplacé : ne pas tester l'ancien comportement

- « Neutre » devenu « Je ne sais pas » ; « Dernier vote » devenu « A voté ! ».
- Feuille « Source et contexte » et liens de source dans Voter : supprimés.
- Feuille qui remontait vers « A voté ! » : remplacée par la page qui tourne (`PAGE_TURN`).
- Toucher bloqué pendant le tour de page : remplacé, plus aucun vote avalé.
- Sélecteur de surligneur hors des Réglages : retiré.
- Gomme sur les lignes des listes : retirée.
- Boutons « Suivant » et « Passer » de la présentation, jaune présélectionné : retirés.
- Onglets natifs : remplacés par la barre maison ; onglet « Classement » devenu « Cahier ».
- Onglets « En clair / La mesure / Les mots / Liens » : devenus les tiroirs ; citation coupée à 2 lignes : toujours entière.
- Effacer les votes ne remet plus les astuces à zéro.
- Bilan exclu du geste de retour : ne l'est plus.
- Texte sélectionnable dans Voter sur téléphone : retiré (reste sur le web).
