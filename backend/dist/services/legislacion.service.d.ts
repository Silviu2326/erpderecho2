import { PaginationParams, PaginatedResult } from './base.types';
export interface QueryLegislacionParams extends PaginationParams {
    tipo?: string;
    search?: string;
    fuente?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}
export interface CreateFavoritoInput {
    legislacionId: string;
}
export interface CreateAlertaInput {
    palabrasClave: string;
    tipo?: string;
    activa?: boolean;
}
export interface UpdateAlertaInput {
    palabrasClave?: string;
    tipo?: string;
    activa?: boolean;
}
export interface QueryAlertaParams extends PaginationParams {
    activa?: boolean;
}
export interface BusquedaExternaParams {
    fuente: 'BOE' | 'CENDOJ' | 'TODAS';
    query: string;
    fechaDesde?: string;
    fechaHasta?: string;
    tipo?: string;
    limit?: number;
    sincronizar?: boolean;
}
declare class LegislacionService {
    findAll(params: QueryLegislacionParams): Promise<PaginatedResult<any>>;
    findById(id: string): Promise<any>;
    busquedaExterna(params: BusquedaExternaParams): Promise<{
        boe?: any[];
        cendoj?: {
            results: any[];
            total: number;
        };
        mensaje?: string;
    }>;
    searchBOE(query: string, sincronizar?: boolean): Promise<any[]>;
    searchCENDOJ(query: string, sincronizar?: boolean): Promise<any>;
    getBOEDocumento(id: string): Promise<any>;
    getCENDOJSentencia(id: string): Promise<any>;
    sincronizarFuentesExternas(dias?: number): Promise<{
        boe: number;
        cendoj: number;
        errores: string[];
    }>;
    getFavoritos(usuarioId: string, params: PaginationParams): Promise<PaginatedResult<any>>;
    addFavorito(usuarioId: string, input: CreateFavoritoInput): Promise<any>;
    removeFavorito(usuarioId: string, legislacionId: string): Promise<void>;
    getAlertas(usuarioId: string, params: QueryAlertaParams): Promise<PaginatedResult<any>>;
    createAlerta(usuarioId: string, input: CreateAlertaInput): Promise<any>;
    updateAlerta(id: string, usuarioId: string, input: UpdateAlertaInput): Promise<any>;
    deleteAlerta(id: string, usuarioId: string): Promise<void>;
    toggleAlerta(id: string, usuarioId: string): Promise<any>;
    verificarAlertas(usuarioId: string): Promise<{
        alertasVerificadas: number;
        nuevosResultados: any[];
    }>;
}
export declare const legislacionService: LegislacionService;
export {};
//# sourceMappingURL=legislacion.service.d.ts.map