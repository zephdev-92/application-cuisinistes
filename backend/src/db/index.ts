import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectToDatabase = async () => {
  try {
    // Assurez-vous que la variable d'environnement est correcte
    const dbUrl = process.env.DATABASE_URL;

    // Vérifiez que dbUrl est une chaîne valide
    if (!dbUrl || typeof dbUrl !== 'string' || !dbUrl.startsWith('mongodb://')) {
      console.error('Invalid DATABASE_URL:', dbUrl);
      throw new Error('Invalid MongoDB connection string');
    }

    console.log("Connecting to MongoDB with URL:", dbUrl);
    await mongoose.connect(dbUrl);
    console.log('MongoDB connection successful');

    // Vérifier que les modèles sont déjà enregistrés
    const registeredModels = mongoose.modelNames();
    console.log('Models registered before DB connection:', registeredModels);

  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Propager l'erreur pour gestion dans server.ts
  }
};

export default connectToDatabase;
