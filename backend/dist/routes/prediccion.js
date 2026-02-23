"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const auth_1 = require("../middleware/auth");
const prediccion_service_1 = require("../services/prediccion.service");
const prediccion_dto_1 = require("../dtos/prediccion.dto");
const router = (0, express_1.Router)();
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
// Crear predicción individual con IA
router.post('/caso', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(prediccion_dto_1.CreatePrediccionDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const prediccion = await prediccion_service_1.prediccionService.create(req.user.id, {
            expedienteId: dto.expedienteId,
            tipoPrediccion: dto.tipoPrediccion,
        });
        res.status(201).json(formatResponse({
            ...prediccion,
            modelo: 'OPENAI_GPT',
            nota: 'Predicción generada por IA basada en análisis del caso.',
        }));
    }
    catch (error) {
        console.error('Create prediccion error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message
            }
        });
    }
});
// Crear análisis completo del caso con IA
router.post('/caso/:expedienteId/analisis-completo', auth_1.authMiddleware, async (req, res) => {
    try {
        const { expedienteId } = req.params;
        const resultado = await prediccion_service_1.prediccionService.createAnalisisCompleto(req.user.id, expedienteId);
        res.status(201).json(formatResponse({
            ...resultado,
            modelo: 'OPENAI_GPT',
            nota: 'Análisis completo generado por IA incluyendo predicciones, estrategia y recomendaciones.',
        }));
    }
    catch (error) {
        console.error('Analisis completo error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message
            }
        });
    }
});
// Analizar sentimiento de un lead
router.post('/lead/:leadId/sentimiento', auth_1.authMiddleware, async (req, res) => {
    try {
        const { leadId } = req.params;
        const resultado = await prediccion_service_1.prediccionService.analizarSentimientoLead(leadId);
        res.json(formatResponse({
            ...resultado,
            modelo: 'OPENAI_GPT',
            nota: 'Análisis de sentimiento generado por IA.',
        }));
    }
    catch (error) {
        console.error('Analizar sentimiento error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message
            }
        });
    }
});
// Obtener predicciones de un expediente
router.get('/caso/:expedienteId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { expedienteId } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(prediccion_dto_1.QueryPrediccionDto, req.query);
        const resultado = await prediccion_service_1.prediccionService.findByExpediente(expedienteId);
        res.json(formatResponse(resultado));
    }
    catch (error) {
        console.error('Get predicciones error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message
            }
        });
    }
});
// Listar todas las predicciones con paginación
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(prediccion_dto_1.QueryPrediccionDto, req.query);
        const resultado = await prediccion_service_1.prediccionService.findAll({
            page: dto.page || 1,
            limit: dto.limit || 20,
            tipo: dto.tipo,
            expediente_id: dto.expediente_id,
        });
        res.json(formatResponse(resultado.data, resultado.meta));
    }
    catch (error) {
        console.error('List predicciones error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message
            }
        });
    }
});
// Obtener una predicción por ID
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const prediccion = await prediccion_service_1.prediccionService.findById(id);
        res.json(formatResponse(prediccion));
    }
    catch (error) {
        console.error('Get prediccion error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message
            }
        });
    }
});
// Obtener tendencias
router.get('/stats/tendencias', auth_1.authMiddleware, async (req, res) => {
    try {
        const { tipo, meses } = req.query;
        const resultado = await prediccion_service_1.prediccionService.getTendencias({
            tipo: tipo,
            meses: meses ? parseInt(meses) : undefined,
        });
        res.json(formatResponse(resultado));
    }
    catch (error) {
        console.error('Get tendencias error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message
            }
        });
    }
});
// Obtener casos similares
router.get('/casos-similares/:expedienteId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { expedienteId } = req.params;
        const { limite } = req.query;
        const resultado = await prediccion_service_1.prediccionService.getCasosSimilares({
            expedienteId,
            limite: limite ? parseInt(limite) : undefined,
        });
        res.json(formatResponse({
            expedienteReferencia: expedienteId,
            casosSimilares: resultado,
            nota: 'Casos similares basados en tipo y características.',
        }));
    }
    catch (error) {
        console.error('Get casos similares error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message
            }
        });
    }
});
// Dashboard de predicciones
router.get('/stats/dashboard', auth_1.authMiddleware, async (req, res) => {
    try {
        const resultado = await prediccion_service_1.prediccionService.getEstadisticas(req.user.id);
        res.json(formatResponse({
            ...resultado,
            generado: new Date().toISOString(),
        }));
    }
    catch (error) {
        console.error('Get dashboard error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message
            }
        });
    }
});
// Eliminar predicción
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await prediccion_service_1.prediccionService.delete(id);
        res.json(formatResponse({ message: 'Predicción eliminada correctamente' }));
    }
    catch (error) {
        console.error('Delete prediccion error:', error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=prediccion.js.map