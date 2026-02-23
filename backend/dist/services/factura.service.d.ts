import { PaginationParams, PaginatedResult } from './base.types';
export interface CreateFacturaInput {
    numero: string;
    concepto?: string;
    importeBase?: number;
    importeIVA?: number;
    estado?: string;
    fechaEmision?: Date | string;
    fechaVencimiento?: Date | string | null;
    clienteId?: string;
    expedienteId?: string;
    lineas?: any[];
}
export interface UpdateFacturaInput {
    numero?: string;
    concepto?: string;
    importeBase?: number;
    importeIVA?: number;
    estado?: string;
    fechaEmision?: Date | string;
    fechaVencimiento?: Date | string | null;
    clienteId?: string;
    expedienteId?: string;
    lineas?: any[];
}
export interface QueryFacturaParams extends PaginationParams {
    search?: string;
    estado?: string;
    cliente_id?: string;
    expediente_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}
declare class FacturaService {
    findAll(params: QueryFacturaParams): Promise<PaginatedResult<any>>;
    findById(id: string): Promise<any>;
    create(input: CreateFacturaInput): Promise<any>;
    update(id: string, input: UpdateFacturaInput): Promise<any>;
    delete(id: string): Promise<any>;
    pagar(id: string): Promise<any>;
    findPendientes(): Promise<any[]>;
    findVencidas(): Promise<any[]>;
    getPdfUrl(id: string): Promise<any>;
    enviar(id: string, email?: string): Promise<any>;
}
export declare const facturaService: FacturaService;
export {};
//# sourceMappingURL=factura.service.d.ts.map