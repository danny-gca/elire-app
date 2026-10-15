# Améliorations UX : retours d'utilisation du 2026-10-15

Synthèse triée des changements demandés : faisabilité vérifiée dans le code, effort, risques et décisions à prendre. Les numéros d'origine (1.1, 2.2...) sont gardés entre parenthèses.

Effort : **S** moins d'une demi-journée, **M** une journée environ, **L** plusieurs jours.

## Tri

| Lot | Sujet | Effort | Faisable | Décision à prendre |
| --- | --- | --- | --- | --- |
| A | Glossaire : doublon BFM / BFMTV et relecture (7.1) | S | oui | non |
| B | Gomme : modifier un vote depuis partout (1.4, 2.3, 3.1) | M | oui | durée du « Dernier vote » |
| C | Scrutins en feuille, cartes allégées, vote surligné (2.1, 2.2, 4.2) | M | oui | non |
| D | Compteurs des onglets de la fiche en pastille (4.1) | S | oui | non |
| E | Compte à rebours annulé au geste (1.3) | S | oui | non |
| F | Fermer une feuille en glissant vers le bas (5.1) | M | oui (`react-native-gesture-handler` déclaré) | non |
| G | Carte de vote allégée (1.2) | S | oui | **neutralité : citation cachée ?** |
| H | Scrutin visuellement distinct (1.2) | S à M | oui | style |
| I | Sélecteur de surligneur dans l'en-tête de Voter (1.1) | S | oui | non |
| J | Nom « élire » en minuscules et nouveau logo manuscrit (1.1, 8.1) | M | oui | **portée du renommage** |
| K | Départage du Classement (6.1, 6.2) | S | déjà neutre | **faut-il changer ?** |
| L | Partage du classement (6.3) | L | oui, avec 2 dépendances | **portée** |

Ordre proposé : A, E, D, B, C, F, G, H, I (rapides et sans risque), puis J, K, L après décisions.

---

## A. Glossaire (7.1) : S

- `BFM` (« Face à BFM », contexte de prop-ez-6) et `BFMTV` (forme « BFMTV », affichée « BFMTV : BFMTV ») font doublon.
- Correction : une seule entrée `BFMTV` avec une forme utile (« chaîne d'information en continu »), et `BFM` développé en « BFM (groupe de médias de BFMTV) » ou contexte réécrit sans le sigle.
- Relecture des 48 entrées : formes identiques au sigle, définitions manquantes (TGV, UE n'en ont pas : acceptable), sigles qui ne sont plus utilisés (le build avertit déjà).
- **Trouvé en passant** : la citation de prop-ez-6 est en anglais (« In public spaces, yes. »), seule citation non française. À remplacer par une source française avec `collecter-donnees`.

## B. Gomme : modifier son vote partout (1.4, 2.3, 3.1) : M

- Aujourd'hui : on modifie un vote depuis « Dernier vote » (feuille d'édition de Voter) et depuis la liste de fin de série. Explorer, thèmes, fiche candidat et Lois ouvrent un détail sans pouvoir modifier.
- Une icône gomme unique, dessinée au trait dans le style des onglets (Ionicons n'a pas de gomme), sur chaque élément déjà voté ; elle ouvre la même feuille d'édition (échelle de vote ou 3 choix de scrutin). La feuille de détail (`PropositionDetail`, `LoiDetail`) reçoit le même bouton.
- **« Dernier vote » temporaire sur une ligne** : `[Dernier vote] [titre tronqué] [+2 Parfait] [gomme]`, qui disparaît après un délai avec un filet de progression (le même que le compte à rebours des scrutins).
- Risque : si la ligne disparaît vite, l'erreur de vote ne se corrige plus d'un geste ; la gomme partout compense.

## C. Lois et scrutins de la fiche en feuille (2.1, 2.2, 4.2) : M

- `loi-card.tsx` a un accordéon (« Positions ») ; `loi-detail.tsx` existe déjà. On ouvre une `Sheet` avec `LoiDetail`, comme les propositions, depuis Lois et depuis la fiche candidat.
- Carte de liste allégée : numéro, statut, question ou titre sur 2 lignes, et le vote de l'utilisateur.
- « Votre vote : pour » devient le titre surligné dans la couleur de sa marque (même règle que les propositions), plus le libellé du vote en couleur d'échelle.
- « vote personnel, a voté pour » (2 lignes) devient une étiquette courte : « Pour · personnel » ou « Pour · groupe ».

## D. Compteurs en pastille (4.1) : S

- `SegmentedControl` reçoit déjà `count` ; le chiffre passe dans une pastille (fond filet, 13 semi-gras tabulaire), surlignée sur l'onglet actif.

## E. Compte à rebours annulé au geste (1.3) : S

- Après un scrutin, un toucher sur la zone de l'hémicycle ou un défilement arrête le compte à rebours (le filet disparaît, « Question suivante » reste). Aussi utile pour l'accessibilité web, où le lecteur d'écran n'est pas détectable.

## F. Glisser vers le bas pour fermer (5.1) : M

- Android et web : geste sur la poignée et l'en-tête de la feuille (`PanResponder` du noyau React Native, déjà utilisable, ou `react-native-gesture-handler`, présent par Expo Router mais à déclarer avec `npx expo install`). Seuil de fermeture au tiers de la hauteur ou à la vitesse ; sinon retour en place. iOS garde le `pageSheet` natif.
- Une poignée visible en haut du panneau signale le geste.

## G. Carte de vote allégée (1.2) : S

- Demande : titre seul sur la carte, citation déplacée dans « En savoir plus », pour voir les boutons sans défiler.
- **Risque de neutralité** : on voterait alors sur notre reformulation (le titre) et non sur les mots du candidat. La règle « Titre fidèle » limite le risque, sans l'annuler.
- Alternative : garder la citation mais la couper à 2 lignes avec « ... » (dépliée dans « En savoir plus »), ou réduire sa taille. Décision ci-dessous.

## H. Scrutin visuellement distinct (1.2) : S à M

- Aujourd'hui, la feuille d'un scrutin ressemble à celle d'une proposition (seule la ligne « Scrutin réel » change).
- Pistes : en-tête de feuille « Scrutin à l'Assemblée » avec un pictogramme d'hémicycle, fond légèrement teinté, ou contour qui se dessine une fois à l'arrivée (un contour animé en continu irait contre la règle du « seul moment animé » et « Réduire les animations »).

## I. Sélecteur de surligneur dans l'en-tête de Voter (1.1) : S

- `MarkerPicker` existe (`marker-picker.tsx`) ; version compacte (4 pastilles ou une pastille qui déplie) dans `accessory` de `ScreenHeader`. Le réglage du Classement reste.

## J. « élire » en minuscules et logo manuscrit (1.1, 8.1) : M

- Logo : un « é » minuscule tracé à la plume. Piste propre et sans droits : partir du glyphe « é » de Caveat (SIL OFL : un logo dessiné à partir d'une police libre est permis), le vectoriser, puis le retoucher ; garder la bande de surligneur sous la lettre.
- Assets à régénérer : `assets/brand/*.svg` (icône, adaptative Android, monochrome, splash, favicon), site (`Base.astro`, favicon).
- Renommage en « élire » : app (`app.json` `name`, textes), site, README, PRODUCT, DESIGN, mentions légales. Le nom affiché sur les stores change aussi (fiche iOS déjà publiée).
- Onglet « Voter » renommé « élire » : à trancher (voir questions).

## K. Départage du Classement (6.1, 6.2) : S

- **Déjà neutre** : les égalités suivent un ordre tiré au hasard à chaque lancement (`tieOrder`), jamais l'alphabet, et deux scores égaux partagent le même rang (« ex æquo »). Le point 6.1 est donc déjà respecté.
- Proposition 6.2 : à score égal, mettre devant le candidat le plus fiable (plus d'éléments). Neutre envers les candidats (ça dépend des votes du lecteur), mais l'ordre ne serait plus égal à rang égal.

## L. Partage du classement (6.3) : L

- Image : capture d'une carte dessinée pour le partage (`react-native-view-shot`) puis feuille de partage du système (`expo-sharing`), toutes deux dans Expo ; sur le web, Web Share API ou téléchargement de l'image.
- Deux modes : classement complet, ou discret (« J'ai répondu à 48 questions sur élire » + fiabilité, sans aucun nom).
- Lien vers l'app ou le site.
- Points à trancher : rester neutre (aucun nom mis en avant dans le mode discret), et ne rien envoyer sans action explicite.

---

## Décisions du 2026-10-15

1. **G** : la citation reste sur la carte, coupée à 2 lignes avec « ... », complète dans « En savoir plus ».
2. **B** : « Dernier vote » sur une ligne, avec gomme, visible 10 secondes avec un filet qui se vide.
3. **J** : « élire » en minuscules dans l'app, le site, les docs, les mentions et les stores, avec le nouveau logo manuscrit ; l'onglet garde « Voter ».
4. **K** : à score égal, le plus fiable (plus d'éléments) passe devant, puis le hasard ; le rang reste partagé (« ex æquo »).
5. **L** : partage en image dès maintenant, deux modes (complet ou discret, sans nom), avec un lien.
6. **H** : en-tête « Scrutin » avec pictogramme d'hémicycle, fond teinté, et contour tracé une fois à l'arrivée (coupé par « Réduire les animations »).
7. **Déploiement Android** : à regarder après ces lots.

## Livraison du 2026-10-15

Tous les lots sont livrés ; typecheck, lint, tests et build du site passent, contrôle visuel sur l'app web (390 px) et le site (1280 px).

- **A** : `BFM`, `BFMTV`, `GAIA`, `QR`, `SMR` réécrits, définitions ajoutées à `TGV` et `UE` ; le build refuse désormais une forme qui répète le sigle.
- **B** : `eraser-icon.tsx`, `edit-vote-sheet.tsx` (feuille partagée et bouton gomme) ; gomme sur les lignes de propositions et les cartes de scrutins votées, modification sur place dans `PropositionDetail` et `LoiDetail` ; « Dernier vote » sur une ligne, 10 s avec un filet qui se vide.
- **C** : `loi-card.tsx` allégée et touchable, `loi-detail.tsx` en feuille depuis Lois et la fiche ; vote de l'utilisateur sur une bande de son surligneur ; « Vote personnel » ou « Vote de son groupe (GDR) ».
- **D** : compteurs en pastille, surlignée sur l'onglet actif, dans tous les contrôles segmentés.
- **E** : toucher, clic ou molette sur l'écran du scrutin : plus d'avance automatique.
- **F** : poignée et glissement de l'en-tête vers le bas (Android, web) ; `react-native-gesture-handler` déclaré (le React Compiler refuse `PanResponder`).
- **G** : citation coupée à 2 lignes, dépliée avec « En savoir plus ».
- **H** : en-tête « Scrutin réel » avec hémicycle, fond `ballot`, contour tracé une fois.
- **I** : `MarkerPicker compact` dans l'en-tête de Voter.
- **J** : « élire » partout (app, site, docs, mentions, `app.json`) ; logo « é » tiré de Caveat Bold avec la bande de surligneur ; `scripts/build-brand.mjs` régénère les SVG et PNG (icône, Android adaptative, monochrome sans bande, favicon, splash) ; favicon et marque du site.
- **K** : à score égal, `evidence` décroissante puis `tieOrder` ; rang toujours partagé (testé).
- **L** : `share-card.tsx`, `share-sheet.tsx`, `src/lib/share*.ts` ; `react-native-view-shot` et `expo-sharing` ajoutés ; sur le web, partage de fichier ou téléchargement.

À vérifier sur appareil : glisser pour fermer (Android), partage natif, nouvelle icône sur l'écran d'accueil et le splash. Le nom affiché sur les stores change au prochain build. Reste aussi la citation en anglais de prop-ez-6.

### Retours du 2026-10-15 (après livraison)

- « Dernier vote » : pendant la modification, le filet reste plein ; feuille fermée, 10 s de plus avec le vote corrigé.
- Gomme retirée des listes (propositions, scrutins) : seulement dans le détail.
- Ligne « Moi » dans la feuille d'une proposition et d'un scrutin, comme un candidat (`my-vote-row.tsx`).
- Classement : une ligne de contexte et « Comment c'est calculé » replié ; sélecteur de surligneur retiré (il est en haut de Voter).
