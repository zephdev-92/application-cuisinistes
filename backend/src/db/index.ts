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
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectToDatabase;
