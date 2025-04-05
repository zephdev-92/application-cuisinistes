import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import clientRoutes from './routes/client.routes';
import testRoutes from './routes/test.routes';
import providerRoutes from './routes/provider.routes';
// Création de l'application Express
const app = express();

// Middleware de sécurité
app.use(helmet());

// Middleware pour le CORS
app.use(cors({
  origin: 'http://localhost:3000', // URL de votre frontend
  credentials: true
}));
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur globale:', err.message, err.stack);

  // Envoyer une réponse d'erreur structurée
  res.status(500).json({
    success: false,
    error: 'Une erreur est survenue sur le serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
// Middleware pour parser le JSON
app.use(express.json());

// Gestion des erreurs globales
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Une erreur est survenue!');
});

// Assurez-vous que les routes sont montées avec le préfixe '/api'
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
// Servir les fichiers statiques depuis le dossier uploads
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

app.use('/api/clients', clientRoutes);
app.use('/api/test', testRoutes);
app.use('/api/providers', providerRoutes);
export default app;

