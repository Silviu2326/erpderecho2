import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';

export interface CreateExpedienteInput {
  numeroExpediente: string;
  tipo: string;
  estado?: string;
  descripcion?: string;
  clienteId: string;
  abogadoId?: string;
}

export interface UpdateExpedienteInput {
  numeroExpediente?: string;
  tipo?: string;
  estado?: string;
  descripcion?: string;
  clienteId?: string;
  abogadoId?: string;
}

export interface QueryExpedienteParams extends PaginationParams {
  search?: string;
  estado?: string;
  tipo?: string;
  abogado_id?: string;
  cliente_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface CreateActuacionInput {
  tipo: string;
  descripcion?: string;
  fecha: Date | string;
  documento?: string;
}

const expedienteSelect = {
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
};

class ExpedienteService {
  async findAll(params: QueryExpedienteParams): Promise<PaginatedResult<any>> {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'createdAt', 
      order = 'desc', 
      search, 
      estado, 
      tipo, 
      abogado_id, 
      cliente_id,
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
        select: expedienteSelect,
      }),
      prisma.expediente.count({ where }),
    ]);

    return {
      data: expedientes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<any> {
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
      throw new ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
    }

    return expediente;
  }

  async create(input: CreateExpedienteInput): Promise<any> {
    try {
      const expediente = await prisma.expediente.create({
        data: input as any,
      });
      return expediente;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ServiceException('EXPEDIENTE_EXISTS', 'El número de expediente ya existe', 409);
      }
      throw error;
    }
  }

  async update(id: string, input: UpdateExpedienteInput): Promise<any> {
    const existingExpediente = await prisma.expediente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingExpediente) {
      throw new ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
    }

    try {
      const expediente = await prisma.expediente.update({
        where: { id },
        data: input as any,
      });
      return expediente;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ServiceException('EXPEDIENTE_EXISTS', 'El número de expediente ya existe', 409);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const existingExpediente = await prisma.expediente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingExpediente) {
      throw new ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
    }

    await prisma.expediente.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async search(query: string): Promise<any[]> {
    const expedientes = await prisma.expediente.findMany({
      where: {
        deletedAt: null,
        OR: [
          { numeroExpediente: { contains: query, mode: 'insensitive' } },
          { descripcion: { contains: query, mode: 'insensitive' } },
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

    return expedientes;
  }

  async getCalendario(mes: number, anio: number): Promise<any[]> {
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

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

    return actuaciones.map(act => ({
      id: act.id,
      title: `${act.expediente.numeroExpediente} - ${act.tipo}`,
      date: act.fecha,
      tipo: act.tipo,
      descripcion: act.descripcion,
      expediente: act.expediente,
    }));
  }

  async getActuaciones(expedienteId: string, params: any): Promise<PaginatedResult<any>> {
    const existingExpediente = await prisma.expediente.findFirst({
      where: { id: expedienteId, deletedAt: null },
    });

    if (!existingExpediente) {
      throw new ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
    }

    const { page = 1, limit = 20, sort = 'fecha', order = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [actuaciones, total] = await Promise.all([
      prisma.actuacion.findMany({
        where: { expedienteId, deletedAt: null },
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
      prisma.actuacion.count({ where: { expedienteId, deletedAt: null } }),
    ]);

    return {
      data: actuaciones,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createActuacion(expedienteId: string, usuarioId: string, input: CreateActuacionInput): Promise<any> {
    const existingExpediente = await prisma.expediente.findFirst({
      where: { id: expedienteId, deletedAt: null },
    });

    if (!existingExpediente) {
      throw new ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
    }

    const actuacion = await prisma.actuacion.create({
      data: {
        ...input,
        fecha: new Date(input.fecha),
        expedienteId,
        usuarioId,
      } as any,
    });

    return actuacion;
  }

  async getDocumentos(expedienteId: string): Promise<any[]> {
    const existingExpediente = await prisma.expediente.findFirst({
      where: { id: expedienteId, deletedAt: null },
    });

    if (!existingExpediente) {
      throw new ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
    }

    return [];
  }
}

export const expedienteService = new ExpedienteService();
