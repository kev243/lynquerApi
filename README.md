# Lynquer API

Bienvenue dans l'API Lynquer, une API construite avec TypeScript, Express et MongoDB pour gérer les utilisateurs et leurs liens. Cette API permet de créer, lire, mettre à jour et supprimer des utilisateurs et des liens, ainsi que de gérer les images de profil des utilisateurs via Cloudinary.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Endpoints](#endpoints)

## Fonctionnalités

- Gestion des utilisateurs (inscription, connexion, mise à jour du profil)
- Gestion des liens (création, lecture, mise à jour, suppression)
- Téléchargement et gestion des images de profil via Cloudinary
- Authentification et autorisation avec JWT
- Validation des données et gestion des erreurs

## Prérequis

- Node.js (version 14 ou supérieure)
- MongoDB
- Un compte Cloudinary

## Installation

1. Clonez le dépôt :

   ```sh
   git clone https://github.com/votre-utilisateur/lynquer-api.git
   cd lynquer-api

   ```

2. Installer les dépendances
   npm install

3. Créez un fichier .env à la racine du projet et ajoutez les variables d'environnement suivantes
   PORT=4000

# MongoDB

DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT

TOKEN_SECRET=your_jwt_secret

# Cloudinary

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mail

API_KEY_RESEND=your_resend_api_key

# Frontend

FRONTEND_URL=http://localhost:3000

4. Remplacez <username>, <password>, <dbname>, your_jwt_secret, your_cloud_name, your_api_key, your_api_secret, et your_resend_api_key par vos propres valeurs.

## Utilisation

1. Endpoints

L'API sera accessible à l'adresse http://localhost:4000.

# Utilisateur

- POST /api/v1/user/register : Inscription d'un nouvel utilisateur
- POST /api/v1/user/login : Connexion d'un utilisateur
- GET /api/v1/user/profile : Récupérer le profil de l'utilisateur connecté
- PATCH /api/v1/user/profile : Mettre à jour le profil de l'utilisateur connecté
- POST /api/v1/user/profile/upload : Télécharger une image de profil pour l'utilisateur connecté

# Liens

- POST /api/v1/link/create : Créer un nouveau lien
- GET /api/v1/link/all : Récupérer tous les liens de l'utilisateur connecté
- PATCH /api/v1/link/update/:id : Mettre à jour un lien
- DELETE /api/v1/link/delete/:id : Supprimer un lien
- PATCH /api/v1/link/positions : Mettre à jour les positions des liens
- GET /api/v1/link/links/:username : Récupérer les liens d'un utilisateur par nom d'utilisateur
