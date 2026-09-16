# LocaFès — Application Web de Location de Voitures

Application web complète de réservation et de gestion de flotte automobile conçue pour une agence de location basée à Fès (Maroc). Le projet couvre l'ensemble du cycle de vie d'une location : de la consultation du catalogue en ligne jusqu'à l'encaissement, la génération automatique de facture PDF conforme et le suivi opérationnel via un tableau de bord administrateur.

---

## Contexte et Objectifs du Projet

Le marché de la location de voitures à Fès nécessite une solution rapide et fiable, particulièrement adaptée aux arrivées à l'Aéroport Fès-Saïss, aux transferts vers les Riads de la Médina et aux déplacements régionaux.

Ce projet a été développé pour répondre à plusieurs problématiques concrètes :
- **Éliminer les surréservations** : vérification algorithmique des disponibilités en temps réel sur la base des dates de début et de fin sélectionnées.
- **Accélérer la prise en charge** : formulaire de réservation fluide permettant de préciser le numéro de vol, l'heure d'arrivée et les options souhaitées (siège enfant, GPS, conducteur additionnel).
- **Offrir le choix du mode de règlement** : paiement en ligne sécurisé par carte bancaire via Stripe, ou règlement traditionnel en espèces lors de la remise des clés du véhicule.
- **Automatiser l'administratif** : génération instantanée d'un contrat/facture officiel en PDF prêt à l'emploi avec mentions légales marocaines complètes (RC, Patente, IF, ICE, TVA 20% et cachet agence numérique).
- **Centraliser l'exploitation** : espace d'administration dédié pour suivre les rentrées financières, ajuster le parc automobile, gérer les chauffeurs et valider les réservations.

---

## Fonctionnalités

### Espace Client & Visiteurs
- **Catalogue interactif** : consultation de la flotte avec recherche textuelle instantanée et filtres combinés (fourchette de prix, type de carburant, boîte manuelle/automatique, catégorie).
- **Fiche véhicule détaillée** : caractéristiques techniques (puissance, nombre de portes, climatisation, bagages), calcul du coût total en fonction de la durée choisie et tarifs journaliers transparents.
- **Tunnel de réservation sécurisé** :
  - Sélection précise des dates de prise en charge et de restitution.
  - Choix du point de livraison (Aéroport Fès-Saïss Terminal Arrivées, Gare Fès-Ville, agence Quartier Atlas ou livraison personnalisée en hôtel/riad).
  - Ajout d'options de confort (conducteur supplémentaire, siège bébé, GPS).
- **Paiement flexible** : intégration Stripe Elements pour le paiement par carte bancaire ou option de paiement comptant à la livraison.
- **Génération de facture PDF instantanée** :
  - Fichier PDF haute qualité généré côté navigateur (vectoriel, léger, sans appel serveur lourd).
  - Récapitulatif financier complet (Total TTC, sous-total HT, TVA 20% ventilée).
  - Différenciation claire entre statut "Facture acquittée (CB)" et "Règlement en espèces à la livraison".
- **Espace Profil Client** : consultation de l'historique des réservations passées et en cours, avec bouton de réimpression de facture disponible à tout moment.
- **Authentification polyvalente** : inscription et connexion sécurisées au choix par adresse email ou par numéro de téléphone.
- **Canal direct WhatsApp** : bouton flottant avec message pré-rempli ciblant le véhicule en cours de consultation pour un contact immédiat avec l'agence.

### Espace Administration (Dashboard)
- **Tableau de bord statistique** : suivi en temps réel du chiffre d'affaires cumulé, des réservations actives, du nombre de véhicules en circulation et du taux d'occupation.
- **Gestion du parc automobile (CRUD)** :
  - Ajout de nouveaux véhicules avec photo, catégorie, équipements et tarification journalière.
  - Saisie et validation des immatriculations au format officiel marocain (`12345 | A | 23`).
  - Modification rapide des tarifs et retrait/archivage des véhicules indisponibles.
- **Gestion des réservations** :
  - Visualisation des détails de chaque contrat : coordonnées complètes du client, dates, vol d'arrivée, montant encaissé ou à encaisser.
  - Mise à jour des statuts (confirmée, terminée, annulée).
- **Gestion des chauffeurs** : suivi des chauffeurs de l'agence pour l'attribution des transferts aéroport et livraisons à domicile.
- **Paramètres de l'agence** : mise à jour des coordonnées téléphoniques, adresse physique, email de contact et montant de la caution par défaut.

---

## Stack Technique

### Frontend
- **React 18** : architecture par composants fonctionnels et hooks personnalisés.
- **React Router v6** : routage avec lazy loading, protection des routes client et administrateur.
- **Tailwind CSS** : interface soignée, responsive (adaptée mobile, tablette et grand écran) avec palette personnalisée (tons marine et or prestige).
- **Framer Motion** : animations fluides lors de la navigation et transitions des modales.
- **jsPDF & jsPDF-AutoTable** : moteur de rendu de documents PDF vectoriels avec gestion des tableaux et mise en page millimétrée.
- **Stripe React** : intégration des formulaires de paiement sécurisés via Stripe Elements.
- **React Hot Toast** : retours visuels immédiats et discrets pour l'utilisateur.

### Backend
- **Node.js & Express** : API REST structurée selon le modèle MVC (Routes, Contrôleurs, Modèles, Middlewares).
- **MongoDB & Mongoose** : persistance des données avec schémas stricts, validations et indexation pour les requêtes fréquentes.
- **Mécanisme de fallback base locale** : tolérance de panne avec basculement automatique sur instance locale persistante si la connexion au cluster distant est momentanément inaccessible.
- **Authentification JWT & Bcryptjs** : signature des tokens d'authentification et hachage sécurisé des mots de passe.
- **Stripe SDK** : traitement des intentions de paiement et validation côté serveur.
- **Winston** : journalisation structurée des requêtes, erreurs et événements système.

---

## Structure du Projet

```text
location-voiture/
├── backend/
│   ├── config/             # Connexion base de données et données initiales
│   ├── controllers/        # Logique métier (auth, réservations, voitures, dashboard, chauffeurs)
│   ├── middlewares/        # Vérification JWT, validation des rôles et contrôle des entrées
│   ├── models/             # Schémas Mongoose (User, Car, Booking, Driver)
│   ├── routes/             # Définition des endpoints de l'API REST
│   ├── utils/              # Utilitaires (logger Winston, génération token, gestion d'erreurs)
│   ├── seed.js             # Script d'initialisation de la base (véhicules et compte admin)
│   └── server.js           # Point d'entrée du serveur Express
│
├── public/                 # Assets statiques, favicon et images des véhicules
├── src/
│   ├── components/         # Composants réutilisables (Navbar, Footer, CarCard, Topbar, Sidebar...)
│   ├── contexts/           # AuthContext (état global utilisateur et session)
│   ├── pages/              # Vues principales (Home, Cars, CarDetails, Booking, Login, Profile, Dashboard...)
│   │   └── admin/          # Onglets du tableau de bord (Overview, Bookings, Cars, Drivers, Users, Settings)
│   ├── services/           # Modules d'appels API Axios
│   ├── utils/              # Générateur de facture PDF (generatePDF.js), helpers et constantes
│   ├── App.js              # Configuration des routes de l'application
│   └── index.js            # Montage React
│
├── .env.example            # Modèle des variables d'environnement frontend
├── package.json            # Dépendances et scripts frontend
└── README.md               # Documentation du projet
```

---

## Installation et Démarrage Local

### 1. Prérequis
- **Node.js** (version 16 ou supérieure recommandée)
- **npm** ou **yarn**
- **Git**

### 2. Cloner le dépôt
```bash
git clone https://github.com/mohammedbouaouin-1/location-voiture.git
cd location-voiture
```

### 3. Configuration et lancement du Backend
Ouvrez un terminal dans le dossier `backend` :
```bash
cd backend
npm install
```

Créez votre fichier d'environnement `backend/.env` (vous pouvez vous baser sur `backend/.env.example`) :
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/locafes
JWT_SECRET=votre_cle_secrete_jwt_ici
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe_ici
CLIENT_URL=http://localhost:3000
```

Initialisez la base de données avec la flotte de démonstration et le compte administrateur :
```bash
npm run seed
```

Lancez le serveur backend :
```bash
npm run dev
# ou
node server.js
```
Le backend démarrera sur `http://localhost:5000`.

### 4. Configuration et lancement du Frontend
Dans un second terminal, placez-vous à la racine du projet :
```bash
cd location-voiture
npm install
```

Créez le fichier `.env` à la racine si nécessaire :
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique_stripe_ici
```

Démarrez le serveur de développement React :
```bash
npm start
```
L'application s'ouvrira automatiquement sur `http://localhost:3000`.

---

## Comptes de Démonstration

Pour tester directement les fonctionnalités sans avoir à créer de compte :

| Rôle | Identifiant (Email ou Tél) | Mot de passe | Accès |
|---|---|---|---|
| **Administrateur** | `admin@locafes.ma` | `AdminLocafes2024!` | Dashboard complet (`/dashboard`), gestion flotte, finances et chauffeurs |
| **Client** | À créer via l'onglet Inscription (`/login`) | Libre (min. 6 car.) | Réservation, paiement, consultation profil et factures |

---

## Mentions Légales & Immatriculations

- **Format des plaques d'immatriculation** : conforme au standard marocain en 3 blocs (ex: `12345 | A | 23`) avec prise en charge des matricules étrangères pour les véhicules de transit temporaire.
- **Données de facturation** : les factures PDF éditées intègrent la raison sociale, l'adresse du siège à Fès, ainsi que les identifiants fiscaux légaux (RC, Patente, IF, ICE) avec ventilation de la TVA à 20%.

---

## Auteur

**Mohammed Bouaouin**  
- GitHub : [@mohammedbouaouin-1](https://github.com/mohammedbouaouin-1)  
- LinkedIn : [Mohammed Bouaouin](https://www.linkedin.com/in/mohammed-bouaouin-8a9720360)
