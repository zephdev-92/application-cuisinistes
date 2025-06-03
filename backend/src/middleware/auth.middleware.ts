import { Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { AuthRequest } from '../types/express';

// Middleware pour protéger les routes
export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Vérifier si le token est présent dans les en-têtes
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Vérifier si le token existe
  if (!token) {
    throw new AppError('Accès non autorisé. Authentification requise.', 401);
  }

  // Vérifier le token et récupérer l'utilisateur
  const user = await AuthService.getUserFromToken(token);

  // Ajouter l'utilisateur à la requête
  req.user = {
    id: user._id.toString(),
    _id: user._id,
    role: user.role
  };

  next();
});

// Middleware pour restreindre l'accès selon le rôle
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Accès non autorisé. Authentification requise.', 401);
    }

    // Vérifier si le rôle de l'utilisateur est autorisé
    if (!roles.includes(req.user.role as UserRole)) {
      throw new AppError('Accès interdit. Vous n\'avez pas les droits nécessaires.', 403);
    }

    next();
  };
};

// Middleware optionnel d'authentification (n'exige pas d'être connecté)
export const optionalAuth = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const user = await AuthService.getUserFromToken(token);
      req.user = {
        id: user._id.toString(),
        _id: user._id,
        role: user.role
      };
    } catch (error) {
      // Ignorer les erreurs d'authentification dans ce middleware optionnel
      // L'utilisateur ne sera simplement pas authentifié
    }
  }

  next();
});
