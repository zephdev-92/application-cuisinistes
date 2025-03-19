import express, { Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.middleware';
import config from '../config';
import { AuthRequest } from '../types/express';

const router = express.Router();

// Route publique pour tester si le serveur fonctionne
router.get('/public', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Route publique accessible sans authentification'
  });
});

// Route protégée pour tester l'authentification
router.get('/protected', protect, (req: AuthRequest, res) => {
  res.status(200).json({
    success: true,
    message: 'Vous êtes authentifié avec succès!',
    user: req.user
  });
});

// Route pour analyser le token
router.get('/decode-token', (async (req, res) => {
  let token;

  // Extraire le token du header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(400).json({
      success: false,
      message: 'Aucun token fourni dans l\'en-tête Authorization'
    });
    return;
  }

  try {
    // Tenter de décoder le token sans vérifier la signature
    const decoded = jwt.decode(token);

    // Tenter de vérifier le token
    try {
      const verified = jwt.verify(token, config.jwtSecret);
      res.status(200).json({
        success: true,
        message: 'Token valide',
        decoded,
        verified,
        secretUsed: config.jwtSecret.toString().substring(0, 3) + '...' // Ne pas exposer la clé entière
      });
    } catch (verifyError) {
      res.status(200).json({
        success: false,
        message: 'Token invalide lors de la vérification',
        decoded,
        error: verifyError instanceof jwt.JsonWebTokenError ? verifyError.message : 'Erreur de vérification du token',
        secretUsed: config.jwtSecret.toString().substring(0, 3) + '...'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Format de token invalide',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}) as RequestHandler);

export default router;
