import { PaginationParams, PaginatedResult } from './base.types';
export interface CreateDocumentoInput {
    nombre: string;
    tipo?: string;
    tamano?: number;
    ruta: string;
    mimeType?: string;
    expedienteId?: string;
}
export interface UpdateDocumentoInput {
    nombre?: string;
    tipo?: string;
    tamano?: number;
    ruta?: string;
    mimeType?: string;
    expedienteId?: string;
}
export interface QueryDocumentoParams extends PaginationParams {
    search?: string;
    expediente_id?: string;
    tipo?: string;
}
declare class DocumentoService {
    findAll(params: QueryDocumentoParams): Promise<PaginatedResult<any>>;
    findById(id: string): Promise<any>;
    create(input: CreateDocumentoInput, usuarioId: string): Promise<any>;
    update(id: string, input: UpdateDocumentoInput): Promise<any>;
    delete(id: string): Promise<void>;
    download(id: string): Promise<{
        filePath: string;
        fileName: string;
    }>;
    processOcr(id: string): Promise<any>;
    batchOcr(documentoIds: string[]): Promise<{
        results: any[];
        failed: string[];
    }>;
    searchByContent(query: string, params?: PaginationParams): Promise<PaginatedResult<any>>;
}
export declare const documentoService: DocumentoService;
export {};
//# sourceMappingURL=documento.service.d.ts.map