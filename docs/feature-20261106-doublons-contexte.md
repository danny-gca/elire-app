# Candidatures, doublons et contexte (2026-11-06)

## 1. Candidatures : où en est-on ?

**Aucun candidat n'est encore « officiel ».** Seul le Conseil constitutionnel arrête la liste, après les parrainages :

| Étape | Date | Source |
|---|---|---|
| Dates des tours | 1er tour 2027-04-18, 2nd tour 2027-05-02 (Conseil des ministres du 2026-07-01) | [service-public.gouv.fr](https://www.service-public.gouv.fr/particuliers/actualites/A15053?lang=fr) |
| Décret de convocation, ouverture des parrainages | au plus tard 2027-02-07 / 08 | [Toute l'Europe](https://www.touteleurope.eu/vie-politique-des-etats-membres/presidentielle-2027-calendrier-dates-inscription-candidats-vote/) |
| Clôture des parrainages | 2027-03-12, 18 h | idem |
| Liste officielle | attendue le 2027-03-16, au plus tard le 26 | idem |

Le statut existe déjà dans `data/candidats.json` (`candidature.statut` : `declaree`, `designee`, `sous_condition`, `pressentie`), affiché sur la fiche avec sa source. Revérifié le 2026-11-06 : **aucun retrait parmi les 25**.

### Proposition : statut `officielle`

Ajouter `officielle` au schéma en mars 2027 (date du Journal officiel, source = décision du Conseil constitutionnel), et retirer les candidats non retenus. D'ici là, rien à changer dans l'app.

### Points à trancher

- **Jean Lassalle** est `pressentie` (cagnotte de juillet, décision promise « à l'automne », toujours « prétendant » pour [Public Sénat](https://www.publicsenat.fr/actualites/politique/election-presidentielle-2027-qui-sont-les-candidats-declares-ou-presque) le 2026-10-14). Or `CONTRIBUTING.md` dit : « Pressenti ne suffit pas ». Le garder (exception à écrire) ou le retirer ?
- **Xavier Bertrand** : « Je le serai » le 2026-08-27, mais déclaration formelle annoncée « à la fin de l'année » ([LCP](https://lcp.fr/actualites/2027-figure-de-la-droite-xavier-bertrand-confirme-qu-il-sera-candidat-a-l-election)). Reste `declaree` (annonce publique par la personne) ou passe `sous_condition` ?
- **Marine Tondelier** : toujours candidate, mais les adhérents écologistes votent du 10 au 13 décembre sur sa candidature ou un soutien ([Public Sénat](https://www.publicsenat.fr/actualites/politique/presidentielle-2027-personne-ne-gagnera-seul-assure-marine-tondelier)). Dans `todo.md`.
- **Marine Le Pen** : éligible depuis l'arrêt d'appel du 2026-07-07, pourvoi en cassation jugé avant le 1er tour ([Toute l'Europe](https://www.touteleurope.eu/vie-politique-des-etats-membres/proces-des-assistants-du-rn-marine-le-pen-condamnee-en-appel-mais-eligible-a-l-election-presidentielle-2027/)). Rien à changer.
- **Candidats déclarés absents de l'app** (récapitulatif [franceinfo du 2026-10-22](https://www.franceinfo.fr/elections/presidentielle/portraits-qui-sont-les-candidats-declares-a-l-election-presidentielle-de-2027_8208032.html) : 34 actifs) : Gilles Platret (2026-10-08), Juan Branco, Francis Lalanne, Sylvain Durif, Benoît Mathieu, Manolo Mlekuz, Clara Egger, Jean-François Legendre, Erwan Rohou, Christian Collovati, Augustin Billetdoux. Bernard Cazeneuve : sources contradictoires. Hollande, Villepin, Le Maire : pas déclarés. La règle actuelle les ferait tous entrer, avec 8 propositions chacun. Les ajouter, ou attendre la liste officielle pour les « petits » candidats ?

### Programmes : fait dans `data/candidats.json`

| Candidat | Avant | Après | Pourquoi |
|---|---|---|---|
| Antoine Mikolajczak | partiel (tracts), annonce 2026-11-02 | partiel, [« L'essentiel »](https://parti-equinoxe.fr/wp-content/uploads/2026/11/Equinoxe-Lessentiel-Programme-synthetique-pour-lelection-presidentielle.pdf) (novembre 2026, 52 p.) | Synthèse en 3 chapitres lue, pas de programme complet |
| Jean-Luc Mélenchon | annonce 2026-11-06 | annonce retirée | 5e édition sortie en librairie ce jour, sans PDF : propositions à relire plus tard |

Revérifié sur pièce le 2026-11-06, critère : ce que l'équipe présente elle-même comme son programme 2027 entier. Lisnard (« Le programme est publié sur le site de Nouvelle Énergie »), Philippot (« Projet pour la France », « ce projet, aidez-nous à le porter en 2027 », tous les thèmes), Tondelier (208 p., « Le nouveau programme ») et Mélenchon (édition 2025) restent `complet`. Philippe (« premières orientations »), Ruffin (cahiers en cours), Dupont-Aignan (« actualisation en cours »), Becht (livre en 11 parties), Polony, Équinoxe (« nous construisons notre programme »), Retailleau (livrets), Arthaud, Kazib, Labib et Bouamrane (brochure, dépliant, tract, manifeste) restent `partiel`.

Dates de publication : Arthaud (26/06/2026) est confirmée par la page Documents de Lutte ouvrière. Retailleau (31/08), Labib (28/09) et Mélenchon (18/02/2025) ne viennent que des métadonnées du PDF ; Tondelier (13/07) n'est attestée que par le mois imprimé (« Juillet 2026 »).

Rien de neuf trouvé chez Glucksmann, Attal, Le Pen, Roussel, Zemmour, Asselineau, Markovic, Batho, Bertrand (toujours `aucun`). La page « projet » de Natacha Polony n'existe pas (404). Dépliant de Nathalie Arthaud du 2026-11-03 à lire à la main.

### Nouvelles questions possibles

À tirer de l'essentiel Équinoxe (remplacer prop-am-9 à 11 et les mesures de 2024 : contribution carbone redistributive, chambre citoyenne, alimentation saine) et de la 5e édition de L'Avenir en commun (238 mesures nouvelles) quand elle sera en ligne. À faire avec `collecter-donnees`, après validation.

## 2. « J'ai déjà répondu à cette question »

Le paquet pose 157 propositions seules, 16 questions communes et 42 scrutins. Le nouveau contrôle (`src/lib/doublons.ts`, seuil 0,45) relève **13 paires** ; elles sortent en avertissement à chaque build (bloquant en `--strict`).

Trois causes :

1. **Deux scrutins sur le même texte** (L/L) : la même question, deux fois.
2. **Une proposition et un scrutin sur la même mesure** (P/L, E/L) : le lecteur ne voit pas que l'une compare aux programmes et l'autre aux votes.
3. **Des propositions proches restées seules** (P/P, P/E) parce qu'elles mêlent deux idées, donc hors question commune.

### Arbitrages proposés

| Paire | Score | Proposition |
|---|---|---|
| L-18 / L-32 CETA (Sénat 2024 / Assemblée 2019) | 1,00 | Question identique. **Retirer L-18** (4 votes, L-32 en a 10) et le remplacer par un scrutin sur un autre sujet. |
| L-24 / L-03 retraites (abrogation 2024 / réforme 2023) | 0,70 | L-24 est l'inverse de L-03. **Retirer L-24** et le remplacer par un scrutin sur un autre sujet. |
| L-08 / L-44 réseaux sociaux | 0,43 | L-08 : les 9 candidats ont voté pour, il ne départage personne et ressemble à L-44. **Retirer L-08.** |
| P-233 (mlp-5) / P-974 (ob-3) / E-03 RIC | 0,64 | Les deux mêlent le RIC à une autre idée (proportionnelle, vote blanc). Couper la citation sur le RIC (`[...]`), réécrire le titre, les faire entrer dans E-03 (5 candidats). |
| P-220 (sl-2) / E-11 temps de travail | 0,57 | Couper la citation sur « la baisse du temps de travail sans perte de salaire », entrer dans E-11. P-705 (na-2, « répartir le travail ») reste seule : elle ne dit pas « réduire ». |
| P-857 (ak-1), P-842 (fro-1), P-939 (sl-1) SMIC | 0,46 à 0,56 | Nouvelle question commune « Augmenter nettement le SMIC, au-delà de sa hausse automatique » (citations recoupées sur le SMIC). P-224 (jlm-3) reste seule : elle porte aussi la retraite à 60 ans. |
| P-624 (np-8) / E-04 OTAN | 0,57 | Pas la même idée (redéfinir ≠ quitter). Réécrire le titre pour que la différence se lise : « Revoir le rôle de la France dans l'Alliance atlantique (OTAN), sans parler d'en sortir » si la vidéo le confirme, sinon le dire dans le contexte. |
| P-365 (mt-2) / L-19 PFAS | 0,64 | Même mesure côté programme et côté vote : retirer le scrutin et le remplacer par un scrutin sur un sujet non couvert, ou réécrire sa question sur ce qui le distingue. |
| P-507 (ga-3) / L-44 réseaux sociaux | 0,56 | Idem. |
| E-01 / L-07 nucléaire | 0,49 | Idem. |
| E-09 / L-03 retraites | 0,47 | Idem. |
| P-705 (na-2) / P-220 (sl-2) | 0,50 | Réglé si sl-2 entre dans E-11. |
| P-511 (kb-4) / P-130 (rg-1) | 0,53 | Faux positif (logement / défense) : déjà dans `data/questions-distinctes.json`. |

Les scrutins retirés laissent la place à des scrutins sur des sujets que le paquet ne pose pas encore, de préférence des textes de l'opposition rejetés (`todo.md`, Neutralité).

## 3. Le contexte

### Mesure

`src/lib/contexte.ts` mesure les « Précisions » de chaque question (contexte d'une proposition sans la phrase qui nomme le document ; enjeu d'un scrutin ou d'une question commune) et les rapporte à la médiane de son type. Le build signale celles sous 50 %, dans ses avertissements habituels.

| Type | Questions | Médiane des précisions | Avec un repère |
|---|---|---|---|
| Propositions seules | 157 | 160 car. | 1 (1 %) |
| Questions communes | 16 | 109 car. | 1 (6 %) |
| Scrutins | 42 | 186 car. | 1 (2 %) |

**Le vrai manque est là : 3 questions sur 215 ont l'onglet « Contexte »** (repère : Aujourd'hui, En débat). Pour les autres, le lecteur n'a que 1 à 2 phrases. Et l'enjeu d'un scrutin est plafonné à 220 caractères par le schéma.

### Propositions

1. **Écrire des repères par sujet, pas par question** : un repère sert à plusieurs questions et règle aussi une partie du « déjà vu » en reliant visiblement les questions sœurs. Sujets prioritaires, par nombre de questions touchées : retraites (étendre à L-03, L-24, L-42), nucléaire et éolien (E-01, E-02, L-07, L-01, L-38, P-531), réseaux sociaux et mineurs (L-44, L-08, P-507), SMIC et salaires (P-857, P-842, P-939, P-224, P-348), libre-échange (L-18, L-32, P-421, P-947, P-316), OTAN et Union européenne (E-04, E-05, P-624, P-920), RIC et vote blanc (E-03, P-233, P-974, P-305), temps de travail (E-11, P-705, P-220, P-688, P-575), PFAS (L-19, P-365).
2. **Compléter les 13 propositions maigres** à partir de leur source (modalités, chiffres, exceptions), sans rien ajouter qu'elle ne dise : P-343 (na-4), P-184 (mt-5), P-590 (mlp-6), P-139 (kb-8), P-324 (br-6), P-372 (xb-4), P-491 (jl-5), P-612 (ob-5), P-348 (na-1), P-744 (nda-3), P-502 (ga-4), P-766 (mlp-2), P-763 (sl-5).
3. **Équilibre entre candidats** : au relevé du 2026-11-06, la longueur moyenne du contexte va de 62 % de la médiane (Jean Lassalle) à 125 % (David Lisnard) ; resserrer d'abord Lassalle, Glucksmann, Labib, Arthaud et Bertrand.
4. **Plafond de l'enjeu d'un scrutin** : passer de 220 à 300 caractères, pour dire ce que le texte change et ce qu'il ajoute au texte voisin (règle 13). À décider.

## 4. Corrections faites le 2026-11-06

Chaque source a été relue ; rien n'est ajouté qu'elle ne dise.

**Scrutins retirés (3)** : L-18 CETA au Sénat (doublon de L-32), L-24 abrogation des 64 ans (inverse de L-03), L-08 accord parental sur les réseaux sociaux (vote unanime des candidats, proche de L-44). Les numéros restent réservés dans `data/refs.json`.

**Scrutins ajoutés (8)**, chiffres relus sur la page officielle (synthèse, groupes, votes nominatifs). Bilan : 47 scrutins, 35 adoptés, 8 rejetés, 4 en cours.

| Date | Scrutin | Sujet | Résultat |
|---|---|---|---|
| 2026-10-29 | [n° 9334](https://www.assemblee-nationale.fr/dyn/17/scrutins/9334) | Jeunes majeurs de la protection de l'enfance accompagnés jusqu'à 25 ans (article 1er) | adopté 121-88, en cours |
| 2026-10-27 | [n° 9123](https://www.assemblee-nationale.fr/dyn/17/scrutins/9123) | Surtaxe sur les bénéfices des très grandes entreprises en 2027 (suppression ramenée au fond) | rejetée 79-77 |
| 2026-10-15 | [n° 8738](https://www.assemblee-nationale.fr/dyn/17/scrutins/8738) | Plafond de l'abattement de 10 % des retraités abaissé à 3 000 euros (suppression ramenée au fond) | rejeté 116-30 |
| 2026-10-14 | [n° 8725](https://www.assemblee-nationale.fr/dyn/17/scrutins/8725) | Contribution de 30,9 milliards au budget européen 2027 | adoptée 111-93, en cours |
| 2026-07-07 | [n° 7987](https://www.assemblee-nationale.fr/dyn/17/scrutins/7987) | Présomption de légitime défense des forces de l'ordre | adoptée 313-199, en cours |
| 2026-06-11 | [n° 7380](https://www.assemblee-nationale.fr/dyn/17/scrutins/7380) | Nationalisation d'ArcelorMittal France (deuxième lecture) | adoptée 106-49, en cours |
| 2025-10-30 | [n° 3264](https://www.assemblee-nationale.fr/dyn/17/scrutins/3264) | Origine des aliments sur l'étiquette (article 1er) | rejeté 162-149 |
| 2025-06-30 | [n° 2873](https://www.assemblee-nationale.fr/dyn/17/scrutins/2873) | Holding de l'audiovisuel public (motion de rejet ramenée au fond) | rejetée 94-38 |

Écartés : résolution « double frontière Schengen » (n° 8611, trop proche de prop-nda-1 « sortir de Schengen »), accompagnants d'élèves handicapés fonctionnaires (n° 9203, abstentions massives qui ne départagent pas).

**Vote corrigé** : `loi-narcotrafic-2025`, Marine Tondelier passe de « contre » à « abstention » (groupe écologiste : 0 pour, 4 contre, 25 abstentions, scrutin n° 1473).

**Glossaire** (`data/mots.json`) : 40 mots ajoutés (20 -> 60), tous employés dans les textes lus à l'aveugle, dont réduflation, indexation, réquisition, proportionnelle, vote blanc, suffrages exprimés, priorité nationale, article 49.3, néonicotinoïdes, passoire thermique, tiers payant, espace Schengen, abattement, surtaxe. Écartés : « dissolution » et « décentralisation », employés dans plusieurs sens.

**Contextes complétés (15)**

| Réf. | Ajout tiré de la source |
|---|---|
| prop-na-4 | Deux millions de logements vacants, service du logement à prix coûtant. Type corrigé : entretien, donc `prise_de_position` |
| prop-mlp-6 | La même mesure réserve les aides sociales aux Français, prestations conditionnées à 5 ans de travail |
| prop-jl-5 | Versions militaire et civile, première annuité de retraite, étude d'impact |
| prop-jl-4 | Réseaux visés, ni calendrier ni budget, 3 milliards pour les campagnes |
| prop-nda-3 | Liée à la fin du passe sanitaire ; la page ne chiffre rien |
| prop-na-1 | 300 à 500 euros, 2 200 euros net, indexation sur la hausse réelle des prix |
| prop-jlm-2 | Mesure clé de l'état d'urgence sociale, réduflation, outre-mer ; ni niveau ni durée |
| prop-mlp-2 | Partie natalité : part fiscale pour le deuxième enfant, prêt à taux zéro |
| prop-br-6 | Réforme constitutionnelle de 2018, plus de moyens pour le Parlement |
| prop-xb-4 | Économies « sans créer de nouveaux impôts » |
| prop-ob-5 | L'entretien ne nomme pas les États du noyau |
| prop-ga-4 | Volet « responsabilisation », pénalité prévue par la loi dès 2024 |
| prop-sl-5 | La réponse dit attendre peu de la loi |
| prop-na-3 | Filiales et maisons-mères, confiscation des bénéfices tirés des ventes d'armes |
| prop-fa-5 | Révision constitutionnelle soumise au vote, confinement et couvre-feu limités |

Inchangées : prop-kb-8 (le manifeste ne donne rien de plus, le contexte le dit déjà) et prop-mt-5 (fausse alerte : la mesure retirait toute la première phrase ; elle n'ôte plus que 40 caractères au plus).

## 5. Correctifs d'affichage iPhone (2026-11-06)

Signalés sur iPhone, non reproductibles sur le web. Corrigés dans le code, **à vérifier sur un iPhone** (pas d'appareil pour l'instant).

| Symptôme | Cause | Correctif |
|---|---|---|
| « Réglages » : les « g » sont coupés | Literata mesure 1,49 em (ascendante 1177/1000). Sous cette hauteur, iOS pose la ligne de base au bas du cadre : 34 pt x 1,177 = 40 pt, pile le `lineHeight` | `src/constants/theme.ts` : sur iOS seulement, `screenTitle` passe à 51 et `display` à 36 (Android et web inchangés) |
| Bandeau « Votez » (pour, contre) trop haut, du vide au-dessus des onglets | `Screen` ajoutait `BottomTabInset` (60 pt) sous le bandeau sur iOS, un reste des onglets natifs qui recouvraient l'écran. La barre maison est sous l'écran depuis le 2026-10-19 | `src/components/screen.tsx` : marge iOS retirée |
| Animations réduites : « A voté ! » tout gris, illisible | Avec « Réduire les animations », Reanimated saute chaque `withTiming` à sa fin. Le compte à rebours de 10 s se vidait d'un coup, et le surligneur disparaissait | `ReduceMotion.Never` sur les comptes à rebours : « A voté ! », suite auto d'un scrutin (5 s), trait du haut de l'onboarding |
| Onboarding : « vous jugez la mesure, pas la personne. » sort de l'écran sur une seule ligne | Cause non trouvée : rien n'empêche le retour à la ligne (espaces normales), et la mise en page est la même qu'Android. Seule la mesure du texte diffère sur iOS | `src/components/sweep-text.tsx` : le titre surligné prend `width: '100%'`, donc une largeur imposée. Correctif défensif |
| Scrutins : fond un peu sombre derrière la salle (les petits bonhommes) | `shouldRasterizeIOS` sur le calque de la salle, ajouté le 2026-10-20. Seul élément propre à iOS dans ce décor | `src/components/crowd-backdrop.tsx` : rastérisation iOS retirée (iOS compose déjà l'opacité seul), texture Android gardée |

## 5. Un contexte pour chaque question (onglet « Contexte »)

**Avant** : 3 questions sur 220 avaient l'onglet « Contexte ». **Après** : les 220, réparties en 75 sujets (`data/reperes.json`), un sujet par question.

- Chaque repère : « Aujourd'hui » (faits datés et chiffrés), « En débat » (options sans nom, symétriques), 1 à 3 liens neutres qui en sont les sources (171 liens, tous joignables le 2026-11-06 ; 33 masqués pendant le vote parce qu'ils donnent un résultat ou un nom). Longueur médiane : 561 caractères, contre une ou deux phrases avant.
- Preuves : [feature-20261106-sources-sujets.md](feature-20261106-sources-sujets.md), chaque fait avec la page lue qui le contient.
- Contrôles du build (`src/lib/sujets-check.ts`, règle 15) : question sans sujet, sujet d'aucune question, sujet sans année, sans source lisible pendant le vote, ou relu il y a plus de 180 jours. Bloquant en `--strict`.
- Ton : « Les autres rappellent que... » donnait raison à un camp ; remplacé par « estiment que », « mettent en avant ».
- Résultats des scrutins : les repères décrivent le cadre sans dire l'issue du texte voté. Exception assumée, à valider : la règle en vigueur quand elle découle d'un texte posé (retraites à 64 ans, impôt sur la fortune immobilière).

À relire en priorité (sujets sensibles) : immigration-asile, expulsions, droits-des-etrangers, priorite-nationale, laicite, bioethique, justice-des-mineurs, parlement-gouvernement, defense, ukraine.

Chiffres à confirmer quand la source définitive paraît : budget 2026 de la culture (3,75 milliards, projet) et des armées (57,1 milliards, projet) ; contribution au budget européen (sources divergentes) ; effectifs des sapeurs-pompiers (2021).

**Structure (2026-11-06, [Danny])** : le lien va désormais de la question vers son sujet, comme pour le thème. `data/reperes.json` devient `data/sujets.json` et ne garde que le contenu (titre, aujourd'hui, en débat, liens) ; chaque question porte `sujet_id` (CSV des candidats) ou `sujetId` (`lois.json`, `enjeux.json`). Une proposition d'une question commune prend le sujet de la question. Le build refuse un sujet inconnu, signale une question sans sujet et un sujet d'aucune question ; un test vérifie que chaque proposition, scrutin et question commune a son onglet « Contexte » dans l'app (`getSujet`).
