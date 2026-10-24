# élire - Présidentielle 2027

Une application gratuite et neutre pour savoir de quels candidats à la présidentielle 2027 vous êtes le plus proche, à partir de leurs propositions et de leurs votes au Parlement.

## En bref

- Vous notez des propositions sans savoir de qui elles viennent.
- L'app calcule votre accord avec chaque candidat.
- Vous découvrez ensuite qui propose quoi, avec la source de chaque mesure.
- Aucun compte, aucune publicité, aucune donnée envoyée : tout reste sur votre appareil.

## Ce que vous pouvez faire

- **Voter** : notez chaque proposition de « Impossible » à « Parfait », ou passez avec « Je ne sais pas ».
- **Scrutins réels** : votez aussi sur des textes passés au Parlement et comparez-vous aux élus.
- **Classement** : après 10 votes, voyez les candidats les plus proches de vos avis.
- **Partager** : envoyez une image de votre classement, ou sans aucun nom votre avancée, vos thèmes ou vos scrutins.
- **Explorer** : parcourez toutes les propositions par thème, avec leur auteur et leur source.
- **Lois** : retrouvez chaque scrutin et la position de chaque candidat.
- **Fiche candidat** : biographie, programme et votes au Parlement sur une seule page.
- **Changer d'avis** : la gomme modifie n'importe quel vote, partout dans l'app.

## Nos engagements

- **Neutre** : pendant le vote, les propositions sont anonymes et tirées au hasard.
- **Équitable** : chaque candidat a le même nombre de propositions visé et les mêmes règles de source.
- **Sourcé** : chaque proposition cite mot pour mot un document précis, avec son lien.
- **Privé** : vos votes ne quittent jamais votre appareil et s'effacent en deux appuis.
- **Corrigeable** : chaque élément porte un numéro (`P-531`, `L-28`) pour signaler une erreur en un appui.

## Comment le score est calculé

- Votre note va de -2 (Impossible) à +2 (Parfait) et compte pour l'auteur de la proposition.
- Sur un scrutin, un candidat gagne des points s'il a voté comme vous et en perd s'il a voté l'inverse.
- Un vote de groupe compte moitié moins qu'un vote personnel.
- Les votes au Parlement ne font jamais plus de la moitié du score.
- Un candidat est classé dès 2 propositions notées, et une jauge dit si son score est fiable.
- À égalité, les candidats partagent le même rang, dans un ordre tiré au hasard.
- Le pourquoi de chaque règle, simulations à l'appui : [docs/simulations](docs/simulations/README.md).

## Les données

Tout est dans [data/](data/), sous licence libre, lisible directement sur GitHub sans rien installer.

- **Propositions** : un fichier par candidat, affiché en tableau par GitHub (liste ci-dessous).
- **Scrutins** : [lois.json](data/lois.json), 42 votes réels à l'Assemblée, au Sénat et au Parlement européen, de 2017 à 2026.
- **Candidats** : [candidats.json](data/candidats.json), avec la source datée de chaque candidature.
- **Partis** : [partis.json](data/partis.json), avec leur nuance officielle du ministère de l'Intérieur.
- **Thèmes** : [thematiques.json](data/thematiques.json), les 12 thèmes de l'app.
- **Sigles** : [glossaire.json](data/glossaire.json), la définition de chaque sigle affiché.
- **À savoir** : faute de programme 2027 publié, certaines mesures viennent d'un programme de 2022 ou 2024, ce que précise leur contexte.

| Candidat | Parti | Propositions |
| --- | --- | --- |
| [Anasse Kazib](data/candidats/anasse-kazib.csv) | RP | 8 |
| [Antoine Mikolajczak](data/candidats/antoine-mikolajczak.csv) | EQX | 5 |
| [Bruno Retailleau](data/candidats/bruno-retailleau.csv) | LR | 8 |
| [David Lisnard](data/candidats/david-lisnard.csv) | NE | 7 |
| [Delphine Batho](data/candidats/delphine-batho.csv) | GE | 8 |
| [Édouard Philippe](data/candidats/edouard-philippe.csv) | HOR | 7 |
| [Éric Zemmour](data/candidats/eric-zemmour.csv) | REC | 8 |
| [Fabien Roussel](data/candidats/fabien-roussel.csv) | PCF | 7 |
| [Florian Philippot](data/candidats/florian-philippot.csv) | LP | 8 |
| [François Asselineau](data/candidats/francois-asselineau.csv) | UPR | 8 |
| [François Ruffin](data/candidats/francois-ruffin.csv) | DEBOUT | 8 |
| [Gabriel Attal](data/candidats/gabriel-attal.csv) | REN | 8 |
| [Jean Lassalle](data/candidats/jean-lassalle.csv) | RES | 8 |
| [Jean-Luc Mélenchon](data/candidats/jean-luc-melenchon.csv) | LFI | 8 |
| [Karim Bouamrane](data/candidats/karim-bouamrane.csv) | FHuF | 8 |
| [Marine Le Pen](data/candidats/marine-le-pen.csv) | RN | 8 |
| [Marine Tondelier](data/candidats/marine-tondelier.csv) | EELV | 8 |
| [Mira Markovic](data/candidats/mira-markovic.csv) | PA | 8 |
| [Natacha Polony](data/candidats/natacha-polony.csv) | Nous sommes la France | 8 |
| [Nathalie Arthaud](data/candidats/nathalie-arthaud.csv) | LO | 8 |
| [Nicolas Dupont-Aignan](data/candidats/nicolas-dupont-aignan.csv) | DLF | 8 |
| [Olivier Becht](data/candidats/olivier-becht.csv) | Projet France | 8 |
| [Raphaël Glucksmann](data/candidats/raphael-glucksmann.csv) | PP-PS | 8 |
| [Selma Labib](data/candidats/selma-labib.csv) | NPA-R | 8 |
| [Xavier Bertrand](data/candidats/xavier-bertrand.csv) | NF | 8 |

## Une erreur ? Une idée ?

- **Dans l'app** : « Signaler une erreur » sur une proposition ou une loi envoie son numéro.
- **Sur GitHub** : ouvrez un [ticket « Erreur dans les données »](../../issues/new?template=erreur-donnees.yml).
- **Pour contribuer** : règles de source et de neutralité dans [CONTRIBUTING.md](CONTRIBUTING.md), et [code de conduite](CODE_OF_CONDUCT.md).

## Licences et soutien

- **Code** : [MIT](LICENSE).
- **Données** : [CC BY-SA 4.0](data/LICENSE.md), réutilisables en citant élire.
- **Portraits** : chacun sous sa propre licence, créditée dans l'écran « Crédits photos ».
- **Soutenir** : bouton « Sponsor » de GitHub.

---

## Pour les développeurs

Ce qui suit décrit l'état actuel du code ; les tâches ouvertes sont dans [todo.md](todo.md).

### Stack

- **Framework** : Expo SDK 57, React Native 0.86, React 19, React Compiler et routes typées.
- **Navigation** : Expo Router (`src/app/`) avec une barre d'onglets universelle (`expo-router/ui`).
- **État** : Zustand persisté dans `expo-sqlite/kv-store` en natif, `localStorage` sur le web.
- **UI** : `expo-image`, `react-native-reanimated`, `@expo/vector-icons`.
- **Données** : Zod 4 et papaparse, au build seulement.
- **Tests** : Jest (`jest-expo`).
- **Plateformes** : iOS, Android et Web en export statique.

### Commandes

- **Installer** : `npm install` (Node 22.18+, requis par `scripts/build-data.ts`).
- **Lancer** : `npx expo start` (ou `npm run web`, `npm run android`, `npm run ios`).
- **Tout vérifier** : `npm run check` (données, dataset à jour, typecheck, lint, tests).
- **Typecheck** : `npm run typecheck` (lancer `npx expo start` une fois avant, pour les routes typées).
- **Lint** : `npm run lint`.
- **Tests** : `npm test`.
- **Compiler les données** : `npm run build:data`, ou `build:data:strict` pour bloquer sur les avertissements.
- **Simuler le score** : `npm run simulate:scoring`.
- **Diagnostic Expo** : `npx expo-doctor`.
- **Ajouter un package** : `npx expo install <package>`.
- **Build de production** : `npx eas-cli@latest workflow:run create-production-builds.yml`.

### Pipeline des données

- **Sources** : `data/` est la seule source de vérité, éditée à la main selon [CONTRIBUTING.md](CONTRIBUTING.md).
- **Compilation** : `scripts/build-data.ts` valide tout avec Zod (`src/schemas/dataset.ts`) et écrit `src/data/dataset.json`.
- **Blocages** : le build échoue sur un schéma invalide, un id en double, une référence inconnue, une apostrophe ou un sigle manquant.
- **Numéros stables** : `data/refs.json` est géré par le build, jamais à la main.
- **Accès** : `src/services/dataset.ts` exporte les données en synchrone (`candidats`, `propositions`, `lois`, `getCandidat()`...).
- **Types** : déduits des schémas Zod.
- **Collecte et audit** : skills `.claude/skills/collecter-donnees/` et `.claude/skills/verifier-donnees/`, lisibles sans assistant IA.
- **Tableau du README** : à mettre à jour à la main quand un candidat ou son nombre de propositions change.

### Données utilisateur

- **Store** : `src/store/votes-store.ts` (Zustand `persist`, version 3) garde `votes`, `loiVotes`, `order`, `onboardingVersion`, `marker` et `marks`.
- **Ordre de passage** : `src/lib/shuffle.ts` mélange (Fisher-Yates) en alternant candidats et thèmes, un scrutin toutes les trois questions environ.
- **Score** : `src/lib/scoring.ts`, fonction pure et testée.
- **Constantes du score** : `MIN_VOTES_PER_CANDIDAT` (2), `GROUP_VOTE_WEIGHT` (0,5), `MAX_PARLEMENT_SHARE` (0,5), `RELIABILITY_FROM` (3 et 5 éléments).
- **Progression** : `src/lib/progress.ts` (paliers, bilans, `allVoted()`).

### Interface

- **Direction** : « le cahier annoté », décrite dans [DESIGN.md](DESIGN.md) et `.impeccable/surfaces/`.
- **Tokens** : `src/constants/theme.ts`, thème clair seulement.
- **Polices** : Literata, Atkinson Hyperlegible Next et Caveat, auto-hébergées sous SIL OFL 1.1 dans `assets/fonts/`.
- **Composants** : `src/components/ui/` pour la base, `src/components/` pour le métier (`proposition-sheet`, `vote-scale`, `share-card`...).
- **Partage** : `react-native-view-shot` et `expo-sharing`, partage de fichier ou téléchargement sur le web.
- **Textes légaux** : `src/constants/legal.ts`.
- **Logo** : sources dans `assets/brand/`, icônes rendues par `node scripts/build-brand.mjs`.
- **Captures des stores** : `assets/images/screenshots/`, refaites par `node scripts/build-screenshots.mjs <export>`.

### Documentation

- **Déploiement mobile** : [docs/feature-20261014-deploy.md](docs/feature-20261014-deploy.md).
- **Optimisations Android** : [docs/feature-20261019-android-opti.md](docs/feature-20261019-android-opti.md).
- **Historique des features** : un fichier `docs/feature-AAAAMMJJ-sujet.md` par lot.
- **Produit** : [PRODUCT.md](PRODUCT.md).
