# feat : voter sur les lois et choisir son surligneur

État au 2026-10-14. Deux fonctionnalités liées, livrables séparément :

- **A. Voter sur les lois** : l'utilisateur vote aussi sur des scrutins réels ; chaque candidat gagne des points s'il a voté comme lui et en perd s'il a voté l'inverse.
- **B. Surligneur au choix** : l'utilisateur choisit la couleur de ses marques. Chaque vote garde la couleur choisie au moment où il a été posé.
- **V. Animation du vote** : après un clic, le bouton puis le titre sont surlignés, et la feuille remonte se ranger en « Dernier vote ».

## Décisions validées (2026-10-14)

- Les votes de groupe comptent à moitié (× 0,5).
- Un candidat qui ne pouvait pas voter (pas élu, pas de groupe à cette date) ne perd aucun point : ce scrutin n'est simplement pas compté pour lui. Le Classement l'indique : « N'a pas siégé : score calculé sur le programme seul ».
- Lois : trois choix, Contre, Abstention, Pour.
- Un seul score combiné dans le Classement ; le détail (programme / votes) est sur la fiche candidat.
- Surligneur : 4 couleurs au choix (jaune, rose, vert, bleu). Les animations de vote utilisent la couleur choisie à l'onboarding.

## Avis

Les deux idées sont bonnes et vont dans le sens du produit. La troisième story de l'onboarding le dit déjà : « une promesse n'est pas un vote ». Confronter l'avis de l'utilisateur aux actes réels est ce qui distingue ÉLIRE d'un simple quiz de programmes.

Trois conditions pour qu'elles restent neutres :

1. **Couverture inégale des votes.** 7 candidats sur 17 n'ont aucun vote : Mikolajczak, Zemmour, Arthaud, Asselineau, Lisnard, Thouy et Lassalle. Pour eux, les lois ne changent rien, alors que les 10 autres montent ou descendent. Il faut le dire clairement à l'écran et pondérer (voir A.3).
2. **Vote de groupe et vote personnel.** Édouard Philippe et Marine Tondelier ne siègent pas : tous leurs votes sont ceux de leur groupe. Compter un vote de groupe comme un vote personnel serait trompeur, d'où une demi-pondération.
3. **Pas de jeu.** `PRODUCT.md` et `DESIGN.md` refusent explicitement l'« appli gadget ou gamifiée ». Un jeu de couleurs sur les lois contredirait ce choix. Je recommande de rendre le côté « tranchant » par la mécanique et une seule animation sobre (A.2), sans points, badges ni effets.

## État actuel

- **26 scrutins** : 23 à l'Assemblée, 1 au Sénat, 2 au Parlement européen, tous de 2023-2024. Aucun scrutin de 2025-2026.
- Thèmes : environnement 4 ; agriculture, international, numérique 3 ; les autres thèmes 1 ou 2.
- Votes par candidat :

| Candidat | Personnels | De groupe |
| --- | --- | --- |
| François Ruffin | 19 | 0 |
| Marine Le Pen | 19 | 6 |
| Gabriel Attal | 5 | 21 |
| Fabien Roussel | 5 | 7 |
| Bruno Retailleau | 4 | 21 |
| Nicolas Dupont-Aignan | 4 | 0 |
| Raphaël Glucksmann | 2 | 17 |
| Édouard Philippe | 0 | 24 |
| Jean-Luc Mélenchon | 0 | 23 |
| Marine Tondelier | 0 | 23 |
| Les 7 autres | 0 | 0 |

## A. Voter sur les lois

### A.1 Données

- **Nouveau champ `question` dans `data/lois.json`** : la question posée à l'utilisateur, courte, neutre, sans nom de personne, de parti ou de loi éponyme. Exemple : « Faut-il inscrire l'IVG dans la Constitution ? ». Plusieurs titres actuels révèlent l'auteur (« Loi Le Meur », « gouvernement Michel Barnier », « Niche RN », « Loi Kasbarian »). La règle d'anonymat des propositions s'applique donc aussi à `question`, et le titre officiel n'apparaît qu'après le vote.
- Pas de nouvel identifiant : les lois gardent leur `L-xx`.
- Schéma Zod (`src/schemas/dataset.ts`) : `question` obligatoire, contrôlée par `build:data:strict` (longueur, apostrophes, aucun nom de candidat ni de parti).
- Ajouter des scrutins (voir section C).

### A.2 Écran Voter

- **Ordre de passage** : les lois s'intercalent dans l'ordre existant (`balancedOrder`), environ 1 loi toutes les 4 propositions, jamais deux lois de suite. `order` contient des ids de propositions et de lois.
- **Feuille « Scrutin »** : même feuille que les propositions, avec une marge marquée « L-12 · Scrutin ». On y voit la `question`, le `resume` factuel (sans nom), la chambre et l'année. Le résultat (adoptée ou rejetée) reste caché jusqu'au vote pour ne pas influencer.
- **Trois choix, comme au Parlement** : Contre, Abstention, Pour. Les 5 niveaux des propositions n'existent pas dans un hémicycle. Le contraste entre ces 3 gros boutons et les 5 boutons habituels suffit à signaler que ce vote est d'une autre nature.
- **Avant le vote**, une ligne graphite : « 9 candidats ont voté ce texte. Votre choix les rapproche ou les éloigne de vous. » Le nombre est donné, pas les noms.
- **Après le vote, l'animation « hémicycle »** : un demi-cercle de points à l'encre, un par candidat ayant voté, sans nom. Les points se rangent en 700 ms environ : ceux qui ont voté comme l'utilisateur se remplissent de sa couleur de surligneur, ceux qui ont voté l'inverse restent en creux, ceux qui se sont abstenus passent en graphite. Une ligne de bilan suit : « 5 comme vous, 3 à l'inverse, 1 abstention », puis le titre officiel et le résultat du scrutin.
  - Les points restent anonymes, sinon les propositions suivantes ne seraient plus votées à l'aveugle. Les noms n'apparaissent que dans Classement, sur les fiches et dans l'onglet Lois.
  - Réalisation : des `View` placées en arc avec `react-native-reanimated`, déjà installé ; pas besoin d'ajouter `react-native-svg`. L'animation est coupée si « Réduire les animations » est activé : affichage direct de l'état final.
- **Dernier vote** et récapitulatif de fin de série : les lois y apparaissent avec la valeur en toutes lettres (« Pour », « Contre », « Abstention ») et le trait de surligneur.

### A.3 Score

Points par scrutin, quand l'utilisateur vote U et le candidat a voté C :

| | C = Pour | C = Contre | C = Abstention |
| --- | --- | --- | --- |
| U = Pour | +2 | −2 | 0 |
| U = Contre | −2 | +2 | 0 |
| U = Abstention | 0 | 0 | 0 |

- **Pondération** : vote personnel × 1 ; vote de groupe × 0,5.
- **Formule** : on reprend le calcul actuel (`src/lib/scoring.ts`) en moyenne pondérée sur tous les éléments votés : `score = (Σ poids × points + max) / (2 × max) × 100`, avec `max = Σ poids × 2`. Le poids d'une proposition vaut 1. Une moyenne ne gonfle pas un candidat parce qu'il a beaucoup de votes : elle le décale dans un sens ou dans l'autre.
- **Pas de vote enregistré** pour un candidat sur ce scrutin (pas élu, pas de groupe, vote retiré) : rien n'est compté pour lui, ni en plus ni en moins (ce n'est pas un 0).
- **Classé** : le seuil reste à 2 propositions notées (`MIN_VOTES_PER_CANDIDAT`) ; les lois s'ajoutent au calcul mais ne suffisent pas à classer un candidat.
- **Un seul score combiné** (validé) : le Classement n'affiche que ce score.
- **Détail sur la fiche candidat** seulement (`candidate/[id].tsx`, bloc « Accord avec vos votes ») : « 64 % · Programme 70 % (5 propositions) · Votes 48 % (4 scrutins, dont 3 de groupe) ».
- **Message neutre** dans Classement pour les 7 candidats sans vote : « N'a pas siégé sur ces scrutins : score calculé sur le programme seul. »
- Tests : compléter `src/lib/__tests__/scoring.test.ts` (tableau des points, pondération de groupe, candidat sans vote, abstention, égalités).

### A.4 Stockage (livré)

`src/store/votes-store.ts` passe en version 2 :

- `votes` (propositions) garde sa forme ; `loiVotes: Record<string, 'pour' | 'contre' | 'abstention'>` est ajouté. Écart avec le plan initial : pas de structure unique `Mark`, pour ne pas toucher tous les écrans qui lisent `votes`. La couleur du surligneur (B) viendra dans une table à part `marks: Record<id, MarkerId>`, sans nouvelle migration des votes.
- `order` contient propositions et scrutins (`interleaveLois`, jamais deux scrutins de suite) ; pour un ancien stockage, les scrutins sont intercalés dans la partie pas encore votée.
- `resetVotes` efface aussi `loiVotes`. `selectNextId` remplace `selectNextPropositionId`.

### A.5 Autres écrans

- **Lois** (`lois.tsx`, `loi-card.tsx`) : si l'utilisateur a voté, sa position s'affiche surlignée dans sa couleur, à côté des positions des candidats.
- **Fiche candidat** (`candidate/[id].tsx`) : dans « Votes au Parlement », chaque scrutin voté indique « comme vous » ou « à l'inverse de vous », en texte et pas seulement en couleur.
- **Explorer** : les lois restent dans l'onglet Lois, rien ne change.

## B. Surligneur au choix

### B.1 Règle

« The Reader's Highlighter Rule » change de forme, pas d'esprit : la couleur vive reste réservée aux marques de l'utilisateur, mais cette couleur est la sienne. Elle ne signifie rien et n'est liée à aucun parti. Chaque marque garde la couleur du surligneur utilisé ce jour-là, comme dans un vrai cahier.

### B.2 Palette fermée

Quatre surligneurs clairs (validé : 4 ou 6, retenu 4), tous lisibles sous l'encre `#1C1E21` (contraste à vérifier : au moins 4,5:1 pour le texte posé dessus) :

| Id | Nom | Couleur (proposition) |
| --- | --- | --- |
| jaune | Jaune | `#EADB3F` (actuel, par défaut) |
| rose | Rose | `#F2A7C3` |
| vert | Vert | `#A8E0A1` |
| bleu | Bleu | `#A9D3F5` |

- Pas de violet (anti-référence Elyze). Pas de teinte foncée, pour ne pas se confondre avec l'échelle terre cuite / vert correcteur.
- Pas d'orange : trop proche de la terre cuite des votes négatifs. Six couleurs obligeraient à ajouter du violet ou des teintes trop proches entre elles (bleu et turquoise, orange et corail).
- Le vert reste clair pour ne pas se lire comme « Pour » : à valider à l'écran à côté de l'échelle de vote.
- Constantes : `src/constants/theme.ts` (`Markers`), et `marked.tsx` qui prend la couleur en paramètre au lieu de `Colors.markSoft`.

### B.3 Parcours

- **Onboarding** (`src/app/onboarding.tsx`) : dernier écran après les stories, « Choisissez votre surligneur ». Quatre pastilles (grille 2 × 2) en forme de trait, avec un aperçu sur un mot (« votre avis »). Le jaune est présélectionné, donc l'utilisateur peut passer.
- **Changer à tout moment** : une entrée « Surligneur » sous le compteur de Voter ou dans le récapitulatif. À trancher (voir les questions ouvertes).
- Changer de surligneur ne recolore pas les marques existantes.
- Accessibilité : chaque pastille a son nom en `accessibilityLabel` ; la couleur n'est jamais la seule information.

### B.4 Jeu de couleurs sur les lois

Non recommandé, à cause de la règle anti-gamification. La couleur intervient déjà dans l'hémicycle : les candidats qui ont voté comme l'utilisateur prennent sa couleur. C'est sobre et lisible, et c'est le seul endroit où le geste devient visuel.

## V. Animation du vote

Aujourd'hui, le vote est enregistré et la feuille suivante apparaît en fondu (220 ms) ; seul le « Dernier vote » est balayé par le trait (`src/app/(tabs)/index.tsx`, `LastVote`). La nouvelle séquence montre le geste du surligneur avant de passer à la suite.

### V.1 Séquence (proposition)

1. **Le bouton choisi est surligné en diagonale** (220 ms). Un trait de la couleur du surligneur traverse le bouton, toujours de gauche à droite, avec un angle tiré au hasard entre −14° et −4° pour imiter un geste à la main. Le trait passe sous le texte, qui reste lisible. Il est posé dans `vote-scale.tsx` par un `Animated.View` absolu, en `scaleX` depuis la gauche puis `rotate`.
2. **Le titre de la feuille est surligné** (260 ms), ligne par ligne, de gauche à droite, avec le même trait que celui de `Marked`.
3. **La feuille remonte se ranger en « Dernier vote »** (320 ms) : elle glisse vers le haut en rétrécissant vers la ligne « Dernier vote » (translateY mesuré par `onLayout`, échelle et opacité vers 0). La ligne « Dernier vote » apparaît alors déjà surlignée et reste modifiable comme aujourd'hui.
4. **La feuille suivante arrive** (220 ms) : fondu et légère montée depuis le bas.

Durée totale : environ 1 s. Sur 96 propositions, l'attente totale reste d'environ 1 min 30 : ne pas dépasser cette durée.

### V.2 Règles

- **Le vote est enregistré dès le clic** (étape 1) : quitter l'écran pendant l'animation ne le perd pas.
- **Boutons bloqués pendant la séquence**, pour éviter un double vote ; aucun autre écran n'est bloqué.
- **Réduire les animations** : pas de séquence, on passe directement à l'état final (comportement actuel).
- **Lecteur d'écran** : annonce « Vote enregistré : Impossible » (`AccessibilityInfo.announceForAccessibility`).
- **Couleur** : celle du surligneur choisi à la fin de l'onboarding (ou changé ensuite) : trait du bouton, trait du titre, « Dernier vote » et points de l'hémicycle. Jaune tant que B n'est pas livré.
- **Lois** : même étape 1 sur le bouton (Contre, Abstention, Pour). L'hémicycle (A.2) s'affiche entre l'étape 2 et l'étape 3, puis la feuille remonte. Durée plus longue, assumée : c'est le moment « tranchant ».
- **Web** : même séquence (Reanimated fonctionne sur le web) ; le trait du titre reprend la bande basse de `global.css`.

### V.3 Fichiers

- `src/components/vote-scale.tsx` : trait diagonal, prop `markerColor`, prop `locked`.
- `src/app/(tabs)/index.tsx` : enchaînement des étapes (état `phase` : `idle`, `markButton`, `markTitle`, `leaving`), animation de sortie de la feuille vers `LastVote`, entrée de la suivante.
- `src/components/proposition-sheet.tsx` : titre surlignable pendant l'étape 2.
- `DESIGN.md` (section « Trait de surligneur ») et `.impeccable/surfaces/src-app-tabs-index-tsx.md` : décrire la nouvelle signature.

## C. Ajouter des scrutins

Objectif : passer de 26 à environ 40 scrutins, en suivant le skill `collecter-donnees` et en vérifiant avec `verifier-donnees`. Toutes les références sont à confirmer sur les pages officielles des scrutins avant ajout.

1. **2025-2026 (17e législature)** : rien après décembre 2024 pour l'instant. Pistes : aide à mourir (2025), loi Duplomb sur les néonicotinoïdes (2025), loi narcotrafic (2025), vote de confiance de septembre 2025, motions de censure de 2025, budget et sécurité sociale 2026 (suspension de la réforme des retraites).
2. **2017-2022 (15e législature)** : c'est la période où Mélenchon, Lassalle, Ruffin, Le Pen, Dupont-Aignan et Roussel votaient eux-mêmes, ce qui ajoute des votes personnels et couvre Lassalle, aujourd'hui à 0. Pistes : loi asile et immigration (2018), EGALIM (2018), ratification du CETA (2019), loi bioéthique et PMA (2021), sécurité globale (2021), principes de la République (2021), climat et résilience (2021), passe sanitaire (2021).
3. **Parlement européen depuis juillet 2024** : votes de groupe pour Reconquête (groupe ESN) et Place publique (S&D), seulement si la présence du groupe à cette date est vérifiée.
4. **Thèmes peu couverts** : santé, éducation et société (1 scrutin chacun).

Pour chaque scrutin : `question` anonyme, `resume` factuel, analyse par groupe et analyse nominative.

Les 6 candidats sans aucun mandat (Mikolajczak, Zemmour hors Parlement européen, Arthaud, Asselineau, Lisnard, Thouy) resteront sans vote : à afficher (A.3), pas à compenser par des scrutins choisis pour eux.

## D. Site web (`../elire-website`)

Le site devient la vitrine des surligneurs : plus coloré, mais toujours sans couleur de parti. Les couleurs sont celles des marques du lecteur, sans aucune signification.

### D.1 Contenu

- `src/pages/index.astro` :
  - la feuille en quatre temps passe de « noter » à « noter les propositions et les scrutins » ;
  - nouveau bloc « Votez comme au Parlement » : 3 choix, hémicycle anonyme, points en plus et en moins ;
  - section « Le calcul, en clair » : tableau des points, pondération de groupe, candidats sans vote ;
  - nouveau bloc « Votre surligneur » : les 4 surligneurs, et l'explication que chaque marque garde sa couleur.
- `src/config.ts` : compteur de scrutins mis à jour.

### D.2 Surligneurs sur le site

- **Tokens** (`src/styles/global.css`) : `--mark` et `--mark-band` deviennent `--marker-jaune`, `--marker-rose`, `--marker-vert`, `--marker-bleu`, chacun avec sa version « bande ». `--mark` pointe sur le surligneur du lecteur via `html[data-marker="rose"]`, etc.
- **Choix du lecteur** : un petit sélecteur de 4 traits (dans l'en-tête et dans le bloc « Votre surligneur ») change le surligneur du lecteur. Tous les gestes en direct l'utilisent ensuite : balayage des liens au survol, remplissage des boutons, trait de lecture.
  - Le choix est mémorisé en `localStorage`, sur l'appareil, sans cookie ni traceur. Un script inline dans `Base.astro` l'applique avant l'affichage, pour éviter un flash de jaune.
  - Par défaut, un surligneur est tiré au hasard à chaque visite tant que le lecteur n'a rien choisi (rien n'est écrit sans son geste), pour que le site ne soit pas seulement jaune.
- **Page déjà annotée** : les marques posées dans le texte (classe `.mark` dans les titres) sont réparties entre les 4 couleurs, comme un cahier surligné au fil du temps. Elles gardent leur couleur quand le lecteur change de surligneur ; seuls les gestes à venir prennent la nouvelle couleur. C'est la règle de l'app (B.1) rendue visible.
- **Démo du vote** : dans le bloc « fonctionnement », une proposition d'exemple rejoue la séquence V.1 en CSS (trait diagonal sur le bouton, trait sur le titre, la feuille remonte), dans la couleur du lecteur. Elle est coupée par `prefers-reduced-motion`.
- **Contraste** : texte encre sur chaque bande ≥ 4,5:1 ; le focus clavier reste un contour encre, pas une couleur.
- **Données d'exemple** (`src/data/exemples.json`) : ajouter un scrutin d'exemple anonyme pour le bloc « Votez comme au Parlement ».

### D.3 Documentation du site

- `DESIGN.md` du site : « jaune réservé » devient « 4 surligneurs du lecteur, sans signification » ; palette et règle « une marque garde sa couleur ».
- `README.md` du site : sélecteur de surligneur, mémorisation locale, aucun cookie.
- `.impeccable/` du site : brief de surface mis à jour.

## E. Documentation à mettre à jour

- `README.md` : écran Voter, calcul du score (section dédiée), store v2.
- `PRODUCT.md` : fonctionnalités, chiffres (scrutins), neutralité (couverture inégale annoncée).
- `DESIGN.md` et `.impeccable/surfaces/src-app-tabs-index-tsx.md` : palette de surligneurs, feuille « Scrutin », hémicycle, règle du surligneur.
- `CONTRIBUTING.md` et skills de données : champ `question` et son anonymat.
- `todo.md` : retirer les deux idées une fois le plan validé.

## F. Ordre de livraison

0. **Animation du vote** (V) : livré le 2026-10-14.
1. **Données** : champ `question` sur les 26 lois et schéma Zod. Petite PR, sans risque. Livré.
2. **Score** : `scoring.ts` et ses tests, sans interface. Livré.
3. **Store v2** : migration et marqueur par vote. Livré, sans test automatisé de la migration (vérifiée à la main sur le web).
4. **Voter** : feuille Scrutin, 3 choix, intercalage dans l'ordre. Livré.
5. **Hémicycle** : animation et prise en compte de « Réduire les animations ». Livré.
6. **Classement et fiche** : score combiné dans le Classement, détail sur la fiche, message « n'a pas siégé ». Livré.
7. **Surligneur** : palette, onboarding, réglage, `marked.tsx`. Livré.
8. **Nouveaux scrutins** : livré, 16 ajoutés (42 au total), votes 2022-2026 recontrôlés par l'open data de l'Assemblée.
9. **Site web** : contenu (D.1), surligneurs (D.2), documentation (D.3). Livré le 2026-10-14 ; démo du geste et hémicycle en CSS et JS sans dépendance, scrutins d'exemple dans `elire-website/src/data/scrutins.json` (à régénérer si les votes changent).
10. **Documentation de l'app** (E) et `document` impeccable. Livré le 2026-10-14 : DESIGN.md et `.impeccable/design.json` synchronisés avec le code (composants récents, 4 surligneurs, polices, icônes, Crédits), brief de surface de Voter et `todo.md` à jour.
11. **Comprendre avant de voter** (H.2) : « Je ne sais pas » à la place de « Neutre », « En savoir plus », plus de source dans Voter, titres et questions sans sigle avec contrôle au build. Priorité : touche la justesse du score. Livré le 2026-10-14 : « Je ne sais pas » sous les 4 niveaux (pas un niveau, compté nulle part, ni pour ouvrir le Classement), « En savoir plus » fermé par défaut avec glossaire puis contexte, 41 sigles dans `data/glossaire.json`, 9 titres et questions réécrits, contrôles `checkAcronyms` au build, site aligné.
12. **Durée et paliers** (H.1). Livré le 2026-10-14 : palier sous le titre de Voter (Classement, puis candidats classés), estimation avant le premier vote et dans l'onboarding, bilan à chaque dizaine d'avis (précision : moyenne de propositions notées par candidat et 17 panneaux ; « 10 questions de plus » en principal), filet qui repart vers le prochain bilan, logique testée dans `src/lib/progress.ts`. L'estimation de 20 secondes par question reste à mesurer avec un vrai testeur.
13. **Site plus clair** (H.4). Livré le 2026-10-14 : FAQ « Vos questions » (7 questions des testeurs), calcul d'exemple prolongé jusqu'à la fiabilité, colonne « Noter » cliquable sans note tirée au hasard, principe réécrit sans antithèse, bilan et fiabilité dans « Comment ça marche ». Reste : la fiche candidat anonyme de l'exemple de bout en bout, et refaire tester Moreen.
14. **Cadre juridique** (H.6) : avant la sortie publique, en parallèle du code. En cours le 2026-10-14 : écrans « Mentions légales » et « Méthode et corrections » dans l'app (pied de données) et pages du site (pied de page), même texte (`src/constants/legal.ts`, `elire-website/src/data/legal.ts`), ticket GitHub « Droit de réponse », règle « Titre fidèle » dans `CONTRIBUTING.md` et `verifier-donnees`. Décidé le 2026-10-14 : éditeur Danny Garcia et hébergeur affichés, contact contact@danny-garcia.fr (lien courriel), correction sous 10 jours ouvrés. Reste : relecture par un avocat (texte, période électorale).
15. **Candidats manquants** (H.5). Livré le 2026-10-14 : champ `candidature` obligatoire (statut, date, source vérifiée) sur les 25 candidats, affiché en lien sur la fiche ; Hélène Thouy remplacée par Mira Markovic ; ajout de Delphine Batho, Karim Bouamrane, Anasse Kazib, Selma Labib, Florian Philippot, Xavier Bertrand, Olivier Becht et Natacha Polony (6 propositions chacun, `check-sources` sans erreur) ; Jean Lassalle marqué « pressentie ». Reste :
    - votes au Parlement des nouveaux élus ou anciens élus (Batho, Becht, Bertrand, Philippot) à ajouter aux scrutins existants ;
    - pas de photo libre pour Markovic et Labib (initiales) ;
    - sigles de mouvements non officiels (FHuF, NSLF, NF, PF, LP) et couleurs choisies par nous ;
    - à surveiller : Bouamrane (point « fin octobre »), Tondelier (vote du 10 au 13/12), déclarations formelles de Zemmour et Bertrand, pourvoi de Le Pen, décision de Lassalle ;
    - les autres déclarés (Lalanne, Durif, Egger, Mathieu, Mlekuz, Platret) si leurs parrainages avancent.
    - Ordre par tours (`balancedOrder`, testé) : une proposition par candidat à chaque tour, pour que les 25 soient classés vers 50 propositions votées ; pour un ordre déjà enregistré, la partie pas encore votée est refaite quand de nouvelles propositions arrivent. Au 1er bilan (10 votes), aucun candidat n'est encore classé : c'est attendu.
16. **Typographie** (H.3) : spécimen des 3 pistes, choix, puis app et site. Livré le 2026-10-14 : piste 3 retenue (Literata, Atkinson Hyperlegible Next, Caveat), fichiers statiques officiels (SDK 57 sans polices variables), écran Crédits complété ; Caveat réduite aux caractères latins pour le site (60 Ko).
17. **Fiabilité du score** (H.7) : niveau par candidat dans le bilan, le Classement et la fiche. Livré le 2026-10-14 : `evidence` et `reliability` dans `scoring.ts` (testés), composant `reliability-mark.tsx`.
18. **Icônes des onglets** (H.8) : un seul jeu au trait, Explorer inchangée. Livré le 2026-10-14 : surligneur qui signe (l'urne rappelait un doigt levé, puis le podium de Classement) et balance dessinées, podium et bibliothèque d'Ionicons, SVG sur le web, PNG 1x à 3x pour les onglets natifs (`scripts/build-tab-icons.mjs`), crédit Ionicons dans Crédits. Rendu natif à vérifier sur appareil.
19. **Trait vivant** (H.9). Livré le 2026-10-14 : forme tirée à chaque vote (`src/lib/stroke.ts`, testé) tracée en SVG (`react-native-svg`) de gauche à droite, sous le texte, parfois hors du bouton ; texte surligné droit puis légèrement ondulé sur le web (tuiles SVG, 3 variantes) ; même geste et mêmes marques sur le site. En natif, le texte surligné reste un fond de ligne uni ; rendu natif du trait à vérifier sur appareil.
20. **Fond de la feuille** (H.10). Livré le 2026-10-14 : `Modal` sans animation, voile en fondu sur place (260 ms), seul le panneau glisse ; fermeture en 200 ms ; « Réduire les animations » respecté. iOS (`pageSheet`) inchangé.

Chaque lot d'interface suit la méthode G et se termine par `npm run check` (app) ou `npm run check` du site.

## H. Retours des testeurs (2026-10-14)

Trois testeurs (27 à 29 ans), sur la version d'avant cette feature.

| Retour | Couvert par cette feature ? | Reste à faire |
|---|---|---|
| Enzo : un candidat cité dans une question | Oui : propositions anonymisées, contrôle bloquant au build (`checkAnonymous`) | Rien |
| Enzo : trop long, aucune idée du temps à prévoir (« 10/96 ») | Non, c'est pire : le compteur affiche maintenant 138 (96 propositions + 42 scrutins) | H.1 |
| Marion : manque de couleur sur l'app et le site | Oui : 4 surligneurs dans l'app et sur le site | À refaire tester |
| Marion : typo plus percutante | Non : police système partout | H.3, à décider |
| Moreen : site pas assez clair, ton « modèle ChatGPT » | En partie : essai du geste, scrutin à voter, calcul détaillé | H.4 |
| Moreen : propositions incomprises, sigles (TAFTA), vote « Neutre » par défaut | En partie : `contexte` réécrit, mais caché derrière « Voir la source » ; aucun moyen de passer | H.2, priorité |
| Moreen : il manque des candidats | Non : 17 candidats | H.5 |
| Moreen : risque juridique (diffamation) | En partie : citations exactes et sourcées, votes tirés de l'open data | H.6, avant toute sortie publique |

Le point le plus grave est celui de Moreen : voter « Neutre » faute de comprendre compte 0 et tire les scores vers 50 %. Le score mesure alors l'incompréhension, pas l'accord.

### H.1 Durée et effort (Enzo)

- Le compteur montre le prochain palier, pas le total : « Encore 4 votes avant votre Classement », puis « 9 candidats sur 17 classés ». Le total reste dans Explorer.
- Une estimation honnête dans l'onboarding et au-dessus du premier vote : environ 15 à 30 secondes par question, un premier Classement en 3 à 5 minutes (10 votes). L'estimation est à vérifier sur un vrai test chronométré.
- Une phrase de pause : « Arrêtez quand vous voulez, vos votes restent sur votre appareil. »
- Après 10 votes : proposer une suite courte (« 10 de plus pour affiner »), plutôt qu'une file sans fin.

### H.2 Comprendre avant de voter (Moreen) : décisions du 2026-10-14

- **« Je ne sais pas » remplace « Neutre »** au milieu de l'échelle des propositions : −2 Impossible, −1 Contre, « Je ne sais pas », +1 Pour, +2 Parfait.
  - Ce vote ne compte pas dans le score : ni dans la somme, ni dans le maximum. Il ne compte pas non plus pour être « classé » (2 propositions notées).
  - La valeur stockée reste `0`, donc pas de migration : les anciens « Neutre » deviennent « Je ne sais pas ».
  - La question ne revient pas dans la file ; l'avis reste modifiable dans Explorer et en fin de série.
  - À adapter : `votes.ts` (libellé, sans signe ni couleur d'échelle), `scoring.ts` et ses tests, onboarding, Classement (« N questions sans avis »), README, PRODUCT.md, DESIGN.md, le site (échelle, calcul).
  - Scrutins : les 3 choix Contre, Abstention, Pour ne changent pas (voir question 4).
- **Pas de sigle dans ce qu'on lit à l'aveugle** (`titre`, `question`) : la mesure est écrite en clair et précise dès la question. Si un détail manque, il va dans `contexte` (proposition) ou `enjeu` (scrutin).
  - Exception validée : une courte liste de mots du quotidien (TVA, SMIC, RSA, SNCF, RATP, EDF, IVG).
  - **Glossaire automatique** : tout sigle présent sur la feuille, même autorisé, est expliqué dans une section « Glossaire » en bas d'« En savoir plus », affichée seulement s'il y en a un. Source : `data/glossaire.json` (sigle, forme développée, une phrase), contrôlée au build : un sigle absent du glossaire bloque.
  - Un sigle garde sa forme développée à côté s'il aide à se repérer (« l'accord de libre-échange avec le Canada (CETA) »).
  - Le build signale tout sigle hors liste (`checkPlainLanguage`), comme `checkAnonymous`. Environ 19 aujourd'hui : CETA, ZAN, SRU, OQTF, RIC, PFAS, PAC, EPR, OTAN, ISF...
  - `prop-fa-6` : expliquer TAFTA dans `contexte` (projet d'accord de libre-échange entre l'Union européenne et les États-Unis, abandonné en 2016).
  - Règle à ajouter dans CONTRIBUTING.md et dans les skills `collecter-donnees` et `verifier-donnees`.
- **Feuille de Voter** :
  - visibles : le titre et la citation (proposition), la question (scrutin) ;
  - « En savoir plus » déplie sur place, caché par défaut, le glossaire en premier puis le `contexte` (proposition) ou l'`enjeu` (scrutin) ;
  - **plus aucun lien vers la source dans Voter** : la source peut révéler l'auteur (site de campagne, PDF du parti). Elle reste dans Explorer, la fiche candidat et l'onglet Lois, avec « Signaler une erreur » ;
  - la feuille « Source et contexte » de Voter disparaît.
  - Le site suit : « Voir la source et le contexte » devient « En savoir plus » dans la mini feuille, et « La source et le contexte restent à un geste » est réécrit.

### H.3 Typographie (Marion) : décision du 2026-10-14

Une vraie charte : des polices auto-hébergées, réutilisables et partagées par l'app et le site.

- **Licence** : SIL Open Font License 1.1 (OFL) en priorité, sinon CC BY 4.0 ou Apache 2.0. Ces licences autorisent l'auto-hébergement, l'intégration dans l'app et la redistribution, à condition de livrer le fichier de licence avec la police. On ne vend pas la police seule.
- **Pas de nom réservé (Reserved Font Name)**, de préférence : on peut alors réduire la police aux caractères utiles (subsetting) sans devoir la renommer.
- **Exclues** :
  - Marianne (identité de l'État, l'air gouvernemental est rejeté) ;
  - les licences « gratuites » maison (Fontshare, licences de fonderies), plus restrictives ;
  - Google Fonts en CDN (requête tierce). Le même fichier téléchargé depuis le dépôt officiel et hébergé chez nous convient.
- **Pistes à comparer** (licences vérifiées le 2026-10-14 dans `google/fonts` et sur luciole-vision.com : toutes OFL 1.1 sans nom réservé, sauf Source Sans 3, nom réservé « Source », et Luciole, CC BY sans version indiquée, 2 graisses seulement) :
  1. **Éditorial, chaleureux** : Fraunces (titres, OFL) et Source Sans 3 (texte, OFL). Un serif doux de journal, très lisible en grand.
  2. **Percutant, français** : Bricolage Grotesque (titres, OFL) et Luciole (texte, CC BY 4.0). Luciole est une police française conçue pour les personnes malvoyantes.
  3. **Cahier annoté** : Literata (titres, OFL), Atkinson Hyperlegible Next (texte, OFL, à confirmer) et une écriture manuscrite (Caveat, OFL) réservée aux annotations du lecteur (« Votre avis », « Dernier vote »).
- **Méthode** : page d'essai (spécimen) des 3 pistes sur de vrais écrans (feuille de Voter, Classement, accroche du site), choix, puis impeccable `typeset` sur l'app (`expo-font`, fichiers dans `assets/fonts/`) et le site (woff2 dans `public/fonts/`, `font-display: swap`). Crédits et licences dans `src/constants/credits.ts` et le README du site.
- Mise à jour de DESIGN.md (app et site) : la règle « police système » est remplacée.

### H.4 Site plus clair, moins générique (Moreen)

- Un exemple suivi de bout en bout, avec de vraies données : 3 notes et 1 scrutin, puis le Classement qui en sort, puis la fiche d'un candidat (anonyme).
- Une FAQ courte, avec les vraies questions des testeurs : « Combien de temps ? », « Et si je ne comprends pas une mesure ? », « Pourquoi tel candidat n'y est pas ? », « Qui vérifie les données ? ».
- Réécrire les textes trop lisses : moins de slogans et d'énumérations par trois, des phrases concrètes. Méthode impeccable `clarify`.
- La colonne « 2. Noter de −2 à +2 » affiche une note tirée au hasard (« Votre avis : Parfait +2 ») : la rendre neutre ou cliquable, comme l'essai du geste.
- Refaire tester par Moreen.

### H.5 Candidats

- Écrire le critère d'entrée dans PRODUCT.md et CONTRIBUTING.md (candidature déclarée et sourcée), l'afficher sur le site et dans l'app.
- Faire la liste des candidatures déclarées à date, puis ajouter les manquantes avec `collecter-donnees`.
- **Recensement du 2026-10-14** (sources LCP et Public Sénat du jour, presse citée par Wikipédia, URL à rouvrir une par une avant tout ajout) :
  - à corriger : Hélène Thouy remplacée par Mira Markovic (Parti animaliste, 02/10/2026) ; Jean Lassalle seulement pressenti (cagnotte, décision « à l'automne ») ; François Ruffin candidat sous condition ;
  - en suspens : Marine Tondelier (vote des Écologistes du 10 au 13/12/2026), Marine Le Pen (pourvoi en cassation) ;
  - déclarés ou désignés, absents de l'app : Delphine Batho, Karim Bouamrane, Anasse Kazib, Selma Labib, Florian Philippot, Xavier Bertrand, Olivier Becht, Gilles Platret, Natacha Polony, Francis Lalanne, Sylvain Durif, Clara Egger, Benoît Mathieu, Manolo Mlekuz ;
  - non confirmés : Bernard Cazeneuve, Juan Branco, Jean-François Legendre, Jean-Michel Fauvergue.

### H.7 Fiabilité du score (retour du 2026-10-14)

Un score de 75 % sur 2 propositions ne vaut pas un 75 % sur 5 propositions et 8 scrutins. On montre sur combien d'éléments repose chaque score.

- **Éléments** : une proposition notée ou un vote personnel au Parlement compte 1, un vote de groupe compte ½ (comme dans le score). « Je ne sais pas » et les scrutins où le candidat ne siégeait pas ne comptent pas.
- **Trois niveaux**, pour un candidat classé : fragile (moins de 3 éléments), assez sûr (3 à 4,5), fiable (5 et plus).
- **Neutralité** : chaque candidat a 6 propositions, donc tout candidat peut devenir « fiable » avec son seul programme. Les scrutins y mènent plus vite, sans jamais pénaliser un candidat qui ne siège pas.
- **Où** :
  - bilan de Voter : les 17 panneaux se remplissent au tiers, aux deux tiers ou en entier selon le niveau ; la légende compte les scores fiables ;
  - Classement : une petite jauge de 3 traits sous le score de chaque panneau, avec le niveau en toutes lettres ;
  - fiche candidat : le niveau et son détail (« 4 propositions et 3 scrutins, dont 2 votes de groupe comptés à moitié »).
- Le mot « cohérence » est écarté : il ferait croire qu'on juge la cohérence du candidat entre ses promesses et ses votes.

### H.8 Icônes des onglets (retour du 2026-10-14)

Les 4 icônes ne se ressemblent pas : sur le web, 3 viennent d'Ionicons (trait) et Lois de Material Community (plein) ; sur mobile, ce sont des symboles système. Avis de l'utilisateur : Explorer est parfaite (à garder), Lois correcte, Voter trop simple, Classement mal finie.

- **Un seul jeu**, dans le style d'Explorer (Ionicons `library-outline`, licence MIT) : grille 512, trait de 32, bouts et angles arrondis, coins de 16, aucun aplat.
  - Explorer : `library-outline`, inchangée ;
  - Classement : `podium-outline` d'Ionicons, même famille ;
  - Voter : un surligneur à pointe biseautée qui signe, dessiné dans ce style (une urne a été essayée : trop proche du podium de Classement) ;
  - Lois : une balance dessinée dans ce style, à la place de celle de Material Community.
- **Fichiers** : sources SVG dans `assets/icons/tabs/`, PNG en 1x, 2x et 3x générés depuis les SVG, utilisés partout : `src` des onglets natifs (teinte du système) et image teintée sur le web. Plus de mélange de bibliothèques.
- **Méthode** : socle qualité impeccable (« icônes dessinées, d'une bibliothèque ou en SVG, d'un seul trait et d'une seule graisse »), contrôle à la taille réelle (22 px) et en grand.

### H.9 Trait vivant (retour du 2026-10-14)

Le trait du bouton de vote tombe toujours au même endroit, avec le même angle : ça fait tampon, pas surligneur. Le titre surligné est trop régulier aussi.

- **Bouton de vote** (`vote-scale.tsx`, et la démo du site) :
  - toujours de gauche à droite ;
  - forme tirée au hasard à chaque vote : horizontale, diagonale, ondulée ou diagonale ondulée ;
  - hauteur, angle et point de départ variables ;
  - parfois, le trait dépasse un peu du bouton, comme un vrai geste.
- **Texte surligné** (`marked.tsx`, et `.mark` sur le site) : légère ondulation aléatoire, par portions (droit sur 1 cm, puis un peu ondulé), sans trop dépasser du texte.
- **Règles** :
  - le texte reste lisible ;
  - la forme est stable pour un même vote : elle ne change pas à chaque rendu ;
  - « Réduire les animations » garde l'état final, sans geste.
- **Méthode** : `animate` impeccable ; tracé en SVG avec `react-native-svg` (absent aujourd'hui : à ajouter par `npx expo install`, ou formes en `View` si suffisant).

### H.10 Bug : le fond noir de la feuille glisse (retour du 2026-10-14)

Avec « En savoir plus », la feuille s'ouvre, et son voile noir monte depuis le bas avec elle : c'est laid. Le voile doit apparaître en fondu, sur place ; seul le panneau glisse.

- **Cause probable** : `src/components/ui/sheet.tsx`, branche Android et web, `Modal animationType="slide" transparent` qui fait glisser tout le contenu, voile compris (`styles.backdrop`).
- **Piste** : `Modal animationType="none"` (ou `fade`), puis voile en fondu et panneau en glissement par Reanimated ; « Réduire les animations » : apparition directe. iOS (`pageSheet`) n'est pas concerné.
- **À vérifier** : toutes les feuilles qui utilisent `Sheet` (Voter, Lois, Explorer), sur le web et Android.

### H.6 Cadre juridique, avant toute sortie publique (Moreen)

Ce n'est pas un avis juridique : à faire relire par un avocat (droit de la presse et droit électoral) avant la sortie.

- **Déjà en place** : citation exacte et sourcée pour chaque proposition, votes tirés de l'open data officiel, aucune consigne de vote, bouton « Signaler une erreur ».
- **Mentions légales** sur le site et dans l'app (identité de l'éditeur, hébergeur).
- **Page « Méthode et corrections »** : règles de sélection, délai de correction annoncé, contact pour un droit de réponse des candidats et des partis.
- **Titres fidèles** : le titre résume la citation sans la déformer ; ajouter ce contrôle au skill `verifier-donnees`.
- **Période électorale** : vérifier les règles applicables (ARCOM, temps de parole, sondages) avec l'avocat.

## G. Méthode : skill impeccable

Toute la partie interface passe par le skill `impeccable` (`.claude/skills/impeccable/`), dans le monde déjà validé du « cahier annoté » (`DESIGN.md`, `.impeccable/surfaces/src-app-tabs-index-tsx.md`). On l'enrichit, on ne le remplace pas.

| Étape | Commande impeccable | Cible |
| --- | --- | --- |
| Avant de coder un lot d'interface | `shape` | feuille « Scrutin », hémicycle, sélecteur de surligneur, blocs du site |
| Animation du vote (V) et hémicycle (A.2) | `animate` | `src/app/(tabs)/index.tsx`, `vote-scale.tsx` |
| Choix du surligneur (B.3) | `onboard` | `src/app/onboarding.tsx` |
| Palette et site plus coloré (B.2, D.2) | `colorize` | `src/constants/theme.ts`, `elire-website/src/styles/global.css` |
| Textes (questions des lois, messages « n'a pas siégé ») | `clarify` | écrans Voter, Classement, fiche |
| Cas limites (migration, Réduire les animations, double clic, petit écran) | `harden` | store, Voter |
| Contraste des 4 surligneurs, cibles tactiles, lecteur d'écran | `audit` (référence native pour l'app) | app et site |
| Finition de chaque lot | `polish` | écrans modifiés |
| Mise à jour du système | `document` | `DESIGN.md` de l'app et du site |

- Lancer `impeccable context --target <fichier>` une fois par session, comme le demande le skill.
- Une seule passe de vérification par lot : captures mobile et desktop (web), iOS et Android (natif), corrections groupées, une confirmation, puis on s'arrête.
- Garde-fous du brief à rappeler à chaque commande : pas d'air gouvernemental, pas de gamification, pas de cartes à swiper, pas de violet, thème clair uniquement, couleur vive réservée aux marques du lecteur.

## Questions ouvertes

1. ~~Pondération des votes de groupe~~ : validé, 0,5.
2. ~~Score combiné ou séparé~~ : validé, un seul score combiné ; le détail est sur la fiche candidat.
3. ~~Où changer de surligneur~~ : dans Classement, au-dessus de « Réinitialiser mes votes ».
4. ~~Abstention de l'utilisateur~~ : validé le 2026-10-14, elle ne compte pour aucun candidat (ni score, ni fiabilité), comme « Je ne sais pas » ; l'abstention d'un candidat reste à 0.
5. ~~Résultat du scrutin~~ : validé le 2026-10-14, juste après le vote (titre officiel, adopté ou rejeté) et dans Lois ; la suite part seule au bout de 5 s (filet qui se remplit), « Question suivante » pour aller plus vite, rien d'automatique avec un lecteur d'écran natif.
6. ~~« Je ne sais pas »~~ : validé, remplace « Neutre », ne compte pas, ne revient pas dans la file.
7. ~~Contexte sur la feuille~~ : validé, caché par défaut, déplié par « En savoir plus » ; aucun lien vers la source dans Voter.
8. ~~Typographie~~ : validé, polices auto-hébergées sous licence libre ; choix parmi les pistes H.3.
9. ~~Sigles autorisés~~ : validé, la liste du quotidien est gardée, et chaque sigle est expliqué dans le glossaire d'« En savoir plus ».
10. ~~Typographie~~ : validé, piste 3 (Literata, Atkinson Hyperlegible Next, Caveat).
