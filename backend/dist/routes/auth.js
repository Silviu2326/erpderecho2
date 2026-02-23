"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
const auth_dto_1 = require("../dtos/auth.dto");
const router = (0, express_1.Router)();
function formatResponse(data) {
    return { success: true, data };
}
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombre
 *               - apellido1
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abogado@bufete.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido1:
 *                 type: string
 *                 example: García
 *               apellido2:
 *                 type: string
 *                 example: López
 *               rol:
 *                 type: string
 *                 enum: [admin, abogado, letrado, secretary, becario, colaborador]
 *                 example: abogado
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El usuario ya existe
 */
async function generateTokens(userId, email, rol) {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId, userId, email, rol, type: 'access' }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, type: 'refresh' }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await database_1.prisma.refreshToken.create({
        data: {
            token: refreshToken,
            expiresAt,
            userId,
        },
    });
    return { accessToken, refreshToken };
}
function sanitizeUser(user) {
    const { password, ...rest } = user;
    return rest;
}
router.post('/register', async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(auth_dto_1.CreateUserDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { email, password, nombre, apellido1, apellido2, rol } = dto;
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
            },
        });
        const tokens = await generateTokens(user.id, user.email, user.rol);
        res.status(201).json(formatResponse({
            user: sanitizeUser(user),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        }));
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abogado@bufete.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(auth_dto_1.LoginDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { email, password } = dto;
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.activo) {
            res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' } });
            return;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' } });
            return;
        }
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { ultimoAcceso: new Date() },
        });
        const tokens = await generateTokens(user.id, user.email, user.rol);
        res.json(formatResponse({
            user: sanitizeUser(user),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        }));
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(auth_dto_1.RefreshTokenDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { refreshToken } = dto;
        const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        const storedToken = await database_1.prisma.refreshToken.findFirst({
            where: { token: refreshToken, revoked: false },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token inválido o expirado' } });
            return;
        }
        await database_1.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revoked: true },
        });
        const user = await database_1.prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.activo) {
            res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
            return;
        }
        const tokens = await generateTokens(user.id, user.email, user.rol);
        res.json(formatResponse({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        }));
    }
    catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/logout', auth_1.authMiddleware, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await database_1.prisma.refreshToken.updateMany({
                where: { token: refreshToken },
                data: { revoked: true },
            });
        }
        res.json(formatResponse({ message: 'Sesión cerrada correctamente' }));
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { id: req.user?.userId },
        });
        if (!user || !user.activo) {
            res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
            return;
        }
        res.json(formatResponse({ user: sanitizeUser(user) }));
    }
    catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/password/change', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(auth_dto_1.ChangePasswordDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { currentPassword, newPassword } = dto;
        const user = await database_1.prisma.user.findUnique({
            where: { id: req.user?.userId },
        });
        if (!user) {
            res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } });
            return;
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            res.status(401).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Contraseña actual incorrecta' } });
            return;
        }
        const newPasswordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { password: newPasswordHash },
        });
        await database_1.prisma.refreshToken.updateMany({
            where: { userId: user.id },
            data: { revoked: true },
        });
        res.json(formatResponse({ message: 'Contraseña actualizada correctamente' }));
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map