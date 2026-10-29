# Passe sur les précisions : propositions (lot 1)

Lot 1 de `docs/feature-20261029-tourner-la-page.md`, section 1. **Rien n'est modifié dans `data/`** : Danny valide d'abord, puis on écrit et on lance `npm run build:data:strict`.

## Méthode

- Relecture une par une, avec le titre, la citation, le contexte et la source côte à côte (skill `verifier-donnees`), selon les critères 1 à 5 de la section 1. Le critère 6 (règle 6, titre fidèle) prime sur tout : on ne précise que ce que dit déjà la source.
- Les éléments déjà corrigés par Danny dans `dccd1ba` sont exclus (30 propositions, dont `prop-ak-6`, `prop-ak-7`, `prop-dl-3`, `prop-nda-4`, `prop-ep-4`, `prop-ga-6`, `prop-sl-8`).
- Source vérifiée = **oui** quand l'ajout se lit dans la citation (`description`) ou quand la source a été rouverte (PDF via `pdftotext`, page via WebFetch) ; **non** sinon.
- Quand la source ne donne pas la précision attendue, on ne l'invente pas : le contexte dit qu'elle n'est pas précisée, comme `prop-sl-8` (« le type d'élection concerné n'est pas précisé »).
- Limites vérifiées : titre d'environ 90 caractères et d'au moins 8 mots, question de scrutin d'au moins 10 mots (`MIN_WORDS`), contexte d'environ 250 caractères, aucun nom de candidat, de parti ou de slogan, aucun nouveau sigle.

## Bilan

- **Éléments relus : 255** (196 propositions, 42 scrutins, 17 questions communes).
- **Propositions : 21** : 7 titres, 9 contextes, 0 question, 5 enjeux (3 scrutins, 2 questions communes).
- Les 42 questions de scrutin et les 17 questions communes respectent déjà les règles 12 et 13 : rien à proposer.
- 5 mots à ajouter à `data/mots.json` (critère 3), en fin de fichier.

## Propositions des candidats

### anasse-kazib.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-ak-1 | contexte | Dépliant de campagne 2027, p. 3 (premières mesures, le programme complet est en cours d'élaboration). Les salaires seraient aussi indexés sur l'inflation, donc relevés quand les prix montent, et toutes les allocations revalorisées. | Dépliant de campagne 2027, p. 3 (premières mesures, le programme complet est en cours d'élaboration). Le dépliant ne dit pas si les 500 euros sont nets ou bruts, ni par mois. Les salaires seraient aussi indexés sur l'inflation et toutes les allocations revalorisées. | 2 | oui (PDF p. 3 : « augmentation des salaires de 500 € », sans base) |

### antoine-mikolajczak.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-am-10 | titre | Revoir la doctrine du maintien de l'ordre, notamment les nasses et les armes dangereuses | Revoir le maintien de l'ordre en manifestation, notamment les nasses et les armes dangereuses | 1, 3 | oui (la page vise la casse côté manifestants et les « dérives policières » ; + mot « nasse », voir la fin du fichier) |
| prop-am-11 | contexte | Article du parti sur l'élevage et l'alimentation. But : rendre l'alimentation saine plus abordable. Prévoit aussi un repas végétarien de plus par semaine à la cantine et d'étendre les expériences locales de sécurité sociale de l'alimentation. | Article du parti sur l'élevage et l'alimentation. But : rendre l'alimentation saine plus abordable ; le texte ne précise ni les produits visés ni le fonctionnement du bonus-malus (taxe, aide). Prévoit aussi un repas végétarien de plus par semaine à la cantine. | 3, 4 | oui (WebFetch : aucun détail sur le mécanisme) |

### bruno-retailleau.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-br-7 | titre | Augmenter le salaire des professeurs de 135 euros nets par mois en début de carrière, jusqu'à 300 | Augmenter le salaire des professeurs de 135 euros nets par mois en début de carrière, 300 en milieu | 2 | oui (citation : « jusqu'à 300 euros en milieu ») |

### delphine-batho.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-db-6 | contexte | Communiqué du parti pour les 120 ans de la loi de 1905. Demande aussi que les atteintes à la laïcité à l'école donnent lieu à des explications et, si nécessaire, à des sanctions exemplaires. | Communiqué du parti pour les 120 ans de la loi de 1905. Menaces citées : intimidations et cyberharcèlement visant notamment les enseignants, terrorisme islamiste. Demande aussi des sanctions exemplaires, après explication, contre les atteintes à la laïcité à l'école. | 1, 4 | oui (WebFetch : les enseignants sont le seul groupe nommé, aucun dispositif précis) |

### francois-asselineau.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-fa-1 | titre | Sortir de l'Union européenne dès l'élection, par l'article 50 | Faire sortir la France de l'Union européenne dès l'élection, par l'article 50 | 1 | oui (citation ; même forme que `prop-fa-2` corrigé par Danny) |

### florian-philippot.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-fp-6 | contexte | Livret programme, édition 2026-2027, p. 22, volet libertés individuelles et publiques. Le texte dénonce aussi le règlement européen sur les services numériques, accusé de servir à censurer des contenus sur les plateformes. | Livret programme, édition 2026-2027, p. 22, volet libertés individuelles et publiques. Aucune loi française n'est citée ; le texte vise surtout le règlement européen sur les services numériques, accusé de servir à censurer des contenus sur les plateformes. | 4 | oui (PDF : le paragraphe ne nomme que le règlement européen DSA) |

### jean-lassalle.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-jl-3 | titre | Compter le vote blanc comme un suffrage exprimé | Compter le vote blanc comme un suffrage exprimé à l'élection présidentielle | 1 | oui (PDF : « relative à la reconnaissance du vote blanc pour l'élection présidentielle ») |
| prop-jl-5 | titre | Créer un service national universel, militaire ou civil, de septembre à juin | Créer un service national universel pour les jeunes majeurs, militaire ou civil, de septembre à juin | 1 | oui (PDF p. 2 : « ouvert aux jeunes majeurs, filles et garçons ») ; 100 caractères |

### jean-luc-melenchon.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-jlm-5 | contexte | Programme, édition 2025, p. 58. Prévoit aussi d'interdire les expulsions sans relogement et de limiter les locations de courte durée (type Airbnb) à 60 jours par an. | Programme, édition 2025, p. 58. Construction pendant cinq ans ; loyers encadrés partout et à la baisse dans les grandes villes. Prévoit aussi d'interdire les expulsions sans relogement et de limiter les locations de courte durée (type Airbnb) à 60 jours par an. | 2, 4 | oui (citation : « pendant cinq ans », « à la baisse dans les grandes villes ») |

### marine-le-pen.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-mlp-5 | contexte | Programme présidentiel 2022 en 22 mesures, mesure 11, p. 5. Le référendum d'initiative citoyenne permet aux citoyens de déclencher un vote par pétition ; à la proportionnelle, les sièges sont répartis selon le score de chaque liste. | Programme présidentiel 2022 en 22 mesures, mesure 11, p. 5. Le référendum d'initiative citoyenne permet aux citoyens de déclencher un vote par pétition ; à la proportionnelle, les sièges sont répartis selon le score de chaque liste. Les élections concernées ne sont pas précisées. | 1, 4 | oui (PDF : « mettre en place la proportionnelle », sans plus) |

### marine-tondelier.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-mt-5 | contexte | Programme 2027, p. 21. | Programme 2027, p. 21, mesure pour sortir un million de personnes par an de la précarité énergétique : 500 000 rénovations performantes par an via MaPrimeRénov', démarches simplifiées et guichet unique d'accompagnement. Éco-prêt à taux zéro élargi aux classes moyennes. | 4 | oui (PDF p. 21, mesure 8 du volet logement) |
| prop-mt-7 | titre | Taxer à 2 % les fortunes de plus de 100 millions et rétablir l'impôt sur la fortune, avec volet climat | Taxer à 2 % les fortunes de plus de 100 millions d'euros et rétablir l'impôt sur la fortune, avec volet climat | 2 | oui (citation : « 100 millions d'euros de patrimoine ») ; 110 caractères, voir les cas douteux |

### mira-markovic.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-mm-5 | contexte | Programme national 2022, p. 26 (dernier programme national, pas de programme 2027 publié). Les clauses miroirs exigent pour les produits importés une protection animale au moins aussi élevée qu'en France (p. 23). | Programme national 2022, p. 26 (dernier programme national, pas de programme 2027 publié). Exemples cités : élevage intensif et industriel, pêche industrielle. Les clauses miroirs exigent pour les produits importés une protection animale au moins aussi élevée qu'en France (p. 23). | 4 | oui (citation) |

### nathalie-arthaud.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-na-1 | titre | Augmenter les salaires, allocations et pensions et les indexer sur les prix | Augmenter massivement les salaires, allocations et pensions et les indexer sur les prix | 2 | oui (citation : « une augmentation massive ») |

### olivier-becht.csv

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| prop-ob-3 | contexte | Site de campagne, page « Le pacte démocratique et territorial ». Le référendum permettrait à chacun de saisir directement l'Assemblée nationale ; les départements pourraient aussi fusionner en provinces. | Site de campagne, page « Le pacte démocratique et territorial ». Le vote blanc serait reconnu pour que l'abstention ne soit plus le seul recours, sans dire s'il compterait dans les suffrages exprimés. Le référendum permettrait de saisir directement l'Assemblée nationale. | 4 | oui (WebFetch : « afin que l'abstention ne soit plus le seul mode d'expression ») |

Aucune proposition pour les autres candidats : leurs titres et contextes disent déjà où, qui et combien, ou la source n'en dit pas plus (voir les cas douteux).

## lois.json

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| abrogation-retraite-64-ans-2024 | enjeu | Texte visant à revenir sur la réforme de 2023, qui a reculé l'âge légal de départ de 62 à 64 ans. | L'âge légal de départ reviendrait de 64 à 62 ans, et la durée de cotisation pour une retraite à taux plein de 43 à 42 années, en annulant les dernières réformes. | 5 | oui (exposé de la proposition de loi n° 284, art. 1 et 2) ; texte de la commission, celui qui a été voté, non lu |
| loi-retraites-2023 | enjeu | Réforme des retraites : âge légal porté progressivement à 64 ans et allongement accéléré de la durée de cotisation. | Réforme des retraites : âge légal porté progressivement de 62 à 64 ans, et 43 années de cotisation exigées plus tôt pour une retraite à taux plein. | 2 | oui (exposé de la proposition de loi n° 284 : « 172 trimestres (43 annuités) à compter de la génération 1965 ») |
| rejet-ceta-senat-2024 | enjeu | Le Sénat vote l'article qui autorise la ratification, c'est-à-dire l'approbation définitive par la France, de cet accord de libre-échange déjà appliqué en partie depuis 2017. | Le Sénat vote l'article qui autorise la ratification (l'approbation définitive par la France) de l'accord de libre-échange avec le Canada : baisse des droits de douane et ouverture des marchés publics, déjà appliquée en partie depuis 2017. | 5 | non (contenu repris de l'enjeu de `ratification-ceta-an-2019`) |

## enjeux.json

| id | champ | avant | après | critère | source vérifiée |
| --- | --- | --- | --- | --- | --- |
| nouveaux-reacteurs | enjeu | Lancer la construction de nouveaux réacteurs nucléaires en France, en plus de ceux qui fonctionnent déjà. | Lancer en France la construction de réacteurs nucléaires de nouvelle génération (EPR), en plus de ceux qui fonctionnent déjà. | 5 | oui (les deux citations parlent d'EPR : `prop-ez-7` EPR2, `prop-fro-2` EPR) ; l'enjeu recopiait la question |
| prix-minimum-agricole | enjeu | Empêcher que les agriculteurs vendent leur production en dessous d'un prix fixé à partir de ce qu'elle leur coûte. | Empêcher que les agriculteurs soient payés en dessous d'un prix minimum, fixé par l'État quand les prix sont trop bas ou calculé à partir de leurs coûts de production. | 5 | oui (citations de `prop-fro-4` et `prop-jl-1`) ; l'ancien enjeu ne valait que pour `prop-jl-1` |

## Mots à ajouter à data/mots.json (critère 3)

Signalés, pas ajoutés. Aucun nouveau sigle dans les propositions ci-dessus.

| mot | où il est lu | pourquoi |
| --- | --- | --- |
| nasse | `prop-am-10` (titre) | terme de maintien de l'ordre, non défini dans la source |
| peine plancher (peines planchers) | `prop-ep-7`, `prop-mlp-1` (titres), `prop-br-1`, `prop-fa-7`, `prop-fp-7` (contextes), enjeu `peines-planchers` | expliqué dans certains contextes seulement |
| décote | `prop-xb-3` (titre) | terme de retraite, absent de `mots.json` |
| centre éducatif fermé | `prop-np-5` (titre) | terme de justice des mineurs |
| convention citoyenne (conventions citoyennes) | `prop-am-8` (titre), `prop-am-9` (contexte) | le tract n'en dit pas plus |

## Cas douteux, non tranchés

1. **SMIC « net » sans « par mois »** : `prop-fro-1` (« 1 500 euros net »). L'article de Public Sénat dit « net », sans « par mois », alors qu'il écrit « 1200 euros net par mois » pour la pension. Ajouter « par mois » serait une déduction : laissé tel quel. Même chose pour les 500 euros de `prop-ak-1` (contexte proposé plus haut).
2. **`prop-mt-7`, 110 caractères** : ajouter « d'euros » allonge un titre déjà trop long. Autre solution : retirer « avec volet climat » du titre, déjà expliqué dans le contexte, mais c'est retirer une partie de la mesure (règle 6).
3. **`prop-nda-3`, « soignants exclus »** : la source ne dit pas pourquoi (refus du vaccin pendant le Covid). Le contexte cite le passe sanitaire, mais le titre ne se comprend pas seul. La raison ne peut être ajoutée sans source.
4. **`prop-fro-3`, titre plus large que sa citation** (règle 6, hors du lot) : « Rembourser à 100 % [...] tous les soins prescrits » pour la citation « il n'y aura plus besoin d'organismes complémentaires ». Source non rouverte.
5. **`prop-mm-6` et `prop-rg-4`, périmètre** : programmes des européennes, mais la citation ne dit pas si la mesure vaut dans l'Union européenne ou en France. « Mesure européenne » figure déjà dans le contexte de `prop-mm-6`.
6. **`prop-ak-4`, « liberté de circulation et d'installation »** : la source ne dit pas pour qui. `prop-na-6` le dit (« pour chaque être humain »), pas ce dépliant.
7. **`prop-jl-1` dans l'enjeu `prix-minimum-agricole`** (règle 10) : construire le prix à partir des coûts n'est pas exactement un prix minimum garanti. Danny doit dire si la proposition reste dans l'enjeu.
8. **`mineurs-reseaux-sociaux-2026` et `loi-majorite-numerique-2023`** : les deux questions demandent presque la même chose (moins de 15 ans, accord d'un parent). L'enjeu 2026 (« sans l'accord d'au moins un parent ») n'a pas été relu dans le texte de commission mixte paritaire. Il faudrait dire ce que le texte de 2026 ajoute à celui de 2023.
9. **`loi-immigration-2023`, enjeu vague** (« plus stricts », « réformé ») : il faudrait le texte de la loi et la décision du Conseil constitutionnel, qui en a censuré une partie. Non fait.
10. **`regulation-meubles-tourisme-airbnb-2024`** : l'enjeu ne donne ni le plafond de jours ni la baisse de l'avantage fiscal. Page de vie-publique.fr illisible avec WebFetch, donc rien de proposé.
11. **`prop-am-8`, « conventions citoyennes »** et **`prop-ob-8`, « allocations dès le premier enfant »** : le tract et le site n'en disent pas plus. Seul l'ajout du mot au glossaire est possible pour la première.
