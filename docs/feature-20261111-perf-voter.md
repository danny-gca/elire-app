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
