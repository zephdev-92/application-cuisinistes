# 🚀 Docker Hub - Démarrage Rapide

Guide express pour publier vos images Docker sur Docker Hub en 5 minutes.

## ⚡ Actions Rapides

### 1. Compte Docker Hub (2 min)
```bash
# 1. Aller sur hub.docker.com
# 2. Créer un compte gratuit
# 3. Noter votre nom d'utilisateur
```

### 2. Access Token (1 min)
```bash
# 1. Docker Hub → Account Settings → Security
# 2. New Access Token → "cuisine-app-ci"
# 3. Permissions: Read, Write, Delete
# 4. COPIER LE TOKEN (vous ne le reverrez plus !)
```

### 3. Secrets GitHub (1 min)
```bash
# Repository GitHub → Settings → Secrets → Actions
# Ajouter ces 2 secrets :

DOCKERHUB_USERNAME=votre-nom-utilisateur
DOCKERHUB_TOKEN=votre-token-copié
```

### 4. Connexion Docker (30s)
```bash
docker login
# Entrer vos identifiants Docker Hub
```

### 5. Premier Déploiement (30s)
```powershell
# Windows PowerShell
.\scripts\docker-hub-deploy.ps1 v1.0.0 votre-username

# Ou commande directe
docker build -f backend/Dockerfile.prod -t votre-username/cuisine-backend:latest backend/
docker push votre-username/cuisine-backend:latest
```

## ✅ Vérification
```bash
# Vos images sur Docker Hub :
https://hub.docker.com/r/votre-username/cuisine-backend
https://hub.docker.com/r/votre-username/cuisine-frontend

# Test local :
docker pull votre-username/cuisine-backend:latest
```

## 🔄 Déploiement Automatique
```bash
# Créer une release pour déclencher le CI/CD
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions publiera automatiquement !
```

## 🎯 Prochaines Étapes

1. **Mettre à jour docker-compose.prod.yml** avec vos images
2. **Configurer le déploiement production** avec vos images Docker Hub
3. **Surveiller** les builds dans GitHub Actions

## 📚 Documentation Complète
Voir `docs/DOCKER_HUB_SETUP.md` pour la configuration avancée.

---
**🎉 Félicitations ! Vos images Docker sont maintenant publiées sur Docker Hub !**
