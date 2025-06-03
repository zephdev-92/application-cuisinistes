# 🎯 ACTIONS À FAIRE - Configuration GitHub Secrets

## 📋 ÉTAPES SIMPLES À SUIVRE

### 1. **Aller sur GitHub** 🌐
- Ouvrez votre repository GitHub
- Cliquez sur **Settings** (onglet en haut)
- Dans le menu gauche : **Secrets and variables** → **Actions**

### 2. **Ajouter chaque secret** 🔐
Cliquez sur **"New repository secret"** pour chacun :

```
JWT_SECRET = dJl1OjuStFtVCP0DfAFdh9thmmCIN4gRu1UxjTZ2yEyKuARjKFOngYc9viBI1gqxWezcHOYw/0WlgoY7zrNmtQ==
JWT_EXPIRES_IN = 7d
BCRYPT_SALT_ROUNDS = 12
MONGO_ROOT_USER = admin
MONGO_ROOT_PASSWORD = JK3H8Yf4LiErpxoVv7yiNRKOaVEIMAEa
MONGO_APP_USER = app_user
MONGO_APP_PASSWORD = Q56JOWA6b6tKErKOmvlO6PvRzz0GKj7O
MONGO_DATABASE = cuisine-app
MONGODB_URI = mongodb://app_user:Q56JOWA6b6tKErKOmvlO6PvRzz0GKj7O@mongo:27017/cuisine-app?authSource=cuisine-app
REDIS_PASSWORD = U4n41F8khFZl5owPVsSJApOf18BMnXUt
MINIO_ACCESS_KEY = vcgzqhi6q4D2vsRkLZRS
MINIO_SECRET_KEY = OYpMRJkGOos9AX04X2y8JuLa0PZLyUkpm7F8zrLi
MINIO_BUCKET_NAME = cuisine-files
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
MAX_FILE_SIZE = 10485760
```

### 3. **Configurer Docker Hub** 🐳
1. Créez un compte sur https://hub.docker.com/
2. Account Settings → Security → **New Access Token**
3. Ajoutez dans GitHub :
   ```
   DOCKER_USERNAME = votre-username-dockerhub
   DOCKER_PASSWORD = dckr_pat_VOTRE_TOKEN_ICI
   ```

### 4. **Tester** 🧪
```bash
git add .
git commit -m "✨ Infrastructure DevOps complète configurée"
git push origin main
```

Puis allez dans l'onglet **Actions** sur GitHub pour voir les tests se lancer ! ✅

---

## 🎉 C'EST TOUT !

Une fois fait, vous aurez :
- ✅ Tests automatiques sur chaque commit
- ✅ CI/CD pipeline complet
- ✅ Docker builds automatiques
- ✅ Infrastructure prête pour la production

**Total des secrets à configurer : 17 secrets essentiels**

**Temps estimé : 10-15 minutes** ⏱️
