// Tipos para el módulo de documentos

export type TipoDocumento = 'PDF' | 'IMAGEN' | 'WORD' | 'EXCEL' | 'OTRO';

export interface Documento {
  id: string;
  nombre: string;
  tipo: TipoDocumento;
  tamano: number;
  mimeType?: string;
  ruta: string;
  thumbnailUrl?: string;
  contenidoExtraido?: string;
  metadata?: DocumentoMetadata;
  expedienteId?: string;
  expediente?: {
    id: string;
    numeroExpediente: string;
  };
  usuario?: {
    id: string;
    nombre: string;
    apellido1?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentoMetadata {
  ocr?: {
    confidence: number;
    pages: number;
    language: string;
    entities: {
      dates: string[];
      amounts: string[];
      people: string[];
      organizations: string[];
      addresses: string[];
      phoneNumbers: string[];
      emails: string[];
      dniNie: string[];
      caseNumbers: string[];
    };
  };
  analysis?: {
    documentType: string;
    summary: string;
    keyPoints: string[];
    suggestedTags: string[];
  };
}

export interface CreateDocumentoData {
  nombre?: string;
  expedienteId?: string;
  processOcr?: boolean;
}

export interface UpdateDocumentoData {
  nombre?: string;
  expedienteId?: string;
}

export interface QueryDocumentosParams {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: TipoDocumento;
  expediente_id?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  documento?: Documento;
  error?: string;
}
