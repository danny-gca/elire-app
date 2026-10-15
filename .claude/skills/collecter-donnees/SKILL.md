---
name: collecter-donnees
description: Récupérer et ajouter des données à élire (nouveau candidat, parti, propositions de programme, loi ou scrutin avec les votes des candidats), au bon format et avec des sources vérifiables. À utiliser pour compléter un candidat, intégrer un programme 2027 publié, ajouter un scrutin, ou mettre à jour une candidature.
---

# Collecter des données

Tout ajout suit `CONTRIBUTING.md` et se termine par le skill `verifier-donnees`. Rien n'est ajouté sans source précise.

## Sources, par ordre de préférence

1. Document officiel du candidat ou du parti : programme 2027 (PDF), livret thématique, site de campagne.
2. Discours ou entretien publié par le candidat (vidéo ou transcription officielle).
3. Presse de référence qui **cite** le candidat entre guillemets (pas un résumé).
4. Pour les votes : pages officielles des scrutins (Assemblée, Sénat, Parlement européen) et leur analyse par groupe.

Un programme 2022 reste utilisable tant qu'aucun programme 2027 n'est publié ; le dire dans `contexte`.

## Ajouter un candidat

1. Vérifier la candidature (déclaration ou désignation datée, avec source). Une simple rumeur ne suffit pas.
2. `data/partis.json` si le parti manque : `id`, `nom` (graphie du parti), `sigle` (seulement s'il l'utilise lui-même ou si la presse le fait ; sinon, aucun), `couleur` (celle de son logo), `nuanceOfficielle` (la nuance attribuée par le ministère de l'Intérieur à la dernière élection nationale du parti : `code`, `libelle`, `election`, `sourceUrl` ; absente s'il n'a jamais été classé, sans rien inventer), `siteWeb`.
3. `data/candidats.json` : `id` kebab-case (`prenom-nom`), `nom`, `partiId`, `avatar` (initiales), `biographie` d'une phrase, factuelle.
4. Photo : chercher sur Wikimedia Commons (licence CC0, CC BY ou CC BY-SA), garder le fichier exact, recadrer avec `scripts/crop-portrait.py` (carré 512 px centré sur le visage) vers `assets/images/candidates/<id>.jpg`, puis vérifier le résultat à l'œil ; l'ajouter à `src/constants/candidate-images.ts` et créditer dans `src/constants/credits.ts`. Pas de photo libre : initiales.
5. Créer `data/candidats/<id>.csv` (section suivante).

## Ajouter des propositions

`data/candidats/<candidat-id>.csv`, en-tête :

```
id,thematique_id,titre,description,source_url,date_declaration,contexte
```

- `id` : `prop-<initiales>-<n>` (ex. `prop-mt-7`), jamais réutilisé.
- `thematique_id` : un id de `data/thematiques.json`.
- `titre` : la mesure, courte et neutre.
- `description` : citation exacte « … », coupures `[...]`.
- `source_url` : le document précis ; `date_declaration` : `AAAA-MM-JJ` ou vide si la source n'est pas datée.
- `contexte` : type de document et circonstance (et page), puis les précisions utiles de la mesure (chiffres, modalités, exceptions), tirées de la source ; 250 caractères environ.
- Anonymat : ni nom du candidat ou du parti, ni slogan de campagne dans `titre`, `description` et `contexte` (lus pendant le vote à l'aveugle). Couper le nom de la citation avec `[...]`.
- Sigles : titre et question en clair (sigle seulement du quotidien, TVA, SMIC, RSA, SNCF, RATP, EDF, IVG, ou entre parenthèses après sa forme claire) ; chaque sigle des textes lus à l'aveugle est dans `data/glossaire.json` (le build bloque sinon).
- Viser le même nombre de propositions par candidat (8 aujourd'hui, un thème différent par proposition autant que possible), en choisissant des mesures centrales du programme plutôt que des marginales.
- Les numéros `P-xxx` sont attribués par le build : ne pas les écrire.

## Ajouter une loi ou un scrutin

`data/lois.json`, un objet :

- `id` : `<sujet>-<annee>` ; `thematiqueId` ; `nature` (`projet_loi`, `proposition_loi`, `motion_censure`, `declaration_gouvernement`, `resolution`, `texte_europeen`) ; `chambre` (`assemblee_nationale`, `senat`, `parlement_europeen`) ; `dateVote` ; `statut` (`adoptee`, `rejetee`, `en_cours`) ; `titre` ; `question` (posée à l'aveugle, sans nom de candidat, de parti ni de loi éponyme, sans résultat ; répondre « Pour » doit correspondre à la position « pour » du scrutin) ; `enjeu` (ce que fait le texte, sans nom ni résultat) ; `resume` factuel ; `sourceOfficielleUrl` = la page du scrutin.
- `votes` : une entrée par candidat concerné, `position` (`pour`, `contre`, `abstention`), `typeVote` (`individuel` si le candidat a voté lui-même, sinon `groupe_parti` avec `groupe` et `groupeNom` à la date), `explication` factuelle, `sourceUrl` du même scrutin.
- Choisir des scrutins publics à résultats nominatifs, sur des sujets des thèmes de l'app, qui concernent plusieurs candidats.

## Terminer

1. `npm run build:data:strict`, puis `npm run check`.
2. Lancer `verifier-donnees` sur ce qui a été ajouté.
3. Mettre à jour les chiffres de `PRODUCT.md` (propositions, candidats, scrutins) si besoin.
