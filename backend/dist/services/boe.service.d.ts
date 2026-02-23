export interface BOEResult {
    id: string;
    titulo: string;
    uri: string;
    pdf: string;
    fecha: string;
    departamento: string;
    seccion: string;
    subseccion: string;
    tipo: string;
    extracto?: string;
    textoCompleto?: string;
}
export interface BOEQueryParams {
    q?: string;
    fecha?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    seccion?: string;
    subseccion?: string;
    departamento?: string;
    numero?: string;
    limit?: number;
}
declare class BOEService {
    private baseURL;
    private lastRequestTime;
    private minRequestInterval;
    private rateLimit;
    /**
     * Buscar en el BOE por términos
     * API: https://www.boe.es/datos_abiertos/BOE/[AÑO]/[NÚMERO BOE]/[ID]
     */
    search(params: BOEQueryParams): Promise<BOEResult[]>;
    /**
     * Obtener un documento específico del BOE
     */
    getDocumento(id: string): Promise<BOEResult>;
    /**
     * Buscar por rango de fechas
     */
    searchByDateRange(fechaDesde: string, fechaHasta: string, query?: string): Promise<BOEResult[]>;
    /**
     * Obtener últimas disposiciones publicadas
     */
    getUltimasDisposiciones(limit?: number): Promise<BOEResult[]>;
    /**
     * Parsear XML del sumario
     * Nota: Implementación simplificada - en producción usar una librería XML
     */
    private parseSumarioXML;
    /**
     * Parsear XML de documento individual
     */
    private parseDocumentoXML;
    private extractTag;
    private cleanCDATA;
    private extractFechaFromId;
    /**
     * Guardar resultados en la base de datos local
     */
    syncWithDatabase(prisma: any, results: BOEResult[]): Promise<void>;
}
export declare const boeService: BOEService;
export {};
//# sourceMappingURL=boe.service.d.ts.map