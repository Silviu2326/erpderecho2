import { PaginationParams, PaginatedResult } from './base.types';
import { TipoPrediccionEnum } from '../dtos/prediccion.dto';
export interface CreatePrediccionInput {
    expedienteId: string;
    tipoPrediccion: TipoPrediccionEnum;
}
export interface QueryPrediccionParams extends PaginationParams {
    tipo?: string;
    expediente_id?: string;
}
export interface QueryCasosSimilaresInput {
    expedienteId: string;
    limite?: number;
}
export interface QueryTendenciaInput {
    tipo?: string;
    meses?: number;
}
declare class PrediccionService {
    create(usuarioId: string, input: CreatePrediccionInput): Promise<any>;
    private getMockPrediction;
    createAnalisisCompleto(usuarioId: string, expedienteId: string): Promise<any>;
    analizarSentimientoLead(leadId: string): Promise<any>;
    findAll(params: QueryPrediccionParams): Promise<PaginatedResult<any>>;
    findById(id: string): Promise<any>;
    findByExpediente(expedienteId: string): Promise<any[]>;
    getCasosSimilares(input: QueryCasosSimilaresInput): Promise<any[]>;
    getTendencias(input: QueryTendenciaInput): Promise<any>;
    delete(id: string): Promise<void>;
    getEstadisticas(usuarioId: string): Promise<any>;
}
export declare const prediccionService: PrediccionService;
export {};
//# sourceMappingURL=prediccion.service.d.ts.map