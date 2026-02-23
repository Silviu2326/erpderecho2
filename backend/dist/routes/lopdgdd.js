"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const lopdgdd_dto_1 = require("../dtos/lopdgdd.dto");
const router = (0, express_1.Router)();
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
router.get('/consentimientos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(lopdgdd_dto_1.QueryConsentimientoDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, clienteId, tipo } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (clienteId) {
            where.clienteId = clienteId;
        }
        if (tipo) {
            where.tipo = tipo;
        }
        const [consentimientos, total] = await Promise.all([
            database_1.prisma.consentimiento.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                            cif: true,
                            email: true,
                        },
                    },
                },
            }),
            database_1.prisma.consentimiento.count({ where }),
        ]);
        res.json(formatResponse(consentimientos, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List consentimiento error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/consentimientos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(lopdgdd_dto_1.CreateConsentimientoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const cliente = await database_1.prisma.cliente.findFirst({
            where: { id: dto.clienteId, deletedAt: null },
        });
        if (!cliente) {
            res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
            return;
        }
        const consentimiento = await database_1.prisma.consentimiento.create({
            data: {
                clienteId: dto.clienteId,
                tipo: dto.tipo,
                granted: dto.granted,
                fechaConsentimiento: new Date(dto.fechaConsentimiento),
            },
        });
        res.status(201).json(formatResponse(consentimiento));
    }
    catch (error) {
        console.error('Create consentimiento error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/derechos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(lopdgdd_dto_1.QueryDerechoARCOdto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, clienteId, tipo, estado } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (clienteId) {
            where.clienteId = clienteId;
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
                orderBy: { createdAt: 'desc' },
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                            cif: true,
                            email: true,
                        },
                    },
                },
            }),
            database_1.prisma.derechoARCO.count({ where }),
        ]);
        res.json(formatResponse(derechos, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List derecho error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/derechos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(lopdgdd_dto_1.CreateDerechoARCOdto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const cliente = await database_1.prisma.cliente.findFirst({
            where: { id: dto.clienteId, deletedAt: null },
        });
        if (!cliente) {
            res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
            return;
        }
        const derecho = await database_1.prisma.derechoARCO.create({
            data: {
                clienteId: dto.clienteId,
                tipo: dto.tipo,
                fechaSolicitud: new Date(dto.fechaSolicitud),
            },
        });
        res.status(201).json(formatResponse(derecho));
    }
    catch (error) {
        console.error('Create derecho error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/derechos/:id/procesar', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(lopdgdd_dto_1.ProcesarDerechoARCOdto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existing = await database_1.prisma.derechoARCO.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing) {
            res.status(404).json({ success: false, error: { code: 'DERECHO_NOT_FOUND', message: 'Derecho ARCO no encontrado' } });
            return;
        }
        const derecho = await database_1.prisma.derechoARCO.update({
            where: { id },
            data: {
                estado: dto.estado,
                fechaRespuesta: dto.fechaRespuesta ? new Date(dto.fechaRespuesta) : null,
            },
        });
        res.json(formatResponse(derecho));
    }
    catch (error) {
        console.error('Procesar derecho error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/brechas', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(lopdgdd_dto_1.QueryBrechaDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, estado } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (estado) {
            where.estado = estado;
        }
        const [brechas, total] = await Promise.all([
            database_1.prisma.brecha.findMany({
                where,
                skip,
                take: limit,
                orderBy: { fechaDeteccion: 'desc' },
            }),
            database_1.prisma.brecha.count({ where }),
        ]);
        res.json(formatResponse(brechas, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List brecha error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/brechas', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(lopdgdd_dto_1.CreateBrechaDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const brecha = await database_1.prisma.brecha.create({
            data: {
                descripcion: dto.descripcion,
                fechaDeteccion: new Date(dto.fechaDeteccion),
                fechaNotificacionAepd: dto.fechaNotificacionAepd ? new Date(dto.fechaNotificacionAepd) : null,
                estado: dto.estado || 'DETECTADA',
                medidas: dto.medidas,
            },
        });
        res.status(201).json(formatResponse(brecha));
    }
    catch (error) {
        console.error('Create brecha error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/informes', auth_1.authMiddleware, async (req, res) => {
    try {
        const [totalConsentimientos, consentimientosPorTipo, totalDerechos, derechosPorTipo, derechosPorEstado, totalBrechas, brechasPorEstado,] = await Promise.all([
            database_1.prisma.consentimiento.count({ where: { deletedAt: null } }),
            database_1.prisma.consentimiento.groupBy({
                by: ['tipo'],
                where: { deletedAt: null },
                _count: true,
            }),
            database_1.prisma.derechoARCO.count({ where: { deletedAt: null } }),
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
            database_1.prisma.brecha.count({ where: { deletedAt: null } }),
            database_1.prisma.brecha.groupBy({
                by: ['estado'],
                where: { deletedAt: null },
                _count: true,
            }),
        ]);
        const informe = {
            consentimiento: {
                total: totalConsentimientos,
                porTipo: consentimientosPorTipo.map((item) => ({
                    tipo: item.tipo,
                    count: item._count,
                })),
            },
            derechosARCO: {
                total: totalDerechos,
                porTipo: derechosPorTipo.map((item) => ({
                    tipo: item.tipo,
                    count: item._count,
                })),
                porEstado: derechosPorEstado.map((item) => ({
                    estado: item.estado,
                    count: item._count,
                })),
            },
            brechas: {
                total: totalBrechas,
                porEstado: brechasPorEstado.map((item) => ({
                    estado: item.estado,
                    count: item._count,
                })),
            },
        };
        res.json(formatResponse(informe));
    }
    catch (error) {
        console.error('Get informes error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
exports.default = router;
//# sourceMappingURL=lopdgdd.js.map