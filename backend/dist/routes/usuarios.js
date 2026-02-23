"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const usuario_dto_1 = require("../dtos/usuario.dto");
const router = (0, express_1.Router)();
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
function sanitizeUser(user) {
    const { password, ...rest } = user;
    return rest;
}
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(usuario_dto_1.QueryUsuarioDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, rol, activo } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { nombre: { contains: search, mode: 'insensitive' } },
                { apellido1: { contains: search, mode: 'insensitive' } },
                { apellido2: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (rol) {
            where.rol = rol;
        }
        if (activo !== undefined) {
            where.activo = activo;
        }
        const [usuarios, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                select: {
                    id: true,
                    email: true,
                    nombre: true,
                    apellido1: true,
                    apellido2: true,
                    rol: true,
                    especialidad: true,
                    numeroColegiado: true,
                    telefono: true,
                    avatarUrl: true,
                    idioma: true,
                    moneda: true,
                    activo: true,
                    ultimoAcceso: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            database_1.prisma.user.count({ where }),
        ]);
        res.json(formatResponse(usuarios, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List usuarios error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/', auth_1.authMiddleware, auth_2.adminMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(usuario_dto_1.CreateUsuarioDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { email, password, nombre, apellido1, apellido2, rol, especialidad, numeroColegiado, telefono, avatarUrl, idioma, moneda } = dto;
        const existingUser = await database_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ success: false, error: { code: 'USER_EXISTS', message: 'El usuario ya existe' } });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await database_1.prisma.user.create({
            data: {
                email,
                password: passwordHash,
                nombre,
                apellido1,
                apellido2,
                rol: rol || 'abogado',
                especialidad,
                numeroColegiado,
                telefono,
                avatarUrl,
                idioma: idioma || 'es',
                moneda: moneda || 'EUR',
            },
        });
        res.status(201).json(formatResponse(sanitizeUser(user)));
    }
    catch (error) {
        console.error('Create usuario error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await database_1.prisma.user.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                email: true,
                nombre: true,
                apellido1: true,
                apellido2: true,
                rol: true,
                especialidad: true,
                numeroColegiado: true,
                telefono: true,
                avatarUrl: true,
                idioma: true,
                moneda: true,
                activo: true,
                ultimoAcceso: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
            return;
        }
        res.json(formatResponse(user));
    }
    catch (error) {
        console.error('Get usuario error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(usuario_dto_1.UpdateUsuarioDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingUser = await database_1.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingUser) {
            res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
            return;
        }
        if (req.user?.role !== 'admin' && req.user?.userId !== id) {
            res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'No puedes modificar otro usuario' } });
            return;
        }
        const user = await database_1.prisma.user.update({
            where: { id },
            data: dto,
        });
        res.json(formatResponse(sanitizeUser(user)));
    }
    catch (error) {
        console.error('Update usuario error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.delete('/:id', auth_1.authMiddleware, auth_2.adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const existingUser = await database_1.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingUser) {
            res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
            return;
        }
        await database_1.prisma.user.update({
            where: { id },
            data: { activo: false, deletedAt: new Date() },
        });
        res.json(formatResponse({ message: 'Usuario desactivado correctamente' }));
    }
    catch (error) {
        console.error('Delete usuario error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/:id/roles', auth_1.authMiddleware, auth_2.adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(usuario_dto_1.AssignRolesDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingUser = await database_1.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingUser) {
            res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
            return;
        }
        const user = await database_1.prisma.user.update({
            where: { id },
            data: { rol: dto.rol },
        });
        res.json(formatResponse(sanitizeUser(user)));
    }
    catch (error) {
        console.error('Assign roles error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
exports.default = router;
//# sourceMappingURL=usuarios.js.map