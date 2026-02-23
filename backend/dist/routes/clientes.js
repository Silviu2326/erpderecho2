"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const cliente_dto_1 = require("../dtos/cliente.dto");
const router = (0, express_1.Router)();
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(cliente_dto_1.QueryClienteDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { nombre: { contains: search, mode: 'insensitive' } },
                { cif: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { ciudad: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [clientes, total] = await Promise.all([
            database_1.prisma.cliente.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                select: {
                    id: true,
                    nombre: true,
                    cif: true,
                    email: true,
                    telefono: true,
                    direccion: true,
                    codigoPostal: true,
                    ciudad: true,
                    provincia: true,
                    pais: true,
                    observaciones: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            database_1.prisma.cliente.count({ where }),
        ]);
        res.json(formatResponse(clientes, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List clientes error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(cliente_dto_1.CreateClienteDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const cliente = await database_1.prisma.cliente.create({
            data: dto,
        });
        res.status(201).json(formatResponse(cliente));
    }
    catch (error) {
        console.error('Create cliente error:', error);
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, error: { code: 'CLIENTE_EXISTS', message: 'El CIF ya existe' } });
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
        const clientes = await database_1.prisma.cliente.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { nombre: { contains: q, mode: 'insensitive' } },
                    { cif: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                ],
            },
            take: 20,
            select: {
                id: true,
                nombre: true,
                cif: true,
                email: true,
                telefono: true,
            },
        });
        res.json(formatResponse(clientes));
    }
    catch (error) {
        console.error('Search clientes error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await database_1.prisma.cliente.findFirst({
            where: { id, deletedAt: null },
            include: {
                contactos: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        telefono: true,
                        cargo: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        if (!cliente) {
            res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
            return;
        }
        res.json(formatResponse(cliente));
    }
    catch (error) {
        console.error('Get cliente error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(cliente_dto_1.UpdateClienteDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingCliente = await database_1.prisma.cliente.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingCliente) {
            res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
            return;
        }
        const cliente = await database_1.prisma.cliente.update({
            where: { id },
            data: dto,
        });
        res.json(formatResponse(cliente));
    }
    catch (error) {
        console.error('Update cliente error:', error);
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, error: { code: 'CLIENTE_EXISTS', message: 'El CIF ya existe' } });
            return;
        }
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const existingCliente = await database_1.prisma.cliente.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingCliente) {
            res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
            return;
        }
        await database_1.prisma.cliente.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        res.json(formatResponse({ message: 'Cliente desactivado correctamente' }));
    }
    catch (error) {
        console.error('Delete cliente error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/:id/expedientes', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const existingCliente = await database_1.prisma.cliente.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingCliente) {
            res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
            return;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [expedientes, total] = await Promise.all([
            database_1.prisma.expediente.findMany({
                where: { clienteId: id, deletedAt: null },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    numeroExpediente: true,
                    descripcion: true,
                    tipo: true,
                    estado: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            database_1.prisma.expediente.count({ where: { clienteId: id, deletedAt: null } }),
        ]);
        res.json(formatResponse(expedientes, {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        }));
    }
    catch (error) {
        console.error('Get cliente expedientes error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/:id/facturas', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const existingCliente = await database_1.prisma.cliente.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingCliente) {
            res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
            return;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [facturas, total] = await Promise.all([
            database_1.prisma.factura.findMany({
                where: { clienteId: id, deletedAt: null },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    numero: true,
                    concepto: true,
                    importe: true,
                    estado: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            database_1.prisma.factura.count({ where: { clienteId: id, deletedAt: null } }),
        ]);
        res.json(formatResponse(facturas, {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        }));
    }
    catch (error) {
        console.error('Get cliente facturas error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/:id/contactos', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(cliente_dto_1.CreateContactoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingCliente = await database_1.prisma.cliente.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingCliente) {
            res.status(404).json({ success: false, error: { code: 'CLIENTE_NOT_FOUND', message: 'Cliente no encontrado' } });
            return;
        }
        const contacto = await database_1.prisma.contacto.create({
            data: {
                ...dto,
                clienteId: id,
            },
        });
        res.status(201).json(formatResponse(contacto));
    }
    catch (error) {
        console.error('Create contacto error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
exports.default = router;
//# sourceMappingURL=clientes.js.map