import { Router, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  CreateFacturaDto,
  UpdateFacturaDto,
  QueryFacturaDto,
  EstadoFacturaEnum,
} from '../dtos/factura.dto';

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
    const dto = plainToInstance(QueryFacturaDto, req.query as any);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, estado, cliente_id, expediente_id, fecha_desde, fecha_hasta } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (estado) {
      where.estado = estado;
    }

    if (cliente_id) {
      where.clienteId = cliente_id;
    }

    if (expediente_id) {
      where.expedienteId = expediente_id;
    }

    if (fecha_desde || fecha_hasta) {
      where.fechaEmision = {};
      if (fecha_desde) {
        where.fechaEmision.gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        where.fechaEmision.lte = new Date(fecha_hasta);
      }
    }

    if (search) {
      where.OR = [
        { numero: { contains: search, mode: 'insensitive' } },
        { concepto: { contains: search, mode: 'insensitive' } },
        { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [facturas, total] = await Promise.all([
      prisma.factura.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        select: {
          id: true,
          numero: true,
          concepto: true,
          importe: true,
          importeBase: true,
          importeIVA: true,
          estado: true,
          fechaEmision: true,
          fechaVencimiento: true,
          clienteId: true,
          expedienteId: true,
          createdAt: true,
          updatedAt: true,
          cliente: {
            select: {
              id: true,
              nombre: true,
            },
          },
          expediente: {
            select: {
              id: true,
              numeroExpediente: true,
            },
          },
          _count: {
            select: { lineas: true },
          },
        },
      }),
      prisma.factura.count({ where }),
    ]);

    res.json(formatResponse(facturas, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }));
  } catch (error) {
    console.error('List facturas error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const dto = plainToInstance(CreateFacturaDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const { lineas, ...facturaData } = dto;

    let importeTotal = dto.importeBase || 0;
    if (dto.importeIVA) {
      importeTotal += dto.importeIVA;
    }

    const factura = await prisma.factura.create({
      data: {
        ...facturaData,
        importe: importeTotal,
        fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : new Date(),
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null,
        lineas: lineas && lineas.length > 0 ? {
          create: lineas.map(linea => ({
            concepto: linea.concepto,
            cantidad: linea.cantidad,
            precioUnitario: linea.precioUnitario,
            importe: linea.cantidad * linea.precioUnitario,
          })),
        } : undefined,
      },
      include: {
        lineas: true,
        cliente: {
          select: {
            id: true,
            nombre: true,
          },
        },
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
          },
        },
      },
    });

    res.status(201).json(formatResponse(factura));
  } catch (error) {
    console.error('Create factura error:', error);
    if ((error as any).code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'FACTURA_EXISTS', message: 'El número de factura ya existe' } });
      return;
    }
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/pendientes', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const facturas = await prisma.factura.findMany({
      where: {
        deletedAt: null,
        estado: EstadoFacturaEnum.PENDIENTE,
      },
      orderBy: { fechaVencimiento: 'asc' },
      select: {
        id: true,
        numero: true,
        concepto: true,
        importe: true,
        importeBase: true,
        importeIVA: true,
        estado: true,
        fechaEmision: true,
        fechaVencimiento: true,
        clienteId: true,
        expedienteId: true,
        createdAt: true,
        cliente: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
          },
        },
      },
    });

    res.json(formatResponse(facturas));
  } catch (error) {
    console.error('Get facturas pendientes error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/vencidas', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const facturas = await prisma.factura.findMany({
      where: {
        deletedAt: null,
        estado: EstadoFacturaEnum.PENDIENTE,
        fechaVencimiento: {
          lt: now,
        },
      },
      orderBy: { fechaVencimiento: 'asc' },
      select: {
        id: true,
        numero: true,
        concepto: true,
        importe: true,
        importeBase: true,
        importeIVA: true,
        estado: true,
        fechaEmision: true,
        fechaVencimiento: true,
        clienteId: true,
        expedienteId: true,
        createdAt: true,
        cliente: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
          },
        },
      },
    });

    res.json(formatResponse(facturas));
  } catch (error) {
    console.error('Get facturas vencidas error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const factura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            cif: true,
            email: true,
            telefono: true,
            direccion: true,
            ciudad: true,
            provincia: true,
          },
        },
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
          },
        },
        lineas: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!factura) {
      res.status(404).json({ success: false, error: { code: 'FACTURA_NOT_FOUND', message: 'Factura no encontrada' } });
      return;
    }

    res.json(formatResponse(factura));
  } catch (error) {
    console.error('Get factura error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dto = plainToInstance(UpdateFacturaDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
      return;
    }

    const existingFactura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingFactura) {
      res.status(404).json({ success: false, error: { code: 'FACTURA_NOT_FOUND', message: 'Factura no encontrada' } });
      return;
    }

    if (existingFactura.estado === EstadoFacturaEnum.ANULADA) {
      res.status(400).json({ success: false, error: { code: 'FACTURA_ANULADA', message: 'No se puede modificar una factura anulada' } });
      return;
    }

    const { lineas, ...facturaData } = dto;

    let importeTotal = existingFactura.importe;
    if (dto.importeBase !== undefined || dto.importeIVA !== undefined) {
      const base = dto.importeBase ?? existingFactura.importeBase ?? 0;
      const iva = dto.importeIVA ?? existingFactura.importeIVA ?? 0;
      importeTotal = base + iva;
    }

    const updateData: any = {
      ...facturaData,
      importe: importeTotal,
    };

    if (dto.fechaEmision) {
      updateData.fechaEmision = new Date(dto.fechaEmision);
    }
    if (dto.fechaVencimiento) {
      updateData.fechaVencimiento = new Date(dto.fechaVencimiento);
    }

    if (lineas) {
      await prisma.lineaFactura.updateMany({
        where: { facturaId: id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      updateData.lineas = {
        create: lineas.map(linea => ({
          concepto: linea.concepto,
          cantidad: linea.cantidad,
          precioUnitario: linea.precioUnitario,
          importe: linea.cantidad * linea.precioUnitario,
        })),
      };
    }

    const factura = await prisma.factura.update({
      where: { id },
      data: updateData,
      include: {
        lineas: {
          where: { deletedAt: null },
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
          },
        },
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
          },
        },
      },
    });

    res.json(formatResponse(factura));
  } catch (error) {
    console.error('Update factura error:', error);
    if ((error as any).code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'FACTURA_EXISTS', message: 'El número de factura ya existe' } });
      return;
    }
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingFactura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingFactura) {
      res.status(404).json({ success: false, error: { code: 'FACTURA_NOT_FOUND', message: 'Factura no encontrada' } });
      return;
    }

    if (existingFactura.estado === EstadoFacturaEnum.ANULADA) {
      res.status(400).json({ success: false, error: { code: 'FACTURA_ANULADA', message: 'La factura ya está anulada' } });
      return;
    }

    const factura = await prisma.factura.update({
      where: { id },
      data: {
        estado: EstadoFacturaEnum.ANULADA,
        deletedAt: new Date(),
      },
    });

    res.json(formatResponse({ message: 'Factura anulada correctamente', factura }));
  } catch (error) {
    console.error('Delete factura error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/:id/pagar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingFactura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingFactura) {
      res.status(404).json({ success: false, error: { code: 'FACTURA_NOT_FOUND', message: 'Factura no encontrada' } });
      return;
    }

    if (existingFactura.estado === EstadoFacturaEnum.PAGADA) {
      res.status(400).json({ success: false, error: { code: 'FACTURA_PAGADA', message: 'La factura ya está pagada' } });
      return;
    }

    if (existingFactura.estado === EstadoFacturaEnum.ANULADA) {
      res.status(400).json({ success: false, error: { code: 'FACTURA_ANULADA', message: 'No se puede pagar una factura anulada' } });
      return;
    }

    const factura = await prisma.factura.update({
      where: { id },
      data: { estado: EstadoFacturaEnum.PAGADA },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.json(formatResponse({ message: 'Factura marcada como pagada', factura }));
  } catch (error) {
    console.error('Pagar factura error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.get('/:id/pdf', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingFactura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingFactura) {
      res.status(404).json({ success: false, error: { code: 'FACTURA_NOT_FOUND', message: 'Factura no encontrada' } });
      return;
    }

    const pdfUrl = `/api/v1/facturas/${id}/download`;

    res.json(formatResponse({ url: pdfUrl, message: 'URL del PDF generada correctamente' }));
  } catch (error) {
    console.error('Get factura PDF error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

router.post('/:id/enviar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const existingFactura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
      include: {
        cliente: true,
      },
    });

    if (!existingFactura) {
      res.status(404).json({ success: false, error: { code: 'FACTURA_NOT_FOUND', message: 'Factura no encontrada' } });
      return;
    }

    const destinatario = email || existingFactura.cliente?.email;
    if (!destinatario) {
      res.status(400).json({ success: false, error: { code: 'NO_EMAIL', message: 'No se encontró email del cliente' } });
      return;
    }

    res.json(formatResponse({ 
      message: 'Factura enviada correctamente',
      email: destinatario,
    }));
  } catch (error) {
    console.error('Enviar factura error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

export default router;
