export declare enum EstadoTurnoEnum {
    PENDIENTE = "PENDIENTE",
    ATENDIENDO = "ATENDIENDO",
    ATENDIDO = "ATENDIDO",
    CANCELADO = "CANCELADO"
}
export declare enum TipoTurnoEnum {
    CONSULTA = "CONSULTA",
    GESTION = "GESTION",
    URGENCIA = "URGENCIA"
}
export declare enum TipoGuardiaEnum {
    PRESENCIAL = "PRESENCIAL",
    TELEFONICA = "TELEFONICA",
    MIXTA = "MIXTA"
}
export declare enum EstadoLiquidacionEnum {
    PENDIENTE = "PENDIENTE",
    PAGADA = "PAGADA",
    ANULADA = "ANULADA"
}
export declare class CreateTurnoDto {
    fecha: string;
    tipo: TipoTurnoEnum;
    centro?: string;
    usuarioId?: string;
}
export declare class UpdateTurnoDto {
    fecha?: string;
    estado?: EstadoTurnoEnum;
    tipo?: TipoTurnoEnum;
    centro?: string;
    usuarioId?: string;
}
export declare class QueryTurnoDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    estado?: string;
    tipo?: string;
    usuarioId?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}
export declare class CreateGuardiaDto {
    fechaInicio: string;
    fechaFin: string;
    tipo: TipoGuardiaEnum;
    centro?: string;
    usuarioId?: string;
}
export declare class QueryGuardiaDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    tipo?: string;
    usuarioId?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}
export declare class CreateLiquidacionDto {
    importe: number;
    turnoId: string;
    estado?: EstadoLiquidacionEnum;
    fechaLiquidacion?: string;
}
export declare class UpdateLiquidacionDto {
    importe?: number;
    estado?: EstadoLiquidacionEnum;
    fechaLiquidacion?: string;
}
export declare class QueryLiquidacionDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    estado?: string;
    turnoId?: string;
}
//# sourceMappingURL=oficio.dto.d.ts.map