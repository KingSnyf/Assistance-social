# SocialCare — Plateforme de Gestion d'Aide Sociale

Application fullstack **Django REST Framework + Angular 17** pour la gestion complète des demandes d'aide sociale, des bénéficiaires et des interventions.

**Projet pédagogique** — Saint Jean Ingénieur, Licence 2, 2025–2026  
**Responsable pédagogique** : M. KINKEU Daniel

---

## 📋 Vue d'ensemble

SocialCare permet de :
- ✅ Gérer les bénéficiaires (profil, situation familiale, revenus)
- ✅ Enregistrer les demandes d'aide (financière, alimentaire, médicale, logement, accompagnement)
- ✅ Assigner les demandes aux agents sociaux
- ✅ Suivre le statut des demandes en temps réel
- ✅ Enregistrer les interventions réalisées
- ✅ Gérer les documents justificatifs
- ✅ Accès multi-rôles sécurisé (Admin, Agent Social, Citoyen, Bénéficiaire)

---

## 🚀 Déploiement en production

### URLs en ligne

- **Backend (Render)** : https://socialcare-api.onrender.com
- **Frontend (Vercel)** : https://socialcare-app.vercel.app

### Identifiants de test

| Rôle | Identifiant | Mot de passe |
|------|-------------|-------------|
| Administrateur | `admin` | `AdminPass123!` |
| Agent Social | `agent001` | `AgentPass123!` |
| Citoyen | `citizen_user` | `CitizenPass123!` |

---

## 🛠️ Installation locale

### Prérequis

- Python 3.11+ et pip
- Node.js 18+ et npm
- Git

### Backend — Django REST Framework

```bash
# Clone et navigation
git clone https://github.com/YOUR_USERNAME/projet-django.git
cd projet-django/backend

# Environnement virtuel
python -m venv .venv
.\.venv\Scripts\activate  # Windows
# ou source .venv/bin/activate  # Linux/Mac

# Dépendances
pip install -r requirements.txt

# Configuration .env (développement)
echo "SECRET_KEY=dev-insecure-key-change-in-production" > .env
echo "DEBUG=True" >> .env
echo "ALLOWED_HOSTS=localhost,127.0.0.1" >> .env

# Migrations et serveur
python manage.py migrate
python manage.py runserver
```

**Le backend démarre sur** : http://localhost:8000

#### Tests avec Postman/Insomnia

1. **Login** : `POST /api/auth/login/`
   ```json
   {
     "username": "admin",
     "password": "AdminPass123!"
   }
   ```
   → Récupère `access` et `refresh` tokens

2. **Endpoints clés** (tous nécessitent `Authorization: Bearer <token>`):
   - `GET /api/beneficiaires/` — Lister les bénéficiaires
   - `POST /api/demandes/` — Créer une demande
   - `GET /api/demandes/` — Lister les demandes
   - `POST /api/demandes/{id}/approuver/` — Approuver une demande
   - `GET /api/agents/` — Lister les agents
   - `GET /admin/` — Interface d'administration Django

### Frontend — Angular 17

```bash
# Navigation
cd ../frontend

# Dépendances
npm install

# Démarrage (dev server)
npm start
```

**Le frontend démarre sur** : http://localhost:4200

#### Points clés

- **Authentification JWT** : Token stocké dans `localStorage`
- **Interceptor HTTP** : Ajoute automatiquement `Authorization: Bearer <token>` à chaque requête
- **AuthGuard** : Protège les routes `/dashboard`, `/demandes`, etc.
- **Erreurs 401** : Déclenche le refresh token automatique

---

## 📡 Architecture API

### Modèles de données

```
Beneficiaire
├── UUID (id)
├── Prenom, Nom, Email, Téléphone
├── Date de naissance, Nationalité
├── Pays de résidence, Situation familiale
├── Revenus mensuels
└── relation User (optionnel)

Demande
├── UUID (id)
├── Référence unique (ex: SC-0001)
├── FK Beneficiaire
├── Type d'aide (financière, alimentaire, médicale, logement, accompagnement)
├── Montant demandé (validation: 10-10000)
├── Motif, Urgence (faible/normal/urgent)
├── Statut (soumise/en_cours/approuvée/rejetée)
├── FK Agent (assigné), FK Owner (créateur)
├── Dates de soumission et traitement
└── Notes internes

Intervention
├── UUID (id)
├── FK Demande (OneToOne)
├── Type d'intervention
├── Montant accordé
├── Date de réalisation
├── Document justificatif (upload)
└── Dates de création

Document
├── UUID (id)
├── FK Demande
├── Type, Fichier (upload)
├── Vérifié (booléen)
├── Commentaires
└── Date d'upload
```

### Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/login/` | Obtenir tokens JWT | ✗ |
| POST | `/api/auth/refresh/` | Rafraîchir access token | ✗ |
| GET | `/api/beneficiaires/` | Lister les bénéficiaires | ✓ |
| POST | `/api/beneficiaires/` | Créer un bénéficiaire | ✓ |
| GET | `/api/demandes/` | Lister les demandes | ✓ |
| POST | `/api/demandes/` | Créer une demande | ✓ |
| POST | `/api/demandes/{id}/approuver/` | Approuver une demande | ✓ |
| POST | `/api/demandes/{id}/rejeter/` | Rejeter une demande | ✓ |
| GET | `/api/interventions/` | Lister les interventions | ✓ |
| POST | `/api/interventions/` | Créer une intervention | ✓ |
| GET | `/api/documents/` | Lister les documents | ✓ |
| POST | `/api/documents/` | Uploader un document | ✓ |
| GET | `/api/agents/` | Lister les agents | ✓ |

---

## 🔐 Sécurité & Configuration

### Variables d'environnement (Backend)

**Développement** (`.env`) :
```env
SECRET_KEY=your-dev-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

**Production** (Render) :
Configurer dans les **Environment Variables** du service Render :
```env
SECRET_KEY=<your-prod-secret-key>
DEBUG=False
ALLOWED_HOSTS=socialcare-api.onrender.com,www.socialcare-api.onrender.com
CORS_ALLOWED_ORIGINS=https://socialcare-app.vercel.app
```

### Authentification JWT

- **Access Token** : Valide 2 heures
- **Refresh Token** : Valide 7 jours
- **Rotation** : Automatique (le refresh retourne un nouveau pair)

### Contrôle d'accès (RBAC)

Les viewsets appliquent des filtres selon le rôle :
- **Admin** : Accès complet
- **Agent** : Voir les demandes assignées + les demandes soumises
- **Citoyen/Bénéficiaire** : Voir seulement ses propres données

---

## 🧪 Tests en local

### Backend

```bash
cd backend
pytest api/tests.py -v
```

### Frontend

```bash
cd frontend
npm test
```

---

## 📦 Stack technique

| Composant | Technologie |
|-----------|-------------|
| **Backend** | Django 5.0+, DRF 3.14+, Gunicorn |
| **DB Dev** | SQLite (development) |
| **DB Prod** | PostgreSQL (Render) |
| **Auth** | JWT (djangorestframework-simplejwt) |
| **CORS** | django-cors-headers |
| **Frontend** | Angular 17+, Standalone Components |
| **HTTP** | HttpClient + Interceptor |
| **Forms** | Reactive Forms |
| **Styling** | CSS3 + Bootstrap |
| **Déploiement Backend** | Render.com |
| **Déploiement Frontend** | Vercel.com |

---

## ✅ Checklist de qualité

- [x] API REST complète (CRUD pour toutes les entités)
- [x] Authentification JWT fonctionnelle
- [x] Contrôle d'accès par rôle (RBAC)
- [x] Validation des données (backend + frontend)
- [x] Gestion des erreurs HTTP (400, 401, 403, 404, 500)
- [x] Interface Admin Django personnalisée
- [x] Frontend SPA avec routing et guards
- [x] Interceptor HTTP pour les tokens
- [x] Indicateurs de chargement
- [x] Messages d'erreur/succès clairs
- [x] Code commenté et bien structuré
- [x] Git : historique de commits réguliers
- [x] README.md complet
- [x] Déploiement prod (Render + Vercel)

---

## 🎯 Contraintes pédagogiques respectées

✅ **Backend — Django REST Framework**
- ✓ API REST avec endpoints JSON uniquement
- ✓ Authentification JWT (simplejwt)
- ✓ CRUD complet sur toutes les entités
- ✓ Filtrage par propriétaire (get_queryset)
- ✓ Validation métier dans les sérialiseurs
- ✓ Interface Admin fonctionnelle
- ✓ CORS configuré
- ✓ requirements.txt à jour

✅ **Frontend — Angular 17+**
- ✓ SPA avec routing configuré
- ✓ JWT : stockage + Interceptor + AuthGuard
- ✓ Services dédiés par entité
- ✓ Reactive Forms avec validation côté client
- ✓ Indicateurs de chargement
- ✓ Design cohérent et soigné

✅ **Versioning — GitHub**
- ✓ Dépôt public avec backend + frontend
- ✓ README.md complet
- ✓ Historique de commits réguliers
- ✓ Pas de secrets committés (.env ignoré)

✅ **Déploiement en production**
- ✓ Backend sur Render
- ✓ Frontend sur Vercel
- ✓ Communication backend ↔ frontend
- ✓ Env vars configurées (pas de secrets en clair)

---

## 📞 Support & Contact

Toute question : consultez le code source ou contactez M. KINKEU Daniel.

---

## 📄 Licence

Projet pédagogique — Institut Universitaire Saint Jean (2025–2026)

```bash
cd frontend
npm install
```

### Lancer le frontend

```bash
npm start
```

### Production

- `frontend/src/environments/environment.ts` contient l'URL de l'API locale
- `frontend/src/environments/environment.prod.ts` contient l'URL du backend Render

## Compte de démonstration

- utilisateur : `admin`
- mot de passe : `admin123`

> Remarque : le compte de démonstration peut être recréé via le script `backend/create_test_users.py` si nécessaire.
