import { PaginationParams, PaginatedResult } from './base.types';
export interface CreateOficioInput {
    nombre: string;
    tipo: string;
    contenido?: string;
    expedienteId?: string;
}
export interface UpdateOficioInput {
    nombre?: string;
    tipo?: string;
    contenido?: string;
}
export interface GenerateOficioInput {
    plantillaId: string;
    expedienteId: string;
    datos: Record<string, any>;
}
export interface QueryOficioParams extends PaginationParams {
    tipo?: string;
    search?: string;
    expediente_id?: string;
}
declare class OficioService {
    private plantillasBase;
    getPlantillas(tipo?: string): Promise<any[]>;
    getPlantillaById(id: string): Promise<any>;
    generateDocument(input: GenerateOficioInput): Promise<string>;
    findAllDocumentos(params: QueryOficioParams): Promise<PaginatedResult<any>>;
    findDocumentoById(id: string): Promise<any>;
    createDocumento(usuarioId: string, input: CreateOficioInput): Promise<any>;
    updateDocumento(id: string, input: UpdateOficioInput): Promise<any>;
    deleteDocumento(id: string): Promise<void>;
    getTiposDocumento(): Promise<string[]>;
    saveGeneratedDocument(usuarioId: string, expedienteId: string | null, nombre: string, tipo: string, contenido: string): Promise<any>;
}
export declare const oficioService: OficioService;
export {};
//# sourceMappingURL=oficio.service.d.ts.map