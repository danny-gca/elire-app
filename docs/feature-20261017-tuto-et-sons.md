# Tuto guidé, sons, « A voté ! » plus visible, apparition des scrutins et onglets surlignés

Demandes du 2026-10-17. Branche `feature/tuto-et-sons` sur l'app et sur le site.

Légende : **[Danny]** = demandé tel quel, **[Décidé]** = validé ensemble, **[Proposition]** = ma reformulation ou mon idée, pas encore validée, **[Proposition initiale]** = gardée pour l'historique, remplacée par la version finale, **[Fait]** = dans le code.

## 1. Site : des phrases plus claires

**[Danny]** Certaines phrases du site sont mal tournées, trop complexes ou abstraites. Exemple : « en » à la place de « la ».

**[Proposition]** Une passe de relecture sur `src/pages/index.astro` et les pages légales, avec trois règles :

- une phrase = une idée, sujet + verbe + complément, pas de liste de virgules ;
- pas de pronom flou (« en », « y », « c'est écrit ») quand le nom est plus clair ;
- des mots concrets plutôt que des images (« panneau », « cahier », « trait ») quand l'image n'aide pas.

Phrases repérées (premier jet, liste à compléter) :

| Actuel | Proposition |
| --- | --- |
| « Vous pouvez **en** changer à tout moment en haut de l'écran Voter » | « Vous pouvez **la** changer à tout moment, en haut de l'écran Voter » |
| « la feuille se range en « Dernier vote » » | « la feuille se range en « A voté ! » » (le site n'est plus à jour : l'app dit « A voté ! » depuis la 1.1.0) |
| « Dernier vote » (démo du geste) | « A voté ! » |
| « 1. Lire, sans savoir qui » | « 1. Lire sans savoir qui propose » |
| « 3. Comparer, à égalité » | « 3. Comparer avec les candidats » |
| « Le même panneau pour tous, ex æquo au même rang. Illustration, noms masqués. » | « Chaque candidat a le même panneau. Deux scores égaux ont le même rang. (Exemple, noms masqués.) » |
| « Une promesse n'est pas un vote : c'est écrit. » | « Ce qu'un candidat promet et ce qu'il a voté sont affichés séparément. » |
| « Votre note se marque au surligneur » | « Vous notez avec votre surligneur » |
| « Sans vote, rien n'est inventé : « pas encore évalué ». » | « Tant que vous n'avez rien noté pour un candidat, il est affiché « pas encore évalué ». » |
| « Les scrutins comptent au nombre, mais jamais plus de la moitié du score » | « Plus vous votez de scrutins, plus ils pèsent, mais jamais plus de la moitié du score. » |
| « Plein : comme vous. Vide : à l'inverse. Gris : abstention. » | « Point plein : il a voté comme vous. Point vide : il a voté l'inverse. Point gris : il s'est abstenu. » |
| « Votre prochain trait » | « Votre prochaine note » |

**[Décidé]** Je fais la passe complète sur tout le site avec ces trois règles, puis Danny relit le diff.

**[Fait]** Environ 55 phrases réécrites dans `src/pages/index.astro`, « Dernier vote » devenu « A voté ! ». Page « Méthode et corrections » supprimée (site sur une page, sans autre page légale). Hémicycle de la démo aligné sur l'app : de votre couleur comme vous, noir l'inverse, vide l'abstention. Les captures de l'app sur le site restent à refaire (`todo.md`).

## 2. App : le Tip devient un tuto guidé

**[Fait]** `TutoLayer` (racine), `tuto-store.ts` (étapes vues enregistrées à part, clé `elire-tutos`), `src/constants/tutos.json`, `loopPath` (testé). 11 étapes sur 13 : `classement-fiabilite` est fusionnée dans `classement-panneau`, `fiche-parlement` est retirée (la section Parlement n'est pas à l'écran à l'ouverture d'une fiche). Explorer : la cible est la recherche (le filtre « pas encore votées » n'apparaît qu'en cherchant). Le Tip en haut de Voter est supprimé, ses textes sont dans les étapes. Gribouillis du message revu après retour de Danny (trop de verticales, trop de blanc, trop anguleux) : aller-retour de diagonales croisées en X, bouts arrondis, 1,1 s. Les étapes vues sont dans un store à part (pas dans `votes-store`) : pas de migration du store des votes.

### Ce qui existe

- `Tip` (`src/components/ui/tip.tsx`) : encart en haut de Voter, ampoule + texte, gribouillis au surligneur derrière. Un seul endroit (`src/app/(tabs)/index.tsx`). Affiché selon des compteurs (premier vote, votes 2 à 10, 3 premiers scrutins), rien n'est enregistré : il revient tant que la condition est vraie.

### Ce qu'on veut

**[Danny]** Le Tip agit comme un tuto obligatoire :

1. le message apparaît en haut, texte gribouillé au surligneur (comme aujourd'hui) ;
2. le trait du surligneur **sort du message** et vient **entourer** l'élément dont il parle, par-dessus tout le reste ;
3. tant que le message est là, l'app est « en pause ».

**[Fait] Déroulé d'une étape**

1. Un voile encre à 32 % couvre l'écran (règle des modales de DESIGN.md). L'élément ciblé reste net, découpé dans le voile.
2. Le message arrive en haut (fondu 220 ms), gribouillis tracé de gauche à droite (900 ms, comme le Tip).
3. Le trait continue d'un seul geste : il descend du message vers la cible, puis fait une boucle irrégulière autour (≈ 600 ms), comme on entoure un mot au feutre dans un cahier.
4. **[Décidé]** Seul le bouton « Compris » sous le texte ferme l'étape. Tout le reste est bloqué, la cible comprise.
5. « Réduire les animations » : tout s'affiche d'un coup, trait et boucle déjà tracés.
6. Lecteur d'écran : le message est annoncé, le focus va sur « Compris ».

**[Fait] « En pause »** = pendant un tuto :

- touches bloquées hors « Compris » ;
- comptes à rebours suspendus : « A voté ! » (10 s), « Question suivante » (5 s), lecture auto de l'onboarding (15 s) ;
- reprise exacte à la fermeture.

**[Fait] Une étape ne s'affiche qu'une fois**, enregistrée dans un store à part (`elire-tutos`) et non dans `votes-store`. « Réinitialiser mes votes » les remet à zéro. « Revoir les astuces », dans les Réglages (bouton en haut du Cahier, § 8), les rejoue.

**[Fait] Les étapes dans un JSON** (`src/constants/tutos.json`, mon choix, hors `data/` qui est réservé aux données éditoriales sourcées). Un format lisible et ouvert aux contributions :

```json
{
  "id": "a-vote",
  "ecran": "voter",
  "quand": "premier-vote",
  "cible": "a-vote",
  "lignes": ["Ici, vous pouvez modifier votre vote.", "Touchez « A voté ! » pour le corriger pendant 10 secondes."],
  "ordre": 2
}
```

- `cible` = un nom posé dans le code sur l'élément (`useTutoTarget('a-vote')`), pas une position à l'écran ;
- `quand` = un événement connu de l'app (liste fermée ci-dessous) ;
- si deux étapes tombent en même temps, `ordre` les enchaîne.

**[Proposition initiale] Liste des étapes** (version finale : `src/constants/tutos.json`, voir le [Fait] en tête de section)

| id | Écran | Quand | Cible | Message (premier jet) |
| --- | --- | --- | --- | --- |
| `voter-boutons` | Voter | arrivée après l'onboarding | boutons de vote | « Lisez la mesure, puis notez-la de −2 à +2. Pas d'avis ? « Je ne sais pas ». » |
| `en-savoir-plus` | Voter | arrivée après l'onboarding (étape 2) | « En savoir plus » | « Un sigle, un doute ? Le contexte est ici, sans dévoiler l'auteur. » |
| `a-vote` | Voter | premier vote | « A voté ! » | « Ici, vous pouvez modifier votre vote précédent. » |
| `premier-scrutin` | Voter | premier scrutin affiché | en-tête du scrutin | « Ici, c'est un vrai vote du Parlement : votez comme si vous y siégiez. » |
| `scrutin-hemicycle` | Voter | premier scrutin voté | hémicycle | « Chaque point est un candidat : plein, il a voté comme vous ; vide, l'inverse. » |
| `palier` | Voter | 3ᵉ vote | piste de progression | « Votre Classement s'ouvre à 10 votes. » |
| `surligneur` | Voter | 5ᵉ vote | sélecteur de couleur | « Changez de surligneur quand vous voulez : vos anciens traits gardent leur couleur. » |
| `classement-panneau` | Classement | première ouverture | premier panneau | « Touchez un candidat pour voir son programme et ses votes. » |
| `classement-fiabilite` | Classement | première ouverture (étape 2) | pastille de fiabilité | « Fragile, assez sûr, fiable : sur combien de votes repose ce score. » |
| `fiche-calcul` | Fiche candidat | première ouverture | carte « Accord avec vos votes » | « Touchez pour voir le calcul de ce pourcentage. » |
| `fiche-parlement` | Fiche candidat | première fiche avec des votes au Parlement | section Parlement | « Vote personnel ou position de son groupe : c'est toujours précisé. » |
| `explorer-filtre` | Explorer | première ouverture | filtre « pas encore votées » | « Ici, les auteurs sont visibles. Ce filtre montre ce qu'il vous reste à noter. » |
| `lois-scrutin` | Lois | première ouverture | premier scrutin | « Touchez un scrutin pour voir qui a voté quoi. » |

**[Décidé]** Les textes du Tip actuel sont fusionnés dans ces étapes et ne s'affichent qu'une fois : « Environ 20 secondes par question » et « L'auteur reste masqué » vont dans `voter-boutons`, « 3 à 5 minutes » et « Arrêtez quand vous voulez, vos votes restent sur votre appareil » dans `palier`, « votez comme si vous y siégiez » et « N candidats l'ont voté » dans `premier-scrutin`. Après ça, plus rien n'apparaît en haut de Voter : le Tip passif est supprimé.

**[Décidé : exception assumée]** DESIGN.md (Reader's Highlighter Rule) : le surligneur ne marque **que les votes de l'utilisateur**. Le tuto, le fond des scrutins (§ 4) et les onglets (§ 7) l'utilisent en décor. Le gribouillis du Tip le fait déjà sans être documenté. L'exception (tuto, onglet actif) est à écrire dans DESIGN.md. L'en-tête du scrutin reste en encre.

## 3. « A voté ! » plus visible

**[Danny]** Les gens ne voient pas « A voté ! » au début et ratent la modification. Peut-être un problème de couleur.

**Pourquoi on le rate** (constat dans le code) : la ligne est sur un papier presque opaque, filet gris, texte encre, donc de la même couleur que la page. Elle apparaît au moment où l'œil part vers la question suivante, et disparaît seule en 10 s.

**[Fait]**

- La ligne se remplit du **surligneur de ce vote** (c'est sa marque : la règle du surligneur est respectée), de gauche à droite à l'arrivée (220 ms), puis le surligneur se retire de droite à gauche en 10 s : le temps qui reste pour corriger. « Je ne sais pas » garde un fond neutre (filet léger).
- Arrivée : la ligne monte de 16 pt depuis les boutons de vote (320 ms) au lieu d'un simple fondu.
- Le vote et la gomme sont sur une pastille blanche (`EditChip`). Les couleurs d'échelle n'atteignent pas 4,5:1 sur le surligneur (2,6 à 5,3:1). Le mot « Modifier » n'a pas été ajouté : il aurait laissé trop peu de place au titre sur une ligne. Le tuto `a-vote` (§ 2) l'expliquera.
- Même rendu dans la démo de l'onboarding (« Changer d'avis »).

## 4. Scrutin : en-tête de la carte

**[Danny]** Mettre un fond sur l'en-tête de la carte de scrutin : soit le noir déjà utilisé, soit un gribouillis au surligneur derrière le texte.

**[Fait]** Fond **encre** (le noir de l'app), avec le texte et l'hémicycle en papier : on distingue un scrutin d'une proposition d'un coup d'œil, et la règle du surligneur reste intacte. Dans l'animation (§ 5), c'est l'empreinte du tampon qui pose ce fond.

## 5. Scrutin : nouvelle animation d'apparition

**[Danny]** Une animation complètement nouvelle à l'arrivée d'un scrutin, idée d'un clap ou d'un marteau de tribunal, peut-être avec les 4 couleurs de l'app en effet festif. Idée pas encore claire.

**[Décidé] « Le tampon »**, ≈ 1 s, enchaîné après le geste du vote existant. Le marteau a été écarté : c'est un objet de tribunal (et américain), alors qu'en France le président de l'Assemblée agite une sonnette. Le tampon renvoie au bureau de vote, comme « A voté ! ».

| t (ms) | Ce qui se passe |
| --- | --- |
| 0 | L'utilisateur touche son vote sur la proposition. Geste actuel : trait sur le bouton, balayage du titre, la feuille monte et devient « A voté ! » (≈ 800 ms). |
| 800 | La carte de scrutin arrive vierge (fondu 150 ms) : papier, contour, sans en-tête. |
| 950 | Un tampon encre (dessiné au trait, vu de biais) descend sur le haut de la carte (120 ms), s'écrase (impact 60 ms, légère vibration, son « tchac » sourd). |
| 1130 | Le tampon se relève et sort (150 ms) : son **empreinte** reste, c'est l'en-tête noir « Scrutin réel · hémicycle · chambre · année » (§ 4), bords légèrement irréguliers comme une encre de tampon. |
| 1130 | Le reste de la carte se trace (contour 700 ms, existant), la salle apparaît en fondu derrière, le brouhaha monte doucement. |
| ≈ 1300 | Boutons de vote débloqués. |

- Pas de 4 couleurs ici : réservées aux fêtes (bilan, fin), un scrutin revient trop souvent.
- Pas de secousse d'écran ni d'explosion : DESIGN.md interdit l'effet « appli gamifiée ».
- « Réduire les animations » : la carte apparaît directement avec son en-tête. Lecteur d'écran : annonce « Scrutin réel du Parlement », sans animation.
- Le tampon remplace le contour seul et le fondu actuels (`Contour`, `Leaving`), pas le geste du vote.

**[Fait]** `ScrutinStamp` (`scrutin-stamp.tsx`) et l'empreinte dans `PropositionSheet` (`stamp`). Durées resserrées par rapport au tableau : tout tient en 480 ms après l'arrivée de la feuille (impact à 270 ms), puis le contour (700 ms). Les boutons de vote ne sont pas bloqués pendant le tampon : moins d'une demi-seconde, et les griser à chaque scrutin aurait clignoté. Vibration et « tchac » : avec les sons (§ 6).

## 6. Sons

**[Danny]** Des sons propres à l'app, sans en abuser :

- surligneur sur un tableau ou un cahier, plusieurs variantes aléatoires ;
- fond sonore pendant un scrutin, petit brouhaha ;
- un son quand on vote ;
- un son au palier de 10 ;
- un son quand on modifie son vote ;
- des sons dans l'onboarding ;
- droits d'auteur à gérer, ou sons faits maison.

**[Proposition initiale] Carte des sons** (version finale dans le [Fait] ci-dessous)

| Moment | Son | Variantes | Volume |
| --- | --- | --- | --- |
| Trait du surligneur (bouton de vote, tuto qui entoure) | feutre sur papier, frottement court | 4 à 6, tirées au hasard, jamais deux fois la même d'affilée | bas |
| Vote enregistré (la feuille monte en « A voté ! ») | feuille qui glisse / se range | 2 | bas |
| Vote modifié | gomme sur papier | 2 à 3 | bas |
| Palier de 10 (bilan) | petite fioriture au feutre + note claire courte | 1 | moyen |
| Apparition d'un scrutin | « tchac » de tampon sur papier | 2 | moyen |
| Pendant un scrutin | brouhaha d'hémicycle en boucle, monte avec la salle, baisse à 35 % après le vote, coupé à la question suivante | 1 boucle de 10 à 15 s | très bas |
| Onboarding | page qui tourne à chaque histoire, feutre au choix du surligneur, fête finale | 2 + réutilisés | bas |

**[Fait] Règles**

- Un seul son ponctuel à la fois (le brouhaha peut continuer dessous).
- Respect du mode silencieux iOS, pas de son si le téléphone est en silencieux.
- **[Décidé]** Sons activés par défaut, interrupteur « Sons » dans l'onglet Cahier (§ 8).
- Sur le web : sons coupés jusqu'au premier toucher (règle des navigateurs).
- Fichiers courts, mono, compressés (< 30 Ko chacun, boucle < 200 Ko), dans `assets/sounds/`.
- Lib : `expo-audio` (à installer avec `npx expo install`, API à vérifier dans la doc SDK 57). Demande un nouveau build de dev.
- **[Décidé]** Vibrations légères (`expo-haptics`) en plus du son pour le tampon et le palier, coupées avec l'interrupteur « Sons ».

**[Proposition initiale] D'où viennent les sons** (du plus sûr au moins sûr ; **[Décidé]** finalement tous fabriqués par script, voir le [Fait]) :

1. **Faits maison** (recommandé) : enregistrés au téléphone, feutre sur cahier et sur tableau blanc, gomme, feuille, un maillet ou un poing sur une table en bois. Aucun problème de droits, sons cohérents entre eux, publiés sous la licence du dépôt.
2. **Freesound filtré CC0** (domaine public) : pour le brouhaha, difficile à enregistrer soi-même. Éviter CC BY-NC (pas d'usage commercial, incompatible avec un dépôt ouvert) ; CC BY possible avec crédit.
3. **À éviter** : Pixabay et banques « libres de droits » dont la licence interdit de redistribuer les fichiers seuls, ce que fait un dépôt public.
4. Tout est crédité dans `assets/sounds/CREDITS.md` (fichier, auteur, licence, lien).

Je peux t'aider : protocole d'enregistrement (distance, pièce calme, 3 prises par son), puis découpe, normalisation et compression en ligne de commande (`ffmpeg`).

**[Fait]**
- `expo-audio`, `expo-haptics` et `expo-asset` (dépendance requise par `expo-audio`) : nouveau build de dev nécessaire. Plugin `expo-audio` sans micro ni lecture en arrière-plan : seule la permission `MODIFY_AUDIO_SETTINGS` reste.
- Sons fabriqués par `scripts/build-sounds.mjs` (Node + ffmpeg), crédités dans `assets/sounds/CREDITS.md` et dans l'écran Crédits (« Sons · open source »). Remplaçables par des prises maison du même nom.
- Carte finale, après plusieurs retours de Danny (« sable », « train », « sifflement », « peur », « saturation ») :

| Moment | Son | Volume |
| --- | --- | --- |
| Trait du surligneur (vote, choix de la couleur, boucle du tuto) | `trait-1` à `trait-5` : petit couinement de feutre sur tableau blanc qui monte, frotté plutôt que sifflé | 12 % |
| La feuille se range en « A voté ! » | `feuille-1`, `feuille-2` : « woosh » net, sans grave | 5 % |
| Apparition d'un scrutin | `tampon-1`, `tampon-2`, avec une vibration légère | 20 % |
| Grande fête (bilan tous les 10 votes, fin de l'onboarding) | `palier` : gerbe de 5 traits de plus en plus aigus, avec une vibration de réussite | 14 % |
| Petite fête (vote modifié, image partagée) | `festif` : 3 coups de feutre distincts | 12 % |
| Pendant un scrutin | `brouhaha` : 24 voix synthétiques au débit lent dans une salle diffuse, deux lecteurs qui se relaient en fondu ; s'éteint en 1,5 s au vote ou hors de Voter | 1,8 % |

- Le son suit l'animation : chaque fête (`celebrate`) joue sa gerbe. Plus de son de gomme (vote modifié = petite fête), plus de son de page dans l'onboarding.
- Contrôlés au spectrogramme et au niveau, pas à l'oreille : à réécouter sur téléphone.
- Réglage « Sons et vibrations » (activé par défaut) dans les Réglages, store `elire-reglages`, gardé quand on efface ses votes.
- Onboarding : trait à l'essai de vote et au choix du surligneur, palier à la fin. La page qui tourne est retirée.

## 7. Onglets du bas : l'onglet actif surligné

**[Danny]** L'onglet actif est surligné avec le surligneur choisi. Au changement d'onglet, le nouveau se fait surligner à son tour, avec une animation, comme un cercle et un trait (texte + icône).

**[Fait]** On **garde les onglets natifs** (`NativeTabs`). Une barre maison obligerait à refaire le placement des boutons de vote fixes (`Screen`, différent sur iOS et Android) : trop risqué pour le gain. On colore seulement l'onglet actif au surligneur choisi, **sans animation maison** (celle du système suffit) :

- **Android** : `indicatorColor` = surligneur choisi (la pastille Material derrière l'icône de l'onglet actif).
- **iOS** : icône sélectionnée dédiée, `Icon src={{ default, selected }}` avec `renderingMode="original"`. L'icône `selected` porte une tache de surligneur dessinée derrière le pictogramme. 4 onglets × 4 couleurs = 16 PNG en plus, générés par `scripts/build-tab-icons.mjs`. Le libellé natif ne peut pas être surligné.
- **Web** (barre maison déjà en place, `app-tabs.web.tsx`) : libellé de l'onglet actif surligné de biais (le trait derrière l'icône faisait un bloc trop lourd).
- Changer de surligneur met à jour l'onglet actif tout de suite.
- Exception à la règle du surligneur, à écrire dans DESIGN.md (§ 2).

## 8. Onglet « Cahier » à la place de « Classement »

**[Fait, après coup]** Réglages sur un écran à part (`/reglages`), ouvert par un bouton « Réglages » en haut du Cahier : avec beaucoup de candidats « pas encore classés », ils étaient trop bas. On y trouve : surligneur, effacer les votes (efface aussi les astuces vues), « Revoir les astuces », pied de page.

**[Danny]** Remplacer « Classement » par un onglet personnel. On y trouve le Classement en premier et une page de réglages (son, surligneur, effacer les votes). Ça éloigne aussi l'app des menus d'Elyze (Vote, Classement, Explorer).

**[Fait]** Le nom est « **Cahier** ». Route `cahier` (ex-`results`), icône maison `cahier.svg` (l'icône podium d'Ionicons est retirée). Sons et « Revoir les astuces » arrivent avec leurs chantiers (6 et 4) ; « Revoir la présentation » reste dans le pied de page. Pas « Profil », qui fait penser à un compte alors que l'app promet « aucun compte ». « Cahier » reprend la métaphore de l'app, et le site dit déjà « votre cahier ».

- Onglets : **Voter · Cahier · Lois · Explorer**. Nouvelle icône `cahier.png`.
- Contenu de l'onglet, dans l'ordre :
  1. **Classement**, l'écran actuel. Avant 10 votes, à la place : « Votre Classement s'ouvre dans N votes », avec un bouton vers Voter.
  2. **Réglages** : Sons (on/off), Surligneur (sélecteur), Revoir les astuces, Effacer mes votes (déplacé depuis le Classement).
  3. **À propos** : méthode de calcul, sources, code, version.
- Les liens vers `/results` (bilan, partage, onboarding) restent valides ou sont redirigés.
- À mettre à jour : DESIGN.md (§ Navigation), la FAQ du site (« tout effacer depuis le Classement »), le README si les onglets y sont cités.

## 9. Onboarding : des textes plus simples

**[Danny]** Certaines tournures de l'onboarding sont bizarres. Surtout, elles sont trop précises : elles citent des écrans et des positions (« en haut de Voter », « en bas du Classement ») que la personne ne connaît pas encore. Retours de testeurs :
- « je comprends pas pourquoi ça parle de vote de son groupe » ;
- « cet exemple ne touche pas à vos votes » ne veut rien dire pour quelqu'un qui n'a encore jamais voté.

**Règle** : dans l'onboarding, on ne nomme ni écran, ni onglet, ni position, ni durée (sauf le temps global de la première page). On dit ce qu'on peut faire, pas où le trouver : le tuto (§ 2) montre le « où » sur place.

| Page | Actuel | Proposition |
| --- | --- | --- |
| Surligneur | « Choisissez la couleur de vos marques, elle sert dès la page suivante. Vous pourrez en changer en haut de Voter ; ce que vous avez déjà surligné garde sa couleur. » | « Choisissez la couleur de vos avis. Vous pourrez la changer plus tard : ce que vous avez déjà surligné garde sa couleur. » |
| Neutralité | « Les propositions arrivent sans nom ni parti, dans un ordre mélangé. Notez-les d'Impossible à Parfait, ou « Je ne sais pas » : essayez ci-dessous. » | **[Danny]** « Les propositions arrivent sans nom ni parti, dans un ordre mélangé. Notez-les ! Essayez ci-dessous. » |
| Changer d'avis | « Juste après un vote, « A voté ! » reste 10 secondes en haut de Voter : touchez-le pour corriger. Plus tard, ouvrez une proposition ou un scrutin déjà voté dans Explorer, Lois ou la fiche d'un candidat, puis touchez la gomme. Essayez ci-dessous. » | « Juste après un vote, touchez « A voté ! » pour le corriger. Vous pourrez aussi modifier vos votes après coup, si vous n'avez pas eu le temps de le faire. Essayez ci-dessous. » (**[Danny]** on ne dit pas où retrouver un vote : trop précis) |
| Transparence | « Dans Explorer, chaque proposition montre son auteur, sa date et sa source ; chaque scrutin renvoie au site officiel du Parlement. Touchez l'exemple (fictif). » | « Chaque proposition montre son auteur, sa date et sa source, et chaque scrutin renvoie à sa source. Essayez l'exemple ci-dessous. » (**[Danny]** « une source » et pas « le site officiel du Parlement », ce n'est pas toujours le cas ; plus de « fictif ») |
| Responsabilité | « Le programme 2027 et les votes réels au Parlement sont séparés. Quand un candidat n'a pas voté lui-même, c'est écrit : vote de son groupe. » | « Ce que les candidats promettent et ce qu'ils ont voté au Parlement sont affichés à part. Un candidat qui ne siégeait pas lors d'un vote ? On montre celui des élus de son parti, et c'est indiqué. » |
| Confidentialité | « Aucun compte, aucune statistique envoyée. Vos votes restent sur cet appareil, et vous pouvez les effacer à tout moment, dans les réglages de l'onglet Cahier. Essayez-le ci-dessous : cet exemple ne touche pas à vos votes. » | « Aucun compte, aucune statistique envoyée. Vos votes restent sur cet appareil, et vous pouvez les effacer à tout moment. Essayez ci-dessous, sans risque : ce n'est qu'un exemple. » |

**[Fait]** Textes du tableau appliqués, avec deux décisions de Danny :
- Responsabilité : on garde « groupe » et on l'explique : « Ce qu'un candidat promet et ce qu'il a vraiment voté sont montrés séparément. S'il n'était pas élu au moment d'un vote, on montre comment ont voté les élus de son parti : on appelle ça son « groupe ». » (2ᵉ version : la 1ʳᵉ restait trop politique pour qui n'y connaît rien) Les libellés « vote de son groupe » de l'app ne changent pas.
- La démo Transparence garde « Candidat fictif » comme auteur.
- Confidentialité : plus de démo d'effacement ni de « Essayez ci-dessous ». Effacer ses votes se fait dans Cahier > Réglages, assez simple pour ne pas l'expliquer.

## 10. Retours après les 6 chantiers (2026-10-17)

**[Fait]**
- **Haut de Voter** : plus de sélecteur de surligneur (il reste dans les Réglages). À gauche « Classement dans X votes » (puis « Bilan dans X votes »), à droite « N / 25 classés ». L'étape `surligneur` du tuto devient `reglages`, sur le bouton Réglages du Cahier.
- **Tampon** : ralenti à 1 s (impact à 450 ms, tampon appuyé, relevé lent). L'en-tête se décalait au bout de quelques secondes, avec du texte blanc sur fond blanc : c'était l'animation d'entrée de Reanimated sur le web, qui finissait par passer l'en-tête en `position: absolute`. Elle est remplacée par une valeur animée.
- **Brouhaha** : 15 % plus lent et plus grave, voix moins stables (moins « robot »), plus sourd, volume à 5 %. À réécouter.
- **Brouhaha, 3ᵉ version** (encore trop fort et un peu robotique) : volume à 3 %, 24 voix au lieu de 16 et plus lointaines, voyelles qui glissent l'une vers l'autre au lieu de sauter, souffle continu dans chaque voix, bourdonnement adouci, plus de salle, rumeur qui enfle et retombe (6 s).
- **Cahier** : les « pas encore classés » sont une liste (« 1 / 2 notées »), plus un panneau.
- **Gribouillis du tuto** : des hachures serrées et penchées qui couvrent tout le texte.
- **Hémicycle** : de votre couleur comme vous, noir plein l'inverse, rond vide l'abstention (le gris pâle se voyait mal ; pas de rouge, règle de neutralité). Légende sur une ligne dès 390 pt.
- **Recherche** : Explorer et Lois repartent de zéro quand on quitte l'onglet (Explorer : filtre et ordre aussi).
- **Cahier** : nouveau tirage au hasard à chaque visite ; les non classés sont dans l'ordre tiré seul (un score partiel ne les départage plus). Texte sans candidat classé : « Aucun candidat n'a encore assez de votes pour être classé : il faut noter au moins 2 de ses propositions. Continuez à voter. »
- **Sons** : refaits (voir § 6, carte finale). Volume du brouhaha borné dans [0, 1] (le web refusait −1e-18).
- **Fêtes** : 4 petites au lieu de 2 (étincelles, traits, entouré, cadre ; la coche faisait flèche, les étoiles faisaient croix). Une fête coupée (feuille fermée) est finie et ne rejoue pas à la réouverture. La feuille de modification se range 650 ms après le vote, une fois la fête dessinée. Pas de fête au vote d'un scrutin (essayée, retirée).
- **Onboarding** : on glisse aussi vers la gauche ou la droite pour changer de page ; les touchers à gauche et à droite restent, sans double déclenchement (vérifié sur le web).
- **Image de partage** : « élire » au pied de la carte au lieu de l'adresse du site (le texte partagé garde le lien).
- **Astuces** : pas d'italique (pas de vraie italique chargée, moins lisible en 13).
- **Ligne « Moi »** (feuille d'une proposition ou d'un scrutin) : la gomme est sur la ligne du vote, à gauche pour garder l'alignement avec les candidats ; toute la ligne se touche pour corriger (croix pendant la correction), et la feuille défile juste assez pour montrer l'échelle (`useSheetReveal`). Vérifié sur le web.
- **Brouhaha** : 1,8 %, éteint en fondu hors de l'onglet Voter ; raccord de boucle corrigé (il sautait d'1 s en arrière), puis deux lecteurs qui se relaient en fondu enchaîné (vérifié dans Chrome).
- **Classement du Cahier** : plus de tôle grise (« ça fait tâche, pas DA cahier »). Fiches blanches collées par un ruban adhésif translucide identique pour tous, sur une page quadrillée Seyès au filet ; rang écrit à l'encre en Literata, « ex æquo » en toutes lettres à côté (le « = » se lisait comme un exposant) ; parti sur une ligne. Vérifié en 390 et 1280.

## Hors périmètre

- Pas de refonte de l'onboarding : on y ajoute des sons (§ 6) et on simplifie les textes (§ 9).
- Pas de nouveau contenu éditorial (candidats, propositions, scrutins).
