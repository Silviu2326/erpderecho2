export declare class CreateDocumentoDto {
    nombre: string;
    tipo?: string;
    tamaño?: number;
    ruta: string;
    mimeType?: string;
    expedienteId?: string;
}
export declare class UpdateDocumentoDto {
    nombre?: string;
    tipo?: string;
    tamaño?: number;
    ruta?: string;
    mimeType?: string;
    expedienteId?: string;
}
export declare class QueryDocumentoDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    expediente_id?: string;
    tipo?: string;
}
export declare class QueryOcrDto {
    documentoId: string;
}
//# sourceMappingURL=documento.dto.d.ts.map