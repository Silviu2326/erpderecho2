"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const base_types_1 = require("./base.types");
const usuarioSelect = {
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
};
class UsuarioService {
    async findAll(params) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, rol, activo } = params;
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
                select: usuarioSelect,
            }),
            database_1.prisma.user.count({ where }),
        ]);
        return {
            data: usuarios,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const user = await database_1.prisma.user.findFirst({
            where: { id, deletedAt: null },
            select: usuarioSelect,
        });
        if (!user) {
            throw new base_types_1.ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
        }
        return user;
    }
    async create(input) {
        const { email, password, nombre, apellido1, apellido2, rol, especialidad, numeroColegiado, telefono, avatarUrl, idioma, moneda } = input;
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
                especialidad,
                numeroColegiado,
                telefono,
                avatarUrl,
                idioma: idioma || 'es',
                moneda: moneda || 'EUR',
            },
        });
        return this.sanitizeUser(user);
    }
    async update(id, input) {
        const existingUser = await database_1.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingUser) {
            throw new base_types_1.ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
        }
        const user = await database_1.prisma.user.update({
            where: { id },
            data: input,
        });
        return this.sanitizeUser(user);
    }
    async delete(id) {
        const existingUser = await database_1.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingUser) {
            throw new base_types_1.ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
        }
        await database_1.prisma.user.update({
            where: { id },
            data: { activo: false, deletedAt: new Date() },
        });
    }
    async updateRoles(id, rol) {
        const existingUser = await database_1.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingUser) {
            throw new base_types_1.ServiceException('USER_NOT_FOUND', 'Usuario no encontrado', 404);
        }
        const user = await database_1.prisma.user.update({
            where: { id },
            data: { rol: rol },
        });
        return this.sanitizeUser(user);
    }
    sanitizeUser(user) {
        const { password, ...rest } = user;
        return rest;
    }
}
exports.usuarioService = new UsuarioService();
//# sourceMappingURL=usuario.service.js.map