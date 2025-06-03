import { Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/ClientService';
import { catchAsync } from '../middleware/errorHandler';
import { AuthRequest } from '../types/express';
import { auditLogger, AuditEventType } from '../utils/auditLogger';
import { IClient } from '../models/Client';

// @desc    Créer un nouveau client
// @route   POST /api/clients
// @access  Private
export const createClient = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const clientData = {
    ...req.body,
    createdBy: req.user!.id
  };
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  try {
    const client = await ClientService.createClient(clientData);

    // Log d'audit de création de client
    auditLogger.logClientAction({
      eventType: AuditEventType.CLIENT_CREATE,
      userId: req.user!.id,
      clientId: (client._id as any).toString(),
      clientEmail: client.email,
      ip,
      success: true
    });

    res.status(201).json({
      success: true,
      data: client,
      message: 'Client créé avec succès'
    });
  } catch (error) {
    // Log d'audit d'échec de création
    auditLogger.logClientAction({
      eventType: AuditEventType.CLIENT_CREATE,
      userId: req.user!.id,
      clientEmail: req.body.email,
      ip,
      success: false
    });

    throw error;
  }
});

// @desc    Obtenir tous les clients
// @route   GET /api/clients
// @access  Private
export const getClients = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const filters = {
    createdBy: req.user!.id,
    search: req.query.search as string,
    city: req.query.city as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10
  };

  const result = await ClientService.getClients(filters);

  res.status(200).json({
    success: true,
    count: result.clients.length,
    pagination: result.pagination,
    data: result.clients
  });
});

// @desc    Obtenir un client par ID
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const client = await ClientService.getClientById(req.params.id, req.user!.id);
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Log d'audit de consultation de client
  auditLogger.logClientAction({
    eventType: AuditEventType.CLIENT_VIEW,
    userId: req.user!.id,
    clientId: (client._id as any).toString(),
    clientEmail: client.email,
    ip,
    success: true
  });

  res.status(200).json({
    success: true,
    data: client
  });
});

// @desc    Mettre à jour un client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  try {
    // Récupérer l'ancien client pour comparer les changements
    const oldClient = await ClientService.getClientById(req.params.id, req.user!.id);
    const client = await ClientService.updateClient(req.params.id, req.body, req.user!.id);

    // Identifier les changements
    const changes: Record<string, any> = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== (oldClient as any)[key]) {
        changes[key] = {
          from: (oldClient as any)[key],
          to: req.body[key]
        };
      }
    });

    // Log d'audit de mise à jour de client
    auditLogger.logClientAction({
      eventType: AuditEventType.CLIENT_UPDATE,
      userId: req.user!.id,
      clientId: (client._id as any).toString(),
      clientEmail: client.email,
      ip,
      changes,
      success: true
    });

    res.status(200).json({
      success: true,
      data: client,
      message: 'Client mis à jour avec succès'
    });
  } catch (error) {
    // Log d'audit d'échec de mise à jour
    auditLogger.logClientAction({
      eventType: AuditEventType.CLIENT_UPDATE,
      userId: req.user!.id,
      clientId: req.params.id,
      ip,
      success: false
    });

    throw error;
  }
});

// @desc    Supprimer un client
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  try {
    // Récupérer le client avant suppression pour les logs
    const client = await ClientService.getClientById(req.params.id, req.user!.id);
    await ClientService.deleteClient(req.params.id, req.user!.id);

    // Log d'audit de suppression de client
    auditLogger.logClientAction({
      eventType: AuditEventType.CLIENT_DELETE,
      userId: req.user!.id,
      clientId: req.params.id,
      clientEmail: client.email,
      ip,
      success: true
    });

    res.status(200).json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    // Log d'audit d'échec de suppression
    auditLogger.logClientAction({
      eventType: AuditEventType.CLIENT_DELETE,
      userId: req.user!.id,
      clientId: req.params.id,
      ip,
      success: false
    });

    throw error;
  }
});

// @desc    Rechercher des clients
// @route   GET /api/clients/search
// @access  Private
export const searchClients = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const searchTerm = req.query.q as string;
  const limit = parseInt(req.query.limit as string) || 10;

  const clients = await ClientService.searchClients(searchTerm, req.user!.id, limit);

  res.status(200).json({
    success: true,
    count: clients.length,
    data: clients
  });
});

// @desc    Obtenir les statistiques des clients
// @route   GET /api/clients/stats
// @access  Private
export const getClientStats = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const stats = await ClientService.getClientStats(req.user!.id);

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Obtenir les clients récents
// @route   GET /api/clients/recent
// @access  Private
export const getRecentClients = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 5;
  const clients = await ClientService.getRecentClients(req.user!.id, limit);

  res.status(200).json({
    success: true,
    count: clients.length,
    data: clients
  });
});

// @desc    Exporter les clients en CSV
// @route   GET /api/clients/export
// @access  Private
export const exportClients = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  try {
    const clientsData = await ClientService.exportClients(req.user!.id);

    // Log d'audit d'export de clients
    auditLogger.logClientAction({
      eventType: AuditEventType.CLIENT_EXPORT,
      userId: req.user!.id,
      ip,
      success: true,
      details: {
        exportedCount: clientsData.length,
        timestamp: new Date().toISOString()
      }
    });

    res.status(200).json({
      success: true,
      data: clientsData,
      message: 'Données des clients exportées avec succès'
    });
  } catch (error) {
    // Log d'audit d'échec d'export
    auditLogger.logClientAction({
      eventType: AuditEventType.CLIENT_EXPORT,
      userId: req.user!.id,
      ip,
      success: false
    });

    throw error;
  }
});
