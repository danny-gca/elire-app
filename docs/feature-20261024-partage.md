# Partage : carrousel d'images, thèmes, scrutins, et le « ! » coupé

Demandes du 2026-10-24. Branche `feat/updates`.

Légende : **[Danny]** = demandé tel quel, **[Proposition]** = ma proposition, pas encore validée, **[À trancher]** = Danny décide avant la suite, **[Décidé]** = validé ensemble, **[Fait]** = dans le code.

## 0. Lots

| Lot | Sujet | État |
| --- | --- | --- |
| 1 | Carrousel : glisser d'une image à l'autre, points en bas | [Fait] |
| 2 | Image « Mes thèmes » : les 12 thèmes triés par la moyenne de mes notes | [Fait] |
| 3 | Image « Mes scrutins » : mes votes comparés au sort réel des textes | [Fait] |
| 4 | Image « Mes enjeux » | [Décidé], après `feature-20261024-enjeux.md` |
| 5 | Bug : le « ! » penché de Caveat coupé sur mobile | [Fait], à tester sur Android |
| 6 | Gomme : sans trait au sol, petit côté grisé | [Fait] |
| 7 | Carrousel : voir les images voisines sur les côtés | [Fait] |
| 8 | Sélection de texte : seulement le texte éditorial, à la couleur du surligneur | [Fait] |

Règle commune à toutes les images **[Décidé]** : aucun nom de candidat ni de parti, sauf « Mon classement » qui existe déjà.

---

## 1. Carrousel

**[Danny]** Glisser entre les types de partage, avec des points en bas de l'écran.

**[Fait]** `share-sheet.tsx`. Écarts avec la proposition : les flèches sont sous l'aperçu, de part et d'autre des points, sur toutes les plateformes (pas de place à côté de la carte sur un téléphone) ; pas de touches fléchées, les flèches et les points sont des boutons focusables. La feuille rouvre sur la dernière image vue. Les pages cachées sont masquées au lecteur d'écran (`aria-hidden`).

- Remplace le `SegmentedControl` de `share-sheet.tsx` : une image par page, défilement horizontal par page (`ScrollView` `pagingEnabled`, rien à installer).
- Ordre : Mon classement, Discret, Mes thèmes, Mes scrutins, puis Mes enjeux (lot 4).
- Points sous l'aperçu : un par image, l'actif en encre, les autres en filet ; chacun est un bouton (« Image 2 sur 4 : Discret »), cibles de 44 pt.
- Web : la souris ne glisse pas, donc flèches gauche et droite de chaque côté de l'aperçu, et touches fléchées.
- Le titre de la page change sous l'aperçu (la phrase d'explication actuelle) ; « Partager l'image » capture seulement l'image affichée.
- Une image sans contenu (aucun scrutin voté, aucun thème noté) reste dans le carrousel avec un état vide : « Votez sur un scrutin pour la débloquer », bouton grisé.
- « Réduire les animations » : changement de page sans défilement animé.
- `ShareMode` (`src/lib/share.ts`) passe de 2 à 4 valeurs ; `shareText()` donne un texte par image, toujours sans nom.

## 2. Image « Mes thèmes »

**[Danny]** Afficher tous les thèmes, du plus de points au moins de points, sans candidat.

**[Décidé]** Tri par **moyenne** de mes notes sur le thème, pas par somme : sinon Institutions (22 propositions) écrase Numérique (9).

**[Fait]** `themeAverages()` et `signedAverage()` (`src/lib/themes.ts`, testés), `ThemesBody` dans `share-card.tsx`. Pas de nombre de notes par ligne : 12 lignes de 20 pt remplissent la carte. « J'ai voté à tout ! » reste sur les deux premières images seulement, faute de place.

- Calcul pur dans `src/lib/themes.ts` (testé) : pour chaque thème, moyenne de mes notes -2..+2 sur ses propositions, « Je ne sais pas » exclu.
- Scrutins exclus : voter « Pour » un texte n'est pas approuver une proposition, les deux échelles ne se mélangent pas.
- Titre : « Ce qui me parle le plus ».
- Une ligne par thème : icône, nom, petite barre centrée sur 0 (à gauche si négatif), nombre de notes en 13 graphite.
- Thèmes sans note : en bas, « pas encore noté », sans barre.
- Égalité : ordre alphabétique (ce ne sont pas des candidats, pas de tirage).
- Texte d'accompagnement : « Les thèmes où j'ai le plus approuvé sur élire. »
- Limite à dire dans l'app : la moyenne mesure combien les propositions d'un thème vous ont plu, pas l'importance du thème pour vous. D'où le titre prudent.

## 3. Image « Mes scrutins »

**[Décidé]** Comparer mes votes au résultat réel, sans candidat.

**[Fait]** `scrutinsSummary()` et `scrutinsSentence()` (`src/lib/share.ts`, testés), `ScrutinsBody` dans `share-card.tsx`. Titre de l'image : « Si j'avais siégé ».

- Calcul pur (testé) : parmi mes votes Pour ou Contre sur des textes `adoptee` ou `rejetee`, combien vont dans le sens du résultat.
- Exclus : mes abstentions, les textes `en_cours`.
- Gros chiffre en Literata 96 sur une bande du surligneur, comme le mode discret : « 12 sur 20 ».
- Phrase : « Avec mes votes, 12 textes sur 20 auraient eu le même sort au Parlement. »
- Dessous, en 13 : « dont 4 adoptés que j'aurais rejetés ».
- Débloquée dès 1 scrutin voté, sinon état vide (lot 1).

## 4. Image « Mes enjeux »

**[Décidé]** Après la feature enjeux : « J'ai tranché 15 débats », sans nom. Détail à écrire quand les enjeux existent.

## 5. Bug : le « ! » coupé

**[Danny]** Le « ! » de « A voté ! » ou « J'ai voté à tout ! » s'affiche mal sur mobile : il est penché.

**[Fait]** `paddingRight: 4` dans `Type.note` (`src/constants/theme.ts`) : vaut pour les trois textes d'un coup.

**Piste** : Caveat (`Type.note`) dessine ses lettres au-delà de leur boîte ; avec `numberOfLines={1}`, Android coupe ce qui dépasse à droite. Un `paddingRight` de quelques points sur le `Text` (pas sur la `View` parente) laisse la place au « ! ».

Où : `src/components/all-voted-note.tsx`, la ligne « A voté ! » de `src/app/(tabs)/index.tsx`, `src/app/onboarding.tsx:420`. Mieux : le padding dans `Type.note` ou un petit composant commun, pour ne pas l'oublier ailleurs.

**À vérifier** sur Android et iOS, avec la taille de texte système agrandie.

## 6. Gomme

**[Danny]** Retirer le trait au sol sous la gomme, griser une moitié. (Rose et bleu écartés : ce sont deux surligneurs du lecteur, ils feraient croire à une marque.)

**[Fait]** `src/components/eraser-icon.tsx` : le petit côté rempli de graphite à 35 %, la gomme recentrée dans sa grille.

## 7. Voir les images voisines

**[Danny]** Qu'on voie facilement qu'il y a plusieurs images, de façon intuitive.

**[Fait]** `share-sheet.tsx` : table d'un bord à l'autre de la feuille, voisines qui dépassent de 48 pt, plus petites et pâlies selon le défilement (Reanimated), touchables pour venir au centre. Sur un écran étroit, l'aperçu rapetisse (`fit`) pour leur laisser la place.

Piège : html2canvas (capture web) rogne et tasse le texte d'une carte réduite par ses parents. Sur le web, on capture donc une copie en taille réelle, cachée dans une boîte vide ; en natif, la capture ignore la réduction des parents.

## 8. Sélection de texte

**[Danny]** Pas de sélection dans le partage ; seulement sur les votes, la fiche candidat, le détail d'un scrutin, Explorer, pas sur les thèmes. Couleur de sélection selon le surligneur.

**[Fait]**

- Web : `body { user-select: none }` dans `global.css` (les feuilles sont hors de `#root`), champs de saisie exceptés.
- `selectable` (web et natif) sur le texte éditorial seulement, jamais dans un bouton : titre et citation de la carte de Voter (`SweepText` le transmet), « En savoir plus » et glossaire, titre, citation, contexte et numéro du détail d'une proposition, titre, ligne de méta, résumé et question du détail d'un scrutin, explication de vote, nom, parti et biographie de la fiche candidat, paragraphes des pages légales.
- Restent non sélectionnables : partage, Cahier, listes d'Explorer, de Lois et de la fiche (lignes touchables), pages de thème, onboarding, réglages, crédits.
- Couleur : `data-marker` posé sur `<html>` par `_layout.tsx`, `::selection` par surligneur.

**À vérifier** sur Android : un texte `selectable` ne doit pas bloquer le défilement ni l'arrêt de l'avance automatique dans Voter.

## À vérifier à la main

- Glisser entre les 4 images sur téléphone, flèches sur le web, lecteur d'écran sur les points.
- L'image partagée est bien celle affichée.
- Aucune image, aucun texte d'accompagnement ne contient un nom (sauf Mon classement).
