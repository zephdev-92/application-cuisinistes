import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';

// Routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import clientRoutes from './routes/client.routes';
import testRoutes from './routes/test.routes';
import providerRoutes from './routes/provider.routes';

// Middleware d'erreurs
import { globalErrorHandler, notFound } from './middleware/errorHandler';

// Création de l'application Express
const app = express();

// Middleware de sécurité
app.use(helmet());

// Middleware pour le CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques depuis le dossier uploads
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Routes API avec le préfixe '/api'
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/test', testRoutes);
app.use('/api/providers', providerRoutes);

// Route de santé pour vérifier que l'API fonctionne
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware pour les routes non trouvées (doit être après toutes les routes)
app.all('*', notFound);

// Middleware global de gestion d'erreurs (doit être le dernier)
app.use(globalErrorHandler);

export default app;

