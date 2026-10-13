# ÉLIRE - Présidentielle 2027

Application citoyenne et neutre d'aide à la décision pour l'élection présidentielle 2027.

> Ce README décrit l'état **actuel** du code. Les tâches ouvertes sont dans [todo.md](todo.md), la direction visuelle dans `.impeccable/surfaces/`.

## 1. Vision & Principes

- **100% Local-first** : zéro compte, zéro télémétrie, aucune police ni requête tierce ; les votes restent sur l'appareil.
- **Transparence** : chaque proposition, loi et vote porte une URL de source et un numéro stable (`P-531`, `L-28`) repris dans « Signaler une erreur » (ticket GitHub pré-rempli). Chaque proposition a été vérifiée contre une source précise ; sa description est la citation exacte (voir `docs/verification-donnees.md`). Crédits des portraits dans l'app.
- **Neutralité** : propositions anonymes pendant le vote, ordre tiré au hasard (jamais deux fois de suite le même candidat), couleurs d'échelle réservées aux votes de l'utilisateur, égalités départagées au hasard.

## 2. Fonctionnalités

- **Présentation au premier lancement** (`/onboarding`) : 5 stories (neutralité, transparence, responsabilité, confidentialité), revisitable depuis le pied de page.
- **Navigation à 4 onglets** : onglets natifs sur iOS/Android (SF Symbols / Material), barre du bas sur le web mobile, barre du haut à partir de 900 px.
  1. **Voter** : propositions à l'aveugle, 5 choix **Impossible (-2), Contre (-1), Neutre (0), Pour (+1), Parfait (+2)**. Source et contexte dans une feuille séparée. Le dernier vote reste visible, surligné, et modifiable. En fin de série : liste de toutes les propositions avec son vote, modifiable.
  2. **Classement** : panneaux identiques et numérotés (rangs ex æquo), débloqué après 10 votes ; un candidat est classé à partir de 2 propositions votées. Réinitialisation des votes (confirmation en deux appuis).
  3. **Lois** : recherche, filtre par statut, regroupement par année ; position de chaque candidat en distinguant vote personnel et position de groupe.
  4. **Explorer** : sommaire des 12 thèmes (votées / total), page par thème (`/theme/[id]`, filtre « Pas encore votées », thème suivant), recherche (sans accents) avec le même filtre, auteur affiché, vos votes surlignés.
- **Fiche candidat** (`/candidate/[id]`) : flèche retour seule, biographie, accord avec vos votes, « Programme 2027 » / « Votes au Parlement » (message dédié si le candidat n'a pas siégé).

## 3. Architecture

### Données publiques (embarquées dans le bundle)

- **Sources éditoriales** (dossier `data/`, seule source de vérité, éditée à la main) : `partis.json`, `candidats.json`, `thematiques.json`, `candidats/<candidat-id>.csv`, `lois.json`, `refs.json` (registre des numéros stables, géré par le build).
- **Compilation** : `npm run build:data` (`scripts/build-data.ts`) valide tout avec Zod (`src/schemas/dataset.ts`) et papaparse, puis écrit `src/data/dataset.json`. Le build **échoue** sur un schéma invalide, un id en double, une référence inconnue ou une apostrophe manquante. Les sources vers une page d'accueil sont des avertissements, bloquants avec `npm run build:data:strict`.
- **Accès** : `src/services/dataset.ts` exporte les données en synchrone (`candidats`, `propositions`, `lois`, `getCandidat()`, `getLoisByCandidat()`...).
- **Types** : générés depuis les schémas Zod (`src/schemas/dataset.ts`).

### Données utilisateur

- `src/store/votes-store.ts` (Zustand + `persist`) : `votes`, `order` (ordre de passage figé, régénéré au reset), `onboardingSeen`. Stockage : `expo-sqlite/kv-store` en natif, `localStorage` sur le web (`src/lib/storage.ts` / `storage.web.ts`).
- `src/lib/shuffle.ts` : mélange Fisher-Yates + alternance des candidats et thèmes.
- `src/lib/scoring.ts` : score d'accord (fonction pure, testée).

### Calcul du score d'accord

Pour chaque candidat : somme des votes (-2..+2) sur ses propositions votées, ramenée sur 0-100 %. Sans vote : « Pas encore évalué » (pas de 50 % par défaut). Classé à partir de 2 votes ; à score égal, même rang, ordre tiré au hasard à chaque lancement.

### Interface

- **Univers « cahier annoté »** : papier blanc froid, encre, graphite, surligneur jaune réservé aux votes de l'utilisateur, police système, deux tailles de lecture (17 et 13). Tokens dans `src/constants/theme.ts`.
- **Composants** : `src/components/ui/` (Button, ResetButton, Badge, ProgressCounter, SegmentedControl, SearchField, Sheet) et composants métier (`proposition-sheet`, `vote-scale`, `candidate-panel`, `loi-card`, `vote-row`...).
- **Logo** : source vectorielle `assets/brand/mark.svg`, icônes rendues dans `assets/images/`.

## 4. Stack Technique

- **Framework** : Expo SDK 57, React Native 0.86, React 19, React Compiler, routes typées.
- **Navigation** : Expo Router (`src/app/`), onglets natifs (`expo-router/unstable-native-tabs`), `expo-router/ui` sur le web.
- **État** : Zustand persisté (`expo-sqlite/kv-store`).
- **UI** : `expo-image`, `react-native-reanimated`, `@expo/vector-icons`.
- **Données** : Zod 4 + papaparse (outils de build).
- **Tests** : Jest (`jest-expo`).
- **Plateformes** : iOS, Android, Web (export statique).

## 5. Commandes Développeur

- **Installer les dépendances (obligatoire avant tout)** : `npm install` (Node 22.18+, requis pour exécuter `scripts/build-data.ts`)
- **Lancer le serveur de dév** : `npx expo start` (`npm run web`, `npm run android`, `npm run ios`)
- **Tout vérifier** : `npm run check` (build des données + dataset à jour + typecheck + lint + tests)
- **Typecheck** : `npm run typecheck` (lancer `npx expo start` une fois pour générer `expo-env.d.ts` et les routes typées)
- **Lint** : `npm run lint`
- **Tests** : `npm test`
- **Compiler les données** : `npm run build:data` (ou `build:data:strict`)
- **Diagnostic Expo** : `npx expo-doctor`
- **Installer un package compatible Expo** : `npx expo install <package>`

## 6. Contribuer, licences, soutien

- **Contribuer** : signalements d'erreur, règles de sourçage et de neutralité, conventions de code dans [CONTRIBUTING.md](CONTRIBUTING.md). Code de conduite : [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- **Licences** : code sous [MIT](LICENSE), données (`data/`) sous [CC BY-SA 4.0](data/LICENSE.md), portraits sous leur propre licence (écran « Crédits photos »).
- **Soutenir** : bouton « Sponsor » de GitHub, configuré dans `.github/FUNDING.yml`.
