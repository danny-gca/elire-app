# Déploiement des applications mobiles (Android et iOS)

Guide synthétique pour déployer les versions mobiles sur le Google Play Store et l'App Store via GitHub Actions et EAS.

## 1. Configuration du projet
- Définissez l'identifiant de paquet Android (`android.package`) dans `app.json`.
- Définissez l'identifiant de bundle iOS (`ios.bundleIdentifier`) dans `app.json` lorsque la version iOS sera lancée.
- Initialisez la configuration EAS avec la commande `npx eas-cli build:configure` pour générer le fichier `eas.json`.
- Configurez les profils `preview` et `production` dans `eas.json` avec l'option de soumission automatique si souhaité.

## 2. Comptes et accès nécessaires
- Créez un compte gratuit sur [Expo](https://expo.dev/signup) pour héberger la compilation cloud et stocker les certificats.
- Ouvrez un compte développeur sur [Google Play Console](https://play.google.com/console/signup) (frais unique de 25 $ à vie) et téléchargez une clé de compte de service Google Cloud.
- Souscrivez plus tard au [programme Apple Developer](https://developer.apple.com/programs/enroll/) (99 $/an, reporté pour le moment) pour publier sur l'App Store.
- Exécutez `npx eas-cli credentials` en local une première fois pour lier vos comptes et générer les profils de signature.

## 3. Secrets de CI
- Créez un token d'accès personnel sur votre compte Expo depuis [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens).
- Ajoutez le secret `EXPO_TOKEN` dans les secrets GitHub du dépôt (Settings > Secrets and variables > Actions).
- Ne créez aucun fichier `.env` sur le dépôt car les secrets résident sur GitHub et Expo.

## 4. Pipeline GitHub Actions
- Ajoutez l'action `expo/expo-github-action@v8` dans votre workflow pour initialiser la CLI EAS avec `EXPO_TOKEN`.
- Lancez `npx eas-cli build --platform android --profile production --non-interactive` pour compiler Android seul (ou `--platform all` quand iOS sera activé).
- Lancez `npx eas-cli submit --platform android --profile production --non-interactive` pour envoyer les binaires vers le Google Play Store.

## 5. Mises à jour rapides (OTA)
- Utilisez `npx eas-cli update --branch production` pour pousser des correctifs de code ou de données sans recompiler l'application.
- Réservez les builds complets aux modifications de librairies natives ou de paramètres dans `app.json`.
