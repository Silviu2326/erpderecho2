import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  CreateEventoDto,
  UpdateEventoDto,
  QueryEventoDto,
  QueryCalendarioDto,
  TipoEventoEnum,
} from '../dtos/calendario.dto';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

router.get('/eventos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryEventoDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, sort = 'fechaInicio', order = 'asc', expediente_id, tipo, fecha_desde, fecha_hasta } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (expediente_id) {
      where.expedienteId = expediente_id;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (fecha_desde || fecha_hasta) {
      where.fechaInicio = {};
      if (fecha_desde) {
        where.fechaInicio.gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        where.fechaInicio.lte = new Date(fecha_hasta);
      }
    }

    const [eventos, total] = await Promise.all([
      prisma.evento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: {
          id: true,
          titulo: true,
          descripcion: true,
          fechaInicio: true,
          fechaFin: true,
          tipo: true,
          expedienteId: true,
          usuarioId: true,
          createdAt: true,
          updatedAt: true,
          expediente: {
            select: {
              id: true,
              numeroExpediente: true,
              tipo: true,
            },
          },
        },
      }),
      prisma.evento.count({ where }),
    ]);

    res.json(formatResponse(eventos, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List eventos error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/eventos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateEventoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const evento = await prisma.evento.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        tipo: dto.tipo || TipoEventoEnum.OTRO,
        expedienteId: dto.expedienteId,
        usuarioId: req.user?.id,
      },
    });

    res.status(201).json(formatResponse(evento));
  } catch (error) {
    console.error('Create evento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/eventos/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.findFirst({
      where: { id, deletedAt: null },
      include: {
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
            cliente: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido1: true,
          },
        },
      },
    });

    if (!evento) {
      res.status(404).json({ success: false, error: { code: 'EVENTO_NOT_FOUND', message: 'Evento no encontrado' } });
      return;
    }

    res.json(formatResponse(evento));
  } catch (error) {
    console.error('Get evento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/eventos/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateEventoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingEvento = await prisma.evento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingEvento) {
      res.status(404).json({ success: false, error: { code: 'EVENTO_NOT_FOUND', message: 'Evento no encontrado' } });
      return;
    }

    const updateData: any = {};
    if (dto.titulo !== undefined) updateData.titulo = dto.titulo;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.fechaInicio !== undefined) updateData.fechaInicio = new Date(dto.fechaInicio);
    if (dto.fechaFin !== undefined) updateData.fechaFin = dto.fechaFin ? new Date(dto.fechaFin) : null;
    if (dto.tipo !== undefined) updateData.tipo = dto.tipo;
    if (dto.expedienteId !== undefined) updateData.expedienteId = dto.expedienteId;

    const evento = await prisma.evento.update({
      where: { id },
      data: updateData,
    });

    res.json(formatResponse(evento));
  } catch (error) {
    console.error('Update evento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.delete('/eventos/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingEvento = await prisma.evento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingEvento) {
      res.status(404).json({ success: false, error: { code: 'EVENTO_NOT_FOUND', message: 'Evento no encontrado' } });
      return;
    }

    await prisma.evento.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Evento eliminado correctamente' }));
  } catch (error) {
    console.error('Delete evento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/audiencias', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryCalendarioDto, req.query as any);

    let fechaInicio: Date;
    let fechaFin: Date;

    if (dto.fecha_desde && dto.fecha_hasta) {
      fechaInicio = new Date(dto.fecha_desde);
      fechaFin = new Date(dto.fecha_hasta);
    } else {
      const mes = dto.mes || new Date().getMonth() + 1;
      const anio = dto.anio || new Date().getFullYear();
      fechaInicio = new Date(anio, mes - 1, 1);
      fechaFin = new Date(anio, mes, 0, 23, 59, 59);
    }

    const eventos = await prisma.evento.findMany({
      where: {
        deletedAt: null,
        tipo: TipoEventoEnum.AUDIENCIA,
        fechaInicio: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: { fechaInicio: 'asc' },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fechaInicio: true,
        fechaFin: true,
        tipo: true,
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
            cliente: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    res.json(formatResponse(eventos));
  } catch (error) {
    console.error('Get audiencias error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/plazos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryCalendarioDto, req.query as any);

    let fechaInicio: Date;
    let fechaFin: Date;

    if (dto.fecha_desde && dto.fecha_hasta) {
      fechaInicio = new Date(dto.fecha_desde);
      fechaFin = new Date(dto.fecha_hasta);
    } else {
      const mes = dto.mes || new Date().getMonth() + 1;
      const anio = dto.anio || new Date().getFullYear();
      fechaInicio = new Date(anio, mes - 1, 1);
      fechaFin = new Date(anio, mes, 0, 23, 59, 59);
    }

    const eventos = await prisma.evento.findMany({
      where: {
        deletedAt: null,
        tipo: TipoEventoEnum.PLAZO,
        fechaInicio: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: { fechaInicio: 'asc' },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fechaInicio: true,
        fechaFin: true,
        tipo: true,
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
            cliente: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    res.json(formatResponse(eventos));
  } catch (error) {
    console.error('Get plazos error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/tareas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryCalendarioDto, req.query as any);

    let fechaInicio: Date;
    let fechaFin: Date;

    if (dto.fecha_desde && dto.fecha_hasta) {
      fechaInicio = new Date(dto.fecha_desde);
      fechaFin = new Date(dto.fecha_hasta);
    } else {
      const mes = dto.mes || new Date().getMonth() + 1;
      const anio = dto.anio || new Date().getFullYear();
      fechaInicio = new Date(anio, mes - 1, 1);
      fechaFin = new Date(anio, mes, 0, 23, 59, 59);
    }

    const eventos = await prisma.evento.findMany({
      where: {
        deletedAt: null,
        tipo: TipoEventoEnum.TAREA,
        fechaInicio: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: { fechaInicio: 'asc' },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fechaInicio: true,
        fechaFin: true,
        tipo: true,
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
            cliente: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    res.json(formatResponse(eventos));
  } catch (error) {
    console.error('Get tareas error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
