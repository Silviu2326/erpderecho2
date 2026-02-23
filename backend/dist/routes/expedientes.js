"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const expediente_dto_1 = require("../dtos/expediente.dto");
const router = (0, express_1.Router)();
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
/**
 * @swagger
 * /expedientes:
 *   get:
 *     summary: Listar expedientes
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Resultados por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por número, descripción, cliente o abogado
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ACTIVO, CERRADO, ARCHIVADO, SUSPENDIDO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [CIVIL, PENAL, LABORAL, CONTENCIOSO, MERCANTIL, FAMILIA, ADMINISTRATIVO]
 *         description: Filtrar por tipo de expediente
 *       - in: query
 *         name: abogado_id
 *         schema:
 *           type: string
 *         description: Filtrar por abogado asignado
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: string
 *         description: Filtrar por cliente
 *     responses:
 *       200:
 *         description: Lista de expedientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: No autorizado
 */
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(expediente_dto_1.QueryExpedienteDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, estado, tipo, abogado_id, cliente_id, fecha_desde, fecha_hasta } = dto;
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
            database_1.prisma.expediente.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                select: {
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
                },
            }),
            database_1.prisma.expediente.count({ where }),
        ]);
        res.json(formatResponse(expedientes, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List expedientes error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(expediente_dto_1.CreateExpedienteDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const expediente = await database_1.prisma.expediente.create({
            data: dto,
        });
        res.status(201).json(formatResponse(expediente));
    }
    catch (error) {
        console.error('Create expediente error:', error);
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, error: { code: 'EXPEDIENTE_EXISTS', message: 'El número de expediente ya existe' } });
            return;
        }
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/buscar', auth_1.authMiddleware, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            res.status(400).json({ success: false, error: { message: 'Search query required' } });
            return;
        }
        const expedientes = await database_1.prisma.expediente.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { numeroExpediente: { contains: q, mode: 'insensitive' } },
                    { descripcion: { contains: q, mode: 'insensitive' } },
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
        res.json(formatResponse(expedientes));
    }
    catch (error) {
        console.error('Search expedientes error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/calendario', auth_1.authMiddleware, async (req, res) => {
    try {
        const { mes, anio } = req.query;
        const mesNum = mes ? parseInt(mes) : new Date().getMonth() + 1;
        const anioNum = anio ? parseInt(anio) : new Date().getFullYear();
        const fechaInicio = new Date(anioNum, mesNum - 1, 1);
        const fechaFin = new Date(anioNum, mesNum, 0, 23, 59, 59);
        const actuaciones = await database_1.prisma.actuacion.findMany({
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
        const calendario = actuaciones.map(act => ({
            id: act.id,
            title: `${act.expediente.numeroExpediente} - ${act.tipo}`,
            date: act.fecha,
            tipo: act.tipo,
            descripcion: act.descripcion,
            expediente: act.expediente,
        }));
        res.json(formatResponse(calendario));
    }
    catch (error) {
        console.error('Get calendario error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const expediente = await database_1.prisma.expediente.findFirst({
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
            res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
            return;
        }
        res.json(formatResponse(expediente));
    }
    catch (error) {
        console.error('Get expediente error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(expediente_dto_1.UpdateExpedienteDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingExpediente = await database_1.prisma.expediente.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingExpediente) {
            res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
            return;
        }
        const expediente = await database_1.prisma.expediente.update({
            where: { id },
            data: dto,
        });
        res.json(formatResponse(expediente));
    }
    catch (error) {
        console.error('Update expediente error:', error);
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, error: { code: 'EXPEDIENTE_EXISTS', message: 'El número de expediente ya existe' } });
            return;
        }
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const existingExpediente = await database_1.prisma.expediente.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingExpediente) {
            res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
            return;
        }
        await database_1.prisma.expediente.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        res.json(formatResponse({ message: 'Expediente archivado correctamente' }));
    }
    catch (error) {
        console.error('Delete expediente error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/:id/actuaciones', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(expediente_dto_1.QueryActuacionDto, req.query);
        const existingExpediente = await database_1.prisma.expediente.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingExpediente) {
            res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
            return;
        }
        const { page = 1, limit = 20, sort = 'fecha', order = 'desc' } = dto;
        const skip = (page - 1) * limit;
        const [actuaciones, total] = await Promise.all([
            database_1.prisma.actuacion.findMany({
                where: { expedienteId: id, deletedAt: null },
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
            database_1.prisma.actuacion.count({ where: { expedienteId: id, deletedAt: null } }),
        ]);
        res.json(formatResponse(actuaciones, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('Get actuaciones error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/:id/actuaciones', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(expediente_dto_1.CreateActuacionDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingExpediente = await database_1.prisma.expediente.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingExpediente) {
            res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
            return;
        }
        const actuacion = await database_1.prisma.actuacion.create({
            data: {
                ...dto,
                fecha: new Date(dto.fecha),
                expedienteId: id,
                usuarioId: req.user.id,
            },
        });
        res.status(201).json(formatResponse(actuacion));
    }
    catch (error) {
        console.error('Create actuacion error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/:id/documentos', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const existingExpediente = await database_1.prisma.expediente.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingExpediente) {
            res.status(404).json({ success: false, error: { code: 'EXPEDIENTE_NOT_FOUND', message: 'Expediente no encontrado' } });
            return;
        }
        res.json(formatResponse([]));
    }
    catch (error) {
        console.error('Get documentos error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
exports.default = router;
//# sourceMappingURL=expedientes.js.map