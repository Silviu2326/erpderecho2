"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarioService = void 0;
const database_1 = require("../config/database");
const base_types_1 = require("./base.types");
class CalendarioService {
    async findAllEventos(params) {
        const { page = 1, limit = 20, sort = 'fechaInicio', order = 'asc', tipo, fecha_desde, fecha_hasta, expediente_id } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
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
            database_1.prisma.evento.findMany({
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
            database_1.prisma.evento.count({ where }),
        ]);
        return {
            data: eventos,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findEventoById(id) {
        const evento = await database_1.prisma.evento.findFirst({
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
            throw new base_types_1.ServiceException('EVENTO_NOT_FOUND', 'Evento no encontrado', 404);
        }
        return evento;
    }
    async createEvento(usuarioId, input) {
        const evento = await database_1.prisma.evento.create({
            data: {
                ...input,
                fechaInicio: new Date(input.fechaInicio),
                fechaFin: input.fechaFin ? new Date(input.fechaFin) : undefined,
                usuarioId,
            },
        });
        return evento;
    }
    async updateEvento(id, input) {
        const existingEvento = await database_1.prisma.evento.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingEvento) {
            throw new base_types_1.ServiceException('EVENTO_NOT_FOUND', 'Evento no encontrado', 404);
        }
        const updateData = { ...input };
        if (input.fechaInicio) {
            updateData.fechaInicio = new Date(input.fechaInicio);
        }
        if (input.fechaFin) {
            updateData.fechaFin = new Date(input.fechaFin);
        }
        const evento = await database_1.prisma.evento.update({
            where: { id },
            data: updateData,
        });
        return evento;
    }
    async deleteEvento(id) {
        const existingEvento = await database_1.prisma.evento.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingEvento) {
            throw new base_types_1.ServiceException('EVENTO_NOT_FOUND', 'Evento no encontrado', 404);
        }
        await database_1.prisma.evento.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getEventosMes(mes, anio, usuarioId) {
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0, 23, 59, 59);
        const where = {
            deletedAt: null,
            fechaInicio: { gte: fechaInicio, lte: fechaFin },
        };
        if (usuarioId) {
            where.usuarioId = usuarioId;
        }
        const eventos = await database_1.prisma.evento.findMany({
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
    async findAllTurnos(params) {
        const { page = 1, limit = 20, sort = 'fecha', order = 'asc', estado, tipo, fecha_desde, fecha_hasta } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
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
            database_1.prisma.turno.findMany({
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
            database_1.prisma.turno.count({ where }),
        ]);
        return {
            data: turnos,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findTurnoById(id) {
        const turno = await database_1.prisma.turno.findFirst({
            where: { id, deletedAt: null },
            include: {
                usuario: {
                    select: { id: true, nombre: true, apellido1: true, apellido2: true, telefono: true },
                },
                liquidaciones: { where: { deletedAt: null } },
            },
        });
        if (!turno) {
            throw new base_types_1.ServiceException('TURNO_NOT_FOUND', 'Turno no encontrado', 404);
        }
        return turno;
    }
    async createTurno(usuarioId, input) {
        const turno = await database_1.prisma.turno.create({
            data: {
                ...input,
                fecha: new Date(input.fecha),
                usuarioId,
            },
        });
        return turno;
    }
    async updateTurno(id, input) {
        const existingTurno = await database_1.prisma.turno.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingTurno) {
            throw new base_types_1.ServiceException('TURNO_NOT_FOUND', 'Turno no encontrado', 404);
        }
        const updateData = { ...input };
        if (input.fecha) {
            updateData.fecha = new Date(input.fecha);
        }
        const turno = await database_1.prisma.turno.update({
            where: { id },
            data: updateData,
        });
        return turno;
    }
    async deleteTurno(id) {
        const existingTurno = await database_1.prisma.turno.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingTurno) {
            throw new base_types_1.ServiceException('TURNO_NOT_FOUND', 'Turno no encontrado', 404);
        }
        await database_1.prisma.turno.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async findAllGuardias(params) {
        const { page = 1, limit = 20, sort = 'fechaInicio', order = 'asc', tipo, fecha_desde, fecha_hasta } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
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
            database_1.prisma.guardia.findMany({
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
            database_1.prisma.guardia.count({ where }),
        ]);
        return {
            data: guardias,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async createGuardia(usuarioId, input) {
        const guardia = await database_1.prisma.guardia.create({
            data: {
                ...input,
                fechaInicio: new Date(input.fechaInicio),
                fechaFin: new Date(input.fechaFin),
                usuarioId,
            },
        });
        return guardia;
    }
    async deleteGuardia(id) {
        const existingGuardia = await database_1.prisma.guardia.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingGuardia) {
            throw new base_types_1.ServiceException('GUARDIA_NOT_FOUND', 'Guardia no encontrada', 404);
        }
        await database_1.prisma.guardia.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async createLiquidacion(input) {
        const { importe, turnoId } = input;
        const turno = await database_1.prisma.turno.findFirst({
            where: { id: turnoId, deletedAt: null },
        });
        if (!turno) {
            throw new base_types_1.ServiceException('TURNO_NOT_FOUND', 'Turno no encontrado', 404);
        }
        const liquidacion = await database_1.prisma.liquidacion.create({
            data: {
                importe,
                turnoId,
            },
        });
        return liquidacion;
    }
    async getEstadisticas(usuarioId, anio) {
        const fechaInicio = new Date(anio, 0, 1);
        const fechaFin = new Date(anio, 11, 31, 23, 59, 59);
        const [totalTurnos, totalGuardias, liquidaciones] = await Promise.all([
            database_1.prisma.turno.count({
                where: { usuarioId, deletedAt: null, fecha: { gte: fechaInicio, lte: fechaFin } },
            }),
            database_1.prisma.guardia.count({
                where: { usuarioId, deletedAt: null, fechaInicio: { gte: fechaInicio, lte: fechaFin } },
            }),
            database_1.prisma.liquidacion.aggregate({
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
exports.calendarioService = new CalendarioService();
//# sourceMappingURL=calendario.service.js.map