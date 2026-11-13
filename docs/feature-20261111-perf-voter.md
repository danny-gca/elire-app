# Voter : lag depuis le swipe, touchers avalés, bilan, sélection du texte

Demandes du 2026-11-11. Branche `feature/update-candidats`.

Légende : **[Danny]** = demandé tel quel, **[Proposition]** = ma proposition, pas encore validée, **[À trancher]** = Danny décide avant la suite, **[Fait]** = dans le code.

| Lot | Sujet | État |
| --- | --- | --- |
| 1 | Lag énorme depuis le swipe (v1.7.0) et la v1.8.0 | [Fait], mesuré sur le web, à confirmer sur Android |
| 2 | Toucher avalé pendant que la page tourne | [Fait] |
| 3 | Swipe impossible depuis l'écran de bilan (tous les 10 votes) | [Fait], à tester sur téléphone |
| 4 | Tiroirs de contexte : ouverture et fermeture | Mesuré : tâches longues 931 → 563 ms, rien de plus à corriger pour l'instant |
| 5 | Tests de perf rejouables | [Fait] `scripts/perf-web.mjs`, 6 scénarios dont `visites` (Cahier, fiche candidat, Lois, fiche scrutin, Explorer, thème) |
| 6 | « A voté ! » parfois resté trop haut au-dessus des boutons | [Fait] cause trouvée, voir § 6 |
| 7 | Texte trop vite sélectionné au toucher sur mobile | [Fait], à tester sur téléphone |
| 8 | Installer l'Android SDK (émulateur bas de gamme) | En cours ; iPhone : tests aux déploiements |
| 15 | « Impossible » devient « Jamais » | [Fait], voir § 15 |
| 16 | Dernière page de la présentation fade, bouton décentré | [Fait], à voir sur téléphone |
| 17 | Android : trait des astuces entier avant de se tracer ; Maestro lent sur la présentation | [Fait], voir § 17 |
| 18 | Crédits : portraits toujours dans le même ordre | [Fait] |
| 19 | « Méthode et corrections » : nombre de propositions faux | [Fait], voir § 19 |

---

## 1. Le lag

**[Danny]** Les utilisateurs se plaignent d'un lag énorme depuis le swipe (vote précédent), ou d'autre chose de la dernière release.

**Cause** : les deux releases se cumulent.

- v1.7.0 (`7f15070`, le swipe) : deux pages complètes à l'écran (la page qui tourne et celle du dessous) et une dizaine de rendus de Voter par vote.
- v1.8.0 (`470be48`) : le glossaire passe de 28 à 144 formes de mots (84 mots).
- `formsOf` (`src/lib/glossary.ts`) recompilait les 144 RegExp Unicode à chaque appel, et `GlossaryText` comme `MoreInfo` l'appellent à chaque rendu : 10 à 30 textes par page, deux pages. Mesure Node : 2,4 ms par texte, contre 0,07 ms une fois les RegExp en cache. Hermes, sans JIT de RegExp, est plus lent encore.
- Effet visible : la page qui tourne arrive en retard, le minuteur de secours (`TURN_MS + SAFETY_MS`, 620 ms) la retire avant qu'elle n'ait tourné, l'écran saccade.

**[Fait]**

- `src/lib/glossary.ts` : RegExp compilées une fois par liste de mots (`WeakMap`), résultat gardé par texte, copie rendue à l'appelant. `exec` au lieu de `matchAll`, qui clone la RegExp à chaque appel (14 fois plus lent sur un nouveau texte, mesure Node). Test : le cache ne se laisse pas modifier par l'appelant.
- `src/app/(tabs)/index.tsx` : le geste `Gesture.Pan()` est mémoïsé (`useMemo`), ses actions passent par une référence à jour (`panActions`) ; il n'est recréé que si sa page, son sens ou la largeur changent. `setOverSize` ne crée plus un objet à chaque mise en page.

**Mesure** (web exporté, Chrome, CPU bridé ×6, 390 × 844, 20 votes, même ordre de questions) :

| | Avant (`HEAD`) | Après |
| --- | --- | --- |
| Tâches longues (> 50 ms) | 51 | 31 à 33 |
| Temps total en tâches longues | 4 761 ms | 3 259 à 3 413 ms |
| Images lentes (> 50 ms) | 39 | 31 à 33 |
| Délai médian vote → question suivante | 724 ms | 702 à 710 ms |

Le délai est surtout fait des animations voulues (trait du bouton, surligneur, page qui tourne). Sous Chrome (V8), `matchAll` et `exec` coûtent pareil : le gain de `exec` n'apparaît que sous Hermes. Ce qui reste dans la trace est surtout propre au web : nettoyage des animations de sortie de Reanimated web (`unmountCleanup`, `getBoundingClientRect`).

**Limites** : le web n'est pas Android. Pas de Hermes, pas de rendu natif, pas de swipe au doigt (flèches du clavier à la place). Les chiffres sont optimistes, seule la comparaison avant/après compte.

## 2. Toucher avalé pendant que la page tourne

Trouvé pendant les mesures. Pendant les 420 ms où la page votée tourne, `handleVote` refusait tout vote (`over && over.mode !== 'back'`), sans retour visuel : on touche, rien ne se passe. Sur un téléphone lent le tour dure plus longtemps, l'impression de lag aussi.

**[Fait]** `voteBlocked` (`src/lib/page-turn.ts`, testé) : seul un retour en plein geste (`peek`) bloque le vote. Vérifié : 10 votes enchaînés sans pause, aucun avalé (avant : blocage au 5e).

## 3. Swipe depuis l'écran de bilan

**[Danny]** Après 10 votes, sur la page récap, le swipe à gauche ne marche plus, c'est dommage.

**[Fait]** `src/app/(tabs)/index.tsx` : le bilan n'est plus exclu de `previousQuestion` (`busy`). Le bilan est posé dans une `Page` comme une question, la question précédente revient par-dessus avec ses boutons de vote (`pauseShown`), puis repart sur le bilan. Le retour système d'Android en profite aussi. À tester sur téléphone.

## 4. Tiroirs de contexte

**[Danny]** Tester l'ouverture et la fermeture des tiroirs, peut-être améliorable.

Sur une proposition, l'onglet ouvert (`info`) est un état de tout l'écran Voter : ouvrir un tiroir redessine Voter et ses deux pages. Sur un scrutin ou une question commune, l'état est local à la feuille. Mesure : scénario `tiroirs` de `scripts/perf-web.mjs`.

## 5. Tests de perf rejouables

**[Danny]** Des tests rejouables plutôt que Chrome à la main.

`scripts/perf-web.mjs` : sans dépendance, pilote Chrome en headless par le protocole DevTools. Ordre des questions fixé (`Math.random` graine fixe), astuces et présentation déjà vues, CPU bridé, scénarios `votes`, `rapide`, `retour`, `tiroirs`, `bilan`, résultats en JSON et en tableau.

## 6. « A voté ! » trop haut

**[Danny]** Dans certains cas « A voté ! » reste bloqué un peu au-dessus de la barre.

**Cause** (mesurée par le script) : à chaque vote, l'ancien « A voté ! » est remplacé (`key={lastId}`) et s'efface par `exiting={FadeOut}`. Reanimated web en garde un clone positionné en absolu, mais mal placé : 61 px d'écart au lieu de 17, jusqu'à 191 px. Sur un appareil lent, ce clone reste visible pendant que le nouveau entre. Présent avant et après le lot 1.

**[Fait]** `LastVote` n'a plus d'`exiting` : le fondu de fin (après 10 s) passe par une valeur animée (`fade`, `LAST_VOTE_FADE_MS`). Écart à 17 px dans tous les scénarios (13 écarts anormaux sur 20 votes avant, 0 après). À vérifier sur téléphone, où le natif n'avait peut-être pas le défaut.

**Mesure finale** (`node scripts/perf-web.mjs --dist <avant>,dist`, CPU ×6, 1 passage) : tâches longues sur 20 votes 3 262 → 1 852 ms, retour/avance 640 → 257 ms, bilan 1 859 → 1 236 ms ; votes avalés en rafale 5 → 0 ; retour depuis le bilan non → oui. Le scénario `visites` échoue sur l'ancienne version au Cahier (pas regardé pourquoi) ; sur la nouvelle, chaque écran s'affiche en 100 à 350 ms.

## 7. Texte trop vite sélectionné

**[Danny]** Sur mobile, toucher le texte le sélectionne tout de suite, même en glissant le doigt. Voulu, mais trop sensible.

Les textes des feuilles de Voter sont `selectable` (titre, citation, tiroirs) depuis avant le swipe, mais le swipe pose un geste (`GestureDetector`) sur toute la feuille. React Native n'a aucun réglage de délai pour la sélection native : on ne peut pas la rendre « moins sensible ».

**[Décidé]** le 2026-11-11 : sur téléphone, pas de sélection sur les feuilles de Voter, où l'on glisse ; on la garde dans la gomme, les fiches, Explorer et sur le web.

**[Fait]** `SHEET_SELECTABLE` (`src/components/proposition-sheet.tsx`, vrai seulement sur le web) pour le titre et la citation ; `MoreInfo` prend une option `selectable` (vraie par défaut, la gomme ne change pas), que Voter met à `SHEET_SELECTABLE`. À tester sur téléphone.

## 8. Android SDK

**[Danny]** On va installer le SDK Android.

**[Danny]** Pour l'iPhone, tant pis : tests lors des déploiements.

**[Fait]** dans `~/Android` (hors dépôt, sans sudo) : JDK 17 (Temurin 17.0.21), outils en ligne de commande du SDK, `env.sh` (JAVA_HOME, ANDROID_HOME, PATH), `install.sh` (licences, Android 36, build-tools 36.0.0, NDK 27.1, image système API 34 x86_64, émulateur `elire-lent` à 2 cœurs et 2 Go).

**[Fait] par Danny le 2026-11-12** : `~/Android/install.sh` (licence acceptée). `source ~/Android/env.sh` ajouté à `~/.zshrc`. KVM utilisable sans le groupe `kvm` (droits de la session ouverte).

**Build** : `npx expo run:android --variant release` en local, sans compte Expo ni EAS : APK signé avec la clé de debug générée sur ce PC, pour l'émulateur seulement, non publiable. Génère `android/`, ignoré par git.

**Tests rejouables** : `scripts/perf-android.mjs` (adb, uiautomator, `dumpsys gfxinfo`, sans dépendance). Mêmes scénarios que le web plus `selection` (appui long sur le titre dans Voter : aucune barre « Copier » attendue), vrais swipes (`input swipe`). Chaque passage repart d'une app vide (`pm clear`), présentation et astuces passées à l'écran ; l'ordre des questions est aléatoire, d'où `--runs` pour lisser. Les temps incluent la lecture de l'écran par uiautomator (0,5 à 1,5 s) : les chiffres utiles sont ceux de gfxinfo (saccades, 90e et 99e centiles) et les vérifications.

## 9. Titres rognés sur Android

**[Danny]** Le g et le p sont coupés dans les titres de la présentation (« surligneur », « personne », « gomme »).

**Cause** : Literata a besoin de 1,49 em de hauteur de ligne ; sous cette valeur, les jambages de la dernière ligne sont rognés. Corrigé pour iOS en 1.8.0 (`470be48`), pas pour Android.

**[Fait]** `src/constants/theme.ts` : `screenTitle` 51 et `display` 36 sur iOS et Android, 40 et 32 sur le web (qui ne rogne pas). Vérifié sur l'émulateur (présentation et Voter). Les titres d'Android sont un peu plus aérés, comme sur iOS.

## 10. Citation réduite et tiroir qui ne remonte pas

**[Danny]** La citation réduite à 2 lignes est bizarre : ouvrir « Contexte » déplie tout et l'écran ne défile pas jusqu'au tiroir. La citation devrait peut-être être écrite entièrement.

**[Fait]**

- `PropositionSheet` : la citation est toujours entière (`quoteOpen` et `numberOfLines` retirés). La coupe servait à garder les boutons visibles, mais le bandeau de vote est fixe en bas depuis.
- `showInfo` (`src/app/(tabs)/index.tsx`) : la position du tiroir se mesure par rapport à `getInnerViewRef()`. Avec la nouvelle architecture de React Native, `measureLayout` refuse le numéro de vue que donnait `getInnerViewNode()` et on retombait sur `scrollToEnd`.
- Vérifié sur l'émulateur : « Contexte » touché, la rangée remonte en haut de l'écran, son contenu juste dessous.

## 11. Script Android : la présentation

**[Danny]** La présentation avance lentement à chaque fois, il faut la passer dans le test.

**[Fait]** La présentation s'anime sans arrêt, et uiautomator attend un écran immobile avant de le lire. Le script la passe une seule fois par installation, par 12 touchers à l'aveugle sur la zone « Page suivante », puis lit l'écran une fois pour « Commencer à voter ». Les passages suivants effacent les votes dans les Réglages (lien `elire://reglages`, puis « Réinitialiser mes votes » et « Confirmer ») : présentation et astuces restent vues.

**Limite** : l'émulateur dessine sans carte graphique (« Switching to software rendering » : pilote de la carte graphique jugé défaillant), donc saccades et centiles sont très au-dessus d'un vrai téléphone. Ils servent à comparer deux APK, pas à juger l'app.

## 12. Refermer un tiroir remonte sur la question

**[Danny]** Quand on ferme un tiroir (Contexte, Liens et sources…), il faut remonter tout en haut pour relire la proposition.

**[Fait]** `MoreInfo` prend un rappel `onClose`, appelé quand on referme le tiroir ouvert, pas quand on passe d'un tiroir à un autre. Voter le relie à `scrollTop`, et les feuilles de scrutin et de question commune à `onInfoClose`. La gomme ne change pas. À vérifier sur l'émulateur après la série de mesures (APK à reconstruire).

## 13. Mesures Android par geste et suite à donner

**[Fait]** `scripts/perf-android.mjs` mesure chaque geste : images (`gfxinfo framestats`, fil d'interface et rendu) et temps de processeur par fil de l'app (`/proc` : JavaScript `mqt_v_js`, interface, rendu, ramasse-miettes, sons). Résultat brut du 2026-11-12 : `perf-results/android-gestes-2026-11-12.json`, hors git (`/perf-results/` dans `.gitignore`).

Vérifications toutes bonnes : aucun vote avalé, swipe retour et avance, bilan atteint avec retour et avance depuis lui, toutes les visites, pas de sélection au long appui. Un tiroir introuvable sur une question (sans doute sans « Glossaire »), à vérifier.

Gestes les plus coûteux (temps de processeur moyen par occurrence, émulateur à rendu logiciel) :

| Geste | JavaScript | Interface | Rendu | Sons |
| --- | --- | --- | --- | --- |
| Double toucher pendant le tour de page | 250 ms | 673 ms | 740 ms | 113 ms |
| Vote proposition (page qui tourne), 39 fois | 128 ms | 147 ms | 318 ms | 33 ms |
| Vote question commune | 105 ms | 148 ms | 353 ms | 47 ms |
| Question suivante après un résultat | 80 ms | 120 ms | 455 ms | 7 ms |

Ouvrir le Cahier, Lois ou une fiche : 50 à 100 ms de JavaScript. Saccades de 93 à 100 % partout : effet du rendu logiciel de l'émulateur, à ne pas lire dans l'absolu.

**À faire plus tard**

- Vote et page qui tourne : réduire le travail du fil d'interface et du JavaScript (feuilles mémoïsées pour ne pas redessiner la page du dessous, moins de vues animées par feuille : `PageVeil`, bandes de `SweepText`, contour SVG des scrutins).
- Sons : 13 lecteurs ExoPlayer créés d'avance (un par prise de son, plus deux pour le brouhaha), soit environ 70 fils ; un lecteur par type de son suffirait peut-être.
- Contour des scrutins : bord du bas pas noir (signalé par Danny), à reproduire sur l'émulateur (piste : tracé animé mesuré une fois, pas repris quand la feuille grandit).
- Comparer avant et après sur Android : construire l'APK de `be19aec` et passer les deux APK dans `scripts/perf-android.mjs --apk avant.apk,apres.apk`.
- Teddy Riner : vérifier la citation de `prop-tr-2` (« carcan figé des 35 heures ») dans l'entretien du Parisien (abonnement), refaire une recherche après son déplacement du 13/11 et la sortie de son site.
- Score : tester dans les simulations le lissage des petits scores (votes neutres fictifs) et un seuil de classement plus haut, avant de décider.

## 14. Parcours Maestro et catalogue des fonctionnalités

**[En cours]** `docs/fonctionnalites.md` liste chaque comportement de l'app et ce qui le vérifie. `.maestro/` rejoue les parcours sur l'émulateur (`npm run test:e2e`, rapport dans `perf-results/maestro/`).

- Premier passage (2026-11-13) : 5 parcours bons sur 13 (Présentation, Sélection, Bilan, Lois, Explorer). 6 échecs venaient des astuces « Compris » : elles s'ouvrent ~0,7 s après que l'écran s'est posé (`SETTLE_MS` 450 ms + fondu 220 ms), Maestro avait déjà regardé, et l'astuce avalait le toucher suivant (vote Pour du scrutin, question commune, fiche candidat, partage). Le texte sous l'astuce reste lisible, donc les vérifications passaient quand même.
- Correction côté tests : `communs/astuce.yaml` attend une astuce 1,5 s et les ferme en boucle (Cahier puis Classement s'enchaînent). Appelé après chaque onglet, avant un vote ciblé et dans `communs/proposition.yaml`.
- Réglages est hors des onglets : `back` avant de toucher « Voter ».
- Plantage natif vu une fois (2026-11-13, « Votes et gomme ») : SIGSEGV 3 s après le lancement, dans Hermes (`libhermesvm.so`, pile du fil JS via `hoost_make_fcontext`) au moment où GWP-ASan, le détecteur mémoire échantillonné d'Android 14, remonte la pile. Pas de cas connu trouvé. À surveiller : si ça revient, signaler à Hermes ; ce n'est pas notre JavaScript.
- « A voté ! » et Maestro : pendant ses 10 s de compte à rebours, l'écran ne se pose jamais ; uiautomator (que Maestro et le script utilisent pour lire l'écran) attend qu'il se pose, donc chaque commande prend 4 à 11 s et la barre a disparu avant d'être touchée. La gomme de Voter est testée par `perf-android` (scénario `gomme`) : la barre est touchée à sa place, au-dessus de l'échelle repérée au calibrage, puis « Contre » remplace « Pour ». Le compte à rebours se met en pause dès que la feuille est ouverte, donc la lecture remarche.
- Modifier un vote hors de Voter : `.maestro/modifier-vote.yaml` vote une mesure et un scrutin dans Voter, garde leurs numéros, les retrouve dans Explorer et Lois et passe de Pour à Contre à la ligne « Moi ».
- Émulateur pour Maestro : `emulator -avd elire-lent -cores 4 -memory 4096` (options de lancement, l'AVD reste à 2 cœurs pour les mesures de `perf-android`).
- Résultat Maestro (2026-11-13, émulateur à 4 cœurs) : 14 parcours verts (les 5 derniers corrigés repassés un à un).
- `perf-android` complet (2026-11-13, émulateur à 2 cœurs, `perf-results/android-gestes-2026-11-13.json`) : toutes les vérifications bonnes (démarrage à froid médian 893 ms, max 1 784 ms ; 0 vote avalé ; 0 retour raté ; 0 tiroir manquant ; gomme 3/3 ouverte et changée ; bilan atteint, retour et reprise ; 10 visites ; pas de sélection). Aucun scrutin rencontré dans les 20 votes : la vérification du résultat après un scrutin (`scrutinsAvecResultat`) n'a pas encore tourné.
- Nouveaux gestes les plus chers : ouvrir Lois (JS 330 ms, interface 300 ms) et défiler dans Lois (JS 220 ms, rendu 1 210 ms) ou Explorer (rendu 1 460 ms), à regarder avec le vote et le tour de page.
- Tout voté (2026-11-13) : `perf-web` a un scénario `fin` (226 votes préremplis dans le stockage du navigateur, le dernier voté à la main). Écran de fin en 1,2 s (CPU ×6), « Partager mon classement » et « Voir le classement » présents, 227 lignes sur 227, gomme ouverte avec les noms, vote changé, retour à l'écran de fin. À noter : 4 tâches longues (737 ms, max 368 ms) et 1 image gelée à l'affichage de la liste de 227 lignes.
- Téléphone plus faible (2026-11-13, `elire-lent` lancé avec `-cores 1`, Android 14 ; l'option mémoire n'a pas pris, 2,5 Go vus) : `perf-results/android-1coeur-*.json`. Toutes les vérifications bonnes (0 vote avalé, 0 retour raté, tiroirs, gomme 3/3, bilan, 10 visites, pas de sélection). Démarrage à froid médian 4,9 s (max 5,7 s) contre 0,9 s sur 2 cœurs. Images (90e centile) : vote 128 → 153 ms, double toucher 167 → 279 ms, fiche candidat 134 → 267 ms, fiche scrutin 112 → 266 ms, swipe retour 100 → 200 ms. Le temps de processeur par geste ne monte pas (même travail, étalé plus longtemps). Résultat du scrutin vu en moins de 3 s pour 3 scrutins sur 7 seulement : à vérifier (lenteur réelle ou délai du script trop court sur 1 cœur).
- Le script perf referme une fiche de scrutin ouverte par un toucher tombé pendant un changement d'écran (course vue sur 1 cœur), puis reprend.

## 15. « Impossible » devient « Jamais »

**[Danny]** (2026-11-13) « Impossible » ne va pas : il juge si la mesure est faisable, pas si on est d'accord. L'échelle devient Jamais, Contre, Pour, Parfait.

**[Fait]**

- Libellé seul : les valeurs (−2 à +2) ne bougent pas, aucune migration des votes. Le jeton de couleur garde son nom `vote-impossible`.
- App : `src/constants/votes.ts`, calcul du score (`score-calcul.tsx`, « Comment ça marche » du Cahier), `.maestro/presentation.yaml`, `scripts/perf-web.mjs` et `perf-android.mjs`, README, PRODUCT, DESIGN, `docs/fonctionnalites.md`, `.impeccable/`.
- `vote-scale.tsx` : la police réduite sous 380 pt de large est retirée, elle ne servait qu'à faire tenir « Impossible ».
- Site (`elire-website`) : échelle et démo de `src/pages/index.astro`, PRODUCT, DESIGN, `.impeccable/design.json`, `docs/reference/direction-app.md`.
- Les anciennes docs de feature gardent « Impossible » : c'est l'historique.

## 16. Dernière page de la présentation

**[Danny]** (2026-11-13) La page pour ouvrir l'app est fade et le bouton n'est pas centré ; idée : le surligner comme les astuces plutôt qu'un bouton noir.

**Cause du décalage** : la colonne a 56 pt à gauche (marge du cahier) et 16 pt à droite, le contenu centré tombait 20 pt trop à droite.

**[Fait]** (`src/app/onboarding.tsx`)

- Page recentrée sur l'écran (`marginLeft: -40`).
- La couverture du cahier : logo, « élire » et « Présidentielle 2027 » dans une étiquette blanche, encadrée au stylo à main levée (`EnjeuFrame` reçoit `pen` : un trait d'encre de 2 px au lieu des quatre surligneurs).
- « Commencer à voter → » descend en bas, sous le pouce, à la place des essais des autres pages. En Literata 24, sans fond : le surligneur choisi passe dessus une fois l'étiquette tracée (`ButtonStroke` reçoit un `delay`), avec le son du trait. « Réduire les animations » : cadre et trait posés d'emblée.

## 17. Astuces sur Android : le trait apparaît entier, puis se trace

**[Danny]** (2026-11-14) Sur Android, l'animation des astuces semble se faire deux fois.

**Cause** : `useAnimatedProps` (Reanimated 4) calcule sa valeur initiale une seule fois, au premier rendu du composant, et la donne à la première image d'un élément monté plus tard. La boucle de l'astuce, le gribouillis, le trait de vote (`ButtonStroke`) et le contour des scrutins créaient ce hook avant de connaître la longueur du trait (0) : décalage initial 0, donc trait entier à la première image, puis caché et tracé.

**Preuve** (émulateur, `adb screenrecord` pendant un parcours Maestro, 10 images par seconde) : avant, la boucle autour des boutons de vote est entière dès 0,2 s alors qu'elle doit partir à 1,1 s ; après, rien avant 1,2 s, puis tracé de 1,3 à 1,6 s.

**[Fait]**

- `src/components/drawn-path.tsx` : un trait tracé par `strokeDashoffset`, monté seulement quand sa longueur est connue. Utilisé par `ui/tip.tsx`, `tuto-layer.tsx` et `button-stroke.tsx`.
- `proposition-sheet.tsx` : le contour du scrutin passe dans un composant enfant (`ContourRect`), monté une fois la taille connue.
- Pas touchés : le cadre des questions communes et la célébration, déjà montés avec leur longueur.
- Maestro : `communs/presentation.yaml` saute à la dernière page par sa barre (« Page 8 sur 8 ») au lieu de tourner les pages une à une. La barre de progression animée empêchait l'écran de se poser : ~14 s par page, ~2 min la présentation ; maintenant 28 s pour tout le parcours Présentation, qui tourne toujours une page à la main.

## 18. Crédits : ordre des portraits

**[Danny]** (2026-11-14) Les portraits apparaissent toujours dans le même ordre.

**Cause** : l'écran suivait la liste fixe de `src/constants/credits.ts`.

**[Fait]** `src/app/credits.tsx` : ordre tiré à chaque ouverture (`fisherYates`, comme les égalités du Classement).

## 19. « Méthode et corrections » : ce qui est publié

**[Danny]** (2026-11-14) « Chacun a le même nombre de propositions » est faux, Teddy Riner par exemple.

**Constat** : 24 candidats ont 8 propositions ; Teddy Riner 3, Francis Lalanne et Sylvain Durif 0, tous trois sans programme. « Annoncée ou investie par son parti » ne couvrait pas un candidat sans parti qui s'annonce lui-même, et « résultat par député » oubliait sénateurs et eurodéputés.

**[Fait]** `src/constants/legal.ts` : « annoncée, par lui-même ou par son parti », « au plus 8 propositions, choisies parmi les mesures centrales de son programme ou, sans programme publié, parmi ses prises de position publiques : certains en ont donc moins, ou aucune », « résultat par élu ».
