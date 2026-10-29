# Tourner la page : revenir sur la question précédente, la vraie page derrière la gomme, précisions

Demandes du 2026-10-29. Branche `feat/updates`.

Légende : **[Danny]** = demandé tel quel, **[Proposition]** = ma proposition, pas encore validée, **[À trancher]** = Danny décide avant la suite, **[Décidé]** = validé ensemble, **[Fait]** = dans le code.

| Lot | Sujet | État |
| --- | --- | --- |
| 1 | Passe sur les précisions : titres et contextes trop secs | [Décidé] |
| 2 | Graphie du parti de Delphine Batho : celle de Wikipédia | [Décidé], rien à changer dans les données |
| 3 | Voter : glisser pour revenir sur la question précédente, une seule fois | [Fait], à tester sur téléphone |
| 4 | Voter : la page du cahier se tourne à chaque vote | [Fait], à essayer sur téléphone |
| 5 | Gomme : la vraie page de la question, pas seulement l'échelle | [Fait], page aveugle dans Voter, à tester sur téléphone |
| 6 | Suites de la critique impeccable des lots 3 et 4 (29/40) | [Décidé], en cours |

Ordre conseillé : 2 (rien à coder), 4, puis 3 (le geste de retour s'appuie sur l'animation), 5, et 1 (données) en parallèle.

---

## 1. Passe sur les précisions

**[Danny]** Les phrases dont la précision n'est pas bien expliquée : souvent peu de contexte. Voir ses derniers changements.

Ce que Danny a corrigé à la main dans `dccd1ba` (titres lus à l'aveugle) :

| Avant | Après |
| --- | --- |
| Retirer les troupes françaises déployées à l'étranger | ... déployées à l'étranger **et les rapatrier en France** |
| Dissoudre les corps spéciaux de police | Dissoudre les corps spéciaux **de la police en France** |
| Laisser les chefs d'établissement recruter leurs enseignants | Laisser **chaque** chef d'établissement recruter **lui-même** les enseignants **de son école** |
| Réserver 80 % des achats des cantines ... | Réserver aux producteurs français **jusqu'à** 80 % des commandes publiques, dont les cantines |

Le point commun : le titre ne se comprend pas seul. On ne sait pas où, qui décide, ni l'ampleur.

**Critères de la passe** [Décidé], à ajouter à la règle 13 de `CONTRIBUTING.md` une fois validés :

1. **Où et qui** : le titre dit qui agit et sur quel périmètre (« en France », « chaque école », « l'État »), quand ce n'est pas évident.
2. **L'ampleur** : un chiffre a sa base (net ou brut, par mois, d'ici quand, « jusqu'à »).
3. **Le mot seul** : un terme métier (corps spéciaux, surtransposition, ZAN) est soit dit en clair, soit dans `data/mots.json` pour l'onglet Glossaire.
4. **L'onglet Précisions** (`contexte`) apporte les modalités absentes du titre, pas seulement la page. Exemple : `prop-mt-5` n'a que « Programme 2027, p. 21. ».
5. **Scrutins et questions communes** : `enjeu` dit ce que le texte change concrètement, pas seulement son nom.
6. **Garde-fou** : la règle 6 (titre fidèle) prime. On précise ce que la source dit déjà ; on n'ajoute ni chiffre, ni portée, ni condition qu'elle ne contient pas.

**Méthode** : skill `verifier-donnees`, candidat par candidat (196 propositions), puis les 42 scrutins et les 17 questions communes. Je propose les réécritures dans un tableau avant / après, Danny valide, puis j'écris dans les CSV et JSON et je lance `npm run build:data:strict`. Un premier scan mécanique ne suffit pas (1 seul titre sous 45 caractères, 11 contextes sous 130) : c'est une relecture, pas un compteur.

## 2. Graphie du parti de Delphine Batho

**[Danny]** Celle de Wikipédia.

**[Décidé]** « Génération écologie », minuscule à « écologie ». C'est déjà la graphie de `data/partis.json` (`generation-ecologie`) et de la biographie dans `data/candidats.json` ; aucune autre graphie dans le dépôt. Retiré de `todo.md`.

## 3. Voter : revenir sur la question précédente

**[Fait]** `src/app/(tabs)/index.tsx` (geste, état `over`), `src/lib/page-turn.ts` (`previousQuestion`, `pageTurnSettles`, testés), action d'accessibilité portée par le titre (`titleActions` dans `PropositionSheet`, `SweepText`, `GlossaryText`). Écarts avec ce qui suit :

- La page ramenée se pose **par-dessus** la question en cours (calque absolu), qui reste montée dessous et cachée : le retour avant n'a rien à recharger. La zone grandit à la hauteur de la page ramenée pour qu'elle défile.
- Le bord de la page suit le doigt (angle calculé par `acos` de la distance), pas une rotation linéaire.
- Pas de glissé sur le web, même au toucher : la souris sélectionnerait le texte. Flèche gauche pour revenir, flèche droite pour repartir.
- Pas d'exclusion de la rangée d'onglets de « En savoir plus » : elle ne défile plus à l'horizontale (tiroirs verticaux depuis le lot 5 des corrections).
- Retour bloqué aussi quand la feuille de la gomme est ouverte.
- Même réponse ou glissé inverse : son de page, pas de nouvelle fête.
- Relecture impeccable (2026-10-29), corrigé : le glissé ne s'annule plus en route (id stable, page à moitié revenue retirée si le geste est annulé) ; scrutin et question commune ramenés dans leur état révélé, sans tampon rejoué ; « A voté ! » caché sans être démonté ; « Réduire les animations » activé en cours de route ; flèches seulement quand Voter est à l'écran, hors champ et sans touche de modification (l'échelle de vote a été réincluse en 6.4).
- Ajouts de la relecture : **retour Android** (`BackHandler`) qui fait le cran s'il est possible, sinon le comportement habituel (une question ramenée puis retour = on quitte, comme avant : pas de boucle) ; **focus du lecteur d'écran** sur le titre de la page visible après un retour ou un départ.


**[Danny]** Après un vote, on ne voit pas toujours que la question a changé. Les gens veulent revenir dessus et essaient de glisser, sans penser à la gomme « A voté ! » en bas. Glisser sur la page Voter ramène à la question précédente, avec le vote déjà posé. Une seule fois. Rien dans le tuto, l'onboarding ni les astuces.

**[Décidé] Le sens du geste.** « Swiper à gauche » peut vouloir dire le doigt qui part vers la gauche, ou le geste de retour habituel (le doigt part du bord gauche vers la droite). Retenu : **doigt de gauche à droite** : c'est le « retour » d'iOS et d'Android, et avec le lot 4 la page tourne vers la gauche en avançant, donc on la ramène vers la droite.

**Comportement** [Proposition] :

- La cible du retour est la dernière question votée, déjà gardée dans `lastId` (`src/app/(tabs)/index.tsx`). Elle reste disponible jusqu'au vote suivant, même après la disparition de « A voté ! » (10 s).
- La question revient avec votre vote tracé sur l'échelle, comme pendant le geste de vote (`stroke`). Les boutons restent actifs.
- Toucher une autre réponse remplace le vote (`castVote` ou `castLoiVote`) et repart vers la question en cours, avec l'animation normale. Toucher la même réponse, ou glisser dans l'autre sens, revient sans rien changer.
- **Une seule fois** : sur la question ramenée, le geste de retour ne fait rien. `lastId` reste celui de la question ramenée tant qu'on n'a pas voté une nouvelle question.
- Scrutin ou question commune ramené : la feuille revient dans son état révélé (hémicycle, ou « qui pense comme vous »), échelle active. Un nouveau vote rejoue la révélation puis « Question suivante ».
- Désactivé sur la carte de pause, sur l'écran de fin, pendant le geste de vote (`hold`), pendant une révélation et pendant le tuto.

**Contraintes techniques** :

- `Gesture.Pan()` de `react-native-gesture-handler` (déjà utilisé dans `ui/sheet.tsx` et `onboarding.tsx`), `activeOffsetX` autour de 24 pt et `failOffsetY` pour laisser le défilement vertical gagner.
- **Bord gauche sur Android** : la navigation par gestes y capte le retour système (qui quitterait l'onglet). Le geste démarre hors des 24 pt du bord.
- La rangée d'onglets de « En savoir plus » défile à l'horizontale quand la police est agrandie : le geste ne démarre pas dessus.
- Textes sélectionnables : vérifier sur Android qu'un appui long puis un glissé sélectionne toujours.
- Web : pas de glissé à la souris. La gomme suffit ; flèche gauche du clavier en bonus, non annoncée.
- Lecteur d'écran : le geste n'existe pas pour lui. Action d'accessibilité « Revenir à la question précédente » sur la feuille (`accessibilityActions`), découvrable par le rotor mais non annoncée dans le tuto.

**Tests** : la logique « quelle question ramener, et est-ce permis » en fonction pure dans `src/lib/` (testée) : retour permis seulement si `lastId` existe, différent de la question affichée, et pas déjà ramené.

## 4. Voter : la page du cahier se tourne

**[Fait]** Composant `Page` dans `index.tsx`, constante `PAGE_TURN` (à faux : l'ancienne remontée vers « A voté ! »). La page votée change de place sans être recréée (même clé dans le même parent) : son trait, ses onglets ouverts et l'hémicycle d'un scrutin tournent avec elle. Écarts avec ce qui suit :

- Perspective 2000 au lieu de 1200 : à 1200, la page grossissait au point de sortir par le haut de la zone de défilement (vu en web à −55°).
- Rotation jusqu'à −90° (la page de profil) puis effacée, pas −100°.
- Pas d'ombre sur la page du dessous : seules les feuilles de la page qui tourne prennent un voile d'encre (14 % au plus, `PageVeil`), jamais les marges ni le cadre d'une question commune, pour rester dans la règle du cahier plat.
- La zone garde la hauteur de la page qui tourne quand elle est plus haute que la suivante : la page ne saute plus en cours de tour.
- Pendant le tour (420 ms), un toucher sur l'échelle de la question suivante est ignoré.


**[Danny]** Essayer une animation de page de cahier qui se tourne à chaque vote. Elle expliquerait aussi qu'on peut revenir en arrière.

**Aujourd'hui** : la feuille votée remonte vers « A voté ! » en s'effaçant (`Leaving`, 320 ms), la suivante entre en fondu ; son `feuille` au départ.

**[Décidé]** Rotation 3D de la feuille autour de son bord gauche, comme la reliure d'un cahier :

- `rotateY` de 0 à -100° avec `perspective` (Reanimated, sur le fil UI), environ 420 ms, accélération en sortie.
- Ombre qui grandit sur la page du dessous pendant la rotation, puis disparaît ; la nouvelle question est déjà dessous, sur le même papier Seyès (pas de fondu).
- Le son `feuille` colle déjà au geste.
- Le geste du lot 3 pilote la même rotation à l'envers, au doigt : la page suit le doigt, se rabat au-delà d'un tiers de la largeur, revient sinon.
- Même animation pour les trois types (proposition, scrutin après « Question suivante », question commune), à la place de `Leaving` et de `loiLeaving`.
- « Réduire les animations » : remplacement direct, sans rotation, comme aujourd'hui.
- Écarté : une vraie page qui se courbe (coin qui se plie). Il faudrait `react-native-skia` et des shaders : une dépendance native lourde pour un essai.

**Points à surveiller** :

- `backfaceVisibility: 'hidden'` et `perspective` se comportent différemment sur Android ; à voir sur un téléphone d'entrée de gamme (cf. `docs/feature-20261019-android-opti.md`).
- « A voté ! » apparaît aujourd'hui là où la feuille remonte : avec une page qui tourne, il entre simplement en bas, sans lien de mouvement avec la feuille. À juger sur téléphone.
- **Essai** : une constante `PAGE_TURN` dans `index.tsx` pour comparer avec l'animation actuelle, retirée une fois la décision prise.

## 5. Gomme : la vraie page de la question

**[Danny]** Toucher la gomme devrait montrer la vraie page, comme dans Explorer ou Scrutins : on veut plus d'infos même après avoir voté. Pour les questions communes, proposer quelque chose.

**Aujourd'hui** : `EditVoteSheet` n'affiche que le titre, la citation (ou l'enjeu) et l'échelle.

**Incohérence** : la page d'Explorer montre l'auteur, et celle de Scrutins les votes des candidats avec leur nom. Les montrer juste après le vote, pendant qu'on vote encore, casse le vote à l'aveugle : on apprend vite à reconnaître le style d'un candidat.

Options pesées le 2026-10-29 :

- **A. Page complète en mode aveugle, dans la feuille** : tout sauf les noms (contexte, précisions, glossaire, sources, hémicycle). On reste dans Voter.
- **B. Feuille actuelle et bouton vers Explorer** : quitte l'onglet Voter (le rythme se perd, il faut revenir), et montre l'auteur.

**[Décidé]** A. Ce que les gens cherchent après le vote, c'est le fond (contexte, sources), pas le nom : un seul trait de la page. La page avec les noms reste partout ailleurs (Cahier, écran de fin, fiche candidat), où les noms sont déjà visibles.

**Contenu** [Décidé], même feuille `EditVoteSheet`, titre « Votre vote » :

- **Proposition** : titre, citation, votre vote (échelle), puis `PropositionDetail` en mode `anonymous` (déjà là : contexte, type de source, « Ouvrir la source », « Signaler une erreur ») et les onglets `MoreInfo` (Contexte, Précisions, Glossaire, Liens et sources).
- **Scrutin** : question, votre vote, puis `LoiDetail` avec un nouveau mode `anonymous` : résumé, nature, chambre, date, statut, l'hémicycle sans nom (déjà vu après le vote), la source ; la liste des candidats par position seulement hors Voter.
- **Question commune** (validé par Danny) : la question, l'enjeu, votre vote, puis `EnjeuReveal` (« qui pense comme vous » et chaque mesure sans nom, déjà affiché après le vote), et les onglets `MoreInfo` (Contexte s'il y a un repère, Glossaire, Liens qui listent déjà les sources des mesures sans nom). Chaque mesure se touche pour ouvrir sa fiche `PropositionDetail` anonyme (citation, contexte, source). Hors Voter, le bloc `SharedQuestion` avec les noms.
- Ordre dans la feuille : le texte, l'échelle, puis le détail. Voter ferme toujours la feuille après la petite fête (650 ms) ; on lit avant, on vote si on veut.
- L'exemple de l'onboarding (`example`) ne change pas.

**À vérifier** : la feuille devient longue, elle doit défiler (`Sheet`) ; un onglet ouvert fait défiler jusqu'à lui, comme sur Voter (`measureLayout`).

**[Fait]** (2026-10-29) :

- `EditVoteSheet` prend une prop obligatoire `blind` : `true` dans Voter (et l'exemple de l'onboarding, qui n'en tient pas compte), `false` sur l'écran de fin. Ce sont les trois seuls appels ; Cahier, Lois, Explorer et la fiche candidat modifient le vote par la ligne « Moi ».
- Une page par sorte (`PropositionPage`, `LoiPage`, `EnjeuPage`), remise à zéro à chaque question ; un mot souligné du texte ouvre le Glossaire.
- `PropositionDetail` et `LoiDetail` prennent `underVote` (ni le texte ni la ligne « Moi », déjà au-dessus) ; `LoiDetail` prend `anonymous` (l'hémicycle sans nom à la place des positions). `SharedQuestion` est exporté, avec `withQuestion`.
- Question commune : chaque mesure de `EnjeuReveal` (prop `onOpen`) se touche, avec un chevron, et ouvre sa fiche anonyme dans une seconde feuille, titrée par son numéro.
- La feuille défile jusqu'au tiroir ouvert (`useSheetReveal`), sans dépasser son haut s'il est plus grand qu'elle (`revealOffset`, `src/lib/sheet-reveal.ts`, testé).
- À l'aveugle, « Ouvrir la source » ne nomme plus le site (souvent celui du parti), qui reste dans l'aide d'accessibilité.

**Écarts avec la spec** :

- Titre « Votre vote » ; l'exemple de l'onboarding garde « Modifier votre vote ».
- Proposition : pas de tiroir Précisions, il redirait le contexte de la fiche juste au-dessus.
- Scrutin : la question seule en haut (l'enjeu passe dans Précisions, comme dans Voter) ; les tiroirs `MoreInfo` sont ajoutés, comme sur les deux autres sortes.
- Question commune : pas de tiroir Précisions (les mesures sont dessous), sauf après « Je ne sais pas » à l'aveugle, où `EnjeuReveal` ne les liste pas. Hors Voter, `SharedQuestion` remplace `EnjeuReveal`, sans redire la question.

**Incohérences tranchées par Danny le 2026-10-29** [Fait] :

- Dans Voter, la fiche ouverte depuis l'hémicycle d'un scrutin était `LoiDetail` avec les noms des candidats (décision du 2026-10-16) : elle passe en mode `anonymous` (`LoiBallot`). Les noms restent dans Lois, le Cahier et la fiche candidat.
- « Liens et sources » d'une question commune écrivait le site de chaque mesure (par exemple `resistons-france.fr`) : il n'écrit plus que le type de source, le lien reste cliquable, dans Voter comme dans la gomme. Plus aucun site de source affiché à l'aveugle (seul reste « Ouvrir le scrutin officiel · assemblee-nationale.fr », qui ne dit rien d'un candidat).
- Mesures serrées sur iPhone SE : dans `EnjeuReveal`, la marque « comme vous » passe sur la ligne du type de source, le titre prend toute la largeur (chevron à droite quand la mesure se touche). Même mise en page dans Voter, par cohérence.

**À tester sur téléphone** : la seconde feuille par-dessus la première (pageSheet iOS, Modal Android), le défilement jusqu'au tiroir ouvert, la fermeture 650 ms après le vote, et le lecteur d'écran sur les mesures touchables.

---

## 6. Suites de la critique impeccable (lots 3 et 4)

Critique du 2026-10-29 : 29/40 (« Bon »), rapport dans `.impeccable/critique/2026-10-29T14-01-25Z__src-app-tabs-index-tsx.md`. Le mouvement est jugé propre au produit ; le point faible est le mode retour, sans état ni sortie visibles.

**[Décidé]** Danny : traiter les 5 problèmes prioritaires, sortie visible en premier, un repère affiché sans annoncer le geste.

| Étape | Commande | Contenu | État |
| --- | --- | --- | --- |
| 6.1 | `/impeccable clarify` | Sortie visible du mode retour | [Fait] |
| 6.2 | `/impeccable harden` | Clic de vote en web, retour Android | [Fait], le clic n'était pas cassé |
| 6.3 | `/impeccable animate` | Fondu en mode réduit, coins côté reliure | [Fait] |
| 6.4 | `/impeccable audit`, puis `harden` | Clavier et lecteur d'écran sur le web | [Fait] |
| 6.5 | `/impeccable polish` | Passe finale | [Fait] |

### 6.1 Sortie visible du mode retour (P1)

Sur la question ramenée, « A voté ! » est remplacé par une ligne d'état discrète :

- « Question précédente » en graphite (13) ;
- un lien de 44 pt « Revenir à la question en cours », qui fait repartir comme la flèche droite.

C'est un état affiché, pas une astuce : le geste d'entrée n'est toujours annoncé nulle part (tuto, onboarding, astuces).

**[Fait]** `BackStatus` dans `index.tsx`, à la place de « A voté ! » (resté monté, caché hors du flux). Le lien est un bouton (il agit, il ne navigue pas) dont l'étiquette est son texte ; il appelle `goForward`. Tient sur une ligne à 375 pt (46 pt de haut, marges resserrées) ; police agrandie, la sortie passe dessous plutôt que d'être coupée. Même entrée que « A voté ! » (montée de 16 pt), fondu en mode réduit.

### 6.2 Robustesse (P1 et P2)

- **Clic de vote en web** : pendant la critique, le clic simulé sur « Pour » n'a rien enregistré à deux reprises, alors qu'un `element.click()` passait. À reproduire à la main dans Chrome en mode mobile. Si le bug se confirme, le geste est coupé complètement sur le web (aucun gestionnaire de toucher posé).
- **Retour Android sur la page ramenée** : il fait repartir vers la question en cours (`goForward`). Le retour suivant n'est plus intercepté jusqu'au prochain vote : pas de boucle retour / repartir, l'app peut toujours se fermer.

**[Fait]**

- **Clic** : reproduit dans un nouvel onglet Chrome, iPhone SE tactile émulé. Le clic de l'outil sur « Pour » **enregistre le vote** (`prop-ez-5: 1`), le geste n'est donc pas en cause : il reste posé (désactivé sur le web). Deux causes expliquent l'écart vu pendant la critique : (1) une astuce à l'écran pose un voile qui bloque les vrais clics, alors qu'`element.click()` passe outre (vu en vidant les astuces vues) ; (2) dans un onglet bridé (mesuré à 2 images par demi-seconde dans l'onglet de la critique, 61 par seconde dans le nouveau), la fin du tour n'arrivait pas, la page restait « en train de tourner » et les votes suivants étaient ignorés. Corrigé : minuteur de secours (`SAFETY_MS`, 200 ms après la durée du tour) qui retire la page qui tourne et pose la page ramenée, même sans images. Un second clic pendant la séquence du vote reste ignoré, comme prévu.
- **Retour Android** : `hardwareBack` dans `src/lib/page-turn.ts` (testé), état `spentFor` (le vote pour lequel le retour a déjà servi).

### 6.3 Animation (P2)

- **Réduire les animations** : un fondu de 150 ms entre deux questions, au lieu du remplacement direct. L'opacité reste permise en mode réduit, et le changement de question redevient visible.
- **Côté reliure** [Proposition] : coins carrés à gauche pendant le tour (ou filet de 1 px au bord gauche), pour que la page se lise moins comme une carte qui se retourne. À juger sur la capture.

**[Fait]**

- Fondu croisé de 150 ms (`FadeIn` et `FadeOut` en `ReduceMotion.Never`, sinon Reanimated les coupe aussi) : mesuré en web, l'ancienne question passe de 1 à 0 et la nouvelle de 0 à 1 en 150 ms environ. La question ramenée entre et sort de la même façon.
- Coins carrés côté reliure pendant le tour et pendant que la page revient (`bound` : feuille, voile, carte de l'hémicycle, détail d'une question commune) ; arrondis rendus une fois la page posée. Vérifié dans le DOM (rayon gauche à 0 de -36° à -90°). Choisi plutôt que le filet de 1 px : la feuille a déjà un filet, un second se confondait avec lui.
- **Écart** : pas de capture en plein tour. Le tour dure 420 ms, et la capture de l'outil arrive après ; l'angle a été relevé image par image (de -36° à -90° entre 700 et 950 ms après le clic, 61 images par seconde). À juger sur téléphone. Le contour tracé d'un scrutin garde ses coins arrondis (tracé SVG), invisible à cette vitesse.

### 6.4 Clavier et lecteur d'écran sur le web (P2)

- Flèches gauche et droite actives aussi quand le focus est sur l'échelle de vote (aujourd'hui `[role=radio]` est exclu).
- Zone d'annonce `aria-live` masquée : `announceForAccessibility` ne fait rien sur react-native-web, donc « Vote enregistré » et « Question précédente » ne sont pas lus.
- `accessibilityState={{ checked }}` sur les boutons de vote (aujourd'hui `selected`, `aria-checked` vide).
- Focus sur le titre de la page affichée (`tabIndex` -1 sur le web).
- `aria-hidden` sur la page du dessous (deux titres dans le DOM après un retour).

**[Fait]**

- Flèches actives sur l'échelle de vote (vérifié : focus sur « Pour », flèche gauche, la question revient).
- `src/components/live-region.tsx` : `announce()` (natif : `announceForAccessibility` ; web : zone `aria-live` masquée, montée dans Voter). Les cinq annonces de Voter y passent (« Vote enregistré », « Question précédente », « Scrutin réel du Parlement »).
- `checked` dans `accessibilityState` **et** `aria-checked` sur les deux échelles : react-native-web n'applique plus `accessibilityState` (vérifié : `aria-checked` restait vide avec le seul `accessibilityState`).
- Titre en `tabIndex` -1 sur le web et focus posé dessus après un retour ou un départ (vérifié). Pas d'anneau de focus sur ce titre (`[tabindex='-1']:focus-visible` dans `global.css`) : ce n'est pas une commande, l'anneau de 2 px encadrait tout le titre.
- La page du dessous était déjà en `aria-hidden` : l'arbre d'accessibilité n'expose qu'un titre après un retour (le DOM en garde deux, d'où le constat de la critique).

### 6.5 Passe finale

`/impeccable polish` sur l'écran Voter. `PAGE_TURN` et l'ancienne animation (`Leaving`, `loiLeaving`) restent tant que Danny n'a pas comparé sur téléphone ; on les retire après son choix.

**[Fait]** Défauts vus sur les captures et corrigés : ligne d'état coupée en deux puis tronquée sur iPhone SE (marges resserrées), anneau de focus sur le titre, `aria-checked` vide. `PAGE_TURN`, `Leaving` et `loiLeaving` gardés. Captures : `turn-55.png` (premier passage), `6-retour.png` (question ramenée), `6-reduit.png` (mode réduit), dans le dossier de travail de la session.

### Relecture finale de la section 6 (2026-10-29)

**[Fait]**

1. **Retour Android pendant un mouvement** : `hardwareBack` prend `moving` (page qui tourne ou revient, vote qui se pose, révélation d'une question ramenée) et renvoie `wait` : le retour est consommé, l'app ne se ferme plus sur une page à moitié tournée. Testé ; la règle « un cran, repartir, puis plus rien » reste.
2. **Son, vibration à la pose de la question ramenée** : un effet sur `back` les joue une fois, quel que soit le chemin (fin d'animation, minuteur de secours, mode réduit), et remet la page à plat (`turn.set(0)` annule une animation restée en route). `settleBack` ne fait plus que changer l'état : un appel tardif ne rejoue rien.
3. **Annonce après le focus** : « Question précédente » part de l'effet du focus, juste après lui. En natif, `announceForAccessibilityWithOptions(message, { queue: true })` (présente en RN 0.86). En mode réduit, focus et annonce attendent la fin du fondu (160 ms) : vérifié en web, une page encore en train d'apparaître ne prenait pas le focus.
4. **Échelles** : boutons avec `accessibilityState.selected` et `aria-pressed` au lieu de radios ; le groupe garde son étiquette (`role="group"`). Aucun test, tuto ni sélecteur ne visait le rôle radio (`marker-picker.tsx` garde le sien : vrai choix exclusif, sans flèches de page).
5. **Anneau de focus** : `data-focus-title` sur le titre, la règle de `global.css` ne vise plus que lui.
6. **`live-region.tsx`** : minuteur de 50 ms gardé, annulé avant chaque annonce et au démontage ; `speak` n'est remis à zéro que s'il est encore celui de cette instance.
7. **Mode réduit, retour** : la question en cours reste visible pendant le fondu de la page ramenée, puis se cache (vérifié en web : 1 pendant que la page ramenée passe de 0,22 à 1, cachée vers 200 ms).

**Écarts**

- Point 2 : pas de ref « déjà posé » ni de lecture du mode par ref. Le React Compiler (lint) refuse les refs lues depuis les rappels du geste ; l'effet sur `back` donne la même garantie (une fois par pose, rien pour un appel tardif).
- `turn.set(1)` dans le minuteur de `turnAway` : écarté. Lancé sans condition, il casserait un geste de retour commencé dans les 200 ms ; la page tournée est déjà retirée par `endTurn` et son animation ne rappelle rien d'autre.

### Écartés ou reportés

- « A voté ! » qui masque une partie de la ligne Glossaire sur iPhone SE : antérieur à ces lots, à reprendre à part.
- Plusieurs crans de retour, et page posée à gauche plutôt qu'effacée : questions ouvertes de la critique, rien de décidé.

## Vérifications avant de dire fini

`npx tsc --noEmit`, `npx expo lint`, `npm test`, `npm run build:data:strict`. Rendu en web sur iPhone SE (375 × 667), puis sur un téléphone Android et un iPhone pour les lots 3 et 4 (geste, rotation, bord gauche).

## Documentation à mettre à jour

- `CONTRIBUTING.md` : critères du lot 1.
- `PRODUCT.md` et `DESIGN.md` : retour à la question précédente, page qui se tourne, page complète derrière la gomme.
- `todo.md` : Batho retiré. Les portraits restent à demander aux équipes : pas de logo de parti en repli (décidé le 2026-10-29).
