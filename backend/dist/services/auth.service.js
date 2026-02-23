"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const base_types_1 = require("./base.types");
class AuthService {
    async register(input) {
        const { email, password, nombre, apellido1, apellido2, rol } = input;
        const existingUser = await database_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new base_types_1.ServiceException('USER_EXISTS', 'El usuario ya existe', 409);
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
        const tokens = await this.generateTokens(user.id, user.email, user.rol);
        return {
            user: this.sanitizeUser(user),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async login(input) {
        const { email, password } = input;
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.activo) {
            throw new base_types_1.ServiceException('INVALID_CREDENTIALS', 'Credenciales inválidas', 401);
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw new base_types_1.ServiceException('INVALID_CREDENTIALS', 'Credenciales inválidas', 401);
        }
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { ultimoAcceso: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.rol);
        return {
            user: this.sanitizeUser(user),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async refresh(refreshToken) {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        const storedToken = await database_1.prisma.refreshToken.findFirst({
            where: { token: refreshToken, revoked: false },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new base_types_1.ServiceException('INVALID_TOKEN', 'Token inválido o expirado', 401);
        }
        await database_1.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revoked: true },
        });
        const user = await database_1.prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.activo) {
            throw new base_types_1.ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 401);
        }
        return await this.generateTokens(user.id, user.email, user.rol);
    }
    async logout(refreshToken) {
        if (refreshToken) {
            await database_1.prisma.refreshToken.updateMany({
                where: { token: refreshToken },
                data: { revoked: true },
            });
        }
    }
    async getCurrentUser(userId) {
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.activo) {
            throw new base_types_1.ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
        }
        return this.sanitizeUser(user);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new base_types_1.ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw new base_types_1.ServiceException('INVALID_PASSWORD', 'Contraseña actual incorrecta', 401);
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
    }
    async generateTokens(userId, email, rol) {
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
    sanitizeUser(user) {
        const { password, ...rest } = user;
        return rest;
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map