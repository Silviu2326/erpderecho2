"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const auth_1 = require("../middleware/auth");
const legislacion_service_1 = require("../services/legislacion.service");
const legislacion_dto_1 = require("../dtos/legislacion.dto");
const router = (0, express_1.Router)();
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
// Listar legislación de BD local
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(legislacion_dto_1.QueryLegislacionDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const resultado = await legislacion_service_1.legislacionService.findAll({
            page: dto.page || 1,
            limit: dto.limit || 20,
            sort: dto.sort,
            order: dto.order,
            tipo: dto.tipo,
            search: dto.search,
            fuente: req.query.fuente,
        });
        res.json(formatResponse(resultado.data, resultado.meta));
    }
    catch (error) {
        console.error('List legislacion error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Búsqueda externa (BOE y/o CENDOJ)
router.get('/buscar-externo', auth_1.authMiddleware, async (req, res) => {
    try {
        const { fuente, q, fechaDesde, fechaHasta, sincronizar, limit } = req.query;
        if (!q) {
            res.status(400).json({
                success: false,
                error: { message: 'Parámetro q (query) es requerido' }
            });
            return;
        }
        const resultado = await legislacion_service_1.legislacionService.busquedaExterna({
            fuente: fuente || 'TODAS',
            query: q,
            fechaDesde: fechaDesde,
            fechaHasta: fechaHasta,
            limit: limit ? parseInt(limit) : 10,
            sincronizar: sincronizar === 'true',
        });
        res.json(formatResponse(resultado));
    }
    catch (error) {
        console.error('Busqueda externa error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Búsqueda específica en BOE
router.get('/boe/buscar', auth_1.authMiddleware, async (req, res) => {
    try {
        const { q, sincronizar, limit } = req.query;
        if (!q) {
            res.status(400).json({
                success: false,
                error: { message: 'Parámetro q (query) es requerido' }
            });
            return;
        }
        const resultado = await legislacion_service_1.legislacionService.searchBOE(q, sincronizar === 'true');
        res.json(formatResponse(resultado.slice(0, limit ? parseInt(limit) : 20)));
    }
    catch (error) {
        console.error('BOE search error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Error al buscar en BOE'
            }
        });
    }
});
// Obtener documento específico de BOE
router.get('/boe/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await legislacion_service_1.legislacionService.getBOEDocumento(id);
        res.json(formatResponse(resultado));
    }
    catch (error) {
        console.error('BOE get error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Error al obtener documento BOE'
            }
        });
    }
});
// Búsqueda específica en CENDOJ
router.get('/cendoj/buscar', auth_1.authMiddleware, async (req, res) => {
    try {
        const { q, sincronizar, limit, page } = req.query;
        if (!q) {
            res.status(400).json({
                success: false,
                error: { message: 'Parámetro q (query) es requerido' }
            });
            return;
        }
        const resultado = await legislacion_service_1.legislacionService.searchCENDOJ(q, sincronizar === 'true');
        // Aplicar paginación manual si es necesario
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        const start = (pageNum - 1) * limitNum;
        const paginatedResults = resultado.results.slice(start, start + limitNum);
        res.json(formatResponse(paginatedResults, {
            page: pageNum,
            limit: limitNum,
            total: resultado.total,
            totalPages: Math.ceil(resultado.total / limitNum),
        }));
    }
    catch (error) {
        console.error('CENDOJ search error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Error al buscar en CENDOJ'
            }
        });
    }
});
// Obtener sentencia específica de CENDOJ
router.get('/cendoj/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await legislacion_service_1.legislacionService.getCENDOJSentencia(id);
        res.json(formatResponse(resultado));
    }
    catch (error) {
        console.error('CENDOJ get error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Error al obtener sentencia CENDOJ'
            }
        });
    }
});
// Sincronización masiva
router.post('/sincronizar', auth_1.authMiddleware, async (req, res) => {
    try {
        const { dias } = req.body;
        const resultado = await legislacion_service_1.legislacionService.sincronizarFuentesExternas(dias || 7);
        res.json(formatResponse(resultado));
    }
    catch (error) {
        console.error('Sincronizar error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Error al sincronizar'
            }
        });
    }
});
// Novedades (últimas publicaciones)
router.get('/novedades', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        // Obtener últimas entradas de BOE y CENDOJ
        const [boeResults, cendojResults] = await Promise.all([
            legislacion_service_1.legislacionService.searchBOE('', false).catch(() => []),
            legislacion_service_1.legislacionService.searchCENDOJ('', false).catch(() => ({ results: [], total: 0 })),
        ]);
        const allResults = [
            ...boeResults.map((r) => ({ ...r, origen: 'BOE' })),
            ...cendojResults.results.map((r) => ({ ...r, origen: 'CENDOJ' })),
        ];
        allResults.sort((a, b) => new Date(b.fecha || b.fechaPublicacion).getTime() - new Date(a.fecha || a.fechaPublicacion).getTime());
        const skip = (Number(page) - 1) * Number(limit);
        const paginatedResults = allResults.slice(skip, skip + Number(limit));
        res.json(formatResponse(paginatedResults, {
            page: Number(page),
            limit: Number(limit),
            total: allResults.length,
            totalPages: Math.ceil(allResults.length / Number(limit)),
        }));
    }
    catch (error) {
        console.error('Novedades error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Favoritos
router.get('/favoritos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(legislacion_dto_1.QueryFavoritoDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const resultado = await legislacion_service_1.legislacionService.getFavoritos(req.user.id, {
            page: dto.page || 1,
            limit: dto.limit || 20,
        });
        res.json(formatResponse(resultado.data, resultado.meta));
    }
    catch (error) {
        console.error('List favoritos error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
router.post('/favoritos', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(legislacion_dto_1.CreateFavoritoDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const favorito = await legislacion_service_1.legislacionService.addFavorito(req.user.id, dto);
        res.status(201).json(formatResponse(favorito));
    }
    catch (error) {
        console.error('Create favorito error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
router.delete('/favoritos/:legislacionId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { legislacionId } = req.params;
        await legislacion_service_1.legislacionService.removeFavorito(req.user.id, legislacionId);
        res.json(formatResponse({ message: 'Favorito eliminado correctamente' }));
    }
    catch (error) {
        console.error('Delete favorito error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Alertas
router.get('/alertas', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(legislacion_dto_1.QueryAlertaDto, req.query);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const resultado = await legislacion_service_1.legislacionService.getAlertas(req.user.id, {
            page: dto.page || 1,
            limit: dto.limit || 20,
            activa: dto.activa,
        });
        res.json(formatResponse(resultado.data, resultado.meta));
    }
    catch (error) {
        console.error('List alertas error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
router.post('/alertas', auth_1.authMiddleware, async (req, res) => {
    try {
        const dto = (0, class_transformer_1.plainToInstance)(legislacion_dto_1.CreateAlertaDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const alerta = await legislacion_service_1.legislacionService.createAlerta(req.user.id, dto);
        res.status(201).json(formatResponse(alerta));
    }
    catch (error) {
        console.error('Create alerta error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
router.put('/alertas/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dto = (0, class_transformer_1.plainToInstance)(legislacion_dto_1.UpdateAlertaDto, req.body);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
            return;
        }
        const alerta = await legislacion_service_1.legislacionService.updateAlerta(id, req.user.id, dto);
        res.json(formatResponse(alerta));
    }
    catch (error) {
        console.error('Update alerta error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
router.delete('/alertas/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await legislacion_service_1.legislacionService.deleteAlerta(id, req.user.id);
        res.json(formatResponse({ message: 'Alerta eliminada correctamente' }));
    }
    catch (error) {
        console.error('Delete alerta error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
router.patch('/alertas/:id/toggle', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const alerta = await legislacion_service_1.legislacionService.toggleAlerta(id, req.user.id);
        res.json(formatResponse(alerta));
    }
    catch (error) {
        console.error('Toggle alerta error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error'
            }
        });
    }
});
// Verificar alertas (buscar nuevos resultados)
router.post('/alertas/verificar', auth_1.authMiddleware, async (req, res) => {
    try {
        const resultado = await legislacion_service_1.legislacionService.verificarAlertas(req.user.id);
        res.json(formatResponse(resultado));
    }
    catch (error) {
        console.error('Verificar alertas error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Error al verificar alertas'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=legislacion.js.map