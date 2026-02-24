import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  CreateGastoDto,
  UpdateGastoDto,
  QueryGastoDto,
  CreateProveedorDto,
  UpdateProveedorDto,
  QueryProveedorDto,
  EstadoGastoEnum,
} from '../dtos/gasto.dto';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

// ============ GASTOS ============

// Listar gastos
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryGastoDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, estado, tipo, usuarioId, proveedorId, expedienteId, fechaDesde, fechaHasta } = dto;
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

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (proveedorId) {
      where.proveedorId = proveedorId;
    }

    if (expedienteId) {
      where.expedienteId = expedienteId;
    }

    if (fechaDesde || fechaHasta) {
      where.fechaGasto = {};
      if (fechaDesde) {
        where.fechaGasto.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaGasto.lte = new Date(fechaHasta);
      }
    }

    if (search) {
      where.OR = [
        { concepto: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { numeroFactura: { contains: search, mode: 'insensitive' } },
        { proveedor: { nombre: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [gastos, total] = await Promise.all([
      prisma.gasto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          proveedor: {
            select: {
              id: true,
              nombre: true,
              cif: true,
            },
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido1: true,
            },
          },
          expediente: {
            select: {
              id: true,
              numeroExpediente: true,
            },
          },
          aprobadoPor: {
            select: {
              id: true,
              nombre: true,
              apellido1: true,
            },
          },
        },
      }),
      prisma.gasto.count({ where }),
    ]);

    res.json(formatResponse(gastos, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List gastos error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Crear gasto
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateGastoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const gasto = await prisma.gasto.create({
      data: {
        ...dto,
        fechaGasto: new Date(dto.fechaGasto),
        fechaPago: dto.fechaPago ? new Date(dto.fechaPago) : null,
        usuarioId: req.user!.id,
      },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.status(201).json(formatResponse(gasto));
  } catch (error) {
    console.error('Create gasto error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Obtener gasto por ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const gasto = await prisma.gasto.findFirst({
      where: { id, deletedAt: null },
      include: {
        proveedor: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido1: true,
            email: true,
          },
        },
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
          },
        },
        aprobadoPor: {
          select: {
            id: true,
            nombre: true,
            apellido1: true,
          },
        },
      },
    });

    if (!gasto) {
      res.status(404).json({ success: false, error: { code: 'GASTO_NOT_FOUND', message: 'Gasto no encontrado' } });
      return;
    }

    res.json(formatResponse(gasto));
  } catch (error) {
    console.error('Get gasto error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Actualizar gasto
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateGastoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingGasto = await prisma.gasto.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingGasto) {
      res.status(404).json({ success: false, error: { code: 'GASTO_NOT_FOUND', message: 'Gasto no encontrado' } });
      return;
    }

    const updateData: any = { ...dto };
    if (dto.fechaGasto) {
      updateData.fechaGasto = new Date(dto.fechaGasto);
    }
    if (dto.fechaPago) {
      updateData.fechaPago = new Date(dto.fechaPago);
    }

    const gasto = await prisma.gasto.update({
      where: { id },
      data: updateData,
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.json(formatResponse(gasto));
  } catch (error) {
    console.error('Update gasto error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Eliminar gasto (soft delete)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingGasto = await prisma.gasto.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingGasto) {
      res.status(404).json({ success: false, error: { code: 'GASTO_NOT_FOUND', message: 'Gasto no encontrado' } });
      return;
    }

    await prisma.gasto.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Gasto eliminado correctamente' }));
  } catch (error) {
    console.error('Delete gasto error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Aprobar gasto
router.post('/:id/aprobar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingGasto = await prisma.gasto.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingGasto) {
      res.status(404).json({ success: false, error: { code: 'GASTO_NOT_FOUND', message: 'Gasto no encontrado' } });
      return;
    }

    if (existingGasto.estado !== 'PENDIENTE') {
      res.status(400).json({ success: false, error: { code: 'GASTO_NOT_PENDING', message: 'Solo se pueden aprobar gastos pendientes' } });
      return;
    }

    const gasto = await prisma.gasto.update({
      where: { id },
      data: {
        estado: 'APROBADO',
        aprobadoPorId: req.user!.id,
      },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        aprobadoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.json(formatResponse({ message: 'Gasto aprobado correctamente', gasto }));
  } catch (error) {
    console.error('Approve gasto error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Rechazar gasto
router.post('/:id/rechazar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingGasto = await prisma.gasto.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingGasto) {
      res.status(404).json({ success: false, error: { code: 'GASTO_NOT_FOUND', message: 'Gasto no encontrado' } });
      return;
    }

    if (existingGasto.estado !== 'PENDIENTE') {
      res.status(400).json({ success: false, error: { code: 'GASTO_NOT_PENDING', message: 'Solo se pueden rechazar gastos pendientes' } });
      return;
    }

    const gasto = await prisma.gasto.update({
      where: { id },
      data: { estado: 'RECHAZADO' },
    });

    res.json(formatResponse({ message: 'Gasto rechazado', gasto }));
  } catch (error) {
    console.error('Reject gasto error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Marcar gasto como pagado
router.post('/:id/pagar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingGasto = await prisma.gasto.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingGasto) {
      res.status(404).json({ success: false, error: { code: 'GASTO_NOT_FOUND', message: 'Gasto no encontrado' } });
      return;
    }

    if (existingGasto.estado !== 'APROBADO') {
      res.status(400).json({ success: false, error: { code: 'GASTO_NOT_APPROVED', message: 'Solo se pueden pagar gastos aprobados' } });
      return;
    }

    const gasto = await prisma.gasto.update({
      where: { id },
      data: {
        estado: 'PAGADO',
        fechaPago: new Date(),
      },
    });

    res.json(formatResponse({ message: 'Gasto marcado como pagado', gasto }));
  } catch (error) {
    console.error('Pay gasto error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Estadísticas de gastos
router.get('/stats/resumen', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalGastos,
      totalPendientes,
      totalAprobados,
      totalPagados,
      sumaTotal,
      sumaPendientes,
      sumaPagados,
    ] = await Promise.all([
      prisma.gasto.count({ where: { deletedAt: null } }),
      prisma.gasto.count({ where: { deletedAt: null, estado: 'PENDIENTE' } }),
      prisma.gasto.count({ where: { deletedAt: null, estado: 'APROBADO' } }),
      prisma.gasto.count({ where: { deletedAt: null, estado: 'PAGADO' } }),
      prisma.gasto.aggregate({
        where: { deletedAt: null },
        _sum: { importe: true },
      }),
      prisma.gasto.aggregate({
        where: { deletedAt: null, estado: 'PENDIENTE' },
        _sum: { importe: true },
      }),
      prisma.gasto.aggregate({
        where: { deletedAt: null, estado: 'PAGADO' },
        _sum: { importe: true },
      }),
    ]);

    res.json(formatResponse({
      totalGastos,
      totalPendientes,
      totalAprobados,
      totalPagados,
      sumaTotal: sumaTotal._sum.importe || 0,
      sumaPendientes: sumaPendientes._sum.importe || 0,
      sumaPagados: sumaPagados._sum.importe || 0,
    }));
  } catch (error) {
    console.error('Get gasto stats error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// ============ PROVEEDORES ============

// Listar proveedores
router.get('/proveedores', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(QueryProveedorDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, search, activo } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { cif: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [proveedores, total] = await Promise.all([
      prisma.proveedor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
        include: {
          _count: {
            select: { gastos: true },
          },
        },
      }),
      prisma.proveedor.count({ where }),
    ]);

    res.json(formatResponse(proveedores, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List proveedores error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Crear proveedor
router.post('/proveedores', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateProveedorDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const proveedor = await prisma.proveedor.create({
      data: dto,
    });

    res.status(201).json(formatResponse(proveedor));
  } catch (error) {
    console.error('Create proveedor error:', error);
    if ((error as any).code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'CIF_EXISTS', message: 'El CIF ya está registrado' } });
      return;
    }
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Obtener proveedor por ID
router.get('/proveedores/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const proveedor = await prisma.proveedor.findFirst({
      where: { id, deletedAt: null },
      include: {
        gastos: {
          where: { deletedAt: null },
          orderBy: { fechaGasto: 'desc' },
          take: 10,
          select: {
            id: true,
            concepto: true,
            importe: true,
            estado: true,
            fechaGasto: true,
          },
        },
        _count: {
          select: { gastos: true },
        },
      },
    });

    if (!proveedor) {
      res.status(404).json({ success: false, error: { code: 'PROVEEDOR_NOT_FOUND', message: 'Proveedor no encontrado' } });
      return;
    }

    res.json(formatResponse(proveedor));
  } catch (error) {
    console.error('Get proveedor error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Actualizar proveedor
router.put('/proveedores/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateProveedorDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingProveedor = await prisma.proveedor.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingProveedor) {
      res.status(404).json({ success: false, error: { code: 'PROVEEDOR_NOT_FOUND', message: 'Proveedor no encontrado' } });
      return;
    }

    const proveedor = await prisma.proveedor.update({
      where: { id },
      data: dto,
    });

    res.json(formatResponse(proveedor));
  } catch (error) {
    console.error('Update proveedor error:', error);
    if ((error as any).code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'CIF_EXISTS', message: 'El CIF ya está registrado' } });
      return;
    }
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Eliminar proveedor (soft delete)
router.delete('/proveedores/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingProveedor = await prisma.proveedor.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingProveedor) {
      res.status(404).json({ success: false, error: { code: 'PROVEEDOR_NOT_FOUND', message: 'Proveedor no encontrado' } });
      return;
    }

    await prisma.proveedor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Proveedor eliminado correctamente' }));
  } catch (error) {
    console.error('Delete proveedor error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
