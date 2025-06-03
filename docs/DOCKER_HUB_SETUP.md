# 📦 Configuration Docker Hub - Guide Complet

Ce guide vous aide à configurer Docker Hub pour publier et déployer vos images Docker de l'application Cuisine.

## 🎯 Objectifs

- Publier automatiquement les images Docker sur Docker Hub
- Configurer CI/CD pour déploiement automatique
- Sécuriser la distribution des images
- Faciliter le déploiement en production

## 📋 Prérequis

- [x] Compte Docker Hub (gratuit)
- [x] Docker installé localement
- [x] Accès au repository GitHub
- [x] Images Docker fonctionnelles

## 🔧 Étapes de Configuration

### 1. Créer un Compte Docker Hub

1. Allez sur [hub.docker.com](https://hub.docker.com)
2. Cliquez sur "Sign Up" pour créer un compte gratuit
3. Vérifiez votre email
4. Notez votre nom d'utilisateur Docker Hub

### 2. Créer un Access Token

Pour sécuriser les connexions automatisées :

1. Connectez-vous sur Docker Hub
2. Allez dans **Account Settings** → **Security**
3. Cliquez sur **New Access Token**
4. Nommez le token : `cuisine-app-ci`
5. Sélectionnez les permissions : **Read, Write, Delete**
6. **Copiez et sauvegardez le token** (vous ne pourrez plus le voir)

### 3. Configurer les Secrets GitHub

Ajoutez ces secrets dans votre repository GitHub :

1. Allez dans **Settings** → **Secrets and variables** → **Actions**
2. Cliquez sur **New repository secret**
3. Ajoutez :

```bash
DOCKERHUB_USERNAME=votre-nom-utilisateur-dockerhub
DOCKERHUB_TOKEN=votre-access-token-dockerhub
```

### 4. Connexion Docker Locale

```bash
# Se connecter à Docker Hub
docker login

# Ou avec nom d'utilisateur spécifique
docker login -u votre-nom-utilisateur
```

## 🚀 Déploiement Manuel

### Option 1: Script PowerShell (Windows)

```powershell
# Déploiement avec tag spécifique
.\scripts\docker-hub-deploy.ps1 v1.0.0 votre-username

# Déploiement avec tag latest
.\scripts\docker-hub-deploy.ps1

# Avec votre nom d'utilisateur
.\scripts\docker-hub-deploy.ps1 latest votre-username
```

### Option 2: Commandes Docker Directes

```bash
# Backend
cd backend
docker build -f Dockerfile.prod -t votre-username/cuisine-backend:latest .
docker push votre-username/cuisine-backend:latest

# Frontend
cd ../frontend2
docker build -f Dockerfile.prod -t votre-username/cuisine-frontend:latest .
docker push votre-username/cuisine-frontend:latest
```

## 🔄 Déploiement Automatique (CI/CD)

Le workflow `.github/workflows/docker-hub.yml` se déclenche automatiquement :

### Déclencheurs

- **Push sur main/master** → Build et push avec tag `latest`
- **Tags version** (ex: `v1.0.0`) → Build et push avec version
- **Pull Requests** → Build seulement (test)

### Fonctionnalités

- ✅ Build multi-architecture (AMD64 + ARM64)
- ✅ Cache Docker pour accélérer les builds
- ✅ Scan de sécurité avec Trivy
- ✅ Tests automatiques des images
- ✅ Notifications de status

### Créer une Release

```bash
# Créer un tag version
git tag v1.0.0
git push origin v1.0.0

# Le CI/CD publiera automatiquement :
# - votre-username/cuisine-backend:v1.0.0
# - votre-username/cuisine-backend:1.0
# - votre-username/cuisine-backend:1
# - votre-username/cuisine-frontend:v1.0.0
# - votre-username/cuisine-frontend:1.0
# - votre-username/cuisine-frontend:1
```

## 📊 Vérification des Images

### Sur Docker Hub

1. Allez sur `https://hub.docker.com/r/votre-username/cuisine-backend`
2. Vérifiez les tags disponibles
3. Consultez les statistiques de téléchargement

### Localement

```bash
# Tester le téléchargement
docker pull votre-username/cuisine-backend:latest
docker pull votre-username/cuisine-frontend:latest

# Tester le fonctionnement
docker run --rm votre-username/cuisine-backend:latest node --version
```

## 🔒 Sécurité

### Access Token

- ✅ Utilisez des Access Tokens plutôt que votre mot de passe
- ✅ Limitez les permissions (Read/Write seulement)
- ✅ Renouvelez régulièrement
- ✅ Révocquez les tokens inutilisés

### Images

- ✅ Scans de vulnérabilité automatiques
- ✅ Images basées sur Alpine (plus sécurisées)
- ✅ Utilisateurs non-root dans les conteneurs
- ✅ Pas de secrets dans les images

## 🚀 Utilisation en Production

### Mettre à jour docker-compose.prod.yml

```yaml
services:
  backend:
    image: votre-username/cuisine-backend:latest
    # ... reste de la configuration

  frontend:
    image: votre-username/cuisine-frontend:latest
    # ... reste de la configuration
```

### Déploiement

```bash
# Télécharger et démarrer
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Monitoring

### Métriques Docker Hub

- Nombre de téléchargements
- Taille des images
- Historique des versions

### GitHub Actions

- Statut des builds
- Durée des déploiements
- Rapports de sécurité

## 🛠️ Dépannage

### Problèmes Courants

#### Erreur d'authentification

```bash
# Vérifier la connexion
docker info | grep Username

# Se reconnecter
docker logout
docker login
```

#### Build échoue

```bash
# Vérifier les Dockerfiles
ls -la backend/Dockerfile.prod
ls -la frontend2/Dockerfile.prod

# Build local pour debug
docker build -f backend/Dockerfile.prod backend/
```

#### Images trop volumineuses

```bash
# Analyser la taille
docker images | grep cuisine

# Optimiser le Dockerfile
# - Utiliser .dockerignore
# - Multi-stage builds
# - Alpine Linux
```

### Logs et Debug

```bash
# Logs GitHub Actions
# Voir dans l'onglet Actions de votre repository

# Logs Docker Hub
# Voir dans Build Details sur Docker Hub

# Test local
docker run --rm -it votre-username/cuisine-backend:latest sh
```

## 📚 Ressources

- [Documentation Docker Hub](https://docs.docker.com/docker-hub/)
- [GitHub Actions Docker](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

## ✅ Checklist Final

- [ ] Compte Docker Hub créé
- [ ] Access Token généré
- [ ] Secrets GitHub configurés
- [ ] Script local testé
- [ ] CI/CD fonctionnel
- [ ] Images publiées
- [ ] docker-compose.prod.yml mis à jour
- [ ] Déploiement production testé

## 🆘 Support

En cas de problème :

1. Vérifiez les logs GitHub Actions
2. Testez les scripts localement
3. Vérifiez les secrets GitHub
4. Consultez la documentation Docker Hub

Votre infrastructure Docker Hub est maintenant prête ! 🎉
