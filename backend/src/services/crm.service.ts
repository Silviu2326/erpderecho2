import { prisma } from '../config/database';
import { ServiceException, PaginationParams, PaginatedResult } from './base.types';

export interface CreateLeadInput {
  nombre: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  origen?: string;
  estado?: string;
  probabilidad?: number;
  expectedRevenue?: number;
}

export interface UpdateLeadInput {
  nombre?: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  origen?: string;
  estado?: string;
  probabilidad?: number;
  expectedRevenue?: number;
  clienteId?: string;
}

export interface CreateOportunidadInput {
  titulo: string;
  estado?: string;
  probabilidad?: number;
  importe?: number;
  etapa?: string;
  leadId?: string;
}

export interface UpdateOportunidadInput {
  titulo?: string;
  estado?: string;
  probabilidad?: number;
  importe?: number;
  etapa?: string;
}

export interface CreateActividadInput {
  tipo: string;
  descripcion?: string;
  fecha: Date | string;
  completada?: boolean;
  oportunidadId?: string;
}

export interface UpdateActividadInput {
  tipo?: string;
  descripcion?: string;
  fecha?: Date | string;
  completada?: boolean;
}

export interface QueryLeadParams extends PaginationParams {
  estado?: string;
  origen?: string;
  cliente_id?: string;
}

export interface QueryOportunidadParams extends PaginationParams {
  etapa?: string;
  estado?: string;
  lead_id?: string;
}

export interface QueryActividadParams extends PaginationParams {
  oportunidad_id?: string;
  tipo?: string;
  completada?: boolean;
}

export interface PipelineStage {
  etapa: string;
  total: number;
  valor: number;
  oportunidades: any[];
}

class CrmService {
  async findAllLeads(params: QueryLeadParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', estado, origen, cliente_id } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (estado) {
      where.estado = estado;
    }

    if (origen) {
      where.origen = origen;
    }

    if (cliente_id) {
      where.clienteId = cliente_id;
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          cliente: {
            select: { id: true, nombre: true, email: true },
          },
          usuario: {
            select: { id: true, nombre: true, apellido1: true },
          },
          oportunidades: { where: { deletedAt: null } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findLeadById(id: string): Promise<any> {
    const lead = await prisma.lead.findFirst({
      where: { id, deletedAt: null },
      include: {
        cliente: true,
        usuario: {
          select: { id: true, nombre: true, apellido1: true, email: true },
        },
        oportunidades: {
          where: { deletedAt: null },
          include: {
            actividades: { where: { deletedAt: null }, orderBy: { fecha: 'desc' } },
          },
        },
      },
    });

    if (!lead) {
      throw new ServiceException('LEAD_NOT_FOUND', 'Lead no encontrado', 404);
    }

    return lead;
  }

  async createLead(usuarioId: string, input: CreateLeadInput): Promise<any> {
    const lead = await prisma.lead.create({
      data: {
        ...input,
        usuarioId,
      } as any,
    });
    return lead;
  }

  async updateLead(id: string, input: UpdateLeadInput): Promise<any> {
    const existingLead = await prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingLead) {
      throw new ServiceException('LEAD_NOT_FOUND', 'Lead no encontrado', 404);
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: input as any,
    });
    return lead;
  }

  async deleteLead(id: string): Promise<void> {
    const existingLead = await prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingLead) {
      throw new ServiceException('LEAD_NOT_FOUND', 'Lead no encontrado', 404);
    }

    await prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async convertLeadToCliente(id: string): Promise<any> {
    const lead = await prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });

    if (!lead) {
      throw new ServiceException('LEAD_NOT_FOUND', 'Lead no encontrado', 404);
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre: lead.nombre,
        email: lead.email,
        telefono: lead.telefono,
      },
    });

    await prisma.lead.update({
      where: { id },
      data: { 
        clienteId: cliente.id,
        estado: 'CONVERTIDO',
      },
    });

    return cliente;
  }

  async findAllOportunidades(params: QueryOportunidadParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', etapa, estado, lead_id } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (etapa) {
      where.etapa = etapa;
    }

    if (estado) {
      where.estado = estado;
    }

    if (lead_id) {
      where.leadId = lead_id;
    }

    const [oportunidades, total] = await Promise.all([
      prisma.oportunidad.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          lead: {
            select: { id: true, nombre: true, email: true },
          },
          usuario: {
            select: { id: true, nombre: true, apellido1: true },
          },
          actividades: { where: { deletedAt: null } },
        },
      }),
      prisma.oportunidad.count({ where }),
    ]);

    return {
      data: oportunidades,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOportunidadById(id: string): Promise<any> {
    const oportunidad = await prisma.oportunidad.findFirst({
      where: { id, deletedAt: null },
      include: {
        lead: true,
        usuario: {
          select: { id: true, nombre: true, apellido1: true, email: true },
        },
        actividades: {
          where: { deletedAt: null },
          orderBy: { fecha: 'desc' },
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido1: true },
            },
          },
        },
        notas: { where: { deletedAt: null } },
      },
    });

    if (!oportunidad) {
      throw new ServiceException('OPORTUNIDAD_NOT_FOUND', 'Oportunidad no encontrada', 404);
    }

    return oportunidad;
  }

  async createOportunidad(usuarioId: string, input: CreateOportunidadInput): Promise<any> {
    const oportunidad = await prisma.oportunidad.create({
      data: {
        ...input,
        usuarioId,
      } as any,
    });
    return oportunidad;
  }

  async updateOportunidad(id: string, input: UpdateOportunidadInput): Promise<any> {
    const existingOportunidad = await prisma.oportunidad.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingOportunidad) {
      throw new ServiceException('OPORTUNIDAD_NOT_FOUND', 'Oportunidad no encontrada', 404);
    }

    const oportunidad = await prisma.oportunidad.update({
      where: { id },
      data: input as any,
    });
    return oportunidad;
  }

  async deleteOportunidad(id: string): Promise<void> {
    const existingOportunidad = await prisma.oportunidad.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingOportunidad) {
      throw new ServiceException('OPORTUNIDAD_NOT_FOUND', 'Oportunidad no encontrada', 404);
    }

    await prisma.oportunidad.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getPipeline(usuarioId?: string): Promise<PipelineStage[]> {
    const etapas = ['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE'];
    
    const where: any = { deletedAt: null };
    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    const oportunidades = await prisma.oportunidad.findMany({
      where,
      include: {
        lead: {
          select: { id: true, nombre: true },
        },
      },
    });

    const pipeline: PipelineStage[] = etapas.map(etapa => {
      const filtered = oportunidades.filter(o => o.etapa === etapa);
      return {
        etapa,
        total: filtered.length,
        valor: filtered.reduce((sum, o) => sum + o.importe, 0),
        oportunidades: filtered,
      };
    });

    return pipeline;
  }

  async findAllActividades(params: QueryActividadParams): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sort = 'fecha', order = 'desc', oportunidad_id, tipo, completada } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (oportunidad_id) {
      where.oportunidadId = oportunidad_id;
    }

    if (tipo) {
      where.tipo = tipo;
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
            select: { id: true, titulo: true, etapa: true },
          },
          usuario: {
            select: { id: true, nombre: true, apellido1: true },
          },
        },
      }),
      prisma.actividad.count({ where }),
    ]);

    return {
      data: actividades,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findActividadById(id: string): Promise<any> {
    const actividad = await prisma.actividad.findFirst({
      where: { id, deletedAt: null },
      include: {
        oportunidad: true,
        usuario: {
          select: { id: true, nombre: true, apellido1: true, email: true },
        },
      },
    });

    if (!actividad) {
      throw new ServiceException('ACTIVIDAD_NOT_FOUND', 'Actividad no encontrada', 404);
    }

    return actividad;
  }

  async createActividad(usuarioId: string, input: CreateActividadInput): Promise<any> {
    const actividad = await prisma.actividad.create({
      data: {
        ...input,
        fecha: new Date(input.fecha),
        usuarioId,
      } as any,
    });
    return actividad;
  }

  async updateActividad(id: string, input: UpdateActividadInput): Promise<any> {
    const existingActividad = await prisma.actividad.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingActividad) {
      throw new ServiceException('ACTIVIDAD_NOT_FOUND', 'Actividad no encontrada', 404);
    }

    const updateData: any = { ...input };
    if (input.fecha) {
      updateData.fecha = new Date(input.fecha as string);
    }

    const actividad = await prisma.actividad.update({
      where: { id },
      data: updateData as any,
    });
    return actividad;
  }

  async deleteActividad(id: string): Promise<void> {
    const existingActividad = await prisma.actividad.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingActividad) {
      throw new ServiceException('ACTIVIDAD_NOT_FOUND', 'Actividad no encontrada', 404);
    }

    await prisma.actividad.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getActividadesPendientes(usuarioId: string): Promise<any[]> {
    const actividades = await prisma.actividad.findMany({
      where: {
        deletedAt: null,
        completada: false,
        usuarioId,
        fecha: { gte: new Date() },
      },
      orderBy: { fecha: 'asc' },
      include: {
        oportunidad: {
          select: { id: true, titulo: true, etapa: true },
        },
      },
    });

    return actividades;
  }

  async getEstadisticasCrm(usuarioId: string): Promise<any> {
    const [
      totalLeads,
      leadsPorEstado,
      totalOportunidades,
      oportunidadesPorEtapa,
      actividadesCompletadas,
      actividadesPendientes,
    ] = await Promise.all([
      prisma.lead.count({
        where: { usuarioId, deletedAt: null },
      }),
      prisma.lead.groupBy({
        by: ['estado'],
        where: { usuarioId, deletedAt: null },
        _count: true,
      }),
      prisma.oportunidad.count({
        where: { usuarioId, deletedAt: null },
      }),
      prisma.oportunidad.groupBy({
        by: ['etapa'],
        where: { usuarioId, deletedAt: null },
        _count: true,
        _sum: { importe: true },
      }),
      prisma.actividad.count({
        where: { 
          usuarioId, 
          deletedAt: null, 
          completada: true,
          fecha: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
        },
      }),
      prisma.actividad.count({
        where: { 
          usuarioId, 
          deletedAt: null, 
          completada: false,
        },
      }),
    ]);

    return {
      totalLeads,
      leadsPorEstado,
      totalOportunidades,
      oportunidadesPorEtapa,
      actividadesCompletadas,
      actividadesPendientes,
    };
  }
}

export const crmService = new CrmService();
