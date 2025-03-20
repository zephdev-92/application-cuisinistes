import { Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import config from '../config';
import { AuthRequest } from '../types/express';

interface JwtPayload {
  id: string;
}

// Middleware pour protéger les routes
// Dans middleware/auth.middleware.ts, ajoutez du logging pour déboguer
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  console.log('Headers reçus:', req.headers);

  // Vérifier si le token est présent dans les en-têtes
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extrait:', token ? token.substring(0, 15) + '...' : 'null');
  } else {
    console.log('Pas de header Authorization de type Bearer trouvé');
  }

  // Vérifier si le token existe
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Accès non autorisé. Authentification requise.'
    });
    return;
  }

  console.log('Token:', token);
  try {
    // Vérifier le token
    console.log('Secret utilisé pour la vérification:', config.jwtSecret.toString().substring(0, 3) + '...');

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    console.log('Token décodé avec succès, ID utilisateur:', decoded.id);

    // Récupérer l'utilisateur à partir du token
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('Utilisateur non trouvé avec ID:', decoded.id);
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user._id.toString(),
      role: user.role
    };

    console.log('Authentification réussie pour:', user.email);
    next();
  } catch (error) {
    console.error('Erreur de validation du token:', error);
    res.status(401).json({
      success: false,
      error: 'Accès non autorisé. Token invalide.',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
};



// Middleware pour restreindre l'accès selon le rôle
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Accès non autorisé. Authentification requise.'
      });
      return;
    }

    // Vérifier si le rôle de l'utilisateur est autorisé
    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: 'Accès interdit. Vous n\'avez pas les droits nécessaires.'
      });
      return;
    }

    next();
  };
};
