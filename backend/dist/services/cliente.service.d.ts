import { PaginationParams, PaginatedResult } from './base.types';
export interface CreateClienteInput {
    nombre: string;
    cif: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    codigoPostal?: string;
    ciudad?: string;
    provincia?: string;
    pais?: string;
    observaciones?: string;
}
export interface UpdateClienteInput {
    nombre?: string;
    cif?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    codigoPostal?: string;
    ciudad?: string;
    provincia?: string;
    pais?: string;
    observaciones?: string;
}
export interface QueryClienteParams extends PaginationParams {
    search?: string;
}
declare class ClienteService {
    findAll(params: QueryClienteParams): Promise<PaginatedResult<any>>;
    findById(id: string): Promise<any>;
    getFacturas(clienteId: string, page?: number, limit?: number): Promise<PaginatedResult<any>>;
    createContacto(clienteId: string, input: any): Promise<any>;
}
export declare const clienteService: ClienteService;
export {};
//# sourceMappingURL=cliente.service.d.ts.map