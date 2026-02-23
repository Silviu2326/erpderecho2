export declare class CreateLeadDto {
    nombre: string;
    email?: string;
    telefono?: string;
    empresa?: string;
    origen?: string;
    estado?: string;
    probabilidad?: number;
    expectedRevenue?: number;
    clienteId?: string;
}
export declare class UpdateLeadDto {
    nombre?: string;
    email?: string;
    telefono?: string;
    empresa?: string;
    origen?: string;
    estado?: string;
    probabilidad?: number;
    expectedRevenue?: number;
    clienteId?: string;
}
export declare class ConvertirLeadDto {
    clienteId: string;
    titulo: string;
    importe?: number;
    probabilidad?: number;
    etapa?: string;
    usuarioId?: string;
}
export declare class QueryLeadDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    estado?: string;
}
export declare class CreateOportunidadDto {
    titulo: string;
    leadId?: string;
    estado?: string;
    probabilidad?: number;
    importe?: number;
    etapa?: string;
    usuarioId?: string;
}
export declare class UpdateOportunidadDto {
    titulo?: string;
    leadId?: string;
    estado?: string;
    probabilidad?: number;
    importe?: number;
    etapa?: string;
    usuarioId?: string;
}
export declare class QueryOportunidadDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    estado?: string;
    etapa?: string;
    usuarioId?: string;
}
export declare class QueryPipelineDto {
    usuarioId?: string;
}
export declare class CreateActividadDto {
    oportunidadId?: string;
    tipo: string;
    descripcion?: string;
    fecha: string;
    completada?: boolean;
    usuarioId?: string;
}
export declare class UpdateActividadDto {
    oportunidadId?: string;
    tipo?: string;
    descripcion?: string;
    fecha?: string;
    completada?: boolean;
    usuarioId?: string;
}
export declare class QueryActividadDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    oportunidadId?: string;
    usuarioId?: string;
    completada?: boolean;
}
export declare class CreateNotaDto {
    contenido: string;
    clienteId?: string;
    oportunidadId?: string;
    usuarioId?: string;
}
export declare class UpdateNotaDto {
    contenido?: string;
}
export declare class QueryNotaDto {
    page?: number;
    limit?: number;
    clienteId?: string;
    oportunidadId?: string;
    usuarioId?: string;
}
export declare class CreateContactoDto {
    nombre: string;
    email?: string;
    telefono?: string;
    cargo?: string;
    clienteId: string;
}
export declare class QueryContactoDto {
    page?: number;
    limit?: number;
    search?: string;
}
//# sourceMappingURL=crm.dto.d.ts.map