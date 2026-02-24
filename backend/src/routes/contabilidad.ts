import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

function formatResponse<T>(data: T, meta?: any) {
  const response: any = { success: true, data };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

// Listar asientos contables
router.get('/asientos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', sort = 'fecha', order = 'desc', search, tipo, cuentaCodigo, fechaDesde, fechaHasta } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      deletedAt: null,
    };

    if (tipo) {
      where.tipo = tipo;
    }

    if (cuentaCodigo) {
      where.cuentaCodigo = cuentaCodigo;
    }

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) {
        where.fecha.gte = new Date(fechaDesde as string);
      }
      if (fechaHasta) {
        where.fecha.lte = new Date(fechaHasta as string);
      }
    }

    if (search) {
      where.OR = [
        { concepto: { contains: search as string, mode: 'insensitive' } },
        { numero: { contains: search as string, mode: 'insensitive' } },
        { documentoRef: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [asientos, total] = await Promise.all([
      prisma.asientoContable.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { [sort as string]: order },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido1: true,
            },
          },
          factura: {
            select: {
              id: true,
              numero: true,
              importe: true,
            },
          },
          gasto: {
            select: {
              id: true,
              concepto: true,
              importe: true,
            },
          },
        },
      }),
      prisma.asientoContable.count({ where }),
    ]);

    res.json(formatResponse(asientos, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    }));
  } catch (error) {
    console.error('List asientos error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Crear asiento contable
router.post('/asientos', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { numero, fecha, concepto, tipo, importe, importeDebe, importeHaber, cuentaCodigo, cuentaNombre, documentoRef, facturaId, gastoId } = req.body;

    // Validar campos requeridos
    if (!numero || !fecha || !concepto || !tipo || !importe || !cuentaCodigo || !cuentaNombre) {
      res.status(400).json({ success: false, error: { message: 'Faltan campos requeridos' } });
      return;
    }

    const asiento = await prisma.asientoContable.create({
      data: {
        numero,
        fecha: new Date(fecha),
        concepto,
        tipo,
        importe: parseFloat(importe),
        importeDebe: importeDebe ? parseFloat(importeDebe) : null,
        importeHaber: importeHaber ? parseFloat(importeHaber) : null,
        cuentaCodigo,
        cuentaNombre,
        documentoRef,
        usuarioId: req.user!.id,
        facturaId,
        gastoId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.status(201).json(formatResponse(asiento));
  } catch (error) {
    console.error('Create asiento error:', error);
    if ((error as any).code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'NUMERO_EXISTS', message: 'El número de asiento ya existe' } });
      return;
    }
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Obtener asiento por ID
router.get('/asientos/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const asiento = await prisma.asientoContable.findFirst({
      where: { id, deletedAt: null },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido1: true,
            email: true,
          },
        },
        factura: {
          select: {
            id: true,
            numero: true,
            importe: true,
            estado: true,
            cliente: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        gasto: {
          select: {
            id: true,
            concepto: true,
            importe: true,
            estado: true,
            proveedor: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!asiento) {
      res.status(404).json({ success: false, error: { code: 'ASIENTO_NOT_FOUND', message: 'Asiento no encontrado' } });
      return;
    }

    res.json(formatResponse(asiento));
  } catch (error) {
    console.error('Get asiento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Actualizar asiento
router.put('/asientos/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fecha, concepto, tipo, importe, importeDebe, importeHaber, cuentaCodigo, cuentaNombre, documentoRef } = req.body;

    const existingAsiento = await prisma.asientoContable.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingAsiento) {
      res.status(404).json({ success: false, error: { code: 'ASIENTO_NOT_FOUND', message: 'Asiento no encontrado' } });
      return;
    }

    const updateData: any = {};
    if (fecha) updateData.fecha = new Date(fecha);
    if (concepto) updateData.concepto = concepto;
    if (tipo) updateData.tipo = tipo;
    if (importe !== undefined) updateData.importe = parseFloat(importe);
    if (importeDebe !== undefined) updateData.importeDebe = importeDebe ? parseFloat(importeDebe) : null;
    if (importeHaber !== undefined) updateData.importeHaber = importeHaber ? parseFloat(importeHaber) : null;
    if (cuentaCodigo) updateData.cuentaCodigo = cuentaCodigo;
    if (cuentaNombre) updateData.cuentaNombre = cuentaNombre;
    if (documentoRef !== undefined) updateData.documentoRef = documentoRef;

    const asiento = await prisma.asientoContable.update({
      where: { id },
      data: updateData,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.json(formatResponse(asiento));
  } catch (error) {
    console.error('Update asiento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Eliminar asiento (soft delete)
router.delete('/asientos/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingAsiento = await prisma.asientoContable.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingAsiento) {
      res.status(404).json({ success: false, error: { code: 'ASIENTO_NOT_FOUND', message: 'Asiento no encontrado' } });
      return;
    }

    await prisma.asientoContable.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json(formatResponse({ message: 'Asiento eliminado correctamente' }));
  } catch (error) {
    console.error('Delete asiento error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Estadísticas de contabilidad
router.get('/stats/resumen', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [
      ingresosAgg,
      egresosAgg,
      totalAsientos,
      asientosPorTipo,
    ] = await Promise.all([
      prisma.asientoContable.aggregate({
        where: { deletedAt: null, tipo: 'INGRESO' },
        _sum: { importe: true },
      }),
      prisma.asientoContable.aggregate({
        where: { deletedAt: null, tipo: 'EGRESO' },
        _sum: { importe: true },
      }),
      prisma.asientoContable.count({ where: { deletedAt: null } }),
      prisma.asientoContable.groupBy({
        by: ['tipo'],
        where: { deletedAt: null },
        _count: { id: true },
      }),
    ]);

    const totalIngresos = ingresosAgg._sum.importe || 0;
    const totalEgresos = egresosAgg._sum.importe || 0;
    const balance = totalIngresos - totalEgresos;

    const asientosPorTipoMap = {
      INGRESO: 0,
      EGRESO: 0,
      TRASPASO: 0,
      AJUSTE: 0,
    };

    asientosPorTipo.forEach(item => {
      asientosPorTipoMap[item.tipo as keyof typeof asientosPorTipoMap] = item._count.id;
    });

    res.json(formatResponse({
      totalIngresos,
      totalEgresos,
      balance,
      totalAsientos,
      asientosPorTipo: asientosPorTipoMap,
    }));
  } catch (error) {
    console.error('Get contabilidad stats error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Obtener libro mayor de una cuenta
router.get('/libro-mayor', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { cuenta, fechaDesde, fechaHasta } = req.query;

    if (!cuenta) {
      res.status(400).json({ success: false, error: { message: 'Se requiere el código de cuenta' } });
      return;
    }

    const where: any = {
      deletedAt: null,
      cuentaCodigo: cuenta as string,
    };

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) {
        where.fecha.gte = new Date(fechaDesde as string);
      }
      if (fechaHasta) {
        where.fecha.lte = new Date(fechaHasta as string);
      }
    }

    const asientos = await prisma.asientoContable.findMany({
      where,
      orderBy: { fecha: 'asc' },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido1: true,
          },
        },
        factura: {
          select: {
            id: true,
            numero: true,
          },
        },
        gasto: {
          select: {
            id: true,
            concepto: true,
          },
        },
      },
    });

    // Calcular saldo acumulado
    let saldo = 0;
    const asientosConSaldo = asientos.map(asiento => {
      if (asiento.tipo === 'INGRESO') {
        saldo += asiento.importe;
      } else if (asiento.tipo === 'EGRESO') {
        saldo -= asiento.importe;
      }
      return {
        ...asiento,
        saldo,
      };
    });

    res.json(formatResponse(asientosConSaldo));
  } catch (error) {
    console.error('Get libro mayor error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// Obtener cuentas contables únicas
router.get('/cuentas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const cuentas = await prisma.asientoContable.groupBy({
      by: ['cuentaCodigo', 'cuentaNombre'],
      where: { deletedAt: null },
      _sum: { importe: true },
      _count: { id: true },
      orderBy: { cuentaCodigo: 'asc' },
    });

    const formattedCuentas = cuentas.map(cuenta => ({
      codigo: cuenta.cuentaCodigo,
      nombre: cuenta.cuentaNombre,
      total: cuenta._sum.importe || 0,
      asientosCount: cuenta._count.id,
    }));

    res.json(formatResponse(formattedCuentas));
  } catch (error) {
    console.error('Get cuentas error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
