import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AppError } from './errorHandler';
import { auditLogger, SeverityLevel } from '../utils/auditLogger';

// Étendre l'interface File de multer
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        category?: string;
        validated?: boolean;
      }
    }
  }
}

// Types de fichiers autorisés par catégorie
export enum FileCategory {
  IMAGE = 'image',
  DOCUMENT = 'document',
  ARCHIVE = 'archive'
}

interface FileConfig {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSize: number;
  description: string;
}

const FILE_CONFIGS: Record<FileCategory, FileConfig> = {
  [FileCategory.IMAGE]: {
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'Images (JPEG, PNG, GIF, WebP, SVG)'
  },
  [FileCategory.DOCUMENT]: {
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
    maxSize: 10 * 1024 * 1024, // 10MB
    description: 'Documents (PDF, Word, Excel, TXT)'
  },
  [FileCategory.ARCHIVE]: {
    allowedMimeTypes: [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed'
    ],
    allowedExtensions: ['.zip', '.rar'],
    maxSize: 50 * 1024 * 1024, // 50MB
    description: 'Archives (ZIP, RAR)'
  }
};

// Signatures de fichiers (magic numbers) pour validation avancée
const FILE_SIGNATURES: Record<string, Buffer[]> = {
  // Images
  'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
  'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
  'image/gif': [Buffer.from('GIF87a'), Buffer.from('GIF89a')],
  'image/webp': [Buffer.from('RIFF'), Buffer.from('WEBP')],

  // Documents
  'application/pdf': [Buffer.from('%PDF')],
  'application/zip': [Buffer.from([0x50, 0x4B, 0x03, 0x04]), Buffer.from([0x50, 0x4B, 0x05, 0x06])],

  // Microsoft Office
  'application/msword': [Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [Buffer.from([0x50, 0x4B, 0x03, 0x04])]
};

// Assurez-vous que le répertoire d'upload existe
const createUploadDir = (category: FileCategory): string => {
  const uploadDir = path.join(__dirname, '../../uploads', category);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Validation de la signature du fichier (magic number)
const validateFileSignature = (buffer: Buffer, mimeType: string): boolean => {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) {
    return true; // Pas de signature définie, on fait confiance au MIME type
  }

  return signatures.some(signature => {
    return buffer.subarray(0, signature.length).equals(signature) ||
           buffer.includes(signature); // Pour certains formats comme WEBP
  });
};

// Validation du nom de fichier (sécurité)
const validateFileName = (filename: string): boolean => {
  // Pas de caractères dangereux
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(filename)) {
    return false;
  }

  // Pas de noms réservés Windows
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..+)?$/i;
  if (reservedNames.test(path.parse(filename).name)) {
    return false;
  }

  // Longueur raisonnable
  if (filename.length > 255) {
    return false;
  }

  return true;
};

// Générer un nom de fichier sécurisé
const generateSecureFilename = (originalName: string, userId: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.parse(originalName).name
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Remplacer caractères spéciaux
    .substring(0, 50); // Limiter la longueur

  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const hash = crypto.createHash('md5').update(`${userId}-${timestamp}`).digest('hex').substring(0, 8);

  return `${baseName}-${hash}-${random}${ext}`;
};

// Configuration du stockage avec catégorisation
const createStorage = (category: FileCategory) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = createUploadDir(category);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      try {
        const userId = (req as any).user?.id || 'anonymous';
        const secureFilename = generateSecureFilename(file.originalname, userId);

        // Log de l'upload
        auditLogger.logFileUpload({
          userId,
          originalName: file.originalname,
          secureFileName: secureFilename,
          mimeType: file.mimetype,
          category,
          ip: req.ip || req.connection.remoteAddress || 'unknown'
        });

        cb(null, secureFilename);
      } catch (error) {
        cb(error as Error, '');
      }
    }
  });
};

// Filtrage des fichiers avec validation avancée
const createFileFilter = (category: FileCategory) => {
  const config = FILE_CONFIGS[category];

  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    try {
      // 1. Validation du nom de fichier
      if (!validateFileName(file.originalname)) {
        return cb(new AppError('Nom de fichier invalide ou dangereux', 400));
      }

      // 2. Validation de l'extension
      const ext = path.extname(file.originalname).toLowerCase();
      if (!config.allowedExtensions.includes(ext)) {
        return cb(new AppError(
          `Extension de fichier non autorisée. Types acceptés: ${config.description}`,
          400
        ));
      }

      // 3. Validation du MIME type
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        return cb(new AppError(
          `Type de fichier non autorisé. Types acceptés: ${config.description}`,
          400
        ));
      }

      // Log de tentative d'upload
      const userId = (req as any).user?.id || 'anonymous';
      auditLogger.logFileValidation({
        userId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        category,
        status: 'accepted',
        ip: req.ip || req.connection.remoteAddress || 'unknown'
      });

      cb(null, true);
    } catch (error) {
      const userId = (req as any).user?.id || 'anonymous';
      auditLogger.logFileValidation({
        userId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        category,
        status: 'rejected',
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip || req.connection.remoteAddress || 'unknown'
      });

      cb(error as Error);
    }
  };
};

// Middleware de validation post-upload (vérification de signature)
export const validateUploadedFile = (category: FileCategory) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }

    try {
      const filePath = req.file.path;
      const fileBuffer = fs.readFileSync(filePath);

      // Validation de la signature du fichier
      if (!validateFileSignature(fileBuffer, req.file.mimetype)) {
        // Supprimer le fichier invalide
        fs.unlinkSync(filePath);

        const userId = (req as any).user?.id || 'anonymous';
        auditLogger.logSecurityEvent({
          userId,
          event: 'FILE_SIGNATURE_MISMATCH',
          details: {
            fileName: req.file.originalname,
            mimeType: req.file.mimetype,
            category
          },
          ip: req.ip || req.connection.remoteAddress || 'unknown',
          severity: SeverityLevel.HIGH
        });

        throw new AppError('Le fichier ne correspond pas à son type déclaré', 400);
      }

      // Validation de la taille après upload
      const config = FILE_CONFIGS[category];
      if (req.file.size > config.maxSize) {
        fs.unlinkSync(filePath);
        throw new AppError(
          `Fichier trop volumineux. Taille maximale: ${Math.round(config.maxSize / 1024 / 1024)}MB`,
          400
        );
      }

      // Ajouter des métadonnées au fichier
      req.file.category = category;
      req.file.validated = true;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Factory pour créer des middlewares d'upload par catégorie
export const createUploadMiddleware = (
  category: FileCategory,
  fieldName: string = 'file',
  multiple: boolean = false
) => {
  const config = FILE_CONFIGS[category];

  const upload = multer({
    storage: createStorage(category),
    limits: {
      fileSize: config.maxSize,
      files: multiple ? 10 : 1 // Maximum 10 fichiers en mode multiple
    },
    fileFilter: createFileFilter(category)
  });

  return {
    middleware: multiple ? upload.array(fieldName, 10) : upload.single(fieldName),
    validator: validateUploadedFile(category),
    config
  };
};

// Middlewares préconfigurés
export const uploadImage = createUploadMiddleware(FileCategory.IMAGE, 'image');
export const uploadDocument = createUploadMiddleware(FileCategory.DOCUMENT, 'document');
export const uploadArchive = createUploadMiddleware(FileCategory.ARCHIVE, 'archive');
export const uploadMultipleImages = createUploadMiddleware(FileCategory.IMAGE, 'images', true);

// Middleware pour nettoyer les anciens fichiers
export const cleanupOldFiles = (maxAge: number = 30 * 24 * 60 * 60 * 1000) => { // 30 jours par défaut
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const now = Date.now();

      Object.values(FileCategory).forEach(category => {
        const uploadDir = path.join(__dirname, '../../uploads', category);
        if (fs.existsSync(uploadDir)) {
          const files = fs.readdirSync(uploadDir);

          files.forEach(file => {
            const filePath = path.join(uploadDir, file);
            const stats = fs.statSync(filePath);

            if (now - stats.mtime.getTime() > maxAge) {
              fs.unlinkSync(filePath);
              auditLogger.logFileCleanup({
                fileName: file,
                category,
                age: now - stats.mtime.getTime(),
                action: 'deleted'
              });
            }
          });
        }
      });

      next();
    } catch (error) {
      console.error('Erreur lors du nettoyage des fichiers:', error);
      next(); // Ne pas bloquer la requête
    }
  };
};

// Export par défaut pour rétrocompatibilité
export default uploadImage;
