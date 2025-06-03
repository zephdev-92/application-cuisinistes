import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Schéma pour la création d'un client
const createClientSchema = Joi.object({
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

  phone: Joi.string()
    .optional()
    .trim()
    .pattern(/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{9,10}\s*,?$/)
    .messages({
      'string.pattern.base': 'Veuillez fournir un numéro de téléphone valide'
    }),

  address: Joi.object({
    street: Joi.string().optional().trim().allow(''),
    city: Joi.string().optional().trim().allow(''),
    postalCode: Joi.string().optional().trim().allow(''),
    country: Joi.string().optional().trim().allow('')
  }).optional(),

  notes: Joi.string()
    .optional()
    .trim()
    .allow('')
});

// Schéma pour la mise à jour d'un client
const updateClientSchema = Joi.object({
  firstName: Joi.string()
    .optional()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Le prénom doit contenir au moins {#limit} caractères',
      'string.max': 'Le prénom ne doit pas dépasser {#limit} caractères'
    }),

  lastName: Joi.string()
    .optional()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères'
    }),

  email: Joi.string()
    .optional()
    .trim()
    .email()
    .messages({
      'string.email': 'Veuillez fournir un email valide'
    }),

  phone: Joi.string()
    .optional()
    .trim()
    .pattern(/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{9,10}\s*,?$/)
    .messages({
      'string.pattern.base': 'Veuillez fournir un numéro de téléphone valide'
    }),

  address: Joi.object({
    street: Joi.string().optional().trim().allow(''),
    city: Joi.string().optional().trim().allow(''),
    postalCode: Joi.string().optional().trim().allow(''),
    country: Joi.string().optional().trim().allow('')
  }).optional(),

  notes: Joi.string()
    .optional()
    .trim()
    .allow('')
});

// Middleware de validation pour la création d'un client
export const validateClientCreate = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = createClientSchema.validate(req.body, {
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

// Middleware de validation pour la mise à jour d'un client
export const validateClientUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = updateClientSchema.validate(req.body, {
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
