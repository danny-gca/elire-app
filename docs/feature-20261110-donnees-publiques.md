# Données publiques sur elire-website (2026-11-10)

## Pourquoi

Deux besoins, une seule solution :

1. **Transparence** : montrer à tout le monde, sans app ni GitHub, toutes les données qu'élire utilise. Sur l'accueil du site : « Toutes nos données sont là » -> page « Nos données » en onglets (candidats, partis, propositions, scrutins, enjeux, glossaire).
2. **Mises à jour sans store** : l'app télécharge les données publiées sur le site. Corriger une proposition ou ajouter un candidat ne demande plus de release.

Site et app lisent **le même fichier**. Ce que le visiteur voit sur le site est exactement ce que l'app affiche.

## Objectifs, non-objectifs, anti-objectifs

**Objectifs**
- Page « Nos données » lisible sur téléphone, avec chaque élément, sa référence (`P-531`, `L-28`) et ses sources cliquables.
- Téléchargement brut : `dataset.json` et un CSV par type.
- App : données à jour sans release, hors ligne garanti.
- Supprimer les chiffres codés en dur du site (`COUNTS`, `DATA_DATE` dans `elire-website/src/config.ts`, déjà faux : 25 candidats affichés pour 27, 196 propositions pour 191).

**Non-objectifs**
- Aucune modification des données en ligne, aucun compte.
- Pas de déplacement de `data/`, des skills `collecter-donnees` / `verifier-donnees` ni de `CONTRIBUTING.md` : la source de vérité reste elire-app.
- Pas de nouveaux écrans dans l'app (seulement un lien vers « Nos données »).
- Pas de dérivation de `scrutins.json` / `exemples.json` du site (choix éditoriaux de l'accueil, on n'y touche pas).

**Anti-objectifs** (échec même si ça marche)
- Une app vide ou cassée au premier lancement hors ligne, ou après un JSON publié invalide.
- Un tableau type Excel illisible sur mobile, ou un « air gouv » / base de données froide qui trahit la direction « cahier annoté ».
- Un site et une app qui affichent des données différentes.
- Un envoi de données personnelles : seul un GET anonyme de fichiers publics est autorisé.

## Architecture

```
elire-app (main)                          elire-website (GitHub Pages)              app (iOS, Android, web)
data/ -> build:data -> src/data/dataset.json
        push main ──repository_dispatch──> build : récupère dataset.json
                                           publie /donnees/version.json   <── GET au lancement (petit)
                                           publie /donnees/dataset.json   <── GET si version différente
                                           publie /donnees/csv/*.csv
                                           pages /donnees/*
```

- **Version** = `metadata.generatedAt`, qui ne change déjà que si le contenu change (`previousGeneratedAt` dans [scripts/build-data.ts](../scripts/build-data.ts)).
- **`metadata.schemaVersion`** (nouveau, entier, départ `1`) : incrémenté seulement quand la forme du dataset casse les anciennes apps. L'app refuse un dataset dont le `schemaVersion` dépasse celui qu'elle connaît.
- **URL publique** : `https://danny-gca.github.io/elire-website/donnees/` (base `/elire-website` dans `astro.config.mjs`).

### Coût et charge

GitHub Pages n'a pas d'offre payante : limite souple de 100 Go/mois, 1 Go de site. `version.json` fait environ 150 o ; `dataset.json` (530 Ko) se compresse vers 100-150 Ko et n'est téléchargé qu'au changement. Soit environ 700 000 téléchargements complets par mois. Plan B si ça explose : Cloudflare Pages (bande passante gratuite illimitée), seule l'URL change.

## Phase 1 : elire-app publie

| Fichier | Changement |
|---|---|
| [src/schemas/dataset.ts](../src/schemas/dataset.ts) | `metadata.schemaVersion: z.number().int().positive()` + export `DATASET_SCHEMA_VERSION = 1`. |
| [scripts/build-data.ts](../scripts/build-data.ts) | Écrire `schemaVersion: DATASET_SCHEMA_VERSION` dans `metadata` (sans changer `generatedAt` si rien d'autre ne bouge). |
| `.github/workflows/publier-donnees.yml` (nouveau) | Sur push `main` touchant `data/**` ou `src/data/dataset.json` : `repository_dispatch` (type `donnees-a-jour`) vers `danny-gca/elire-website`. Secret : PAT fine-grained limité à elire-website, permission « Contents: read & write » (exigée par l'API dispatch). |
| [src/schemas/__tests__/dataset.test.ts](../src/schemas/__tests__/dataset.test.ts) | Test : le dataset compilé porte `schemaVersion === DATASET_SCHEMA_VERSION`. |

## Phase 2 : elire-website affiche

### Données

| Fichier | Changement |
|---|---|
| `scripts/fetch-dataset.mjs` (nouveau) | Avant `astro build` : télécharge `https://raw.githubusercontent.com/danny-gca/elire-app/main/src/data/dataset.json`, vérifie `schemaVersion` et la présence des tableaux, écrit `src/data/dataset.json` (gitignoré). Échec réseau ou contrôle = build en échec (le site en ligne reste l'ancien). |
| `package.json` | `prebuild` / `predev` -> `fetch-dataset`. |
| `.github/workflows/deploy.yml` | Déclencheurs en plus : `repository_dispatch: types: [donnees-a-jour]` et `schedule` hebdomadaire (filet si le dispatch rate). |
| `src/pages/donnees/version.json.ts` (nouveau) | Endpoint statique : `{ generatedAt, schemaVersion }`. |
| `src/pages/donnees/dataset.json.ts` (nouveau) | Endpoint statique : le dataset tel quel. |
| `src/pages/donnees/csv/[type].csv.ts` (nouveau) | Un CSV par type (candidats, partis, propositions, lois, votes, enjeux, glossaire), UTF-8 avec BOM pour Excel, une colonne `ref`. |
| `src/config.ts` | `COUNTS` et `DATA_DATE` calculés depuis `metadata` au lieu d'être codés en dur. |

CORS : l'app web (`danny-gca.github.io/elire-app/`) est sur la même origine que le site, rien à faire. Les apps natives ne sont pas concernées. Si le site change de domaine, vérifier `Access-Control-Allow-Origin` avec un `curl -I`.

### Pages

| Route | Contenu |
|---|---|
| `/donnees/` | Intro courte (d'où viennent les données, date, comment signaler une erreur), compteurs, liens de téléchargement, onglets. |
| `/donnees/candidats/` | Fiches candidat : parti, statut de candidature et sa source, nombre de propositions et de votes. |
| `/donnees/partis/` | Partis. |
| `/donnees/propositions/` | Propositions, groupées par thématique. |
| `/donnees/scrutins/` | Lois et scrutins avec le vote de chaque candidat. |
| `/donnees/enjeux/` | Questions communes et leurs propositions. |
| `/donnees/glossaire/` | Glossaire. |

Choix de conception (mes décisions, à challenger) :
- **Une page statique par onglet**, pas un onglet JS : chaque onglet a une URL partageable, la page s'affiche sans JS, Astro génère tout au build.
- **Ancre par élément** (`/donnees/propositions/#P-531`) : lien direct depuis un signalement, un article, et plus tard depuis l'app.
- **Fiches, pas tableau, sur mobile** : référence dans la ligne d'infos (pas de colonne de marge, cf. règle de l'app), sources en liens. Sur grand écran, l'impeccable shape décidera si un tableau dense apporte quelque chose.
- **Recherche et filtres** (texte, candidat, thématique) : petit script côté client sur la page, amélioration progressive ; sans JS tout reste listé.
- **« Signaler une erreur » sur chaque fiche** : même formulaire pré-rempli que l'app (`reportUrl(ref, titre)` de [src/constants/app.ts](../src/constants/app.ts), à reproduire côté site).
- Accueil : un encart « Toutes nos données sont là » -> `/donnees/`, et lien dans le pied de page.

### Design avec le skill impeccable (dans elire-website)

Contexte à donner : `PRODUCT.md`, `DESIGN.md` du site, direction « cahier annoté » (papier `#F6F7F5`, encre, surligneur réservé au geste du lecteur, Literata / Atkinson Hyperlegible Next). À éviter : air gouv, base de données froide, gadget.

1. **Mettre à jour `PRODUCT.md`** : nouvelle page « Nos données », public (citoyens, journalistes, curieux, sur téléphone), but (vérifier, télécharger, signaler).
2. **`impeccable shape`** sur `/donnees/` et un onglet type (propositions, le plus dense) : structure, navigation entre onglets, fiche, recherche. Valider le contrat avec Danny avant de coder.
3. **Construire** les 7 pages sur le contrat validé.
4. **`impeccable critique`** puis **`impeccable audit`** : lisibilité à 360 px, accessibilité (onglets au clavier, contrastes, lecteurs d'écran), poids de page avec 191 propositions et 47 scrutins.
5. **`impeccable harden`** : recherche sans résultat, textes très longs, élément sans source, JS désactivé.
6. **`impeccable polish`**, puis mise à jour de `DESIGN.md` (impeccable-documenter) à partir de ce qui est livré.

## Phase 3 : l'app lit les données à distance

Principe : **le dataset actif est choisi de façon synchrone au démarrage**, avant le premier rendu. Les 24 fichiers qui importent [src/services/dataset.ts](../src/services/dataset.ts) ne changent pas. Une nouvelle version téléchargée s'applique **au lancement suivant** : pas d'écran qui change sous les doigts, pas de refactor réactif.

| Fichier | Changement |
|---|---|
| [src/services/dataset.ts](../src/services/dataset.ts) | `const dataset = pickDataset(embedded, readCache())` : le cache s'il est valide (`schemaVersion` connu) **et** plus récent que l'embarqué (`generatedAt`), sinon l'embarqué. Une release embarque donc toujours un dataset au moins aussi frais. |
| `src/services/dataset-sync.ts` (nouveau) | Au lancement et au retour au premier plan (au plus une fois toutes les 6 h) : GET `version.json` ; si `generatedAt` diffère et `schemaVersion` connu, GET `dataset.json`, validation complète, écriture du cache. Toute erreur est silencieuse : on garde ce qu'on a. |
| [src/lib/storage.ts](../src/lib/storage.ts) et [storage.web.ts](../src/lib/storage.web.ts) | Clé `dataset-cache` (et `dataset-cache-checked-at`) dans le kv-store SQLite existant ; lecture synchrone déjà disponible (`getItemSync`). |
| `package.json` | `zod` passe de `devDependencies` à `dependencies` (validation à l'exécution). Validation complète seulement au téléchargement, en arrière-plan ; au démarrage, seulement `schemaVersion` + `generatedAt`. |
| [src/constants/app.ts](../src/constants/app.ts) | `DATA_URL = SITE_URL + 'donnees/'`. |
| [src/store/votes-store.ts](../src/store/votes-store.ts) | Rien a priori : `merge` retire déjà ce qui a disparu. À couvrir par un test avec un dataset réduit (proposition retirée après un vote). |
| [src/components/data-footer.tsx](../src/components/data-footer.tsx) | Lien « Toutes nos données » vers le site. |
| Mentions légales / politique de confidentialité (app et site) | Préciser que l'app télécharge des fichiers publics depuis GitHub Pages (requête anonyme, aucune donnée envoyée). « Tout reste sur votre appareil » reste vrai. |
| [src/app/_layout.tsx](../src/app/_layout.tsx) | Lancer `dataset-sync` après le premier rendu. |

Tests (dans la même modif) :
- `pickDataset` : cache absent, corrompu, `schemaVersion` inconnu, plus ancien que l'embarqué, plus récent.
- `dataset-sync` avec `fetch` mocké : même version (pas de 2e requête), nouvelle version valide (cache écrit), JSON invalide (cache intact), hors ligne, délai de 6 h respecté.
- `votes-store` : vote sur une proposition absente du nouveau dataset.
- Puis `npm run check` complet (build:data, typecheck, lint, jest).

## Phase 4 : doc et outillage

- `CONTRIBUTING.md` et skills `collecter-donnees` / `verifier-donnees` : une donnée fusionnée sur `main` est publique sur le site en quelques minutes et dans les apps au lancement suivant. Une erreur publiée l'est aussi : ne fusionner qu'après `verifier-donnees`.
- README du site : d'où viennent les données, comment relancer une publication (`workflow_dispatch`).

## Ordre et points ouverts

Ordre : phase 1 -> 2 (le site existe et publie) -> 3 (l'app consomme) -> 4.

À trancher :
- Hors stores, l'app web (`elire-app` sur Pages) pourrait aussi lire le dataset distant : utile ou on garde l'embarqué pour elle (redéployée à chaque push de toute façon) ?
- Faut-il dire à l'utilisateur que des données nouvelles s'appliqueront au prochain lancement, ou rester silencieux (la date est déjà dans le pied de page) ?
