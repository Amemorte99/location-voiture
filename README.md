# LocaFès — Application Web de Location de Voitures

Application web complète de réservation et de gestion de flotte automobile développée pour une agence de location basée à Fès (Maroc). Le projet couvre l'ensemble du flux opérationnel : consultation du catalogue en ligne, réservation avec vérification des disponibilités, paiement par carte bancaire ou en espèces, génération instantanée de factures PDF conformes et tableau de bord administrateur pour piloter l'activité.

---

## Contexte et Problématiques Métier

À Fès, la location de véhicules s'adresse aussi bien aux résidents locaux qu'aux touristes et voyageurs d'affaires arrivant par l'Aéroport Fès-Saïss ou la gare ferroviaire.

Ce projet a été conçu pour répondre aux besoins concrets d'une agence locale :
- **Prévenir les doubles réservations** : contrôle algorithmique des dates sélectionnées afin d'empêcher qu'un même véhicule ne soit loué sur deux périodes qui se chevauchent.
- **Simplifier la logistique à l'arrivée** : collecte dès la réservation du lieu de prise en charge (Terminal Aéroport Fès-Saïss, Gare, Agence ou livraison directe en Riad/Hôtel), du numéro de vol éventuel et de l'heure d'arrivée.
- **Proposer deux modes de règlement adaptés** : paiement sécurisé en ligne par carte bancaire (via Stripe) ou paiement traditionnel en espèces le jour de la prise en charge du véhicule.
- **Automatiser la facturation** : édition immédiate côté navigateur d'une facture/contrat PDF aux normes marocaines (mentions fiscales complètes, ventilation HT/TVA 20%, cachet agence numérique).
- **Fournir un outil de gestion centralisé** : tableau de bord administrateur permettant de suivre le chiffre d'affaires, gérer les véhicules, assigner des chauffeurs et modifier les statuts des réservations.

---

## Fonctionnalités Détaillées

### 1. Espace Client & Navigation
- **Catalogue avec recherche et filtres combinés** :
  - Recherche en temps réel par mot-clé (nom ou marque du véhicule).
  - Filtre par budget avec curseur dynamique de prix (jusqu'à 2 000 DH/jour).
  - Filtres par type de carburant (Essence, Diesel, Électrique, Hybride) et boîte de vitesses (Manuelle, Automatique).
  - Tri par tarif (croissant / décroissant), année du modèle ou note client.
  - Badges de filtres actifs avec réinitialisation en un clic.
- **Fiche véhicule complète** :
  - Visuel haute définition du véhicule.
  - Caractéristiques techniques : motorisation, transmission, nombre de places, climatisation, capacité bagages.
  - Simulateur tarifaire instantané calculant le nombre de jours et le coût total en DH selon les dates choisies.
  - Section d'avis et notation clients (système 5 étoiles avec commentaires).
  - Bouton de contact WhatsApp direct avec message pré-rempli ciblant le modèle et son tarif.
- **Tunnel de réservation en 3 étapes** :
  - **Étape 1 — Dates & Logistique** : dates de début et de fin, lieu de remise (Aéroport Saïss, Gare Fès-Ville, Agence Atlas ou adresse personnalisée), numéro de vol et heure d'arrivée.
  - **Étape 2 — Conducteur & Options** : coordonnées du client et ajout d'options à 30 DH/jour (siège bébé, GPS, conducteur additionnel).
  - **Étape 3 — Paiement & Confirmation** : choix entre carte bancaire via formulaire sécurisé Stripe Elements ou paiement en espèces à la livraison.
- **Confirmation & Facturation PDF immédiate** :
  - Redirection automatique vers la page de succès après validation.
  - Téléchargement ou ouverture directe de la facture PDF officielle.
  - Ventilation comptable détaillée (Sous-total HT, TVA 20% incluse, Total TTC).
  - Libellé adapté selon le mode de paiement (*"Facture acquittée en totalité (CB)"* ou *"Règlement en espèces à la livraison"*).
- **Espace Profil Client** :
  - Consultation et mise à jour des informations personnelles (nom, email, téléphone, mot de passe).
  - Historique de toutes les réservations avec badge d'état (*Confirmée*, *En attente*, *Terminée*, *Annulée*).
  - Bouton de réimpression de facture disponible à tout moment pour chaque réservation.
- **Authentification Souple** :
  - Connexion possible avec **adresse email ou numéro de téléphone** + mot de passe.
  - Formulaire d'inscription ordonné (Nom & Prénom, Email, Téléphone, Mot de passe).
  - Jauge visuelle de robustesse du mot de passe.
- **Support & Contact** :
  - Bouton WhatsApp flottant présent sur toutes les pages.
  - Page Contact dédiée avec coordonnées fixes de l'agence (`05 35 62 10 20`), ligne WhatsApp directe (`+212 668 89 82 45`) et formulaire d'envoi de message.

### 2. Espace Administration (`/dashboard`)
L'accès au tableau de bord est protégé et réservé aux comptes administrateurs :
- **Vue d'ensemble (Overview)** :
  - 4 indicateurs clés : Chiffre d'affaires global (en DH), Réservations actives, Nombre total de voitures, Clients inscrits.
  - Graphique d'évolution des revenus mensuels généré avec Recharts.
  - Tableau des réservations récentes avec statut et actions directes.
- **Gestion des Réservations** :
  - Table complète avec recherche textuelle et filtrage par statut (*Toutes*, *En attente*, *Confirmée*, *Terminée*, *Annulée*).
  - Modal détaillée "Fiche Mission" affichant les informations du client, le vol, les dates et le montant à encaisser.
  - Assignation d'un chauffeur dédié pour chaque réservation.
  - Impression de la facture client directement depuis l'espace admin.
- **Gestion du Parc Automobile** :
  - Modal d'ajout de véhicule avec upload de photo, nom du modèle, marque, tarif journalier, année, carburant, boîte et description.
  - Modal de modification des informations existantes.
  - Bascule rapide de disponibilité (mise hors service temporaire sans supprimer la voiture).
  - Suppression douce (*soft delete*) pour conserver l'historique des anciennes réservations.
  - Export de la flotte complète au format CSV.
  - Double mode d'affichage : vue Tableau détaillé ou vue Grille visuelle.
- **Gestion des Chauffeurs** :
  - Suivi de l'équipe de chauffeurs privés de l'agence (nom, téléphone, WhatsApp, numéro de permis, zone d'intervention).
  - Statut en temps réel (*Disponible*, *En mission*, *En repos*).
  - Historique du nombre de missions accomplies par chauffeur.
  - Boutons d'appel rapide et d'ouverture WhatsApp en un clic.
- **Gestion des Utilisateurs** :
  - Liste de tous les comptes enregistrés avec date de création et rôle.
  - Possibilité de promouvoir un utilisateur en administrateur ou de révoquer un accès.
  - Suppression de compte.
- **Paramètres de l'Agence** :
  - Modification des informations générales (nom de l'agence, numéro de téléphone, email, adresse physique, ville).
  - Configuration du montant de la caution par défaut affiché aux clients.

---

## Facturation et Mentions Légales

Les factures PDF générées par l'application sont conformes aux usages commerciaux marocains :
- **Raison sociale** : LocaFès SARL, Boulevard Allal Ben Abdellah, Quartier Atlas, 30000 Fès.
- **Identifiants légaux** : Registre du Commerce (RC Fès N° 45892), Patente N° 12457890, Identifiant Fiscal (IF N° 33458912), Identifiant Commun de l'Entreprise (ICE N° 002345891000042).
- **Ventilation fiscale** : Prix HT, TVA 20% incluse, Packs d'assurance inclus (0 DH), Total TTC net en dirhams marocains (`DH`).
- **Génération locale pure** : le document est assemblé directement en mémoire côté client via `jsPDF`, garantissant rapidité, zéro fuite de données vers un tiers et affichage net sans bug de police.

---

## Stack Technique

| Domaine | Technologies utilisées | Rôle |
|---|---|---|
| **Frontend** | React 18, React Router v6 | Interface utilisateur dynamique et navigation SPA |
| **Styling** | Tailwind CSS | Design responsive, thème marine `#0F172A` et or `#C4A47C` |
| **Animations** | Framer Motion | Transitions de pages, modales et micro-interactions |
| **Documents PDF** | jsPDF, jsPDF-AutoTable | Génération vectorielle des factures et bons de réservation |
| **Paiements** | Stripe Elements (@stripe/react-stripe-js) | Formulaire de paiement par carte bancaire sécurisé |
| **Notifications** | React Hot Toast | Retours d'action instantanés (succès, erreurs, alertes) |
| **Graphiques** | Recharts | Courbes de revenus sur le tableau de bord |
| **Backend** | Node.js, Express | API REST (architecture MVC) |
| **Base de données** | MongoDB, Mongoose | Persistance des données (modèles User, Car, Booking, Driver) |
| **Sécurité** | JWT, bcryptjs, express-rate-limit, cors | Authentification par token, hash des mots de passe, limitation de débit |
| **Tolérance de panne** | Instance locale de secours | Démarrage automatique d'une base persistante si le cluster distant est injoignable |
| **Logs** | Winston | Journalisation horodatée des requêtes et des erreurs serveur |

---

## Structure du Code

```text
location-voiture/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Connexion MongoDB avec basculement automatique
│   │   └── seedData.js           # Flotte de 20 véhicules et données initiales
│   ├── controllers/
│   │   ├── authController.js     # Inscription, connexion (email ou tél), profil
│   │   ├── bookingController.js  # Création, calcul disponibilité, annulation, statuts
│   │   ├── carController.js      # CRUD véhicules et avis clients
│   │   ├── dashboardController.js# Statistiques et courbes de revenus
│   │   ├── driverController.js   # Gestion de l'équipe des chauffeurs et assignations
│   │   ├── stripeController.js   # Création des intentions de paiement Stripe
│   │   └── userController.js     # Gestion des comptes et rôles utilisateurs
│   ├── middlewares/
│   │   ├── authMiddleware.js     # Vérification JWT et restriction admin
│   │   ├── uploadMiddleware.js   # Gestion des uploads d'images multipart (Multer)
│   │   └── validationMiddleware.js # Règles de validation des données d'entrée
│   ├── models/
│   │   ├── Booking.js            # Schéma réservation (dates, véhicule, vol, chauffeur)
│   │   ├── Car.js                # Schéma véhicule (spécifications, prix, disponibilité)
│   │   ├── Driver.js             # Schéma chauffeur (zone, statut, permis, contact)
│   │   └── User.js               # Schéma utilisateur (nom, email, téléphone, rôle)
│   ├── routes/                   # Définition des endpoints REST (/api/*)
│   ├── services/                 # Services métier (tâches planifiées, notifications)
│   ├── utils/                    # Logger Winston, helpers asynchrones, gestionnaire d'erreurs
│   ├── seed.js                   # Script d'initialisation (flotte de base + compte admin)
│   └── server.js                 # Point d'entrée de l'application Express
│
├── public/
│   ├── images/                   # Photos des véhicules et bannières du site
│   └── index.html                # Page HTML racine
│
├── src/
│   ├── components/               # Navbar, Footer, CarCard, Sidebar, Topbar, WhatsApp...
│   ├── contexts/                 # AuthContext (gestion de la session utilisateur)
│   ├── pages/
│   │   ├── Home.jsx              # Page d'accueil (hero, recherche rapide, catalogue vedette)
│   │   ├── Cars.jsx              # Catalogue complet avec filtres multicritères
│   │   ├── CarDetails.jsx        # Fiche véhicule, avis et simulateur de dates
│   │   ├── Booking.jsx           # Tunnel de réservation en 3 étapes
│   │   ├── BookingSuccess.jsx    # Confirmation et téléchargement de facture
│   │   ├── Login.jsx             # Connexion (email/tél) et inscription
│   │   ├── Profile.jsx           # Espace client et historique des locations
│   │   ├── Contact.jsx           # Formulaire de contact et coordonnées agence
│   │   ├── WhyChooseUs.jsx       # Engagements de service et transparence
│   │   ├── Dashboard.jsx         # Tableau de bord administrateur
│   │   │   └── admin/            # Onglets : Overview, Bookings, Cars, Drivers, Users, Settings
│   │   └── NotFound.jsx          # Page 404 personnalisée
│   ├── services/                 # Appels API Axios (auth, bookings, cars, drivers)
│   ├── utils/
│   │   ├── generatePDF.js        # Moteur de génération de factures PDF
│   │   └── imageUrl.js           # Résolution dynamique des chemins d'images
│   ├── App.js                    # Définition des routes et protection des accès
│   └── index.js                  # Démarrage de l'application React
│
├── .env.example                  # Modèle des variables d'environnement frontend
├── package.json                  # Dépendances frontend
└── README.md                     # Documentation du projet
```

---

## Guide d'Installation et Lancement

### 1. Prérequis
- **Node.js** (version 16.x ou supérieure)
- **npm** (inclus avec Node.js)
- **Git**

### 2. Récupérer le projet
```bash
git clone https://github.com/mohammedbouaouin-1/location-voiture.git
cd location-voiture
```

### 3. Lancer le Backend
Dans un premier terminal :
```bash
cd backend
npm install
```

Créez le fichier de configuration `backend/.env` (vous pouvez copier `backend/.env.example`) :
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/locafes
JWT_SECRET=votre_cle_secrete_jwt
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
CLIENT_URL=http://localhost:3000
```
*(Remarque : Si aucune instance MongoDB distante n'est configurée, le serveur démarre automatiquement sur un stockage local autonome sans bloquer l'application).*

Pour charger la flotte automobile de départ et créer le compte administrateur :
```bash
npm run seed
```

Démarrez le serveur backend :
```bash
node server.js
```
Le serveur écoute sur `http://localhost:5000`.

### 4. Lancer le Frontend
Dans un second terminal, placez-vous à la racine du projet :
```bash
cd location-voiture
npm install
```

Créez le fichier `.env` à la racine :
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique_stripe
```

Lancez l'interface React :
```bash
npm start
```
L'application s'ouvre automatiquement dans votre navigateur sur `http://localhost:3000`.

---

## Comptes de Test

| Rôle | Identifiant (Email ou Téléphone) | Mot de passe | Permissions |
|---|---|---|---|
| **Administrateur** | `admin@locafes.ma` | `AdminLocafes2024!` | Accès complet au tableau de bord (`/dashboard`), gestion flotte, finances, chauffeurs et réservations |
| **Client** | Création libre via la page `/login` (onglet Créer un compte) | Au choix (min. 6 caractères) | Consultation, réservation en ligne, accès au profil et téléchargement des factures personnelles |

---

## Auteur

**Mohammed Bouaouin**  
- Profil GitHub : [@mohammedbouaouin-1](https://github.com/mohammedbouaouin-1)  
- Profil LinkedIn : [Mohammed Bouaouin](https://www.linkedin.com/in/mohammed-bouaouin-8a9720360)
