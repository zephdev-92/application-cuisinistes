# 🎯 Configuration Finale - Secrets GitHub

## ⚠️ **IMPORTANT SÉCURITÉ**

**JAMAIS de vrais secrets dans ce fichier !**
Tous les exemples ci-dessous sont **fictifs** et doivent être **régénérés** pour votre usage.

## 🔐 Secrets à Générer

Utilisez ces commandes pour générer de vrais secrets :

### 1. 🔑 JWT SECRET (À GÉNÉRER)
```bash
# Générer un JWT secret fort
openssl rand -base64 64

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Variables à configurer dans GitHub Secrets :**
```
JWT_SECRET = [GÉNÉRER_AVEC_COMMANDE_CI_DESSUS]
JWT_EXPIRES_IN = 7d
BCRYPT_SALT_ROUNDS = 12
```

### 2. 🗄️ MongoDB (À GÉNÉRER)
```bash
# Générer des mots de passe MongoDB forts
openssl rand -base64 32  # Pour MONGO_ROOT_PASSWORD
openssl rand -base64 32  # Pour MONGO_APP_PASSWORD
```

**Variables à configurer :**
```
MONGO_ROOT_USER = admin
MONGO_ROOT_PASSWORD = [GÉNÉRER_MOT_DE_PASSE_32_CHARS]
MONGO_APP_USER = app_user
MONGO_APP_PASSWORD = [GÉNÉRER_MOT_DE_PASSE_32_CHARS]
MONGO_DATABASE = cuisine-app
MONGODB_URI = mongodb://app_user:[MOT_DE_PASSE_APP]@mongo:27017/cuisine-app?authSource=cuisine-app
```

### 3. 🗃️ Redis (À GÉNÉRER)
```bash
# Générer mot de passe Redis
openssl rand -base64 32
```

**Variable à configurer :**
```
REDIS_PASSWORD = [GÉNÉRER_MOT_DE_PASSE_32_CHARS]
```

### 4. 📁 MinIO (À GÉNÉRER)
```bash
# Générer clés MinIO
openssl rand -base64 15 | tr -d "=+/" | cut -c1-20  # ACCESS_KEY (20 chars)
openssl rand -base64 30 | tr -d "=+/" | cut -c1-40  # SECRET_KEY (40 chars)
```

**Variables à configurer :**
```
MINIO_ACCESS_KEY = [GÉNÉRER_CLEF_20_CHARS]
MINIO_SECRET_KEY = [GÉNÉRER_CLEF_40_CHARS]
MINIO_BUCKET_NAME = cuisine-files
```

### 5. 🛡️ Sécurité (CONFIGURÉS)
```
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
MAX_FILE_SIZE = 10485760
```

## 🐳 CONFIGURATION DOCKER HUB (OBLIGATOIRE)

### Étapes pour Docker Hub :
1. **Créer un compte** : https://hub.docker.com/
2. **Générer un token** : Account Settings > Security > New Access Token
3. **Ajouter dans GitHub** :
   ```
   DOCKER_USERNAME = votre-username-dockerhub
   DOCKER_PASSWORD = dckr_pat_VOTRE_TOKEN_RÉEL_ICI
   ```

## 🔧 Script de Génération Automatique

Créez un script pour générer tous les secrets automatiquement :

```bash
#!/bin/bash
# generate-secrets.sh

echo "🔐 Génération des secrets de production"
echo ""

echo "JWT_SECRET=$(openssl rand -base64 64)"
echo "MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)"
echo "MONGO_APP_PASSWORD=$(openssl rand -base64 32)"
echo "REDIS_PASSWORD=$(openssl rand -base64 32)"
echo "MINIO_ACCESS_KEY=$(openssl rand -base64 15 | tr -d '=+/' | cut -c1-20)"
echo "MINIO_SECRET_KEY=$(openssl rand -base64 30 | tr -d '=+/' | cut -c1-40)"

echo ""
echo "⚠️  COPIEZ ces secrets dans GitHub > Settings > Secrets and variables > Actions"
echo "⚠️  NE les commitez JAMAIS dans Git !"
```

## ✅ CHECKLIST FINALE

### GitHub Secrets à configurer :
- [ ] JWT_SECRET
- [ ] JWT_EXPIRES_IN
- [ ] BCRYPT_SALT_ROUNDS
- [ ] MONGO_ROOT_USER
- [ ] MONGO_ROOT_PASSWORD
- [ ] MONGO_APP_USER
- [ ] MONGO_APP_PASSWORD
- [ ] MONGO_DATABASE
- [ ] MONGODB_URI
- [ ] REDIS_PASSWORD
- [ ] MINIO_ACCESS_KEY
- [ ] MINIO_SECRET_KEY
- [ ] MINIO_BUCKET_NAME
- [ ] RATE_LIMIT_WINDOW_MS
- [ ] RATE_LIMIT_MAX_REQUESTS
- [ ] MAX_FILE_SIZE
- [ ] DOCKER_USERNAME
- [ ] DOCKER_PASSWORD

### Optionnels (pour production avancée) :
- [ ] EMAIL_HOST (smtp.gmail.com)
- [ ] EMAIL_PORT (587)
- [ ] EMAIL_USER (noreply@votre-domaine.com)
- [ ] EMAIL_PASS (mot de passe d'application)
- [ ] DEPLOY_HOST (votre-serveur.com)
- [ ] DEPLOY_USER (deployer)
- [ ] DOMAIN_NAME (votre-domaine.com)

## 🚨 PROCÉDURE D'URGENCE SÉCURITÉ

Si vous avez déjà pushé ce fichier avec de vrais secrets :

1. **Régénérer immédiatement** tous les secrets
2. **Changer les mots de passe** des services en production
3. **Vérifier les logs** pour des accès non autorisés
4. **Nettoyer l'historique Git** si nécessaire

## 🧪 TESTER LA CONFIGURATION

### 1. Générer les vrais secrets :
```bash
chmod +x scripts/generate-secrets.sh
./scripts/generate-secrets.sh
```

### 2. Configurer dans GitHub :
- Repository > Settings > Secrets and variables > Actions
- Ajouter chaque secret individuellement

### 3. Tester le déploiement :
```bash
git add .
git commit -m "fix(security): remove exposed secrets from configuration"
git push origin main
```

## 🎉 BRAVO !

Votre **infrastructure DevOps sécurisée** est maintenant prête !

**⚠️ RAPPEL** : Toujours vérifier qu'aucun secret n'est dans le code source !
