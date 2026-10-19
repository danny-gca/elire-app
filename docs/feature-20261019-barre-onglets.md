# Barre d'onglets personnalisée et unifiée (iOS, Android, Web)

## 1. Problème constaté sur Android

Sur Android, la barre de navigation inférieure présentait plusieurs défauts majeurs :
1. **Absence d'icônes** : aucune icône n'apparaissait.
2. **Gros rectangle / pilule Material 3** : un gros rectangle arrondi apparaissait au-dessus de l'onglet actif avec la couleur choisie, vide d'icône.
3. **Disparition des onglets inactifs** : les libellés inactifs étaient masqués par défaut par Material 3 (`labelVisibilityMode`), laissant des zones blanches vides. L'utilisateur devait cliquer à l'aveugle dans le vide pour changer d'écran.

## 2. Cause technique

L'utilisation de `expo-router/unstable-native-tabs` déléguait l'affichage au composant natif de la plateforme :
- Sur Android, il s'agissait du composant Material 3 `NavigationBar` / `BottomNavigationView`.
- Material 3 impose ses propres conventions (indicateur en forme de pilule, masquage des libellés inactifs).
- Les icônes locales déclarées via `src={TAB_ICONS[name]}` n'étaient pas résolues ni transmises correctement au composant natif sous Android par `unstable-native-tabs` (actuellement en phase alpha/expérimentale dans Expo Router).
- Ce rendu natif entrait en conflit direct avec la charte graphique « cahier annoté » (papier blanc froid, encre, finesse des traits, surligneur feutre).

## 3. Solution : Unifier la barre d'onglets personnalisée

Au lieu de subir les composants natifs hétérogènes et instables d'Android :
1. Remplacement de `unstable-native-tabs` par le système d'onglets unifié et headless `expo-router/ui` (déjà éprouvé sur le Web).
2. Déploiement sur mobile (iOS et Android) de la même barre soignée que celle du Web :
   - Icônes nettes PNG haute définition et visibles en permanence.
   - Libellés toujours affichés sur tous les onglets.
   - Surlignage au feutre du lecteur (`Markers[marker].soft`) incliné sous l'onglet actif au lieu de la pilule Material.
   - Prise en compte de la zone de sécurité basse (`useSafeAreaInsets` pour la barre de gestes Android et la barre d'accueil iOS).
   - Mode responsive conservé (barre supérieure dès 900 px avec logo).
3. Factorisation du code pour éliminer la duplication entre mobile et web (`app-tabs.web.tsx` supprimé au profit de `app-tabs.tsx` universel).

---

## 4. Correction de l'affichage de « A voté ! » sur Android

- **Symptôme** : Seule la lettre « A » apparaissait dans le bandeau de dernier vote sur Android.
- **Cause** : Dans la rangée flex (`flexDirection: 'row'`), le conteneur du titre à côté avait `flex: 1` tandis que le texte « A voté ! » n'avait pas `flexShrink: 0`. Le moteur de rendu Android réduisait la largeur et coupait le texte au premier espace (« A » sur la 1ère ligne, « voté ! » renvoyé sur la 2nde ligne masquée par `overflow: 'hidden'`).
- **Correction** : Ajout de `flexShrink: 0` et `numberOfLines={1}` sur `LastVoteBar` (`src/app/(tabs)/index.tsx`) et dans la démo de l'onboarding (`src/app/onboarding.tsx`).
- **Rappel orthographique** : La formule officielle du Code électoral républicain est bien « A voté ! » (verbe avoir au passé composé, sans accent sur le A et avec participe passé en -é).

---

## 5. Dissociation de la réinitialisation des votes et des astuces

- **Problème** : Lors de l'appui sur « Réinitialiser mes votes », `resetTutos()` était appelé en même temps que `resetVotes()`, ce qui relançait toutes les astuces obligatoires.
- **Correction** :
  - `resetTutos()` a été retiré du bouton de réinitialisation des votes dans `src/app/reglages.tsx`.
  - La réinitialisation des astuces reste accessible via son propre bouton dédié « Revoir les astuces ».
  - Ajout d'une célébration `small` (gerbe d'étincelles/traits) avec son festif lors de la confirmation d'effacement des votes (`celebrate('small')`).

---

## 6. Déclenchement optimisé des astuces dans le Cahier

- **Problème** : L'accès précoce au Cahier (avant d'atteindre le palier de 10 votes) ne déclenchait aucun conseil, alors que le bouton Réglages y était déjà accessible.
- **Correction** :
  - Tuto `reglages` : déclenché dès la première entrée sur l'écran Cahier (`useTuto('cahier', true)`), ciblant le bouton Réglages en haut à droite.
  - Tuto `classement-panneau` : déclenché dès qu'au moins un candidat est classé (`useTuto('classement', ranked.length > 0)`), ciblant le premier panneau de candidat.
