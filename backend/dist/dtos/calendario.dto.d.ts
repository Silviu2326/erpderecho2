export declare enum TipoEventoEnum {
    AUDIENCIA = "AUDIENCIA",
    PLAZO = "PLAZO",
    TAREA = "TAREA",
    CITACION = "CITACION",
    NOTIFICACION = "NOTIFICACION",
    OTRO = "OTRO"
}
export declare class CreateEventoDto {
    titulo: string;
    descripcion?: string;
    fechaInicio: string;
    fechaFin?: string;
    tipo?: TipoEventoEnum;
    expedienteId?: string;
}
export declare class UpdateEventoDto {
    titulo?: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
    tipo?: TipoEventoEnum;
    expedienteId?: string;
}
export declare class QueryEventoDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    expediente_id?: string;
    tipo?: TipoEventoEnum;
    fecha_desde?: string;
    fecha_hasta?: string;
}
export declare class QueryCalendarioDto {
    mes?: number;
    anio?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
}
//# sourceMappingURL=calendario.dto.d.ts.map