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

### A.4 Stockage

`src/store/votes-store.ts` passe en version 2 avec migration :

```ts
interface Mark { value: VoteValue | LoiVote; marker: MarkerId; at: number }
interface PersistedState {
  votes: Record<string, Mark>;   // ids de propositions et de lois
  order: string[];
  onboardingSeen: boolean;
  marker: MarkerId;              // surligneur actif (B)
}
```

- Migration de la v1 : `votes[id] = { value, marker: 'jaune', at: 0 }`.
- `resetVotes` efface aussi les votes sur les lois ; `reconcileOrder` gère les deux types.

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
  - Par défaut, un surligneur est tiré au hasard à la première visite, pour que le site ne soit pas seulement jaune.
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

0. **Animation du vote** (V) : indépendante, livrable tout de suite en jaune.
1. **Données** : champ `question` sur les 26 lois et schéma Zod. Petite PR, sans risque.
2. **Score** : `scoring.ts` et ses tests, sans interface.
3. **Store v2** : migration et marqueur par vote, avec tests de migration.
4. **Voter** : feuille Scrutin, 3 choix, intercalage dans l'ordre.
5. **Hémicycle** : animation et prise en compte de « Réduire les animations ».
6. **Classement et fiche** : score combiné dans le Classement, détail sur la fiche, message « n'a pas siégé ».
7. **Surligneur** : palette, onboarding, réglage, `marked.tsx`.
8. **Nouveaux scrutins** : par lots, chacun vérifié.
9. **Site web** : contenu (D.1), surligneurs (D.2), documentation (D.3).
10. **Documentation de l'app** (E) et `document` impeccable.

Chaque lot d'interface suit la méthode G et se termine par `npm run check` (app) ou `npm run check` du site.

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
3. Où changer de surligneur après l'onboarding : écran Voter, récapitulatif, ou un petit écran « Réglages » ?
4. L'abstention de l'utilisateur doit-elle compter 0 pour tous les candidats (proposé), ou ne rien compter, comme « Passer » ?
5. Faut-il afficher le résultat du scrutin (adopté ou rejeté) après le vote, ou seulement dans l'onglet Lois ?
