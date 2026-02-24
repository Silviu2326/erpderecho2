import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';

export interface JwtPayload {
  id: string;
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Middleware de autenticación básico
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No se proporcionó token de autenticación' } });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: { code: 'TOKEN_EXPIRED', message: 'Token expirado' } });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token inválido' } });
      return;
    }
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
  }
}

// Middleware para verificar rol de administrador
export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ 
      success: false, 
      error: { 
        code: 'FORBIDDEN', 
        message: 'Acceso denegado. Se requiere rol de administrador.' 
      } 
    });
    return;
  }
  next();
}

// Middleware para verificar rol de socio
export function socioMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'socio')) {
    res.status(403).json({ 
      success: false, 
      error: { 
        code: 'FORBIDDEN', 
        message: 'Acceso denegado. Se requiere rol de socio o administrador.' 
      } 
    });
    return;
  }
  next();
}

// Middleware para verificar rol de abogado (senior o junior)
export function abogadoMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const allowedRoles = ['admin', 'socio', 'abogado', 'letrado'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403).json({ 
      success: false, 
      error: { 
        code: 'FORBIDDEN', 
        message: 'Acceso denegado. Se requiere rol de abogado.' 
      } 
    });
    return;
  }
  next();
}

// Middleware para verificar rol de secretario
export function secretarioMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const allowedRoles = ['admin', 'socio', 'abogado', 'letrado', 'secretary'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403).json({ 
      success: false, 
      error: { 
        code: 'FORBIDDEN', 
        message: 'Acceso denegado. Se requiere rol de secretario o superior.' 
      } 
    });
    return;
  }
  next();
}

// Middleware para verificar rol de contador
export function contadorMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const allowedRoles = ['admin', 'socio', 'contador'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403).json({ 
      success: false, 
      error: { 
        code: 'FORBIDDEN', 
        message: 'Acceso denegado. Se requiere rol de contador o administrador.' 
      } 
    });
    return;
  }
  next();
}

// Middleware genérico para verificar múltiples roles
export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'No autenticado' 
        } 
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: { 
          code: 'FORBIDDEN', 
          message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}` 
        } 
      });
      return;
    }
    next();
  };
}

// Middleware para verificar que el usuario es el propietario del recurso o es admin
export function ownerOrAdminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: { 
        code: 'UNAUTHORIZED', 
        message: 'No autenticado' 
      } 
    });
    return;
  }

  if (req.user.role !== 'admin' && req.user.userId !== resourceUserId) {
    res.status(403).json({ 
      success: false, 
      error: { 
        code: 'FORBIDDEN', 
        message: 'Acceso denegado. No tienes permiso para acceder a este recurso.' 
      } 
    });
    return;
  }
  next();
}

// Middleware para verificar que el usuario está activo
export async function activeUserMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: { 
        code: 'UNAUTHORIZED', 
        message: 'No autenticado' 
      } 
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { activo: true, emailVerified: true }
    });

    if (!user) {
      res.status(404).json({ 
        success: false, 
        error: { 
          code: 'USER_NOT_FOUND', 
          message: 'Usuario no encontrado' 
        } 
      });
      return;
    }

    if (!user.activo) {
      res.status(403).json({ 
        success: false, 
        error: { 
          code: 'USER_INACTIVE', 
          message: 'Usuario desactivado. Contacta al administrador.' 
        } 
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Error al verificar estado del usuario' 
      } 
    });
  }
}

// Middleware para verificar que el email está verificado
export async function verifiedEmailMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: { 
        code: 'UNAUTHORIZED', 
        message: 'No autenticado' 
      } 
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { emailVerified: true }
    });

    if (!user?.emailVerified) {
      res.status(403).json({ 
        success: false, 
        error: { 
          code: 'EMAIL_NOT_VERIFIED', 
          message: 'Email no verificado. Por favor verifica tu correo electrónico.' 
        } 
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Error al verificar estado del email' 
      } 
    });
  }
}
