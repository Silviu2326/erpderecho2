export declare class CreateClienteDto {
    nombre: string;
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
export declare class UpdateClienteDto {
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
export declare class CreateContactoDto {
    nombre: string;
    email?: string;
    telefono?: string;
    cargo?: string;
}
export declare class QueryClienteDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
}
//# sourceMappingURL=cliente.dto.d.ts.map