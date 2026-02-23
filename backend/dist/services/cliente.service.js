"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clienteService = void 0;
const database_1 = require("../config/database");
const base_types_1 = require("./base.types");
const clienteSelect = {
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
};
class ClienteService {
    async findAll(params) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search } = params;
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
                select: clienteSelect,
            }),
            database_1.prisma.cliente.count({ where }),
        ]);
        return {
            data: clientes,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
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
            throw new base_types_1.ServiceException('CLIENTE_NOT_FOUND', 'Cliente no encontrado', 404);
        }
        return cliente;
    }
    async getFacturas(clienteId, page = 1, limit = 20) {
        const existingCliente = await database_1.prisma.cliente.findFirst({
            where: { id: clienteId, deletedAt: null },
        });
        if (!existingCliente) {
            throw new base_types_1.ServiceException('CLIENTE_NOT_FOUND', 'Cliente no encontrado', 404);
        }
        const skip = (page - 1) * limit;
        const [facturas, total] = await Promise.all([
            database_1.prisma.factura.findMany({
                where: { clienteId, deletedAt: null },
                skip,
                take: limit,
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
            database_1.prisma.factura.count({ where: { clienteId, deletedAt: null } }),
        ]);
        return {
            data: facturas,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async createContacto(clienteId, input) {
        const existingCliente = await database_1.prisma.cliente.findFirst({
            where: { id: clienteId, deletedAt: null },
        });
        if (!existingCliente) {
            throw new base_types_1.ServiceException('CLIENTE_NOT_FOUND', 'Cliente no encontrado', 404);
        }
        const contacto = await database_1.prisma.contacto.create({
            data: {
                ...input,
                clienteId,
            },
        });
        return contacto;
    }
}
exports.clienteService = new ClienteService();
//# sourceMappingURL=cliente.service.js.map