import app from './app';
import dotenv from 'dotenv';

// Charger les variables d'environnement en premier
dotenv.config();

import connectToDatabase from './db';

const PORT = process.env.PORT || 4000;

// Approche correcte : attendre la connexion à la base de données avant de démarrer le serveur
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
