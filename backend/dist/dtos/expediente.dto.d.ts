export declare enum TipoExpedienteEnum {
    CIVIL = "CIVIL",
    PENAL = "PENAL",
    LABORAL = "LABORAL",
    CONTENCIOSO = "CONTENCIOSO",
    MERCANTIL = "MERCANTIL",
    FAMILIA = "FAMILIA",
    ADMINISTRATIVO = "ADMINISTRATIVO"
}
export declare enum EstadoExpedienteEnum {
    ACTIVO = "ACTIVO",
    CERRADO = "CERRADO",
    ARCHIVADO = "ARCHIVADO",
    SUSPENDIDO = "SUSPENDIDO"
}
export declare class CreateExpedienteDto {
    numeroExpediente: string;
    tipo: TipoExpedienteEnum;
    estado?: EstadoExpedienteEnum;
    descripcion?: string;
    clienteId?: string;
    abogadoId?: string;
}
export declare class UpdateExpedienteDto {
    numeroExpediente?: string;
    tipo?: TipoExpedienteEnum;
    estado?: EstadoExpedienteEnum;
    descripcion?: string;
    clienteId?: string;
    abogadoId?: string;
}
export declare class QueryExpedienteDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    estado?: string;
    tipo?: string;
    abogado_id?: string;
    cliente_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}
export declare class CreateActuacionDto {
    tipo: string;
    descripcion?: string;
    fecha: string;
    documento?: string;
}
export declare class QueryActuacionDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
//# sourceMappingURL=expediente.dto.d.ts.map