# Voter sans défiler, ordres neutres, onboarding et textes plus clairs

Décisions du 2026-10-16, après les premiers retours de testeurs.

## Problèmes

- « Il faut scroller » : sur un téléphone, les boutons de vote passaient sous la ligne de flottaison dès qu'un titre faisait 4 lignes.
- Après un scrutin, le filet de 2 pt qui montrait le temps avant la question suivante passait inaperçu ; pareil pour la ligne du dernier vote.
- Des questions de scrutin et des titres de proposition si neutres ou si techniques qu'on ne comprenait pas ce qu'ils changent.
- Les candidats d'une même position (fiche d'un scrutin) et les propositions d'un thème gardaient l'ordre des fichiers de données : toujours les mêmes en tête.
- « A voté pour. » sous le nom d'un candidat redisait l'étiquette « Pour » à droite.
- L'onboarding ne montrait ni le geste du vote ni la gomme, et le surligneur se choisissait en dernier, après la page qui en parle.

## Voter

### Boutons de vote fixes

- Les choix (Impossible à Parfait et « Je ne sais pas », ou Contre / Abstention / Pour) sont dans un bandeau fixe au bas de Voter, au-dessus des onglets ; la feuille défile au-dessus.
- `Screen` prend un `footer` : posé sous le défilement (Android et le web placent l'écran au-dessus des onglets ; sur iOS, le bandeau ajoute la hauteur des onglets).
- Après un scrutin, le bandeau devient « Question suivante » : plus besoin de descendre sous l'hémicycle pour avancer.
- Les phrases d'aide (« L'auteur reste masqué : vous jugez la mesure, pas la personne. », « N candidats ont voté ce texte… ») restent sous la feuille.
- Taille du titre gardée (24 pt) : le bandeau suffit à voir la question et les boutons ensemble. À revoir si les testeurs trouvent encore la feuille trop haute.

### Chargement dans le bouton

- `CountdownFill` : un fond qui se retire de droite à gauche, la part restante du temps. `Button` le prend avec `countdown`.
- « Question suivante » (5 s) : bande graphite sur le bouton encre ; elle disparaît dès qu'on touche ou défile (la suite ne part plus seule), et jamais avec un lecteur d'écran.
- « A voté ! » (10 s) : la ligne entière porte le fond gris clair qui se retire, à la place du filet.

### « A voté ! »

- La ligne du dernier vote s'appelle « A voté ! », comme au bureau de vote (sans accent : verbe avoir). Touchée, elle ouvre la correction du vote.

### Résultat d'un scrutin

- Le bloc du résultat (hémicycle, titre de la loi, référence) s'ouvre au toucher sur la fiche du scrutin, la même que dans Lois ; une flèche le signale. Toucher arrête aussi la suite automatique.

### Ligne de progression

- Le palier à gauche (« 10 votes avant le prochain bilan »), les candidats classés à droite (« 16 candidats classés sur 25 ») ; sur un écran étroit, la seconde info passe à la ligne. `Milestone` prend un champ `side`.

## Ordres neutres

- Fiche d'un scrutin : groupés par position (Pour, Abstention, Contre), puis ordre tiré au hasard à chaque ouverture dans chaque groupe. Sur une fiche candidat, ce candidat reste en premier.
- Page d'un thème : ordre des propositions tiré au hasard à chaque ouverture.
- Recherche d'Explorer : ordre tiré au hasard à l'ouverture d'Explorer, stable pendant la saisie (les résultats ne sautent pas à chaque lettre).
- Fiche candidat : un seul auteur, ordre de ses propositions gardé.

## Votes des candidats

- Une explication qui ne fait que redire l'étiquette (« A voté pour. », « A voté contre. », « S'est abstenu(e). », « A voté pour au Congrès. », 156 votes) n'est plus affichée ; les explications utiles restent (« A voté pour malgré la division de son groupe… »). Filtre à l'affichage (`vote-row.tsx`), données inchangées.

## Onboarding

- Nouvel ordre : élire, Surligneur, Neutralité, Gomme, Transparence, Responsabilité, Confidentialité (« Commencer à voter » sur cette dernière).
- Surligneur choisi avant de voter : la page Neutralité montre les vrais boutons de vote, et toucher un bouton y trace le trait de la couleur choisie.
- Page « Changer d'avis : la gomme » : la ligne « A voté ! » et sa gomme, et où retrouver un vote plus tard (Explorer, Lois, fiche d'un candidat).
- Un essai (surligneur ou boutons) arrête le passage automatique de la page.
- 12 s par page au lieu de 8 ; traits de progression plus épais (4 pt) ; le bouton « Suivant » montre le temps restant avec `CountdownFill`.
- Revoir la présentation : `ONBOARDING_VERSION` (dans `votes-store.ts`) remplace le simple « déjà vue ». À monter quand la présentation change vraiment, pas à chaque version de l'app ; chacun la revoit alors une fois. Passée à 2 avec ces changements : ceux qui l'avaient vue (comptés en version 1) la reverront au prochain lancement. Store persisté en version 3.

## Relecture des textes (sans recherche web)

- Scrutins : 15 questions et 23 enjeux réécrits sur 42 (une idée par question, jargon expliqué dans l'enjeu : 49.3, ratification, moratoire…). Sens vérifié : « Pour » correspond toujours à la position « pour » du scrutin, y compris pour les trois scrutins de rejet (Mercosur, CETA, recettes du budget 2025).
- Propositions : 61 titres et 74 contextes réécrits sur 194 (verbe d'action, mots courants, contexte qui explique la mesure). Les citations (`description`), sources et dates n'ont pas bougé.
- Titres qui disaient plus que la citation, ramenés à la citation (le reste passe dans le contexte) : prop-br-3, prop-dl-3, prop-ez-5, prop-fa-3, prop-fr-2, prop-na-5, prop-nda-2, prop-nda-5, prop-rg-5.
- À valider contre la source : prop-dl-5 et prop-fr-6 (titre plus large que la citation, gardé), prop-nda-3 (« soignants exclus » reste flou).

## Ouvert

- « Les mêmes questions reviennent » : plusieurs candidats proposent des mesures proches (OTAN : 6, référendum d'initiative citoyenne : 4, SMIC : 4, retraites : 3 propositions et 2 scrutins), et un vrai doublon : les deux scrutins CETA (Assemblée 2019, Sénat 2024) posent la même question. Piste retenue, pas encore faite : `data/proches.json` (groupes de mesures proches, règle commune dans CONTRIBUTING), espacer un même groupe dans l'ordre de Voter, mention « Un autre candidat propose une mesure proche. », questions CETA différenciées. Rassembler deux propositions en une seule question seulement si elles sont mot pour mot identiques.
