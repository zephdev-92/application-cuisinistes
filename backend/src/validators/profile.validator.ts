import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validation pour la mise à jour du profil
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{9,10}\s*,?$/)
    .withMessage('Veuillez fournir un numéro de téléphone valide'),

  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom de l\'entreprise doit contenir entre 2 et 100 caractères'),

  body('description')
    .optional()
    .trim(),

  body('specialties')
    .optional()  // Le rendre entièrement optionnel
    .custom((value, { req }) => {
      // Si c'est un cuisiniste, ignorer la validation
      if (req.user && req.user.role === 'cuisiniste') {
        return true;
      }
      // Sinon, vérifier que c'est un tableau
      return Array.isArray(value);
    })
    .withMessage('Les spécialités doivent être un tableau'),

  body('street').optional().trim(),
  body('city').optional().trim(),
  body('postalCode').optional().trim(),
  body('country').optional().trim(),

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

// Validation pour la mise à jour du mot de passe
export const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),

  body('newPassword')
    .notEmpty()
    .withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),

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
