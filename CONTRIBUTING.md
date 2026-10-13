# Contribuer à ÉLIRE

Merci de votre aide. ÉLIRE vit de deux choses : des données exactes et une neutralité stricte. Toute contribution est relue sur ces deux points.

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
| `data/lois.json` | Scrutins et position de chaque candidat |
| `data/candidats.json`, `partis.json`, `thematiques.json` | Référentiels |
| `data/refs.json` | Numéros stables, géré par le build : ne pas éditer |

### Règles de sourçage

1. **Une source précise** : le programme, le discours ou le scrutin qui contient la mesure. Une page d'accueil est refusée.
2. **Description = citation exacte** entre « », copiée de la source.
3. **Titre = reformulation neutre et courte** de la mesure, sans commentaire, sans adjectif qui juge.
4. **Contexte** = titre du document source.
5. **Votes au Parlement** : `individuel` seulement si le candidat a voté lui-même ; sinon `groupe_parti` avec le groupe (`groupe`, `groupeNom`).

### Neutralité

- Même traitement pour chaque candidat : même nombre de propositions visé, mêmes exigences de source.
- Pas de couleur, d'ordre ou de mise en avant propre à un candidat ou un parti.
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
- Ajoutez une dépendance avec `npx expo install <package>`.
- La direction visuelle est décrite dans `DESIGN.md` : le jaune est réservé aux votes de l'utilisateur.
- Si le comportement change, mettez à jour `README.md` et `PRODUCT.md`.

## Commits et pull requests

- Messages au format `type(zone): description`, en français : `feat(explorer): …`, `fix(data): …`, `docs: …`.
- Une PR = un sujet. Décrivez quoi et pourquoi en quelques phrases.
- Les données et le code peuvent être dans des PR séparées : c'est plus simple à relire.

## Licences

En contribuant, vous acceptez que votre code soit publié sous [licence MIT](LICENSE) et vos données sous [CC BY-SA 4.0](data/LICENSE.md).
