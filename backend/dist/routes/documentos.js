"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const auth_1 = require("../middleware/auth");
const documento_service_1 = require("../services/documento.service");
const documento_dto_1 = require("../dtos/documento.dto");
const router = (0, express_1.Router)();
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
// Listar documentos
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(documento_dto_1.QueryDocumentoDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const resultado = await documento_service_1.documentoService.findAll({
            page: dto.page || 1,
            limit: dto.limit || 20,
            sort: dto.sort || 'createdAt',
            order: dto.order || 'desc',
            search: dto.search,
            expediente_id: dto.expediente_id,
            tipo: dto.tipo,
        });
        res.json(formatResponse(resultado.data, resultado.meta));
    }
    catch (error) {
        console.error('List documentos error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Crear documento
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(documento_dto_1.CreateDocumentoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const documento = await documento_service_1.documentoService.create(dto, req.user.id);
        res.status(201).json(formatResponse(documento));
    }
    catch (error) {
        console.error('Create documento error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Obtener documento por ID
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await documento_service_1.documentoService.findById(id);
        res.json(formatResponse(documento));
    }
    catch (error) {
        console.error('Get documento error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Actualizar documento
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(documento_dto_1.UpdateDocumentoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const documento = await documento_service_1.documentoService.update(id, dto);
        res.json(formatResponse(documento));
    }
    catch (error) {
        console.error('Update documento error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Eliminar documento
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await documento_service_1.documentoService.delete(id);
        res.json(formatResponse({ message: 'Documento eliminado correctamente' }));
    }
    catch (error) {
        console.error('Delete documento error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Descargar documento
router.get('/:id/descargar', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { filePath, fileName } = await documento_service_1.documentoService.download(id);
        res.download(filePath, fileName);
    }
    catch (error) {
        console.error('Download documento error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Procesar OCR de un documento
router.post('/:id/ocr', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await documento_service_1.documentoService.processOcr(id);
        res.json(formatResponse(resultado));
    }
    catch (error) {
        console.error('OCR documento error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Procesar OCR en batch
router.post('/ocr/batch', auth_1.authMiddleware, async (req, res) => {
    try {
        const { documentoIds } = req.body;
        if (!documentoIds || !Array.isArray(documentoIds) || documentoIds.length === 0) {
            res.status(400).json({
                success: false,
                error: { message: 'documentoIds es requerido y debe ser un array' }
            });
            return;
        }
        const resultado = await documento_service_1.documentoService.batchOcr(documentoIds);
        res.json(formatResponse({
            procesados: resultado.results.length,
            fallidos: resultado.failed.length,
            idsFallidos: resultado.failed,
            message: `Procesados ${resultado.results.length} documentos, ${resultado.failed.length} fallidos`,
        }));
    }
    catch (error) {
        console.error('OCR batch error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Buscar en contenido de documentos
router.get('/search/contenido', auth_1.authMiddleware, async (req, res) => {
    try {
        const { q, page, limit } = req.query;
        if (!q || typeof q !== 'string') {
            res.status(400).json({
                success: false,
                error: { message: 'Parámetro q (query) es requerido' }
            });
            return;
        }
        const resultado = await documento_service_1.documentoService.searchByContent(q, {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
        res.json(formatResponse(resultado.data, resultado.meta));
    }
    catch (error) {
        console.error('Search documentos error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=documentos.js.map