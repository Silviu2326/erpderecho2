import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';

export interface CreateEventoInput {
  titulo: string;
  descripcion?: string;
  fechaInicio: Date | string;
  fechaFin?: Date | string;
  tipo: string;
  expedienteId?: string;
}

export interface UpdateEventoInput {
  titulo?: string;
  descripcion?: string;
  fechaInicio?: Date | string;
  fechaFin?: Date | string;
  tipo?: string;
  expedienteId?: string;
}

export interface CreateTurnoInput {
  fecha: Date | string;
  tipo: string;
  centro?: string;
}

export interface UpdateTurnoInput {
  fecha?: Date | string;
  estado?: string;
  tipo?: string;
  centro?: string;
}

export interface CreateGuardiaInput {
  fechaInicio: Date | string;
  fechaFin: Date | string;
  tipo: string;
  centro?: string;
}

export interface UpdateGuardiaInput {
  fechaInicio?: Date | string;
  fechaFin?: Date | string;
  tipo?: string;
  centro?: string;
}

export interface CreateLiquidacionInput {
  importe: number;
  turnoId: string;
}

export interface QueryEventoParams extends PaginationParams {
  tipo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  expediente_id?: string;
}

export interface QueryTurnoParams extends PaginationParams {
  estado?: string;
  tipo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface QueryGuardiaParams extends PaginationParams {
  tipo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

class CalendarioService {
  async findAllEventos(params: QueryEventoParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'fechaInicio', order = 'asc', tipo, fecha_desde, fecha_hasta, expediente_id } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (tipo) {
      where.tipo = tipo;
    }

    if (expediente_id) {
      where.expedienteId = expediente_id;
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
        include: {
          expediente: {
            select: {
              id: true,
              numeroExpediente: true,
              tipo: true,
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
      prisma.evento.count({ where }),
    ]);

    return {
      data: eventos,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findEventoById(id: string): Promise<any> {
    const evento = await prisma.evento.findFirst({
      where: { id, deletedAt: null },
      include: {
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            tipo: true,
            cliente: {
              select: { id: true, nombre: true },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
          },
        },
      },
    });

    if (!evento) {
      throw new ServiceException('EVENTO_NOT_FOUND', 'Evento no encontrado', 404);
    }

    return evento;
  }

  async createEvento(usuarioId: string, input: CreateEventoInput): Promise<any> {
    const evento = await prisma.evento.create({
      data: {
        ...input,
        fechaInicio: new Date(input.fechaInicio),
        fechaFin: input.fechaFin ? new Date(input.fechaFin as string) : undefined,
        usuarioId,
      } as any,
    });
    return evento;
  }

  async updateEvento(id: string, input: UpdateEventoInput): Promise<any> {
    const existingEvento = await prisma.evento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingEvento) {
      throw new ServiceException('EVENTO_NOT_FOUND', 'Evento no encontrado', 404);
    }

    const updateData: any = { ...input };
    if (input.fechaInicio) {
      updateData.fechaInicio = new Date(input.fechaInicio);
    }
    if (input.fechaFin) {
      updateData.fechaFin = new Date(input.fechaFin as string);
    }

    const evento = await prisma.evento.update({
      where: { id },
      data: updateData,
    });
    return evento;
  }

  async deleteEvento(id: string): Promise<void> {
    const existingEvento = await prisma.evento.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingEvento) {
      throw new ServiceException('EVENTO_NOT_FOUND', 'Evento no encontrado', 404);
    }

    await prisma.evento.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getEventosMes(mes: number, anio: number, usuarioId?: string): Promise<any[]> {
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const where: any = {
      deletedAt: null,
      fechaInicio: { gte: fechaInicio, lte: fechaFin },
    };

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    const eventos = await prisma.evento.findMany({
      where,
      orderBy: { fechaInicio: 'asc' },
      include: {
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
          },
        },
      },
    });

    return eventos.map(e => ({
      id: e.id,
      title: e.titulo,
      start: e.fechaInicio,
      end: e.fechaFin,
      tipo: e.tipo,
      descripcion: e.descripcion,
      expediente: e.expediente,
    }));
  }

  async findAllTurnos(params: QueryTurnoParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'fecha', order = 'asc', estado, tipo, fecha_desde, fecha_hasta } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (estado) {
      where.estado = estado;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (fecha_desde || fecha_hasta) {
      where.fecha = {};
      if (fecha_desde) {
        where.fecha.gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        where.fecha.lte = new Date(fecha_hasta);
      }
    }

    const [turnos, total] = await Promise.all([
      prisma.turno.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido1: true },
          },
          liquidaciones: { where: { deletedAt: null } },
        },
      }),
      prisma.turno.count({ where }),
    ]);

    return {
      data: turnos,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findTurnoById(id: string): Promise<any> {
    const turno = await prisma.turno.findFirst({
      where: { id, deletedAt: null },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido1: true, apellido2: true, telefono: true },
        },
        liquidaciones: { where: { deletedAt: null } },
      },
    });

    if (!turno) {
      throw new ServiceException('TURNO_NOT_FOUND', 'Turno no encontrado', 404);
    }

    return turno;
  }

  async createTurno(usuarioId: string, input: CreateTurnoInput): Promise<any> {
    const turno = await prisma.turno.create({
      data: {
        ...input,
        fecha: new Date(input.fecha),
        usuarioId,
      } as any,
    });
    return turno;
  }

  async updateTurno(id: string, input: UpdateTurnoInput): Promise<any> {
    const existingTurno = await prisma.turno.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingTurno) {
      throw new ServiceException('TURNO_NOT_FOUND', 'Turno no encontrado', 404);
    }

    const updateData: any = { ...input };
    if (input.fecha) {
      updateData.fecha = new Date(input.fecha);
    }

    const turno = await prisma.turno.update({
      where: { id },
      data: updateData,
    });
    return turno;
  }

  async deleteTurno(id: string): Promise<void> {
    const existingTurno = await prisma.turno.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingTurno) {
      throw new ServiceException('TURNO_NOT_FOUND', 'Turno no encontrado', 404);
    }

    await prisma.turno.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAllGuardias(params: QueryGuardiaParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'fechaInicio', order = 'asc', tipo, fecha_desde, fecha_hasta } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

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

    const [guardias, total] = await Promise.all([
      prisma.guardia.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido1: true },
          },
        },
      }),
      prisma.guardia.count({ where }),
    ]);

    return {
      data: guardias,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createGuardia(usuarioId: string, input: CreateGuardiaInput): Promise<any> {
    const guardia = await prisma.guardia.create({
      data: {
        ...input,
        fechaInicio: new Date(input.fechaInicio),
        fechaFin: new Date(input.fechaFin),
        usuarioId,
      } as any,
    });
    return guardia;
  }

  async deleteGuardia(id: string): Promise<void> {
    const existingGuardia = await prisma.guardia.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingGuardia) {
      throw new ServiceException('GUARDIA_NOT_FOUND', 'Guardia no encontrada', 404);
    }

    await prisma.guardia.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async createLiquidacion(input: CreateLiquidacionInput): Promise<any> {
    const { importe, turnoId } = input;

    const turno = await prisma.turno.findFirst({
      where: { id: turnoId, deletedAt: null },
    });

    if (!turno) {
      throw new ServiceException('TURNO_NOT_FOUND', 'Turno no encontrado', 404);
    }

    const liquidacion = await prisma.liquidacion.create({
      data: {
        importe,
        turnoId,
      },
    });
    return liquidacion;
  }

  async getEstadisticas(usuarioId: string, anio: number): Promise<any> {
    const fechaInicio = new Date(anio, 0, 1);
    const fechaFin = new Date(anio, 11, 31, 23, 59, 59);

    const [totalTurnos, totalGuardias, liquidaciones] = await Promise.all([
      prisma.turno.count({
        where: { usuarioId, deletedAt: null, fecha: { gte: fechaInicio, lte: fechaFin } },
      }),
      prisma.guardia.count({
        where: { usuarioId, deletedAt: null, fechaInicio: { gte: fechaInicio, lte: fechaFin } },
      }),
      prisma.liquidacion.aggregate({
        where: {
          deletedAt: null,
          turno: { usuarioId, deletedAt: null, fecha: { gte: fechaInicio, lte: fechaFin } },
        },
        _sum: { importe: true },
      }),
    ]);

    return {
      totalTurnos,
      totalGuardias,
      totalLiquidado: liquidaciones._sum.importe || 0,
      anio,
    };
  }
}

export const calendarioService = new CalendarioService();
