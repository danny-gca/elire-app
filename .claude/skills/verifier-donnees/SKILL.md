---
name: verifier-donnees
description: Vérifier les données d'élire (candidats, partis, propositions, lois et votes au Parlement) contre leurs sources, corriger ou retirer ce qui ne tient pas, et consigner le résultat dans la note de validation de chaque élément. À utiliser pour un audit complet, un candidat, une loi, une référence (P-531, L-28), un ticket « Erreur dans les données », ou après tout ajout de données.
---

# Vérifier les données

Règle d'or : **une donnée sans source précise qui la contient vraiment est retirée.** Jamais de supposition, jamais d'avis. En cas de doute, on retire et on le note.

Les règles de sourçage et de neutralité font foi dans `CONTRIBUTING.md`. Fichiers : `data/` (édités à la main) ; `src/data/dataset.json` est généré, ne jamais l'éditer.

## 0. Que vérifier

```bash
npm run a-verifier                        # docs/a-verifier.md : jamais validé, modifié, périmé
npm run a-verifier -- --candidat <id>     # un candidat
```

Ne relire que ce qui sort de cette liste : un élément « validé » (même contenu qu'à sa validation, pas périmé) n'est pas à refaire. Statut interne, dans `data/` (colonnes `valide_*` des CSV, champ `validation` des JSON), jamais dans l'app.

## 1. Contrôle mécanique

```bash
node .claude/skills/verifier-donnees/scripts/check-sources.mjs                 # toutes les propositions
node .claude/skills/verifier-donnees/scripts/check-sources.mjs --candidat <id>  # un candidat
node .claude/skills/verifier-donnees/scripts/check-sources.mjs --lois           # + scrutins
node .claude/skills/verifier-donnees/scripts/check-votes.mjs [--loi <id>]       # votes recalculés depuis la page du scrutin (Assemblée)
```

`check-votes` relit date, statut, voix du résumé, décompte de chaque groupe et votes nominatifs ; il retourne les positions des motions de rejet, amendements de suppression et motions de censure d'une réforme.

- `ERREUR` : source introuvable (404…), page d'accueil, citation absente, scrutin différent entre la loi et un vote, vote de groupe sans sigle. À corriger.
- `A LIRE` : extrait non retrouvé mot pour mot, PDF illisible, site anti-robot (Légifrance, Parlement européen), serveur saturé. À ouvrir à la main : ce n'est pas une erreur tant que ce n'est pas lu.
- Le script ne juge ni le sens ni la neutralité : l'étape 2 reste obligatoire.

### Liens

```bash
node .claude/skills/verifier-donnees/scripts/check-links.mjs                      # tous les liens de data/ et src/constants/
node .claude/skills/verifier-donnees/scripts/check-links.mjs --fichier lois.json  # un fichier
```

Contrôle chaque lien affiché dans l'application (sources, votes, sites, crédits photo) et donne son emplacement. À lancer à chaque audit et avant chaque build : un lien mort fait rejeter l'application par Google Play.

- `ERREUR` (404, 410, domaine disparu) : chercher un lien de remplacement, dans cet ordre :
  1. la même page à sa nouvelle adresse sur le même site (recherche web `site:<domaine> <titre>`, plan du site, page parente) ;
  2. une page officielle équivalente : pour un vote, la page du scrutin (Assemblée `dyn/<législature>/scrutins/<n>`, Sénat `scrutin-public/<année>/scr<année>-<n>.html`, liste du dossier `scrutin-public/dossiers/<dossier>_scr.html`, Congrès `dyn/<législature>/scrutins/c<n>`) ;
  3. pour une proposition seulement, la copie d'archive `web.archive.org` de la page d'origine.

  Le remplaçant doit être lu et contenir vraiment la donnée (citation, vote nominatif, position du groupe), sinon la donnée est **retirée**. Un lien inventé ou deviné est interdit : on l'ouvre avant de l'écrire.
- `A LIRE` (anti-robot, serveur saturé) : ouvrir avec WebFetch. Si la page existe, rien à faire ; si une page officielle sans blocage dit la même chose, la préférer (le vérificateur de Google Play est aussi un robot).

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
- `type_source` exact : `programme_2027` seulement pour un document de campagne 2027 (programme, site, livret, tract, manifeste) ; un programme 2017, 2022 ou 2024 est `programme_anterieur` ; une interview, un discours, un article ou un acte de ministre est `prise_de_position`.
- Verdict : **confirmée**, **reformulée** (titre ou citation corrigés selon la source) ou **retirée** (introuvable).

**Candidat** (`data/candidats.json`)
- Candidature annoncée (`annoncee`) ou investie par le parti (`investie`), avec une source datée ; sinon le signaler. `officielle` seulement si le candidat figure sur la liste publiée par le Conseil constitutionnel.
- `programme` : `complet` seulement si un programme 2027 entier est publié (l'`url` y mène), `partiel` pour des premières mesures, un dépliant ou un site en cours, sinon `aucun` ; `date` seulement si la source la donne. Une publication annoncée à une date précise (programme complet, livret) va dans `annonce` (`date`, `sourceUrl` qui la cite) : une fois la date passée, le build la rappelle jusqu'à la mise à jour de `programme` et le retrait d'`annonce`.
- Parti et biographie factuels et neutres. Un mouvement de campagne ne sert de parti que s'il est une structure politique déclarée (association, mouvement enregistré auprès de la CNCCFP) ; sinon l'étiquette d'origine, ou aucune (« Indépendant »).
- Photo : fichier exact sur Wikimedia Commons sous CC0, CC BY ou CC BY-SA, crédité dans `src/constants/credits.ts`. « Tous droits réservés » : pas de photo, initiales.

**Parti** (`data/partis.json`) : nom et sigle officiels, site officiel joignable, nuance officielle du ministère de l'Intérieur retrouvée dans sa source (résultats ou circulaire), ou absente.

**Loi et votes** (`data/lois.json`)
- `sourceOfficielleUrl` : la page du scrutin (Assemblée `assemblee-nationale.fr/dyn/<législature>/scrutins/<n>`, Sénat, Parlement européen), pas un article.
- Date, statut, nature exacts ; `resume` factuel, sans qualificatif.
- `question` : directe, affirmative, sans double négation ni tournure de rejet procédural (ex. pas de « Rejet de... »). Répondre « Pour » doit signifier sans ambiguïté vouloir la mesure sur le fond.
- `individuel` seulement si le candidat siégeait à cette date et apparaît dans l'analyse nominative.
- `groupe_parti` : la position majoritaire des élus de son parti dans l'analyse nominative (au Parlement européen, la délégation française du parti, pas tout le groupe européen ; à l'Assemblée et au Sénat, le groupe où siègent les élus de son parti, sauf si c'est le groupe du parti d'un autre candidat : pas de vote de groupe, seulement ses votes personnels), avec `groupe` (sigle à la date) et `groupeNom`. Égalité ou pas de majorité nette : le vote est **retiré**. Si le parti n'avait aucun élu dans cette chambre à cette date, le vote est **retiré**.
- `explication` : un fait (« a voté pour avec son groupe »), jamais une opinion (« coup de force », « courageux »).
- Le `sourceUrl` du vote pointe vers le même scrutin.

**Enjeu** (`data/enjeux.json`)
- Chaque position porte la même idée que la question (`pour`) ou dit explicitement l'inverse (`contre`) : relire la citation de chaque proposition. Une position déduite d'un silence ou d'une mesure voisine est **retirée** de l'enjeu (la proposition redevient seule).
- La `question` est neutre, anonyme, d'une idée ; l'`enjeu` ne reprend aucun chiffre propre à un candidat.
- Une proposition qui mêle deux idées n'entre pas dans un enjeu.

**Sujet** (`data/sujets.json`, onglet « Contexte »)
- Chaque fait de `aujourdhui` est dans l'un de ses liens, ouvert et lu ; sinon il est **retiré**. Les chiffres sont datés.
- `enDebat` est symétrique : chaque option a son argument, sans adjectif qui juge ni nom.
- Il ne trahit ni l'auteur d'une proposition ni le résultat d'un scrutin rattaché ; un lien qui les donne porte `aveugle: false`. Exception (validée le 2026-11-11) : la règle en vigueur peut être décrite même si elle découle d'un texte voté (ex. âge de départ à la retraite).
- Le build signale une question sans sujet, un sujet d'aucune question, un sujet sans année, sans source lisible pendant le vote, ou relu il y a plus de 180 jours.

## 3. Corriger et valider

1. Corriger dans `data/`, puis `npm run build:data:strict` (doit passer) et `npm run check`.
2. Ne jamais renuméroter : les références `P-xxx` / `L-xx` sont stables (`data/refs.json`).
3. Valider chaque élément relu, même confirmé : `npm run valider -- <id | genre:id>... --par claude --note "<verdict> : source, page, ce qui a été vérifié ou corrigé (avant -> après)"` (`--candidat <id>` : le candidat et ses propositions ; `--modifies` : tout ce qui a changé depuis sa validation). `--par danny` quand Danny a relu et approuvé. La note, datée, s'ajoute en tête de l'historique de l'élément (`valide_note` ou `validation.note`) : c'est le seul registre des vérifications, pas de fichier à part. Une note par verdict : valider séparément les éléments dont le motif diffère. L'empreinte du contenu est enregistrée : toute modification ultérieure fait retomber l'élément en « modifié ».
4. Un élément retiré n'a plus de validation : le motif va dans le message de commit.
5. Si un ticket GitHub est à l'origine, citer sa référence et la source correcte dans la réponse.

## Neutralité

- Même exigence pour tous les candidats ; signaler un déséquilibre (nombre de propositions, couverture des votes).
- Aucun choix de mot, d'ordre ou de mise en avant ne doit favoriser un candidat.
