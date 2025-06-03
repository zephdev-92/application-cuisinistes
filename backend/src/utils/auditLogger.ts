import fs from 'fs';
import path from 'path';
import { createWriteStream, WriteStream } from 'fs';

// Types d'événements d'audit
export enum AuditEventType {
  // Authentification
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  REGISTER = 'REGISTER',

  // Gestion des utilisateurs
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_ACTIVATE = 'USER_ACTIVATE',
  USER_DEACTIVATE = 'USER_DEACTIVATE',

  // Gestion des clients
  CLIENT_CREATE = 'CLIENT_CREATE',
  CLIENT_UPDATE = 'CLIENT_UPDATE',
  CLIENT_DELETE = 'CLIENT_DELETE',
  CLIENT_VIEW = 'CLIENT_VIEW',
  CLIENT_EXPORT = 'CLIENT_EXPORT',

  // Gestion des fichiers
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  FILE_DELETE = 'FILE_DELETE',
  FILE_VALIDATION = 'FILE_VALIDATION',
  FILE_CLEANUP = 'FILE_CLEANUP',

  // Sécurité
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  FILE_SIGNATURE_MISMATCH = 'FILE_SIGNATURE_MISMATCH',
  INVALID_TOKEN = 'INVALID_TOKEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',

  // Système
  API_ERROR = 'API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  PERFORMANCE_WARNING = 'PERFORMANCE_WARNING',

  // Métier
  PROJECT_CREATE = 'PROJECT_CREATE',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  PROJECT_DELETE = 'PROJECT_DELETE',
  APPOINTMENT_CREATE = 'APPOINTMENT_CREATE',
  APPOINTMENT_UPDATE = 'APPOINTMENT_UPDATE',
  APPOINTMENT_DELETE = 'APPOINTMENT_DELETE'
}

// Niveaux de sévérité
export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Interface pour les événements d'audit
interface BaseAuditEvent {
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  severity: SeverityLevel;
  success: boolean;
  message: string;
  details?: Record<string, any>;
  sessionId?: string;
}

interface AuthAuditEvent extends BaseAuditEvent {
  eventType:
    | AuditEventType.LOGIN_SUCCESS
    | AuditEventType.LOGIN_FAILURE
    | AuditEventType.LOGOUT
    | AuditEventType.REGISTER
    | AuditEventType.TOKEN_REFRESH;
  email?: string;
  failureReason?: string;
}

interface UserAuditEvent extends BaseAuditEvent {
  eventType: AuditEventType.USER_CREATE | AuditEventType.USER_UPDATE | AuditEventType.USER_DELETE;
  targetUserId: string;
  changes?: Record<string, any>;
}

interface ClientAuditEvent extends BaseAuditEvent {
  eventType:
    | AuditEventType.CLIENT_CREATE
    | AuditEventType.CLIENT_UPDATE
    | AuditEventType.CLIENT_DELETE
    | AuditEventType.CLIENT_VIEW
    | AuditEventType.CLIENT_EXPORT;
  clientId?: string;
  clientEmail?: string;
  changes?: Record<string, any>;
}

interface FileAuditEvent extends BaseAuditEvent {
  eventType: AuditEventType.FILE_UPLOAD | AuditEventType.FILE_DOWNLOAD | AuditEventType.FILE_DELETE;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  category?: string;
}

interface SecurityAuditEvent extends BaseAuditEvent {
  eventType: AuditEventType.SECURITY_VIOLATION | AuditEventType.SUSPICIOUS_ACTIVITY;
  severity: SeverityLevel.HIGH | SeverityLevel.CRITICAL;
  threat: string;
  action: string;
}

type AuditEvent = BaseAuditEvent | AuthAuditEvent | UserAuditEvent | ClientAuditEvent | FileAuditEvent | SecurityAuditEvent;

// Configuration des logs
interface AuditLoggerConfig {
  logDirectory: string;
  maxFileSize: number; // en bytes
  maxFiles: number;
  compressOldFiles: boolean;
  enableConsoleOutput: boolean;
  enableFileOutput: boolean;
  enableDatabaseOutput: boolean;
}

class AuditLogger {
  private config: AuditLoggerConfig;
  private currentLogStream: WriteStream | null = null;
  private currentLogFile: string = '';
  private logRotationTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<AuditLoggerConfig>) {
    this.config = {
      logDirectory: path.join(__dirname, '../../logs/audit'),
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 30, // 30 fichiers
      compressOldFiles: false,
      enableConsoleOutput: process.env.NODE_ENV === 'development',
      enableFileOutput: true,
      enableDatabaseOutput: false,
      ...config
    };

    this.initializeLogger();
  }

  private initializeLogger(): void {
    // Créer le répertoire de logs s'il n'existe pas
    if (!fs.existsSync(this.config.logDirectory)) {
      fs.mkdirSync(this.config.logDirectory, { recursive: true });
    }

    this.rotateLogFile();

    // Rotation automatique chaque jour
    this.logRotationTimer = setInterval(() => {
      this.rotateLogFile();
    }, 24 * 60 * 60 * 1000); // 24 heures
  }

  private rotateLogFile(): void {
    const date = new Date();
    const dateString = date.toISOString().split('T')[0];
    const newLogFile = path.join(this.config.logDirectory, `audit-${dateString}.log`);

    if (this.currentLogFile !== newLogFile) {
      if (this.currentLogStream) {
        this.currentLogStream.end();
      }

      this.currentLogFile = newLogFile;
      this.currentLogStream = createWriteStream(newLogFile, { flags: 'a' });

      // Nettoyer les anciens fichiers
      this.cleanupOldLogs();
    }
  }

  private cleanupOldLogs(): void {
    try {
      const files = fs.readdirSync(this.config.logDirectory)
        .filter(file => file.startsWith('audit-') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.config.logDirectory, file),
          mtime: fs.statSync(path.join(this.config.logDirectory, file)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Supprimer les fichiers excédentaires
      if (files.length > this.config.maxFiles) {
        files.slice(this.config.maxFiles).forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des logs:', error);
    }
  }

  private formatLogEntry(event: AuditEvent): string {
    const logEntry = {
      timestamp: event.timestamp.toISOString(),
      level: 'AUDIT',
      eventType: event.eventType,
      severity: event.severity,
      success: event.success,
      userId: event.userId || 'anonymous',
      ip: event.ip || 'unknown',
      message: event.message,
      details: event.details || {},
      sessionId: event.sessionId
    };

    return JSON.stringify(logEntry) + '\n';
  }

  private writeLog(event: AuditEvent): void {
    const logEntry = this.formatLogEntry(event);

    // Sortie console
    if (this.config.enableConsoleOutput) {
      const color = this.getSeverityColor(event.severity);
      console.log(`${color}[AUDIT] ${event.eventType}: ${event.message}\x1b[0m`);
    }

    // Sortie fichier
    if (this.config.enableFileOutput && this.currentLogStream) {
      this.currentLogStream.write(logEntry);
    }

    // TODO: Sortie base de données (future implémentation)
    if (this.config.enableDatabaseOutput) {
      // Sauvegarder en base de données
    }
  }

  private getSeverityColor(severity: SeverityLevel): string {
    switch (severity) {
      case SeverityLevel.LOW: return '\x1b[32m'; // Vert
      case SeverityLevel.MEDIUM: return '\x1b[33m'; // Jaune
      case SeverityLevel.HIGH: return '\x1b[31m'; // Rouge
      case SeverityLevel.CRITICAL: return '\x1b[35m'; // Magenta
      default: return '\x1b[0m'; // Reset
    }
  }

  // Méthodes publiques pour logger différents types d'événements

  logAuth(data: {
    eventType:
      | AuditEventType.LOGIN_SUCCESS
      | AuditEventType.LOGIN_FAILURE
      | AuditEventType.LOGOUT
      | AuditEventType.REGISTER
      | AuditEventType.TOKEN_REFRESH;
    userId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    success: boolean;
    failureReason?: string;
    sessionId?: string;
  }): void {
    const event: AuthAuditEvent = {
      timestamp: new Date(),
      eventType: data.eventType,
      userId: data.userId,
      ip: data.ip,
      userAgent: data.userAgent,
      severity: data.success ? SeverityLevel.LOW : SeverityLevel.MEDIUM,
      success: data.success,
      message: `Authentication event: ${data.eventType}`,
      email: data.email,
      failureReason: data.failureReason,
      sessionId: data.sessionId
    };

    this.writeLog(event);
  }

  logUserAction(data: {
    eventType: AuditEventType.USER_CREATE | AuditEventType.USER_UPDATE | AuditEventType.USER_DELETE;
    userId: string;
    targetUserId: string;
    ip?: string;
    changes?: Record<string, any>;
    success: boolean;
  }): void {
    const event: UserAuditEvent = {
      timestamp: new Date(),
      eventType: data.eventType,
      userId: data.userId,
      ip: data.ip,
      severity: SeverityLevel.MEDIUM,
      success: data.success,
      message: `User action: ${data.eventType} on user ${data.targetUserId}`,
      targetUserId: data.targetUserId,
      changes: data.changes
    };

    this.writeLog(event);
  }

  logClientAction(data: {
    eventType:
      | AuditEventType.CLIENT_CREATE
      | AuditEventType.CLIENT_UPDATE
      | AuditEventType.CLIENT_DELETE
      | AuditEventType.CLIENT_VIEW
      | AuditEventType.CLIENT_EXPORT;
    userId: string;
    clientId?: string;
    clientEmail?: string;
    ip?: string;
    changes?: Record<string, any>;
    success: boolean;
    details?: Record<string, any>;
  }): void {
    const event: BaseAuditEvent = {
      timestamp: new Date(),
      eventType: data.eventType,
      userId: data.userId,
      ip: data.ip,
      severity: SeverityLevel.LOW,
      success: data.success,
      message: `Client action: ${data.eventType}`,
      details: {
        clientId: data.clientId,
        clientEmail: data.clientEmail,
        changes: data.changes,
        ...data.details
      }
    };

    this.writeLog(event);
  }

  logFileUpload(data: {
    userId: string;
    originalName: string;
    secureFileName: string;
    mimeType: string;
    category: string;
    ip?: string;
  }): void {
    const event: FileAuditEvent = {
      timestamp: new Date(),
      eventType: AuditEventType.FILE_UPLOAD,
      userId: data.userId,
      ip: data.ip,
      severity: SeverityLevel.LOW,
      success: true,
      message: `File uploaded: ${data.originalName}`,
      fileName: data.secureFileName,
      mimeType: data.mimeType,
      category: data.category,
      details: {
        originalName: data.originalName,
        secureFileName: data.secureFileName
      }
    };

    this.writeLog(event);
  }

  logFileValidation(data: {
    userId: string;
    fileName: string;
    mimeType: string;
    category: string;
    status: 'accepted' | 'rejected';
    error?: string;
    ip?: string;
  }): void {
    const event: BaseAuditEvent = {
      timestamp: new Date(),
      eventType: AuditEventType.FILE_VALIDATION,
      userId: data.userId,
      ip: data.ip,
      severity: data.status === 'rejected' ? SeverityLevel.MEDIUM : SeverityLevel.LOW,
      success: data.status === 'accepted',
      message: `File validation ${data.status}: ${data.fileName}`,
      details: {
        fileName: data.fileName,
        mimeType: data.mimeType,
        category: data.category,
        error: data.error
      }
    };

    this.writeLog(event);
  }

  logSecurityEvent(data: {
    userId?: string;
    event: string;
    details: Record<string, any>;
    ip?: string;
    severity: SeverityLevel.HIGH | SeverityLevel.CRITICAL;
  }): void {
    const event: BaseAuditEvent = {
      timestamp: new Date(),
      eventType: AuditEventType.SECURITY_VIOLATION,
      userId: data.userId,
      ip: data.ip,
      severity: data.severity,
      success: false,
      message: `Security event: ${data.event}`,
      details: {
        threat: data.event,
        action: 'BLOCKED',
        ...data.details
      }
    };

    this.writeLog(event);
  }

  logFileCleanup(data: {
    fileName: string;
    category: string;
    age: number;
    action: string;
  }): void {
    const event: BaseAuditEvent = {
      timestamp: new Date(),
      eventType: AuditEventType.FILE_CLEANUP,
      severity: SeverityLevel.LOW,
      success: true,
      message: `File cleanup: ${data.action} ${data.fileName}`,
      details: data
    };

    this.writeLog(event);
  }

  logApiError(data: {
    userId?: string;
    ip?: string;
    method: string;
    url: string;
    statusCode: number;
    error: string;
    duration?: number;
  }): void {
    const event: BaseAuditEvent = {
      timestamp: new Date(),
      eventType: AuditEventType.API_ERROR,
      userId: data.userId,
      ip: data.ip,
      severity: data.statusCode >= 500 ? SeverityLevel.HIGH : SeverityLevel.MEDIUM,
      success: false,
      message: `API Error: ${data.method} ${data.url} - ${data.statusCode}`,
      details: {
        method: data.method,
        url: data.url,
        statusCode: data.statusCode,
        error: data.error,
        duration: data.duration
      }
    };

    this.writeLog(event);
  }

  // Méthode pour rechercher dans les logs
  async searchLogs(criteria: {
    startDate?: Date;
    endDate?: Date;
    eventType?: AuditEventType;
    userId?: string;
    severity?: SeverityLevel;
    limit?: number;
  }): Promise<any[]> {
    // TODO: Implémenter la recherche dans les fichiers de logs
    // Pour une implémentation simple, on peut lire les fichiers de logs
    // Pour une version plus avancée, utiliser une base de données
    return [];
  }

  // Nettoyage et fermeture
  shutdown(): void {
    if (this.logRotationTimer) {
      clearInterval(this.logRotationTimer);
    }

    if (this.currentLogStream) {
      this.currentLogStream.end();
    }
  }
}

// Instance singleton
export const auditLogger = new AuditLogger();

// Nettoyage lors de l'arrêt de l'application
process.on('SIGINT', () => {
  auditLogger.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  auditLogger.shutdown();
  process.exit(0);
});

export default auditLogger;
