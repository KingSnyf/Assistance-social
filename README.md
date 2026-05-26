# Projet SocialCare

Application fullstack Django REST + Angular pour la gestion de demandes d'aide sociale.

## Structure du dépôt

- `backend/` : API Django REST Framework
- `frontend/` : application Angular 17 SPA

## Backend

### Installation

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration

Copier `.env.example` ou créer un fichier `.env` contenant au moins :

```text
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Lancer le serveur

```bash
python manage.py migrate
python manage.py runserver
```

### Endpoints clés

- `POST /api/auth/login/` : connexion JWT
- `POST /api/auth/refresh/` : rafraîchissement du token
- `GET|POST /api/beneficiaires/`
- `GET|POST /api/demandes/`
- `GET|POST /api/interventions/`
- `GET|POST /api/documents/`

## Frontend

### Installation

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
