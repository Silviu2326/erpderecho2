import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  CreateExpedienteDto,
  UpdateExpedienteDto,
  QueryExpedienteDto,
  CreateActuacionDto,
  QueryActuacionDto,
} from '../dtos/expediente.dto';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryExpedienteDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, estado, tipo, abogado_id, cliente_id, fecha_desde, fecha_hasta } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (estado) {
      where.estado = estado;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (abogado_id) {
      where.abogadoId = abogado_id;
    }

    if (cliente_id) {
      where.clienteId = cliente_id;
    }

    if (fecha_desde || fecha_hasta) {
      where.createdAt = {};
      if (fecha_desde) {
        where.createdAt.gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        where.createdAt.lte = new Date(fecha_hasta);
      }
    }

    if (search) {
      where.OR = [
        { numeroExpediente: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
        { abogado: { nombre: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [expedientes, total] = await Promise.all([
      prisma.expediente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: {
          id: true,
          numeroExpediente: true,
          tipo: true,
          estado: true,
          descripcion: true,
          clienteId: true,
          abogadoId: true,
          createdAt: true,
          updatedAt: true,
          cliente: {
            select: {
              id: true,
              nombre: true,
            },
          },
          abogado: {
            select: {
              id: true,
              nombre: true,
              apellido1: true,
            },
          },
        },
      }),
      prisma.expediente.count({ where }),
    ]);

    res.json(formatResponse(expedientes, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List expedientes error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateExpedienteDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const expediente = await prisma.expediente.create({
      data: dto,
    });

    res.status(201).json(formatResponse(expediente));
  } catch (error) {
    console.error('Create expediente error:', error);
    if ((error as any).code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'EXPEDIENTE_EXISTS', message: 'El número de expediente ya existe' } });
      return;
    }
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/buscar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, error: { message: 'Search query required' } });
      return;
    }

    const expedientes = await prisma.expediente.findMany({
      where: {
        deletedAt: null,
        OR: [
          { numeroExpediente: { contains: q, mode: 'insensitive' } },
          { descripcion: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: {
        id: true,
        numeroExpediente: true,
        tipo: true,
        estado: true,
        descripcion: true,
        cliente: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.json(formatResponse(expedientes));
  } catch (error) {
    console.error('Search expedientes error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/calendario', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { mes, anio } = req.query;

    const mesNum = mes ? parseInt(mes as string) : new Date().getMonth() + 1;
    const anioNum = anio ? parseInt(anio as string) : new Date().getFullYear();

    const fechaInicio = new Date(anioNum, mesNum - 1, 1);
    const fechaFin = new Date(anioNum, mesNum, 0, 23, 59, 59);

    const actuaciones = await prisma.actuacion.findMany({
      where: {
        deletedAt: null,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      select: {
        id: true,
        tipo: true,
        descripcion: true,
        fecha: true,
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
          },
        },
      },
      orderBy: { fecha: 'asc' },
    });

    const calendario = actuaciones.map(act => ({
      id: act.id,
      title: `${act.expediente.numeroExpediente} - ${act.tipo}`,
      date: act.fecha,
      tipo: act.tipo,
      descripcion: act.descripcion,
      expediente: act.expediente,
    }));

    res.json(formatResponse(calendario));
  } catch (error) {
    console.error('Get calendario error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const expediente = await prisma.expediente.findFirst({
      where: { id, deletedAt: null },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            cif: true,
            email: true,
            telefono: true,
          },
        },
        abogado: {
          select: {
            id: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            email: true,
            telefono: true,
          },
        },
        actuaciones: {
          where: { deletedAt: null },
          orderBy: { fecha: 'desc' },
          take: 10,
          select: {
            id: true,
            tipo: true,
            descripcion: true,
            fecha: true,
            documento: true,
            createdAt: true,
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido1: true,
              },
            },
          },
        },
      },
    });

    if (!expediente) {
      res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
      return;
    }

    res.json(formatResponse(expediente));
  } catch (error) {
    console.error('Get expediente error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateExpedienteDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingExpediente = await prisma.expediente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingExpediente) {
      res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
      return;
    }

    const expediente = await prisma.expediente.update({
      where: { id },
      data: dto,
    });

    res.json(formatResponse(expediente));
  } catch (error) {
    console.error('Update expediente error:', error);
    if ((error as any).code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'EXPEDIENTE_EXISTS', message: 'El número de expediente ya existe' } });
      return;
    }
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingExpediente = await prisma.expediente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingExpediente) {
      res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
      return;
    }

    await prisma.expediente.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Expediente archivado correctamente' }));
  } catch (error) {
    console.error('Delete expediente error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id/actuaciones', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(QueryActuacionDto, req.query as any);

    const existingExpediente = await prisma.expediente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingExpediente) {
      res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
      return;
    }

    const { page = 1, limit = 20, sort = 'fecha', order = 'desc' } = dto;
    const skip = (page - 1) * limit;

    const [actuaciones, total] = await Promise.all([
      prisma.actuacion.findMany({
        where: { expedienteId: id, deletedAt: null },
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: {
          id: true,
          tipo: true,
          descripcion: true,
          fecha: true,
          documento: true,
          createdAt: true,
          updatedAt: true,
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido1: true,
            },
          },
        },
      }),
      prisma.actuacion.count({ where: { expedienteId: id, deletedAt: null } }),
    ]);

    res.json(formatResponse(actuaciones, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('Get actuaciones error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/:id/actuaciones', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(CreateActuacionDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingExpediente = await prisma.expediente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingExpediente) {
      res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
      return;
    }

    const actuacion = await prisma.actuacion.create({
      data: {
        ...dto,
        fecha: new Date(dto.fecha),
        expedienteId: id,
        usuarioId: req.user!.id,
      },
    });

    res.status(201).json(formatResponse(actuacion));
  } catch (error) {
    console.error('Create actuacion error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id/documentos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingExpediente = await prisma.expediente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingExpediente) {
      res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
      return;
    }

    res.json(formatResponse([]));
  } catch (error) {
    console.error('Get documentos error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
