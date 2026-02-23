import { PaginationParams, PaginatedResult } from './base.types';
export interface CreateExpedienteInput {
    numeroExpediente: string;
    tipo: string;
    estado?: string;
    descripcion?: string;
    clienteId: string;
    abogadoId?: string;
}
export interface UpdateExpedienteInput {
    numeroExpediente?: string;
    tipo?: string;
    estado?: string;
    descripcion?: string;
    clienteId?: string;
    abogadoId?: string;
}
export interface QueryExpedienteParams extends PaginationParams {
    search?: string;
    estado?: string;
    tipo?: string;
    abogado_id?: string;
    cliente_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}
export interface CreateActuacionInput {
    tipo: string;
    descripcion?: string;
    fecha: Date | string;
    documento?: string;
}
declare class ExpedienteService {
    findAll(params: QueryExpedienteParams): Promise<PaginatedResult<any>>;
    findById(id: string): Promise<any>;
    create(input: CreateExpedienteInput): Promise<any>;
    update(id: string, input: UpdateExpedienteInput): Promise<any>;
    delete(id: string): Promise<void>;
    search(query: string): Promise<any[]>;
    getCalendario(mes: number, anio: number): Promise<any[]>;
    getActuaciones(expedienteId: string, params: any): Promise<PaginatedResult<any>>;
    createActuacion(expedienteId: string, usuarioId: string, input: CreateActuacionInput): Promise<any>;
    getDocumentos(expedienteId: string): Promise<any[]>;
}
export declare const expedienteService: ExpedienteService;
export {};
//# sourceMappingURL=expediente.service.d.ts.map