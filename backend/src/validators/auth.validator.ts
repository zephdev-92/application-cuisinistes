import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

import { UserRole } from '../models/User';

// Validation pour l'inscription
export const validateRegister = [
  body('firstName')
    .notEmpty()
    .withMessage('Le prénom est requis')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),

  body('lastName')
    .notEmpty()
    .withMessage('Le nom est requis')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),

  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .trim()
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),

  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Le rôle doit être cuisiniste, prestataire ou admin'),

  body('phone')
    .optional()
    .trim()
    .matches(/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{9,10}\s*,?$/)
    .withMessage('Veuillez fournir un numéro de téléphone valide'),

  // Middleware pour vérifier les résultats de validation
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation pour la connexion
export const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .trim()
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),

  // Middleware pour vérifier les résultats de validation
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];
