# Contribuer à élire

Merci de votre aide. élire vit de deux choses : des données exactes et une neutralité stricte. Toute contribution est relue sur ces deux points.

En participant, vous acceptez le [code de conduite](CODE_OF_CONDUCT.md).

## Signaler une erreur

Le plus utile, et sans écrire de code.

- Dans l'app : « Signaler une erreur » sur une proposition ou une loi ouvre un ticket pré-rempli avec son numéro (`P-531`, `L-28`).
- Sur GitHub : [nouveau ticket « Erreur dans les données »](../../issues/new?template=erreur-donnees.yml).

Donnez la source correcte si vous l'avez : un document précis, pas une page d'accueil.

## Données

Les données éditoriales sont dans `data/`, éditées à la main. `src/data/dataset.json` est généré : ne le modifiez jamais directement.

| Fichier | Contenu |
|---|---|
| `data/candidats/<candidat-id>.csv` | Propositions d'un candidat : `id, thematique_id, titre, description, source_url, date_declaration, contexte` |
| `data/lois.json` | Scrutins et position de chaque candidat ; `question` et `enjeu` sont lus pendant le vote à l'aveugle (sans nom ni résultat, « Pour » = la position « pour » du scrutin) |
| `data/glossaire.json` | Sigles des textes lus à l'aveugle : `sigle`, `forme` développée, `definition` d'une phrase (affichés dans « En savoir plus ») |
| `data/candidats.json`, `partis.json`, `thematiques.json` | Référentiels |
| `data/refs.json` | Numéros stables, géré par le build : ne pas éditer |

### Règles de sourçage

1. **Une source précise** : le programme, le discours ou le scrutin qui contient la mesure. Une page d'accueil est refusée.
2. **Description = citation exacte** entre « », copiée de la source.
3. **Titre = reformulation neutre et courte** de la mesure, sans commentaire, sans adjectif qui juge.
4. **Contexte** = type de document et circonstance, puis les précisions de la mesure absentes du titre (chiffres, modalités, exceptions). Uniquement des faits tirés de la source, 250 caractères environ, sans répéter la date.
5. **Anonymat** : titre, description et contexte sont lus pendant le vote à l'aveugle. Aucun nom de candidat, de parti ou de slogan de campagne : on coupe le nom de la citation avec `[...]` et on décrit le document sans le nommer par son auteur (« Programme 2027, p. 24 », « Interview rapportée par Public Sénat »).
6. **Titre fidèle** : le titre résume la citation sans la déformer, sans rien ajouter ni retirer (chiffre, portée, condition). La page « Méthode et corrections » le promet.
7. **Simple et court** : un titre d'une idée (environ 90 caractères) ; une citation de moins de 200 caractères environ.
8. **Sigles** : un titre ou une question s'écrit en clair ; un sigle n'y reste que s'il est du quotidien (TVA, SMIC, RSA, SNCF, RATP, EDF, IVG) ou entre parenthèses après sa forme claire (« l'Alliance atlantique (OTAN) »). Tout sigle des textes lus à l'aveugle (titre, description, contexte, question, enjeu) doit figurer dans `data/glossaire.json` (sigle, forme développée, une phrase) : il s'affiche dans « En savoir plus ». Le build bloque sinon.
9. **Votes au Parlement** : `individuel` seulement si le candidat a voté lui-même ; sinon `groupe_parti` avec le groupe (`groupe`, `groupeNom`).

### Entrée d'un candidat

- Un candidat entre quand sa candidature est **déclarée** (annonce publique par la personne) ou **désignée** (vote ou décision officielle de son parti), avec une source datée. « Pressenti » ou « envisage » ne suffit pas.
- Il sort s'il se retire ou s'il est remplacé ; ses propositions restent dans l'historique du dépôt.
- Chaque nouveau candidat arrive avec le même nombre de propositions que les autres.

### Neutralité

- Même traitement pour chaque candidat : même nombre de propositions visé, mêmes exigences de source.
- Pas d'ordre ni de mise en avant propre à un candidat ou un parti. Chaque parti a sa couleur (celle de son logo, dans `data/partis.json`), posée de la même façon pour tous et seulement sur son identité (anneau du portrait ; sur la fiche, bandeau et nom du parti) : jamais sur un score, un vote, ni pendant le vote à l'aveugle.
- Un fait vérifiable, jamais une opinion.

Après modification :

```bash
npm run build:data:strict   # valide les schémas, ids, références et apostrophes
node .claude/skills/verifier-donnees/scripts/check-sources.mjs --lois   # sources joignables, citations retrouvées
```

Les procédures complètes (ajout et vérification) sont dans `.claude/skills/collecter-donnees/` et `.claude/skills/verifier-donnees/`, lisibles aussi sans assistant IA.

## Code

```bash
npm install          # Node 22.18+
npx expo start       # serveur de dév (web, iOS, Android)
npm run check        # données + typecheck + lint + tests, à passer avant toute PR
```

- Expo SDK 57 : avant de toucher une API Expo, lisez la doc de cette version (voir `AGENTS.md`).
- Ajoutez une dépendance avec `npx expo install <package>` (version compatible avec le SDK), jamais `npm install <package>`.
- Mettez le SDK Expo à jour d'un bloc : `npx expo upgrade` pour changer de SDK, puis `npx expo install --fix` pour réaligner `expo-*`, `@expo/*`, React et React Native, et `npx expo-doctor` pour vérifier. Dependabot ne propose que les correctifs de ces paquets.
- La direction visuelle est décrite dans `DESIGN.md` : le jaune est réservé aux votes de l'utilisateur.
- Si le comportement change, mettez à jour `README.md` et `PRODUCT.md`.

## Commits et pull requests

- Messages au format [Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/) : `type(zone): description`, en français, à l'impératif et sans point final.
  - `feat` : nouvelle fonction (`feat(classement): partager l'image`)
  - `fix` : correction (`fix(data): citation de P-412`)
  - `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `chore` (outillage, dépendances : `chore(deps): …`)
  - zone facultative : `data`, `voter`, `classement`, `lois`, `explorer`, `fiche`, `site`, `deps`...
  - changement cassant : `!` après le type (`feat(data)!: …`) et une ligne `BREAKING CHANGE:` dans le corps.
- Une PR = un sujet. Décrivez quoi et pourquoi en quelques phrases. Son titre suit le même format : il devient le commit de `main` à la fusion.
- Versions : [release-please](https://github.com/googleapis/release-please) en déduit la prochaine (`fix` : 1.0.**1**, `feat` : 1.**1**.0, `!` : **2**.0.0) et tient à jour une PR de release (`CHANGELOG.md`, `package.json`, `app.json`). La fusionner crée le tag `vX.Y.Z`, qui lance le build Android et son envoi en test interne sur EAS.
- Les données et le code peuvent être dans des PR séparées : c'est plus simple à relire.

## Licences

En contribuant, vous acceptez que votre code soit publié sous [licence MIT](LICENSE) et vos données sous [CC BY-SA 4.0](data/LICENSE.md).
