# backend/Dockerfile
FROM node:18-alpine

# Création du répertoire de travail
WORKDIR /app

# Installation des dépendances globales
RUN npm install -g nodemon typescript ts-node

# Copie des fichiers de dépendances
COPY package.json package-lock.json* tsconfig.json ./

# Installation des dépendances avec npm ci pour plus de fiabilité
RUN npm ci

# Copie du reste du code source
COPY . .

# Exposition du port utilisé par l'application
EXPOSE 5000

# Commande de démarrage en mode développement
CMD ["npm", "run", "dev"]

# Pour la production, utilisez plutôt:
# RUN npm run build
# CMD ["npm", "start"]
