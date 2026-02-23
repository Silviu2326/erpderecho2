"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lopdgddService = void 0;
const database_1 = require("../config/database");
const base_types_1 = require("./base.types");
class LopdgddService {
    async findAllConsentimientos(params) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', cliente_id, tipo, granted } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
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
            database_1.prisma.consentimiento.findMany({
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
            database_1.prisma.consentimiento.count({ where }),
        ]);
        return {
            data: consentimientos,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findConsentimientoById(id) {
        const consentimiento = await database_1.prisma.consentimiento.findFirst({
            where: { id, deletedAt: null },
            include: {
                cliente: true,
            },
        });
        if (!consentimiento) {
            throw new base_types_1.ServiceException('CONSENTIMIENTO_NOT_FOUND', 'Consentimiento no encontrado', 404);
        }
        return consentimiento;
    }
    async createConsentimiento(input) {
        const existingCliente = await database_1.prisma.cliente.findFirst({
            where: { id: input.clienteId, deletedAt: null },
        });
        if (!existingCliente) {
            throw new base_types_1.ServiceException('CLIENTE_NOT_FOUND', 'Cliente no encontrado', 404);
        }
        const consentimiento = await database_1.prisma.consentimiento.create({
            data: {
                ...input,
                fechaConsentimiento: new Date(input.fechaConsentimiento),
            },
        });
        return consentimiento;
    }
    async updateConsentimiento(id, input) {
        const existingConsentimiento = await database_1.prisma.consentimiento.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingConsentimiento) {
            throw new base_types_1.ServiceException('CONSENTIMIENTO_NOT_FOUND', 'Consentimiento no encontrado', 404);
        }
        const updateData = { ...input };
        if (input.fechaConsentimiento) {
            updateData.fechaConsentimiento = new Date(input.fechaConsentimiento);
        }
        const consentimiento = await database_1.prisma.consentimiento.update({
            where: { id },
            data: updateData,
        });
        return consentimiento;
    }
    async deleteConsentimiento(id) {
        const existingConsentimiento = await database_1.prisma.consentimiento.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingConsentimiento) {
            throw new base_types_1.ServiceException('CONSENTIMIENTO_NOT_FOUND', 'Consentimiento no encontrado', 404);
        }
        await database_1.prisma.consentimiento.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getConsentimientosCliente(clienteId) {
        const consentimientos = await database_1.prisma.consentimiento.findMany({
            where: { clienteId, deletedAt: null },
            orderBy: { fechaConsentimiento: 'desc' },
        });
        return consentimientos;
    }
    async findAllDerechosARCO(params) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', cliente_id, tipo, estado } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
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
            database_1.prisma.derechoARCO.findMany({
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
            database_1.prisma.derechoARCO.count({ where }),
        ]);
        return {
            data: derechos,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findDerechoARCOById(id) {
        const derecho = await database_1.prisma.derechoARCO.findFirst({
            where: { id, deletedAt: null },
            include: {
                cliente: true,
            },
        });
        if (!derecho) {
            throw new base_types_1.ServiceException('DERECHO_ARCO_NOT_FOUND', 'Derecho ARCO no encontrado', 404);
        }
        return derecho;
    }
    async createDerechoARCO(input) {
        const existingCliente = await database_1.prisma.cliente.findFirst({
            where: { id: input.clienteId, deletedAt: null },
        });
        if (!existingCliente) {
            throw new base_types_1.ServiceException('CLIENTE_NOT_FOUND', 'Cliente no encontrado', 404);
        }
        const derecho = await database_1.prisma.derechoARCO.create({
            data: {
                ...input,
                fechaSolicitud: new Date(input.fechaSolicitud),
            },
        });
        return derecho;
    }
    async updateDerechoARCO(id, input) {
        const existingDerecho = await database_1.prisma.derechoARCO.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingDerecho) {
            throw new base_types_1.ServiceException('DERECHO_ARCO_NOT_FOUND', 'Derecho ARCO no encontrado', 404);
        }
        const updateData = { ...input };
        if (input.fechaSolicitud) {
            updateData.fechaSolicitud = new Date(input.fechaSolicitud);
        }
        if (input.fechaRespuesta) {
            updateData.fechaRespuesta = new Date(input.fechaRespuesta);
        }
        const derecho = await database_1.prisma.derechoARCO.update({
            where: { id },
            data: updateData,
        });
        return derecho;
    }
    async deleteDerechoARCO(id) {
        const existingDerecho = await database_1.prisma.derechoARCO.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingDerecho) {
            throw new base_types_1.ServiceException('DERECHO_ARCO_NOT_FOUND', 'Derecho ARCO no encontrado', 404);
        }
        await database_1.prisma.derechoARCO.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getDerechosPendientes() {
        const derechos = await database_1.prisma.derechoARCO.findMany({
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
    async findAllBrechas(params) {
        const { page = 1, limit = 20, sort = 'fechaDeteccion', order = 'desc', estado, fecha_desde, fecha_hasta } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
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
            database_1.prisma.brecha.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
            }),
            database_1.prisma.brecha.count({ where }),
        ]);
        return {
            data: brechas,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findBrechaById(id) {
        const brecha = await database_1.prisma.brecha.findFirst({
            where: { id, deletedAt: null },
        });
        if (!brecha) {
            throw new base_types_1.ServiceException('BRECHA_NOT_FOUND', 'Brecha no encontrada', 404);
        }
        return brecha;
    }
    async createBrecha(input) {
        const brecha = await database_1.prisma.brecha.create({
            data: {
                ...input,
                fechaDeteccion: new Date(input.fechaDeteccion),
            },
        });
        return brecha;
    }
    async updateBrecha(id, input) {
        const existingBrecha = await database_1.prisma.brecha.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingBrecha) {
            throw new base_types_1.ServiceException('BRECHA_NOT_FOUND', 'Brecha no encontrada', 404);
        }
        const updateData = { ...input };
        if (input.fechaDeteccion) {
            updateData.fechaDeteccion = new Date(input.fechaDeteccion);
        }
        if (input.fechaNotificacionAepd) {
            updateData.fechaNotificacionAepd = new Date(input.fechaNotificacionAepd);
        }
        const brecha = await database_1.prisma.brecha.update({
            where: { id },
            data: updateData,
        });
        return brecha;
    }
    async deleteBrecha(id) {
        const existingBrecha = await database_1.prisma.brecha.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingBrecha) {
            throw new base_types_1.ServiceException('BRECHA_NOT_FOUND', 'Brecha no encontrada', 404);
        }
        await database_1.prisma.brecha.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getBrechasActivas() {
        const brechas = await database_1.prisma.brecha.findMany({
            where: {
                deletedAt: null,
                estado: { in: ['DETECTADA', 'INVESTIGANDO', 'CONTENIDA', 'NOTIFICADA'] },
            },
            orderBy: { fechaDeteccion: 'desc' },
        });
        return brechas;
    }
    async getEstadisticasLopdgdd() {
        const [totalConsentimientos, consentimientosPorTipo, consentimientosActivos, totalDerechos, derechosPendientes, derechosPorTipo, derechosPorEstado, totalBrechas, brechasActivas,] = await Promise.all([
            database_1.prisma.consentimiento.count({
                where: { deletedAt: null },
            }),
            database_1.prisma.consentimiento.groupBy({
                by: ['tipo'],
                where: { deletedAt: null },
                _count: true,
            }),
            database_1.prisma.consentimiento.count({
                where: { deletedAt: null, granted: true },
            }),
            database_1.prisma.derechoARCO.count({
                where: { deletedAt: null },
            }),
            database_1.prisma.derechoARCO.count({
                where: { deletedAt: null, estado: { in: ['PENDIENTE', 'EN_PROCESO'] } },
            }),
            database_1.prisma.derechoARCO.groupBy({
                by: ['tipo'],
                where: { deletedAt: null },
                _count: true,
            }),
            database_1.prisma.derechoARCO.groupBy({
                by: ['estado'],
                where: { deletedAt: null },
                _count: true,
            }),
            database_1.prisma.brecha.count({
                where: { deletedAt: null },
            }),
            database_1.prisma.brecha.count({
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
exports.lopdgddService = new LopdgddService();
//# sourceMappingURL=lopdgdd.service.js.map