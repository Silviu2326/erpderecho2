import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { ServiceException } from '../services/base.types';

// Configuración de almacenamiento
function defineStorage(): multer.StorageEngine {
  return multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      const uploadPath = path.resolve(env.UPLOAD_PATH, 'temp');
      
      // Crear directorio si no existe
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      // Generar nombre único: timestamp-random.ext
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const extension = path.extname(file.originalname);
      cb(null, `doc-${uniqueSuffix}${extension}`);
    }
  });
}

// Filtro de archivos
function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Verificar tipo MIME
  if (env.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ServiceException(
      'INVALID_FILE_TYPE',
      `Tipo de archivo no permitido: ${file.mimetype}. Tipos permitidos: ${env.ALLOWED_MIME_TYPES.join(', ')}`,
      400
    ) as any);
  }
}

// Configuración de Multer
export const upload = multer({
  storage: defineStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // 25MB
    files: 10 // Máximo 10 archivos por request
  }
});

// Middleware de manejo de errores de Multer
export function handleUploadError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    // Errores específicos de Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `El archivo excede el tamaño máximo permitido de ${(env.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
        }
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Demasiados archivos. Máximo 10 archivos por upload.'
        }
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNEXPECTED_FILE',
          message: 'Campo de archivo no esperado'
        }
      });
    }
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message
      }
    });
  }
  
  // Otros errores
  if (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: err.code || 'UPLOAD_ERROR',
        message: err.message || 'Error al subir archivo'
      }
    });
  }
  
  next();
}

// Middleware para validar que se subió al menos un archivo
export function requireFile(req: Request, res: Response, next: NextFunction) {
  if (!req.file && (!req.files || (Array.isArray(req.files) && req.files.length === 0))) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE',
        message: 'No se ha subido ningún archivo'
      }
    });
  }
  next();
}
