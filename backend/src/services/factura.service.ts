import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';

export interface CreateFacturaInput {
  numero: string;
  concepto?: string;
  importeBase?: number;
  importeIVA?: number;
  estado?: string;
  fechaEmision?: Date | string;
  fechaVencimiento?: Date | string | null;
  clienteId?: string;
  expedienteId?: string;
  lineas?: any[];
}

export interface UpdateFacturaInput {
  numero?: string;
  concepto?: string;
  importeBase?: number;
  importeIVA?: number;
  estado?: string;
  fechaEmision?: Date | string;
  fechaVencimiento?: Date | string | null;
  clienteId?: string;
  expedienteId?: string;
  lineas?: any[];
}

export interface QueryFacturaParams extends PaginationParams {
  search?: string;
  estado?: string;
  cliente_id?: string;
  expediente_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

class FacturaService {
  async findAll(params: QueryFacturaParams): Promise<PaginatedResult<any>> {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'createdAt', 
      order = 'desc', 
      search, 
      estado, 
      cliente_id,
      expediente_id,
      fecha_desde,
      fecha_hasta 
    } = params;
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

    return {
      data: facturas,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<any> {
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
      throw new ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
    }

    return factura;
  }

  async create(input: CreateFacturaInput): Promise<any> {
    const { lineas, ...facturaData } = input;

    let importeTotal = input.importeBase || 0;
    if (input.importeIVA) {
      importeTotal += input.importeIVA;
    }

    try {
      const factura = await prisma.factura.create({
        data: {
          ...facturaData,
          importe: importeTotal,
          fechaEmision: input.fechaEmision ? new Date(input.fechaEmision) : new Date(),
          fechaVencimiento: input.fechaVencimiento ? new Date(input.fechaVencimiento as string) : null,
          lineas: lineas && lineas.length > 0 ? {
            create: lineas.map(linea => ({
              concepto: linea.concepto,
              cantidad: linea.cantidad,
              precioUnitario: linea.precioUnitario,
              importe: linea.cantidad * linea.precioUnitario,
            })),
          } : undefined,
        } as any,
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

      return factura;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ServiceException('FACTURA_EXISTS', 'El número de factura ya existe', 409);
      }
      throw error;
    }
  }

  async update(id: string, input: UpdateFacturaInput): Promise<any> {
    const existingFactura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingFactura) {
      throw new ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
    }

    if (existingFactura.estado === 'ANULADA') {
      throw new ServiceException('FACTURA_ANULADA', 'No se puede modificar una factura anulada', 400);
    }

    const { lineas, ...facturaData } = input;

    let importeTotal = existingFactura.importe;
    if (input.importeBase !== undefined || input.importeIVA !== undefined) {
      const base = input.importeBase ?? existingFactura.importeBase ?? 0;
      const iva = input.importeIVA ?? existingFactura.importeIVA ?? 0;
      importeTotal = base + iva;
    }

    const updateData: any = {
      ...facturaData,
      importe: importeTotal,
    } as any;

    if (input.fechaEmision) {
      updateData.fechaEmision = new Date(input.fechaEmision);
    }
    if (input.fechaVencimiento !== undefined) {
      updateData.fechaVencimiento = input.fechaVencimiento ? new Date(input.fechaVencimiento as string) : null;
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

    try {
      const factura = await prisma.factura.update({
        where: { id },
        data: updateData as any,
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

      return factura;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ServiceException('FACTURA_EXISTS', 'El número de factura ya existe', 409);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<any> {
    const existingFactura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingFactura) {
      throw new ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
    }

    if (existingFactura.estado === 'ANULADA') {
      throw new ServiceException('FACTURA_ANULADA', 'La factura ya está anulada', 400);
    }

    const factura = await prisma.factura.update({
      where: { id },
      data: {
        estado: 'ANULADA',
        deletedAt: new Date(),
      },
    });

    return factura;
  }

  async pagar(id: string): Promise<any> {
    const existingFactura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingFactura) {
      throw new ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
    }

    if (existingFactura.estado === 'PAGADA') {
      throw new ServiceException('FACTURA_PAGADA', 'La factura ya está pagada', 400);
    }

    if (existingFactura.estado === 'ANULADA') {
      throw new ServiceException('FACTURA_ANULADA', 'No se puede pagar una factura anulada', 400);
    }

    const factura = await prisma.factura.update({
      where: { id },
      data: { estado: 'PAGADA' },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return factura;
  }

  async findPendientes(): Promise<any[]> {
    const facturas = await prisma.factura.findMany({
      where: {
        deletedAt: null,
        estado: 'PENDIENTE',
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

    return facturas;
  }

  async findVencidas(): Promise<any[]> {
    const now = new Date();
    const facturas = await prisma.factura.findMany({
      where: {
        deletedAt: null,
        estado: 'PENDIENTE',
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

    return facturas;
  }

  async getPdfUrl(id: string): Promise<any> {
    const existingFactura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingFactura) {
      throw new ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
    }

    return { url: `/api/v1/facturas/${id}/download` };
  }

  async enviar(id: string, email?: string): Promise<any> {
    const existingFactura = await prisma.factura.findFirst({
      where: { id, deletedAt: null },
      include: {
        cliente: true,
      },
    });

    if (!existingFactura) {
      throw new ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
    }

    const destinatario = email || existingFactura.cliente?.email;
    if (!destinatario) {
      throw new ServiceException('NO_EMAIL', 'No se encontró email del cliente', 400);
    }

    return {
      message: 'Factura enviada correctamente',
      email: destinatario,
    };
  }
}

export const facturaService = new FacturaService();
