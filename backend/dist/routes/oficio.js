"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const oficio_dto_1 = require("../dtos/oficio.dto");
const router = (0, express_1.Router)();
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
router.get('/turnos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(oficio_dto_1.QueryTurnoDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, sort = 'fecha', order = 'desc', estado, tipo, usuarioId, fecha_desde, fecha_hasta } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (estado) {
            where.estado = estado;
        }
        if (tipo) {
            where.tipo = tipo;
        }
        if (usuarioId) {
            where.usuarioId = usuarioId;
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
                select: {
                    id: true,
                    fecha: true,
                    estado: true,
                    tipo: true,
                    centro: true,
                    createdAt: true,
                    updatedAt: true,
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido1: true,
                            apellido2: true,
                        },
                    },
                },
            }),
            database_1.prisma.turno.count({ where }),
        ]);
        res.json(formatResponse(turnos, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List turnos error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/turnos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(oficio_dto_1.CreateTurnoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const turno = await database_1.prisma.turno.create({
            data: {
                ...dto,
                fecha: new Date(dto.fecha),
                usuarioId: dto.usuarioId || req.user.id,
            },
        });
        res.status(201).json(formatResponse(turno));
    }
    catch (error) {
        console.error('Create turno error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/turnos/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const turno = await database_1.prisma.turno.findFirst({
            where: { id, deletedAt: null },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido1: true,
                        apellido2: true,
                        email: true,
                        telefono: true,
                    },
                },
                liquidaciones: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        importe: true,
                        estado: true,
                        fechaLiquidacion: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!turno) {
            res.status(404).json({ success: false, error: { code: 'TURNO_NOT_FOUND', message: 'Turno no encontrado' } });
            return;
        }
        res.json(formatResponse(turno));
    }
    catch (error) {
        console.error('Get turno error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/turnos/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(oficio_dto_1.UpdateTurnoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingTurno = await database_1.prisma.turno.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingTurno) {
            res.status(404).json({ success: false, error: { code: 'TURNO_NOT_FOUND', message: 'Turno no encontrado' } });
            return;
        }
        const dataToUpdate = { ...dto };
        if (dto.fecha) {
            dataToUpdate.fecha = new Date(dto.fecha);
        }
        const turno = await database_1.prisma.turno.update({
            where: { id },
            data: dataToUpdate,
        });
        res.json(formatResponse(turno));
    }
    catch (error) {
        console.error('Update turno error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/turnos/:id/atender', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const existingTurno = await database_1.prisma.turno.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingTurno) {
            res.status(404).json({ success: false, error: { code: 'TURNO_NOT_FOUND', message: 'Turno no encontrado' } });
            return;
        }
        if (existingTurno.estado === 'ATENDIDO') {
            res.status(400).json({ success: false, error: { code: 'TURNO_ALREADY_ATENDIDO', message: 'El turno ya ha sido atendido' } });
            return;
        }
        const turno = await database_1.prisma.turno.update({
            where: { id },
            data: { estado: 'ATENDIENDO' },
        });
        res.json(formatResponse(turno));
    }
    catch (error) {
        console.error('Atender turno error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/guardias', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(oficio_dto_1.QueryGuardiaDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, sort = 'fechaInicio', order = 'desc', tipo, usuarioId, fecha_desde, fecha_hasta } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (tipo) {
            where.tipo = tipo;
        }
        if (usuarioId) {
            where.usuarioId = usuarioId;
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
                select: {
                    id: true,
                    fechaInicio: true,
                    fechaFin: true,
                    tipo: true,
                    centro: true,
                    createdAt: true,
                    updatedAt: true,
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido1: true,
                            apellido2: true,
                        },
                    },
                },
            }),
            database_1.prisma.guardia.count({ where }),
        ]);
        res.json(formatResponse(guardias, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List guardias error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/guardias', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(oficio_dto_1.CreateGuardiaDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const guardia = await database_1.prisma.guardia.create({
            data: {
                ...dto,
                fechaInicio: new Date(dto.fechaInicio),
                fechaFin: new Date(dto.fechaFin),
                usuarioId: dto.usuarioId || req.user.id,
            },
        });
        res.status(201).json(formatResponse(guardia));
    }
    catch (error) {
        console.error('Create guardia error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/liquidaciones', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(oficio_dto_1.QueryLiquidacionDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', estado, turnoId } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (estado) {
            where.estado = estado;
        }
        if (turnoId) {
            where.turnoId = turnoId;
        }
        const [liquidaciones, total] = await Promise.all([
            database_1.prisma.liquidacion.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                select: {
                    id: true,
                    importe: true,
                    estado: true,
                    fechaLiquidacion: true,
                    createdAt: true,
                    updatedAt: true,
                    turno: {
                        select: {
                            id: true,
                            fecha: true,
                            tipo: true,
                            estado: true,
                        },
                    },
                },
            }),
            database_1.prisma.liquidacion.count({ where }),
        ]);
        res.json(formatResponse(liquidaciones, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List liquidaciones error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/liquidaciones', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(oficio_dto_1.CreateLiquidacionDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingTurno = await database_1.prisma.turno.findFirst({
            where: { id: dto.turnoId, deletedAt: null },
        });
        if (!existingTurno) {
            res.status(404).json({ success: false, error: { code: 'TURNO_NOT_FOUND', message: 'Turno no encontrado' } });
            return;
        }
        const dataToCreate = {
            ...dto,
            turnoId: dto.turnoId,
        };
        if (dto.fechaLiquidacion) {
            dataToCreate.fechaLiquidacion = new Date(dto.fechaLiquidacion);
        }
        const liquidacion = await database_1.prisma.liquidacion.create({
            data: dataToCreate,
        });
        res.status(201).json(formatResponse(liquidacion));
    }
    catch (error) {
        console.error('Create liquidacion error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/dashboard', auth_1.authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [turnosHoy, turnosPendientes, turnosAtendidos, guardiasActivas, liquidacionesPendientes,] = await Promise.all([
            database_1.prisma.turno.count({
                where: {
                    deletedAt: null,
                    fecha: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),
            database_1.prisma.turno.count({
                where: {
                    deletedAt: null,
                    estado: 'PENDIENTE',
                },
            }),
            database_1.prisma.turno.count({
                where: {
                    deletedAt: null,
                    estado: 'ATENDIDO',
                },
            }),
            database_1.prisma.guardia.count({
                where: {
                    deletedAt: null,
                    fechaInicio: { lte: new Date() },
                    fechaFin: { gte: new Date() },
                },
            }),
            database_1.prisma.liquidacion.count({
                where: {
                    deletedAt: null,
                    estado: 'PENDIENTE',
                },
            }),
        ]);
        res.json(formatResponse({
            turnosHoy,
            turnosPendientes,
            turnosAtendidos,
            guardiasActivas,
            liquidacionesPendientes,
        }));
    }
    catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/estadisticas', auth_1.authMiddleware, async (req, res) => {
    try {
        const { periodo = 'mes' } = req.query;
        let fechaInicio;
        const fechaFin = new Date();
        switch (periodo) {
            case 'semana':
                fechaInicio = new Date();
                fechaInicio.setDate(fechaInicio.getDate() - 7);
                break;
            case 'año':
                fechaInicio = new Date();
                fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
                break;
            case 'mes':
            default:
                fechaInicio = new Date();
                fechaInicio.setMonth(fechaInicio.getMonth() - 1);
                break;
        }
        const [turnosPorEstado, turnosPorTipo, guardiasPorTipo, totalImporteLiquidado, turnosRecientes,] = await Promise.all([
            database_1.prisma.turno.groupBy({
                by: ['estado'],
                where: {
                    deletedAt: null,
                    createdAt: { gte: fechaInicio },
                },
                _count: true,
            }),
            database_1.prisma.turno.groupBy({
                by: ['tipo'],
                where: {
                    deletedAt: null,
                    createdAt: { gte: fechaInicio },
                },
                _count: true,
            }),
            database_1.prisma.guardia.groupBy({
                by: ['tipo'],
                where: {
                    deletedAt: null,
                    createdAt: { gte: fechaInicio },
                },
                _count: true,
            }),
            database_1.prisma.liquidacion.aggregate({
                where: {
                    deletedAt: null,
                    estado: 'PAGADA',
                    createdAt: { gte: fechaInicio },
                },
                _sum: {
                    importe: true,
                },
            }),
            database_1.prisma.turno.findMany({
                where: {
                    deletedAt: null,
                    createdAt: { gte: fechaInicio },
                },
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fecha: true,
                    estado: true,
                    tipo: true,
                    createdAt: true,
                },
            }),
        ]);
        const estadoMap = {};
        turnosPorEstado.forEach((item) => {
            estadoMap[item.estado] = item._count;
        });
        const tipoTurnoMap = {};
        turnosPorTipo.forEach((item) => {
            tipoTurnoMap[item.tipo] = item._count;
        });
        const tipoGuardiaMap = {};
        guardiasPorTipo.forEach((item) => {
            tipoGuardiaMap[item.tipo] = item._count;
        });
        res.json(formatResponse({
            periodo,
            fechaInicio,
            fechaFin,
            turnosPorEstado: estadoMap,
            turnosPorTipo: tipoTurnoMap,
            guardiasPorTipo: tipoGuardiaMap,
            totalImporteLiquidado: totalImporteLiquidado._sum.importe || 0,
            turnosRecientes,
        }));
    }
    catch (error) {
        console.error('Get estadisticas error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
exports.default = router;
//# sourceMappingURL=oficio.js.map