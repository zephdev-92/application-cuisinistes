import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { auditLogger } from '../src/utils/auditLogger';

// S'assurer que NODE_ENV est défini sur 'test'
process.env.NODE_ENV = 'test';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Démarrer MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connecter Mongoose
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  // Nettoyer la base de données après chaque test
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Nettoyer l'AuditLogger
  auditLogger.shutdown();

  // Fermer les connexions
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});
