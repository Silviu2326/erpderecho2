export declare enum TipoPrediccionEnum {
    RESULTADO = "RESULTADO",
    DURACION = "DURACION",
    COSTES = "COSTES",
    EXITO = "EXITO",
    RIESGO_PRESCRIPCION = "RIESGO_PRESCRIPCION"
}
export declare class CreatePrediccionDto {
    expedienteId: string;
    tipoPrediccion: TipoPrediccionEnum;
}
export declare class QueryPrediccionDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    tipo?: string;
    expediente_id?: string;
}
export declare class QueryCasosSimilaresDto {
    expedienteId: string;
    limite?: number;
}
export declare class QueryTendenciaDto {
    tipo?: string;
    meses?: number;
}
//# sourceMappingURL=prediccion.dto.d.ts.map