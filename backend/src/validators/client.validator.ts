import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validation pour la création d'un client
export const validateClientCreate = [
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
    .withMessage("L'email est requis")
    .trim()
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{9,10}\s*,?$/)
    .withMessage('Veuillez fournir un numéro de téléphone valide'),

  body('address.street')
    .optional()
    .trim(),

  body('address.city')
    .optional()
    .trim(),

  body('address.postalCode')
    .optional()
    .trim(),

  body('address.country')
    .optional()
    .trim(),

  body('notes')
    .optional()
    .trim(),

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

// Validation pour la mise à jour d'un client
export const validateClientUpdate = [
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

  body('address.street')
    .optional()
    .trim(),

  body('address.city')
    .optional()
    .trim(),

  body('address.postalCode')
    .optional()
    .trim(),

  body('address.country')
    .optional()
    .trim(),

  body('notes')
    .optional()
    .trim(),

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
