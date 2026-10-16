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
- Scrutin : mêmes places que pour une proposition, Contre à gauche, Pour à droite (au niveau de −2 … +2), Abstention dessous en pleine largeur comme « Je ne sais pas », au style des scrutins. Le bandeau a donc la même hauteur : « A voté ! », posé juste au-dessus, ne descend plus sous le pouce. « Question suivante » reprend sa seule hauteur, pour laisser la place au résultat.
- Les phrases d'aide (« L'auteur reste masqué : vous jugez la mesure, pas la personne. », « N candidats ont voté ce texte… ») restent sous la feuille.
- Taille du titre gardée (24 pt) : le bandeau suffit à voir la question et les boutons ensemble. À revoir si les testeurs trouvent encore la feuille trop haute.

### Barre fixe en haut, feuille centrée

- Plus de grand titre « Voter » (l'onglet le dit déjà) : une barre compacte fixe en haut, le palier sur deux lignes à gauche (« Bilan dans 4 votes », « 16 candidats classés sur 25 » sur une pastille neutre), les quatre surligneurs à droite, la piste de 2 pt dessous.
- « A voté ! » flotte en bas, juste au-dessus des boutons de vote (là où on vient d'appuyer, sous le pouce pour corriger), par-dessus le contenu, sur un papier presque opaque : il apparaît et disparaît en fondu sans rien déplacer (`Screen` prend un `overlay`). Une réserve fixe de 64 pt en bas du défilement évite que la fin du texte reste dessous.
- Barre du haut et bandeau du bas sans fond ni filet : la piste de progression suffit, et la salle d'un scrutin se voit derrière les boutons.
- Textes courts pour tenir sur une ligne : « Classement dans 4 votes », « Bilan dans 7 votes » ; les candidats classés sur une pastille neutre dessous.
- `Screen` prend un `header` fixe ; avec un bandeau en bas, la colonne prend toute la hauteur et Voter centre la feuille dans l'espace libre : une question courte reste près des boutons, une longue défile.
- Le thème reste vertical dans la marge de la feuille (pas dans la barre) : c'est l'identité de la feuille, et il serait en double.
- `Tip` (`src/components/ui/tip.tsx`) : un encart d'astuce (ampoule, première phrase en gras), en haut de Voter, sans fond ni bordure : derrière le texte, un gribouillis au surligneur choisi, zigzag serré et irrégulier tracé d'un seul geste de gauche à droite à son arrivée (0,9 s, `scribblePath` dans `stroke.ts`), qui laisse le papier autour. Il remplace les phrases grises qu'on ne lisait pas :
  - premier vote : « Environ 20 secondes par question… » et « L'auteur reste masqué… » ;
  - votes 2 à 10 : « L'auteur reste masqué… » et « Arrêtez quand vous voulez… » ;
  - 3 premiers scrutins : « Un vrai scrutin du Parlement : votez comme si vous y siégiez. » et le nombre de candidats qui l'ont voté.
- Quand l'astuce change, l'écran remonte en haut pour qu'elle se voie.
- « En savoir plus » ouvert (proposition ou scrutin) : l'écran descend jusqu'au texte (`MoreInfo` prend un `onOpen`, appelé une fois le texte mis en page).

### Chargement dans le bouton

- `CountdownFill` : un fond qui se retire de droite à gauche, la part restante du temps. `Button` le prend avec `countdown`.
- « Question suivante » (5 s) : bande graphite sur le bouton encre ; elle disparaît dès qu'on touche ou défile (la suite ne part plus seule), et jamais avec un lecteur d'écran.
- « A voté ! » (10 s) : la ligne entière porte le fond gris clair qui se retire, à la place du filet.

### « A voté ! »

- La ligne du dernier vote s'appelle « A voté ! », comme au bureau de vote (sans accent : verbe avoir). Touchée, elle ouvre la correction du vote.

### Résultat d'un scrutin

- Le bloc du résultat (hémicycle, titre de la loi, référence) s'ouvre au toucher sur la fiche du scrutin, la même que dans Lois ; une flèche le signale. Toucher arrête aussi la suite automatique.

### Ligne de progression

- `Milestone` prend un champ `side` (les candidats classés), affiché sous le palier dans la barre fixe.

## Fiche candidat : le calcul

- Toucher la carte « Accord avec vos votes » (lien « Voir le calcul ») ouvre la feuille « Le calcul », posée comme une addition d'école, pour qui doute du pourcentage :
  - programme : une ligne par note (« 2 × Parfait (+2) … +4 »), un trait, le total ; puis « le total va de −8 à +8, on ajoute 8, on divise par 16 » et « (+3 + 8) ÷ 16 = 68,8 % » ;
  - Parlement : pareil, en deux groupes, « Votes personnels » (comptent en entier) et « Votes de son groupe » (comptent moitié), une ligne par sorte (même position, position contraire, abstention) ;
  - total : chaque partie × son poids (« 68,8 % × 8 ÷ 11 », ou 50 % quand le Parlement est plafonné), un trait, le résultat en Literata 34 comme sur la carte, avec l'arrondi s'il y en a un ;
  - mise en page : une carte blanche par partie, son résultat à droite du titre ; colonnes combien / quoi / points / résultat en chiffres tabulaires ; vos notes dans leur couleur d'échelle, les positions en encre ;
  - ce qui ne compte pas : « Je ne sais pas », vos abstentions, les scrutins où il n'a pas voté.
- `scoreDetail` (`scoring.ts`) donne ces lignes avec les mêmes règles que `scoreCandidat` ; un test vérifie qu'ils tombent sur le même score.

## Ordres neutres

- Fiche d'un scrutin : groupés par position (Pour, Abstention, Contre), puis ordre tiré au hasard à chaque ouverture dans chaque groupe. Sur une fiche candidat, ce candidat reste en premier.
- Page d'un thème : ordre des propositions tiré au hasard à chaque ouverture.
- Recherche d'Explorer : ordre tiré au hasard à l'ouverture d'Explorer, stable pendant la saisie (les résultats ne sautent pas à chaque lettre).
- Fiche candidat : un seul auteur, ordre de ses propositions gardé.

## Boutons de vote

- Le bouton choisi prend sa bordure de 2 pt sans grandir : sa marge interne perd 1 pt (avant, la page bougeait de quelques pixels au choix, dans Voter comme dans l'onboarding).

## Votes des candidats

- Une explication qui ne fait que redire l'étiquette (« A voté pour. », « A voté contre. », « S'est abstenu(e). », « A voté pour au Congrès. », 156 votes) n'est plus affichée ; les explications utiles restent (« A voté pour malgré la division de son groupe… »). Filtre à l'affichage (`vote-row.tsx`), données inchangées.

## Onboarding

- Ordre : élire, Surligneur, Neutralité, Gomme, Transparence, Responsabilité, Confidentialité, puis une dernière page : logo, « élire » et « Commencer à voter » au centre.
- Navigation de story : toucher à droite de la page pour la suivante, à gauche pour la précédente, ou toucher un trait du haut pour y revenir. Plus de bouton « Suivant » ni « Passer » : les traits prennent toute la largeur, épais de 4 pt dans une cible de 44 pt, et avancent seuls toutes les 15 s.
- Chaque titre : un début en encre, puis une fin balayée par le surligneur à l'arrivée de la page (`SweepText`, `header={false}` dans un titre déjà annoncé). Page du surligneur : aucune couleur choisie au départ, le balayage part au premier choix et repart à chaque changement.
- Un seul vote fictif suit toute la présentation, sur la proposition « Ouvrir les bibliothèques publiques le dimanche » (citation fictive qualitative) : posé en Neutralité, corrigé à la gomme, retrouvé en Transparence et en Responsabilité ; chaque toucher de vote compte, et c'est ce compte que l'exemple de Confidentialité efface (puis plus aucun vote ne s'affiche). Rien n'est écrit dans les vrais votes.
- Exemples, au surligneur choisi :
  - Neutralité : les vrais boutons de vote, le choix prend le trait.
  - Gomme : la ligne « A voté ! » d'une proposition fictive ; la toucher ouvre la vraie feuille « Modifier votre vote » (`EditVoteSheet` prend un `example`), le nouveau choix s'affiche sur la ligne.
  - Transparence : une ligne d'Explorer fictive (auteur, votre note surlignée) ; au toucher, la date, la page et « Ouvrir la source », qui n'ouvre aucun vrai lien (« Ouvre la page de la source dans votre navigateur. »).
  - Responsabilité : votre vote surligné, puis deux candidats fictifs comme sur la fiche d'un scrutin (initiales, nom, et dessous « Vote personnel » ou « Vote de son groupe »).
  - Confidentialité : le vrai `ResetButton` du Classement, branché sur un compteur fictif (« Exemple : 12 votes sur cet appareil ») ; c'est l'utilisateur qui l'essaie (deux appuis), le compteur descend à 0 avec une petite fête puis revient. Le texte dit que l'exemple ne touche pas à ses votes, et où est le vrai bouton.
- Un essai (surligneur, boutons, exemple) arrête le passage automatique de la page.
- `PropositionRow` et `YourVoteMark` prennent un `marker` imposé ; `CandidateAvatar` se contente d'un `id` et d'initiales.
- Revoir la présentation : `ONBOARDING_VERSION` (dans `votes-store.ts`) remplace le simple « déjà vue ». À monter quand la présentation change vraiment, pas à chaque version de l'app ; chacun la revoit alors une fois. Passée à 2 avec ces changements : ceux qui l'avaient vue (comptés en version 1) la reverront au prochain lancement. Store persisté en version 3.

## Relecture des textes (sans recherche web)

- Scrutins : 15 questions et 23 enjeux réécrits sur 42 (une idée par question, jargon expliqué dans l'enjeu : 49.3, ratification, moratoire…). Sens vérifié : « Pour » correspond toujours à la position « pour » du scrutin, y compris pour les trois scrutins de rejet (Mercosur, CETA, recettes du budget 2025).
- Propositions : 61 titres et 74 contextes réécrits sur 194 (verbe d'action, mots courants, contexte qui explique la mesure). Les citations (`description`), sources et dates n'ont pas bougé.
- Titres qui disaient plus que la citation, ramenés à la citation (le reste passe dans le contexte) : prop-br-3, prop-dl-3, prop-ez-5, prop-fa-3, prop-fr-2, prop-na-5, prop-nda-2, prop-nda-5, prop-rg-5.
- À valider contre la source : prop-dl-5 et prop-fr-6 (titre plus large que la citation, gardé), prop-nda-3 (« soignants exclus » reste flou).

## Ouvert

- « Les mêmes questions reviennent » : plusieurs candidats proposent des mesures proches (OTAN : 6, référendum d'initiative citoyenne : 4, SMIC : 4, retraites : 3 propositions et 2 scrutins), et un vrai doublon : les deux scrutins CETA (Assemblée 2019, Sénat 2024) posent la même question. Piste retenue, pas encore faite : `data/proches.json` (groupes de mesures proches, règle commune dans CONTRIBUTING), espacer un même groupe dans l'ordre de Voter, mention « Un autre candidat propose une mesure proche. », questions CETA différenciées. Rassembler deux propositions en une seule question seulement si elles sont mot pour mot identiques.
