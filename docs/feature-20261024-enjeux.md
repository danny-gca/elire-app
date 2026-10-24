# Enjeux communs, type de source et programme complet

Demandes du 2026-10-24. Branche `feat/updates`.

Légende : **[Danny]** = demandé tel quel, **[Proposition]** = ma proposition, pas encore validée, **[À trancher]** = Danny décide avant la suite, **[Décidé]** = validé ensemble, **[Fait]** = dans le code.

## 0. Pourquoi

**[Danny]** Trop de questions se ressemblent dans Voter, et certaines ne viennent peut-être pas d'un programme. But premier : plus de doublons.

Ce qu'on trouve aujourd'hui dans les 194 propositions (relevé du 2026-10-24, titres seuls) :

| Sujet | Propositions proches | Opposées |
| --- | --- | --- |
| Nouveaux réacteurs nucléaires | am-1, ep-2, ez-7, fro-2 | |
| Éolien | am-1, ep-2 (développer) | fp-4, mlp-7 (démanteler) |
| Référendum d'initiative citoyenne | fa-3, fp-2, mlp-5, nda-2, ob-3 | |
| Quitter l'OTAN | fa-2, fro-7, jl-8, jlm-6 | |
| Hausse du budget de la défense | db-3, ez-8, kb-2, rg-1 | sl-3 (le réaffecter) |
| Impôt sur la fortune | fr-5, mt-7, nda-6, rg-2 | |
| Âge de la retraite | ep-1, xb-3 (reculer) | jlm-3 (60 ans) |
| Régulariser les sans-papiers | ak-4, na-6, sl-4 | ep-8 (diviser l'immigration) |
| Prix minimums agricoles | fr-4, fro-4, jl-1, jlm-4, rg-7 | |
| Pas de normes au-delà de l'Europe | dl-8, ga-6, kb-7, xb-7 | |
| Chefs d'établissement qui recrutent | dl-3, ep-3, ob-6 | |
| Peines planchers | br-1, ep-7, mlp-1 | |
| Logement social | fro-5, jlm-5 | ez-5 (supprimer le quota SRU) |

Ordre de grandeur : 194 questions de propositions pourraient tomber vers 140 à 150. Relevé à refaire par le script (lot 3).

## 1. Lots

| Lot | Sujet | État |
| --- | --- | --- |
| 1 | Type de source sur chaque proposition | [Fait], classement à valider |
| 2 | Statut du programme de chaque candidat | [Fait], 25 statuts à valider |
| 3 | Script de détection des doublons et opposés | [Fait] |
| 4 | Données : `data/enjeux.json` et règles de rédaction | [Fait], 17 enjeux à valider |
| 5 | Score : un enjeu compte comme un scrutin | [Fait] |
| 6 | Voter : carte enjeu aux 4 surligneurs, détail après le vote, astuce | [Fait], à tester sur téléphone |
| 7 | Explorer, fiche, récapitulatif : les noms | [Fait] |
| 8 | Réinitialisation des votes (store v4) | [Fait] |
| 9 | Documentation | [Fait] |

Les lots 1 et 2 sont indépendants et peuvent partir avant le reste.

---

## 2. Lot 1 : type de source

**[Décidé]** Étiquette visible, même poids dans le score. Affichée dans « En savoir plus » pendant le vote à l'aveugle.

**[Proposition]**

- Nouvelle colonne CSV `type_source`, obligatoire :
  - `programme_2027` : programme ou site de campagne 2027 ;
  - `programme_anterieur` : programme d'une élection passée (2022, 2024) ;
  - `prise_de_position` : interview, discours, article, réseau social, communiqué, et aussi un acte de ministre (circulaire), pour ne pas trahir l'auteur.
- Libellés : « Programme 2027 », « Programme précédent », « Prise de position ».
- Affichée aussi dans Explorer, la fiche et le détail d'une proposition.
- Le build bloque si la colonne manque ou est inconnue.
- Remplissage des 194 lignes : une passe du skill `verifier-donnees`, qui confirme au passage qu'une mesure dite « de programme » y figure bien.

## 3. Lot 2 : statut du programme

**[Danny]** Noter si on a le programme complet ou pas.

**[Proposition]** Dans `data/candidats.json` :

```json
"programme": { "statut": "complet", "url": "https://...", "date": "2026-09-12" }
```

- `complet` : document de programme 2027 publié en entier par le candidat.
- `partiel` : premières mesures, dépliant, site en cours.
- `aucun` : pas de programme 2027, mesures tirées d'un programme antérieur ou de prises de position (`url` et `date` absents).
- **[Fait]** `date` seulement si la source la donne (la plupart ne datent que le mois) ; pas de `titre`, inutilisé.
- Affiché sur la fiche candidat (une ligne sous la biographie) et en colonne du tableau du README.

**[Décidé]** Même nombre de questions pour tous : un programme complet ne donne pas plus de questions.

**[Décidé]** Avec un programme complet, on choisit les 8 **mesures phares** du candidat ; on ne les lie à un enjeu que si ça tombe juste. Le programme complet sert à vérifier et à mieux rédiger, pas à multiplier.

## 4. Lot 3 : script de détection

**[Danny]** Un script pour trouver les propositions qui vont ensemble ou en face. Obsidian, Gortex ?

**[Décidé]** Script et relecture. Obsidian relie des notes à la main et Gortex analyse du code : aucun ne comprend le sens d'une phrase. Les embeddings trouvent les sujets proches mais confondent « construire » et « fermer » des réacteurs : relecture obligatoire quand même, pour une dépendance lourde.

**[Fait]** `scripts/find-enjeux.ts` (`npm run find:enjeux`), sans dépendance, logique dans `src/lib/similarity.ts` (testée) :

1. Par thème (12 thèmes, 9 à 22 propositions chacun), sur titre et citation.
2. Normalise : minuscules, sans accents, sans mots vides, racine courte (« réacteurs » et « réacteur »).
3. Similarité de mots entre chaque paire (cosinus TF-IDF), au-dessus d'un seuil réglable.
4. Signale les verbes opposés dans une paire proche : créer / supprimer, construire / fermer, augmenter / baisser, développer / arrêter, rester / quitter, autoriser / interdire, rétablir / abolir.
5. Écrit un rapport `docs/enjeux-candidats.md` : groupes proposés, score, « proches » ou « opposés ».
6. Ignore les propositions déjà liées à un enjeu.

Ensuite, le skill `collecter-donnees` (nouvelle section « Enjeux ») trie le rapport et propose les enjeux ; **Danny valide** chaque enjeu avant qu'il entre dans `data/enjeux.json`. À relancer à chaque ajout de propositions.

## 5. Lot 4 : données

**[Décidé]** Une question neutre, liée à chaque candidat qui a pris position, pour ou contre, comme un scrutin.

**[Proposition]** Les CSV ne changent pas : chaque proposition reste la position sourcée d'un candidat. Nouveau fichier `data/enjeux.json` :

```json
{
  "id": "nouveaux-reacteurs",
  "thematiqueId": "environnement",
  "question": "Construire de nouveaux réacteurs nucléaires",
  "enjeu": "Ce que tranche la question, sans nom ni chiffre propre à un candidat.",
  "positions": [
    { "propositionId": "prop-fro-2", "sens": "pour" },
    { "propositionId": "prop-ez-7", "sens": "pour" }
  ]
}
```

Règles (dans `CONTRIBUTING.md`, vérifiées par le build) :

- **Pour ou contre seulement** **[Décidé]** : pas de « modéré ». Les écarts (14 ou 20 réacteurs) se lisent dans le détail de chaque position.
- **Contre** seulement si la proposition dit explicitement l'inverse (supprimer, quitter, démanteler). Ne rien dire n'est jamais une position : on ne déduit rien d'un silence.
- **Une proposition dans un enjeu au plus**, jamais deux : sinon une même citation compterait deux fois pour son auteur.
- **Au moins 2 positions**, de 2 candidats différents ; une proposition seule reste une question seule, comme aujourd'hui.
- **Une idée par proposition** : une proposition double (am-1 « nucléaire et éolien », mlp-5 « RIC et proportionnelle ») est d'abord réécrite sur une idée (règle 7 de `CONTRIBUTING.md`), sinon elle reste seule.
- **Question** : mêmes règles que `question` d'un scrutin (130 caractères, anonyme, sans sigle hors glossaire).
- **Sens de la question** : formulée comme le changement que propose le plus de candidats ; à égalité, le changement par rapport à la situation actuelle. **[Proposition]**, pour ne pas choisir le sens selon un camp.
- **Numéro stable** : `E-12`, géré par le build dans `refs.json`, repris par « Signaler une erreur ».
- Build : enjeu inconnu, proposition introuvable ou déjà liée, moins de 2 candidats, glossaire : bloquant.

## 6. Lot 5 : score

**[Danny]** Une seule question qui donne des points à l'un et en retire à l'autre. Mathématiquement possible ?

**Oui, c'est le calcul des scrutins.** Ma note `v` (-2..+2) sur l'enjeu donne `v` au candidat « pour » et `-v` au candidat « contre ». Exemple : « Parfait » (+2) sur « Développer l'éolien » donne +2 à qui le propose, -2 à qui veut démanteler.

- Une question seule d'aujourd'hui est un enjeu à une seule position « pour » : un seul calcul pour tout (`src/lib/scoring.ts`, testé).
- Chaque position compte pour 1 élément de fiabilité, comme aujourd'hui : chaque candidat garde ses 8 positions, donc la même chance d'être fiable.
- « Je ne sais pas » sur un enjeu : rien pour personne.
- Classé à partir de 2 positions votées, sans changement.
- `npm run simulate:scoring` à étendre : vérifier qu'un candidat présent dans beaucoup d'enjeux n'est pas avantagé ou desservi (docs/simulations).

## 7. Lot 6 : Voter

**[Danny]** Un affichage différent du scrutin : une carte dessinée au surligneur, qui montre que le vote est « multi-candidat ». Une nouvelle astuce pour l'expliquer.

**[Décidé]**

- **Cadre aux 4 surligneurs**, tracé à la main à l'arrivée (comme la fête « cadre » : quatre côtés de quatre couleurs qui dépassent aux coins). Toujours 4 traits : le dessin ne dit pas combien de candidats sont concernés avant le vote.
- Exception à la règle du surligneur, à écrire dans `DESIGN.md` comme le logo et le tuto : un dessin fixe, pas une marque.
- **Après le vote, anonyme** : « 3 pensent comme vous, 2 à l'inverse », puis chaque position sans nom (« Une mesure : « Construire 20 réacteurs (EPR) » »), son type de source et « comme vous » ou « à l'inverse ».
- **Les noms en fin de série** (récapitulatif), dans Explorer et sur la fiche, jamais juste après le vote.
- **Astuce** `premier-enjeu` dans `src/constants/tutos.json` (`ecran: voter`, `quand: enjeu`), sur le cadre : « Cette question réunit plusieurs candidats : votre note compte pour chacun, dans un sens ou dans l'autre. »

**[Proposition]**

- Même échelle que les propositions (Impossible à Parfait, « Je ne sais pas ») : on juge une idée, pas un texte voté.
- Fond papier comme une proposition (le gris froid reste aux scrutins).
- Ordre de passage (`questionOrder`, `src/lib/shuffle.ts`) : **[Fait]** plus simple que proposé, les enjeux sont intercalés comme les scrutins, jamais deux de suite, jamais collés à un scrutin.
- Progression et bilans (`src/lib/progress.ts`) : comptent des questions, plus des propositions ; `allVoted()` inclut les enjeux.
- « Réduire les animations » : cadre posé d'un coup.

## 8. Lot 7 : Explorer, fiche, récapitulatif

**[Proposition]**

- Explorer : une ligne par proposition, avec « Question partagée avec N candidats » ; l'enjeu complet (question, candidats, positions, mesures) dans le détail de la proposition.
- Fiche candidat : la proposition porte « Question partagée avec 3 candidats », qui ouvre l'enjeu.
- Récapitulatif de fin de Voter : l'enjeu avec les noms, mon vote modifiable à la gomme.
- Lois : pas de changement.

## 9. Lot 8 : votes existants

**[Décidé]** On réinitialise tous les votes une fois (store `version: 4`) : 3 testeurs seulement, phase de test. Message au lancement : « Les questions ont changé : vos votes repartent de zéro. »

Ce choix vaut pour cette version seulement : après la sortie publique, une migration propre convertira les votes.

## 10. Lot 9 : documentation

- `CONTRIBUTING.md` : colonne `type_source`, `programme` des candidats, règles des enjeux.
- `DESIGN.md` : carte enjeu et exception au surligneur.
- `PRODUCT.md` et `README.md` : questions communes, type de source, statut du programme.
- Skills `collecter-donnees` et `verifier-donnees` : enjeux et type de source.

## Ce qui reste au builder

- Seuil de similarité du script, à régler sur le relevé du § 0.
- Animation exacte du cadre, à partir de la fête « cadre » (`celebration.tsx`).
- Mise en page du détail après le vote.

## À vérifier à la main

- Un enjeu « pour / contre » : « Parfait » monte l'un et descend l'autre dans le Classement.
- Aucun nom ni indice d'auteur sur la carte enjeu ni juste après le vote.
- Chaque candidat a toujours 8 positions au plus, et le même nombre que les autres.

## 11. Plan d'implémentation

> Exécution tâche par tâche (skill `superpowers:executing-plans`), cases `- [ ]` à cocher au fil de l'eau.

**But :** Une question neutre par débat partagé (« Construire de nouveaux réacteurs »), qui donne la note du lecteur à chaque candidat « pour » et son inverse à chaque candidat « contre », plus le type de source de chaque proposition et le statut du programme de chaque candidat.

**Architecture :** Les CSV ne bougent pas (une ligne = une position sourcée) ; `data/enjeux.json` relie des propositions en questions communes, et le build pose `enjeuId` et `sens` sur chaque proposition liée. Le store garde un vote par **question** (id de proposition seule, ou id d'enjeu) ; une fonction pure `effectiveVotes()` en déduit la note de chaque proposition (`v` pour « pour », `-v` pour « contre »). Tout le calcul existant (score, fiabilité, classement, fiche) lit ces notes déduites et ne change pas.

**Tech Stack :** Expo SDK 57, React Native 0.86, Zustand persist, Zod 4, Jest (`jest-expo`), Node 22.18 (scripts `.ts`).

### Contraintes (valent pour chaque tâche)

- Branche `feat/updates` (la branche actuelle) : aucun changement de branche.
- Danny indexe et commite lui-même : chaque tâche s'arrête au working tree, aucun `git add` ni `git commit`.
- `npm run check` vert à la fin de chaque tâche (build des données, dataset à jour, typecheck, lint, tests).
- `npx expo install` pour toute dépendance ; aucune nouvelle dépendance n'est prévue.
- Neutralité : rien pendant le vote à l'aveugle ne nomme un candidat ni un parti, carte enjeu et détail après vote compris ; les noms seulement dans le récapitulatif de fin, Explorer et la fiche.
- Position = `pour` ou `contre` seulement ; « contre » seulement si la proposition dit explicitement l'inverse.
- Une proposition dans un enjeu au plus ; au moins 2 positions de 2 candidats différents ; une position par candidat et par enjeu ; même thème que l'enjeu.
- `question` : 130 caractères au plus ; `enjeu` : 220 au plus ; mêmes règles d'anonymat, d'apostrophes et de sigles que les scrutins.
- Numéro stable des enjeux : `E-01`, `E-02`… dans `data/refs.json` (clé `enjeux`), attribué dans l'ordre d'arrivée comme les lois.
- Types de source : `programme_2027` (« Programme 2027 »), `programme_anterieur` (« Programme précédent »), `prise_de_position` (« Prise de position », une circulaire de ministre comprise).
- Statut de programme : `complet`, `partiel`, `aucun` ; `url` et `date` obligatoires sauf pour `aucun`.
- Votes existants : réinitialisés une fois (store `version: 4`), message « Les questions ont changé : vos votes repartent de zéro. » ; ce choix ne vaut que pour cette version.
- Code et commentaires brefs, commentaire d'une ligne, accolades sur chaque `if`, aucun tiret cadratin dans les textes.

### Points à surveiller

1. **« Je ne sais pas » sur un enjeu** : aucun candidat ne gagne ni ne perd ; l'écran après vote dit « Je ne sais pas : cette question ne change aucun score. » (tests dans la tâche 5 et la tâche 6).
2. **Corriger depuis Explorer le vote d'une proposition « contre »** : la note affichée est l'inverse de celle de la question, et la corriger écrit l'inverse dans la question ; les autres candidats de l'enjeu bougent en conséquence (test `voteTarget` dans la tâche 5).
3. **Une proposition déjà votée seule puis liée à un enjeu par une mise à jour des données** : l'ancien vote sur la proposition est ignoré, seule la question compte, et la question revient dans Voter (test `effectiveVotes` dans la tâche 5).
4. **Ordre de passage** : jamais deux enjeux de suite, jamais un scrutin collé à un enjeu, et une proposition liée n'apparaît jamais seule dans l'ordre (tests dans la tâche 5).
5. **Données incohérentes** : proposition inconnue, liée deux fois, un seul candidat, deux positions du même candidat, thème différent : le build échoue avec un message qui nomme l'enjeu (tests dans la tâche 4).

#### Tâche 1 : type de source

**Files :**

- Modify : `src/schemas/dataset.ts` (`PropositionCsvSchema`, `PropositionSchema`), `scripts/build-data.ts`, `data/candidats/*.csv` (colonne `type_source` après `date_declaration`), `src/lib/format.ts`, `src/components/more-info.tsx`, `src/components/proposition-detail.tsx`, `src/app/(tabs)/index.tsx` (passe le type à `MoreInfo`), `CONTRIBUTING.md` (tableau des colonnes et règle)
- Test : `src/lib/__tests__/format.test.ts`

**Interfaces :**

- Produces : `TypeSourceSchema = z.enum(['programme_2027', 'programme_anterieur', 'prise_de_position'])`, `type TypeSource`, `Proposition.typeSource: TypeSource`, `TYPE_SOURCE_LABELS: Record<TypeSource, string>` dans `src/lib/format.ts`.

- [ ] **Step 1 : test** `format.test.ts` : `TYPE_SOURCE_LABELS` vaut `{ programme_2027: 'Programme 2027', programme_anterieur: 'Programme précédent', prise_de_position: 'Prise de position' }`.
- [ ] **Step 2 :** `npx jest src/lib/__tests__/format.test.ts` échoue (export absent).
- [ ] **Step 3 :** schémas (colonne CSV `type_source` obligatoire, champ `typeSource` du dataset), build qui la recopie, libellés.
- [ ] **Step 4 : remplir les 194 lignes.** Pré-classer avec un script jetable dans le scratchpad (pas dans le dépôt) sur le début de `contexte` : « Programme 2027 », « Site de campagne », « Livret », « Dépliant de campagne 2027 » → `programme_2027` ; « Programme des législatives », « des européennes », « de la présidentielle 2022 », « Fiche programme … 2022 » → `programme_anterieur` ; « Interview », « Discours », « Communiqué », « rapporté par », « Tribune », « Circulaire », « Réaction » → `prise_de_position`. Relire chaque ligne qui ne correspond à aucun motif ou à deux motifs, puis lister à Danny celles où le choix se discute.
- [ ] **Step 5 :** affichage : `MoreInfo` reçoit `source?: string` et l'écrit en 13 semi-gras graphite au-dessus du contexte ; `PropositionDetail` l'écrit dans la ligne de méta (`Programme 2027 · Déclaré le … · P-531`). Rien dans les listes.
- [ ] **Step 6 :** `npm run check` vert.

#### Tâche 2 : statut du programme

**Files :**

- Modify : `src/schemas/dataset.ts` (`CandidatSourceSchema`), `data/candidats.json`, `src/lib/format.ts`, `src/app/candidate/[id].tsx`, `README.md` (colonne « Programme 2027 » du tableau), `CONTRIBUTING.md`
- Test : `src/lib/__tests__/format.test.ts`

**Interfaces :**

- Produces : `ProgrammeSchema` (`statut` enum `complet | partiel | aucun`, `titre?`, `url?`, `date?`, refine : `url` et `date` présents sauf `aucun`), `Candidat.programme`, `programmeText(programme): string` dans `format.ts`.

- [ ] **Step 1 : test** `programmeText` : `{ statut: 'complet', date: '2026-09-12', … }` → `Programme 2027 complet, publié le 12 sept. 2026` ; `partiel` → `Programme 2027 partiel (premières mesures), publié le …` ; `aucun` → `Pas de programme 2027 publié : mesures tirées d'un programme précédent ou de prises de position.`
- [ ] **Step 2 :** le test échoue.
- [ ] **Step 3 :** schéma et `programmeText`.
- [ ] **Step 4 : données.** Pour chaque candidat, proposer le statut à partir des sources déjà dans son CSV (une source `programme_2027` qui est un document de programme entier → `complet` ; dépliant, « premières mesures », site en cours → `partiel` ; aucune source 2027 de programme → `aucun`). **Point d'arrêt : Danny valide les 25 statuts** (tableau candidat, statut proposé, URL) avant de les écrire.
- [ ] **Step 5 :** fiche candidat : une ligne sous la biographie, lien vers `url` si présente (même style que la ligne de candidature). README : colonne « Programme 2027 » (Complet, Partiel, Aucun).
- [ ] **Step 6 :** `npm run check` vert.

#### Tâche 3 : script de détection

**Files :**

- Create : `src/lib/similarity.ts`, `scripts/find-enjeux.ts`, `src/lib/__tests__/similarity.test.ts`
- Modify : `package.json` (script `find:enjeux`), `.claude/skills/collecter-donnees/SKILL.md` (section « Enjeux »)
- Output : `docs/enjeux-candidats.md` (rapport, régénéré à chaque passage)

**Interfaces :**

- Produces : `normalize(text: string): string[]` (minuscules, sans accents, sans mots vides, racine : mot coupé à 6 lettres), `cosine(a: string[], b: string[], idf: Map<string, number>): number`, `opposedVerbs(a: string[], b: string[]): boolean`, `OPPOSED_VERBS: [string, string][]`.

- [ ] **Step 1 : tests** : `normalize('Construire 20 réacteurs nucléaires')` contient `'reacte'` et `'nuclea'`, pas `'20'` ni `'de'` ; `cosine` de deux listes identiques vaut 1, de listes disjointes 0 ; `opposedVerbs(normalize('Construire des réacteurs'), normalize('Fermer des réacteurs'))` vrai, `opposedVerbs` sur deux « construire » faux.
- [ ] **Step 2 :** les tests échouent.
- [ ] **Step 3 :** `similarity.ts`. Paires de `OPPOSED_VERBS` : créer/supprimer, construire/fermer, augmenter/baisser, développer/arrêter, rester/quitter, autoriser/interdire, rétablir/abolir (comparées sur leur racine normalisée).
- [ ] **Step 4 :** `scripts/find-enjeux.ts` lit `src/data/dataset.json`, compare les paires d'un même thème hors propositions déjà liées (`enjeuId`), garde celles au-dessus de `--seuil` (défaut 0,25), regroupe par composantes connexes et écrit `docs/enjeux-candidats.md` : par thème, chaque groupe avec ses propositions (`prop-…`, titre, type de source), le score et « proches » ou « opposés ». Le seuil se règle pour retrouver le relevé du § 0 de la spec.
- [ ] **Step 5 :** `npm run find:enjeux` écrit le rapport ; les groupes nucléaire, OTAN et RIC du § 0 y figurent.
- [ ] **Step 6 :** section « Enjeux » du skill `collecter-donnees` : lancer le script, trier le rapport, proposer, faire valider par Danny, écrire `data/enjeux.json` (règles des Global Constraints).

#### Tâche 4 : enjeux dans les données

**Files :**

- Create : `data/enjeux.json`, `src/lib/enjeux-check.ts`, `src/lib/__tests__/enjeux-check.test.ts`
- Modify : `src/schemas/dataset.ts`, `scripts/build-data.ts`, `data/refs.json` (géré par le build), `src/services/dataset.ts`, `CONTRIBUTING.md` (fichier et règles)

**Interfaces :**

- Produces :
  - `SensSchema = z.enum(['pour', 'contre'])` ; `EnjeuSourceSchema` : `id`, `thematiqueId`, `question` (max 130), `enjeu` (max 220), `positions: { propositionId: string; sens: Sens }[]` (min 2) ; `EnjeuSchema = EnjeuSourceSchema.extend({ ref })`, ref au format `E-\d{2,3}` (élargir la regex `ref`).
  - `Proposition.enjeuId?: string`, `Proposition.sens?: Sens` (posés par le build).
  - `DatasetSchema.enjeux: Enjeu[]`, `metadata.enjeuxCount`.
  - `checkEnjeux(enjeux: EnjeuSource[], propositions: Pick<Proposition, 'id' | 'candidatId' | 'thematiqueId'>[], thematiqueIds: Set<string>): string[]` (messages d'erreur).
  - `src/services/dataset.ts` : `enjeux`, `getEnjeu(id)`, `soloPropositions` (sans `enjeuId`), `questions` (`[...soloPropositions, ...enjeux]`, type `{ id: string; thematiqueId: string }[]`).

- [ ] **Step 1 : tests** `checkEnjeux` : un message qui contient l'id de l'enjeu pour chacun de ces cas : proposition inconnue, proposition dans deux enjeux, une seule position, deux positions du même candidat, thème de la proposition différent de celui de l'enjeu, thème inconnu ; aucun message pour un enjeu valide à deux candidats.
- [ ] **Step 2 :** les tests échouent.
- [ ] **Step 3 :** `checkEnjeux`, schémas, build : lit `enjeux.json`, ajoute les erreurs de `checkEnjeux`, `checkText`, `checkAnonymous` et `checkAcronyms` sur `question` et `enjeu`, attribue `E-NN` (comme `loiNumber`), pose `enjeuId` et `sens`, ajoute `enjeux` à `previousGeneratedAt` et au dataset.
- [ ] **Step 4 : contenu.** Lancer `npm run find:enjeux`, croiser avec le § 0 de la spec, écarter les propositions doubles (am-1, ep-2, mlp-5, ob-3, jlm-3, ep-3, mlp-3, rg-7 restent seules tant qu'elles ne sont pas réécrites sur une idée), rédiger chaque `question` (sens : le changement proposé par le plus de candidats) et chaque `enjeu`. **Point d'arrêt : Danny valide chaque enjeu** (question, positions et sens) avant l'écriture de `data/enjeux.json`.
- [ ] **Step 5 :** `npm run build:data:strict` et `npm run check` verts.

#### Tâche 5 : votes par question, ordre, store v4

**Files :**

- Create : `src/lib/enjeux.ts`, `src/lib/__tests__/enjeux.test.ts`
- Modify : `src/lib/shuffle.ts`, `src/lib/__tests__/shuffle.test.ts`, `src/lib/progress.ts`, `src/lib/__tests__/progress.test.ts`, `src/lib/themes.ts`, `src/store/votes-store.ts`, et chaque lecteur de `s.votes` listé au Step 7
- Test : `src/lib/__tests__/scoring.test.ts`

**Interfaces :**

- Consumes : `Proposition.enjeuId`, `Proposition.sens`, `Enjeu`, `soloPropositions`, `questions` (tâche 4).
- Produces :
  - `effectiveVotes(votes: Record<string, VoteValue>, propositions: readonly Proposition[]): Record<string, VoteValue>` : pour une proposition liée, la note de son enjeu multipliée par `+1` ou `-1` (ignore `votes[p.id]`) ; sinon `votes[p.id]`.
  - `voteTarget(p: Pick<Proposition, 'id' | 'enjeuId' | 'sens'>): { key: string; sign: 1 | -1 }`.
  - `enjeuTally(enjeu: Enjeu, value: VoteValue): { agree: number; opposite: number }`.
  - `freshOrder` construit `interleaveLois(interleaveLois(balancedOrder(soloPropositions), enjeuIds), loiIds, { existing: enjeuIds })`.
  - `allVoted(votes, loiVotes, questions, lois)` (questions au lieu de propositions).
  - `themeAverages(thematiques, questions: readonly { id: string; thematiqueId: string }[], votes)` (votes bruts : une note par question).
  - `usePropositionVotes(): Record<string, VoteValue>` dans `votes-store.ts` (mémoïsé sur `s.votes`).
  - Store : `version: 4`, champ persisté `questionsChanged: boolean`, action `dismissQuestionsChanged()`.

- [ ] **Step 1 : tests `enjeux.test.ts`** :
  - enjeu `e1` (p1 pour, p2 contre), `votes = { e1: 2 }` → `effectiveVotes` donne `p1: 2`, `p2: -2` ;
  - `votes = { e1: 0 }` → `p1: 0`, `p2: 0` ;
  - `votes = { p2: 1 }` sans vote sur `e1` → `p2` absent (Review Focus 3) ;
  - `voteTarget(p2)` → `{ key: 'e1', sign: -1 }`, `voteTarget(seule)` → `{ key: 'seule', sign: 1 }` (Review Focus 2) ;
  - `enjeuTally` pour `+2` avec 2 pour et 1 contre → `{ agree: 2, opposite: 1 }`, pour `0` → `{ agree: 0, opposite: 0 }`.
- [ ] **Step 2 : test `scoring.test.ts`** : avec `effectiveVotes`, « Parfait » sur un enjeu donne 100 % au candidat « pour » et 0 % au candidat « contre », sur cette seule question.
- [ ] **Step 3 : tests `shuffle.test.ts`** (Review Focus 4) : sur un jeu de 30 propositions seules, 5 enjeux, 6 scrutins, aucun enjeu ne suit un enjeu, aucun scrutin n'est voisin d'un enjeu, chaque id apparaît une fois. `progress.test.ts` : `allVoted` vrai quand chaque question et chaque scrutin a un vote, faux s'il manque un enjeu.
- [ ] **Step 4 :** les tests échouent.
- [ ] **Step 5 :** `enjeux.ts`, `freshOrder`, `reconcileOrder` (connus = propositions seules + enjeux + scrutins ; nouveaux enjeux intercalés après la première question ouverte comme les nouveaux scrutins), `allVoted`, `themeAverages`.
- [ ] **Step 6 : store v4.** `migrate(persisted, version)` : sous 4, vide `votes`, `loiVotes`, `marks`, `order` et pose `questionsChanged: true` si la personne avait au moins un vote ; garde `marker` et `onboardingVersion`. `resetVotes` remet `questionsChanged: false`.
- [ ] **Step 7 : lecteurs.** `usePropositionVotes()` à la place de `s.votes` partout où l'on lit la note d'une proposition : `computeScores` et `rankedCount` du Cahier, `scoreCandidat`/`scoreDetail` de la fiche et du bilan de Voter, listes de `theme/[id].tsx` et `explore.tsx` (filtre « Pas encore votées » compris), `PropositionRow` du récapitulatif. Restent sur les votes bruts : `opinionCount`, `selectNextId`, `allVoted`, `themeAverages`, `TOTAL` de Voter (= `questions.length + lois.length`). `MyVoteRow` et `EditVoteSheet` : pour une proposition, lire `effective[p.id]` et écrire `castVote(key, value * sign)` via `voteTarget` ; surligneur via `useMarkOf(key)`.
- [ ] **Step 8 :** `npm run check` vert.

#### Tâche 6 : Voter

**Files :**

- Create : `src/components/enjeu-frame.tsx`, `src/components/enjeu-reveal.tsx`
- Modify : `src/app/(tabs)/index.tsx`, `src/components/proposition-sheet.tsx` (`kind` accepte `'Question commune'`), `src/components/edit-vote-sheet.tsx`, `src/constants/tutos.json`, `DESIGN.md`

**Interfaces :**

- Consumes : `getEnjeu`, `enjeuTally`, `TYPE_SOURCE_LABELS`, `useLoiFlow` (déjà dans `index.tsx`, réutilisé tel quel : le pas `hemicycle` y est l'écran après vote).
- Produces : `<EnjeuFrame animate: boolean>{children}</EnjeuFrame>`, `<EnjeuReveal enjeu: Enjeu; value: VoteValue />`.

- [ ] **Step 1 : carte.** L'enjeu courant s'affiche dans `PropositionSheet` (`kind="Question commune"`, `proposition={{ ref, thematiqueId, titre: question }}`, `MoreInfo` sur `enjeu`), entouré par `EnjeuFrame` : quatre côtés, un par surligneur, qui dépassent aux coins, tracés à la main à l'arrivée en 650 ms (géométrie de la fête `cadre` de `celebration.tsx`, à extraire plutôt que copier), toujours 4 traits ; posé d'un coup avec « Réduire les animations ». Cible de tuto `enjeu-cadre`. Fond papier, échelle `VoteScale`.
- [ ] **Step 2 : après le vote.** `castVote(enjeu.id, value)`, puis l'écran après vote comme un scrutin (`revealId`, `useLoiFlow`, « Question suivante » avec compte à rebours de 5 s, rien d'automatique avec un lecteur d'écran natif). `EnjeuReveal` : « 3 pensent comme vous, 2 à l'inverse » (accords au singulier : « 1 pense comme vous »), puis chaque position sans nom, triée « comme vous » d'abord puis par `ref` de proposition : « Une mesure · Programme 2027 », son titre, et « comme vous » ou « à l'inverse » (encre sur filet, comme `PositionMark`). Pour « Je ne sais pas » : la seule phrase « Je ne sais pas : cette question ne change aucun score. » (Review Focus 1).
- [ ] **Step 3 :** `LastVote`, `EditVoteSheet` et le récapitulatif savent afficher un id d'enjeu (question, `VoteTag`).
- [ ] **Step 4 : astuce** `tutos.json` : `{ "id": "premier-enjeu", "ecran": "voter", "quand": "enjeu", "cible": "enjeu-cadre", "ordre": 1, "lignes": ["Cette question réunit plusieurs candidats.", "Votre note compte pour chacun, dans un sens ou dans l'autre."] }`, déclenchée par `useTuto('enjeu', calm && !!currentEnjeu && !revealed)`.
- [ ] **Step 5 : message de réinitialisation.** Si `questionsChanged`, une carte au-dessus de la feuille : « Les questions ont changé : vos votes repartent de zéro. » et un bouton « Compris » (`dismissQuestionsChanged`).
- [ ] **Step 6 :** `DESIGN.md` : carte enjeu, exception à la règle du surligneur (dessin fixe, comme le logo et le tuto), écran après vote.
- [ ] **Step 7 :** `npm run check` vert, puis vérification sur le web (`npx expo start --web`) : une question commune s'affiche avec son cadre, l'écran après vote ne contient aucun nom ni parti, « Parfait » sur un enjeu monte le candidat « pour » et descend le « contre » dans le Classement.

#### Tâche 7 : les noms (Explorer, fiche, récapitulatif)

**Files :**

- Modify : `src/components/proposition-detail.tsx`, `src/components/proposition-row.tsx`, `src/app/(tabs)/index.tsx` (`FinishedView`, ligne d'enjeu)

**Interfaces :**

- Consumes : `getEnjeu`, `getCandidat`, `usePropositionVotes`.

- [ ] **Step 1 :** `PropositionRow` d'une proposition liée : une ligne « Question partagée avec N candidats » (N = autres positions) dans sa méta. Choix du plan : Explorer garde une ligne par proposition plutôt qu'une carte de groupe, l'enjeu se lit dans le détail.
- [ ] **Step 2 :** `PropositionDetail` d'une proposition liée, hors vote à l'aveugle : un bloc « Question commune E-NN » avec la question, puis chaque position (nom du candidat, « pour » ou « contre », titre de sa mesure), la ligne « Moi » au-dessus (sa note retournée pour un « contre », Review Focus 2), et « Signaler une erreur » sur l'enjeu (`reportUrl(enjeu.ref, enjeu.question)` de `src/constants/app.ts`).
- [ ] **Step 3 :** récapitulatif de fin de Voter : une ligne par enjeu (question, `E-NN · Question commune ·`, mon vote, noms des candidats « pour » puis « contre »), touchable pour corriger.
- [ ] **Step 4 :** `npm run check` vert, vérification web de la fiche d'un candidat « contre ».

#### Tâche 8 : simulation, partage, documentation

**Files :**

- Modify : `scripts/simulate-scoring.ts`, `docs/simulations/README.md`, `src/lib/share.ts`, `src/components/share-card.tsx`, `src/components/share-sheet.tsx`, `src/lib/__tests__/share.test.ts`, `CONTRIBUTING.md`, `PRODUCT.md`, `README.md`, `.claude/skills/verifier-donnees/SKILL.md`, `docs/feature-20261024-enjeux.md`, `docs/feature-20261024-partage.md`

**Interfaces :**

- Produces : `ShareMode` gagne `'enjeux'` ; `enjeuxSummary(enjeux, votes): { tranches: number; total: number }` (enjeux notés hors « Je ne sais pas »).

- [ ] **Step 1 :** simulation : votes au hasard passés par `effectiveVotes` ; comparer l'écart de score moyen entre candidats présents dans 0, 1-2 et 3 enjeux ou plus, et l'écrire dans `docs/simulations/README.md`. Un écart net est signalé à Danny avant la suite.
- [ ] **Step 2 : test** `enjeuxSummary` : 3 enjeux dont 2 notés et 1 « Je ne sais pas » → `{ tranches: 2, total: 3 }` ; `shareText('enjeux', …)` → « J'ai tranché 2 débats sur élire. » suivi de l'adresse.
- [ ] **Step 3 :** image « Mes enjeux » (5e du carrousel, après « Mes scrutins ») : titre « Les débats que j'ai tranchés », le chiffre en Literata 96 sur une bande du surligneur, « débats tranchés sur 12 », aucun nom ; état vide « Notez une question commune pour remplir cette image. »
- [ ] **Step 4 :** docs : règles des enjeux, colonne `type_source` et `programme` dans `CONTRIBUTING.md` ; `PRODUCT.md` et `README.md` (questions communes, type de source, statut du programme) ; skill `verifier-donnees` (vérifier `type_source` et le sens de chaque position) ; états [Fait] dans les deux docs de feature.
- [ ] **Step 5 :** `npm run check` vert.

### Exécution

Ordre imposé : 1, 2, 3, 4, 5, 6, 7, 8. Les tâches 1 et 2 peuvent passer avant la 3 sans risque. Trois points d'arrêt avec Danny : liste des types de source discutables (tâche 1), statuts des programmes (tâche 2), enjeux (tâche 4).
