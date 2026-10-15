---
name: verifier-donnees
description: Vérifier les données d'élire (candidats, partis, propositions, lois et votes au Parlement) contre leurs sources, corriger ou retirer ce qui ne tient pas, et consigner le résultat. À utiliser pour un audit complet, un candidat, une loi, une référence (P-531, L-28), un ticket « Erreur dans les données », ou après tout ajout de données.
---

# Vérifier les données

Règle d'or : **une donnée sans source précise qui la contient vraiment est retirée.** Jamais de supposition, jamais d'avis. En cas de doute, on retire et on le note.

Les règles de sourçage et de neutralité font foi dans `CONTRIBUTING.md`. Fichiers : `data/` (édités à la main) ; `src/data/dataset.json` est généré, ne jamais l'éditer.

## 1. Contrôle mécanique

```bash
node .claude/skills/verifier-donnees/scripts/check-sources.mjs                 # toutes les propositions
node .claude/skills/verifier-donnees/scripts/check-sources.mjs --candidat <id>  # un candidat
node .claude/skills/verifier-donnees/scripts/check-sources.mjs --lois           # + scrutins
```

- `ERREUR` : source introuvable (404…), page d'accueil, citation absente, scrutin différent entre la loi et un vote, vote de groupe sans sigle. À corriger.
- `A LIRE` : extrait non retrouvé mot pour mot, PDF illisible, site anti-robot (Légifrance, Parlement européen), serveur saturé. À ouvrir à la main : ce n'est pas une erreur tant que ce n'est pas lu.
- Le script ne juge ni le sens ni la neutralité : l'étape 2 reste obligatoire.

## 2. Lecture, élément par élément

Ouvrir chaque source (WebFetch, ou `pdftotext` pour un PDF) et vérifier :

**Proposition** (`data/candidats/<id>.csv`)
- La source est le document qui contient la mesure (programme, discours, entretien), pas une page d'accueil ni un article qui la commente.
- `description` = citation exacte entre « », coupures notées `[...]`, plusieurs extraits séparés par ` ; `.
- `titre` = la mesure réelle, reformulée court et neutre : pas d'adjectif qui juge, pas de comparaison, pas de commentaire.
- Titre fidèle : il ne dit rien que la citation ne dit pas (ni chiffre, ni portée, ni condition en plus ou en moins) ; relire titre et citation côte à côte. Sinon : **reformulée**.
- `contexte` = type de document et circonstance (et page), puis les précisions de la mesure ; chaque précision doit figurer dans la source. Programme 2022 indiqué comme tel tant que le 2027 n'est pas publié.
- Anonymat (vote à l'aveugle) : aucun nom de candidat, de parti ou de slogan de campagne dans `titre`, `description` ou `contexte`.
- Sigles : titre et question en clair (sigle seulement du quotidien, TVA, SMIC, RSA, SNCF, RATP, EDF, IVG, ou entre parenthèses après sa forme claire) ; chaque sigle des textes lus à l'aveugle est dans `data/glossaire.json` (le build bloque sinon).
- Lisibilité : titre d'une idée (environ 90 caractères), mots simples, sigles expliqués ; citation courte.
- `thematique_id` cohérent, auteur bien le candidat (pas un cadre du parti).
- Verdict : **confirmée**, **reformulée** (titre ou citation corrigés selon la source) ou **retirée** (introuvable).

**Candidat** (`data/candidats.json`)
- Candidature déclarée ou désignation officielle, avec une source datée ; sinon le signaler.
- Parti et biographie factuels et neutres.
- Photo : fichier exact sur Wikimedia Commons sous CC0, CC BY ou CC BY-SA, crédité dans `src/constants/credits.ts`. « Tous droits réservés » : pas de photo, initiales.

**Parti** (`data/partis.json`) : nom et sigle officiels, site officiel joignable, nuance officielle du ministère de l'Intérieur retrouvée dans sa source (résultats ou circulaire), ou absente.

**Loi et votes** (`data/lois.json`)
- `sourceOfficielleUrl` : la page du scrutin (Assemblée `assemblee-nationale.fr/dyn/<législature>/scrutins/<n>`, Sénat, Parlement européen), pas un article.
- Date, statut, nature exacts ; `resume` factuel, sans qualificatif.
- `individuel` seulement si le candidat siégeait à cette date et apparaît dans l'analyse nominative.
- `groupe_parti` : la position majoritaire de son groupe dans l'analyse par groupe, avec `groupe` (sigle à la date) et `groupeNom`. Si le parti n'avait aucun élu ni groupe dans cette chambre à cette date, le vote est **retiré**.
- `explication` : un fait (« a voté pour avec son groupe »), jamais une opinion (« coup de force », « courageux »).
- Le `sourceUrl` du vote pointe vers le même scrutin.

## 3. Corriger et consigner

1. Corriger dans `data/`, puis `npm run build:data:strict` (doit passer) et `npm run check`.
2. Ne jamais renuméroter : les références `P-xxx` / `L-xx` sont stables (`data/refs.json`).
3. Ajouter une section datée dans `docs/verification-donnees.md` : comptes (confirmées, reformulées, retirées) et liste des changements, une ligne par élément.
4. Si un ticket GitHub est à l'origine, citer sa référence et la source correcte dans la réponse.

## Neutralité

- Même exigence pour tous les candidats ; signaler un déséquilibre (nombre de propositions, couverture des votes).
- Aucun choix de mot, d'ordre ou de mise en avant ne doit favoriser un candidat.
