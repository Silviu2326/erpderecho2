import { PaginationParams, PaginatedResult } from './base.types';
export interface CreateConsentimientoInput {
    tipo: string;
    granted: boolean;
    fechaConsentimiento: Date | string;
    clienteId: string;
}
export interface UpdateConsentimientoInput {
    tipo?: string;
    granted?: boolean;
    fechaConsentimiento?: Date | string;
}
export interface CreateDerechoARCOInput {
    tipo: string;
    estado?: string;
    fechaSolicitud: Date | string;
    clienteId: string;
}
export interface UpdateDerechoARCOInput {
    tipo?: string;
    estado?: string;
    fechaSolicitud?: Date | string;
    fechaRespuesta?: Date | string;
}
export interface CreateBrechaInput {
    descripcion: string;
    fechaDeteccion: Date | string;
    estado?: string;
    medidas?: string;
}
export interface UpdateBrechaInput {
    descripcion?: string;
    fechaDeteccion?: Date | string;
    fechaNotificacionAepd?: Date | string;
    estado?: string;
    medidas?: string;
}
export interface QueryConsentimientoParams extends PaginationParams {
    cliente_id?: string;
    tipo?: string;
    granted?: boolean;
}
export interface QueryDerechoARCOParams extends PaginationParams {
    cliente_id?: string;
    tipo?: string;
    estado?: string;
}
export interface QueryBrechaParams extends PaginationParams {
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}
declare class LopdgddService {
    findAllConsentimientos(params: QueryConsentimientoParams): Promise<PaginatedResult<any>>;
    findConsentimientoById(id: string): Promise<any>;
    createConsentimiento(input: CreateConsentimientoInput): Promise<any>;
    updateConsentimiento(id: string, input: UpdateConsentimientoInput): Promise<any>;
    deleteConsentimiento(id: string): Promise<void>;
    getConsentimientosCliente(clienteId: string): Promise<any[]>;
    findAllDerechosARCO(params: QueryDerechoARCOParams): Promise<PaginatedResult<any>>;
    findDerechoARCOById(id: string): Promise<any>;
    createDerechoARCO(input: CreateDerechoARCOInput): Promise<any>;
    updateDerechoARCO(id: string, input: UpdateDerechoARCOInput): Promise<any>;
    deleteDerechoARCO(id: string): Promise<void>;
    getDerechosPendientes(): Promise<any[]>;
    findAllBrechas(params: QueryBrechaParams): Promise<PaginatedResult<any>>;
    findBrechaById(id: string): Promise<any>;
    createBrecha(input: CreateBrechaInput): Promise<any>;
    updateBrecha(id: string, input: UpdateBrechaInput): Promise<any>;
    deleteBrecha(id: string): Promise<void>;
    getBrechasActivas(): Promise<any[]>;
    getEstadisticasLopdgdd(): Promise<any>;
}
export declare const lopdgddService: LopdgddService;
export {};
//# sourceMappingURL=lopdgdd.service.d.ts.map