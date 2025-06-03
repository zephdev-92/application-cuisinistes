import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

import { globalErrorHandler, notFound } from '../../src/middleware/errorHandler';
// auditMiddleware n'existe pas, on le retire pour l'instant

// Routes existantes
import authRoutes from '../../src/routes/auth.routes';
import profileRoutes from '../../src/routes/profile.routes';
import clientRoutes from '../../src/routes/client.routes';
import adminRoutes from '../../src/routes/admin.routes';
import showroomRoutes from '../../src/routes/showroom.routes';

export function createTestApp() {
  const app = express();

  // Middleware de sécurité
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Route de santé
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Routes API
  app.use('/api/auth', authRoutes);
  app.use('/api/users', profileRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/showrooms', showroomRoutes);

  // Middleware pour les routes non trouvées
  app.all('*', notFound);

  // Middleware de gestion d'erreurs
  app.use(globalErrorHandler);

  return app;
}
