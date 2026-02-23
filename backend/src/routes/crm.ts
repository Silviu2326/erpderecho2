import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  CreateLeadDto,
  UpdateLeadDto,
  ConvertirLeadDto,
  QueryLeadDto,
  CreateOportunidadDto,
  UpdateOportunidadDto,
  QueryOportunidadDto,
  QueryPipelineDto,
  CreateActividadDto,
  UpdateActividadDto,
  QueryActividadDto,
  CreateNotaDto,
  UpdateNotaDto,
  QueryNotaDto,
  CreateContactoDto,
  QueryContactoDto,
} from '../dtos/crm.dto';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

router.get('/leads', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryLeadDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, estado } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (estado) {
      where.estado = estado;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { empresa: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
            },
          },
          oportunidades: {
            select: {
              id: true,
              titulo: true,
              estado: true,
              importe: true,
              etapa: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    res.json(formatResponse(leads, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List leads error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/leads', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateLeadDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const lead = await prisma.lead.create({
      data: dto as any,
    });

    res.status(201).json(formatResponse(lead));
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/leads/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateLeadDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingLead = await prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingLead) {
      res.status(404).json({ success: false, error: { message: 'Lead not found' } });
      return;
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: dto as any,
    });

    res.json(formatResponse(lead));
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/leads/:id/convertir', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(ConvertirLeadDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingLead = await prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingLead) {
      res.status(404).json({ success: false, error: { message: 'Lead not found' } });
      return;
    }

    const [oportunidad] = await prisma.$transaction([
      prisma.oportunidad.create({
        data: {
          titulo: dto.titulo,
          leadId: id,
          estado: 'EN_PROCESO' as any,
          probabilidad: dto.probabilidad ?? 10,
          importe: dto.importe ?? 0,
          etapa: (dto.etapa ?? 'PROSPECTO') as any,
          usuarioId: dto.usuarioId ?? req.user?.id,
        },
      }),
      prisma.lead.update({
        where: { id },
        data: { estado: 'CONVERTIDO' },
      }),
    ]);

    res.status(201).json(formatResponse(oportunidad));
  } catch (error) {
    console.error('Convert lead error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/oportunidades', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryOportunidadDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, estado, etapa, usuarioId } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (estado) {
      where.estado = estado;
    }

    if (etapa) {
      where.etapa = etapa;
    }

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { lead: { nombre: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [oportunidades, total] = await Promise.all([
      prisma.oportunidad.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          lead: {
            select: {
              id: true,
              nombre: true,
              empresa: true,
            },
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido1: true,
            },
          },
          _count: {
            select: {
              actividades: true,
              notas: true,
            },
          },
        },
      }),
      prisma.oportunidad.count({ where }),
    ]);

    res.json(formatResponse(oportunidades, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List oportunidades error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/oportunidades', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateOportunidadDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const oportunidad = await prisma.oportunidad.create({
      data: {
        ...dto as any,
        usuarioId: dto.usuarioId ?? req.user?.id,
      },
    });

    res.status(201).json(formatResponse(oportunidad));
  } catch (error) {
    console.error('Create oportunidad error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/oportunidades/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateOportunidadDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingOportunidad = await prisma.oportunidad.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingOportunidad) {
      res.status(404).json({ success: false, error: { message: 'Oportunidad not found' } });
      return;
    }

    const oportunidad = await prisma.oportunidad.update({
      where: { id },
      data: dto as any,
    });

    res.json(formatResponse(oportunidad));
  } catch (error) {
    console.error('Update oportunidad error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/pipeline', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryPipelineDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { usuarioId } = dto;

    const where: any = {
      deletedAt: null,
      estado: { notIn: ['GANADA', 'PERDIDA'] },
    };

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    const oportunidades = await prisma.oportunidad.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        lead: {
          select: {
            id: true,
            nombre: true,
            empresa: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido1: true,
          },
        },
        _count: {
          select: {
            actividades: true,
            notas: true,
          },
        },
      },
    });

    const etapas = ['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE'];
    const pipeline: Record<string, any[]> = {};

    for (const etapa of etapas) {
      pipeline[etapa] = oportunidades.filter((o) => o.etapa === etapa);
    }

    const totales = {
      cantidad: oportunidades.length,
      importe: oportunidades.reduce((sum, o) => sum + o.importe, 0),
      probabilidadPonderada: oportunidades.length > 0
        ? oportunidades.reduce((sum, o) => sum + (o.importe * o.probabilidad), 0) / oportunidades.reduce((sum, o) => sum + o.importe, 0) || 0
        : 0,
    };

    res.json(formatResponse({ pipeline, totales }));
  } catch (error) {
    console.error('Get pipeline error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/contactos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryContactoDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, search } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cargo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contactos, total] = await Promise.all([
      prisma.contacto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      }),
      prisma.contacto.count({ where }),
    ]);

    res.json(formatResponse(contactos, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List contactos error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/contactos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateContactoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingCliente = await prisma.cliente.findFirst({
      where: { id: dto.clienteId, deletedAt: null },
    });

    if (!existingCliente) {
      res.status(404).json({ success: false, error: { message: 'Cliente not found' } });
      return;
    }

    const contacto = await prisma.contacto.create({
      data: dto as any,
    });

    res.status(201).json(formatResponse(contacto));
  } catch (error) {
    console.error('Create contacto error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/actividades', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryActividadDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, sort = 'fecha', order = 'asc', oportunidadId, usuarioId, completada } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (oportunidadId) {
      where.oportunidadId = oportunidadId;
    }

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (completada !== undefined) {
      where.completada = completada;
    }

    const [actividades, total] = await Promise.all([
      prisma.actividad.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          oportunidad: {
            select: {
              id: true,
              titulo: true,
              etapa: true,
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
      }),
      prisma.actividad.count({ where }),
    ]);

    res.json(formatResponse(actividades, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List actividades error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/actividades', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateActividadDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const actividad = await prisma.actividad.create({
      data: {
        ...dto as any,
        fecha: new Date(dto.fecha),
        usuarioId: dto.usuarioId ?? req.user?.id,
      },
    });

    res.status(201).json(formatResponse(actividad));
  } catch (error) {
    console.error('Create actividad error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/actividades/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateActividadDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingActividad = await prisma.actividad.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingActividad) {
      res.status(404).json({ success: false, error: { message: 'Actividad not found' } });
      return;
    }

    const updateData: any = { ...dto };
    if (dto.fecha) {
      updateData.fecha = new Date(dto.fecha);
    }

    const actividad = await prisma.actividad.update({
      where: { id },
      data: updateData,
    });

    res.json(formatResponse(actividad));
  } catch (error) {
    console.error('Update actividad error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.delete('/actividades/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingActividad = await prisma.actividad.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingActividad) {
      res.status(404).json({ success: false, error: { message: 'Actividad not found' } });
      return;
    }

    await prisma.actividad.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Actividad deleted successfully' }));
  } catch (error) {
    console.error('Delete actividad error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
