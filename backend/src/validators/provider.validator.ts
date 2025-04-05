// backend/src/validators/provider.validator.ts
import { Response, NextFunction } from 'express';
import Joi from 'joi';
import { AuthRequest } from '../types/express';
import { UserRole } from '../models/User';

// Schéma pour la création d'un prestataire
const createProviderSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'Le prénom est requis',
      'string.min': 'Le prénom doit contenir au moins {#limit} caractères',
      'string.max': 'Le prénom ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le prénom est requis'
    }),

  lastName: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'Le nom est requis',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le nom est requis'
    }),

  email: Joi.string()
    .required()
    .trim()
    .email()
    .messages({
      'string.empty': 'L\'email est requis',
      'string.email': 'Veuillez fournir un email valide',
      'any.required': 'L\'email est requis'
    }),

  password: Joi.string()
    .optional()
    .min(6)
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères'
    }),

  phone: Joi.string()
    .required()
    .trim()
    .pattern(/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{9,10}\s*,?$/)
    .messages({
      'string.empty': 'Le numéro de téléphone est requis',
      'string.pattern.base': 'Veuillez fournir un numéro de téléphone valide',
      'any.required': 'Le numéro de téléphone est requis'
    }),

  specialties: Joi.array()
    .items(Joi.string().trim())
    .default([])
    .messages({
      'array.base': 'Les spécialités doivent être un tableau'
    }),

  showrooms: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message('ID de showroom invalide')
    )
    .default([])
    .messages({
      'array.base': 'Les showrooms doivent être un tableau'
    }),

  role: Joi.string()
    .valid(UserRole.PRESTATAIRE)
    .default(UserRole.PRESTATAIRE)
    .messages({
      'any.only': 'Le rôle doit être prestataire'
    })
});

// Schéma pour la mise à jour d'un prestataire
const updateProviderSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Le prénom doit contenir au moins {#limit} caractères',
      'string.max': 'Le prénom ne doit pas dépasser {#limit} caractères'
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères'
    }),

  email: Joi.string()
    .trim()
    .email()
    .messages({
      'string.email': 'Veuillez fournir un email valide'
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{9,10}\s*,?$/)
    .messages({
      'string.pattern.base': 'Veuillez fournir un numéro de téléphone valide'
    }),

  specialties: Joi.array()
    .items(Joi.string().trim())
    .messages({
      'array.base': 'Les spécialités doivent être un tableau'
    }),

  showrooms: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message('ID de showroom invalide')
    )
    .messages({
      'array.base': 'Les showrooms doivent être un tableau'
    }),

  active: Joi.boolean()
    .messages({
      'boolean.base': 'Le statut actif doit être un booléen'
    })
});

// Middleware de validation pour la création d'un prestataire
export const validateProviderCreate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { error, value } = createProviderSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    // Formater les erreurs pour correspondre à la structure attendue
    const formattedErrors = error.details.map((err) => ({
      msg: err.message,
      param: err.path.join('.'),
      location: 'body'
    }));

    res.status(400).json({
      success: false,
      errors: formattedErrors
    });
    return;
  }

  // Mettre à jour les données validées et nettoyées
  req.body = value;
  next();
};

// Middleware de validation pour la mise à jour d'un prestataire
export const validateProviderUpdate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { error, value } = updateProviderSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    // Formater les erreurs pour correspondre à la structure attendue
    const formattedErrors = error.details.map((err) => ({
      msg: err.message,
      param: err.path.join('.'),
      location: 'body'
    }));

    res.status(400).json({
      success: false,
      errors: formattedErrors
    });
    return;
  }

  // Mettre à jour les données validées et nettoyées
  req.body = value;
  next();
};
