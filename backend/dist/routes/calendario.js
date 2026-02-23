"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const calendario_dto_1 = require("../dtos/calendario.dto");
const router = (0, express_1.Router)();
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
router.get('/eventos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(calendario_dto_1.QueryEventoDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, sort = 'fechaInicio', order = 'asc', expediente_id, tipo, fecha_desde, fecha_hasta } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (expediente_id) {
            where.expedienteId = expediente_id;
        }
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
        const [eventos, total] = await Promise.all([
            database_1.prisma.evento.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    fechaInicio: true,
                    fechaFin: true,
                    tipo: true,
                    expedienteId: true,
                    usuarioId: true,
                    createdAt: true,
                    updatedAt: true,
                    expediente: {
                        select: {
                            id: true,
                            numeroExpediente: true,
                            tipo: true,
                        },
                    },
                },
            }),
            database_1.prisma.evento.count({ where }),
        ]);
        res.json(formatResponse(eventos, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List eventos error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/eventos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(calendario_dto_1.CreateEventoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const evento = await database_1.prisma.evento.create({
            data: {
                titulo: dto.titulo,
                descripcion: dto.descripcion,
                fechaInicio: new Date(dto.fechaInicio),
                fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
                tipo: dto.tipo || calendario_dto_1.TipoEventoEnum.OTRO,
                expedienteId: dto.expedienteId,
                usuarioId: req.user?.id,
            },
        });
        res.status(201).json(formatResponse(evento));
    }
    catch (error) {
        console.error('Create evento error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/eventos/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await database_1.prisma.evento.findFirst({
            where: { id, deletedAt: null },
            include: {
                expediente: {
                    select: {
                        id: true,
                        numeroExpediente: true,
                        tipo: true,
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                            },
                        },
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
        });
        if (!evento) {
            res.status(404).json({ success: false, error: { code: 'EVENTO_NOT_FOUND', message: 'Evento no encontrado' } });
            return;
        }
        res.json(formatResponse(evento));
    }
    catch (error) {
        console.error('Get evento error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/eventos/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(calendario_dto_1.UpdateEventoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingEvento = await database_1.prisma.evento.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingEvento) {
            res.status(404).json({ success: false, error: { code: 'EVENTO_NOT_FOUND', message: 'Evento no encontrado' } });
            return;
        }
        const updateData = {};
        if (dto.titulo !== undefined)
            updateData.titulo = dto.titulo;
        if (dto.descripcion !== undefined)
            updateData.descripcion = dto.descripcion;
        if (dto.fechaInicio !== undefined)
            updateData.fechaInicio = new Date(dto.fechaInicio);
        if (dto.fechaFin !== undefined)
            updateData.fechaFin = dto.fechaFin ? new Date(dto.fechaFin) : null;
        if (dto.tipo !== undefined)
            updateData.tipo = dto.tipo;
        if (dto.expedienteId !== undefined)
            updateData.expedienteId = dto.expedienteId;
        const evento = await database_1.prisma.evento.update({
            where: { id },
            data: updateData,
        });
        res.json(formatResponse(evento));
    }
    catch (error) {
        console.error('Update evento error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.delete('/eventos/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const existingEvento = await database_1.prisma.evento.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingEvento) {
            res.status(404).json({ success: false, error: { code: 'EVENTO_NOT_FOUND', message: 'Evento no encontrado' } });
            return;
        }
        await database_1.prisma.evento.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        res.json(formatResponse({ message: 'Evento eliminado correctamente' }));
    }
    catch (error) {
        console.error('Delete evento error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/audiencias', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(calendario_dto_1.QueryCalendarioDto, req.query);
        let fechaInicio;
        let fechaFin;
        if (dto.fecha_desde && dto.fecha_hasta) {
            fechaInicio = new Date(dto.fecha_desde);
            fechaFin = new Date(dto.fecha_hasta);
        }
        else {
            const mes = dto.mes || new Date().getMonth() + 1;
            const anio = dto.anio || new Date().getFullYear();
            fechaInicio = new Date(anio, mes - 1, 1);
            fechaFin = new Date(anio, mes, 0, 23, 59, 59);
        }
        const eventos = await database_1.prisma.evento.findMany({
            where: {
                deletedAt: null,
                tipo: calendario_dto_1.TipoEventoEnum.AUDIENCIA,
                fechaInicio: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
            },
            orderBy: { fechaInicio: 'asc' },
            select: {
                id: true,
                titulo: true,
                descripcion: true,
                fechaInicio: true,
                fechaFin: true,
                tipo: true,
                expediente: {
                    select: {
                        id: true,
                        numeroExpediente: true,
                        tipo: true,
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                            },
                        },
                    },
                },
            },
        });
        res.json(formatResponse(eventos));
    }
    catch (error) {
        console.error('Get audiencias error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/plazos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(calendario_dto_1.QueryCalendarioDto, req.query);
        let fechaInicio;
        let fechaFin;
        if (dto.fecha_desde && dto.fecha_hasta) {
            fechaInicio = new Date(dto.fecha_desde);
            fechaFin = new Date(dto.fecha_hasta);
        }
        else {
            const mes = dto.mes || new Date().getMonth() + 1;
            const anio = dto.anio || new Date().getFullYear();
            fechaInicio = new Date(anio, mes - 1, 1);
            fechaFin = new Date(anio, mes, 0, 23, 59, 59);
        }
        const eventos = await database_1.prisma.evento.findMany({
            where: {
                deletedAt: null,
                tipo: calendario_dto_1.TipoEventoEnum.PLAZO,
                fechaInicio: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
            },
            orderBy: { fechaInicio: 'asc' },
            select: {
                id: true,
                titulo: true,
                descripcion: true,
                fechaInicio: true,
                fechaFin: true,
                tipo: true,
                expediente: {
                    select: {
                        id: true,
                        numeroExpediente: true,
                        tipo: true,
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                            },
                        },
                    },
                },
            },
        });
        res.json(formatResponse(eventos));
    }
    catch (error) {
        console.error('Get plazos error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/tareas', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(calendario_dto_1.QueryCalendarioDto, req.query);
        let fechaInicio;
        let fechaFin;
        if (dto.fecha_desde && dto.fecha_hasta) {
            fechaInicio = new Date(dto.fecha_desde);
            fechaFin = new Date(dto.fecha_hasta);
        }
        else {
            const mes = dto.mes || new Date().getMonth() + 1;
            const anio = dto.anio || new Date().getFullYear();
            fechaInicio = new Date(anio, mes - 1, 1);
            fechaFin = new Date(anio, mes, 0, 23, 59, 59);
        }
        const eventos = await database_1.prisma.evento.findMany({
            where: {
                deletedAt: null,
                tipo: calendario_dto_1.TipoEventoEnum.TAREA,
                fechaInicio: {
                    gte: fechaInicio,
                    lte: fechaFin,
                },
            },
            orderBy: { fechaInicio: 'asc' },
            select: {
                id: true,
                titulo: true,
                descripcion: true,
                fechaInicio: true,
                fechaFin: true,
                tipo: true,
                expediente: {
                    select: {
                        id: true,
                        numeroExpediente: true,
                        tipo: true,
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                            },
                        },
                    },
                },
            },
        });
        res.json(formatResponse(eventos));
    }
    catch (error) {
        console.error('Get tareas error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
exports.default = router;
//# sourceMappingURL=calendario.js.map