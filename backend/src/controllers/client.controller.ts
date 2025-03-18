import { Request, Response, NextFunction } from 'express';
import Client from '../models/Client';
import { AuthRequest } from '../types/express';

// @desc    Créer un nouveau client
// @route   POST /api/clients
// @access  Private
export const createClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    const clientData = {
      ...req.body,
      createdBy: req.user.id
    };

    const client = await Client.create(clientData);

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir tous les clients
// @route   GET /api/clients
// @access  Private
export const getClients = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filtres
    const filter = { createdBy: req.user.id };

    const clients = await Client.find(filter)
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: clients.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: clients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir un client par ID
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    const client = await Client.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!client) {
      res.status(404).json({
        success: false,
        error: 'Client non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour un client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      res.status(404).json({
        success: false,
        error: 'Client non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un client
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!client) {
      res.status(404).json({
        success: false,
        error: 'Client non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rechercher des clients
// @route   GET /api/clients/search
// @access  Private
export const searchClients = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Requête de recherche requise'
      });
      return;
    }

    // Recherche par nom/prénom/email qui commence par la requête
    const clients = await Client.find({
      createdBy: req.user.id,
      $or: [
        { firstName: new RegExp(`^${query}`, 'i') },
        { lastName: new RegExp(`^${query}`, 'i') },
        { email: new RegExp(`^${query}`, 'i') }
      ]
    })
    .limit(10)
    .sort({ lastName: 1, firstName: 1 });

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    next(error);
  }
};
