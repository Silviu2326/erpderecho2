"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legislacionService = void 0;
const database_1 = require("../config/database");
const base_types_1 = require("./base.types");
const boe_service_1 = require("./boe.service");
const cendoj_service_1 = require("./cendoj.service");
const legislacionSelect = {
    id: true,
    titulo: true,
    tipo: true,
    fechaPublicacion: true,
    fuente: true,
    url: true,
    contenido: true,
    createdAt: true,
    updatedAt: true,
};
const favoritoSelect = {
    id: true,
    legislacionId: true,
    usuarioId: true,
    createdAt: true,
    legislacion: {
        select: legislacionSelect,
    },
};
const alertaSelect = {
    id: true,
    palabrasClave: true,
    tipo: true,
    activa: true,
    usuarioId: true,
    createdAt: true,
    updatedAt: true,
};
class LegislacionService {
    // Búsqueda en base de datos local
    async findAll(params) {
        const { page = 1, limit = 20, sort = 'fechaPublicacion', order = 'desc', tipo, search, fuente } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (tipo) {
            where.tipo = tipo;
        }
        if (fuente) {
            where.fuente = fuente;
        }
        if (search) {
            where.OR = [
                { titulo: { contains: search, mode: 'insensitive' } },
                { contenido: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [legislacion, total] = await Promise.all([
            database_1.prisma.legislacion.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                select: legislacionSelect,
            }),
            database_1.prisma.legislacion.count({ where }),
        ]);
        return {
            data: legislacion,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const legislacion = await database_1.prisma.legislacion.findFirst({
            where: { id },
            select: legislacionSelect,
        });
        if (!legislacion) {
            throw new base_types_1.ServiceException('LEGISLACION_NOT_FOUND', 'Legislación no encontrada', 404);
        }
        return legislacion;
    }
    // Búsqueda externa en BOE y/o CENDOJ
    async busquedaExterna(params) {
        const resultados = {};
        try {
            if (params.fuente === 'BOE' || params.fuente === 'TODAS') {
                const boeParams = {
                    q: params.query,
                    fechaDesde: params.fechaDesde,
                    fechaHasta: params.fechaHasta,
                    limit: params.limit || 10,
                };
                const boeResults = await boe_service_1.boeService.search(boeParams);
                resultados.boe = boeResults;
                // Sincronizar con BD si se solicita
                if (params.sincronizar) {
                    await boe_service_1.boeService.syncWithDatabase(database_1.prisma, boeResults);
                }
            }
        }
        catch (error) {
            console.error('Error en búsqueda BOE:', error);
            resultados.boeError = 'Error al consultar BOE';
        }
        try {
            if (params.fuente === 'CENDOJ' || params.fuente === 'TODAS') {
                const cendojParams = {
                    q: params.query,
                    fechaDesde: params.fechaDesde,
                    fechaHasta: params.fechaHasta,
                    limit: params.limit || 10,
                };
                const cendojResults = await cendoj_service_1.cendojService.search(cendojParams);
                resultados.cendoj = cendojResults;
                // Sincronizar con BD si se solicita
                if (params.sincronizar) {
                    await cendoj_service_1.cendojService.syncWithDatabase(database_1.prisma, cendojResults.results);
                }
            }
        }
        catch (error) {
            console.error('Error en búsqueda CENDOJ:', error);
            resultados.cendojError = 'Error al consultar CENDOJ';
        }
        if (!resultados.boe && !resultados.cendoj) {
            throw new base_types_1.ServiceException('SEARCH_ERROR', 'No se pudieron obtener resultados de ninguna fuente', 503);
        }
        return resultados;
    }
    // Búsqueda específica BOE
    async searchBOE(query, sincronizar = false) {
        try {
            const results = await boe_service_1.boeService.search({ q: query, limit: 20 });
            if (sincronizar) {
                await boe_service_1.boeService.syncWithDatabase(database_1.prisma, results);
            }
            return results;
        }
        catch (error) {
            console.error('Error buscando BOE:', error);
            // Fallback a BD local
            return this.findAll({ search: query, fuente: 'BOE' }).then(r => r.data);
        }
    }
    // Búsqueda específica CENDOJ
    async searchCENDOJ(query, sincronizar = false) {
        try {
            const results = await cendoj_service_1.cendojService.search({ q: query, limit: 10 });
            if (sincronizar) {
                await cendoj_service_1.cendojService.syncWithDatabase(database_1.prisma, results.results);
            }
            return results;
        }
        catch (error) {
            console.error('Error buscando CENDOJ:', error);
            // Fallback a BD local
            const localResults = await this.findAll({ search: query, fuente: 'CENDOJ' });
            return { results: localResults.data, total: localResults.meta.total };
        }
    }
    // Obtener documento específico de BOE
    async getBOEDocumento(id) {
        try {
            const documento = await boe_service_1.boeService.getDocumento(id);
            // Guardar en BD local
            await database_1.prisma.legislacion.upsert({
                where: { id: documento.id },
                update: {
                    titulo: documento.titulo,
                    tipo: documento.tipo,
                    url: documento.uri,
                    fechaPublicacion: new Date(documento.fecha),
                    fuente: 'BOE',
                    contenido: documento.textoCompleto || documento.extracto,
                },
                create: {
                    id: documento.id,
                    titulo: documento.titulo,
                    tipo: documento.tipo,
                    url: documento.uri,
                    fechaPublicacion: new Date(documento.fecha),
                    fuente: 'BOE',
                    contenido: documento.textoCompleto || documento.extracto,
                },
            });
            return documento;
        }
        catch (error) {
            console.error('Error obteniendo documento BOE:', error);
            throw new base_types_1.ServiceException('BOE_ERROR', 'Error al obtener documento del BOE', 503);
        }
    }
    // Obtener sentencia específica de CENDOJ
    async getCENDOJSentencia(id) {
        try {
            const sentencia = await cendoj_service_1.cendojService.getSentencia(id);
            // Guardar en BD local
            await database_1.prisma.legislacion.upsert({
                where: { id: sentencia.id },
                update: {
                    titulo: sentencia.titulo,
                    tipo: sentencia.tipoResolucion,
                    url: sentencia.url,
                    fechaPublicacion: new Date(sentencia.fecha),
                    fuente: 'CENDOJ',
                    contenido: sentencia.extracto,
                },
                create: {
                    id: sentencia.id,
                    titulo: sentencia.titulo,
                    tipo: sentencia.tipoResolucion,
                    url: sentencia.url,
                    fechaPublicacion: new Date(sentencia.fecha),
                    fuente: 'CENDOJ',
                    contenido: sentencia.extracto,
                },
            });
            return sentencia;
        }
        catch (error) {
            console.error('Error obteniendo sentencia CENDOJ:', error);
            throw new base_types_1.ServiceException('CENDOJ_ERROR', 'Error al obtener sentencia del CENDOJ', 503);
        }
    }
    // Sincronización masiva
    async sincronizarFuentesExternas(dias = 7) {
        const resultados = { boe: 0, cendoj: 0, errores: [] };
        const fechaHasta = new Date().toISOString().split('T')[0];
        const fechaDesde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        try {
            // Sincronizar BOE
            const boeResults = await boe_service_1.boeService.searchByDateRange(fechaDesde, fechaHasta);
            await boe_service_1.boeService.syncWithDatabase(database_1.prisma, boeResults);
            resultados.boe = boeResults.length;
        }
        catch (error) {
            resultados.errores.push(`BOE: ${error.message}`);
        }
        // Nota: CENDOJ no tiene búsqueda por rango, solo se sincroniza búsqueda específica
        // Para sincronización masiva de CENDOJ se necesitaría iterar por términos de búsqueda
        return resultados;
    }
    // Gestión de favoritos
    async getFavoritos(usuarioId, params) {
        const { page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const [favoritos, total] = await Promise.all([
            database_1.prisma.favorito.findMany({
                where: { usuarioId, deletedAt: null },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: favoritoSelect,
            }),
            database_1.prisma.favorito.count({ where: { usuarioId, deletedAt: null } }),
        ]);
        return {
            data: favoritos,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async addFavorito(usuarioId, input) {
        const existingLegislacion = await database_1.prisma.legislacion.findFirst({
            where: { id: input.legislacionId },
        });
        if (!existingLegislacion) {
            throw new base_types_1.ServiceException('LEGISLACION_NOT_FOUND', 'Legislación no encontrada', 404);
        }
        const existingFavorito = await database_1.prisma.favorito.findFirst({
            where: { usuarioId, legislacionId: input.legislacionId, deletedAt: null },
        });
        if (existingFavorito) {
            throw new base_types_1.ServiceException('FAVORITO_EXISTS', 'El favorito ya existe', 409);
        }
        const favorito = await database_1.prisma.favorito.create({
            data: {
                usuarioId,
                legislacionId: input.legislacionId,
            },
            select: favoritoSelect,
        });
        return favorito;
    }
    async removeFavorito(usuarioId, legislacionId) {
        const existingFavorito = await database_1.prisma.favorito.findFirst({
            where: { usuarioId, legislacionId, deletedAt: null },
        });
        if (!existingFavorito) {
            throw new base_types_1.ServiceException('FAVORITO_NOT_FOUND', 'Favorito no encontrado', 404);
        }
        await database_1.prisma.favorito.update({
            where: { id: existingFavorito.id },
            data: { deletedAt: new Date() },
        });
    }
    // Gestión de alertas
    async getAlertas(usuarioId, params) {
        const { page = 1, limit = 20, activa } = params;
        const skip = (page - 1) * limit;
        const where = { usuarioId, deletedAt: null };
        if (activa !== undefined) {
            where.activa = activa;
        }
        const [alertas, total] = await Promise.all([
            database_1.prisma.alerta.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: alertaSelect,
            }),
            database_1.prisma.alerta.count({ where }),
        ]);
        return {
            data: alertas,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async createAlerta(usuarioId, input) {
        const alerta = await database_1.prisma.alerta.create({
            data: {
                ...input,
                usuarioId,
            },
            select: alertaSelect,
        });
        return alerta;
    }
    async updateAlerta(id, usuarioId, input) {
        const existingAlerta = await database_1.prisma.alerta.findFirst({
            where: { id, usuarioId, deletedAt: null },
        });
        if (!existingAlerta) {
            throw new base_types_1.ServiceException('ALERTA_NOT_FOUND', 'Alerta no encontrada', 404);
        }
        const alerta = await database_1.prisma.alerta.update({
            where: { id },
            data: input,
            select: alertaSelect,
        });
        return alerta;
    }
    async deleteAlerta(id, usuarioId) {
        const existingAlerta = await database_1.prisma.alerta.findFirst({
            where: { id, usuarioId, deletedAt: null },
        });
        if (!existingAlerta) {
            throw new base_types_1.ServiceException('ALERTA_NOT_FOUND', 'Alerta no encontrada', 404);
        }
        await database_1.prisma.alerta.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async toggleAlerta(id, usuarioId) {
        const existingAlerta = await database_1.prisma.alerta.findFirst({
            where: { id, usuarioId, deletedAt: null },
        });
        if (!existingAlerta) {
            throw new base_types_1.ServiceException('ALERTA_NOT_FOUND', 'Alerta no encontrada', 404);
        }
        const alerta = await database_1.prisma.alerta.update({
            where: { id },
            data: { activa: !existingAlerta.activa },
            select: alertaSelect,
        });
        return alerta;
    }
    // Verificar alertas y buscar nuevas publicaciones
    async verificarAlertas(usuarioId) {
        const alertas = await database_1.prisma.alerta.findMany({
            where: { usuarioId, activa: true, deletedAt: null },
        });
        const nuevosResultados = [];
        for (const alerta of alertas) {
            try {
                // Buscar en BOE
                const boeResults = await boe_service_1.boeService.search({
                    q: alerta.palabrasClave,
                    limit: 5,
                });
                // Buscar en CENDOJ
                const cendojResults = await cendoj_service_1.cendojService.search({
                    q: alerta.palabrasClave,
                    limit: 5,
                });
                nuevosResultados.push({
                    alerta: alerta.palabrasClave,
                    boe: boeResults,
                    cendoj: cendojResults.results,
                });
            }
            catch (error) {
                console.error(`Error verificando alerta ${alerta.id}:`, error);
            }
        }
        return {
            alertasVerificadas: alertas.length,
            nuevosResultados,
        };
    }
}
exports.legislacionService = new LegislacionService();
//# sourceMappingURL=legislacion.service.js.map