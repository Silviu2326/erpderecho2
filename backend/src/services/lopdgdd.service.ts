import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';

export interface CreateConsentimientoInput {
  tipo: string;
  granted: boolean;
  fechaConsentimiento: Date | string;
  clienteId: string;
}

export interface UpdateConsentimientoInput {
  tipo?: string;
  granted?: boolean;
  fechaConsentimiento?: Date | string;
}

export interface CreateDerechoARCOInput {
  tipo: string;
  estado?: string;
  fechaSolicitud: Date | string;
  clienteId: string;
}

export interface UpdateDerechoARCOInput {
  tipo?: string;
  estado?: string;
  fechaSolicitud?: Date | string;
  fechaRespuesta?: Date | string;
}

export interface CreateBrechaInput {
  descripcion: string;
  fechaDeteccion: Date | string;
  estado?: string;
  medidas?: string;
}

export interface UpdateBrechaInput {
  descripcion?: string;
  fechaDeteccion?: Date | string;
  fechaNotificacionAepd?: Date | string;
  estado?: string;
  medidas?: string;
}

export interface QueryConsentimientoParams extends PaginationParams {
  cliente_id?: string;
  tipo?: string;
  granted?: boolean;
}

export interface QueryDerechoARCOParams extends PaginationParams {
  cliente_id?: string;
  tipo?: string;
  estado?: string;
}

export interface QueryBrechaParams extends PaginationParams {
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

class LopdgddService {
  async findAllConsentimientos(params: QueryConsentimientoParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', cliente_id, tipo, granted } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (cliente_id) {
      where.clienteId = cliente_id;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (granted !== undefined) {
      where.granted = granted;
    }

    const [consentimientos, total] = await Promise.all([
      prisma.consentimiento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          cliente: {
            select: { id: true, nombre: true, email: true },
          },
        },
      }),
      prisma.consentimiento.count({ where }),
    ]);

    return {
      data: consentimientos,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findConsentimientoById(id: string): Promise<any> {
    const consentimiento = await prisma.consentimiento.findFirst({
      where: { id, deletedAt: null },
      include: {
        cliente: true,
      },
    });

    if (!consentimiento) {
      throw new ServiceException('CONSENTIMIENTO_NOT_FOUND', 'Consentimiento no encontrado', 404);
    }

    return consentimiento;
  }

  async createConsentimiento(input: CreateConsentimientoInput): Promise<any> {
    const existingCliente = await prisma.cliente.findFirst({
      where: { id: input.clienteId, deletedAt: null },
    });

    if (!existingCliente) {
      throw new ServiceException('CLIENTE_NOT_FOUND', 'Cliente no encontrado', 404);
    }

    const consentimiento = await prisma.consentimiento.create({
      data: {
        ...input,
        fechaConsentimiento: new Date(input.fechaConsentimiento),
      } as any,
    });
    return consentimiento;
  }

  async updateConsentimiento(id: string, input: UpdateConsentimientoInput): Promise<any> {
    const existingConsentimiento = await prisma.consentimiento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingConsentimiento) {
      throw new ServiceException('CONSENTIMIENTO_NOT_FOUND', 'Consentimiento no encontrado', 404);
    }

    const updateData: any = { ...input };
    if (input.fechaConsentimiento) {
      updateData.fechaConsentimiento = new Date(input.fechaConsentimiento as string);
    }

    const consentimiento = await prisma.consentimiento.update({
      where: { id },
      data: updateData as any,
    });
    return consentimiento;
  }

  async deleteConsentimiento(id: string): Promise<void> {
    const existingConsentimiento = await prisma.consentimiento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingConsentimiento) {
      throw new ServiceException('CONSENTIMIENTO_NOT_FOUND', 'Consentimiento no encontrado', 404);
    }

    await prisma.consentimiento.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getConsentimientosCliente(clienteId: string): Promise<any[]> {
    const consentimientos = await prisma.consentimiento.findMany({
      where: { clienteId, deletedAt: null },
      orderBy: { fechaConsentimiento: 'desc' },
    });

    return consentimientos;
  }

  async findAllDerechosARCO(params: QueryDerechoARCOParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', cliente_id, tipo, estado } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (cliente_id) {
      where.clienteId = cliente_id;
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
        orderBy: { [sort]: order },
        include: {
          cliente: {
            select: { id: true, nombre: true, email: true },
          },
        },
      }),
      prisma.derechoARCO.count({ where }),
    ]);

    return {
      data: derechos,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findDerechoARCOById(id: string): Promise<any> {
    const derecho = await prisma.derechoARCO.findFirst({
      where: { id, deletedAt: null },
      include: {
        cliente: true,
      },
    });

    if (!derecho) {
      throw new ServiceException('DERECHO_ARCO_NOT_FOUND', 'Derecho ARCO no encontrado', 404);
    }

    return derecho;
  }

  async createDerechoARCO(input: CreateDerechoARCOInput): Promise<any> {
    const existingCliente = await prisma.cliente.findFirst({
      where: { id: input.clienteId, deletedAt: null },
    });

    if (!existingCliente) {
      throw new ServiceException('CLIENTE_NOT_FOUND', 'Cliente no encontrado', 404);
    }

    const derecho = await prisma.derechoARCO.create({
      data: {
        ...input,
        fechaSolicitud: new Date(input.fechaSolicitud),
      } as any,
    });
    return derecho;
  }

  async updateDerechoARCO(id: string, input: UpdateDerechoARCOInput): Promise<any> {
    const existingDerecho = await prisma.derechoARCO.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingDerecho) {
      throw new ServiceException('DERECHO_ARCO_NOT_FOUND', 'Derecho ARCO no encontrado', 404);
    }

    const updateData: any = { ...input };
    if (input.fechaSolicitud) {
      updateData.fechaSolicitud = new Date(input.fechaSolicitud as string);
    }
    if (input.fechaRespuesta) {
      updateData.fechaRespuesta = new Date(input.fechaRespuesta as string);
    }

    const derecho = await prisma.derechoARCO.update({
      where: { id },
      data: updateData as any,
    });
    return derecho;
  }

  async deleteDerechoARCO(id: string): Promise<void> {
    const existingDerecho = await prisma.derechoARCO.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingDerecho) {
      throw new ServiceException('DERECHO_ARCO_NOT_FOUND', 'Derecho ARCO no encontrado', 404);
    }

    await prisma.derechoARCO.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getDerechosPendientes(): Promise<any[]> {
    const derechos = await prisma.derechoARCO.findMany({
      where: {
        deletedAt: null,
        estado: { in: ['PENDIENTE', 'EN_PROCESO'] },
      },
      orderBy: { fechaSolicitud: 'asc' },
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });

    return derechos;
  }

  async findAllBrechas(params: QueryBrechaParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'fechaDeteccion', order = 'desc', estado, fecha_desde, fecha_hasta } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (estado) {
      where.estado = estado;
    }

    if (fecha_desde || fecha_hasta) {
      where.fechaDeteccion = {};
      if (fecha_desde) {
        where.fechaDeteccion.gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        where.fechaDeteccion.lte = new Date(fecha_hasta);
      }
    }

    const [brechas, total] = await Promise.all([
      prisma.brecha.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
      }),
      prisma.brecha.count({ where }),
    ]);

    return {
      data: brechas,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBrechaById(id: string): Promise<any> {
    const brecha = await prisma.brecha.findFirst({
      where: { id, deletedAt: null },
    });

    if (!brecha) {
      throw new ServiceException('BRECHA_NOT_FOUND', 'Brecha no encontrada', 404);
    }

    return brecha;
  }

  async createBrecha(input: CreateBrechaInput): Promise<any> {
    const brecha = await prisma.brecha.create({
      data: {
        ...input,
        fechaDeteccion: new Date(input.fechaDeteccion),
      } as any,
    });
    return brecha;
  }

  async updateBrecha(id: string, input: UpdateBrechaInput): Promise<any> {
    const existingBrecha = await prisma.brecha.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingBrecha) {
      throw new ServiceException('BRECHA_NOT_FOUND', 'Brecha no encontrada', 404);
    }

    const updateData: any = { ...input };
    if (input.fechaDeteccion) {
      updateData.fechaDeteccion = new Date(input.fechaDeteccion as string);
    }
    if (input.fechaNotificacionAepd) {
      updateData.fechaNotificacionAepd = new Date(input.fechaNotificacionAepd as string);
    }

    const brecha = await prisma.brecha.update({
      where: { id },
      data: updateData as any,
    });
    return brecha;
  }

  async deleteBrecha(id: string): Promise<void> {
    const existingBrecha = await prisma.brecha.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingBrecha) {
      throw new ServiceException('BRECHA_NOT_FOUND', 'Brecha no encontrada', 404);
    }

    await prisma.brecha.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getBrechasActivas(): Promise<any[]> {
    const brechas = await prisma.brecha.findMany({
      where: {
        deletedAt: null,
        estado: { in: ['DETECTADA', 'INVESTIGANDO', 'CONTENIDA', 'NOTIFICADA'] },
      },
      orderBy: { fechaDeteccion: 'desc' },
    });

    return brechas;
  }

  async getEstadisticasLopdgdd(): Promise<any> {
    const [
      totalConsentimientos,
      consentimientosPorTipo,
      consentimientosActivos,
      totalDerechos,
      derechosPendientes,
      derechosPorTipo,
      derechosPorEstado,
      totalBrechas,
      brechasActivas,
    ] = await Promise.all([
      prisma.consentimiento.count({
        where: { deletedAt: null },
      }),
      prisma.consentimiento.groupBy({
        by: ['tipo'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.consentimiento.count({
        where: { deletedAt: null, granted: true },
      }),
      prisma.derechoARCO.count({
        where: { deletedAt: null },
      }),
      prisma.derechoARCO.count({
        where: { deletedAt: null, estado: { in: ['PENDIENTE', 'EN_PROCESO'] } },
      }),
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
      prisma.brecha.count({
        where: { deletedAt: null },
      }),
      prisma.brecha.count({
        where: { deletedAt: null, estado: { not: 'CERRADA' } },
      }),
    ]);

    return {
      consentimientos: {
        total: totalConsentimientos,
        porTipo: consentimientosPorTipo,
        activos: consentimientosActivos,
      },
      derechosARCO: {
        total: totalDerechos,
        pendientes: derechosPendientes,
        porTipo: derechosPorTipo,
        porEstado: derechosPorEstado,
      },
      brechas: {
        total: totalBrechas,
        activas: brechasActivas,
      },
    };
  }
}

export const lopdgddService = new LopdgddService();
