# Guide de Déploiement — SocialCare

Ce guide explique comment déployer SocialCare sur Render (backend) et Vercel (frontend).

---

## 🚀 Architecture de déploiement

```
┌─────────────────────────────────────┐
│  Frontend (Vercel)                  │
│  https://socialcare-app.vercel.app  │
└────────────────┬────────────────────┘
                 │ HTTP/REST API calls
                 │
┌─────────────────v────────────────────┐
│  Backend (Render)                    │
│  https://socialcare-api.onrender.com │
│  + PostgreSQL Database               │
└──────────────────────────────────────┘
```

---

## 🔧 Backend — Render

### Étape 1 : Préparation du code

Assurer que le `.env` n'est **PAS** commité :
```bash
# Vérifier .gitignore
echo ".env" >> .gitignore
echo "*.sqlite3" >> .gitignore
echo ".venv" >> .gitignore
```

Créer un fichier `Procfile` pour Render :
```
web: gunicorn config.wsgi:application
release: python manage.py migrate
```

Ajouter `django-environ` (déjà dans requirements.txt).

### Étape 2 : Créer un service sur Render

1. Aller sur https://render.com
2. Cliquer sur **"New +"** → **"Web Service"**
3. Connecter le GitHub repo
4. Configurar :
   - **Name** : `socialcare-api`
   - **Branch** : `main`
   - **Environment** : `Python 3.11`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `gunicorn config.wsgi:application`
5. Scroll down → **"Environment"** → Ajouter les variables :

```env
SECRET_KEY=<generate-new-secret-key-here>
DEBUG=False
ALLOWED_HOSTS=socialcare-api.onrender.com,www.socialcare-api.onrender.com
CORS_ALLOWED_ORIGINS=https://socialcare-app.vercel.app
```

6. Créer le service → **Deploy** (attend ~5-10 min)

### Étape 3 : Ajouter une base de données PostgreSQL

Dans Render :
1. Aller dans le dashboard du service
2. **"Data"** → **"PostgreSQL"** → **"Create Database"**
3. Configuration par défaut est OK
4. Copier la **Database URL** externe
5. Ajouter la variable d'env au service :
   ```env
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ```
6. Modifier `settings.py` pour lire cette URL :
   ```python
   import dj_database_url
   DATABASES = {
       'default': dj_database_url.config(default='sqlite:///db.sqlite3')
   }
   ```
7. Redéployer
8. Vérifier les logs : `collectstatic`, migrations doivent passer

### Étape 4 : Vérifier le déploiement

```bash
# Tester l'API
curl https://socialcare-api.onrender.com/api/auth/login/ -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"AdminPass123!"}'

# Docs Swagger
https://socialcare-api.onrender.com/api/docs/swagger/

# Admin
https://socialcare-api.onrender.com/admin/
```

---

## 🌐 Frontend — Vercel

### Étape 1 : Configurer environment.prod.ts

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://socialcare-api.onrender.com/api'
};
```

### Étape 2 : Configurer angular.json

Vérifier que la config build inclut `environment.prod.ts` :
```json
{
  "projects": {
    "frontend": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/frontend"
          },
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

### Étape 3 : Créer un service sur Vercel

1. Aller sur https://vercel.com
2. Cliquer sur **"Add New..."** → **"Project"**
3. Importer le GitHub repo
4. Configurar :
   - **Framework** : Angular
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist/frontend`
5. Deploy → Attend ~2-5 min

### Étape 4 : Domaine custom (optionnel)

Dans Vercel :
1. Projet → **"Settings"** → **"Domains"**
2. Ajouter domaine personnalisé
3. Configurer DNS

### Étape 5 : Vérifier le déploiement

```bash
# Ouvrir le frontend
https://socialcare-app.vercel.app

# Vérifier la connexion au backend
# Login → vérifier que les requêtes vont vers l'URL Render
```

---

## 🔗 Linking Backend ↔ Frontend

1. **Frontend** doit pointer vers backend déployé :
   ```typescript
   // environment.prod.ts
   apiUrl: 'https://socialcare-api.onrender.com/api'
   ```

2. **Backend** doit autoriser le frontend en CORS :
   ```env
   CORS_ALLOWED_ORIGINS=https://socialcare-app.vercel.app
   ```

3. **Tester** : Login sur Vercel → vérifier les requêtes réseau (DevTools) → doivent aller vers Render

---

## 🐛 Troubleshooting

### Backend ne démarre pas (Render)
```bash
# Voir les logs
Render → Service → Logs

# Erreurs courantes :
# - SECRET_KEY manquant → Ajouter en env vars
# - DATABASE_URL mal formée → Vérifier format PostgreSQL
# - collectstatic échoue → Vérifier STATIC_ROOT dans settings.py
```

### Frontend appelle localhost (Vercel)
```bash
# Vérifier environment.prod.ts
# Vérifier que angular.json redirige bien vers environment.prod.ts

# Si problème persiste : hard refresh (Cmd+Shift+R ou Ctrl+Shift+R)
```

### CORS errors
```bash
# Backend logs
# Message : "Origin https://... not in CORS_ALLOWED_ORIGINS"
# → Ajouter l'origine exacte en env var CORS_ALLOWED_ORIGINS

# Render redéploie automatiquement après changement env vars
```

### Base de données vide
```bash
# Sur Render, après premier déploiement :
# Les migrations doivent tourner automatiquement
# Si non, créer un utilisateur admin :

# Depuis Render shell
python manage.py createsuperuser
# → username: admin, email: admin@test.com, password: AdminPass123!
```

---

## 📋 Checklist avant production

- [ ] `.env` sur `.gitignore` (JAMAIS commiter secrets)
- [ ] `SECRET_KEY` générée et unique pour prod
- [ ] `DEBUG=False` sur Render
- [ ] `ALLOWED_HOSTS` et `CORS_ALLOWED_ORIGINS` configurés
- [ ] Base de données PostgreSQL configurée
- [ ] `collectstatic` et migrations automatiques configurées
- [ ] Admin Django accessible et personnel créé
- [ ] Frontend pointe vers bon `apiUrl` de production
- [ ] Login/logout fonctionne en prod
- [ ] Tests en prod avec données réelles
- [ ] Backups DB configurées (Render)

---

## 🔄 Continuous Deployment

- **Render** : Auto-déploie quand tu push sur `main`
- **Vercel** : Auto-déploie quand tu push sur `main`
- Les logs sont disponibles dans les dashboards respectifs

---

## 🚨 Emergency Recovery

Si quelque chose casse en prod :

1. **Backend** :
   - Render → Logs → voir l'erreur
   - Fixer localement, push sur `main`
   - Render redéploie automatiquement

2. **Frontend** :
   - Vercel → Deployments → revert to previous
   - Ou fixer localement, push sur `main`

---

**Bon déploiement ! 🚀**
