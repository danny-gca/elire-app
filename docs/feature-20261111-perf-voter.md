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
| 7 | Texte trop vite sélectionné au toucher sur mobile | [À trancher] |
| 8 | Installer l'Android SDK (émulateur bas de gamme) | À faire |

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

**[À trancher]**

- **[Proposition]** Sur téléphone, pas de sélection sur les feuilles de Voter, où l'on glisse ; on la garde dans la gomme, les fiches, Explorer et sur le web.
- Ou la garder partout telle quelle.

## 8. Android SDK

**[Danny]** On va installer le SDK Android.

À faire : JDK 17, Android SDK en ligne de commande, un émulateur bas de gamme (2 cœurs, 2 Go), puis une build release et le même parcours.
