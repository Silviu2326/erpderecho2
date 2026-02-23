"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crmService = void 0;
const database_1 = require("../config/database");
const base_types_1 = require("./base.types");
class CrmService {
    async findAllLeads(params) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', estado, origen, cliente_id } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
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
            database_1.prisma.lead.findMany({
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
            database_1.prisma.lead.count({ where }),
        ]);
        return {
            data: leads,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findLeadById(id) {
        const lead = await database_1.prisma.lead.findFirst({
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
            throw new base_types_1.ServiceException('LEAD_NOT_FOUND', 'Lead no encontrado', 404);
        }
        return lead;
    }
    async createLead(usuarioId, input) {
        const lead = await database_1.prisma.lead.create({
            data: {
                ...input,
                usuarioId,
            },
        });
        return lead;
    }
    async updateLead(id, input) {
        const existingLead = await database_1.prisma.lead.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingLead) {
            throw new base_types_1.ServiceException('LEAD_NOT_FOUND', 'Lead no encontrado', 404);
        }
        const lead = await database_1.prisma.lead.update({
            where: { id },
            data: input,
        });
        return lead;
    }
    async deleteLead(id) {
        const existingLead = await database_1.prisma.lead.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingLead) {
            throw new base_types_1.ServiceException('LEAD_NOT_FOUND', 'Lead no encontrado', 404);
        }
        await database_1.prisma.lead.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async convertLeadToCliente(id) {
        const lead = await database_1.prisma.lead.findFirst({
            where: { id, deletedAt: null },
        });
        if (!lead) {
            throw new base_types_1.ServiceException('LEAD_NOT_FOUND', 'Lead no encontrado', 404);
        }
        const cliente = await database_1.prisma.cliente.create({
            data: {
                nombre: lead.nombre,
                email: lead.email,
                telefono: lead.telefono,
            },
        });
        await database_1.prisma.lead.update({
            where: { id },
            data: {
                clienteId: cliente.id,
                estado: 'CONVERTIDO',
            },
        });
        return cliente;
    }
    async findAllOportunidades(params) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', etapa, estado, lead_id } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
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
            database_1.prisma.oportunidad.findMany({
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
            database_1.prisma.oportunidad.count({ where }),
        ]);
        return {
            data: oportunidades,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOportunidadById(id) {
        const oportunidad = await database_1.prisma.oportunidad.findFirst({
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
            throw new base_types_1.ServiceException('OPORTUNIDAD_NOT_FOUND', 'Oportunidad no encontrada', 404);
        }
        return oportunidad;
    }
    async createOportunidad(usuarioId, input) {
        const oportunidad = await database_1.prisma.oportunidad.create({
            data: {
                ...input,
                usuarioId,
            },
        });
        return oportunidad;
    }
    async updateOportunidad(id, input) {
        const existingOportunidad = await database_1.prisma.oportunidad.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingOportunidad) {
            throw new base_types_1.ServiceException('OPORTUNIDAD_NOT_FOUND', 'Oportunidad no encontrada', 404);
        }
        const oportunidad = await database_1.prisma.oportunidad.update({
            where: { id },
            data: input,
        });
        return oportunidad;
    }
    async deleteOportunidad(id) {
        const existingOportunidad = await database_1.prisma.oportunidad.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingOportunidad) {
            throw new base_types_1.ServiceException('OPORTUNIDAD_NOT_FOUND', 'Oportunidad no encontrada', 404);
        }
        await database_1.prisma.oportunidad.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getPipeline(usuarioId) {
        const etapas = ['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE'];
        const where = { deletedAt: null };
        if (usuarioId) {
            where.usuarioId = usuarioId;
        }
        const oportunidades = await database_1.prisma.oportunidad.findMany({
            where,
            include: {
                lead: {
                    select: { id: true, nombre: true },
                },
            },
        });
        const pipeline = etapas.map(etapa => {
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
    async findAllActividades(params) {
        const { page = 1, limit = 20, sort = 'fecha', order = 'desc', oportunidad_id, tipo, completada } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
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
            database_1.prisma.actividad.findMany({
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
            database_1.prisma.actividad.count({ where }),
        ]);
        return {
            data: actividades,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findActividadById(id) {
        const actividad = await database_1.prisma.actividad.findFirst({
            where: { id, deletedAt: null },
            include: {
                oportunidad: true,
                usuario: {
                    select: { id: true, nombre: true, apellido1: true, email: true },
                },
            },
        });
        if (!actividad) {
            throw new base_types_1.ServiceException('ACTIVIDAD_NOT_FOUND', 'Actividad no encontrada', 404);
        }
        return actividad;
    }
    async createActividad(usuarioId, input) {
        const actividad = await database_1.prisma.actividad.create({
            data: {
                ...input,
                fecha: new Date(input.fecha),
                usuarioId,
            },
        });
        return actividad;
    }
    async updateActividad(id, input) {
        const existingActividad = await database_1.prisma.actividad.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingActividad) {
            throw new base_types_1.ServiceException('ACTIVIDAD_NOT_FOUND', 'Actividad no encontrada', 404);
        }
        const updateData = { ...input };
        if (input.fecha) {
            updateData.fecha = new Date(input.fecha);
        }
        const actividad = await database_1.prisma.actividad.update({
            where: { id },
            data: updateData,
        });
        return actividad;
    }
    async deleteActividad(id) {
        const existingActividad = await database_1.prisma.actividad.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingActividad) {
            throw new base_types_1.ServiceException('ACTIVIDAD_NOT_FOUND', 'Actividad no encontrada', 404);
        }
        await database_1.prisma.actividad.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getActividadesPendientes(usuarioId) {
        const actividades = await database_1.prisma.actividad.findMany({
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
    async getEstadisticasCrm(usuarioId) {
        const [totalLeads, leadsPorEstado, totalOportunidades, oportunidadesPorEtapa, actividadesCompletadas, actividadesPendientes,] = await Promise.all([
            database_1.prisma.lead.count({
                where: { usuarioId, deletedAt: null },
            }),
            database_1.prisma.lead.groupBy({
                by: ['estado'],
                where: { usuarioId, deletedAt: null },
                _count: true,
            }),
            database_1.prisma.oportunidad.count({
                where: { usuarioId, deletedAt: null },
            }),
            database_1.prisma.oportunidad.groupBy({
                by: ['etapa'],
                where: { usuarioId, deletedAt: null },
                _count: true,
                _sum: { importe: true },
            }),
            database_1.prisma.actividad.count({
                where: {
                    usuarioId,
                    deletedAt: null,
                    completada: true,
                    fecha: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
                },
            }),
            database_1.prisma.actividad.count({
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
exports.crmService = new CrmService();
//# sourceMappingURL=crm.service.js.map