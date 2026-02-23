"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const crm_dto_1 = require("../dtos/crm.dto");
const router = (0, express_1.Router)();
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
router.get('/leads', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.QueryLeadDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, estado } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (estado) {
            where.estado = estado;
        }
        if (search) {
            where.OR = [
                { nombre: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { empresa: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [leads, total] = await Promise.all([
            database_1.prisma.lead.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                        },
                    },
                    oportunidades: {
                        select: {
                            id: true,
                            titulo: true,
                            estado: true,
                            importe: true,
                            etapa: true,
                        },
                    },
                },
            }),
            database_1.prisma.lead.count({ where }),
        ]);
        res.json(formatResponse(leads, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List leads error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/leads', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.CreateLeadDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const lead = await database_1.prisma.lead.create({
            data: dto,
        });
        res.status(201).json(formatResponse(lead));
    }
    catch (error) {
        console.error('Create lead error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/leads/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.UpdateLeadDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingLead = await database_1.prisma.lead.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingLead) {
            res.status(404).json({ success: false, error: { message: 'Lead not found' } });
            return;
        }
        const lead = await database_1.prisma.lead.update({
            where: { id },
            data: dto,
        });
        res.json(formatResponse(lead));
    }
    catch (error) {
        console.error('Update lead error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/leads/:id/convertir', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.ConvertirLeadDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingLead = await database_1.prisma.lead.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingLead) {
            res.status(404).json({ success: false, error: { message: 'Lead not found' } });
            return;
        }
        const [oportunidad] = await database_1.prisma.$transaction([
            database_1.prisma.oportunidad.create({
                data: {
                    titulo: dto.titulo,
                    leadId: id,
                    estado: 'EN_PROCESO',
                    probabilidad: dto.probabilidad ?? 10,
                    importe: dto.importe ?? 0,
                    etapa: (dto.etapa ?? 'PROSPECTO'),
                    usuarioId: dto.usuarioId ?? req.user?.id,
                },
            }),
            database_1.prisma.lead.update({
                where: { id },
                data: { estado: 'CONVERTIDO' },
            }),
        ]);
        res.status(201).json(formatResponse(oportunidad));
    }
    catch (error) {
        console.error('Convert lead error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/oportunidades', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.QueryOportunidadDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, estado, etapa, usuarioId } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (estado) {
            where.estado = estado;
        }
        if (etapa) {
            where.etapa = etapa;
        }
        if (usuarioId) {
            where.usuarioId = usuarioId;
        }
        if (search) {
            where.OR = [
                { titulo: { contains: search, mode: 'insensitive' } },
                { lead: { nombre: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [oportunidades, total] = await Promise.all([
            database_1.prisma.oportunidad.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                include: {
                    lead: {
                        select: {
                            id: true,
                            nombre: true,
                            empresa: true,
                        },
                    },
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido1: true,
                        },
                    },
                    _count: {
                        select: {
                            actividades: true,
                            notas: true,
                        },
                    },
                },
            }),
            database_1.prisma.oportunidad.count({ where }),
        ]);
        res.json(formatResponse(oportunidades, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List oportunidades error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/oportunidades', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.CreateOportunidadDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const oportunidad = await database_1.prisma.oportunidad.create({
            data: {
                ...dto,
                usuarioId: dto.usuarioId ?? req.user?.id,
            },
        });
        res.status(201).json(formatResponse(oportunidad));
    }
    catch (error) {
        console.error('Create oportunidad error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/oportunidades/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.UpdateOportunidadDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingOportunidad = await database_1.prisma.oportunidad.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingOportunidad) {
            res.status(404).json({ success: false, error: { message: 'Oportunidad not found' } });
            return;
        }
        const oportunidad = await database_1.prisma.oportunidad.update({
            where: { id },
            data: dto,
        });
        res.json(formatResponse(oportunidad));
    }
    catch (error) {
        console.error('Update oportunidad error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/pipeline', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.QueryPipelineDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { usuarioId } = dto;
        const where = {
            deletedAt: null,
            estado: { notIn: ['GANADA', 'PERDIDA'] },
        };
        if (usuarioId) {
            where.usuarioId = usuarioId;
        }
        const oportunidades = await database_1.prisma.oportunidad.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                lead: {
                    select: {
                        id: true,
                        nombre: true,
                        empresa: true,
                    },
                },
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        apellido1: true,
                    },
                },
                _count: {
                    select: {
                        actividades: true,
                        notas: true,
                    },
                },
            },
        });
        const etapas = ['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE'];
        const pipeline = {};
        for (const etapa of etapas) {
            pipeline[etapa] = oportunidades.filter((o) => o.etapa === etapa);
        }
        const totales = {
            cantidad: oportunidades.length,
            importe: oportunidades.reduce((sum, o) => sum + o.importe, 0),
            probabilidadPonderada: oportunidades.length > 0
                ? oportunidades.reduce((sum, o) => sum + (o.importe * o.probabilidad), 0) / oportunidades.reduce((sum, o) => sum + o.importe, 0) || 0
                : 0,
        };
        res.json(formatResponse({ pipeline, totales }));
    }
    catch (error) {
        console.error('Get pipeline error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/contactos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.QueryContactoDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, search } = dto;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { nombre: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { cargo: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [contactos, total] = await Promise.all([
            database_1.prisma.contacto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                        },
                    },
                },
            }),
            database_1.prisma.contacto.count({ where }),
        ]);
        res.json(formatResponse(contactos, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List contactos error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/contactos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.CreateContactoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingCliente = await database_1.prisma.cliente.findFirst({
            where: { id: dto.clienteId, deletedAt: null },
        });
        if (!existingCliente) {
            res.status(404).json({ success: false, error: { message: 'Cliente not found' } });
            return;
        }
        const contacto = await database_1.prisma.contacto.create({
            data: dto,
        });
        res.status(201).json(formatResponse(contacto));
    }
    catch (error) {
        console.error('Create contacto error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.get('/actividades', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.QueryActividadDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const { page = 1, limit = 20, sort = 'fecha', order = 'asc', oportunidadId, usuarioId, completada } = dto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (oportunidadId) {
            where.oportunidadId = oportunidadId;
        }
        if (usuarioId) {
            where.usuarioId = usuarioId;
        }
        if (completada !== undefined) {
            where.completada = completada;
        }
        const [actividades, total] = await Promise.all([
            database_1.prisma.actividad.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                include: {
                    oportunidad: {
                        select: {
                            id: true,
                            titulo: true,
                            etapa: true,
                        },
                    },
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido1: true,
                        },
                    },
                },
            }),
            database_1.prisma.actividad.count({ where }),
        ]);
        res.json(formatResponse(actividades, {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error('List actividades error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.post('/actividades', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.CreateActividadDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const actividad = await database_1.prisma.actividad.create({
            data: {
                ...dto,
                fecha: new Date(dto.fecha),
                usuarioId: dto.usuarioId ?? req.user?.id,
            },
        });
        res.status(201).json(formatResponse(actividad));
    }
    catch (error) {
        console.error('Create actividad error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.put('/actividades/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(crm_dto_1.UpdateActividadDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const existingActividad = await database_1.prisma.actividad.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingActividad) {
            res.status(404).json({ success: false, error: { message: 'Actividad not found' } });
            return;
        }
        const updateData = { ...dto };
        if (dto.fecha) {
            updateData.fecha = new Date(dto.fecha);
        }
        const actividad = await database_1.prisma.actividad.update({
            where: { id },
            data: updateData,
        });
        res.json(formatResponse(actividad));
    }
    catch (error) {
        console.error('Update actividad error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
router.delete('/actividades/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const existingActividad = await database_1.prisma.actividad.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existingActividad) {
            res.status(404).json({ success: false, error: { message: 'Actividad not found' } });
            return;
        }
        await database_1.prisma.actividad.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        res.json(formatResponse({ message: 'Actividad deleted successfully' }));
    }
    catch (error) {
        console.error('Delete actividad error:', error);
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});
exports.default = router;
//# sourceMappingURL=crm.js.map