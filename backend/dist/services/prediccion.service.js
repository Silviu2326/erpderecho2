"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prediccionService = void 0;
const database_1 = require("../config/database");
const base_types_1 = require("./base.types");
const prediccion_dto_1 = require("../dtos/prediccion.dto");
const ai_service_1 = require("./ai.service");
class PrediccionService {
    async create(usuarioId, input) {
        const expediente = await database_1.prisma.expediente.findFirst({
            where: { id: input.expedienteId, deletedAt: null },
            include: {
                cliente: true,
                actuaciones: {
                    orderBy: { fecha: 'desc' },
                    take: 5,
                },
            },
        });
        if (!expediente) {
            throw new base_types_1.ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
        }
        let resultado;
        let probabilidad;
        let factoresAdicionales = {};
        // Usar IA para generar predicción real
        if (input.tipoPrediccion === prediccion_dto_1.TipoPrediccionEnum.RESULTADO ||
            input.tipoPrediccion === prediccion_dto_1.TipoPrediccionEnum.EXITO) {
            const analisisInput = {
                tipo: expediente.tipo,
                descripcion: expediente.descripcion || 'Sin descripción detallada',
                parteDemandante: expediente.cliente?.nombre,
            };
            const analisis = await ai_service_1.aiService.analizarCaso(analisisInput);
            if (input.tipoPrediccion === prediccion_dto_1.TipoPrediccionEnum.RESULTADO) {
                resultado = analisis.resultadoProbable;
                factoresAdicionales = {
                    argumentosClave: analisis.argumentosClave,
                    jurisprudenciaRelevante: analisis.jurisprudenciaRelevante,
                    recomendaciones: analisis.recomendaciones,
                };
            }
            else {
                resultado = `${analisis.probabilidadExito}%`;
            }
            probabilidad = analisis.probabilidadExito / 100;
        }
        else if (input.tipoPrediccion === prediccion_dto_1.TipoPrediccionEnum.DURACION) {
            const analisisInput = {
                tipo: expediente.tipo,
                descripcion: expediente.descripcion || '',
            };
            const analisis = await ai_service_1.aiService.analizarCaso(analisisInput);
            resultado = analisis.duracionEstimada;
            probabilidad = 0.75;
        }
        else if (input.tipoPrediccion === prediccion_dto_1.TipoPrediccionEnum.COSTES) {
            const analisisInput = {
                tipo: expediente.tipo,
                descripcion: expediente.descripcion || '',
            };
            const analisis = await ai_service_1.aiService.analizarCaso(analisisInput);
            resultado = analisis.costesEstimados;
            probabilidad = 0.70;
        }
        else {
            // Para otros tipos, usar mock simple
            resultado = this.getMockPrediction(input.tipoPrediccion);
            probabilidad = 0.65;
        }
        const prediccion = await database_1.prisma.prediccion.create({
            data: {
                expedienteId: input.expedienteId,
                tipoPrediccion: input.tipoPrediccion,
                resultado,
                probabilidad,
                factores: factoresAdicionales,
            },
        });
        return {
            ...prediccion,
            factores: factoresAdicionales,
        };
    }
    getMockPrediction(tipo) {
        const predictions = {
            [prediccion_dto_1.TipoPrediccionEnum.RESULTADO]: 'Favorable',
            [prediccion_dto_1.TipoPrediccionEnum.DURACION]: '6-12 meses',
            [prediccion_dto_1.TipoPrediccionEnum.COSTES]: '5000-10000 EUR',
            [prediccion_dto_1.TipoPrediccionEnum.EXITO]: '75%',
            [prediccion_dto_1.TipoPrediccionEnum.RIESGO_PRESCRIPCION]: 'Bajo',
        };
        return predictions[tipo] || 'Predicción no disponible';
    }
    async createAnalisisCompleto(usuarioId, expedienteId) {
        const expediente = await database_1.prisma.expediente.findFirst({
            where: { id: expedienteId, deletedAt: null },
            include: {
                cliente: true,
                actuaciones: {
                    orderBy: { fecha: 'desc' },
                    take: 5,
                },
            },
        });
        if (!expediente) {
            throw new base_types_1.ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
        }
        const analisisInput = {
            tipo: expediente.tipo,
            descripcion: expediente.descripcion || 'Sin descripción detallada',
            parteDemandante: expediente.cliente?.nombre,
        };
        // Generar análisis completo con IA
        const [prediccionResultado, estrategia] = await Promise.all([
            ai_service_1.aiService.analizarCaso(analisisInput),
            ai_service_1.aiService.generarEstrategia(analisisInput),
        ]);
        // Crear múltiples predicciones
        const predicciones = await database_1.prisma.$transaction([
            database_1.prisma.prediccion.create({
                data: {
                    expedienteId,
                    tipoPrediccion: prediccion_dto_1.TipoPrediccionEnum.RESULTADO,
                    resultado: prediccionResultado.resultadoProbable,
                    probabilidad: prediccionResultado.probabilidadExito / 100,
                    factores: {
                        argumentosClave: prediccionResultado.argumentosClave,
                        jurisprudenciaRelevante: prediccionResultado.jurisprudenciaRelevante,
                        recomendaciones: prediccionResultado.recomendaciones,
                    },
                },
            }),
            database_1.prisma.prediccion.create({
                data: {
                    expedienteId,
                    tipoPrediccion: prediccion_dto_1.TipoPrediccionEnum.EXITO,
                    resultado: `${prediccionResultado.probabilidadExito}%`,
                    probabilidad: prediccionResultado.probabilidadExito / 100,
                },
            }),
            database_1.prisma.prediccion.create({
                data: {
                    expedienteId,
                    tipoPrediccion: prediccion_dto_1.TipoPrediccionEnum.DURACION,
                    resultado: prediccionResultado.duracionEstimada,
                    probabilidad: 0.75,
                },
            }),
            database_1.prisma.prediccion.create({
                data: {
                    expedienteId,
                    tipoPrediccion: prediccion_dto_1.TipoPrediccionEnum.COSTES,
                    resultado: prediccionResultado.costesEstimados,
                    probabilidad: 0.70,
                },
            }),
        ]);
        return {
            predicciones,
            analisis: prediccionResultado,
            estrategia,
        };
    }
    async analizarSentimientoLead(leadId) {
        const lead = await database_1.prisma.lead.findFirst({
            where: { id: leadId, deletedAt: null },
        });
        if (!lead) {
            throw new base_types_1.ServiceException('LEAD_NOT_FOUND', 'Lead no encontrado', 404);
        }
        const texto = `${lead.nombre} ${lead.origen || ''} ${lead.estado} ${lead.empresa || ''}`;
        const analisis = await ai_service_1.aiService.analizarSentimiento(texto);
        return {
            leadId,
            sentimiento: analisis.sentimiento,
            probabilidad: analisis.confianza,
            factores: analisis.factores,
        };
    }
    async findAll(params) {
        const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', tipo, expediente_id } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (tipo) {
            where.tipoPrediccion = tipo;
        }
        if (expediente_id) {
            where.expedienteId = expediente_id;
        }
        const [predicciones, total] = await Promise.all([
            database_1.prisma.prediccion.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                select: {
                    id: true,
                    expedienteId: true,
                    tipoPrediccion: true,
                    resultado: true,
                    probabilidad: true,
                    createdAt: true,
                    factores: true,
                    expediente: {
                        select: {
                            id: true,
                            numeroExpediente: true,
                            tipo: true,
                        },
                    },
                },
            }),
            database_1.prisma.prediccion.count({ where }),
        ]);
        return {
            data: predicciones,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const prediccion = await database_1.prisma.prediccion.findFirst({
            where: { id, deletedAt: null },
            include: {
                expediente: {
                    select: {
                        id: true,
                        numeroExpediente: true,
                        tipo: true,
                        estado: true,
                        cliente: {
                            select: {
                                id: true,
                                nombre: true,
                            },
                        },
                    },
                },
            },
        });
        if (!prediccion) {
            throw new base_types_1.ServiceException('PREDICCION_NOT_FOUND', 'Predicción no encontrada', 404);
        }
        return prediccion;
    }
    async findByExpediente(expedienteId) {
        const predicciones = await database_1.prisma.prediccion.findMany({
            where: { expedienteId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                tipoPrediccion: true,
                resultado: true,
                probabilidad: true,
                createdAt: true,
                factores: true,
            },
        });
        return predicciones;
    }
    async getCasosSimilares(input) {
        const expediente = await database_1.prisma.expediente.findFirst({
            where: { id: input.expedienteId, deletedAt: null },
        });
        if (!expediente) {
            throw new base_types_1.ServiceException('EXPEDIENTE_NOT_FOUND', 'Expediente no encontrado', 404);
        }
        // Buscar casos similares por tipo y características
        const casosSimilares = await database_1.prisma.expediente.findMany({
            where: {
                id: { not: input.expedienteId },
                tipo: expediente.tipo,
                deletedAt: null,
            },
            take: input.limite || 5,
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
                predicciones: {
                    where: { deletedAt: null },
                    select: {
                        tipoPrediccion: true,
                        resultado: true,
                        probabilidad: true,
                    },
                },
            },
        });
        return casosSimilares;
    }
    async getTendencias(input) {
        const meses = input.meses || 12;
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - meses);
        const where = {
            createdAt: { gte: fechaInicio },
            deletedAt: null,
        };
        if (input.tipo) {
            where.tipoPrediccion = input.tipo;
        }
        const predicciones = await database_1.prisma.prediccion.findMany({
            where,
            select: {
                id: true,
                tipoPrediccion: true,
                resultado: true,
                probabilidad: true,
                createdAt: true,
                factores: true,
            },
        });
        // Análisis de tendencias
        const porTipo = predicciones.reduce((acc, pred) => {
            if (!acc[pred.tipoPrediccion]) {
                acc[pred.tipoPrediccion] = {
                    count: 0,
                    probabilidadPromedio: 0,
                };
            }
            acc[pred.tipoPrediccion].count += 1;
            acc[pred.tipoPrediccion].probabilidadPromedio += pred.probabilidad || 0;
            return acc;
        }, {});
        // Calcular promedios
        Object.keys(porTipo).forEach((key) => {
            porTipo[key].probabilidadPromedio =
                Math.round((porTipo[key].probabilidadPromedio / porTipo[key].count) * 100) / 100;
        });
        return {
            periodo: `${meses} meses`,
            totalPredicciones: predicciones.length,
            porTipo,
        };
    }
    async delete(id) {
        const prediccion = await database_1.prisma.prediccion.findFirst({
            where: { id, deletedAt: null },
        });
        if (!prediccion) {
            throw new base_types_1.ServiceException('PREDICCION_NOT_FOUND', 'Predicción no encontrada', 404);
        }
        await database_1.prisma.prediccion.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getEstadisticas(usuarioId) {
        const predicciones = await database_1.prisma.prediccion.findMany({
            where: { deletedAt: null },
        });
        const total = predicciones.length;
        const porTipo = predicciones.reduce((acc, p) => {
            if (!acc[p.tipoPrediccion]) {
                acc[p.tipoPrediccion] = { count: 0, probabilidadTotal: 0 };
            }
            acc[p.tipoPrediccion].count += 1;
            acc[p.tipoPrediccion].probabilidadTotal += p.probabilidad || 0;
            return acc;
        }, {});
        // Calcular promedios
        Object.keys(porTipo).forEach((key) => {
            porTipo[key].probabilidadPromedio =
                Math.round((porTipo[key].probabilidadTotal / porTipo[key].count) * 100) / 100;
            delete porTipo[key].probabilidadTotal;
        });
        return {
            total,
            porTipo,
        };
    }
}
exports.prediccionService = new PrediccionService();
//# sourceMappingURL=prediccion.service.js.map