# frontend/Dockerfile
FROM node:18-alpine

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json package-lock.json* ./

# Installation des dépendances
RUN npm ci

# Copie du reste du code source
COPY . .

# Exposition du port utilisé par Next.js
EXPOSE 3000

# Commande de démarrage en mode développement
CMD ["npm", "run", "dev"]

# Pour la production, utilisez plutôt:
# RUN npm run build
# CMD ["npm", "start"]
