"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integracionesService = void 0;
const database_1 = require("../config/database");
const base_types_1 = require("./base.types");
class IntegracionesService {
    async getStatus(usuarioId) {
        const integraciones = await database_1.prisma.integracion.findMany({
            where: { usuarioId, deletedAt: null },
            select: {
                id: true,
                tipo: true,
                accessToken: true,
                refreshToken: true,
                expiresAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return integraciones.map((int) => ({
            id: int.id,
            tipo: int.tipo,
            expiresAt: int.expiresAt,
            daysUntilExpiry: int.expiresAt
                ? Math.ceil((new Date(int.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null,
        }));
    }
    async connect(usuarioId, input) {
        const existingIntegracion = await database_1.prisma.integracion.findFirst({
            where: { usuarioId, tipo: input.tipo, deletedAt: null },
        });
        if (existingIntegracion) {
            const integracion = await database_1.prisma.integracion.update({
                where: { id: existingIntegracion.id },
                data: {
                    accessToken: input.accessToken,
                    refreshToken: input.refreshToken,
                    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
                    connected: true,
                    updatedAt: new Date(),
                },
            });
            return integracion;
        }
        const integracion = await database_1.prisma.integracion.create({
            data: {
                usuarioId,
                tipo: input.tipo,
                accessToken: input.accessToken,
                refreshToken: input.refreshToken,
                expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
                connected: true,
            },
        });
        return integracion;
    }
    async disconnect(usuarioId, tipo) {
        const existingIntegracion = await database_1.prisma.integracion.findFirst({
            where: { usuarioId, tipo: tipo, deletedAt: null },
        });
        if (!existingIntegracion) {
            throw new base_types_1.ServiceException('INTEGRACION_NOT_FOUND', 'Integración no encontrada', 404);
        }
        await database_1.prisma.integracion.update({
            where: { id: existingIntegracion.id },
            data: {
                accessToken: null,
                refreshToken: null,
                expiresAt: null,
                connected: false,
                updatedAt: new Date(),
            },
        });
    }
    async sendEmail(usuarioId, input) {
        const integracion = await database_1.prisma.integracion.findFirst({
            where: { usuarioId, tipo: 'MICROSOFT', deletedAt: null },
        });
        if (!integracion) {
            throw new base_types_1.ServiceException('INTEGRACION_NOT_CONNECTED', 'Microsoft no está conectado', 400);
        }
        if (integracion.expiresAt && new Date(integracion.expiresAt) < new Date()) {
            throw new base_types_1.ServiceException('INTEGRACION_EXPIRED', 'La conexión con Microsoft ha expirado', 401);
        }
        return {
            id: 'mock-email-id',
            status: 'sent',
            message: 'Email enviado correctamente',
        };
    }
    async getEmails(usuarioId, params) {
        const { page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        return {
            data: [],
            meta: {
                page,
                limit,
                total: 0,
                totalPages: 0,
            },
        };
    }
    async createCalendarEvent(usuarioId, input) {
        const integracion = await database_1.prisma.integracion.findFirst({
            where: { usuarioId, tipo: 'MICROSOFT', deletedAt: null },
        });
        if (!integracion) {
            throw new base_types_1.ServiceException('INTEGRACION_NOT_CONNECTED', 'Microsoft no está conectado', 400);
        }
        const evento = await database_1.prisma.evento.create({
            data: {
                usuarioId,
                expedienteId: input.expedienteId,
                titulo: input.title,
                descripcion: input.description,
                fechaInicio: new Date(input.startTime),
                fechaFin: input.endTime ? new Date(input.endTime) : null,
                attendees: input.attendees ? input.attendees.join(',') : null,
                allDay: input.allDay || false,
            },
        });
        return evento;
    }
    async getCalendarEvents(usuarioId, startDate, endDate) {
        const where = { usuarioId, deletedAt: null };
        if (startDate || endDate) {
            where.fechaInicio = {};
            if (startDate) {
                where.fechaInicio.gte = new Date(startDate);
            }
            if (endDate) {
                where.fechaInicio.lte = new Date(endDate);
            }
        }
        return database_1.prisma.evento.findMany({
            where,
            orderBy: { fechaInicio: 'asc' },
            select: {
                id: true,
                titulo: true,
                descripcion: true,
                fechaInicio: true,
                fechaFin: true,
                expedienteId: true,
            },
        });
    }
    async syncCalendar(usuarioId, input) {
        const integracion = await database_1.prisma.integracion.findFirst({
            where: { usuarioId, tipo: 'MICROSOFT', deletedAt: null },
        });
        if (!integracion) {
            throw new base_types_1.ServiceException('INTEGRACION_NOT_CONNECTED', 'Microsoft no está conectado', 400);
        }
        if (integracion.expiresAt && new Date(integracion.expiresAt) < new Date()) {
            throw new base_types_1.ServiceException('INTEGRACION_EXPIRED', 'La conexión con Microsoft ha expirado', 401);
        }
        await database_1.prisma.integracion.update({
            where: { id: integracion.id },
            data: { lastSyncAt: new Date() },
        });
        return {
            synced: true,
            message: 'Calendario sincronizado correctamente',
            syncedAt: new Date(),
        };
    }
    async deleteCalendarEvent(usuarioId, eventId) {
        const existingEvento = await database_1.prisma.evento.findFirst({
            where: { id: eventId, usuarioId, deletedAt: null },
        });
        if (!existingEvento) {
            throw new base_types_1.ServiceException('EVENTO_NOT_FOUND', 'Evento no encontrado', 404);
        }
        await database_1.prisma.evento.update({
            where: { id: eventId },
            data: { deletedAt: new Date() },
        });
    }
    async refreshToken(usuarioId, tipo) {
        const integracion = await database_1.prisma.integracion.findFirst({
            where: { usuarioId, tipo: tipo, deletedAt: null },
        });
        if (!integracion) {
            throw new base_types_1.ServiceException('INTEGRACION_NOT_FOUND', 'Integración no encontrada', 404);
        }
        if (!integracion.refreshToken) {
            throw new base_types_1.ServiceException('REFRESH_TOKEN_MISSING', 'No hay token de refresco disponible', 400);
        }
        return {
            refreshed: true,
            message: 'Token refrescado correctamente',
        };
    }
}
exports.integracionesService = new IntegracionesService();
//# sourceMappingURL=integraciones.service.js.map