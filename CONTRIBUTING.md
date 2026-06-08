# Guide de Contribution — SocialCare

Merci de contribuer au projet SocialCare ! Ce guide explique les bonnes pratiques et la structure du projet.

---

## 📋 Prérequis

- Python 3.11+, pip, git
- Node.js 18+, npm
- Understanding of Django, DRF, Angular 17+

---

## 🚀 Démarrage rapide

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 📐 Architecture

### Backend Structure
```
backend/
├── config/             # Paramètres Django + routing
├── api/
│   ├── models.py       # Modèles de données
│   ├── serializers.py  # Sérialiseurs DRF + validation
│   ├── views.py        # ViewSets + logique métier
│   ├── urls.py         # Routage API
│   ├── admin.py        # Interface d'administration
│   └── tests.py        # Tests unitaires
├── manage.py
└── requirements.txt    # Dépendances Python
```

### Frontend Structure
```
frontend/src/app/
├── core/
│   ├── guards/         # AuthGuard
│   ├── interceptors/   # HTTP Interceptor JWT
│   └── services/       # Services API (Auth, Demande, etc.)
├── features/           # Pages/composants métier
├── shared/             # Composants réutilisables
├── app.routes.ts       # Routing Angular
└── app.config.ts       # Configuration de l'app
```

---

## 🧪 Conventions de code

### Backend — Django

1. **Modèles** : Classes `Model` avec docstrings
   ```python
   class Beneficiaire(models.Model):
       """Personne bénéficiant de l'aide sociale"""
       id = models.UUIDField(primary_key=True, default=uuid.uuid4)
       # ...
   ```

2. **Sérialiseurs** : Validation métier stricte
   ```python
   def validate_montant_demande(self, value):
       if value < 10 or value > 10000:
           raise serializers.ValidationError("Montant invalide")
       return value
   ```

3. **ViewSets** : Filtrage par propriétaire (RBAC)
   ```python
   def get_queryset(self):
       if self.request.user.is_staff:
           return Demande.objects.all()
       return Demande.objects.filter(owner=self.request.user)
   ```

4. **Tests** : Couverture > 80%
   ```python
   def test_login_success(self):
       response = self.client.post('/api/auth/login/', {
           'username': 'test', 'password': 'pass'
       })
       self.assertEqual(response.status_code, 200)
   ```

### Frontend — Angular

1. **Services** : Chaque entité a un service
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class DemandeService {
     constructor(private http: HttpClient) {}
     // Méthodes CRUD + actions métier
   }
   ```

2. **Composants** : Standalone, reactive forms
   ```typescript
   @Component({
     standalone: true,
     imports: [CommonModule, ReactiveFormsModule],
   })
   export class CreateDemandeComponent {
     form = this.fb.group({
       beneficiaire: ['', Validators.required],
     });
   }
   ```

3. **Guards** : Authentification strict
   ```typescript
   canActivate: [authGuard]  // Sur toutes les routes privées
   ```

---

## ✅ Checklist avant commit

- [ ] Code testé localement (backend + frontend)
- [ ] Pas de `console.log()` en production
- [ ] Pas de code commenté inutile
- [ ] Aucun secret (.env, tokens, passwords) committés
- [ ] `.env` et `db.sqlite3` dans `.gitignore`
- [ ] Commit message descriptif (en anglais ou français)
- [ ] Tests passent : `pytest` (backend) ou `npm test` (frontend)

---

## 🔄 Workflow Git

1. **Feature branch** : `git checkout -b feature/nom-de-la-feature`
2. **Commits réguliers** : `git commit -m "feat: description courte"`
3. **Push & Pull Request** : `git push origin feature/...`
4. **Merge** : Après review

### Commit Message Format
```
feat: Ajouter JWT refresh automatique
fix: Corriger validation du montant
docs: Mettre à jour README
test: Ajouter tests pour DemandeViewSet
style: Formater le code avec prettier
```

---

## 🧹 Nettoyage de code

### Backend
```bash
# Format avec black
pip install black
black backend/

# Lint avec flake8
pip install flake8
flake8 backend/ --max-line-length=100
```

### Frontend
```bash
# Format avec prettier
npm install -g prettier
prettier --write "src/**/*.ts"

# Lint avec ESLint
npm run lint
```

---

## 🐛 Debugging

### Backend
```bash
# Django shell
python manage.py shell
>>> from api.models import Demande
>>> Demande.objects.all()

# Pdb
import pdb; pdb.set_trace()
```

### Frontend
```bash
# Chrome DevTools (F12)
# Breakpoints, Network tab, etc.

# Angular CLI
ng serve --poll=2000  # Hot reload en WSL
```

---

## 📦 Release

1. Mettre à jour `version` dans `package.json` et `pyproject.toml`
2. Créer un tag : `git tag v1.0.0`
3. Push : `git push origin v1.0.0`
4. Déployer sur Render + Vercel

---

## 📞 Aide & Questions

Consultez :
- **Backend** : Django docs, DRF docs
- **Frontend** : Angular docs, RxJS docs
- **Deployment** : Render docs, Vercel docs

---

**Merci d'améliorer SocialCare ! 🎉**
