import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  CreateConsentimientoDto,
  QueryConsentimientoDto,
  CreateDerechoARCOdto,
  ProcesarDerechoARCOdto,
  QueryDerechoARCOdto,
  CreateBrechaDto,
  QueryBrechaDto,
} from '../dtos/lopdgdd.dto';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

router.get('/consentimientos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryConsentimientoDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, clienteId, tipo } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (clienteId) {
      where.clienteId = clienteId;
    }
    if (tipo) {
      where.tipo = tipo;
    }

    const [consentimientos, total] = await Promise.all([
      prisma.consentimiento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              cif: true,
              email: true,
            },
          },
        },
      }),
      prisma.consentimiento.count({ where }),
    ]);

    res.json(formatResponse(consentimientos, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List consentimiento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/consentimientos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateConsentimientoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const cliente = await prisma.cliente.findFirst({
      where: { id: dto.clienteId, deletedAt: null },
    });

    if (!cliente) {
      res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
      return;
    }

    const consentimiento = await prisma.consentimiento.create({
      data: {
        clienteId: dto.clienteId,
        tipo: dto.tipo,
        granted: dto.granted,
        fechaConsentimiento: new Date(dto.fechaConsentimiento),
      },
    });

    res.status(201).json(formatResponse(consentimiento));
  } catch (error) {
    console.error('Create consentimiento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/derechos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryDerechoARCOdto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, clienteId, tipo, estado } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (clienteId) {
      where.clienteId = clienteId;
    }
    if (tipo) {
      where.tipo = tipo;
    }
    if (estado) {
      where.estado = estado;
    }

    const [derechos, total] = await Promise.all([
      prisma.derechoARCO.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              cif: true,
              email: true,
            },
          },
        },
      }),
      prisma.derechoARCO.count({ where }),
    ]);

    res.json(formatResponse(derechos, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List derecho error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/derechos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateDerechoARCOdto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const cliente = await prisma.cliente.findFirst({
      where: { id: dto.clienteId, deletedAt: null },
    });

    if (!cliente) {
      res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
      return;
    }

    const derecho = await prisma.derechoARCO.create({
      data: {
        clienteId: dto.clienteId,
        tipo: dto.tipo,
        fechaSolicitud: new Date(dto.fechaSolicitud),
      },
    });

    res.status(201).json(formatResponse(derecho));
  } catch (error) {
    console.error('Create derecho error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/derechos/:id/procesar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(ProcesarDerechoARCOdto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existing = await prisma.derechoARCO.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: { code: 'DERECHO_NOT_FOUND', message: 'Derecho ARCO no encontrado' } });
      return;
    }

    const derecho = await prisma.derechoARCO.update({
      where: { id },
      data: {
        estado: dto.estado,
        fechaRespuesta: dto.fechaRespuesta ? new Date(dto.fechaRespuesta) : null,
      },
    });

    res.json(formatResponse(derecho));
  } catch (error) {
    console.error('Procesar derecho error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/brechas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryBrechaDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, estado } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (estado) {
      where.estado = estado;
    }

    const [brechas, total] = await Promise.all([
      prisma.brecha.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaDeteccion: 'desc' },
      }),
      prisma.brecha.count({ where }),
    ]);

    res.json(formatResponse(brechas, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List brecha error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/brechas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateBrechaDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const brecha = await prisma.brecha.create({
      data: {
        descripcion: dto.descripcion,
        fechaDeteccion: new Date(dto.fechaDeteccion),
        fechaNotificacionAepd: dto.fechaNotificacionAepd ? new Date(dto.fechaNotificacionAepd) : null,
        estado: dto.estado || 'DETECTADA',
        medidas: dto.medidas,
      },
    });

    res.status(201).json(formatResponse(brecha));
  } catch (error) {
    console.error('Create brecha error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/informes', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalConsentimientos,
      consentimientosPorTipo,
      totalDerechos,
      derechosPorTipo,
      derechosPorEstado,
      totalBrechas,
      brechasPorEstado,
    ] = await Promise.all([
      prisma.consentimiento.count({ where: { deletedAt: null } }),
      prisma.consentimiento.groupBy({
        by: ['tipo'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.derechoARCO.count({ where: { deletedAt: null } }),
      prisma.derechoARCO.groupBy({
        by: ['tipo'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.derechoARCO.groupBy({
        by: ['estado'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.brecha.count({ where: { deletedAt: null } }),
      prisma.brecha.groupBy({
        by: ['estado'],
        where: { deletedAt: null },
        _count: true,
      }),
    ]);

    const informe = {
      consentimiento: {
        total: totalConsentimientos,
        porTipo: consentimientosPorTipo.map((item) => ({
          tipo: item.tipo,
          count: item._count,
        })),
      },
      derechosARCO: {
        total: totalDerechos,
        porTipo: derechosPorTipo.map((item) => ({
          tipo: item.tipo,
          count: item._count,
        })),
        porEstado: derechosPorEstado.map((item) => ({
          estado: item.estado,
          count: item._count,
        })),
      },
      brechas: {
        total: totalBrechas,
        porEstado: brechasPorEstado.map((item) => ({
          estado: item.estado,
          count: item._count,
        })),
      },
    };

    res.json(formatResponse(informe));
  } catch (error) {
    console.error('Get informes error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
