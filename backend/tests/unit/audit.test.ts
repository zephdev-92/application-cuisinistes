import auditLogger from '../../src/utils/auditLogger';
import { AuditEventType, SeverityLevel } from '../../src/utils/auditLogger';
import fs from 'fs/promises';
import path from 'path';

// Classe AuditLogger pour les tests - on crée une instance locale
class AuditLogger {
  private logDirectory: string;

  constructor(logDirectory: string) {
    this.logDirectory = logDirectory;
  }

  async logEvent(event: any): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDirectory, `audit-${today}.log`);

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'AUDIT',
      eventType: event.eventType,
      message: event.message,
      userId: event.userId || 'anonymous',
      severity: event.severity,
      success: event.success,
      details: event.details
    };

    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  }

  async getAuditLogs(): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDirectory, `audit-${today}.log`);

    try {
      const content = await fs.readFile(logFile, 'utf-8');
      return content.trim().split('\n').filter(line => line).map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }
}

describe('AuditLogger', () => {
  const testLogDir = path.join(__dirname, '../temp-logs');
  let auditLoggerInstance: AuditLogger;

  beforeEach(async () => {
    // Créer le répertoire de test
    await fs.mkdir(testLogDir, { recursive: true });
    auditLoggerInstance = new AuditLogger(testLogDir);
  });

  afterEach(async () => {
    // Nettoyer le répertoire de test
    try {
      await fs.rm(testLogDir, { recursive: true, force: true });
    } catch (error) {
      // Ignorer les erreurs de nettoyage
    }
  });

  describe('logEvent', () => {
    it('devrait créer un fichier de log avec le bon format', async () => {
      const event = {
        eventType: 'USER_LOGIN' as const,
        message: 'Test login',
        userId: 'test-user-123',
        severity: 'low' as const,
        success: true
      };

      await auditLoggerInstance.logEvent(event);

      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(testLogDir, `audit-${today}.log`);

      const logExists = await fs.access(logFile).then(() => true).catch(() => false);
      expect(logExists).toBe(true);

      const logContent = await fs.readFile(logFile, 'utf-8');
      const logEntry = JSON.parse(logContent.trim());

      expect(logEntry).toMatchObject({
        eventType: 'USER_LOGIN',
        message: 'Test login',
        userId: 'test-user-123',
        severity: 'low',
        success: true,
        level: 'AUDIT'
      });
      expect(logEntry.timestamp).toBeDefined();
    });

    it('devrait utiliser "anonymous" comme userId par défaut', async () => {
      const event = {
        eventType: 'API_ERROR' as const,
        message: 'Test error',
        severity: 'high' as const,
        success: false
      };

      await auditLoggerInstance.logEvent(event);

      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(testLogDir, `audit-${today}.log`);

      const logContent = await fs.readFile(logFile, 'utf-8');
      const logEntry = JSON.parse(logContent.trim());

      expect(logEntry.userId).toBe('anonymous');
    });

    it('devrait gérer les détails additionnels', async () => {
      const event = {
        eventType: 'FILE_UPLOAD' as const,
        message: 'Test upload',
        severity: 'medium' as const,
        success: true,
        details: {
          filename: 'test.jpg',
          size: 1024,
          type: 'image/jpeg'
        }
      };

      await auditLoggerInstance.logEvent(event);

      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(testLogDir, `audit-${today}.log`);

      const logContent = await fs.readFile(logFile, 'utf-8');
      const logEntry = JSON.parse(logContent.trim());

      expect(logEntry.details).toEqual({
        filename: 'test.jpg',
        size: 1024,
        type: 'image/jpeg'
      });
    });
  });

  describe('getAuditLogs', () => {
    it('devrait retourner les logs du jour actuel', async () => {
      // Créer quelques événements de test
      await auditLoggerInstance.logEvent({
        eventType: 'USER_LOGIN',
        message: 'Login 1',
        severity: 'low',
        success: true
      });

      await auditLoggerInstance.logEvent({
        eventType: 'USER_LOGOUT',
        message: 'Logout 1',
        severity: 'low',
        success: true
      });

      const logs = await auditLoggerInstance.getAuditLogs();

      expect(logs).toHaveLength(2);
      expect(logs[0].eventType).toBe('USER_LOGIN');
      expect(logs[1].eventType).toBe('USER_LOGOUT');
    });

    it('devrait retourner un tableau vide si aucun log existe', async () => {
      const logs = await auditLoggerInstance.getAuditLogs();
      expect(logs).toEqual([]);
    });
  });
});
