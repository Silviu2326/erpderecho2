export interface CENDOJResult {
    id: string;
    numeroResolucion: string;
    titulo: string;
    fecha: string;
    organo: string;
    tipoResolucion: string;
    sede: string;
    procedimiento: string;
    extracto: string;
    url: string;
    materias: string[];
    ponente?: string;
}
export interface CENDOJQueryParams {
    q?: string;
    organo?: string;
    tipoResolucion?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    sede?: string;
    materia?: string;
    limit?: number;
    page?: number;
}
/**
 * Servicio para CENDOJ con scraping controlado
 *
 * NOTA IMPORTANTE: Este scraper respeta las siguientes reglas:
 * - Rate limiting: Máximo 1 petición cada 3 segundos
 * - Cache: Resultados cacheados 24h para evitar peticiones repetidas
 * - User-Agent identificativo
 * - Sin descarga masiva automatizada
 *
 * El scraping de datos públicos es legal en España (Ley 37/2007, reutilización información sector público)
 * siempre que se respeten los términos de uso del servicio.
 */
declare class CENDOJService {
    private baseURL;
    private cendojBaseURL;
    private lastRequestTime;
    private minRequestInterval;
    private cache;
    private cacheTTL;
    private rateLimit;
    private getCacheKey;
    private getCached;
    private setCache;
    /**
     * Buscar sentencias en CENDOJ
     */
    search(params: CENDOJQueryParams): Promise<{
        results: CENDOJResult[];
        total: number;
        page: number;
    }>;
    /**
     * Obtener detalle de una sentencia
     */
    getSentencia(id: string): Promise<CENDOJResult>;
    /**
     * Parsear resultados de búsqueda
     */
    private parseResults;
    /**
     * Parsear detalle de sentencia
     */
    private parseDetail;
    /**
     * Extraer total de resultados
     */
    private extractTotal;
    private extractIdFromUrl;
    private generateId;
    private extractNumeroResolucion;
    private extractFecha;
    private extractOrgano;
    private extractTipoResolucion;
    private extractSede;
    private extractProcedimiento;
    private extractMaterias;
    private extractExtracto;
    private extractExtractoDetalle;
    private extractPonente;
    /**
     * Sincronizar resultados con base de datos
     */
    syncWithDatabase(prisma: any, results: CENDOJResult[]): Promise<void>;
    /**
     * Limpiar cache
     */
    clearCache(): void;
    /**
     * Obtener estadísticas del cache
     */
    getCacheStats(): {
        size: number;
        entries: string[];
    };
}
export declare const cendojService: CENDOJService;
export {};
//# sourceMappingURL=cendoj.service.d.ts.map