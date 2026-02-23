import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/auth';
import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
  QueryUsuarioDto,
  AssignRolesDto,
} from '../dtos/usuario.dto';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryUsuarioDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, rol, activo } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido1: { contains: search, mode: 'insensitive' } },
        { apellido2: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (rol) {
      where.rol = rol;
    }

    if (activo !== undefined) {
      where.activo = activo;
    }

    const [usuarios, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido1: true,
          apellido2: true,
          rol: true,
          especialidad: true,
          numeroColegiado: true,
          telefono: true,
          avatarUrl: true,
          idioma: true,
          moneda: true,
          activo: true,
          ultimoAcceso: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json(formatResponse(usuarios, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List usuarios error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateUsuarioDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { email, password, nombre, apellido1, apellido2, rol, especialidad, numeroColegiado, telefono, avatarUrl, idioma, moneda } = dto;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, error: { code: 'USER_EXISTS', message: 'El usuario ya existe' } });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        nombre,
        apellido1,
        apellido2,
        rol: rol as any || 'abogado',
        especialidad,
        numeroColegiado,
        telefono,
        avatarUrl,
        idioma: idioma || 'es',
        moneda: moneda || 'EUR',
      },
    });

    res.status(201).json(formatResponse(sanitizeUser(user)));
  } catch (error) {
    console.error('Create usuario error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido1: true,
        apellido2: true,
        rol: true,
        especialidad: true,
        numeroColegiado: true,
        telefono: true,
        avatarUrl: true,
        idioma: true,
        moneda: true,
        activo: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
      return;
    }

    res.json(formatResponse(user));
  } catch (error) {
    console.error('Get usuario error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateUsuarioDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
      return;
    }

    if (req.user?.role !== 'admin' && req.user?.userId !== id) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'No puedes modificar otro usuario' } });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: dto,
    });

    res.json(formatResponse(sanitizeUser(user)));
  } catch (error) {
    console.error('Update usuario error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: { activo: false, deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Usuario desactivado correctamente' }));
  } catch (error) {
    console.error('Delete usuario error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/:id/roles', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(AssignRolesDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { rol: dto.rol as any },
    });

    res.json(formatResponse(sanitizeUser(user)));
  } catch (error) {
    console.error('Assign roles error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
