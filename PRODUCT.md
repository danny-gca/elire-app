# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Citoyens et électeurs français cherchant à s'informer et comparer objectivement les propositions et votes des candidats pour la présidentielle 2027.

## Product Purpose

Offrir une application citoyenne indépendante, neutre et 100% locale pour découvrir, évaluer et comparer les programmes politiques ainsi que les votes réels au Parlement, sans algorithme d'enfermement ni collecte de données privées.

## Positioning

Comparateur électoral 100% local-first (zéro compte, zéro serveur, zéro télémétrie), combinant vote à l'aveugle sur les propositions de campagne et vérification factuelle des votes effectifs au Parlement avec sources officielles.

## Operating Context

Consultation sur mobile et web. Sessions courtes de vote à l'aveugle (découverte anonymisée de mesures) et sessions approfondies d'analyse (fiches candidats, explorateur thématique, historique des votes législatifs).

## Capabilities and Constraints

- Fonctionnalités : vote à l'aveugle sur 4 niveaux (Impossible, Contre, Pour, Parfait) ou « Je ne sais pas » (non compté), contexte et glossaire des sigles dans « En savoir plus », vote sur des scrutins réels (Contre, Abstention, Pour) comparé aux votes des candidats, score d'accord combiné par candidat en temps réel, fiches candidats (programme 2027 + votes au Parlement), modification d'un vote depuis partout (gomme), partage d'une image du classement (complète ou sans nom), explorateur par thématique, catalogue des lois et scrutins parlementaires.
- Votes enregistrés uniquement sur l'appareil (expo-sqlite/kv-store en natif, localStorage sur le web), effaçables à tout moment.
- Contraintes techniques : Expo React Native (iOS, Android, Web), données publiques embarquées en JSON validé par Zod, Zustand, aucune requête tierce (polices libres auto-hébergées), thème clair obligatoire exclusif (aucun thème sombre).
- Neutralité républicaine absolue : anonymat des propositions en mode découverte, ordre de présentation mélangé, source et numéro stable pour chaque proposition et loi, rangs ex æquo départagés au hasard, couleurs d'échelle réservées aux votes de l'utilisateur ; la couleur d'un parti ne marque que son identité (anneau du portrait, en-tête de la fiche), jamais un score ni le vote à l'aveugle.

## Brand Commitments

- Nom : élire (Présidentielle 2027).
- Univers graphique : « le cahier annoté ». Papier blanc froid, encre, graphite, un surligneur jaune réservé aux avis de l'utilisateur. Le Classement prend la forme de panneaux électoraux identiques et numérotés.
- Palette neutre : elle ne rappelle ni l'État ni un parti, sans dégradé ni violet ; accents thématiques sourds. Les couleurs des partis n'apparaissent qu'en anneau autour des portraits et en en-tête de fiche, même règle pour tous.
- À ne jamais ressembler à : un site gouvernemental, une appli gadget ou gamifiée, les applis à cartes à swiper (dégradé violet).

## Evidence on Hand

- Données éditoriales : data/candidats/\*.csv (144 propositions vérifiées, 25 candidats, chacun avec la source datée de sa candidature), data/lois.json (42 scrutins parlementaires réels vérifiés, de 2017 à 2026 : Assemblée, Sénat, Parlement européen).
- Qualité des sources : chaque proposition renvoie à un document précis qui la contient (vérification du 2026-10-13, docs/verification-donnees.md). Plusieurs mesures viennent de programmes 2022, faute de programme 2027 publié.
- Charte graphique : src/constants/theme.ts, logo vectoriel assets/brand/mark.svg, contrat de direction .impeccable/surfaces/src-app-tabs-index-tsx.md.

## Product Principles

1. Neutralité et équité absolue entre tous les candidats.
2. Confidentialité totale : tout le calcul et les votes restent sur l'appareil.
3. Rigueur des faits : distinction stricte entre promesse de campagne et vote parlementaire effectif, et entre vote individuel et vote de groupe.
4. Entrée d'un candidat : candidature déclarée ou désignée, avec une source datée ; même nombre de propositions pour tous.
5. Clarté et calme : l'utilisateur doit repartir avec le sentiment de s'être fait son avis, sans pression.

## Accessibility & Inclusion

- Thème clair contrasté avec ratios conformes WCAG AA.
- Support du responsive web et mobile avec cibles tactiles adaptées (min 44px).
- Labels et rôles d'accessibilité sur les éléments interactifs ; animations coupées si « Réduire les animations » est actif.
