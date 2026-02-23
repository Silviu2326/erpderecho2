"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facturaService = void 0;
const database_1 = require("../config/database");
const base_types_1 = require("./base.types");
class FacturaService {
    async findAll(params) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, estado, cliente_id, expediente_id, fecha_desde, fecha_hasta } = params;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (estado) {
            where.estado = estado;
        }
        if (cliente_id) {
            where.clienteId = cliente_id;
        }
        if (expediente_id) {
            where.expedienteId = expediente_id;
        }
        if (fecha_desde || fecha_hasta) {
            where.fechaEmision = {};
            if (fecha_desde) {
                where.fechaEmision.gte = new Date(fecha_desde);
            }
            if (fecha_hasta) {
                where.fechaEmision.lte = new Date(fecha_hasta);
            }
        }
        if (search) {
            where.OR = [
                { numero: { contains: search, mode: 'insensitive' } },
                { concepto: { contains: search, mode: 'insensitive' } },
                { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [facturas, total] = await Promise.all([
            database_1.prisma.factura.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                select: {
                    id: true,
                    numero: true,
                    concepto: true,
                    importe: true,
                    importeBase: true,
                    importeIVA: true,
                    estado: true,
                    fechaEmision: true,
                    fechaVencimiento: true,
                    clienteId: true,
                    expedienteId: true,
                    createdAt: true,
                    updatedAt: true,
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                        },
                    },
                    expediente: {
                        select: {
                            id: true,
                            numeroExpediente: true,
                        },
                    },
                    _count: {
                        select: { lineas: true },
                    },
                },
            }),
            database_1.prisma.factura.count({ where }),
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
    async findById(id) {
        const factura = await database_1.prisma.factura.findFirst({
            where: { id, deletedAt: null },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        cif: true,
                        email: true,
                        telefono: true,
                        direccion: true,
                        ciudad: true,
                        provincia: true,
                    },
                },
                expediente: {
                    select: {
                        id: true,
                        numeroExpediente: true,
                        tipo: true,
                    },
                },
                lineas: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!factura) {
            throw new base_types_1.ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
        }
        return factura;
    }
    async create(input) {
        const { lineas, ...facturaData } = input;
        let importeTotal = input.importeBase || 0;
        if (input.importeIVA) {
            importeTotal += input.importeIVA;
        }
        try {
            const factura = await database_1.prisma.factura.create({
                data: {
                    ...facturaData,
                    importe: importeTotal,
                    fechaEmision: input.fechaEmision ? new Date(input.fechaEmision) : new Date(),
                    fechaVencimiento: input.fechaVencimiento ? new Date(input.fechaVencimiento) : null,
                    lineas: lineas && lineas.length > 0 ? {
                        create: lineas.map(linea => ({
                            concepto: linea.concepto,
                            cantidad: linea.cantidad,
                            precioUnitario: linea.precioUnitario,
                            importe: linea.cantidad * linea.precioUnitario,
                        })),
                    } : undefined,
                },
                include: {
                    lineas: true,
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                        },
                    },
                    expediente: {
                        select: {
                            id: true,
                            numeroExpediente: true,
                        },
                    },
                },
            });
            return factura;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new base_types_1.ServiceException('FACTURA_EXISTS', 'El número de factura ya existe', 409);
            }
            throw error;
        }
    }
    async update(id, input) {
        const existingFactura = await database_1.prisma.factura.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingFactura) {
            throw new base_types_1.ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
        }
        if (existingFactura.estado === 'ANULADA') {
            throw new base_types_1.ServiceException('FACTURA_ANULADA', 'No se puede modificar una factura anulada', 400);
        }
        const { lineas, ...facturaData } = input;
        let importeTotal = existingFactura.importe;
        if (input.importeBase !== undefined || input.importeIVA !== undefined) {
            const base = input.importeBase ?? existingFactura.importeBase ?? 0;
            const iva = input.importeIVA ?? existingFactura.importeIVA ?? 0;
            importeTotal = base + iva;
        }
        const updateData = {
            ...facturaData,
            importe: importeTotal,
        };
        if (input.fechaEmision) {
            updateData.fechaEmision = new Date(input.fechaEmision);
        }
        if (input.fechaVencimiento !== undefined) {
            updateData.fechaVencimiento = input.fechaVencimiento ? new Date(input.fechaVencimiento) : null;
        }
        if (lineas) {
            await database_1.prisma.lineaFactura.updateMany({
                where: { facturaId: id, deletedAt: null },
                data: { deletedAt: new Date() },
            });
            updateData.lineas = {
                create: lineas.map(linea => ({
                    concepto: linea.concepto,
                    cantidad: linea.cantidad,
                    precioUnitario: linea.precioUnitario,
                    importe: linea.cantidad * linea.precioUnitario,
                })),
            };
        }
        try {
            const factura = await database_1.prisma.factura.update({
                where: { id },
                data: updateData,
                include: {
                    lineas: {
                        where: { deletedAt: null },
                    },
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                        },
                    },
                    expediente: {
                        select: {
                            id: true,
                            numeroExpediente: true,
                        },
                    },
                },
            });
            return factura;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new base_types_1.ServiceException('FACTURA_EXISTS', 'El número de factura ya existe', 409);
            }
            throw error;
        }
    }
    async delete(id) {
        const existingFactura = await database_1.prisma.factura.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingFactura) {
            throw new base_types_1.ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
        }
        if (existingFactura.estado === 'ANULADA') {
            throw new base_types_1.ServiceException('FACTURA_ANULADA', 'La factura ya está anulada', 400);
        }
        const factura = await database_1.prisma.factura.update({
            where: { id },
            data: {
                estado: 'ANULADA',
                deletedAt: new Date(),
            },
        });
        return factura;
    }
    async pagar(id) {
        const existingFactura = await database_1.prisma.factura.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingFactura) {
            throw new base_types_1.ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
        }
        if (existingFactura.estado === 'PAGADA') {
            throw new base_types_1.ServiceException('FACTURA_PAGADA', 'La factura ya está pagada', 400);
        }
        if (existingFactura.estado === 'ANULADA') {
            throw new base_types_1.ServiceException('FACTURA_ANULADA', 'No se puede pagar una factura anulada', 400);
        }
        const factura = await database_1.prisma.factura.update({
            where: { id },
            data: { estado: 'PAGADA' },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
            },
        });
        return factura;
    }
    async findPendientes() {
        const facturas = await database_1.prisma.factura.findMany({
            where: {
                deletedAt: null,
                estado: 'PENDIENTE',
            },
            orderBy: { fechaVencimiento: 'asc' },
            select: {
                id: true,
                numero: true,
                concepto: true,
                importe: true,
                importeBase: true,
                importeIVA: true,
                estado: true,
                fechaEmision: true,
                fechaVencimiento: true,
                clienteId: true,
                expedienteId: true,
                createdAt: true,
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
                expediente: {
                    select: {
                        id: true,
                        numeroExpediente: true,
                    },
                },
            },
        });
        return facturas;
    }
    async findVencidas() {
        const now = new Date();
        const facturas = await database_1.prisma.factura.findMany({
            where: {
                deletedAt: null,
                estado: 'PENDIENTE',
                fechaVencimiento: {
                    lt: now,
                },
            },
            orderBy: { fechaVencimiento: 'asc' },
            select: {
                id: true,
                numero: true,
                concepto: true,
                importe: true,
                importeBase: true,
                importeIVA: true,
                estado: true,
                fechaEmision: true,
                fechaVencimiento: true,
                clienteId: true,
                expedienteId: true,
                createdAt: true,
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
                expediente: {
                    select: {
                        id: true,
                        numeroExpediente: true,
                    },
                },
            },
        });
        return facturas;
    }
    async getPdfUrl(id) {
        const existingFactura = await database_1.prisma.factura.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingFactura) {
            throw new base_types_1.ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
        }
        return { url: `/api/v1/facturas/${id}/download` };
    }
    async enviar(id, email) {
        const existingFactura = await database_1.prisma.factura.findFirst({
            where: { id, deletedAt: null },
            include: {
                cliente: true,
            },
        });
        if (!existingFactura) {
            throw new base_types_1.ServiceException('FACTURA_NOT_FOUND', 'Factura no encontrada', 404);
        }
        const destinatario = email || existingFactura.cliente?.email;
        if (!destinatario) {
            throw new base_types_1.ServiceException('NO_EMAIL', 'No se encontró email del cliente', 400);
        }
        return {
            message: 'Factura enviada correctamente',
            email: destinatario,
        };
    }
}
exports.facturaService = new FacturaService();
//# sourceMappingURL=factura.service.js.map