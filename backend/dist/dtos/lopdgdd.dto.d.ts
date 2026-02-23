export declare class CreateConsentimientoDto {
    clienteId: string;
    tipo: string;
    granted: boolean;
    fechaConsentimiento: string;
}
export declare class QueryConsentimientoDto {
    clienteId?: string;
    tipo?: string;
    page?: number;
    limit?: number;
}
export declare class CreateDerechoARCOdto {
    clienteId: string;
    tipo: 'ACCESO' | 'RECTIFICACION' | 'SUPRESION' | 'OPOSICION' | 'PORTABILIDAD' | 'LIMITACION';
    fechaSolicitud: string;
}
export declare class ProcesarDerechoARCOdto {
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'RECHAZADO';
    fechaRespuesta?: string;
}
export declare class QueryDerechoARCOdto {
    clienteId?: string;
    tipo?: 'ACCESO' | 'RECTIFICACION' | 'SUPRESION' | 'OPOSICION' | 'PORTABILIDAD' | 'LIMITACION';
    estado?: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'RECHAZADO';
    page?: number;
    limit?: number;
}
export declare class CreateBrechaDto {
    descripcion: string;
    fechaDeteccion: string;
    fechaNotificacionAepd?: string;
    estado?: 'DETECTADA' | 'INVESTIGANDO' | 'CONTENIDA' | 'NOTIFICADA' | 'CERRADA';
    medidas?: string;
}
export declare class QueryBrechaDto {
    estado?: 'DETECTADA' | 'INVESTIGANDO' | 'CONTENIDA' | 'NOTIFICADA' | 'CERRADA';
    page?: number;
    limit?: number;
}
//# sourceMappingURL=lopdgdd.dto.d.ts.map