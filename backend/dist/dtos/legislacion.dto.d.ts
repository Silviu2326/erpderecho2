export declare class QueryLegislacionDto {
    tipo?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
export declare class CreateFavoritoDto {
    legislacionId: string;
}
export declare class QueryFavoritoDto {
    page?: number;
    limit?: number;
}
export declare class CreateAlertaDto {
    palabrasClave: string;
    tipo?: string;
    activa?: boolean;
}
export declare class UpdateAlertaDto {
    palabrasClave?: string;
    tipo?: string;
    activa?: boolean;
}
export declare class QueryAlertaDto {
    activa?: boolean;
    page?: number;
    limit?: number;
}
//# sourceMappingURL=legislacion.dto.d.ts.map