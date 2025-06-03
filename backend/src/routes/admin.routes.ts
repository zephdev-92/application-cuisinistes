import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { catchAsync } from '../middleware/errorHandler';
import { Request, Response } from 'express';
import { auditLogger, AuditEventType, SeverityLevel } from '../utils/auditLogger';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../types/express';

const router = express.Router();

// Protéger toutes les routes admin
router.use(protect);
router.use(authorize(UserRole.ADMIN));

// @desc    Obtenir les logs d'audit récents
// @route   GET /api/admin/audit-logs
// @access  Admin only
export const getAuditLogs = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    startDate,
    endDate,
    eventType,
    userId,
    severity,
    limit = 100,
    page = 1
  } = req.query;

  try {
    const logsDirectory = path.join(__dirname, '../../logs/audit');

    if (!fs.existsSync(logsDirectory)) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'Aucun log d\'audit trouvé'
      });
      return;
    }

    // Lire les fichiers de logs
    const logFiles = fs.readdirSync(logsDirectory)
      .filter(file => file.startsWith('audit-') && file.endsWith('.log'))
      .sort()
      .reverse(); // Plus récents en premier

    let allLogs: any[] = [];

    // Lire les logs des derniers jours selon les filtres
    const maxFiles = 7; // Lire maximum 7 jours de logs
    for (let i = 0; i < Math.min(logFiles.length, maxFiles); i++) {
      const filePath = path.join(logsDirectory, logFiles[i]);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      const logs = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(log => log !== null);

      allLogs = allLogs.concat(logs);
    }

    // Appliquer les filtres
    let filteredLogs = allLogs;

    if (startDate) {
      const start = new Date(startDate as string);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate as string);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }

    if (eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === eventType);
    }

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedLogs = filteredLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredLogs.length,
        pages: Math.ceil(filteredLogs.length / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la lecture des logs d\'audit'
    });
  }
});

// @desc    Obtenir les statistiques de sécurité
// @route   GET /api/admin/security-stats
// @access  Admin only
export const getSecurityStats = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logsDirectory = path.join(__dirname, '../../logs/audit');

    if (!fs.existsSync(logsDirectory)) {
      res.status(200).json({
        success: true,
        data: {
          totalEvents: 0,
          securityEvents: 0,
          failedLogins: 0,
          successfulLogins: 0,
          fileUploads: 0,
          criticalEvents: 0,
          last24h: {}
        }
      });
      return;
    }

    // Lire les logs du jour actuel
    const today = new Date().toISOString().split('T')[0];
    const todayLogFile = path.join(logsDirectory, `audit-${today}.log`);

    let todayLogs: any[] = [];
    if (fs.existsSync(todayLogFile)) {
      const content = fs.readFileSync(todayLogFile, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      todayLogs = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(log => log !== null);
    }

    // Calculer les statistiques
    const stats = {
      totalEvents: todayLogs.length,
      securityEvents: todayLogs.filter(log =>
        log.eventType.includes('SECURITY') ||
        log.eventType.includes('VIOLATION') ||
        log.eventType.includes('SUSPICIOUS')
      ).length,
      failedLogins: todayLogs.filter(log =>
        log.eventType === AuditEventType.LOGIN_FAILURE
      ).length,
      successfulLogins: todayLogs.filter(log =>
        log.eventType === AuditEventType.LOGIN_SUCCESS
      ).length,
      fileUploads: todayLogs.filter(log =>
        log.eventType === AuditEventType.FILE_UPLOAD
      ).length,
      criticalEvents: todayLogs.filter(log =>
        log.severity === SeverityLevel.CRITICAL || log.severity === SeverityLevel.HIGH
      ).length,
      last24h: {
        byHour: Array.from({ length: 24 }, (_, hour) => {
          const hourLogs = todayLogs.filter(log => {
            const logHour = new Date(log.timestamp).getHours();
            return logHour === hour;
          });
          return {
            hour,
            count: hourLogs.length,
            failed_logins: hourLogs.filter(log => log.eventType === AuditEventType.LOGIN_FAILURE).length,
            security_events: hourLogs.filter(log => log.eventType.includes('SECURITY')).length
          };
        })
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques de sécurité'
    });
  }
});

// @desc    Obtenir les événements de sécurité récents
// @route   GET /api/admin/security-events
// @access  Admin only
export const getSecurityEvents = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { limit = 50 } = req.query;

  try {
    const logsDirectory = path.join(__dirname, '../../logs/audit');

    if (!fs.existsSync(logsDirectory)) {
      res.status(200).json({
        success: true,
        data: []
      });
      return;
    }

    const logFiles = fs.readdirSync(logsDirectory)
      .filter(file => file.startsWith('audit-') && file.endsWith('.log'))
      .sort()
      .reverse()
      .slice(0, 3); // 3 derniers jours

    let securityEvents: any[] = [];

    for (const file of logFiles) {
      const filePath = path.join(logsDirectory, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      const logs = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(log => log !== null);

      // Filtrer les événements de sécurité
      const dailySecurityEvents = logs.filter(log =>
        log.eventType.includes('SECURITY') ||
        log.eventType.includes('VIOLATION') ||
        log.eventType.includes('SUSPICIOUS') ||
        log.eventType === AuditEventType.LOGIN_FAILURE ||
        log.severity === SeverityLevel.HIGH ||
        log.severity === SeverityLevel.CRITICAL
      );

      securityEvents = securityEvents.concat(dailySecurityEvents);
    }

    // Trier par timestamp décroissant et limiter
    securityEvents = securityEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, Number(limit));

    res.status(200).json({
      success: true,
      data: securityEvents,
      count: securityEvents.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements de sécurité'
    });
  }
});

// @desc    Nettoyer les anciens logs
// @route   DELETE /api/admin/cleanup-logs
// @access  Admin only
export const cleanupLogs = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
  const { olderThanDays = 30 } = req.body;

  try {
    const logsDirectory = path.join(__dirname, '../../logs/audit');

    if (!fs.existsSync(logsDirectory)) {
      res.status(200).json({
        success: true,
        message: 'Aucun répertoire de logs trouvé'
      });
      return;
    }

    const files = fs.readdirSync(logsDirectory)
      .filter(file => file.startsWith('audit-') && file.endsWith('.log'));

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(olderThanDays));

    let deletedCount = 0;

    files.forEach(file => {
      const filePath = path.join(logsDirectory, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });

    // Log de l'action de nettoyage
    auditLogger.logUserAction({
      eventType: AuditEventType.USER_DELETE, // Réutiliser pour le nettoyage
      userId: req.user!.id,
      targetUserId: 'system',
      ip: req.ip || 'unknown',
      changes: {
        action: 'CLEANUP_LOGS',
        olderThanDays: Number(olderThanDays),
        deletedFiles: deletedCount
      },
      success: true
    });

    res.status(200).json({
      success: true,
      message: `${deletedCount} fichiers de logs supprimés`,
      deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du nettoyage des logs'
    });
  }
});

// Routes
router.get('/audit-logs', getAuditLogs);
router.get('/security-stats', getSecurityStats);
router.get('/security-events', getSecurityEvents);
router.delete('/cleanup-logs', cleanupLogs);

export default router;
