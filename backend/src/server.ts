// server.ts
import dotenv from 'dotenv';

// Charger les variables d'environnement en premier
dotenv.config();

// IMPORTANT: Utilisez les chemins COMPLETS et CORRECTS pour importer les modèles
// Si vos modèles sont dans /app/src/models
import './models/User';
import './models/Showroom';
import './models/Client';


// Vérifiez que les modèles sont correctement enregistrés
import mongoose from 'mongoose';
console.log('Models registered at startup:', mongoose.modelNames());

// Maintenant importez la connexion à la base de données et l'application
import connectToDatabase from './db';
import app from './app';

const PORT = process.env.PORT || 4000;

// Attendre la connexion à la base de données avant de démarrer le serveur
connectToDatabase()
  .then(() => {
    // Une dernière vérification des modèles
    console.log('Models registered after DB connection:', mongoose.modelNames());

    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
